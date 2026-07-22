---
title: Publish to NuGet
description: Version, validate, and release a third-party Monica package through a secure NuGet workflow.
sidebar_position: 6
---

# Publish to NuGet

Publish immutable artifacts from CI after a clean consumer has restored and exercised the package. NuGet.org is appropriate for public distribution; use a private feed when download access must be restricted.

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

## 3. Build and inspect

```bash
dotnet restore
dotnet build -c Release --no-restore
dotnet test -c Release --no-build
dotnet pack -c Release --no-build --output artifacts/packages
```

Then verify:

- `.nupkg` metadata, license, README, icon, dependencies, and static web assets
- `.snupkg` and Source Link when source is available
- Restore from a local feed into a clean consumer project
- Startup and module registration in a representative host

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

## 5. Verify the release

After pushing:

- Wait for NuGet validation and indexing, then inspect the public package page.
- Preview the rendered README and license.
- Restore the published version into a clean consumer, not the build workspace.
- Confirm every declared module key and registration method.
- Create release notes and link the immutable artifact to its source commit.

## 6. Maintain the package

- Publish a new version for every correction; never attempt to replace an existing artifact.
- Deprecate a package or version when consumers should migrate to a successor.
- Unlist a broken or unsafe version to remove it from normal search while preserving existing restores.
- Publish a security advisory and fixed version when a vulnerability affects consumers.
- Transfer or add NuGet owners before maintainers leave the project.

For command-line and ownership details, see [Publish NuGet packages](https://learn.microsoft.com/nuget/nuget-org/publish-a-package).
