#!/usr/bin/env python3
"""Exercise the PostgreSQL bootstrap bundles without touching a running database."""

import gzip
import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]


class PostgresInitializationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="cogstack-postgres-init-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.bundle = self.directory / "site bootstrap"
        self.bundle.mkdir()
        self.schemas = self.bundle / "schemas"
        self.schemas.mkdir()
        self.dumps = self.bundle / "db_dump"
        self.dumps.mkdir()
        self.script = self.bundle / "init_db.sh"
        self.log = self.directory / "calls.jsonl"
        bin_dir = self.directory / "bin"
        bin_dir.mkdir()
        psql = bin_dir / "psql"
        psql.write_text(
            f"#!{sys.executable}\n"
            + """
import json
import os
import sys
from pathlib import Path

args = sys.argv[1:]
stdin = "" if "-f" in args else sys.stdin.read()
with Path(os.environ["FAKE_PSQL_LOG"]).open("a") as stream:
    stream.write(json.dumps({"args": args, "stdin": stdin}) + "\\n")
if "-f" in args and os.environ.get("FAKE_FAIL_FILE") == Path(args[args.index("-f") + 1]).name:
    sys.exit(7)
"""
        )
        psql.chmod(0o755)
        self.environment = {
            **os.environ,
            "PATH": str(bin_dir) + os.pathsep + os.environ["PATH"],
            "POSTGRES_USER": "site user",
            "POSTGRES_DB": "site database",
            "POSTGRES_DB_SCHEMA_PREFIX": "cogstack_db",
            "FAKE_PSQL_LOG": str(self.log),
        }

    def install_samples_bundle(self):
        shutil.copy2(ROOT / "services/pgsamples/init_db.sh", self.script)
        (self.schemas / "samples_db_schema.sql").write_text("-- sample schema\n")
        for name in ("encounters_pdf_text_small.sql", "encounters_docx_small.sql"):
            (self.dumps / name).write_text("-- " + name + "\n")
        for name in (
            "samples_db_data.sql.gz",
            "encounters_jpg_small.sql.gz",
            "encounters_pdf_img_small.sql.gz",
        ):
            (self.dumps / name).write_bytes(gzip.compress(("-- " + name + "\n").encode()))

    def install_databank_bundle(self):
        shutil.copy2(ROOT / "services/cogstack-db/pgsql/init_db.sh", self.script)
        for name in (
            "annotations_nlp_create_schema.sql",
            "cogstack_db_02 second.sql",
            "cogstack_db_01 first.sql",
        ):
            (self.schemas / name).write_text("-- " + name + "\n")
        (self.schemas / "unrelated.sql").write_text("-- should not run\n")

    def run_loader(self, **overrides):
        return subprocess.run(
            ["bash", str(self.script)],
            env={**self.environment, **overrides},
            text=True,
            capture_output=True,
            timeout=10,
        )

    def calls(self):
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def test_samples_load_all_inputs_from_the_bundle_into_postgres_db(self):
        self.install_samples_bundle()
        result = self.run_loader()
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.calls()
        self.assertEqual(len(calls), 6)
        self.assertEqual(Path(calls[0]["args"][-1]), self.schemas / "samples_db_schema.sql")
        self.assertIn("samples_db_data.sql.gz", calls[1]["stdin"])
        self.assertEqual(Path(calls[2]["args"][-1]).name, "encounters_pdf_text_small.sql")
        self.assertEqual(Path(calls[3]["args"][-1]).name, "encounters_docx_small.sql")
        self.assertIn("encounters_jpg_small.sql.gz", calls[4]["stdin"])
        self.assertIn("encounters_pdf_img_small.sql.gz", calls[5]["stdin"])
        for call in calls:
            self.assertEqual(call["args"][call["args"].index("-d") + 1], "site database")
            self.assertEqual(call["args"][call["args"].index("-U") + 1], "site user")
            self.assertIn("ON_ERROR_STOP=1", call["args"])
            self.assertNotIn("CREATE DATABASE", call["stdin"])

    def test_missing_sample_input_fails_before_modifying_the_database(self):
        self.install_samples_bundle()
        (self.dumps / "samples_db_data.sql.gz").unlink()
        result = self.run_loader()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Missing sample database input", result.stderr)
        self.assertEqual(self.calls(), [])

    def test_corrupt_compressed_input_stops_the_sample_load(self):
        self.install_samples_bundle()
        (self.dumps / "samples_db_data.sql.gz").write_bytes(b"not gzip data")
        result = self.run_loader()
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(len(self.calls()), 2)
        self.assertNotIn("initialization completed", result.stdout)

    def test_sample_schema_error_prevents_data_import(self):
        self.install_samples_bundle()
        result = self.run_loader(FAKE_FAIL_FILE="samples_db_schema.sql")
        self.assertEqual(result.returncode, 7)
        self.assertEqual(len(self.calls()), 1)

    def test_databank_selects_custom_sql_in_order_without_creating_database(self):
        self.install_databank_bundle()
        result = self.run_loader()
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.calls()
        self.assertEqual(
            [Path(c["args"][-1]).name for c in calls],
            ["annotations_nlp_create_schema.sql", "cogstack_db_01 first.sql", "cogstack_db_02 second.sql"],
        )
        for call in calls:
            self.assertEqual(Path(call["args"][-1]).parent, self.schemas)
            self.assertEqual(call["args"][call["args"].index("-d") + 1], "site database")
            self.assertNotIn("CREATE DATABASE", call["stdin"])

    def test_databank_sql_error_prevents_later_files(self):
        self.install_databank_bundle()
        result = self.run_loader(FAKE_FAIL_FILE="cogstack_db_01 first.sql")
        self.assertEqual(result.returncode, 7)
        self.assertEqual(len(self.calls()), 2)


if __name__ == "__main__":
    unittest.main()
