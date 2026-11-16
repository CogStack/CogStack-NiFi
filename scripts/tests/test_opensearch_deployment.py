#!/usr/bin/env python3
"""Check OpenSearch Compose configuration and real certificate generation."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path
from typing import ClassVar

from check_opensearch_settings import setting_errors

ROOT = Path(__file__).resolve().parents[2]


def reference_environment() -> dict[str, str]:
    return {key: value for key, value in os.environ.items() if not key.startswith("COGSTACK_")}


@unittest.skipUnless(shutil.which("docker"), "Docker Compose is required")
class OpenSearchDeploymentTest(unittest.TestCase):
    compose: ClassVar[dict]

    @classmethod
    def setUpClass(cls) -> None:
        result = subprocess.run(
            ["bash", "-c", 'source "$1" >/dev/null && docker compose --profile "*" -f "$2" config --format json',
             "read-compose", str(ROOT / "deploy/export_env_vars.sh"), str(ROOT / "deploy/services.yml")],
            env=reference_environment(), text=True, capture_output=True, check=True, timeout=30,
        )
        cls.compose = json.loads(result.stdout)["services"]

    def test_shared_security_settings_are_valid_and_consistent_across_nodes(self) -> None:
        search_env = self.compose["elasticsearch-1"]["environment"]
        self.assertEqual(search_env["ELASTIC_USER"], "admin")
        self.assertEqual(setting_errors(search_env), [])
        for name in ("elasticsearch-2", "elasticsearch-3"):
            for key in ("OPENSEARCH_INITIAL_ADMIN_PASSWORD", "OPENSEARCH_COMPLIANCE_SALT",
                        "OPENSEARCH_DATASOURCE_MASTER_KEY"):
                self.assertTrue(self.compose[name]["environment"][key] == search_env[key],
                                f"Shared setting differs on {name}: {key}")

    def test_dashboards_verifies_tls_and_uses_service_credentials(self) -> None:
        config = (ROOT / "services/kibana/config/opensearch.yml").read_text()
        self.assertIn("opensearch.ssl.verificationMode: full", config)
        self.assertIn("opensearch.username: ${KIBANA_USER}\n", config)
        self.assertIn("opensearch.password: ${KIBANA_PASSWORD}\n", config)
        self.assertNotIn("opensearch.ssl.certificate:", config)
        self.assertNotIn("opensearch.ssl.key:", config)
        mounts = self.compose["kibana"]["volumes"]
        self.assertFalse(any(Path(mount.get("source", "")).name.startswith("admin.") for mount in mounts))

    def test_selected_profile_credentials_reach_compose(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            profile = Path(directory)
            (profile / "security").mkdir()
            contents = (ROOT / "security/env/users_elasticsearch.env").read_text()
            contents = re.sub(
                r"^KIBANA_PASSWORD=.*$", "KIBANA_PASSWORD=fixture-selected-password", contents, flags=re.M,
            )
            (profile / "security/users_elasticsearch.env").write_text(contents)
            environment = {**reference_environment(), "COGSTACK_CONFIG_DIR": str(profile)}
            result = subprocess.run(
                ["bash", "-c", 'source "$1" >/dev/null && docker compose --profile "*" -f "$2" config --format json',
                 "read-compose", str(ROOT / "deploy/export_env_vars.sh"), str(ROOT / "deploy/services.yml")],
                env=environment, text=True, capture_output=True, check=True, timeout=30,
            )
            password = json.loads(result.stdout)["services"]["kibana"]["environment"]["KIBANA_PASSWORD"]
            self.assertEqual(password, "fixture-selected-password")

    def test_shared_settings_reject_invalid_lengths_and_version_mismatches(self) -> None:
        values = self.compose["elasticsearch-1"]["environment"]
        for change in (
            {"OPENSEARCH_COMPLIANCE_SALT": ""}, {"OPENSEARCH_COMPLIANCE_SALT": "x" * 15},
            {"OPENSEARCH_DATASOURCE_MASTER_KEY": "x" * 20}, {"KIBANA_PASSWORD": ""},
            {"ELASTICSEARCH_KIBANA_DOCKER_IMAGE": "opensearchproject/opensearch-dashboards:3.5.0"},
        ):
            with self.subTest(keys=list(change)):
                self.assertTrue(setting_errors({**values, **change}))


@unittest.skipUnless(shutil.which("openssl") and shutil.which("keytool"), "OpenSSL and Java keytool are required")
class OpenSearchCertificateTest(unittest.TestCase):
    temp: ClassVar[tempfile.TemporaryDirectory[str]]
    workspace: ClassVar[Path]
    env: ClassVar[dict[str, str]]
    certificates: ClassVar[Path]

    @classmethod
    def setUpClass(cls) -> None:
        cls.temp = tempfile.TemporaryDirectory(prefix="cogstack-tls-")
        cls.addClassCleanup(cls.temp.cleanup)
        cls.workspace = Path(cls.temp.name)
        cls.env = reference_environment()
        for relative in ("security/scripts", "security/env", "security/templates", "deploy"):
            (cls.workspace / relative).mkdir(parents=True)
        for source in (ROOT / "security/scripts").glob("*.sh"):
            shutil.copy2(source, cls.workspace / "security/scripts" / source.name)
        for name in ("certificates_general.env", "certificates_elasticsearch.env", "users_elasticsearch.env"):
            source = ROOT / "security/env" / name
            text = source.read_text().replace("ROOT_CERTIFICATE_KEY_SIZE=4096", "ROOT_CERTIFICATE_KEY_SIZE=2048")
            text = text.replace("ES_KEY_SIZE=4096", "ES_KEY_SIZE=2048")
            (cls.workspace / "security/env" / name).write_text(text)
        shutil.copy2(ROOT / "security/templates/ssl-extensions-x509.cnf", cls.workspace / "security/templates")
        shutil.copy2(ROOT / "deploy/config_files.sh", cls.workspace / "deploy")
        for script, args in (
            ("create_root_ca_cert.sh", []),
            ("create_opensearch_node_cert.sh", ["elasticsearch-1", "elasticsearch-2", "elasticsearch-3"]),
            ("create_opensearch_client_admin_certs.sh", []),
        ):
            cls.command("bash", script, *args, cwd=cls.workspace / "security/scripts")
        cls.certificates = cls.workspace / "security/certificates/elastic/opensearch"

    @classmethod
    def command(cls, *args: str, cwd: Path | None = None) -> str:
        result = subprocess.run(
            list(args), cwd=cwd, env=cls.env, text=True, capture_output=True, timeout=90,
        )
        if result.returncode:
            raise RuntimeError(f"Certificate command failed: {args[0]}\n{result.stderr}")
        return result.stdout

    def test_node_certificates_verify_for_compose_service_names(self) -> None:
        ca = self.certificates / "elastic-stack-ca.crt.pem"
        for ordinal in (1, 2, 3):
            name = f"elasticsearch-{ordinal}"
            cert = self.certificates / "elasticsearch" / name / f"{name}.crt"
            for hostname in (name, "localhost"):
                with self.subTest(node=name, hostname=hostname):
                    self.command(
                        "openssl", "verify", "-CAfile", str(ca), "-purpose", "sslserver",
                        "-verify_hostname", hostname, str(cert),
                    )
            self.command("openssl", "verify", "-CAfile", str(ca), "-verify_ip", "127.0.0.1", str(cert))
            key = cert.with_suffix(".key")
            self.command("openssl", "pkey", "-in", str(key), "-check", "-noout")

    def test_shared_ca_signing_keys_are_not_copied_into_the_opensearch_tree(self) -> None:
        self.assertTrue((self.certificates / "elastic-stack-ca.crt.pem").is_file())
        self.assertFalse((self.certificates / "elastic-stack-ca.key.pem").exists())
        self.assertFalse((self.certificates / "elastic-stack-ca.p12").exists())
        root_ca = self.workspace / "security/certificates/root/root-ca"
        self.assertTrue(root_ca.with_suffix(".key").is_file())
        self.assertTrue(root_ca.with_suffix(".p12").is_file())

    def test_dashboards_certificate_verifies_for_compose_service_names(self) -> None:
        cert = self.certificates / "es_kibana_client.pem"
        ca = self.certificates / "elastic-stack-ca.crt.pem"
        for hostname in ("localhost", "kibana"):
            with self.subTest(hostname=hostname):
                self.command(
                    "openssl", "verify", "-CAfile", str(ca), "-purpose", "sslserver",
                    "-verify_hostname", hostname, str(cert),
                )


if __name__ == "__main__":
    unittest.main()
