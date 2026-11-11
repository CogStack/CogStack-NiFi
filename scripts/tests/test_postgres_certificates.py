#!/usr/bin/env python3
"""Exercise PostgreSQL certificate provisioning with isolated OpenSSL fixtures."""

from __future__ import annotations

import os
import shlex
import shutil
import stat
import subprocess
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
HELPER = ROOT / "security/scripts/create_postgres_certs.sh"


@unittest.skipUnless(shutil.which("openssl"), "OpenSSL is required")
class PostgresCertificateTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory(prefix="cogstack postgres tls ")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.profile = self.directory / "profile with spaces"
        (self.profile / "security").mkdir(parents=True)
        self.certificates = self.directory / "certificates"
        self.samples = self.directory / "samples tls"
        self.databank = self.directory / "databank tls"
        self.other_cwd = self.directory / "unrelated working directory"
        self.other_cwd.mkdir()
        self.env = {
            key: value for key, value in os.environ.items()
            if not key.startswith(("COGSTACK_", "POSTGRES_", "ROOT_CERTIFICATE_", "SECURITY_"))
        }
        self.env["COGSTACK_CONFIG_DIR"] = str(self.profile)
        (self.profile / "security/certificates_general.env").write_text(
            f"SECURITY_CERTIFICATES_DIR={shlex.quote(str(self.certificates))}\n"
            "ROOT_CERTIFICATE_NAME=fixture-ca\n"
            "ROOT_CERTIFICATE_TIME_VAILIDITY_IN_DAYS=30\n"
        )
        self.configure_outputs(self.samples, self.databank)

    def configure_outputs(self, samples: Path | str, databank: Path | str) -> None:
        (self.profile / "database.env").write_text(
            f"POSTGRES_SAMPLES_TLS_DIR={shlex.quote(str(samples))}\n"
            f"POSTGRES_DATABANK_TLS_DIR={shlex.quote(str(databank))}\n"
        )

    def openssl(self, *args: str) -> str:
        result = subprocess.run(
            ["openssl", *args], cwd=self.other_cwd, env=self.env,
            text=True, capture_output=True, timeout=30,
        )
        self.assertEqual(result.returncode, 0, result.stderr)
        return result.stdout

    def create_signing_ca(self) -> Path:
        root = self.certificates / "root"
        root.mkdir(parents=True)
        certificate = root / "fixture-ca.pem"
        self.openssl(
            "req", "-new", "-x509", "-newkey", "rsa:2048", "-nodes", "-sha256",
            "-keyout", str(root / "fixture-ca.key"), "-out", str(certificate),
            "-days", "2", "-subj", "/CN=PostgreSQL fixture signing CA",
            "-addext", "basicConstraints=critical,CA:TRUE",
            "-addext", "keyUsage=critical,keyCertSign,cRLSign",
        )
        return certificate

    def provision(self) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["bash", str(HELPER)], cwd=self.other_cwd, env=self.env,
            text=True, capture_output=True, timeout=90,
        )

    @staticmethod
    def snapshot(directory: Path) -> dict[str, tuple[bytes | None, int, int]]:
        return {
            str(path.relative_to(directory)): (
                path.read_bytes() if path.is_file() else None,
                stat.S_IMODE(path.stat().st_mode), path.stat().st_mtime_ns,
            )
            for path in (directory, *directory.rglob("*"))
        }

    @staticmethod
    def supplied_bundle(directory: Path) -> None:
        directory.mkdir()
        for name in ("server.crt", "server.key", "ca.crt"):
            (directory / name).write_text(f"Externally supplied {name}\n")
        (directory / "operator-note.txt").write_text("Keep this bundle unchanged.\n")

    def test_generated_certificates_verify_for_service_names_and_have_safe_permissions(self) -> None:
        ca = self.create_signing_ca()
        result = self.provision()
        self.assertEqual(result.returncode, 0, result.stderr)
        for bundle, hostnames in (
            (self.samples, ("samples-db", "cogstack-samples-db", "localhost")),
            (self.databank, ("cogstack-databank-db", "cogstack-production-databank-db", "localhost")),
        ):
            with self.subTest(bundle=bundle.name):
                cert, key = bundle / "server.crt", bundle / "server.key"
                self.assertEqual((bundle / "ca.crt").read_bytes(), ca.read_bytes())
                for hostname in hostnames:
                    self.openssl(
                        "verify", "-CAfile", str(bundle / "ca.crt"), "-purpose", "sslserver",
                        "-verify_hostname", hostname, str(cert),
                    )
                self.openssl(
                    "verify", "-CAfile", str(bundle / "ca.crt"),
                    "-verify_ip", "127.0.0.1", str(cert),
                )
                public_key = self.openssl("pkey", "-in", str(key), "-pubout")
                self.assertEqual(public_key, self.openssl("x509", "-in", str(cert), "-pubkey", "-noout"))
                self.assertEqual(stat.S_IMODE(bundle.stat().st_mode), 0o755)
                self.assertEqual(stat.S_IMODE(key.stat().st_mode), 0o600)
                for name in ("server.crt", "ca.crt"):
                    self.assertEqual(stat.S_IMODE((bundle / name).stat().st_mode), 0o644)

    def test_complete_supplied_bundles_are_unchanged_without_signing_ca(self) -> None:
        for bundle in (self.samples, self.databank):
            self.supplied_bundle(bundle)
        before = [self.snapshot(bundle) for bundle in (self.samples, self.databank)]
        result = self.provision()
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(before, [self.snapshot(bundle) for bundle in (self.samples, self.databank)])
        self.assertFalse(self.certificates.exists())

    def test_partial_or_nonempty_directories_are_rejected_without_changes(self) -> None:
        self.create_signing_ca()
        for invalid_name in ("server.crt", "operator-note.txt"):
            for invalid_service in ("samples", "databank"):
                with self.subTest(file=invalid_name, service=invalid_service):
                    samples = self.directory / f"samples-{invalid_service}-{invalid_name}"
                    databank = self.directory / f"databank-{invalid_service}-{invalid_name}"
                    invalid = samples if invalid_service == "samples" else databank
                    supplied = databank if invalid_service == "samples" else samples
                    invalid.mkdir()
                    (invalid / invalid_name).write_text("Deployment-managed input\n")
                    self.supplied_bundle(supplied)
                    self.configure_outputs(samples, databank)
                    before = [self.snapshot(bundle) for bundle in (samples, databank)]
                    result = self.provision()
                    self.assertNotEqual(result.returncode, 0, result.stdout)
                    self.assertEqual(before, [self.snapshot(bundle) for bundle in (samples, databank)])

    def test_relative_output_paths_resolve_from_deploy_instead_of_working_directory(self) -> None:
        self.create_signing_ca()
        self.configure_outputs(
            os.path.relpath(self.samples, ROOT / "deploy"),
            os.path.relpath(self.databank, ROOT / "deploy"),
        )
        result = self.provision()
        self.assertEqual(result.returncode, 0, result.stderr)
        for bundle in (self.samples, self.databank):
            self.assertTrue((bundle / "server.key").is_file())
            self.openssl("verify", "-CAfile", str(bundle / "ca.crt"), str(bundle / "server.crt"))

    @unittest.skipUnless(shutil.which("make"), "Make is required")
    def test_make_target_uses_existing_ca_with_a_certificate_path_containing_spaces(self) -> None:
        ca = self.create_signing_ca()
        for suffix in (".p12", "-keystore.jks", "-truststore.jks"):
            (ca.parent / f"fixture-ca{suffix}").touch()
        before = self.snapshot(ca.parent)
        # Exercise the Make argument itself; a profile assignment would mask
        # incorrect path handling by replacing the value inside the helper.
        general = self.profile / "security/certificates_general.env"
        general.write_text("\n".join(
            line for line in general.read_text().splitlines()
            if not line.startswith("SECURITY_CERTIFICATES_DIR=")
        ) + "\n")
        result = subprocess.run(
            ["make", "-C", str(ROOT / "deploy"), "init-security-postgresql",
             f"SECURITY_CERTIFICATES_DIR={self.certificates}"],
            cwd=self.other_cwd, env=self.env, text=True, capture_output=True, timeout=90,
        )
        self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
        self.assertEqual(before, self.snapshot(ca.parent))
        for bundle, hostname in (
            (self.samples, "samples-db"), (self.databank, "cogstack-databank-db"),
        ):
            with self.subTest(bundle=bundle.name):
                self.assertTrue((bundle / "server.key").is_file())
                self.assertEqual(ca.read_bytes(), (bundle / "ca.crt").read_bytes())
                self.openssl(
                    "verify", "-CAfile", str(ca), "-purpose", "sslserver",
                    "-verify_hostname", hostname, str(bundle / "server.crt"),
                )


if __name__ == "__main__":
    unittest.main()
