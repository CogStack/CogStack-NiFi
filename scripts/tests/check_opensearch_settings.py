#!/usr/bin/env python3
"""Validate shared OpenSearch credentials and image selections before startup."""

from __future__ import annotations

import os
import re
import sys
from collections.abc import Mapping


def setting_errors(values: Mapping[str, str]) -> list[str]:
    if values.get("ELASTICSEARCH_VERSION") == "elasticsearch":
        return []
    errors = []
    for key in ("ELASTIC_USER", "ELASTIC_PASSWORD", "KIBANA_USER", "KIBANA_PASSWORD"):
        if not values.get(key):
            errors.append(f"{key} must be set in the selected users_elasticsearch.env")
    salt = values.get("OPENSEARCH_COMPLIANCE_SALT", "")
    if len(salt) < 16 or not salt.isascii():
        errors.append("OPENSEARCH_COMPLIANCE_SALT must contain at least 16 ASCII characters")
    master_key = values.get("OPENSEARCH_DATASOURCE_MASTER_KEY", "")
    if len(master_key) not in (16, 24, 32) or not master_key.isascii():
        errors.append("OPENSEARCH_DATASOURCE_MASTER_KEY must contain 16, 24, or 32 ASCII characters")
    versions = []
    for key in ("ELASTICSEARCH_DOCKER_IMAGE", "ELASTICSEARCH_KIBANA_DOCKER_IMAGE"):
        match = re.search(r":(\d+\.\d+\.\d+)(?:@sha256:[0-9a-f]{64})?$", values.get(key, ""))
        if match:
            versions.append(match[1])
    if len(versions) == 2 and versions[0] != versions[1]:
        errors.append("OpenSearch and OpenSearch Dashboards image release versions must match")
    return errors


def main() -> int:
    errors = setting_errors(os.environ)
    if errors:
        print("Invalid OpenSearch deployment settings:", file=sys.stderr)
        for error in errors:
            print(f"- {error}", file=sys.stderr)
        return 1
    print("Search credentials, encryption settings, and image versions are valid.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
