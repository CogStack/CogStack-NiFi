#!/usr/bin/env python3
"""Validate local Markdown and MyST links in docs and README."""

from __future__ import annotations

import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
DOCS_DIR = ROOT / "docs"

SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")
MARKDOWN_LINK_RE = re.compile(r"!?\[[^\]]*\]\(([^)]+)\)")
INCLUDE_DIRECTIVE_RE = re.compile(r"^\s*```{include}\s+(.+?)\s*$")
TOCTREE_START_RE = re.compile(r"^\s*```{toctree}\s*$")


def markdown_files() -> list[Path]:
    files = [ROOT / "README.md"]
    files.extend(sorted(DOCS_DIR.rglob("*.md")))
    return files


def normalize_target(raw_target: str) -> str:
    target = raw_target.strip()
    if target.startswith("<") and target.endswith(">"):
        target = target[1:-1].strip()
    if " " in target and not SCHEME_RE.match(target):
        # Keep path, drop optional title for standard Markdown links.
        target = target.split(" ", 1)[0]
    return target


def is_external(target: str) -> bool:
    return target.startswith("#") or bool(SCHEME_RE.match(target))


def resolve_target(source_file: Path, target: str) -> Path:
    clean_target = target.split("#", 1)[0].split("?", 1)[0]
    if clean_target.startswith("/"):
        return ROOT / clean_target.lstrip("/")
    return (source_file.parent / clean_target).resolve()


def check_local_target(
    source_file: Path,
    target: str,
    line_no: int,
    errors: list[str],
    context: str,
) -> None:
    normalized = normalize_target(target)
    if not normalized or is_external(normalized):
        return

    resolved = resolve_target(source_file, normalized)
    if not resolved.exists():
        relative_source = source_file.relative_to(ROOT)
        errors.append(
            f"{relative_source}:{line_no} broken {context}: {normalized}"
        )


def check_markdown_links(source_file: Path, errors: list[str]) -> None:
    lines = source_file.read_text(encoding="utf-8").splitlines()
    in_fence = False

    for line_no, line in enumerate(lines, start=1):
        stripped = line.lstrip()
        if stripped.startswith("```"):
            in_fence = not in_fence
            continue
        if in_fence:
            continue

        for match in MARKDOWN_LINK_RE.finditer(line):
            check_local_target(source_file, match.group(1), line_no, errors, "link")


def check_myst_directives(source_file: Path, errors: list[str]) -> None:
    lines = source_file.read_text(encoding="utf-8").splitlines()
    in_toctree = False

    for line_no, line in enumerate(lines, start=1):
        include_match = INCLUDE_DIRECTIVE_RE.match(line)
        if include_match:
            check_local_target(
                source_file,
                include_match.group(1),
                line_no,
                errors,
                "include",
            )

        if TOCTREE_START_RE.match(line):
            in_toctree = True
            continue

        if not in_toctree:
            continue

        stripped = line.strip()
        if stripped == "```":
            in_toctree = False
            continue
        if not stripped or stripped.startswith(":"):
            continue

        if is_external(stripped):
            continue

        candidates: list[str]
        if Path(stripped).suffix:
            candidates = [stripped]
        else:
            candidates = [f"{stripped}.md", f"{stripped}.rst"]

        found = False
        for candidate in candidates:
            resolved = resolve_target(source_file, candidate)
            if resolved.exists():
                found = True
                break

        if not found:
            relative_source = source_file.relative_to(ROOT)
            errors.append(
                f"{relative_source}:{line_no} broken toctree entry: {stripped}"
            )


def main() -> int:
    errors: list[str] = []
    for md_file in markdown_files():
        check_markdown_links(md_file, errors)
        check_myst_directives(md_file, errors)

    if errors:
        print("Documentation link check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Documentation link check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
