---
name: play-store-release
description: Prepare an Android release for Play Store rollout with checks and rollback plan. Use when shipping an AAB, staging a rollout, or updating store metadata.
---

# play-store-release

## Purpose

Make a release boring: confirm the artifact, the rollout, the metadata, and the rollback path before anyone presses publish.

## When to use

- A signed AAB is ready for internal testing or production.
- A staged rollout is being increased.
- Store listing, permissions, or data safety declarations changed with the app.

## Steps

1. Confirm `versionCode` is greater than the last release and `versionName` matches the planned release.
2. Name the build variant, signing config, and commit SHA that produced the artifact.
3. Run the release tests and lint. Record what passed, not just that CI is green.
4. Inspect the AAB: target API, included locales, and any large asset regression.
5. Draft user-facing release notes from merged work. Keep internal details out.
6. Compare store listing changes: screenshots, description, permissions, and data safety answers.
7. Choose a staged rollout percentage and a monitoring window. Do not jump to full rollout on the first upload.
8. Write the rollback trigger before publishing: crash-free users threshold, ANR rate, or a critical bug.
9. Get explicit approval on the notes and the rollout plan. Draft only; never publish without approval.
10. After release, watch crash and ANR metrics for the agreed window and report the result.

## Output format

Sections: Preflight, Artifact, Rollout plan, Store metadata, Rollback, Sign-off. Each section gets one short paragraph or a small list.

## Avoid

- Increasing a rollout because the upload succeeded.
- Shipping a permission or SDK change without updating data safety answers.
- Writing release notes from commit titles alone.
- Calling a release successful before the monitoring window ends.

## Example

Preflight: versionCode 142, versionName 3.8.0, commit `a574177`. Unit and lint tasks pass.

Artifact: `app-release.aab`, signed with the production keystore, 18.4 MB.

Rollout plan: 10% for 24 hours, then 50% if crash-free users stay above 99.5%.

Store metadata: screenshot 2 replaced; permissions unchanged; data safety answers unchanged.

Rollback: halt rollout if crash-free users drop below 99.0% or checkout fails on API 34.

Sign-off: pending owner approval.
