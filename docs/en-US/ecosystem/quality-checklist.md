---
title: Quality checklist
description: Verify module behavior, public contracts, package contents, and release readiness before publication.
sidebar_position: 5
---

# Quality checklist

The Monica Compatibility Mark is self-attested. Completing this checklist is the publisher's evidence that the claim is responsible; it is not Monica-team certification. Apply every relevant item to the complete schema-v2 repository release, not just its easiest package or image.

## Repository release contract

- [ ] Root `monica.manifest.json` uses `schemaVersion: 2` and contains no unsupported fields.
- [ ] `repositoryId`, `.slnx`, publisher, contacts, source visibility, license, distribution, and publishing target describe one durable release unit.
- [ ] The manifest has a one-to-one mapping between `packages[]` entries and packable `src/<PackageId>/<PackageId>.csproj` projects.
- [ ] One manifest version applies to every NuGet package and every OCI `<version>-<tagSuffix>` tag.
- [ ] Every package uses the same publisher segment and repository-wide policies; real policy/version differences have separate repositories.

## Identity and package boundary

- [ ] `PackageId` follows `<Publisher>.Monica.<Package>[.<Variant>]` and is explicitly set.
- [ ] Project, assembly, and root namespace match the package ID.
- [ ] The package ID is available on the target feed and does not use `Monica.*`.
- [ ] Every module key equals the package ID or starts with `PackageId.`.
- [ ] Every UI module key ends in `.UI`.
- [ ] Module keys and registration methods are listed in the README.
- [ ] Every bundled module belongs to one coherent versioning and distribution boundary.
- [ ] Every package and image is clearly identified as independently published; no design example is presented as an available artifact.

## Architecture and public API

- [ ] Each module has its own Module, Option, Guide, builder extension, and dependency declarations.
- [ ] `packageDependencies` is the complete acyclic internal NuGet graph and uses full package IDs.
- [ ] `modules[].dependsOn` is the complete acyclic Monica runtime graph and uses full module keys.
- [ ] Every cross-package module edge has a matching package edge; every provider sets `providerFor`, depends on that target, and implements `IModuleProvider`.
- [ ] Project references exactly match declared internal package edges; no sibling package assembly is embedded into another package.
- [ ] Third-party registration types live under `<PackageId>.Modules`, not the first-party `Monica.Modules` namespace.
- [ ] UI routes derive from the package family without `<Publisher>.Monica.`, and the host composition has no duplicate normalized routes.
- [ ] Every localized page declares `TResource`; no `RegisterLocalizedComponent` or central page-title resource remains.
- [ ] Each package-owned category ID equals its UI module key without the final `.UI`, has explicit order, and is registered once with the same module-owned resource used by its pages.
- [ ] Every navigation resource is registered through `AddResource<TResource>()`, with synchronized `en-US` and `zh-CN` keys.
- [ ] `Modules/` contains registration logic only.
- [ ] Public abstractions and models are separated from internal services and providers.
- [ ] Facades are thin host/UI entry points returning `Res` or `Res<T>`; internal services use normal .NET exceptions and return types.
- [ ] Other modules consume public abstractions and models rather than Facades or internal services.
- [ ] `ModuleBase` is the default; `WebModuleBase` is used only for middleware or endpoint participation.
- [ ] A module that calls `ScheduleCompositionWork(...)` supplies isolated deterministic CPU-bound work over immutable or exclusively module-owned inputs and does not mutate the host builder, service collection, service provider, module graph, or shared static state.
- [ ] UI modules consume public Facades and do not access internal services or providers.
- [ ] Public and developer-facing APIs have useful XML documentation.
- [ ] Options document their defaults and practical effect; Guide methods document prerequisites and side effects.
- [ ] Every Monica dependency is restored through `PackageReference` from the declared NuGet source/version; no `MonicaSourceRoot`, sibling Monica project reference, or locally relabeled Monica package participates.
- [ ] Every resolved `Monica.*` package version, including central/property-based declarations, exactly equals manifest `monicaVersion`.

## Behavior and tests

- [ ] The complete solution restores, builds, and tests with zero warnings.
- [ ] Tests compose the package through a real `builder.AddMonica(...)` host boundary.
- [ ] Every public package entry point is tested through its packed NuGet artifact, including provider selection across package boundaries.
- [ ] Scheduled-work tests, when applicable, prove useful overlap, waiting at each declared deadline, failure propagation before the relevant checkpoint and `Build()`, deterministic diagnostics, and safe concurrent execution.
- [ ] Every module registration succeeds independently when it is intended to be independent.
- [ ] Declared dependencies are resolved and missing required Guide configuration fails clearly.
- [ ] Duplicate registrations are idempotent or rejected with a clear contract.
- [ ] Cancellation, concurrency, disposal, timeout, and exception behavior are covered where relevant.
- [ ] UI modules have component tests and a runnable bridge/demo for their primary route.
- [ ] UI tests assert category identity/order, page resource/key, navigation item route/order, duplicate routes, and conflicting category definitions where applicable.
- [ ] No test relies on machine-specific paths, persistent shared state, or an undeclared external service.
- [ ] Provider integration tests distinguish protocol/unit tests from declared live-service CPU/GPU gates; fake responses never substitute for the release inference gate.

## NuGet artifact

- [ ] The Release `.nupkg` contains only intended assemblies, dependencies, content, and static web assets.
- [ ] The artifact directory contains exactly one `.nupkg` and applicable `.snupkg` per manifest package, with no missing or extra package.
- [ ] Packed nuspec internal dependencies match `packageDependencies`; sibling assemblies are not embedded.
- [ ] Authors, description, copyright, project URL, repository, tags, release notes, and supported frameworks are correct.
- [ ] The package embeds a README and a 128×128 transparent PNG icon.
- [ ] Exactly one of `PackageLicenseExpression` or `PackageLicenseFile` is present.
- [ ] The independent-publisher and compatibility disclaimer is visible in the README.
- [ ] Source Link and `.snupkg` symbols are present when source is available.
- [ ] Clean consumers can restore every package entry point from a local feed and start representative hosts without source-project references.
- [ ] A package that depends on a prerelease Monica version is itself prerelease.

## Companion OCI images

- [ ] Each `ociImages[]` entry names a declared connector through `companionPackageId` and represents one registry repository.
- [ ] CPU and NVIDIA variants are explicit Bake targets under that repository, with unique stage, platform, accelerator, and tag suffix values.
- [ ] One layered/multi-stage Dockerfile graph shares pinned base, dependency, application, and model layers before CPU/NVIDIA runtime stages diverge.
- [ ] The normalized Bake graph matches the manifest's context, Dockerfile, stages, platforms, tags, and target set.
- [ ] Every built image uses an immutable `<manifest-version>-<tagSuffix>` tag, runs as non-root, declares a health check, and carries required OCI/Monica labels.
- [ ] CPU and NVIDIA variants expose the same versioned connector-facing protocol and health contract.
- [ ] A real CPU container request completes meaningful provider inference.
- [ ] Every NVIDIA target runs with GPU access and completes meaningful inference on the GPU; build success, health, CUDA import, and `nvidia-smi` alone are not accepted.
- [ ] NVIDIA mode fails fast when GPU execution is unavailable unless documented CPU fallback is intentional and tested.
- [ ] Every image declares provider-specific release gates before automated publishing; NVIDIA gates use the same managed self-hosted GPU runner labels, and missing gates suppress the complete publish workflow.
- [ ] Image digests and provenance are retained, and no immutable version tag is overwritten.

## Security, privacy, and operations

- [ ] Secrets, credentials, machine paths, and private feed URLs are absent from the artifact and repository history.
- [ ] External network access, persistence, hosted services, endpoints, middleware, and telemetry are disclosed.
- [ ] Inputs crossing trust boundaries are validated and logs do not leak sensitive data.
- [ ] Dependencies are reviewed for known vulnerabilities and compatible licenses.
- [ ] Base images, system/Python/native dependencies, model assets, download URLs, checksums, and licenses are reviewed and reproducibly pinned.
- [ ] Connector/image documentation explains ports, authentication, payload limits, timeouts, health, volumes, network/data handling, CPU/GPU prerequisites, and fallback behavior.
- [ ] The README provides support and security-reporting channels.
- [ ] The release owner can deprecate or unlist a compromised version and publish a corrected immutable version.

## Release process

- [ ] The package version follows SemVer and release notes identify breaking changes.
- [ ] CI rebuilds and tests the exact commit used for packing.
- [ ] CI validates the effective release version against both source and packed artifacts so a tag override cannot bypass prerelease dependency rules.
- [ ] Publishing uses NuGet Trusted Publishing where available, or a narrowly scoped expiring API key.
- [ ] A managed NVIDIA runner executes the real GPU inference gate for NVIDIA releases.
- [ ] All NuGet and OCI gates complete before the first external push; pushed package hashes, image digests, and provenance are retained.
- [ ] The release workflow loads and inspects images and completes CPU/NVIDIA provider smoke commands before registry login or any NuGet/OCI push.
- [ ] The publisher has reviewed the [package and branding standard](./package-and-branding-standard.md) and [licensing guidance](./licensing-and-commercial-use.md).
