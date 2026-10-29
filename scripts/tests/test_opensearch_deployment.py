#!/usr/bin/env python3
"""Check Compose/Helm parity and real certificate generation without a cluster."""

from __future__ import annotations

import importlib.util
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


def yaml_documents(text: str) -> list[dict]:
    import yaml

    return [document for document in yaml.safe_load_all(text) if isinstance(document, dict)]


def reference_environment() -> dict[str, str]:
    return {key: value for key, value in os.environ.items() if not key.startswith("COGSTACK_")}


@unittest.skipUnless(
    shutil.which("helm") and shutil.which("docker") and importlib.util.find_spec("yaml"),
    "Helm, Docker Compose, and PyYAML are required",
)
class OpenSearchDeploymentTest(unittest.TestCase):
    compose: ClassVar[dict]
    documents: ClassVar[list[dict]]

    @classmethod
    def setUpClass(cls) -> None:
        result = subprocess.run(
            ["bash", "-c", 'source "$1" >/dev/null && docker compose --profile "*" -f "$2" config --format json',
             "read-compose", str(ROOT / "deploy/export_env_vars.sh"), str(ROOT / "deploy/services.yml")],
            env=reference_environment(), text=True, capture_output=True, check=True, timeout=30,
        )
        cls.compose = json.loads(result.stdout)["services"]
        result = cls.render()
        if result.returncode:
            raise RuntimeError(result.stderr)
        cls.documents = yaml_documents(result.stdout)

    @staticmethod
    def render(*args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["helm", "template", "cogstack-opensearch", str(ROOT / "deploy/charts/opensearch"),
             "-f", str(ROOT / "deploy/helm/opensearch.values.yaml"), "--namespace", "cogstack", *args],
            env=reference_environment(), text=True, capture_output=True, timeout=30,
        )

    def resource(self, kind: str) -> dict:
        return next(document for document in self.documents if document["kind"] == kind)

    def test_default_versions_and_digests_match_compose(self) -> None:
        stateful = self.resource("StatefulSet")["spec"]["template"]["spec"]
        dashboards = self.resource("Deployment")["spec"]["template"]["spec"]
        search_image = self.compose["elasticsearch-1"]["image"]
        helm_search_image = stateful["containers"][0]["image"]
        self.assertTrue(all(container["image"] == helm_search_image for container in stateful["initContainers"]))
        metadata = yaml_documents((ROOT / "deploy/charts/opensearch/Chart.yaml").read_text())[0]
        values = yaml_documents((ROOT / "deploy/charts/opensearch/values.yaml").read_text())[0]
        for component, helm_image, compose_image in (
            ("opensearch", helm_search_image, search_image),
            ("dashboards", dashboards["containers"][0]["image"], self.compose["kibana"]["image"]),
        ):
            image = values[component]["image"]
            self.assertEqual(image["tag"], metadata["appVersion"])
            self.assertEqual(compose_image, f"{image['repository']}:{image['tag']}@{image['digest']}")
            self.assertEqual(helm_image, f"{image['repository']}@{image['digest']}")

    def test_generated_secret_matches_compose_and_all_references_resolve(self) -> None:
        secret = self.resource("Secret")
        data = secret["stringData"]
        search_env = self.compose["elasticsearch-1"]["environment"]
        dashboards_env = self.compose["kibana"]["environment"]
        for key in ("OPENSEARCH_INITIAL_ADMIN_PASSWORD", "OPENSEARCH_COMPLIANCE_SALT",
                    "OPENSEARCH_DATASOURCE_MASTER_KEY"):
            self.assertTrue(data[key] == search_env[key], f"Shared setting differs: {key}")
        for key in ("KIBANA_USER", "KIBANA_PASSWORD"):
            self.assertTrue(data[key] == dashboards_env[key], f"Shared setting differs: {key}")
        self.assertEqual(search_env["ELASTIC_USER"], "admin")
        self.assertEqual(setting_errors(search_env), [])
        for kind in ("StatefulSet", "Deployment"):
            for container in self.resource(kind)["spec"]["template"]["spec"]["containers"]:
                for entry in container.get("env", []):
                    ref = entry.get("valueFrom", {}).get("secretKeyRef")
                    if ref:
                        self.assertEqual(ref["name"], secret["metadata"]["name"])
                        self.assertIn(ref["key"], data)

    def test_shared_security_and_runtime_configs_are_bundled_unchanged(self) -> None:
        maps = [document["data"] for document in self.documents if document["kind"] == "ConfigMap"]
        expected = {
            "opensearch.yml": ROOT / "services/elasticsearch/config/opensearch.yml",
            "opensearch_dashboards.yml": ROOT / "services/kibana/config/opensearch.yml",
            "internal_users.yml": ROOT / "security/es_roles/opensearch/internal_users.yml",
            "search-entrypoint.sh": ROOT / "services/elasticsearch/search-entrypoint.sh",
        }
        for key, path in expected.items():
            actual = next(data[key] for data in maps if key in data)
            self.assertEqual(actual.strip(), path.read_text().strip(), key)
        dashboards_config = next(
            data["opensearch_dashboards.yml"] for data in maps if "opensearch_dashboards.yml" in data
        )
        self.assertIn("opensearch.ssl.verificationMode: full", dashboards_config)
        self.assertIn("opensearch.username: ${KIBANA_USER}\n", dashboards_config)
        self.assertIn("opensearch.password: ${KIBANA_PASSWORD}\n", dashboards_config)
        self.assertNotIn("opensearch.ssl.certificate:", dashboards_config)
        self.assertNotIn("opensearch.ssl.key:", dashboards_config)
        mounts = self.resource("Deployment")["spec"]["template"]["spec"]["containers"][0]["volumeMounts"]
        self.assertFalse(any("admin." in mount.get("subPath", "") for mount in mounts))

    def test_external_credentials_secret_mode(self) -> None:
        result = self.render("--set", "credentials.create=false", "--set", "credentials.existingSecret=external-creds")
        self.assertEqual(result.returncode, 0, result.stderr)
        documents = yaml_documents(result.stdout)
        self.assertFalse(any(document["kind"] == "Secret" for document in documents))
        for document in documents:
            if document["kind"] in ("StatefulSet", "Deployment"):
                for container in document["spec"]["template"]["spec"]["containers"]:
                    for entry in container.get("env", []):
                        ref = entry.get("valueFrom", {}).get("secretKeyRef")
                        if ref:
                            self.assertEqual(ref["name"], "external-creds")

    def test_selected_profile_credentials_reach_helm_and_compose(self) -> None:
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
                ["make", "-s", "-C", str(ROOT / "deploy"), "helm-template-opensearch"],
                env=environment, text=True, capture_output=True, timeout=30,
            )
            self.assertEqual(result.returncode, 0, result.stderr)
            secret = next(document for document in yaml_documents(result.stdout) if document["kind"] == "Secret")
            self.assertEqual(secret["stringData"]["KIBANA_PASSWORD"], "fixture-selected-password")
            result = subprocess.run(
                ["bash", "-c", 'source "$1" >/dev/null && docker compose --profile "*" -f "$2" config --format json',
                 "read-compose", str(ROOT / "deploy/export_env_vars.sh"), str(ROOT / "deploy/services.yml")],
                env=environment, text=True, capture_output=True, check=True, timeout=30,
            )
            password = json.loads(result.stdout)["services"]["kibana"]["environment"]["KIBANA_PASSWORD"]
            self.assertEqual(password, secret["stringData"]["KIBANA_PASSWORD"])

    def test_invalid_credentials_and_incomplete_tls_mapping_fail_rendering(self) -> None:
        cases = [
            (("--set", "credentials.create=false"), "credentials.existingSecret"),
            (("--set", "opensearch.replicas=4"), "opensearchNodeFiles"),
            (("--set", "certificates.opensearchSecretName="), "opensearchSecretName"),
        ]
        for args, message in cases:
            with self.subTest(args=args):
                result = self.render(*args)
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(message, result.stderr)
        for key in ("OPENSEARCH_COMPLIANCE_SALT", "OPENSEARCH_DATASOURCE_MASTER_KEY", "KIBANA_PASSWORD"):
            with self.subTest(key=key), tempfile.TemporaryDirectory() as directory:
                filename = Path(directory) / "invalid.env"
                text = (ROOT / "security/env/users_elasticsearch.env").read_text()
                filename.write_text(re.sub(rf"^{key}=.*$", f"{key}=", text, flags=re.MULTILINE))
                result = self.render("--set-file", f"usersEnvFile.raw={filename}")
                self.assertNotEqual(result.returncode, 0)
                self.assertIn(key, result.stderr)

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

    def test_node_certificates_verify_for_compose_and_helm_service_names(self) -> None:
        ca = self.certificates / "elastic-stack-ca.crt.pem"
        for ordinal in (1, 2, 3):
            name = f"elasticsearch-{ordinal}"
            cert = self.certificates / "elasticsearch" / name / f"{name}.crt"
            for hostname in (name, "localhost", "cogstack-opensearch-client.cogstack.svc",
                             "cogstack-opensearch-client.cogstack.svc.cluster.local"):
                with self.subTest(node=name, hostname=hostname):
                    self.command(
                        "openssl", "verify", "-CAfile", str(ca), "-purpose", "sslserver",
                        "-verify_hostname", hostname, str(cert),
                    )
            self.command("openssl", "verify", "-CAfile", str(ca), "-verify_ip", "127.0.0.1", str(cert))
            key = cert.with_suffix(".key")
            self.command("openssl", "pkey", "-in", str(key), "-check", "-noout")

    def test_dashboards_certificate_verifies_for_localhost_and_kubernetes(self) -> None:
        cert = self.certificates / "es_kibana_client.pem"
        ca = self.certificates / "elastic-stack-ca.crt.pem"
        for hostname in ("localhost", "kibana", "cogstack-opensearch-dashboards.cogstack.svc"):
            with self.subTest(hostname=hostname):
                self.command(
                    "openssl", "verify", "-CAfile", str(ca), "-purpose", "sslserver",
                    "-verify_hostname", hostname, str(cert),
                )


if __name__ == "__main__":
    unittest.main()
