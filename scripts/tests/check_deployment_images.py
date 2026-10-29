#!/usr/bin/env python3
"""Validate resolved deployment images without starting Docker or Kubernetes."""

from __future__ import annotations

import argparse
import json
import re
import shlex
import subprocess
import sys
from pathlib import Path
from string import Template

ROOT = Path(__file__).resolve().parents[2]
PINNED_IMAGE = re.compile(r"[^\s@]+@sha256:[0-9a-f]{64}\Z")


def build_errors(build: dict, label: str) -> list[str]:
    context = Path(build["context"])
    dockerfile = context / build.get("dockerfile", "Dockerfile")
    arguments = {key: str(value) for key, value in build.get("args", {}).items() if value is not None}
    stages: set[str] = set()
    errors = []
    for line in dockerfile.read_text().splitlines():
        instruction, _, value = line.strip().partition(" ")
        if instruction.upper() == "ARG":
            key, separator, default = value.partition("=")
            if separator:
                arguments.setdefault(key, default.strip('"\''))
        elif instruction.upper() == "FROM":
            words = shlex.split(value)
            words = [word for word in words if not word.startswith("--")]
            image = Template(words[0]).safe_substitute(arguments)
            if image not in stages and image != "scratch" and not PINNED_IMAGE.fullmatch(image):
                errors.append(f"{label}: unpinned build base {image}")
            if len(words) == 3 and words[1].upper() == "AS":
                stages.add(words[2])
    return errors


def compose_errors(config: dict, label: str) -> list[str]:
    errors = []
    for name, service in config["services"].items():
        service_label = f"{label}/{name}"
        if "build" in service:
            if service.get("pull_policy") != "build":
                errors.append(f"{service_label}: local builds require pull_policy: build")
            errors.extend(build_errors(service["build"], service_label))
        elif not PINNED_IMAGE.fullmatch(service.get("image", "")):
            errors.append(f"{service_label}: image must include an immutable @sha256 digest")
    return errors


def render_compose(path: Path) -> dict:
    result = subprocess.run(
        [
            "bash", "-c",
            'source "$1" >/dev/null; set -euo pipefail; '
            'exec docker compose --profile "*" -f "$2" config --format json',
            "check-deployment-images", str(ROOT / "deploy/export_env_vars.sh"), str(path),
        ],
        text=True, capture_output=True, check=True, timeout=60,
    )
    return json.loads(result.stdout)


def helm_errors() -> list[str]:
    errors = []
    for chart in ("nifi", "opensearch", "postgresql"):
        command = [
            "helm", "template", f"check-{chart}", str(ROOT / "deploy/charts" / chart),
            "-f", str(ROOT / "deploy/helm" / f"{chart}.values.yaml"),
        ]
        result = subprocess.run(command, text=True, capture_output=True, check=True, timeout=60)
        images = re.findall(r"^\s*(?:image|imageName):\s*(\S+)", result.stdout, re.MULTILINE)
        if not images:
            errors.append(f"Helm {chart}: no images rendered")
        for image in images:
            if not PINNED_IMAGE.fullmatch(image.strip('"\'')):
                errors.append(f"Helm {chart}: unpinned image {image}")
    return errors


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--helm", action="store_true", help="also render and check the owned Helm charts")
    args = parser.parse_args()
    errors = []
    try:
        for name in ("services.yml", "services.dev.yml"):
            errors.extend(compose_errors(render_compose(ROOT / "deploy" / name), name))
        if args.helm:
            errors.extend(helm_errors())
    except (OSError, subprocess.SubprocessError, ValueError) as exc:
        print(f"Deployment image validation failed: {exc}", file=sys.stderr)
        if isinstance(exc, subprocess.CalledProcessError):
            print(exc.stderr, file=sys.stderr)
        return 1
    if errors:
        print("Deployment image validation failed:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("Deployment images and local build bases are pinned; local services rebuild from source.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
