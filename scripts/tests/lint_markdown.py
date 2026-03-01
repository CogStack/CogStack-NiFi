#!/usr/bin/env python3
"""Run lightweight Markdown lint checks for docs and README."""

from __future__ import annotations

import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = ROOT / "docs"


def markdown_files() -> list[Path]:
    files = [ROOT / "README.md"]
    files.extend(sorted(DOCS_DIR.rglob("*.md")))
    return files


def lint_file(path: Path) -> list[str]:
    errors: list[str] = []
    text = path.read_text(encoding="utf-8")
    lines = text.splitlines()
    relative = path.relative_to(ROOT)

    if text and not text.endswith("\n"):
        errors.append(f"{relative}: file must end with a newline")

    for line_no, line in enumerate(lines, start=1):
        if "\t" in line:
            errors.append(f"{relative}:{line_no} tab character found")

    in_fence = False
    fence_start_line = 0
    for line_no, line in enumerate(lines, start=1):
        if line.lstrip().startswith("```"):
            if not in_fence:
                in_fence = True
                fence_start_line = line_no
            else:
                in_fence = False

    if in_fence:
        errors.append(
            f"{relative}:{fence_start_line} unclosed fenced code block"
        )

    return errors


def main() -> int:
    errors: list[str] = []
    for md_file in markdown_files():
        errors.extend(lint_file(md_file))

    if errors:
        print("Markdown lint failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Markdown lint passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
