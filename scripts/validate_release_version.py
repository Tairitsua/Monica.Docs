#!/usr/bin/env python3
"""Validate Monica.Docs release-version discovery and optional NuGet publication."""

from __future__ import annotations

import argparse
import hashlib
import io
import json
import os
import re
import sys
import zipfile
from datetime import datetime
from pathlib import Path
from typing import Callable
from urllib.parse import quote, urlencode
from urllib.request import Request, urlopen


REPOSITORY_ROOT = Path(__file__).resolve().parents[1]
MONICA_ROOT = REPOSITORY_ROOT.parent / "MoLibrary"
MONICA_PROPS_PATH = MONICA_ROOT / "Directory.Build.props"
MONICA_CATALOG_PATH = MONICA_ROOT / ".monica" / "agent-skill-catalog.json"
MONICA_GUIDE_PROMPTS_PATH = (
    MONICA_ROOT / "skills" / "monica-guide" / "assets" / "bootstrap-prompts.json"
)
FRONTEND_SOURCE_ROOT = REPOSITORY_ROOT / "frontend" / "monica-docs-web" / "src"
DOCS_ROOT = REPOSITORY_ROOT / "docs"
MONICA_VERSION_TOKEN = "{{monica.version}}"
MONICA_GUIDE_REF_TOKEN = "{{MONICA_IMMUTABLE_REF}}"
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
GITHUB_RELEASE_API = "https://api.github.com/repos/Tairitsua/Monica/releases/tags"
SKILL_DIGEST_ALGORITHM = "sha256-file-manifest-v1"
FILE_MANIFEST_SCOPE = "release-payload-except-index-v1"
RELEASE_INDEX_SCHEMA_VERSION = 2
RELEASE_MANIFEST_SCHEMA_VERSION = 2
DIGEST = re.compile(r"sha256:[0-9a-f]{64}")
IMMUTABLE_AGENT_SKILL_REF = re.compile(
    r"^(?:[0-9a-f]{40}|v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?)$"
)
MONICA_RELEASE_TAG = re.compile(
    r"^v(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)\.(?:0|[1-9]\d*)"
    r"(?:-[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?"
    r"(?:\+[0-9A-Za-z-]+(?:\.[0-9A-Za-z-]+)*)?$"
)
PROMPT_TARGETS = ("codex", "claude", "generic")
PROMPT_LOCALES = ("en-US", "zh-CN")
PROMPT_AGENT_FLAGS = {
    "codex": ("--agent codex",),
    "claude": ("--agent claude-code",),
    "generic": ("--agent codex", "--agent claude-code"),
}


def sha256_digest(content: bytes) -> str:
    return f"sha256:{hashlib.sha256(content).hexdigest()}"


def parse_json_object(content: bytes, label: str) -> dict[str, object]:
    try:
        payload = json.loads(content.decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as exception:
        raise ValueError(f"{label} is not valid UTF-8 JSON: {exception}") from exception
    if not isinstance(payload, dict):
        raise ValueError(f"{label} must contain a JSON object")
    return payload


def configured_contract_path(environment_name: str, default: Path) -> Path:
    configured = os.environ.get(environment_name, "").strip()
    return Path(configured).resolve() if configured else default


def read_skills_cli(catalog: dict[str, object], label: str) -> tuple[str, str]:
    distribution = catalog.get("distribution")
    skills_cli = distribution.get("skillsCli") if isinstance(distribution, dict) else None
    package = skills_cli.get("package") if isinstance(skills_cli, dict) else None
    version = skills_cli.get("version") if isinstance(skills_cli, dict) else None
    if (
        not isinstance(package, str)
        or not package.strip()
        or not isinstance(version, str)
        or SEMANTIC_VERSION.fullmatch(version) is None
    ):
        raise ValueError(f"{label} has no valid distribution.skillsCli pin")
    return package, version


def file_manifest_digest(files: dict[str, bytes]) -> str:
    manifest = "".join(
        f"{hashlib.sha256(content).hexdigest()}  {relative_path}\n"
        for relative_path, content in sorted(files.items())
    )
    return sha256_digest(manifest.encode("utf-8"))


def read_per_skill_release_metadata(
    payload: dict[str, object],
    label: str,
    release_tags: set[str],
) -> tuple[dict[str, str], dict[str, int], dict[str, str]]:
    skill_digests = payload.get("skillDigests")
    if (
        not isinstance(skill_digests, dict)
        or not skill_digests
        or any(
            not isinstance(name, str)
            or not isinstance(digest, str)
            or DIGEST.fullmatch(digest) is None
            for name, digest in skill_digests.items()
        )
    ):
        raise ValueError(f"{label} has invalid per-skill digest metadata")

    skill_names = set(skill_digests)
    skill_revisions = payload.get("skillRevisions")
    if (
        not isinstance(skill_revisions, dict)
        or set(skill_revisions) != skill_names
        or any(
            type(revision) is not int or revision < 1
            for revision in skill_revisions.values()
        )
    ):
        raise ValueError(f"{label} has invalid per-skill revision metadata")

    skill_last_changed_in = payload.get("skillLastChangedIn")
    if (
        not isinstance(skill_last_changed_in, dict)
        or set(skill_last_changed_in) != skill_names
        or any(
            not isinstance(changed_tag, str)
            or MONICA_RELEASE_TAG.fullmatch(changed_tag) is None
            or changed_tag not in release_tags
            for changed_tag in skill_last_changed_in.values()
        )
    ):
        raise ValueError(f"{label} has invalid per-skill last-changed metadata")

    return skill_digests, skill_revisions, skill_last_changed_in


def read_published_at(value: object, label: str) -> datetime:
    if not isinstance(value, str):
        raise ValueError(f"{label} has no valid publishedAt timestamp")
    normalized = f"{value[:-1]}+00:00" if value.endswith("Z") else value
    try:
        published_at = datetime.fromisoformat(normalized)
    except ValueError as exception:
        raise ValueError(f"{label} has no valid publishedAt timestamp") from exception
    if published_at.tzinfo is None or published_at.utcoffset() is None:
        raise ValueError(f"{label} publishedAt timestamp must include a UTC offset")
    return published_at


def validate_skill_revision_history(releases: dict[str, object]) -> None:
    release_tags = set(releases)
    chronology: list[
        tuple[datetime, str, dict[str, str], dict[str, int], dict[str, str]]
    ] = []
    for release_tag, release in releases.items():
        label = f"agent-skill-index release {release_tag}"
        if (
            MONICA_RELEASE_TAG.fullmatch(release_tag) is None
            or not isinstance(release, dict)
            or release.get("tag") != release_tag
        ):
            raise ValueError(f"{label} has invalid release identity metadata")
        skill_digests, skill_revisions, skill_last_changed_in = (
            read_per_skill_release_metadata(release, label, release_tags)
        )
        chronology.append(
            (
                read_published_at(release.get("publishedAt"), label),
                release_tag,
                skill_digests,
                skill_revisions,
                skill_last_changed_in,
            )
        )

    chronology.sort(key=lambda entry: entry[0])
    if any(
        previous[0] >= current[0]
        for previous, current in zip(chronology, chronology[1:])
    ):
        raise ValueError(
            "agent-skill-index releases must have a strict publishedAt chronology"
        )

    previous_skills: dict[str, tuple[str, int, str]] = {}
    seen_skill_names: set[str] = set()
    for _, release_tag, digests, revisions, last_changed_in in chronology:
        reintroduced_skills = set(digests) & (seen_skill_names - set(previous_skills))
        if reintroduced_skills:
            raise ValueError(
                f"agent-skill-index {release_tag} must not reintroduce retired skill "
                f"{sorted(reintroduced_skills)[0]}"
            )

        current_skills: dict[str, tuple[str, int, str]] = {}
        for skill_name, digest in digests.items():
            revision = revisions[skill_name]
            changed_in = last_changed_in[skill_name]
            previous = previous_skills.get(skill_name)
            if previous is None:
                if revision != 1 or changed_in != release_tag:
                    raise ValueError(
                        f"agent-skill-index {release_tag} must introduce {skill_name} "
                        "at revision 1 with itself as the change origin"
                    )
            elif digest == previous[0]:
                if revision != previous[1] or changed_in != previous[2]:
                    raise ValueError(
                        f"agent-skill-index {release_tag} must preserve the revision and "
                        f"change origin for unchanged skill {skill_name}"
                    )
            elif revision != previous[1] + 1 or changed_in != release_tag:
                raise ValueError(
                    f"agent-skill-index {release_tag} must advance changed skill "
                    f"{skill_name} by one revision with itself as the change origin"
                )
            current_skills[skill_name] = (digest, revision, changed_in)
        seen_skill_names.update(current_skills)
        previous_skills = current_skills


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Validate Monica.Docs release-version discovery."
    )
    parser.add_argument(
        "--verify-published",
        action="store_true",
        help="Require the source version to be the latest listed Monica.Templates version on NuGet.org.",
    )
    parser.add_argument(
        "--agent-skill-ref",
        default=os.environ.get("MONICA_AGENT_SKILL_REF", ""),
        help="Immutable Monica tag or full commit SHA rendered into public Guide prompts.",
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
        if "npx --yes skills@" in content or "github.com/Tairitsua/Monica/tree/" in content:
            failures.append(
                f"{relative_path}: bootstrap prompts must come from the canonical Monica Guide asset"
            )

    for path in sorted(DOCS_ROOT.rglob("*.md")):
        content = path.read_text(encoding="utf-8")
        if TEMPLATE_VERSION_LITERAL.search(content):
            failures.append(
                f"{path.relative_to(REPOSITORY_ROOT)}: template install must use "
                f"{MONICA_VERSION_TOKEN}"
            )


def validate_guide_prompts(agent_skill_ref: str, require_ref: bool, failures: list[str]) -> None:
    prompt_path = configured_contract_path(
        "MONICA_GUIDE_PROMPTS_PATH", MONICA_GUIDE_PROMPTS_PATH
    )
    catalog_path = configured_contract_path(
        "MONICA_AGENT_SKILL_CATALOG_PATH", MONICA_CATALOG_PATH
    )
    missing_paths = [path for path in (prompt_path, catalog_path) if not path.is_file()]
    if missing_paths:
        failures.extend(f"missing Monica Guide contract source: {path}" for path in missing_paths)
        return

    try:
        payload = parse_json_object(prompt_path.read_bytes(), str(prompt_path))
        catalog = parse_json_object(catalog_path.read_bytes(), str(catalog_path))
        cli_package, cli_version = read_skills_cli(catalog, str(catalog_path))
    except (OSError, ValueError) as exception:
        failures.append(str(exception))
        return

    prompt_asset = catalog.get("prompts")
    prompt_asset = (
        prompt_asset.get("bootstrapAsset") if isinstance(prompt_asset, dict) else None
    )
    guide_entry = catalog.get("skills")
    guide_entry = guide_entry.get("monica-guide") if isinstance(guide_entry, dict) else None
    if (
        prompt_asset != "skills/monica-guide/assets/bootstrap-prompts.json"
        or not isinstance(guide_entry, dict)
        or guide_entry.get("path") != "skills/monica-guide"
    ):
        failures.append(f"unexpected Monica Guide catalog contract in {catalog_path}")
        return

    if (
        payload.get("schemaVersion") != 1
        or payload.get("repository") != "Tairitsua/Monica"
        or payload.get("skill") != "monica-guide"
        or payload.get("immutableRef") != MONICA_GUIDE_REF_TOKEN
    ):
        failures.append(f"unexpected Monica Guide prompt contract in {prompt_path}")
        return

    locales = payload.get("locales")
    if not isinstance(locales, dict):
        failures.append(f"missing Monica Guide prompt locales in {prompt_path}")
        return
    cli_reference = f"npx --yes {cli_package}@{cli_version}"
    for locale in PROMPT_LOCALES:
        localized = locales.get(locale)
        if not isinstance(localized, dict):
            failures.append(f"missing Monica Guide {locale} prompts in {prompt_path}")
            continue
        for target in PROMPT_TARGETS:
            prompt = localized.get(target)
            if (
                not isinstance(prompt, str)
                or not prompt.strip()
                or MONICA_GUIDE_REF_TOKEN not in prompt
                or f"--release-tag {MONICA_GUIDE_REF_TOKEN}" not in prompt
                or cli_reference not in prompt
                or f"{cli_package}@latest" in prompt
                or any(flag not in prompt for flag in PROMPT_AGENT_FLAGS[target])
            ):
                failures.append(f"invalid Monica Guide {locale}.{target} prompt in {prompt_path}")

    normalized_ref = agent_skill_ref.strip()
    if require_ref and not normalized_ref:
        failures.append("--agent-skill-ref is required with --verify-published")
    if require_ref and normalized_ref and MONICA_RELEASE_TAG.fullmatch(normalized_ref) is None:
        failures.append(
            "public website validation requires a v<semver> Monica tag that passed install smoke testing"
        )
    if normalized_ref and IMMUTABLE_AGENT_SKILL_REF.fullmatch(normalized_ref) is None:
        failures.append(
            "agent skill ref must be a full commit SHA or immutable Monica release tag"
        )


def validate_advertised_tag(version: str, tag: str) -> None:
    expected_tag = f"v{version}"
    if tag != expected_tag:
        raise ValueError(
            f"advertised Monica Agent Skill tag must equal {expected_tag}, received {tag or '<empty>'}"
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


def fetch_url_bytes(url: str) -> bytes:
    is_github_api = url.startswith("https://api.github.com/")
    headers = {
        "Accept": (
            "application/vnd.github+json" if is_github_api else "application/octet-stream"
        ),
        "User-Agent": "Monica.Docs release validation",
    }
    if is_github_api:
        headers["X-GitHub-Api-Version"] = "2022-11-28"
    request = Request(
        url,
        headers=headers,
    )
    with urlopen(request, timeout=15) as response:
        return response.read()


def verify_agent_skill_release(
    tag: str,
    *,
    expected_version: str,
    local_prompt_path: Path | None = None,
    fetch_bytes: Callable[[str], bytes] = fetch_url_bytes,
) -> None:
    validate_advertised_tag(expected_version, tag)
    release_url = f"{GITHUB_RELEASE_API}/{quote(tag, safe='')}"
    release = parse_json_object(fetch_bytes(release_url), f"GitHub release metadata for {tag}")
    if release.get("tag_name") != tag or release.get("draft") is not False:
        raise ValueError(f"GitHub release metadata does not describe published tag {tag}")

    assets_payload = release.get("assets")
    if not isinstance(assets_payload, list):
        raise ValueError(f"GitHub release {tag} has no asset list")
    assets = {
        asset.get("name"): asset.get("browser_download_url")
        for asset in assets_payload
        if isinstance(asset, dict)
        and isinstance(asset.get("name"), str)
        and isinstance(asset.get("browser_download_url"), str)
    }
    archive_name = f"monica-agent-skills-{tag}.zip"
    required_assets = {
        "agent-skill-catalog.json",
        "agent-skill-index.json",
        "agent-skill-manifest.json",
        archive_name,
    }
    missing_assets = required_assets - assets.keys()
    if missing_assets:
        raise ValueError(
            f"GitHub release {tag} is missing {', '.join(sorted(missing_assets))}"
        )

    catalog_bytes = fetch_bytes(str(assets["agent-skill-catalog.json"]))
    index_bytes = fetch_bytes(str(assets["agent-skill-index.json"]))
    manifest_bytes = fetch_bytes(str(assets["agent-skill-manifest.json"]))
    archive_bytes = fetch_bytes(str(assets[archive_name]))
    catalog = parse_json_object(catalog_bytes, f"GitHub release {tag} catalog")
    index = parse_json_object(index_bytes, f"GitHub release {tag} index")
    manifest = parse_json_object(manifest_bytes, f"GitHub release {tag} manifest")
    read_skills_cli(catalog, f"GitHub release {tag} catalog")

    version = expected_version
    version_without_build_metadata = version.split("+", 1)[0]
    channel = "preview" if "-" in version_without_build_metadata else "stable"
    asset_base_url = f"https://github.com/Tairitsua/Monica/releases/download/{tag}"
    releases = index.get("releases")
    indexed_release = releases.get(tag) if isinstance(releases, dict) else None
    versions = index.get("versions")
    channels = index.get("channels")
    if (
        index.get("schemaVersion") != RELEASE_INDEX_SCHEMA_VERSION
        or not isinstance(indexed_release, dict)
        or indexed_release.get("tag") != tag
        or indexed_release.get("monicaVersion") != version
        or not isinstance(indexed_release.get("commit"), str)
        or re.fullmatch(r"[0-9a-f]{40}", str(indexed_release.get("commit"))) is None
        or indexed_release.get("assetBaseUrl") != asset_base_url
        or indexed_release.get("catalogUrl") != f"{asset_base_url}/agent-skill-catalog.json"
        or indexed_release.get("manifestUrl") != f"{asset_base_url}/agent-skill-manifest.json"
        or not isinstance(versions, dict)
        or versions.get(version) != tag
        or not isinstance(channels, dict)
        or channels.get(channel) != tag
    ):
        raise ValueError(f"GitHub release {tag} has inconsistent agent-skill-index metadata")

    resolved_commit = manifest.get("resolvedCommit")
    expected_urls = {
        "indexUrl": f"{asset_base_url}/agent-skill-index.json",
        "catalogUrl": f"{asset_base_url}/agent-skill-catalog.json",
        "archiveUrl": f"{asset_base_url}/{archive_name}",
    }
    if (
        manifest.get("schemaVersion") != RELEASE_MANIFEST_SCHEMA_VERSION
        or manifest.get("tag") != tag
        or manifest.get("monicaVersion") != version
        or not isinstance(resolved_commit, str)
        or re.fullmatch(r"[0-9a-f]{40}", resolved_commit) is None
        or indexed_release.get("commit") != resolved_commit
        or release.get("target_commitish") != resolved_commit
        or any(manifest.get(key) != value for key, value in expected_urls.items())
    ):
        raise ValueError(f"GitHub release {tag} has inconsistent agent-skill-manifest metadata")

    shared_fields = (
        "catalogDigest",
        "skillTreeDigest",
        "skillDigestAlgorithm",
        "skillDigests",
        "skillRevisions",
        "skillLastChangedIn",
        "publishedAt",
    )
    if any(manifest.get(field) != indexed_release.get(field) for field in shared_fields):
        raise ValueError(
            f"GitHub release {tag} manifest and index disagree on per-skill release metadata"
        )
    if manifest.get("skillDigestAlgorithm") != SKILL_DIGEST_ALGORITHM:
        raise ValueError(f"GitHub release {tag} uses an unsupported skill digest algorithm")

    release_tags = set(releases) if isinstance(releases, dict) else set()
    skill_digests, _, _ = read_per_skill_release_metadata(
        manifest,
        f"GitHub release {tag} manifest",
        release_tags,
    )
    if not isinstance(releases, dict):
        raise ValueError(f"GitHub release {tag} index has no release history")
    validate_skill_revision_history(releases)

    catalog_digest = sha256_digest(catalog_bytes)
    manifest_digest = sha256_digest(manifest_bytes)
    if (
        indexed_release.get("catalogDigest") != catalog_digest
        or manifest.get("catalogDigest") != catalog_digest
    ):
        raise ValueError(f"GitHub release {tag} catalog bytes do not match catalogDigest")
    if indexed_release.get("manifestDigest") != manifest_digest:
        raise ValueError(f"GitHub release {tag} manifest bytes do not match manifestDigest")

    if manifest.get("fileManifestScope") != FILE_MANIFEST_SCOPE:
        raise ValueError(f"GitHub release {tag} has an unsupported file-manifest scope")
    files = manifest.get("files")
    if (
        not isinstance(files, dict)
        or not files
        or any(
            not isinstance(path, str)
            or not path
            or not isinstance(digest, str)
            or DIGEST.fullmatch(digest) is None
            for path, digest in files.items()
        )
    ):
        raise ValueError(f"GitHub release {tag} manifest has no file hashes")
    if ".monica/agent-skill-index.json" in files:
        raise ValueError(
            f"GitHub release {tag} manifest scope must exclude .monica/agent-skill-index.json"
        )
    if files.get(".monica/agent-skill-catalog.json") != catalog_digest:
        raise ValueError(f"GitHub release {tag} manifest does not bind the catalog bytes")

    try:
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
            archive_paths = [name for name in archive.namelist() if not name.endswith("/")]
            if len(archive_paths) != len(set(archive_paths)):
                raise ValueError(f"GitHub release {tag} archive contains duplicate paths")
            expected_paths = set(files) | {".monica/agent-skill-index.json"}
            if set(archive_paths) != expected_paths:
                raise ValueError(
                    f"GitHub release {tag} archive does not match the declared file-manifest scope"
                )
            archived_files = {path: archive.read(path) for path in archive_paths}
    except zipfile.BadZipFile as exception:
        raise ValueError(f"GitHub release {tag} skill archive is invalid") from exception

    if archived_files[".monica/agent-skill-catalog.json"] != catalog_bytes:
        raise ValueError(f"GitHub release {tag} archived and top-level catalogs differ")
    if archived_files[".monica/agent-skill-index.json"] != index_bytes:
        raise ValueError(f"GitHub release {tag} archived and top-level indexes differ")
    for path, expected_digest in files.items():
        if sha256_digest(archived_files[path]) != expected_digest:
            raise ValueError(f"GitHub release {tag} archive file digest mismatch: {path}")

    skills = catalog.get("skills")
    if not isinstance(skills, dict):
        raise ValueError(f"GitHub release {tag} catalog has no skills contract")
    managed_skills = {
        name: entry
        for name, entry in skills.items()
        if isinstance(name, str)
        and isinstance(entry, dict)
        and entry.get("ownership") == "monica"
        and entry.get("managed") is True
    }
    if not managed_skills or set(managed_skills) != set(skill_digests):
        raise ValueError(f"GitHub release {tag} catalog and per-skill digests disagree")

    managed_tree_files: dict[str, bytes] = {}
    released_skill_files: dict[str, dict[str, bytes]] = {}
    for skill_name, entry in managed_skills.items():
        skill_root = entry.get("path")
        if not isinstance(skill_root, str) or skill_root != f"skills/{skill_name}":
            raise ValueError(f"GitHub release {tag} has an invalid path for {skill_name}")
        skill_prefix = f"{skill_root}/"
        current_files = {
            path.removeprefix(skill_prefix): content
            for path, content in archived_files.items()
            if path.startswith(skill_prefix)
        }
        if "SKILL.md" not in current_files:
            raise ValueError(f"GitHub release {tag} contains no complete {skill_name} tree")
        if file_manifest_digest(current_files) != skill_digests[skill_name]:
            raise ValueError(f"GitHub release {tag} {skill_name} digest does not match its files")
        released_skill_files[skill_name] = current_files
        managed_tree_files.update(
            {f"{skill_root}/{path}": content for path, content in current_files.items()}
        )
    if file_manifest_digest(managed_tree_files) != manifest.get("skillTreeDigest"):
        raise ValueError(f"GitHub release {tag} skill-tree digest does not match its files")

    guide_files = released_skill_files.get("monica-guide")
    if guide_files is None:
        raise ValueError(f"GitHub release {tag} catalog does not manage monica-guide")
    guide_prefix = "skills/monica-guide/"

    prompts = catalog.get("prompts")
    bootstrap_asset = prompts.get("bootstrapAsset") if isinstance(prompts, dict) else None
    if (
        bootstrap_asset != "skills/monica-guide/assets/bootstrap-prompts.json"
        or bootstrap_asset not in files
        or bootstrap_asset.removeprefix(guide_prefix) not in guide_files
    ):
        raise ValueError(f"GitHub release {tag} catalog has no released bootstrap prompt asset")
    prompt_path = local_prompt_path or configured_contract_path(
        "MONICA_GUIDE_PROMPTS_PATH", MONICA_GUIDE_PROMPTS_PATH
    )
    local_prompt_bytes = prompt_path.read_bytes()
    expected_prompt_digest = files[bootstrap_asset]
    if sha256_digest(local_prompt_bytes) != expected_prompt_digest:
        raise ValueError(
            f"local canonical bootstrap prompt bytes do not match GitHub release {tag}"
        )
    if archived_files[bootstrap_asset] != local_prompt_bytes:
        raise ValueError(
            f"released bootstrap prompt bytes differ from the local canonical asset for {tag}"
        )


def main() -> int:
    arguments = parse_args()
    failures: list[str] = []
    try:
        version = read_monica_version()
        validate_managed_sources(failures)
        validate_guide_prompts(
            arguments.agent_skill_ref,
            require_ref=arguments.verify_published,
            failures=failures,
        )
        if arguments.verify_published:
            advertised_tag = arguments.agent_skill_ref.strip()
            validate_advertised_tag(version, advertised_tag)
            verify_published(version)
            verify_agent_skill_release(
                advertised_tag,
                expected_version=version,
            )
    except (OSError, ValueError) as exception:
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
