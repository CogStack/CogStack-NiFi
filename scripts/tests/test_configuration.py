#!/usr/bin/env python3
"""Check profile selection, container values, and startup resource guards."""

from __future__ import annotations

import json
import os
import re
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

from check_nifi_resources import resource_errors

ROOT = Path(__file__).resolve().parents[2]


class ConfigurationTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="cogstack configuration ")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.profile = self.directory / "profile with spaces"
        self.profile.mkdir()
        self.env = {key: value for key, value in os.environ.items() if not key.startswith("COGSTACK_")}
        self.env["COGSTACK_CONFIG_DIR"] = str(self.profile)

    def settings(self, name: str, changes: dict[str, str]) -> Path:
        relative = f"security/env/{name}" if name.startswith(("users_", "certificates_")) else f"deploy/{name}"
        target = self.profile / ("security" if relative.startswith("security/") else "") / name
        target.parent.mkdir(parents=True, exist_ok=True)
        text = (ROOT / relative).read_text()
        for key, value in changes.items():
            replacement = f"{key}='{value}'"
            text, count = re.subn(
                rf"^{key}=.*$", replacement.replace("\\", "\\\\"), text, flags=re.MULTILINE,
            )
            self.assertEqual(count, 1, key)
        target.write_text(text)
        return target

    def run_bash(self, command: str, *args: str, shell: str = "bash") -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            [shell, "-c", command, "test-configuration", str(ROOT / "deploy/export_env_vars.sh"), *args],
            env=self.env, cwd=self.directory, text=True, capture_output=True, timeout=30,
        )

    def test_selected_files_replace_defaults_and_missing_files_fall_back(self) -> None:
        custom = self.settings("nifi.env", {"NIFI_JVM_HEAP_MAX": "1536m", "NIFI_DOCKER_RAM": "3g"})
        result = self.run_bash(
            'set -euo pipefail; source "$1" >/dev/null; '
            'printf "%s\\n" "$NIFI_JVM_HEAP_MAX" "$NIFI_DOCKER_RAM" '
            '"$COGSTACK_NIFI_ENV_FILE" "$COGSTACK_DATABASE_ENV_FILE"'
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(result.stdout.splitlines(), ["1536m", "3g", str(custom), str(ROOT / "deploy/database.env")])

    @unittest.skipUnless(shutil.which("docker"), "Docker Compose is required")
    def test_compose_uses_profile_for_resources_ports_and_container_environment(self) -> None:
        self.settings("nifi.env", {
            "NIFI_JVM_HEAP_MAX": "1536m", "NIFI_DOCKER_RAM": "3g", "NIFI_OUTPUT_PORT": "18082",
            "NIFI_DATA_PATH": str(self.directory / "data with spaces"),
        })
        selected_value = "fixture-$value with spaces"
        self.settings("users_nifi.env", {"NIFI_TEST_VALUE": selected_value})
        for compose_file in ("services.yml", "services.dev.yml"):
            with self.subTest(compose_file=compose_file):
                result = self.run_bash(
                    'source "$1" >/dev/null && docker compose -f "$2" config --format json',
                    str(ROOT / "deploy" / compose_file),
                )
                self.assertEqual(result.returncode, 0, result.stderr)
                nifi = json.loads(result.stdout)["services"]["nifi"]
                self.assertEqual(nifi["environment"]["NIFI_JVM_HEAP_MAX"], "1536m")
                # Compose escapes dollar signs when serializing a reusable model.
                value = nifi["environment"]["NIFI_TEST_VALUE"].replace("$$", "$")
                self.assertEqual(value, selected_value)
                self.assertEqual(int(nifi["deploy"]["resources"]["limits"]["memory"]), 3 * 1024**3)
                self.assertTrue(any(port.get("published") == "18082" for port in nifi["ports"]))
                data_mount = next(volume for volume in nifi["volumes"] if volume["target"] == "/data")
                self.assertEqual(data_mount["source"], str(self.directory / "data with spaces"))
                self.assertFalse(nifi["environment"]["JVM_OPTS"].startswith('"'))

    def test_relative_profile_path_is_resolved_from_repository_root(self) -> None:
        self.settings("nifi.env", {"NIFI_JVM_HEAP_MAX": "1536m", "NIFI_DOCKER_RAM": "3g"})
        self.env["COGSTACK_CONFIG_DIR"] = os.path.relpath(self.profile, ROOT)
        result = self.run_bash('source "$1" >/dev/null; printf "%s\\n" "$COGSTACK_CONFIG_DIR"')
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(Path(result.stdout.strip()).resolve(), self.profile.resolve())
        result = self.make("check-nifi-resources")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("1536m", result.stdout)

    def test_loader_preserves_shell_options(self) -> None:
        for flags in ("set -eu; set -o pipefail", "set -eua; set -o pipefail"):
            result = self.run_bash(
                flags + '; before="$-"; source "$1" >/dev/null; '
                'test "$before" = "$-"; test -o pipefail; test -o nounset; test -o errexit'
            )
            self.assertEqual(result.returncode, 0, result.stderr)

    @unittest.skipUnless(shutil.which("zsh"), "zsh is optional")
    def test_loader_can_be_sourced_from_zsh(self) -> None:
        result = self.run_bash('source "$1" >/dev/null && test "$NIFI_JVM_HEAP_MAX" = 1g', shell="zsh")
        self.assertEqual(result.returncode, 0, result.stderr)

    def fake_docker(self) -> Path:
        binary = self.directory / "docker"
        log = self.directory / "docker-called"
        binary.write_text('#!/bin/sh\n: > "$CONFIG_TEST_DOCKER_LOG"\nexit 99\n')
        binary.chmod(0o755)
        self.env["CONFIG_TEST_DOCKER_LOG"] = str(log)
        self.env["PATH"] = f"{self.directory}:{self.env['PATH']}"
        return log

    def make(self, target: str, *args: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["make", "-s", "-C", str(ROOT / "deploy"), target, *args],
            env=self.env, text=True, capture_output=True, timeout=30,
        )

    def test_invalid_directory_stops_make_before_docker(self) -> None:
        log = self.fake_docker()
        self.env["COGSTACK_CONFIG_DIR"] = str(self.directory / "missing")
        result = self.make("check-config")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("not a directory", result.stderr)
        self.assertFalse(log.exists())

    def test_broken_profile_symlink_fails_instead_of_using_defaults(self) -> None:
        (self.profile / "nifi.env").symlink_to(self.directory / "missing.env")
        result = self.run_bash('source "$1"')
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("not a readable regular file", result.stderr)

    def test_invalid_memory_stops_startup_before_docker(self) -> None:
        log = self.fake_docker()
        self.settings("nifi.env", {"NIFI_JVM_HEAP_MAX": "2g", "NIFI_DOCKER_RAM": "2g"})
        result = self.make("start-nifi")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("must be smaller", result.stderr)
        self.assertFalse(log.exists())

    def test_certificate_checks_use_selected_security_settings(self) -> None:
        self.settings("certificates_general.env", {"ROOT_CERTIFICATE_NAME": "profile-root"})
        certificates = self.directory / "certificates"
        root = certificates / "root"
        root.mkdir(parents=True)
        for suffix in (".key", ".pem", ".p12", "-keystore.jks", "-truststore.jks"):
            (root / f"profile-root{suffix}").touch()
        result = self.make("init-security-root-ca", f"SECURITY_CERTIFICATES_DIR={certificates}")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn("already exist", result.stdout)

    @unittest.skipUnless(shutil.which("helm"), "Helm is required")
    def test_helm_make_target_uses_selected_nifi_settings(self) -> None:
        self.settings("nifi.env", {"NIFI_JVM_HEAP_MAX": "1536m", "NIFI_DOCKER_RAM": "3g"})
        result = self.make("helm-template-nifi")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertIn('"-Xmx1536m"', result.stdout)
        self.assertIn('memory: "3Gi"', result.stdout)

    @unittest.skipUnless(shutil.which("helm"), "Helm is required")
    def test_direct_helm_rejects_heap_equal_to_memory_limit(self) -> None:
        settings = self.directory / "invalid.env"
        settings.write_text("NIFI_JVM_HEAP_INIT=1g\nNIFI_JVM_HEAP_MAX=2g\nNIFI_DOCKER_RAM=2g\n")
        result = subprocess.run(
            ["helm", "template", "invalid", str(ROOT / "deploy/charts/nifi"), "--set-file", f"envFile.raw={settings}"],
            text=True, capture_output=True, timeout=30,
        )
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("must be smaller", result.stderr)

    def test_heap_validation_handles_units_and_invalid_combinations(self) -> None:
        values = {"NIFI_JVM_HEAP_INIT": "768m", "NIFI_JVM_HEAP_MAX": "1024m", "NIFI_DOCKER_RAM": "2GiB"}
        self.assertEqual(resource_errors(values), [])
        for changes in (
            {"NIFI_JVM_HEAP_INIT": "2g"}, {"NIFI_JVM_HEAP_MAX": "2g"},
            {"NIFI_JVM_HEAP_MAX": "1.5g"}, {"NIFI_DOCKER_RAM": "unlimited"}, {"NIFI_JVM_HEAP_INIT": "0"},
        ):
            with self.subTest(changes=changes):
                self.assertTrue(resource_errors({**values, **changes}))


if __name__ == "__main__":
    unittest.main()
