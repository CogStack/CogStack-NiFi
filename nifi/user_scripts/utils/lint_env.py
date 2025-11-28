#!/usr/bin/env python3
"""
    Lightweight env file validator used by deploy/export_env_vars.sh.
"""

from __future__ import annotations

import sys
from collections.abc import Iterable
from pathlib import Path

PORT_SUFFIXES = ("_PORT", "_OUTPUT_PORT", "_INPUT_PORT")
BOOL_SUFFIXES = ("_ENABLED", "_SSL_ENABLED", "_BAKE")
BOOL_VALUES = {"true", "false", "1", "0", "yes", "no", "on", "off"}


def strip_quotes(value: str) -> str:
    if (value.startswith('"') and value.endswith('"')) or (value.startswith("'") and value.endswith("'")):
        return value[1:-1]
    return value


def parse_env_file(path: Path) -> tuple[list[str], list[str], list[tuple[str, str, int]]]:
    errors: list[str] = []
    warnings: list[str] = []
    entries: list[tuple[str, str, int]] = []

    for lineno, raw_line in enumerate(path.read_text().splitlines(), start=1):
        line = raw_line.strip()
        if not line or line.startswith("#"):
            continue

        if line.startswith("export "):
            line = line[len("export ") :].strip()

        if "=" not in line:
            errors.append(f"{path}:{lineno}: missing '=' (got: {raw_line})")
            continue

        key, value = line.split("=", 1)
        key = key.strip()
        value = value.strip()

        if not key:
            errors.append(f"{path}:{lineno}: empty key (got: {raw_line})")
            continue

        entries.append((key, value, lineno))

    seen = {}
    for key, _, lineno in entries:
        if key in seen:
            warnings.append(f"{path}:{lineno}: duplicate key '{key}' (also on line {seen[key]})")
        else:
            seen[key] = lineno

    return errors, warnings, entries


def validate_entries(path: Path, entries: Iterable[tuple[str, str, int]]) -> list[str]:
    errors: list[str] = []

    for key, value, lineno in entries:
        normalized = strip_quotes(value)

        if any(key.endswith(suffix) for suffix in PORT_SUFFIXES):
            if not normalized.isdigit():
                errors.append(f"{path}:{lineno}: '{key}' should be an integer port (got '{value}')")

        if any(key.endswith(suffix) for suffix in BOOL_SUFFIXES):
            if normalized.lower() not in BOOL_VALUES:
                errors.append(
                    f"{path}:{lineno}: '{key}' should be one of {sorted(BOOL_VALUES)} (got '{value}')"
                )

    return errors


def main(args: list[str]) -> int:
    if not args:
        script = Path(__file__).name
        print(f"Usage: {script} <env file> [<env file> ...]")
        return 1

    warnings: list[str] = []
    errors: list[str] = []
    checked_files = 0

    for path_str in args:
        path = Path(path_str).resolve()
        if not path.exists():
            warnings.append(f"Skipping missing env file: {path}")
            continue

        checked_files += 1
        parse_errors, parse_warnings, entries = parse_env_file(path)
        errors.extend(parse_errors)
        warnings.extend(parse_warnings)
        errors.extend(validate_entries(path, entries))

    for warning in warnings:
        print(f"⚠️  {warning}")

    if errors:
        print("❌ Env validation failed:")
        for err in errors:
            print(f"  - {err}")
        return 1

    print(f"✅ Env validation passed ({checked_files} files checked)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
