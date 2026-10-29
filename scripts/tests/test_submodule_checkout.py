#!/usr/bin/env python3
"""Test submodule setup against local repositories without changing this checkout."""

from __future__ import annotations

import os
import shutil
import subprocess
import tempfile
import unittest
from pathlib import Path

PROJECT_DIR = Path(__file__).resolve().parents[2]


class SubmoduleCheckoutTest(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.env = {
            **os.environ,
            "GIT_CONFIG_GLOBAL": os.devnull,
            "GIT_CONFIG_NOSYSTEM": "1",
            "GIT_ALLOW_PROTOCOL": "file",
            "GIT_TERMINAL_PROMPT": "0",
        }
        self.nested = self.new_repo("nested-origin")
        self.nested_pin = self.commit(self.nested, "old nested code")
        self.dependency = self.new_repo("dependency-origin")
        self.git(self.dependency, "submodule", "add", str(self.nested), "nested")
        self.dependency_pin = self.commit(self.dependency, "old dependency code")
        self.git(self.dependency, "tag", "v1.0.0")

        source = self.new_repo("source")
        (source / "scripts").mkdir()
        for name in ("git_init_submodules_in_repo.sh", "git_update_submodules_in_repo.sh"):
            shutil.copy2(PROJECT_DIR / "scripts" / name, source / "scripts" / name)
        self.git(source, "submodule", "add", str(self.dependency), "dependency")
        self.git(source, "config", "-f", ".gitmodules", "submodule.dependency.ignore", "all")
        self.commit(source, "parent code")

        # Both remotes advance after the parent records its dependency commits.
        self.commit(self.nested, "new nested code")
        self.git(self.nested, "tag", "v2.0.0")
        self.dependency_release = self.commit(self.dependency, "released dependency code")
        self.git(self.dependency, "tag", "v2.0.0")
        self.commit(self.dependency, "unreleased dependency code")
        self.git(self.dependency, "tag", "v3.0.0-rc1")

        self.checkout = self.root / "checkout"
        self.git(self.root, "clone", "--quiet", str(source), str(self.checkout))
        self.parent_head = self.git(self.checkout, "rev-parse", "HEAD")
        # An unrelated staged edit must never be included in an automatic commit.
        (self.checkout / "payload.txt").write_text("staged parent edit\n")
        self.git(self.checkout, "add", "payload.txt")
        self.parent_index = self.git(self.checkout, "write-tree")

    def git(self, cwd: Path, *args: str) -> str:
        result = subprocess.run(
            ["git", *args], cwd=cwd, env=self.env, text=True,
            capture_output=True, check=True, timeout=30,
        )
        return result.stdout.strip()

    def new_repo(self, name: str) -> Path:
        repo = self.root / name
        repo.mkdir()
        self.git(repo, "init", "--quiet", "--initial-branch=main")
        self.git(repo, "config", "user.name", "Test")
        self.git(repo, "config", "user.email", "test@example.invalid")
        return repo

    def commit(self, repo: Path, text: str) -> str:
        (repo / "payload.txt").write_text(text + "\n")
        self.git(repo, "add", ".")
        self.git(repo, "commit", "--quiet", "-m", text)
        return self.git(repo, "rev-parse", "HEAD")

    def helper(self, action: str) -> subprocess.CompletedProcess[str]:
        return subprocess.run(
            ["bash", str(self.checkout / "scripts" / f"git_{action}_submodules_in_repo.sh")],
            cwd=self.root, env=self.env, text=True, capture_output=True, timeout=30,
        )

    def assert_parent_untouched(self) -> None:
        self.assertEqual(self.git(self.checkout, "rev-parse", "HEAD"), self.parent_head)
        self.assertEqual(self.git(self.checkout, "write-tree"), self.parent_index)

    def test_initialization_uses_recorded_commits_and_is_repeatable(self) -> None:
        # Explicit --checkout must override a contributor's merge preference.
        self.git(self.checkout, "config", "submodule.dependency.update", "merge")
        for _ in range(2):
            result = self.helper("init")
            self.assertEqual(result.returncode, 0, result.stderr)
            dependency = self.checkout / "dependency"
            self.assertEqual(self.git(dependency, "rev-parse", "HEAD"), self.dependency_pin)
            self.assertEqual(self.git(dependency / "nested", "rev-parse", "HEAD"), self.nested_pin)
            self.assert_parent_untouched()

    def test_upgrade_selects_release_and_keeps_nested_dependencies_pinned(self) -> None:
        result = self.helper("update")
        self.assertEqual(result.returncode, 0, result.stderr)
        dependency = self.checkout / "dependency"
        self.assertEqual(self.git(dependency, "rev-parse", "HEAD"), self.dependency_release)
        self.assertEqual(self.git(dependency / "nested", "rev-parse", "HEAD"), self.nested_pin)
        self.assert_parent_untouched()

    def test_upgrade_refuses_local_changes_in_nested_submodule(self) -> None:
        result = self.helper("init")
        self.assertEqual(result.returncode, 0, result.stderr)
        dependency = self.checkout / "dependency"
        (dependency / "nested" / "payload.txt").write_text("local edit\n")
        result = self.helper("update")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("local changes", result.stderr)
        self.assertEqual(self.git(dependency, "rev-parse", "HEAD"), self.dependency_pin)
        self.assertEqual((dependency / "nested" / "payload.txt").read_text(), "local edit\n")
        self.assert_parent_untouched()


if __name__ == "__main__":
    unittest.main()
