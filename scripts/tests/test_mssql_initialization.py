#!/usr/bin/env python3
"""Check readiness, SQL failures, and quoting in the MSSQL initialization job."""

import json
import os
import shutil
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
INITIALIZER = ROOT / "services/cogstack-db/mssql/init_db.sh"


class MssqlInitializationTests(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory(prefix="cogstack-mssql-init-")
        self.addCleanup(self.temp.cleanup)
        self.directory = Path(self.temp.name)
        self.schemas = self.directory / "site schemas"
        self.schemas.mkdir()
        self.annotations = self.schemas / "annotations_nlp_create_schema.sql"
        self.annotations.write_text("-- annotations fixture\n")
        (self.schemas / "cogstack_db_01 first.sql").write_text("-- custom fixture\n")
        (self.schemas / "cogstack_db_02 second.sql").write_text("-- custom fixture\n")
        self.log = self.directory / "calls.jsonl"
        self.sqlcmd = self.directory / "sqlcmd"
        self.sqlcmd.write_text(
            f"#!{sys.executable}\n"
            + """
import json
import os
import sys
from pathlib import Path

args = sys.argv[1:]
log = Path(os.environ["FAKE_SQLCMD_LOG"])
calls = [json.loads(line) for line in log.read_text().splitlines()] if log.exists() else []
with log.open("a") as stream:
    stream.write(json.dumps({
        "args": args,
        "password_from_env": os.environ.get("SQLCMDPASSWORD") == "fixture-password",
    }) + "\\n")
if "-Q" in args and "SELECT 1" in args[args.index("-Q") + 1]:
    attempts = sum("-Q" in c["args"] and "SELECT 1" in c["args"][c["args"].index("-Q") + 1] for c in calls)
    if attempts < int(os.environ.get("FAKE_NOT_READY", "0")):
        sys.exit(1)
if "-Q" in args and "CREATE DATABASE" in args[args.index("-Q") + 1] and os.environ.get("FAKE_CREATE_FAILURE"):
    sys.exit(7)
if "-i" in args and os.environ.get("FAKE_FAIL_FILE") == Path(args[args.index("-i") + 1]).name:
    sys.exit(7)
"""
        )
        self.sqlcmd.chmod(0o755)
        self.environment = {
            **os.environ,
            "MSSQL_SA_PASSWORD": "fixture-password",
            "DATABASE_DB_NAME": "site_databank",
            "POSTGRES_DB_SCHEMA_PREFIX": "cogstack_db",
            "MSSQL_SCHEMA_DIR": str(self.schemas),
            "MSSQL_INIT_RETRIES": "3",
            "MSSQL_INIT_RETRY_DELAY_SECONDS": "0",
            "SQLCMD_BIN": str(self.sqlcmd),
            "FAKE_SQLCMD_LOG": str(self.log),
        }

    def run_job(self, script=INITIALIZER, **overrides):
        return subprocess.run(
            ["bash", str(script)],
            env={**self.environment, **overrides},
            text=True,
            capture_output=True,
            timeout=10,
        )

    def calls(self):
        return [json.loads(line) for line in self.log.read_text().splitlines()] if self.log.exists() else []

    def applied_files(self):
        return [
            Path(call["args"][call["args"].index("-i") + 1]).name
            for call in self.calls()
            if "-i" in call["args"]
        ]

    def test_waits_until_ready_then_applies_sql_in_order_and_exits(self):
        result = self.run_job(FAKE_NOT_READY="2")
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.calls()
        self.assertEqual(len(calls), 7)
        self.assertEqual(
            self.applied_files(),
            ["cogstack_db_01 first.sql", "cogstack_db_02 second.sql", self.annotations.name],
        )
        for call in calls:
            self.assertIn("-b", call["args"])
            self.assertNotIn("-P", call["args"])
            self.assertTrue(call["password_from_env"])

    def test_readiness_timeout_does_not_create_or_modify_schema(self):
        result = self.run_job(FAKE_NOT_READY="99")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("not ready after 3 attempts", result.stderr)
        self.assertEqual(len(self.calls()), 3)
        self.assertEqual(self.applied_files(), [])

    def test_database_creation_failure_stops_before_schema_changes(self):
        result = self.run_job(FAKE_CREATE_FAILURE="1")
        self.assertEqual(result.returncode, 7)
        self.assertEqual(self.applied_files(), [])

    def test_custom_sql_failure_prevents_later_scripts(self):
        result = self.run_job(FAKE_FAIL_FILE="cogstack_db_01 first.sql")
        self.assertEqual(result.returncode, 7)
        self.assertEqual(self.applied_files(), ["cogstack_db_01 first.sql"])

    def test_annotation_sql_failure_is_reported_by_job(self):
        result = self.run_job(FAKE_FAIL_FILE=self.annotations.name)
        self.assertEqual(result.returncode, 7)
        self.assertNotIn("initialization completed", result.stdout)

    def test_database_names_are_quoted_for_queries_and_connection_arguments(self):
        name = "ward's]notes"
        result = self.run_job(DATABASE_DB_NAME=name)
        self.assertEqual(result.returncode, 0, result.stderr)
        calls = self.calls()
        creation = calls[1]["args"]
        query = creation[creation.index("-Q") + 1]
        self.assertIn("DB_ID(N'ward''s]notes')", query)
        self.assertIn("CREATE DATABASE [ward's]]notes]", query)
        for call in calls[2:]:
            self.assertEqual(call["args"][call["args"].index("-d") + 1], name)

    def test_missing_password_fails_before_connecting(self):
        result = self.run_job(MSSQL_SA_PASSWORD="")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Set MSSQL_SA_PASSWORD", result.stderr)
        self.assertEqual(self.calls(), [])

    def test_missing_annotation_schema_fails_before_connecting(self):
        self.annotations.unlink()
        result = self.run_job()
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("Missing annotation schema", result.stderr)
        self.assertEqual(self.calls(), [])

    def test_schema_directory_defaults_to_the_mounted_bootstrap_bundle(self):
        script = self.directory / "init_db.sh"
        shutil.copy2(INITIALIZER, script)
        shutil.copytree(self.schemas, self.directory / "schemas")
        result = self.run_job(script=script, MSSQL_SCHEMA_DIR="")
        self.assertEqual(result.returncode, 0, result.stderr)
        for call in self.calls():
            if "-i" in call["args"]:
                path = Path(call["args"][call["args"].index("-i") + 1])
                self.assertEqual(path.parent, self.directory / "schemas")


if __name__ == "__main__":
    unittest.main()
