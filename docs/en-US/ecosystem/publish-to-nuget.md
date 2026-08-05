---
title: Publish packages and companion images
description: Version, validate, and release third-party Monica NuGet packages and optional provider images securely.
sidebar_position: 6
---

# Publish packages and companion images

Publish immutable artifacts from CI only after clean consumers have exercised every package and every declared companion image has passed its runtime gates. NuGet.org is appropriate for public package distribution; use a private feed when download access must be restricted. OCI images use the registry declared in the schema-v2 repository manifest.

## 1. Prepare ownership and identity

Before the first release:

1. Confirm the package ID is available on NuGet.org.
2. Publish through the individual or organization that will own future releases.
3. Consider reserving the publisher prefix when the package family meets NuGet's criteria.
4. Configure the support and security contacts that consumers will continue to use.
5. Treat the package ID and NuGet owner as durable public decisions.

NuGet's [prefix reservation](https://learn.microsoft.com/nuget/nuget-org/id-prefix-reservation) is the feed-level origin signal. The Monica Compatibility Mark does not replace it.

## 2. Choose a version

Use SemVer: `Major.Minor.Patch[-prerelease]`.

- Publish `-alpha`, `-beta`, or `-rc` while the public contract is not stable.
- Increment the major version for intentional breaking changes after `1.0.0`.
- Select the minimum Monica version the package actually supports. Avoid an exact dependency or unnecessary upper bound.
- If the package depends on a prerelease Monica package, the package must also be prerelease; a stable NuGet package cannot depend on a prerelease package.
- A schema-v2 repository uses one aligned version for every declared NuGet package and companion image tag.

## 3. Validate, build, and inspect the packages

```bash
python scripts/validate_repository.py --root .
dotnet restore
dotnet build -c Release --no-restore
dotnet test -c Release --no-build
dotnet pack -c Release --no-build --output artifacts/packages
python scripts/inspect_packages.py --root . --artifacts artifacts/packages
```

Then verify:

- The exact `.nupkg`/`.snupkg` set, metadata, license, README, icon, dependencies, and static web assets
- Every internal `packageDependencies` edge appears in the nuspec and no sibling package assembly is embedded
- `.snupkg` and Source Link when source is available
- Every public package entry point restores from a local feed into a clean consumer project
- Startup, provider selection, and module registration in representative hosts

Restore Monica from the declared NuGet source and version. Every resolved `Monica.*` `PackageReference`, including a centrally managed/property-based version, must equal manifest `monicaVersion`. Release validation must not depend on `MonicaSourceRoot`, a sibling Monica `ProjectReference`, or a locally rebuilt package carrying the public version. If a repository declares a prerelease Monica version such as `1.0.0-rc.6`, preserve a prerelease repository/package version.

Run `dotnet nuget push` without `--skip-duplicate` during the first release rehearsal so an accidental version collision fails visibly. A published package version is immutable; fix a bad release with a new version.

## 4. Publish with Trusted Publishing

Prefer NuGet [Trusted Publishing](https://learn.microsoft.com/nuget/nuget-org/trusted-publishing) for GitHub Actions. It exchanges GitHub's OIDC identity for a short-lived NuGet API key, avoiding a long-lived publishing secret.

The release job should:

1. Run only for an intentional tag or protected release workflow.
2. Request `id-token: write` only in the publish job.
3. Build, test, pack, and validate before requesting credentials.
4. Use `NuGet/login@v1` shortly before the push; temporary keys are valid for one hour.
5. Push the exact validated `.nupkg` and `.snupkg` artifacts.
6. Record the source commit, workflow run, and package hashes.

Trusted Publishing is still being rolled out. If the account does not expose it, use a NuGet API key that is scoped to the exact package ID and push operation, has a short expiration, is stored as a protected CI secret, and is rotated after suspected exposure.

## 5. Build and validate companion images

When `ociImages` is non-empty, validate and build the exact Bake graph before any external push:

```bash
python scripts/validate_oci.py --root .
docker buildx bake --file docker-bake.hcl --print
docker buildx bake --file docker-bake.hcl
python scripts/inspect_images.py --root .
```

Use one OCI repository per declared provider service. CPU and NVIDIA variants use immutable `<version>-<tagSuffix>` tags and one layered/multi-stage Dockerfile graph. Inspectors must verify the declared target/stage/platform mapping, image tag, non-root user, health check, and OCI/Monica labels.

Static inspection is necessary but insufficient:

1. Start the CPU image, wait for health, and complete one real provider inference through the connector-facing protocol.
2. Start every NVIDIA image with GPU access, fail if the requested accelerator is unavailable, and complete one real inference on the GPU.
3. Assert meaningful provider output, not only HTTP success. For OCR, verify recognized regions/text and confidence values.

Building a CUDA-tagged image, importing the framework, calling a health endpoint, or running `nvidia-smi` alone does not prove GPU inference. Standard hosted CI runners can build an NVIDIA image but usually cannot pass this gate; use an explicitly managed NVIDIA runner. Record image digests and provenance, and never replace an existing version tag.

Complete every package and image gate before the first push. This reduces, but cannot make transactional, the risk of a partially published multi-artifact release.

The generated workflow is fail-closed. Every OCI image must declare `releaseGates.cpuSmokeCommand` for its CPU targets and `nvidiaSmokeCommand` plus shared `managedNvidiaRunnerLabels` for NVIDIA targets. The runner labels include `self-hosted` and `nvidia`. If any image omits a required gate, no publish workflow is generated. With complete gates, the workflow loads and inspects all images, runs every provider-specific smoke command, and only then authenticates to the registry and begins OCI/NuGet pushes.

## 6. Verify the release

After pushing:

- Wait for NuGet validation and indexing, then inspect the public package page.
- Preview the rendered README and license.
- Restore the published version into a clean consumer, not the build workspace.
- Confirm every declared module key and registration method.
- Pull every published image tag by digest and repeat the applicable CPU/GPU smoke test.
- Create release notes and link the immutable artifact to its source commit.

## 7. Maintain the release

- Publish a new version for every correction; never attempt to replace an existing artifact.
- Deprecate a package or version when consumers should migrate to a successor.
- Unlist a broken or unsafe version to remove it from normal search while preserving existing restores.
- Publish a security advisory and fixed version when a vulnerability affects consumers.
- Transfer or add NuGet owners before maintainers leave the project.
- Preserve OCI version tags, deprecate unsafe images in registry metadata, and publish corrected tags under a new aligned release version.

For command-line and ownership details, see [Publish NuGet packages](https://learn.microsoft.com/nuget/nuget-org/publish-a-package).
