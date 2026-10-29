#!/usr/bin/env python3
"""Validate resolved NiFi heap and container memory settings before startup."""

from __future__ import annotations

import os
import re
import sys
from collections.abc import Mapping
from decimal import Decimal


def memory_bytes(value: str, *, heap: bool = False) -> Decimal:
    pattern = r"([0-9]+)([kmg]?)" if heap else r"([0-9]+(?:\.[0-9]+)?)([kmgtpe]?)(?:i?b)?"
    match = re.fullmatch(pattern, value.strip(), re.IGNORECASE)
    if not match:
        raise ValueError("use a positive memory size such as 768m, 1g, or 2GiB")
    size = Decimal(match[1]) * 1024 ** ("kmgtpe".index(match[2].lower()) + 1 if match[2] else 0)
    if size <= 0:
        raise ValueError("memory sizes must be positive")
    return size


def resource_errors(values: Mapping[str, str]) -> list[str]:
    sizes: dict[str, Decimal] = {}
    errors = []
    for key in ("NIFI_JVM_HEAP_INIT", "NIFI_JVM_HEAP_MAX", "NIFI_DOCKER_RAM"):
        try:
            sizes[key] = memory_bytes(values.get(key, ""), heap=key != "NIFI_DOCKER_RAM")
        except ValueError as exc:
            errors.append(f"{key}: {exc}")
    if errors:
        return errors
    if sizes["NIFI_JVM_HEAP_INIT"] > sizes["NIFI_JVM_HEAP_MAX"]:
        errors.append("NIFI_JVM_HEAP_INIT must not exceed NIFI_JVM_HEAP_MAX")
    if sizes["NIFI_JVM_HEAP_MAX"] >= sizes["NIFI_DOCKER_RAM"]:
        errors.append(
            "NIFI_JVM_HEAP_MAX must be smaller than NIFI_DOCKER_RAM; "
            "leave memory for native allocations and Python processors"
        )
    return errors


def main() -> int:
    errors = resource_errors(os.environ)
    if errors:
        print("Invalid NiFi resource configuration:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print(
        f"NiFi resources valid: heap {os.environ['NIFI_JVM_HEAP_INIT']}–{os.environ['NIFI_JVM_HEAP_MAX']}, "
        f"container limit {os.environ['NIFI_DOCKER_RAM']}."
    )
    return 0


if __name__ == "__main__":
    sys.exit(main())
