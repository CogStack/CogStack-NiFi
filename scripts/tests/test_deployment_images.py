#!/usr/bin/env python3
"""Regression checks for image drift and stale local build reuse."""

from __future__ import annotations

import tempfile
import unittest
from pathlib import Path

from check_deployment_images import compose_errors


class DeploymentImagesTest(unittest.TestCase):
    def test_numbered_tags_still_require_a_digest(self) -> None:
        for image in ("example/app:latest", "example/app:1.2.3", "example/app@sha256:short"):
            with self.subTest(image=image):
                self.assertTrue(compose_errors({"services": {"app": {"image": image}}}, "test"))
        image = "example/app:1.2.3@sha256:" + "a" * 64
        self.assertEqual(compose_errors({"services": {"app": {"image": image}}}, "test"), [])

    def test_local_builds_need_pinned_bases_and_source_rebuilds(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            dockerfile = Path(directory) / "Dockerfile"
            dockerfile.write_text("FROM python:3.12-alpine\n")
            service = {"build": {"context": directory}, "image": "example/app:local"}
            errors = compose_errors({"services": {"app": service}}, "test")
            self.assertEqual(len(errors), 2)
            service["pull_policy"] = "build"
            dockerfile.write_text("FROM python:3.12-alpine@sha256:" + "a" * 64 + "\n")
            self.assertEqual(compose_errors({"services": {"app": service}}, "test"), [])

    def test_build_argument_overrides_are_validated(self) -> None:
        with tempfile.TemporaryDirectory() as directory:
            dockerfile = Path(directory) / "Dockerfile"
            dockerfile.write_text("ARG BASE=python@sha256:" + "a" * 64 + "\nFROM ${BASE}\n")
            service = {
                "build": {"context": directory, "args": {"BASE": "python:latest"}},
                "pull_policy": "build",
            }
            self.assertTrue(compose_errors({"services": {"app": service}}, "test"))


if __name__ == "__main__":
    unittest.main()
