---
title: Adoption Scenarios
description: Adopt agent context incrementally, connect requirements, and use coverage gaps as an engineering backlog.
sidebar_position: 5
---

# Adoption Scenarios

## New feature

1. Identify the owning subdomain and team.
2. Resolve stable requirement IDs before implementation.
3. Add metadata and requirement annotations to every discovered unit in the feature.
4. Build the host and open **Status Overview**.
5. Open gap rows to review descriptions, dependencies, methods, alerts, and requirement links.

Titles should describe each unit rather than repeat a generic feature label. For example, use “Approve Order Command”, “Approve Order”, and “Order Approval Rules” for the request, application service, and domain service.

## Existing service

Enable discovery and naming warnings first. The initial dashboard may show 0% metadata and requirement coverage; that is a valid baseline, not a startup error.

Prioritize units in this order:

1. Errors and malformed explicit annotations.
2. Public application boundaries and high-dependency units.
3. Ownership gaps.
4. Requirement traceability.
5. Remaining descriptions and tags.

Do not fabricate requirement IDs to improve a percentage. Unresolved traceability should remain visible until the source requirement is known.

## Multiple services

Each service reports only its own catalog and `IMonicaApplicationOptions` identity. A gateway can aggregate `/framework/units/dashboard` snapshots, but Monica intentionally does not merge catalogs inside a service host.

## Requirement system integration

Keep requirement annotations stable when document storage or routes change. Update the host's `IProjectUnitRequirementLinkResolver` instead of rewriting source annotations. This separates durable traceability from UI navigation.

## Agent workflow

Agents should read repository facts before adding annotations, ask when ownership or requirement identity is ambiguous, and treat the four coverage dimensions independently. The dashboard is evidence of catalog completeness, not proof that the business implementation is correct.
