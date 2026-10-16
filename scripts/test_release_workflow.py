"""Exercise the real workflow smoke shell with local, isolated release fixtures."""

import hashlib
import json
import os
from pathlib import Path
import subprocess
import tempfile
import textwrap
import unittest
import zipfile


WORKFLOW = Path(__file__).resolve().parents[1] / ".github/workflows/verify-public-release.yml"
GUIDE = '''#!/usr/bin/env python3
import json, os, shutil, sys
from pathlib import Path
args = sys.argv[1:]
assert args[1:3] == ["--product", "monica"]
assert "--json" in args
command = args[0]
target = Path.home() / ".agents/skills/monica-guide"
with (Path(os.environ["FIXTURE_ROOT"]) / "calls.jsonl").open("a") as log:
    log.write(json.dumps(args) + "\\n")
if command == "status":
    assert (target / "SKILL.md").is_file()
    payload = {"status": "ready", "checks": [{"id": "skills.linux.shared.catalog", "status": os.environ.get("FIXTURE_CATALOG_STATUS", "ok")}]}
else:
    assert command in ("configure", "unconfigure")
    assert args[3:7] == ["--environment", "linux", "--target", "shared"]
    payload = {"plan": {"planDigest": "fixture-plan-digest"}}
    if "--apply" in args:
        assert args[args.index("--plan-digest") + 1] == "fixture-plan-digest"
        if command == "configure":
            target.mkdir(parents=True)
            (target / "SKILL.md").write_text("Guide fixture")
        else:
            shutil.rmtree(target)
# Windows-origin JSON may have a BOM even when consumed by a Linux job.
print("\\ufeff" + json.dumps(payload))
'''
CURL = '''#!/usr/bin/env python3
import os, shutil, sys
from pathlib import Path
args = sys.argv[1:]
for index, value in enumerate(args):
    if value == "--output":
        shutil.copyfile(Path(os.environ["FIXTURE_ROOT"]) / args[index + 1], args[index + 1])
'''


def smoke_script():
    step = WORKFLOW.read_text().split("      - name: Smoke test the published guide executable\n", 1)[1]
    body = step.split("        run: |\n", 1)[1].split("\n      - name:", 1)[0]
    return textwrap.dedent(body)


class ReleaseSmokeTests(unittest.TestCase):
    def run_fixture(self, layout="setup", *, checksum_valid=True, catalog_status="ok"):
        with tempfile.TemporaryDirectory(prefix="docs-release-contract-") as directory:
            root = Path(directory)
            archive = root / "monica-guide-v1.0.0-fixture-linux-x64.zip"
            with zipfile.ZipFile(archive, "w") as bundle:
                bundle.writestr("release-manifest.json", "\ufeff" + json.dumps({"programEntryPoint": f"{layout}/Monica.Guide"}))
                bundle.writestr(f"{layout}/Monica.Guide", GUIDE)
            digest = hashlib.sha256(archive.read_bytes()).hexdigest() if checksum_valid else "0" * 64
            (root / "SHA256SUMS").write_text(f"{digest}  {archive.name}\n")
            bin_directory = root / "bin"
            bin_directory.mkdir()
            curl = bin_directory / "curl"
            curl.write_text(CURL)
            curl.chmod(0o755)
            home = root / "home"
            home.mkdir()
            env = {**os.environ, "HOME": str(home), "TMPDIR": str(root),
                   "FIXTURE_ROOT": str(root), "FIXTURE_CATALOG_STATUS": catalog_status,
                   "MONICA_AGENT_SKILL_REF": "v1.0.0-fixture", "PATH": f"{bin_directory}:{os.environ['PATH']}"}
            result = subprocess.run(["bash", "-c", smoke_script()], env=env, text=True, capture_output=True)
            calls_file = root / "calls.jsonl"
            calls = [json.loads(line) for line in calls_file.read_text().splitlines()] if calls_file.exists() else []
            return result, calls, (home / ".agents/skills/monica-guide").exists()

    def test_manifest_layouts_and_bom_json_complete_verified_lifecycle(self):
        for layout in ("setup", "app"):
            with self.subTest(layout=layout):
                result, calls, installed = self.run_fixture(layout)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
                self.assertEqual([call[0] for call in calls], ["configure", "configure", "status", "unconfigure", "unconfigure"])
                self.assertFalse(installed)

    def test_checksum_mismatch_prevents_execution(self):
        result, calls, installed = self.run_fixture(checksum_valid=False)
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(calls, [])
        self.assertFalse(installed)

    def test_unverified_catalog_fails_smoke(self):
        result, calls, _ = self.run_fixture(catalog_status="error")
        self.assertNotEqual(result.returncode, 0)
        self.assertIn("installed skill projection was not verified", result.stderr)
        self.assertEqual([call[0] for call in calls], ["configure", "configure", "status"])


if __name__ == "__main__":
    unittest.main()
