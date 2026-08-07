---
title: Licensing and commercial use
description: Choose open-source, proprietary, or commercial terms for an independent Monica package.
sidebar_position: 7
---

Independent Monica package authors may choose their own license and may charge for their work. Monica's MIT license permits use, modification, publication, distribution, sublicensing, and sale of Monica software, provided the MIT copyright and permission notice is retained in copies or substantial portions of Monica software.

This page explains the ecosystem policy, not legal advice. Review the Monica license, every dependency license, your copied code, and applicable trademark or consumer law with qualified counsel when the release is commercially important.

## Choose terms deliberately

| Model | NuGet metadata | Open-source badge | Typical distribution |
|---|---|---|---|
| MIT, Apache-2.0, or another NuGet-accepted open-source license | `PackageLicenseExpression` | Allowed | NuGet.org or private feed |
| Custom source-available terms | `PackageLicenseFile` | Not allowed | Public or private feed according to the terms |
| Proprietary/commercial license | `PackageLicenseFile` | Not allowed | Usually a private or authenticated feed |
| Dual license | Expression only when the full expression is NuGet-accepted; otherwise a license file | Only when the package release is genuinely open source | Public and/or private channels |

Specify exactly one of `PackageLicenseExpression` or `PackageLicenseFile`. Do not leave the choice blank: without a license grant, consumers do not have permission to use the package merely because they can download it. NuGet's [authoring guidance](https://learn.microsoft.com/nuget/create-packages/package-authoring-best-practices#if-your-package-is-not-open-source) recommends embedding a license file for non-open-source packages.

## What Monica's MIT license covers

Your original module code remains under the terms you choose. The Monica MIT notice applies to Monica code you copy or redistribute and must remain with copies or substantial portions of that code. Referencing Monica NuGet packages normally preserves Monica's own license metadata in those dependencies; copying source into your project requires particular care to retain the notice.

Your package license does not override:

- Monica's MIT notice obligations
- Licenses of MudBlazor, provider SDKs, or other dependencies
- Third-party assets, fonts, icons, data, or generated content
- Monica branding and compatibility-mark rules

## Companion images and model assets

In a schema-v2 repository, the publisher's declared license and distribution policy apply consistently to the publisher-authored packages and companion image service. If publisher-authored image code needs different terms, split it into another repository and make the boundary explicit.

That repository-level choice does not relicense third-party image contents. A container may redistribute base-image layers, system libraries, Python/native runtimes, provider code, model weights, dictionaries, fonts, or other data under their own licenses and acceptable-use terms. Before distributing an image:

- Record each component, version, source URL, checksum, license, and required notice.
- Confirm that redistribution of every model and data asset is permitted, including commercial use when applicable.
- Preserve required notices in the image and accompanying source/release materials.
- Publish an SBOM or equivalent dependency inventory when practical.
- Describe whether uploaded documents leave the host, are persisted, or are used for telemetry or model improvement.

An open-source connector package does not automatically make every image layer or model open source. Conversely, charging for access does not remove third-party notice or redistribution obligations.

## Charging for a package

You may charge for binaries, source access, updates, hosted services, support, consulting, or a commercial license. Choose distribution that enforces the intended access model:

- NuGet.org is a public package feed, not a checkout or entitlement service. Anyone can download a package published there.
- A public package can still support a paid business model, such as paid support or a separately licensed service, but the public artifact remains downloadable.
- Use an authenticated private feed for access-controlled paid binaries.
- Document authentication, renewal, offline use, update access, and end-of-support terms outside the package metadata as well as in the customer agreement.

Do not use code-based restrictions or telemetry to imply license terms that are absent from the actual license agreement.

## Branding remains separate

A compatible package is not an official package, regardless of license or price. Open source does not grant use of the official purple Monica mark, and a commercial package may still use the emerald compatibility mark if it follows the [package and branding standard](./package-and-branding-standard.md).

Always identify the independent publisher and include the self-attested compatibility notice. Do not claim that Monica has certified, verified, endorsed, or accepted responsibility for the package.
