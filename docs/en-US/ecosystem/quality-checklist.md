---
title: Quality checklist
description: Verify module behavior, public contracts, package contents, and release readiness before publication.
sidebar_position: 5
---

# Quality checklist

The Monica Compatibility Mark is self-attested. Completing this checklist is the publisher's evidence that the claim is responsible; it is not Monica-team certification.

## Identity and package boundary

- [ ] `PackageId` follows `<Publisher>.Monica.<Package>[.<Variant>]` and is explicitly set.
- [ ] Project, assembly, and root namespace match the package ID.
- [ ] The package ID is available on the target feed and does not use `Monica.*`.
- [ ] Every module key equals the package ID or starts with `PackageId.`.
- [ ] Every UI module key ends in `.UI`.
- [ ] Module keys and registration methods are listed in the README.
- [ ] Every bundled module belongs to one coherent versioning and distribution boundary.

## Architecture and public API

- [ ] Each module has its own Module, Option, Guide, builder extension, and dependency declarations.
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
- [ ] UI modules consume public Facades and do not access internal services or providers.
- [ ] Public and developer-facing APIs have useful XML documentation.
- [ ] Options document their defaults and practical effect; Guide methods document prerequisites and side effects.

## Behavior and tests

- [ ] The complete solution restores, builds, and tests with zero warnings.
- [ ] Tests compose the package through a real `builder.AddMonica(...)` host boundary.
- [ ] Every module registration succeeds independently when it is intended to be independent.
- [ ] Declared dependencies are resolved and missing required Guide configuration fails clearly.
- [ ] Duplicate registrations are idempotent or rejected with a clear contract.
- [ ] Cancellation, concurrency, disposal, timeout, and exception behavior are covered where relevant.
- [ ] UI modules have component tests and a runnable bridge/demo for their primary route.
- [ ] UI tests assert category identity/order, page resource/key, navigation item route/order, duplicate routes, and conflicting category definitions where applicable.
- [ ] No test relies on machine-specific paths, persistent shared state, or an undeclared external service.

## NuGet artifact

- [ ] The Release `.nupkg` contains only intended assemblies, dependencies, content, and static web assets.
- [ ] Authors, description, copyright, project URL, repository, tags, release notes, and supported frameworks are correct.
- [ ] The package embeds a README and a 128×128 transparent PNG icon.
- [ ] Exactly one of `PackageLicenseExpression` or `PackageLicenseFile` is present.
- [ ] The independent-publisher and compatibility disclaimer is visible in the README.
- [ ] Source Link and `.snupkg` symbols are present when source is available.
- [ ] A clean consumer can restore the package from a local feed and start a representative host.
- [ ] A package that depends on a prerelease Monica version is itself prerelease.

## Security, privacy, and operations

- [ ] Secrets, credentials, machine paths, and private feed URLs are absent from the artifact and repository history.
- [ ] External network access, persistence, hosted services, endpoints, middleware, and telemetry are disclosed.
- [ ] Inputs crossing trust boundaries are validated and logs do not leak sensitive data.
- [ ] Dependencies are reviewed for known vulnerabilities and compatible licenses.
- [ ] The README provides support and security-reporting channels.
- [ ] The release owner can deprecate or unlist a compromised version and publish a corrected immutable version.

## Release process

- [ ] The package version follows SemVer and release notes identify breaking changes.
- [ ] CI rebuilds and tests the exact commit used for packing.
- [ ] Publishing uses NuGet Trusted Publishing where available, or a narrowly scoped expiring API key.
- [ ] The final artifact is retained for provenance and inspection.
- [ ] The publisher has reviewed the [package and branding standard](./package-and-branding-standard.md) and [licensing guidance](./licensing-and-commercial-use.md).
