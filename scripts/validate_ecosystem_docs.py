#!/usr/bin/env python3
"""Validate the bilingual third-party ecosystem documentation contract."""

from __future__ import annotations

import re
import sys
from pathlib import Path
from urllib.parse import unquote


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
DOCS_ROOT = REPOSITORY_ROOT / "docs"
LOCALES = ("en-US", "zh-CN")
REQUIRED_ECOSYSTEM_FILES = {
    "_category_.md",
    "index.md",
    "package-and-branding-standard.md",
    "multi-module-package-architecture.md",
    "creation-workflow.md",
    "quality-checklist.md",
    "publish-to-nuget.md",
    "licensing-and-commercial-use.md",
}
EXPECTED_TOP_LEVEL_POSITIONS = {
    "getting-started": 1,
    "concepts": 2,
    "modules": 3,
    "packages": 4,
    "ecosystem": 5,
    "scenarios": 6,
    "guides": 7,
}
REQUIRED_FRONTMATTER = {"title", "description", "sidebar_position"}
MARKDOWN_LINK = re.compile(r"!?\[[^\]]*]\(([^)]+)\)")


def read_frontmatter(path: Path, failures: list[str]) -> dict[str, str]:
    lines = path.read_text(encoding="utf-8").splitlines()
    if not lines or lines[0].strip() != "---":
        failures.append(f"{path.relative_to(REPOSITORY_ROOT)}: missing frontmatter")
        return {}

    try:
        closing_index = lines.index("---", 1)
    except ValueError:
        failures.append(f"{path.relative_to(REPOSITORY_ROOT)}: unclosed frontmatter")
        return {}

    metadata: dict[str, str] = {}
    for line in lines[1:closing_index]:
        if not line.strip() or line.lstrip().startswith("#"):
            continue
        if ":" not in line:
            failures.append(
                f"{path.relative_to(REPOSITORY_ROOT)}: invalid frontmatter line {line!r}"
            )
            continue
        key, value = line.split(":", 1)
        metadata[key.strip()] = value.strip().strip('"\'')

    missing = REQUIRED_FRONTMATTER - metadata.keys()
    if missing:
        failures.append(
            f"{path.relative_to(REPOSITORY_ROOT)}: missing {', '.join(sorted(missing))}"
        )

    return metadata


def validate_ecosystem_parity(failures: list[str]) -> list[Path]:
    locale_files: dict[str, set[str]] = {}
    checked_paths: list[Path] = []

    for locale in LOCALES:
        ecosystem_dir = DOCS_ROOT / locale / "ecosystem"
        names = {path.name for path in ecosystem_dir.glob("*.md")}
        locale_files[locale] = names
        checked_paths.extend(sorted(ecosystem_dir.glob("*.md")))

        missing = REQUIRED_ECOSYSTEM_FILES - names
        if missing:
            failures.append(f"{locale}/ecosystem: missing {', '.join(sorted(missing))}")

    if locale_files[LOCALES[0]] != locale_files[LOCALES[1]]:
        failures.append("The en-US and zh-CN ecosystem page sets do not match")

    return checked_paths


def validate_frontmatter(paths: list[Path], failures: list[str]) -> None:
    for path in paths:
        metadata = read_frontmatter(path, failures)
        position = metadata.get("sidebar_position")
        if position is not None and not position.isdigit():
            failures.append(
                f"{path.relative_to(REPOSITORY_ROOT)}: sidebar_position must be an integer"
            )


def validate_top_level_positions(failures: list[str]) -> list[Path]:
    category_paths: list[Path] = []

    for locale in LOCALES:
        actual_positions: dict[int, str] = {}
        for section, expected_position in EXPECTED_TOP_LEVEL_POSITIONS.items():
            category_path = DOCS_ROOT / locale / section / "_category_.md"
            category_paths.append(category_path)
            if not category_path.exists():
                failures.append(f"{category_path.relative_to(REPOSITORY_ROOT)}: missing")
                continue

            metadata = read_frontmatter(category_path, failures)
            raw_position = metadata.get("sidebar_position", "")
            if not raw_position.isdigit():
                continue

            position = int(raw_position)
            if position != expected_position:
                failures.append(
                    f"{category_path.relative_to(REPOSITORY_ROOT)}: expected "
                    f"sidebar_position {expected_position}, found {position}"
                )
            if position in actual_positions:
                failures.append(
                    f"{locale}: duplicate top-level sidebar_position {position} for "
                    f"{actual_positions[position]} and {section}"
                )
            actual_positions[position] = section

    return category_paths


def validate_local_links(paths: list[Path], failures: list[str]) -> None:
    for path in paths:
        content = path.read_text(encoding="utf-8")
        for match in MARKDOWN_LINK.finditer(content):
            destination = match.group(1).strip().strip("<>")
            if not destination or destination.startswith(("#", "/", "mailto:")):
                continue
            if re.match(r"^[a-zA-Z][a-zA-Z0-9+.-]*://", destination):
                continue

            relative_target = unquote(destination.split("#", 1)[0].split("?", 1)[0])
            target = (path.parent / relative_target).resolve()
            if target.is_dir():
                target = target / "index.md"
            if not target.exists():
                failures.append(
                    f"{path.relative_to(REPOSITORY_ROOT)}: broken local link {destination!r}"
                )


def main() -> int:
    failures: list[str] = []
    ecosystem_paths = validate_ecosystem_parity(failures)
    category_paths = validate_top_level_positions(failures)
    validate_frontmatter(ecosystem_paths, failures)

    link_paths = ecosystem_paths + [
        DOCS_ROOT / locale / relative_path
        for locale in LOCALES
        for relative_path in ("index.md", "modules/index.md", "packages/index.md")
    ]
    validate_local_links(link_paths, failures)

    if failures:
        print("Ecosystem documentation validation failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(
        f"Validated {len(ecosystem_paths)} bilingual ecosystem pages and "
        f"{len(category_paths)} top-level categories."
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
