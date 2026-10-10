from __future__ import annotations

import hashlib
import importlib.util
import io
import json
import os
import tempfile
import unittest
import zipfile
from pathlib import Path, PurePosixPath
from typing import Callable


SCRIPT_PATH = Path(__file__).resolve().parents[2] / "scripts" / "validate_release_version.py"
SPEC = importlib.util.spec_from_file_location("validate_release_version", SCRIPT_PATH)
assert SPEC is not None and SPEC.loader is not None
VALIDATOR = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(VALIDATOR)


class AgentSkillReleaseValidationTests(unittest.TestCase):
    TAG = "v1.2.3-rc.1"
    COMMIT = "a" * 40
    PROMPT_BYTES = b'{"canonical":true}\n'

    def setUp(self) -> None:
        self.temporary_directory = tempfile.TemporaryDirectory()
        self.local_prompt_path = Path(self.temporary_directory.name) / "bootstrap-prompts.json"
        self.local_prompt_path.write_bytes(self.PROMPT_BYTES)

    def tearDown(self) -> None:
        self.temporary_directory.cleanup()

    def test_accepts_self_consistent_release_assets(self) -> None:
        fixture = self._fixture()

        self._verify(fixture)

    def test_skill_tree_digest_uses_posix_utf8_order_for_prefix_colliding_skills(
        self,
    ) -> None:
        fixture = self._fixture(
            additional_skills={
                "monica-application": {
                    "SKILL.md": b"---\nname: monica-application\n---\n",
                },
                "monica-application-microservice": {
                    "SKILL.md": b"---\nname: monica-application-microservice\n---\n",
                },
            }
        )
        skill_tree_files = {
            path: content
            for path, content in fixture["archive_files"].items()
            if path.startswith("skills/")
        }
        canonical_paths = sorted(skill_tree_files, key=lambda path: path.encode("utf-8"))
        collision_paths = [
            path
            for path in canonical_paths
            if path.startswith("skills/monica-application")
        ]
        self.assertEqual(
            [
                "skills/monica-application-microservice/SKILL.md",
                "skills/monica-application/SKILL.md",
            ],
            collision_paths,
        )

        def digest(paths: list[str]) -> str:
            manifest = "".join(
                f"{hashlib.sha256(skill_tree_files[path]).hexdigest()}  {path}\n"
                for path in paths
            )
            return VALIDATOR.sha256_digest(manifest.encode("utf-8"))

        canonical_digest = digest(canonical_paths)
        component_order_digest = digest(
            sorted(skill_tree_files, key=lambda path: PurePosixPath(path).parts)
        )
        manifest = self._json(fixture, "manifest")
        self.assertEqual(canonical_digest, manifest["skillTreeDigest"])
        self.assertNotEqual(component_order_digest, canonical_digest)

        self._verify(fixture)

    def test_build_metadata_hyphen_does_not_make_a_stable_tag_preview(self) -> None:
        fixture = self._fixture("v1.2.3+build-7")

        self._verify(fixture)

    def test_requires_advertised_tag_to_match_framework_version(self) -> None:
        with self.assertRaisesRegex(ValueError, "must equal v1.2.3"):
            VALIDATOR.validate_advertised_tag("1.2.3", "v1.2.4")

    def test_requires_release_index_schema_version_two(self) -> None:
        fixture = self._fixture()
        index = self._json(fixture, "index")
        index["schemaVersion"] = 1
        index_bytes = self._json_bytes(index)
        fixture["payloads"][fixture["urls"]["index"]] = index_bytes
        fixture["archive_files"][".monica/agent-skill-index.json"] = index_bytes
        self._refresh_archive(fixture)

        with self.assertRaisesRegex(ValueError, "inconsistent agent-skill-index metadata"):
            self._verify(fixture)

    def test_requires_release_manifest_schema_version_two(self) -> None:
        fixture = self._fixture()
        self._update_manifest(
            fixture,
            lambda manifest: manifest.__setitem__("schemaVersion", 1),
        )

        with self.assertRaisesRegex(ValueError, "inconsistent agent-skill-manifest metadata"):
            self._verify(fixture)

    def test_requires_release_payload_except_index_scope(self) -> None:
        fixture = self._fixture()
        self._update_manifest(
            fixture,
            lambda manifest: manifest.__setitem__("fileManifestScope", "all-files-v1"),
        )

        with self.assertRaisesRegex(ValueError, "unsupported file-manifest scope"):
            self._verify(fixture)

    def test_manifest_scope_must_exclude_materialized_index(self) -> None:
        fixture = self._fixture()
        manifest = self._json(fixture, "manifest")
        self.assertNotIn(".monica/agent-skill-index.json", manifest["files"])

        def include_index(payload: dict[str, object]) -> None:
            files = payload["files"]
            assert isinstance(files, dict)
            files[".monica/agent-skill-index.json"] = VALIDATOR.sha256_digest(b"invalid")

        self._update_manifest(fixture, include_index)
        with self.assertRaisesRegex(ValueError, "scope must exclude"):
            self._verify(fixture)

    def test_rejects_release_without_index_asset(self) -> None:
        fixture = self._fixture()
        release = self._json(fixture, "release")
        release["assets"] = [
            asset
            for asset in release["assets"]
            if asset["name"] != "agent-skill-index.json"
        ]
        fixture["payloads"][fixture["urls"]["release"]] = self._json_bytes(release)

        with self.assertRaisesRegex(ValueError, "missing agent-skill-index.json"):
            self._verify(fixture)

    def test_rejects_release_without_guide_sums_asset(self) -> None:
        fixture = self._fixture()
        release = self._json(fixture, "release")
        release["assets"] = [
            asset
            for asset in release["assets"]
            if asset["name"] != "SHA256SUMS"
        ]
        fixture["payloads"][fixture["urls"]["release"]] = self._json_bytes(release)

        with self.assertRaisesRegex(ValueError, "is missing SHA256SUMS"):
            self._verify(fixture)

    def test_rejects_release_without_one_platform_guide_bundle(self) -> None:
        fixture = self._fixture()
        release = self._json(fixture, "release")
        removed = "monica-guide-v1.2.3-rc.1-osx-arm64.zip"
        release["assets"] = [
            asset for asset in release["assets"] if asset["name"] != removed
        ]
        fixture["payloads"][fixture["urls"]["release"]] = self._json_bytes(release)

        with self.assertRaisesRegex(ValueError, f"is missing .*{removed}"):
            self._verify(fixture)

    def test_rejects_guide_archive_that_drifts_from_sums(self) -> None:
        fixture = self._fixture()
        url = fixture["urls"]["guide-linux-x64"]
        fixture["payloads"][url] += b"drift"

        with self.assertRaisesRegex(ValueError, "archive digest mismatch"):
            self._verify(fixture)

    def test_rejects_sums_that_skip_a_published_archive(self) -> None:
        fixture = self._fixture()
        url = fixture["urls"]["sums"]
        fixture["payloads"][url] = "".join(
            line
            for line in fixture["payloads"][url].decode("utf-8").splitlines(keepends=True)
            if "win-x64.zip" not in line
        ).encode("utf-8")

        with self.assertRaisesRegex(ValueError, "does not cover exactly the published archives"):
            self._verify(fixture)

    def test_rejects_guide_bundle_with_inconsistent_rid(self) -> None:
        fixture = self._fixture()

        def mislabel(manifest: dict[str, object]) -> None:
            manifest["runtimeIdentifier"] = "linux-arm64"

        self._write_guide_bundle(
            fixture,
            str(fixture["tag"]),
            str(fixture["version"]),
            "linux-x64",
            manifest_updates=mislabel,
        )
        self._refresh_sums(fixture)

        with self.assertRaisesRegex(ValueError, "inconsistent release manifest"):
            self._verify(fixture)

    def test_rejects_non_executable_unix_guide_entry(self) -> None:
        fixture = self._fixture()
        self._write_guide_bundle(
            fixture,
            str(fixture["tag"]),
            str(fixture["version"]),
            "linux-x64",
            entry_mode=0o644,
        )
        self._refresh_sums(fixture)

        with self.assertRaisesRegex(ValueError, "entry point is not executable"):
            self._verify(fixture)

    def test_rejects_tampered_guide_bundle_payload_file(self) -> None:
        fixture = self._fixture()
        self._write_guide_bundle(
            fixture,
            str(fixture["tag"]),
            str(fixture["version"]),
            "win-x64",
            tamper_entry=True,
        )
        self._refresh_sums(fixture)

        with self.assertRaisesRegex(ValueError, "file digest mismatch"):
            self._verify(fixture)

    def test_rejects_catalog_bytes_that_do_not_match_index_digest(self) -> None:
        fixture = self._fixture()
        fixture["payloads"][fixture["urls"]["catalog"]] += b" "

        with self.assertRaisesRegex(ValueError, "catalog bytes do not match"):
            self._verify(fixture)

    def test_rejects_manifest_bytes_that_do_not_match_index_digest(self) -> None:
        fixture = self._fixture()
        fixture["payloads"][fixture["urls"]["manifest"]] += b" "

        with self.assertRaisesRegex(ValueError, "manifest bytes do not match"):
            self._verify(fixture)

    def test_rejects_manifest_and_index_per_skill_digest_mismatch(self) -> None:
        fixture = self._fixture()
        manifest = self._json(fixture, "manifest")
        manifest["skillDigests"]["monica-guide"] = VALIDATOR.sha256_digest(b"different")
        fixture["payloads"][fixture["urls"]["manifest"]] = self._json_bytes(manifest)

        with self.assertRaisesRegex(ValueError, "disagree on per-skill release metadata"):
            self._verify(fixture)

    def test_rejects_manifest_and_index_per_skill_revision_mismatch(self) -> None:
        fixture = self._fixture()
        manifest = self._json(fixture, "manifest")
        manifest["skillRevisions"]["monica-guide"] = 2
        fixture["payloads"][fixture["urls"]["manifest"]] = self._json_bytes(manifest)

        with self.assertRaisesRegex(ValueError, "disagree on per-skill release metadata"):
            self._verify(fixture)

    def test_rejects_invalid_per_skill_revision_metadata(self) -> None:
        fixture = self._fixture()

        def invalidate_revision(manifest: dict[str, object]) -> None:
            manifest["skillRevisions"]["monica-guide"] = 0

        self._update_manifest(
            fixture,
            invalidate_revision,
            update_index_skill_metadata=True,
        )
        with self.assertRaisesRegex(ValueError, "invalid per-skill revision metadata"):
            self._verify(fixture)

    def test_requires_exact_per_skill_metadata_key_parity(self) -> None:
        fixture = self._fixture()

        def remove_revision(manifest: dict[str, object]) -> None:
            manifest["skillRevisions"].pop("monica-guide")

        self._update_manifest(
            fixture,
            remove_revision,
            update_index_skill_metadata=True,
        )
        with self.assertRaisesRegex(ValueError, "invalid per-skill revision metadata"):
            self._verify(fixture)

    def test_accepts_unchanged_skill_revision_history(self) -> None:
        fixture = self._fixture()
        self._add_prior_release(fixture)

        self._verify(fixture)

    def test_rejects_duplicate_release_publication_times(self) -> None:
        fixture = self._fixture()
        prior_tag = self._add_prior_release(fixture)
        index = self._json(fixture, "index")
        index["releases"][prior_tag]["publishedAt"] = index["releases"][fixture["tag"]][
            "publishedAt"
        ]
        self._write_index(fixture, index)

        with self.assertRaisesRegex(ValueError, "strict publishedAt chronology"):
            self._verify(fixture)

    def test_rejects_revision_drift_for_unchanged_skill(self) -> None:
        fixture = self._fixture()
        self._add_prior_release(fixture)

        def drift_unchanged_skill(manifest: dict[str, object]) -> None:
            manifest["skillRevisions"]["monica-guide"] = 2
            manifest["skillLastChangedIn"]["monica-guide"] = fixture["tag"]

        self._update_manifest(
            fixture,
            drift_unchanged_skill,
            update_index_skill_metadata=True,
        )
        with self.assertRaisesRegex(ValueError, "preserve the revision and change origin"):
            self._verify(fixture)

    def test_rejects_changed_skill_revision_jump_or_stale_origin(self) -> None:
        cases = (
            (3, self.TAG, "revision jump"),
            (2, "v1.2.2", "stale origin"),
        )
        for revision, changed_in, label in cases:
            with self.subTest(label=label):
                fixture = self._fixture()
                self._add_prior_release(fixture)

                def invalidate_changed_skill(manifest: dict[str, object]) -> None:
                    manifest["skillDigests"]["monica-guide"] = VALIDATOR.sha256_digest(
                        b"new guide content"
                    )
                    manifest["skillRevisions"]["monica-guide"] = revision
                    manifest["skillLastChangedIn"]["monica-guide"] = changed_in

                self._update_manifest(
                    fixture,
                    invalidate_changed_skill,
                    update_index_skill_metadata=True,
                )
                with self.assertRaisesRegex(ValueError, "advance changed skill"):
                    self._verify(fixture)

    def test_rejects_new_skill_with_noninitial_revision(self) -> None:
        fixture = self._fixture()
        self._add_prior_release(fixture)

        def add_invalid_skill(manifest: dict[str, object]) -> None:
            manifest["skillDigests"]["monica-new"] = VALIDATOR.sha256_digest(
                b"new skill content"
            )
            manifest["skillRevisions"]["monica-new"] = 2
            manifest["skillLastChangedIn"]["monica-new"] = fixture["tag"]

        self._update_manifest(
            fixture,
            add_invalid_skill,
            update_index_skill_metadata=True,
        )
        with self.assertRaisesRegex(ValueError, "introduce monica-new at revision 1"):
            self._verify(fixture)

    def test_rejects_retired_skill_name_reintroduction(self) -> None:
        fixture = self._fixture()
        index = self._json(fixture, "index")
        current_tag = fixture["tag"]
        current_release = index["releases"][current_tag]
        guide_digest = current_release["skillDigests"]["monica-guide"]
        other_digest = VALIDATOR.sha256_digest(b"other skill")
        oldest_tag = "v1.2.1"
        retired_tag = "v1.2.2"
        oldest_release = {
            **current_release,
            "tag": oldest_tag,
            "monicaVersion": "1.2.1",
            "publishedAt": "2026-08-02T12:00:00Z",
            "skillDigests": {"monica-guide": guide_digest},
            "skillRevisions": {"monica-guide": 1},
            "skillLastChangedIn": {"monica-guide": oldest_tag},
        }
        retired_release = {
            **current_release,
            "tag": retired_tag,
            "monicaVersion": "1.2.2",
            "publishedAt": "2026-08-03T12:00:00Z",
            "skillDigests": {"monica-other": other_digest},
            "skillRevisions": {"monica-other": 1},
            "skillLastChangedIn": {"monica-other": retired_tag},
        }
        index["releases"] = {
            oldest_tag: oldest_release,
            retired_tag: retired_release,
            current_tag: current_release,
        }
        self._write_index(fixture, index)

        def reintroduce_retired_guide(manifest: dict[str, object]) -> None:
            manifest["skillRevisions"]["monica-guide"] = 1
            manifest["skillLastChangedIn"]["monica-guide"] = oldest_tag

        self._update_manifest(
            fixture,
            reintroduce_retired_guide,
            update_index_skill_metadata=True,
        )
        with self.assertRaisesRegex(ValueError, "must not reintroduce retired skill"):
            self._verify(fixture)

    def test_rejects_unindexed_per_skill_last_changed_tag(self) -> None:
        fixture = self._fixture()

        def invalidate_last_changed(manifest: dict[str, object]) -> None:
            manifest["skillLastChangedIn"]["monica-guide"] = "v1.2.2"

        self._update_manifest(
            fixture,
            invalidate_last_changed,
            update_index_skill_metadata=True,
        )
        with self.assertRaisesRegex(ValueError, "invalid per-skill last-changed metadata"):
            self._verify(fixture)

    def test_recomputes_monica_guide_digest_from_released_files(self) -> None:
        fixture = self._fixture()
        wrong_digest = VALIDATOR.sha256_digest(b"wrong guide digest")

        def replace_digest(manifest: dict[str, object]) -> None:
            manifest["skillDigests"]["monica-guide"] = wrong_digest

        self._update_manifest(fixture, replace_digest, update_index_skill_metadata=True)
        with self.assertRaisesRegex(ValueError, "monica-guide digest does not match its files"):
            self._verify(fixture)

    def test_rejects_released_guide_file_that_differs_from_manifest(self) -> None:
        fixture = self._fixture()
        fixture["archive_files"]["skills/monica-guide/SKILL.md"] += b"tampered\n"
        self._refresh_archive(fixture)

        with self.assertRaisesRegex(ValueError, "archive file digest mismatch"):
            self._verify(fixture)

    def test_requires_local_canonical_prompt_bytes_to_match_release(self) -> None:
        fixture = self._fixture()
        self.local_prompt_path.write_bytes(b'{"canonical":false}\n')

        with self.assertRaisesRegex(ValueError, "local canonical bootstrap prompt bytes"):
            self._verify(fixture)

    def test_prompt_validation_accepts_installer_contract(self) -> None:
        immutable_skill_url_template = (
            "https://github.com/Tairitsua/Monica/tree/{tag}/skills/{skill}"
        )
        prompts = {
            "en-US": (
                "From this immutable release {{MONICA_IMMUTABLE_REF}}, install the Monica "
                "Agent Skills into my current project directory: download the monica-guide "
                "release asset for this platform (`{rid}`), verify it against SHA256SUMS, "
                "and run $monica-guide init --workspace <this repository> --profile "
                "<profile I confirm>, then $monica-guide configure --workspace <this "
                "repository> (preview first, then apply with the approved plan digest). "
                "The installation stays inside this repository. A machine-wide install "
                "that changes my user-level skill directory happens only if I explicitly "
                "ask for one. Verify with $monica-guide status --workspace <this "
                "repository>; restart the host only if discovery still fails. Then invoke "
                "$monica-guide, introduce its toolbox, global state, and the Monica "
                "framework source binding, and ask what I want to do next. After that "
                "installation, these restrictions apply until I choose an operation and "
                "approve its preview: Do not initialize another repository, select a "
                "different profile, install further Monica skills, bind or unbind source "
                "repositories, make any other file changes, or perform remote mutations."
            ),
            "zh-CN": (
                "从这个不可变发布版本 {{MONICA_IMMUTABLE_REF}} 开始，把 Monica Agent Skills "
                "安装进我当前的项目目录：下载与当前平台匹配的 monica-guide 发布资产"
                "（`{rid}`），对照 SHA256SUMS 校验后，先运行 $monica-guide init "
                "--workspace <本仓库> --profile <我确认的 profile>，再运行 $monica-guide "
                "configure --workspace <本仓库>（先审阅打印的预览，再用批准的计划摘要应"
                "用）。除非我明确要求整机安装，这次安装只写入本仓库内部。用 "
                "$monica-guide status --workspace <本仓库> 验证；只有发现仍失败时才重启宿"
                "主。随后调用 $monica-guide，介绍其工具箱、全局状态以及 Monica 框架"
                "源码绑定，并询问我下一步想做什么。完成这次安装后，在我选"
                "择操作并批准其预览之前，以下限制适用：不要初始化其他仓库、选择其他 "
                "profile、安装后续 Monica Skill、绑定或解绑源码、不要再修改其他文件或"
                "执行远程变更。"
            ),
        }
        catalog_path = Path(self.temporary_directory.name) / "catalog.json"
        prompt_path = Path(self.temporary_directory.name) / "prompts.json"
        catalog_path.write_text(
            json.dumps(
                {
                    "distribution": {
                        "repository": "Tairitsua/Monica",
                        "installer": dict(VALIDATOR.GUIDE_INSTALLER),
                        "immutableSkillUrlTemplate": immutable_skill_url_template,
                    },
                    "prompts": {
                        "bootstrapAsset": "skills/monica-guide/assets/bootstrap-prompts.json",
                        "bootstrapSchema": "skills/monica-guide/assets/bootstrap-prompts.schema.json",
                    },
                    "skills": {"monica-guide": {"path": "skills/monica-guide"}},
                }
            ),
            encoding="utf-8",
        )
        previous_catalog = os.environ.get("MONICA_AGENT_SKILL_CATALOG_PATH")
        previous_prompts = os.environ.get("MONICA_GUIDE_PROMPTS_PATH")

        def write_prompt(mutate: Callable[[str], str]) -> None:
            prompt_path.write_text(
                json.dumps(
                    {
                        "schemaVersion": 3,
                        "repository": "Tairitsua/Monica",
                        "skill": "monica-guide",
                        "immutableRef": "{{MONICA_IMMUTABLE_REF}}",
                        "catalogDigest": "{{MONICA_CATALOG_DIGEST}}",
                        "distribution": {
                            "repository": "Tairitsua/Monica",
                            "installer": dict(VALIDATOR.GUIDE_INSTALLER),
                            "immutableSkillUrlTemplate": immutable_skill_url_template,
                        },
                        "verifiedAgentTargets": VALIDATOR.VERIFIED_AGENT_TARGETS,
                        "fallback": dict(VALIDATOR.GUIDE_FALLBACK),
                        "locales": {
                            locale: {"prompt": mutate(prompts[locale])}
                            for locale in VALIDATOR.PROMPT_LOCALES
                        },
                    },
                    ensure_ascii=False,
                ),
                encoding="utf-8",
            )

        try:
            os.environ["MONICA_AGENT_SKILL_CATALOG_PATH"] = str(catalog_path)
            os.environ["MONICA_GUIDE_PROMPTS_PATH"] = str(prompt_path)

            write_prompt(lambda text: text)
            failures: list[str] = []
            VALIDATOR.validate_guide_prompts("v1.2.3", require_ref=True, failures=failures)
            self.assertEqual([], failures)

            for label, mutate in (
                ("npx installer", lambda text: text.replace("{rid}", "npx")),
                ("windows executable", lambda text: text + " Monica.Guide.exe"),
                ("single platform", lambda text: text + " win-x64"),
                ("machine-wide default", lambda text: text + " --environment"),
                ("removed Docs binding", lambda text: text + " Monica.Docs"),
                ("removed Docs profile", lambda text: text + " docs-contributor"),
            ):
                with self.subTest(label=label):
                    write_prompt(mutate)
                    drift_failures: list[str] = []
                    VALIDATOR.validate_guide_prompts(
                        "v1.2.3", require_ref=True, failures=drift_failures
                    )
                    self.assertTrue(drift_failures, label)
        finally:
            self._restore_environment("MONICA_AGENT_SKILL_CATALOG_PATH", previous_catalog)
            self._restore_environment("MONICA_GUIDE_PROMPTS_PATH", previous_prompts)

    def test_rejects_hardcoded_frontend_prompt_commands(self) -> None:
        original_repository_root = VALIDATOR.REPOSITORY_ROOT
        original_frontend_root = VALIDATOR.FRONTEND_SOURCE_ROOT
        original_docs_root = VALIDATOR.DOCS_ROOT
        try:
            with tempfile.TemporaryDirectory() as temporary_root:
                root = Path(temporary_root)
                frontend_root = root / "src"
                docs_root = root / "docs"
                frontend_root.mkdir()
                docs_root.mkdir()
                VALIDATOR.REPOSITORY_ROOT = root
                VALIDATOR.FRONTEND_SOURCE_ROOT = frontend_root
                VALIDATOR.DOCS_ROOT = docs_root

                for command in (
                    "npx --yes skills@latest add source",
                    "npx --yes skills@" + "9.9.9 add source",
                ):
                    (frontend_root / "prompt.ts").write_text(
                        f"export const prompt = {command!r};\n",
                        encoding="utf-8",
                    )
                    failures: list[str] = []
                    VALIDATOR.validate_managed_sources(failures)
                    self.assertTrue(
                        any("canonical Monica Guide asset" in failure for failure in failures),
                        command,
                    )
        finally:
            VALIDATOR.REPOSITORY_ROOT = original_repository_root
            VALIDATOR.FRONTEND_SOURCE_ROOT = original_frontend_root
            VALIDATOR.DOCS_ROOT = original_docs_root

    def _verify(self, fixture: dict[str, object]) -> None:
        VALIDATOR.verify_agent_skill_release(
            fixture["tag"],
            expected_version=fixture["version"],
            local_prompt_path=self.local_prompt_path,
            fetch_bytes=fixture["payloads"].__getitem__,
        )

    def _fixture(
        self,
        tag: str | None = None,
        *,
        additional_skills: dict[str, dict[str, bytes]] | None = None,
    ) -> dict[str, object]:
        release_tag = tag or self.TAG
        version = release_tag.removeprefix("v")
        version_without_build_metadata = version.split("+", 1)[0]
        channel = "preview" if "-" in version_without_build_metadata else "stable"
        asset_base = f"https://github.com/Tairitsua/Monica/releases/download/{release_tag}"
        urls = {
            "release": f"{VALIDATOR.GITHUB_RELEASE_API}/{VALIDATOR.quote(release_tag, safe='')}",
            "catalog": f"https://downloads.example/{release_tag}/agent-skill-catalog.json",
            "index": f"https://downloads.example/{release_tag}/agent-skill-index.json",
            "manifest": f"https://downloads.example/{release_tag}/agent-skill-manifest.json",
            "archive": f"https://downloads.example/{release_tag}/monica-agent-skills-{release_tag}.zip",
        }
        guide_files = {
            "SKILL.md": b"---\nname: monica-guide\n---\n",
            "assets/bootstrap-prompts.json": self.PROMPT_BYTES,
            "assets/bootstrap-prompts.schema.json": b'{"schema":true}\n',
        }
        extra_skills = additional_skills or {}
        if "monica-guide" in extra_skills:
            raise ValueError("additional skills must not replace monica-guide")
        managed_skill_files = {"monica-guide": guide_files, **extra_skills}
        catalog = {
            "schemaVersion": 1,
            "distribution": {
                "repository": "Tairitsua/Monica",
                "installer": dict(VALIDATOR.GUIDE_INSTALLER),
                "immutableSkillUrlTemplate": (
                    "https://github.com/Tairitsua/Monica/tree/{tag}/skills/{skill}"
                ),
            },
            "prompts": {
                "bootstrapAsset": "skills/monica-guide/assets/bootstrap-prompts.json",
                "bootstrapSchema": "skills/monica-guide/assets/bootstrap-prompts.schema.json",
            },
            "skills": {
                name: {
                    "path": f"skills/{name}",
                    "ownership": "monica",
                    "managed": True,
                }
                for name in managed_skill_files
            },
        }
        catalog_bytes = self._json_bytes(catalog)
        skill_tree_files = {
            f"skills/{name}/{path}": content
            for name, skill_files in managed_skill_files.items()
            for path, content in skill_files.items()
        }
        archive_files = {
            ".monica/agent-skill-catalog.json": catalog_bytes,
            **skill_tree_files,
        }
        files = {
            path: VALIDATOR.sha256_digest(content)
            for path, content in archive_files.items()
        }
        skill_digests = {
            name: VALIDATOR.file_manifest_digest(skill_files)
            for name, skill_files in managed_skill_files.items()
        }
        skill_revisions = {name: 1 for name in managed_skill_files}
        skill_last_changed_in = {name: release_tag for name in managed_skill_files}
        tree_digest = VALIDATOR.file_manifest_digest(skill_tree_files)
        published_at = "2026-08-04T12:00:00Z"
        manifest = {
            "schemaVersion": 2,
            "tag": release_tag,
            "monicaVersion": version,
            "resolvedCommit": self.COMMIT,
            "catalogDigest": VALIDATOR.sha256_digest(catalog_bytes),
            "skillTreeDigest": tree_digest,
            "skillDigestAlgorithm": VALIDATOR.SKILL_DIGEST_ALGORITHM,
            "skillDigests": skill_digests,
            "skillRevisions": skill_revisions,
            "skillLastChangedIn": skill_last_changed_in,
            "publishedAt": published_at,
            "indexUrl": f"{asset_base}/agent-skill-index.json",
            "catalogUrl": f"{asset_base}/agent-skill-catalog.json",
            "archiveUrl": f"{asset_base}/monica-agent-skills-{release_tag}.zip",
            "fileManifestScope": VALIDATOR.FILE_MANIFEST_SCOPE,
            "files": files,
        }
        manifest_bytes = self._json_bytes(manifest)
        release_record = {
            "tag": release_tag,
            "monicaVersion": version,
            "commit": self.COMMIT,
            "catalogDigest": manifest["catalogDigest"],
            "skillTreeDigest": tree_digest,
            "skillDigestAlgorithm": VALIDATOR.SKILL_DIGEST_ALGORITHM,
            "skillDigests": skill_digests,
            "skillRevisions": skill_revisions,
            "skillLastChangedIn": skill_last_changed_in,
            "manifestDigest": VALIDATOR.sha256_digest(manifest_bytes),
            "publishedAt": published_at,
            "assetBaseUrl": asset_base,
            "catalogUrl": f"{asset_base}/agent-skill-catalog.json",
            "manifestUrl": f"{asset_base}/agent-skill-manifest.json",
        }
        index = {
            "schemaVersion": 2,
            "channels": {
                "stable": release_tag if channel == "stable" else None,
                "preview": release_tag if channel == "preview" else None,
            },
            "versions": {version: release_tag},
            "releases": {release_tag: release_record},
        }
        index_bytes = self._json_bytes(index)
        archive_files[".monica/agent-skill-index.json"] = index_bytes
        asset_names = {
            "agent-skill-catalog.json": urls["catalog"],
            "agent-skill-index.json": urls["index"],
            "agent-skill-manifest.json": urls["manifest"],
            f"monica-agent-skills-{release_tag}.zip": urls["archive"],
        }
        for rid in VALIDATOR.GUIDE_PLATFORMS:
            urls[f"guide-{rid}"] = (
                f"https://downloads.example/{release_tag}"
                f"/monica-guide-{release_tag}-{rid}.zip"
            )
            asset_names[f"monica-guide-{release_tag}-{rid}.zip"] = urls[f"guide-{rid}"]
        urls["sums"] = f"https://downloads.example/{release_tag}/SHA256SUMS"
        asset_names["SHA256SUMS"] = urls["sums"]
        release = {
            "tag_name": release_tag,
            "target_commitish": self.COMMIT,
            "draft": False,
            "assets": [
                {"name": name, "browser_download_url": url}
                for name, url in asset_names.items()
            ],
        }
        fixture: dict[str, object] = {
            "tag": release_tag,
            "version": version,
            "urls": urls,
            "archive_files": archive_files,
            "payloads": {
                urls["release"]: self._json_bytes(release),
                urls["catalog"]: catalog_bytes,
                urls["index"]: index_bytes,
                urls["manifest"]: manifest_bytes,
            },
        }
        for rid in VALIDATOR.GUIDE_PLATFORMS:
            self._write_guide_bundle(fixture, release_tag, version, rid)
        self._refresh_archive(fixture)
        return fixture

    def _write_guide_bundle(
        self,
        fixture: dict[str, object],
        tag: str,
        version: str,
        rid: str,
        *,
        entry_mode: int = 0o755,
        manifest_updates: Callable[[dict[str, object]], None] | None = None,
        tamper_entry: bool = False,
    ) -> None:
        entry = VALIDATOR.GUIDE_PLATFORMS[rid]
        entry_point = f"app/{entry}"
        projected_catalog = self._json_bytes(
            {
                "schemaVersion": 1,
                "skills": [
                    {"name": "monica-guide", "relativePath": "skills/monica-guide"}
                ],
            }
        )
        payload_files = {
            entry_point: b"guide-app-image\n",
            "skills/catalog.json": projected_catalog,
            "skills/monica-guide/SKILL.md": b"---\nname: monica-guide\n---\n",
        }
        files = [
            {
                "relativePath": path,
                "length": len(content),
                "sha256": hashlib.sha256(content).hexdigest(),
            }
            for path, content in sorted(payload_files.items())
        ]
        manifest = {
            "schemaVersion": VALIDATOR.GUIDE_BUNDLE_MANIFEST_SCHEMA_VERSION,
            "productId": "Tairitsua.Monica",
            "productName": "Monica",
            "productVersion": version,
            "assemblyVersion": "1.2.3.0",
            "tag": tag,
            "runtimeIdentifier": rid,
            "distributionKind": f"portable-{rid}",
            "selfContained": False,
            "programEntryPoint": entry_point,
            "programFiles": [
                record
                for record in files
                if record["relativePath"].startswith("app/")
            ],
            "skillCatalogDigest": hashlib.sha256(projected_catalog).hexdigest(),
            "skills": [
                {"name": "monica-guide", "relativePath": "skills/monica-guide"}
            ],
            "files": files,
        }
        if manifest_updates is not None:
            manifest_updates(manifest)
        zipped_files = dict(payload_files)
        zipped_files["release-manifest.json"] = self._json_bytes(manifest)
        if tamper_entry:
            zipped_files[entry_point] += b"tampered\n"
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for path, content in sorted(zipped_files.items()):
                info = zipfile.ZipInfo(path)
                info.compress_type = zipfile.ZIP_DEFLATED
                mode = entry_mode if path == entry_point else 0o644
                info.external_attr = (mode << 16) | 0o100000
                archive.writestr(info, content)
        urls = fixture["urls"]
        assert isinstance(urls, dict)
        fixture["payloads"][urls[f"guide-{rid}"]] = output.getvalue()

    def _refresh_sums(self, fixture: dict[str, object]) -> None:
        release = self._json(fixture, "release")
        url_by_name = {
            asset["name"]: asset["browser_download_url"]
            for asset in release["assets"]
        }
        skills_archive = f"monica-agent-skills-{fixture['tag']}.zip"
        archive_names = [skills_archive] + [
            f"monica-guide-{fixture['tag']}-{rid}.zip"
            for rid in VALIDATOR.GUIDE_PLATFORMS
        ]
        lines = "".join(
            f"{hashlib.sha256(fixture['payloads'][url_by_name[name]]).hexdigest()}  {name}\n"
            for name in sorted(archive_names)
        )
        urls = fixture["urls"]
        assert isinstance(urls, dict)
        fixture["payloads"][urls["sums"]] = lines.encode("utf-8")

    def _update_manifest(
        self,
        fixture: dict[str, object],
        update: Callable[[dict[str, object]], None],
        *,
        update_index_skill_metadata: bool = False,
    ) -> None:
        manifest = self._json(fixture, "manifest")
        update(manifest)
        manifest_bytes = self._json_bytes(manifest)
        fixture["payloads"][fixture["urls"]["manifest"]] = manifest_bytes
        index = self._json(fixture, "index")
        release = index["releases"][fixture["tag"]]
        release["manifestDigest"] = VALIDATOR.sha256_digest(manifest_bytes)
        if update_index_skill_metadata:
            for field in ("skillDigests", "skillRevisions", "skillLastChangedIn"):
                release[field] = manifest[field]
        index_bytes = self._json_bytes(index)
        fixture["payloads"][fixture["urls"]["index"]] = index_bytes
        fixture["archive_files"][".monica/agent-skill-index.json"] = index_bytes
        self._refresh_archive(fixture)

    def _add_prior_release(self, fixture: dict[str, object]) -> str:
        prior_tag = "v1.2.2"
        index = self._json(fixture, "index")
        current_release = index["releases"][fixture["tag"]]
        guide_digest = current_release["skillDigests"]["monica-guide"]
        prior_release = {
            **current_release,
            "tag": prior_tag,
            "monicaVersion": "1.2.2",
            "publishedAt": "2026-08-03T12:00:00Z",
            "skillDigests": {"monica-guide": guide_digest},
            "skillRevisions": {"monica-guide": 1},
            "skillLastChangedIn": {"monica-guide": prior_tag},
        }
        index["releases"] = {
            prior_tag: prior_release,
            fixture["tag"]: current_release,
        }
        self._write_index(fixture, index)

        def preserve_prior_revision(manifest: dict[str, object]) -> None:
            manifest["skillRevisions"]["monica-guide"] = 1
            manifest["skillLastChangedIn"]["monica-guide"] = prior_tag

        self._update_manifest(
            fixture,
            preserve_prior_revision,
            update_index_skill_metadata=True,
        )
        return prior_tag

    def _write_index(
        self,
        fixture: dict[str, object],
        index: dict[str, object],
    ) -> None:
        index_bytes = self._json_bytes(index)
        fixture["payloads"][fixture["urls"]["index"]] = index_bytes
        fixture["archive_files"][".monica/agent-skill-index.json"] = index_bytes
        self._refresh_archive(fixture)

    def _refresh_archive(self, fixture: dict[str, object]) -> None:
        output = io.BytesIO()
        with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as archive:
            for path, content in sorted(fixture["archive_files"].items()):
                archive.writestr(path, content)
        fixture["payloads"][fixture["urls"]["archive"]] = output.getvalue()
        self._refresh_sums(fixture)

    @staticmethod
    def _json(fixture: dict[str, object], name: str) -> dict[str, object]:
        return json.loads(fixture["payloads"][fixture["urls"][name]])

    @staticmethod
    def _json_bytes(payload: dict[str, object]) -> bytes:
        return (json.dumps(payload, ensure_ascii=False, indent=2) + "\n").encode("utf-8")

    @staticmethod
    def _restore_environment(name: str, value: str | None) -> None:
        if value is None:
            os.environ.pop(name, None)
        else:
            os.environ[name] = value


if __name__ == "__main__":
    unittest.main()
