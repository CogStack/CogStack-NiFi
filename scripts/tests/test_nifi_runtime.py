#!/usr/bin/env python3
"""Check NiFi's upstream startup settings, persistence and credential isolation."""

import json
import os
from pathlib import Path
import shutil
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[2]


@unittest.skipUnless(shutil.which("docker"), "Docker Compose is required")
class NiFiComposeRuntimeTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.models = {}
        environment = {key: value for key, value in os.environ.items() if not key.startswith("COGSTACK_")}
        for name in ("services.yml", "services.dev.yml"):
            result = subprocess.run([
                "bash", "-c", 'source "$1" >/dev/null && docker compose -f "$2" config --format json',
                "nifi-runtime-model", str(ROOT / "deploy/export_env_vars.sh"), str(ROOT / "deploy" / name),
            ], env=environment, cwd=ROOT, capture_output=True, text=True, timeout=30, check=True)
            cls.models[name] = json.loads(result.stdout)["services"]

    def test_proxy_does_not_receive_nifi_or_backend_login_credentials(self):
        forbidden = {"NIFI_SINGLE_USER_CREDENTIALS_USERNAME", "NIFI_SINGLE_USER_CREDENTIALS_PASSWORD",
                     "SINGLE_USER_CREDENTIALS_USERNAME", "SINGLE_USER_CREDENTIALS_PASSWORD",
                     "NIFI_KEYSTORE_PASSWORD", "NIFI_TRUSTSTORE_PASSWORD", "NIFI_SENSITIVE_PROPS_KEY",
                     "KEYSTORE_PASSWORD", "TRUSTSTORE_PASSWORD",
                     "ELASTIC_PASSWORD", "DATABASE_PASSWORD", "MSSQL_SA_PASSWORD"}
        for name, services in self.models.items():
            with self.subTest(file=name):
                self.assertTrue(forbidden.isdisjoint(services["nifi-nginx"]["environment"]))

    def test_existing_deployment_settings_reach_apache_startup(self):
        for name, services in self.models.items():
            settings = services["nifi"]["environment"]
            with self.subTest(file=name):
                for native, existing in (
                    ("SINGLE_USER_CREDENTIALS_USERNAME", "NIFI_SINGLE_USER_CREDENTIALS_USERNAME"),
                    ("SINGLE_USER_CREDENTIALS_PASSWORD", "NIFI_SINGLE_USER_CREDENTIALS_PASSWORD"),
                    ("KEYSTORE_PATH", "NIFI_KEYSTORE_PATH"), ("KEYSTORE_TYPE", "NIFI_KEYSTORE_TYPE"),
                    ("KEYSTORE_PASSWORD", "NIFI_KEYSTORE_PASSWORD"),
                    ("TRUSTSTORE_PATH", "NIFI_TRUSTSTORE_PATH"), ("TRUSTSTORE_TYPE", "NIFI_TRUSTSTORE_TYPE"),
                    ("TRUSTSTORE_PASSWORD", "NIFI_TRUSTSTORE_PASSWORD"),
                    ("NIFI_WEB_HTTPS_PORT", "NIFI_INTERNAL_PORT"),
                    ("NIFI_REMOTE_INPUT_SOCKET_PORT", "NIFI_INPUT_SOCKET_PORT"),
                ):
                    self.assertEqual(settings[native], settings[existing], native)
                self.assertEqual(settings["AUTH"], "tls")
                self.assertEqual(settings["NIFI_SECURITY_USER_AUTHORIZER"], "single-user-authorizer")
                self.assertEqual(settings["NIFI_SECURITY_USER_LOGIN_IDENTITY_PROVIDER"], "single-user-provider")

    def test_development_conf_remains_persistent_and_writable(self):
        nifi = self.models["services.dev.yml"]["nifi"]
        runtime_conf = next(mount for mount in nifi["volumes"] if mount["target"] == "/opt/nifi/nifi-current/conf")
        self.assertEqual(runtime_conf["type"], "volume")
        self.assertFalse(runtime_conf.get("read_only", False))
        self.assertTrue(self.models["services.dev.yml"]["nifi-nginx"]["read_only"])

    def test_python_generated_work_and_script_databases_are_outside_source(self):
        for name, services in self.models.items():
            with self.subTest(file=name):
                settings = services["nifi"]["environment"]
                self.assertEqual(settings["NIFI_PYTHON_WORKING_DIRECTORY"], "/opt/nifi/nifi-current/work/python")
                self.assertTrue(settings["NIFI_USER_SCRIPT_DB_DIR"].startswith("/opt/nifi/nifi-current/state/"))
                self.assertTrue(settings["NIFI_USER_SCRIPT_LOGS_DIR"].startswith("/opt/nifi/nifi-current/logs/"))


if __name__ == "__main__":
    unittest.main()
