---
title: Agent knowledge and documentation ownership
description: How Monica turns verified framework behavior into skills, stable guides, and release knowledge.
sidebar_position: 4
---

Monica's implementation and behavioral tests are the authority for what the framework does. Agent Skills explain how to use that behavior in a task; this site provides stable concepts and adoption guidance. Keeping those roles distinct lets a code change correct its guidance without creating another hand-maintained API reference.

## Where guidance lives

Canonical skills live in the Monica repository under `skills/<name>/`. A short `SKILL.md` routes an agent to the right task. Its `references/` files give progressively deeper setup, examples, failure behavior, and source or test evidence. An ordinary application task should be answerable from those references; exact source inspection is for implementation work, version-sensitive uncertainty, or a suspected defect.

Nine `monica-infra-*` skills own consumer guidance for **hosting**, **persistence**, **messaging**, **jobs**, **configuration**, **observability**, **AI**, **web**, and **UI**. They group related modules by the work a developer is doing. [Browse the skill library](/skills) to choose a capability; the site's [agent index](/llms.txt) lists the same published skills and their raw Markdown resources.

Monica.Docs owns stable bilingual concepts and guides, including this page. The website's skill pages, raw Markdown routes, and `llms.txt` are a deterministic, read-only projection of Monica's canonical skill content. Public builds use the immutable knowledge artifact from the matching clean framework release tag and verify its digests. Local previews may show current Monica source and identify themselves as previews. Edit the canonical skill in Monica when its technical guidance changes; edit a Docs guide when the stable explanation for people changes.

Monica.Guide installs framework-owned skills and can locate a verified Monica framework source checkout. It does not assign Monica.Docs a special contributor profile or source binding. Work in the Docs checkout directly when writing its editorial pages.

## Feed verified behavior back

When an implementation change or user report exposes a guidance gap, first reproduce the behavior against the relevant source and tests. Then replace or consolidate the owning skill reference with the verified rule and a focused example; add or update a behavioral check when the contract needs protection. Avoid accumulating session notes as permanent rules, and avoid making one local incident a universal rule before the evidence supports it.

Regenerate and validate the installed skill projections and the website-facing knowledge export before release. Monica publishes that knowledge with an immutable framework release so readers can identify the exact source and content they received.

For a pull request touching infrastructure source, run the ownership check from the Monica repository:

```bash
python scripts/check_knowledge_impact.py --base <base-ref>
```

The catalog's `sourcePaths` map changed implementation files to the most specific skill owner. The check reports whether that owner's canonical `SKILL.md` or a reference changed. If verified behavior and usage guidance are unaffected, record the reason explicitly with `--no-impact "reason"`; the reason is a review decision, not a new knowledge page.
