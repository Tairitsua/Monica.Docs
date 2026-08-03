#!/usr/bin/env python3
"""Validate Monica.Docs release-version discovery and optional NuGet publication."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path
from urllib.parse import urlencode
from urllib.request import Request, urlopen


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
MONICA_ROOT = REPOSITORY_ROOT.parent / "MoLibrary"
MONICA_PROPS_PATH = MONICA_ROOT / "Directory.Build.props"
FRONTEND_SOURCE_ROOT = REPOSITORY_ROOT / "frontend" / "monica-docs-web" / "src"
DOCS_ROOT = REPOSITORY_ROOT / "docs"
MONICA_VERSION_TOKEN = "{{monica.version}}"
TEMPLATE_PACKAGE_ID = "Monica.Templates"
VERSION_ELEMENT = re.compile(r"<Version>([^<]+)</Version>")
SEMANTIC_VERSION = re.compile(
    r"^(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)
FRONTEND_RELEASE_LITERAL = re.compile(
    r"(?<![\w.])(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?(?![\w.])"
)
TEMPLATE_VERSION_LITERAL = re.compile(
    rf"{re.escape(TEMPLATE_PACKAGE_ID)}@"
    r"(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
)
GENERIC_RELEASE_BADGE = re.compile(r"\b\d+\.\d+\s+RC\b", re.IGNORECASE)
NUGET_SEARCH_URL = "https://azuresearch-usnc.nuget.org/query"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate Monica.Docs release-version discovery."
    )
    parser.add_argument(
        "--verify-published",
        action="store_true",
        help="Require the source version to be the latest listed Monica.Templates version on NuGet.org.",
    )
    return parser.parse_args()


def read_monica_version() -> str:
    if not MONICA_PROPS_PATH.is_file():
        raise ValueError(f"missing Monica version source: {MONICA_PROPS_PATH}")

    versions = [
        match.strip()
        for match in VERSION_ELEMENT.findall(
            MONICA_PROPS_PATH.read_text(encoding="utf-8")
        )
    ]
    if len(versions) != 1 or SEMANTIC_VERSION.fullmatch(versions[0]) is None:
        raise ValueError(
            f"expected exactly one semantic <Version> in {MONICA_PROPS_PATH}"
        )

    return versions[0]


def validate_managed_sources(failures: list[str]) -> None:
    for path in sorted(FRONTEND_SOURCE_ROOT.rglob("*")):
        if path.suffix not in {".ts", ".tsx"}:
            continue

        content = path.read_text(encoding="utf-8")
        relative_path = path.relative_to(REPOSITORY_ROOT)
        if FRONTEND_RELEASE_LITERAL.search(content):
            failures.append(f"{relative_path}: hardcoded semantic release version")
        if GENERIC_RELEASE_BADGE.search(content):
            failures.append(f"{relative_path}: hardcoded RC release badge")

    for path in sorted(DOCS_ROOT.rglob("*.md")):
        content = path.read_text(encoding="utf-8")
        if TEMPLATE_VERSION_LITERAL.search(content):
            failures.append(
                f"{path.relative_to(REPOSITORY_ROOT)}: template install must use "
                f"{MONICA_VERSION_TOKEN}"
            )


def verify_published(version: str) -> None:
    query = urlencode(
        {
            "q": f"packageid:{TEMPLATE_PACKAGE_ID}",
            "prerelease": "true",
            "semVerLevel": "2.0.0",
        }
    )
    request = Request(
        f"{NUGET_SEARCH_URL}?{query}",
        headers={"Accept": "application/json", "User-Agent": "Monica.Docs validation"},
    )
    with urlopen(request, timeout=15) as response:
        payload = json.load(response)

    packages = [
        package
        for package in payload.get("data", [])
        if str(package.get("id", "")).casefold() == TEMPLATE_PACKAGE_ID.casefold()
    ]
    latest_versions = {
        str(package.get("version", "")).casefold()
        for package in packages
    }
    if version.casefold() not in latest_versions:
        raise ValueError(
            f"{TEMPLATE_PACKAGE_ID} {version} is not the latest listed version on NuGet.org"
        )


def main() -> int:
    failures: list[str] = []
    try:
        version = read_monica_version()
        validate_managed_sources(failures)
        if parse_args().verify_published:
            verify_published(version)
    except (OSError, ValueError, json.JSONDecodeError) as exception:
        failures.append(str(exception))

    if failures:
        print("Release-version validation failed:", file=sys.stderr)
        for failure in failures:
            print(f"- {failure}", file=sys.stderr)
        return 1

    print(f"Validated Monica.Docs release version {version}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
