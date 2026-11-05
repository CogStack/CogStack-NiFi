#!/usr/bin/env python3
"""Check database credential isolation, host publishing, and default TLS."""

import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


def render(*files, extra_env=None):
    command = 'source "$1" >/dev/null && shift && docker compose "$@" config --format json'
    args = ["bash", "-c", command, "database-security", str(ROOT / "deploy/export_env_vars.sh")]
    for file in files:
        args.extend(["-f", str(ROOT / "deploy" / file)])
    result = subprocess.run(
        args, cwd=ROOT, env={**os.environ, **(extra_env or {})},
        capture_output=True, text=True, timeout=30, check=True,
    )
    return json.loads(result.stdout)


class DatabaseDeploymentSecurityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.config = render("services.yml")

    def test_database_containers_receive_only_their_own_credentials(self):
        services = self.config["services"]
        for name in ("samples-db", "cogstack-databank-db"):
            env = services[name]["environment"]
            self.assertIn("POSTGRES_PASSWORD", env)
            self.assertIn("COGSTACK_INGEST_PASSWORD", env)
            self.assertNotIn("MSSQL_SA_PASSWORD", env)
            self.assertNotIn("CLICKHOUSE_PASSWORD", env)
            self.assertNotIn("DATABASE_PASSWORD", env)
        self.assertNotIn("POSTGRES_PASSWORD", services["cogstack-databank-db-mssql"]["environment"])
        self.assertNotIn("COGSTACK_INGEST_PASSWORD", services["cogstack-databank-db-mssql"]["environment"])
        env = services["cogstack-databank-db-mssql-init"]["environment"]
        self.assertIn("MSSQL_SA_PASSWORD", env)
        self.assertIn("COGSTACK_INGEST_PASSWORD", env)
        self.assertNotIn("POSTGRES_PASSWORD", env)

    def test_nifi_has_ingestion_credentials_without_database_admin_files(self):
        forbidden = {"DATABASE_USER", "DATABASE_PASSWORD", "POSTGRES_USER_SAMPLES",
                     "POSTGRES_PASSWORD_SAMPLES", "MSSQL_SA_USER", "MSSQL_SA_PASSWORD", "CLICKHOUSE_PASSWORD"}
        for file in ("services.yml", "services.dev.yml"):
            services = render(file)["services"]
            nifi = services["nifi"]
            self.assertTrue(forbidden.isdisjoint(nifi["environment"]))
            self.assertIn("POSTGRES_INGEST_PASSWORD_SAMPLES", nifi["environment"])
            self.assertIn("DATABASE_INGEST_PASSWORD", nifi["environment"])
            self.assertIn("MSSQL_INGEST_PASSWORD", nifi["environment"])
            self.assertNotIn("/security", [v["target"] for v in nifi["volumes"]])
            self.assertTrue(forbidden.isdisjoint(services["nifi-nginx"]["environment"]))
            url = nifi["environment"]["POSTGRES_SAMPLES_JDBC_URL"]
            self.assertIn("sslmode=verify-full", url)
            self.assertIn("sslrootcert=/run/database-cas/samples-ca.crt", url)
            for name in ("samples", "databank"):
                mount = next(v for v in nifi["volumes"] if v["target"] == f"/run/database-cas/{name}-ca.crt")
                self.assertEqual(Path(mount["source"]).name, "ca.crt")
                self.assertTrue(mount["read_only"])
                self.assertFalse(mount["bind"]["create_host_path"])
            # Neither the database keys nor the root signing key belong in client containers.
            for service_name in ("nifi", "nifi-nginx", "kibana"):
                if service_name not in services:
                    continue
                for mount in services[service_name]["volumes"]:
                    if mount["type"] != "bind":
                        continue
                    source = Path(mount["source"]).resolve()
                    for private_key in ("root/root-ca.key", "root/root-ca.p12", "root/root-ca-keystore.jks",
                                        "elastic/opensearch/elastic-stack-ca.key.pem", "elastic/opensearch/elastic-stack-ca.p12",
                                        "elastic/elasticsearch/elastic-stack-ca.key.pem", "elastic/elasticsearch/elastic-stack-ca.p12",
                                        "postgresql/samples/server.key", "postgresql/databank/server.key"):
                        self.assertFalse((ROOT / "security/certificates" / private_key).is_relative_to(source),
                                         f"{service_name} exposes {private_key}")

    def test_database_ports_are_published_on_loopback(self):
        for name in ("samples-db", "cogstack-databank-db", "cogstack-databank-db-mssql"):
            with self.subTest(service=name):
                for port in self.config["services"][name]["ports"]:
                    self.assertEqual(port["host_ip"], "127.0.0.1")

    def test_database_bootstrap_mounts_remain_read_only(self):
        services = self.config["services"]
        for name in ("samples-db", "cogstack-databank-db", "cogstack-databank-db-mssql-init"):
            target = "/bootstrap" if name.endswith("-init") else "/docker-entrypoint-initdb.d"
            mount = next(v for v in services[name]["volumes"] if v["target"] == target)
            self.assertTrue(mount["read_only"])

    def test_default_postgres_requires_tls_and_stages_keys_with_private_permissions(self):
        for name in ("samples-db", "cogstack-databank-db"):
            service = self.config["services"][name]
            self.assertEqual(service["environment"]["PGSSLMODE"], "verify-full")
            self.assertEqual(service["environment"]["PGSSLROOTCERT"], "/run/postgresql/tls/ca.crt")
            self.assertIn("ssl=on", service["command"])
            self.assertIn("ssl_min_protocol_version=TLSv1.2", service["command"])
            self.assertIn("ssl_key_file=/run/postgresql/tls/server.key", service["command"])
            self.assertIn("hba_file=/docker-entrypoint-initdb.d/access/pg_hba_tls.conf", service["command"])
            script = service["entrypoint"][2]
            self.assertIn("install -m 600 -o postgres -g postgres /run/database-tls/server.key", script)
            self.assertIn('exec /usr/local/bin/docker-entrypoint.sh "$$@"', script)
            mount = next(v for v in service["volumes"] if v["target"] == "/run/database-tls")
            self.assertTrue(mount["read_only"])
            self.assertFalse(mount["bind"]["create_host_path"])
        for service_path in ("pgsamples", "cogstack-db/pgsql"):
            hba = (ROOT / "services" / service_path / "access/pg_hba_tls.conf").read_text()
            self.assertIn("hostnossl all all all reject", hba)
            self.assertIn("hostssl all all all scram-sha-256", hba)

    def test_certificate_directories_are_configurable_for_servers_and_clients(self):
        with tempfile.TemporaryDirectory(prefix="cogstack tls model ") as temp:
            c = render("services.yml", extra_env={
                "POSTGRES_SAMPLES_TLS_DIR": temp, "POSTGRES_DATABANK_TLS_DIR": temp,
            })
        for name in ("samples-db", "cogstack-databank-db"):
            service = c["services"][name]
            mount = next(v for v in service["volumes"] if v["target"] == "/run/database-tls")
            self.assertEqual(mount["source"], temp)
        for name in ("samples", "databank"):
            mount = next(v for v in c["services"]["nifi"]["volumes"] if v["target"] == f"/run/database-cas/{name}-ca.crt")
            self.assertEqual(mount["source"], str(Path(temp) / "ca.crt"))

    def test_older_database_profiles_get_tls_defaults(self):
        with tempfile.TemporaryDirectory(prefix="cogstack old profile ") as temp:
            settings = (ROOT / "deploy/database.env").read_text().splitlines()
            omitted = ("POSTGRES_SAMPLES_TLS_DIR=", "POSTGRES_DATABANK_TLS_DIR=", "POSTGRES_SAMPLES_JDBC_URL=")
            settings = [line for line in settings if not line.startswith(omitted)]
            settings = [line.replace("POSTGRES_SAMPLES_DB_NAME=db_samples", "POSTGRES_SAMPLES_DB_NAME=profile_samples") for line in settings]
            (Path(temp) / "database.env").write_text("\n".join(settings) + "\n")
            c = render("services.yml", extra_env={"COGSTACK_CONFIG_DIR": temp})
        url = c["services"]["nifi"]["environment"]["POSTGRES_SAMPLES_JDBC_URL"]
        self.assertIn("/profile_samples?sslmode=verify-full", url)
        for name, directory in (("samples-db", "samples"), ("cogstack-databank-db", "databank")):
            mount = next(v for v in c["services"][name]["volumes"] if v["target"] == "/run/database-tls")
            self.assertEqual(mount["source"], str(ROOT / "security/certificates/postgresql" / directory))

    def test_reference_flows_use_ingestion_environment_references(self):
        for name in ("opensearch_ingest_docs_db_to_es.json", "opensearch_ingest_docs_db_ocr_service_to_es.json"):
            d = json.loads((ROOT / "nifi/user_templates" / name).read_text())
            pool = next(v for v in d["flowContents"]["controllerServices"] if v["name"] == "DBCPConnectionPool")
            self.assertEqual(pool["properties"]["Database User"], "${POSTGRES_INGEST_USER_SAMPLES}")
            self.assertEqual(pool["properties"]["Password"], "${POSTGRES_INGEST_PASSWORD_SAMPLES}")
            self.assertEqual(pool["properties"]["Database Connection URL"], "${POSTGRES_SAMPLES_JDBC_URL}")


if __name__ == "__main__":
    unittest.main()
