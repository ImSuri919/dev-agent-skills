---
name: release-notes
description: Draft user-facing release notes from merged work. Use when preparing a release, bumping a version, or writing a changelog entry people will read.
---

# release-notes

## Purpose

Turn a list of commits into a short note that tells a user what changed for them and what they need to do.

## When to use

- Cutting a release and writing the notes.
- Turning a branch into a changelog entry.
- Writing the text that goes with a version bump.

## Steps

1. Find the exact range: the previous tag and the new one. Do not guess from dates.
2. Read every commit subject and body in that range. Open the diff for anything unclear.
3. Drop commits that only affect internals: refactors, CI, dependency bumps with no visible effect.
4. Group the rest by user impact: Added, Fixed, Changed, Removed.
5. Write each item as one sentence in the language of the user. Name the feature or screen, not the file.
6. Add an Upgrade notes section only if there is an action, a breaking change, or a migration.
7. Verify every contributor handle against the commit author before thanking anyone.
8. Compare the draft with the diff once more and check no user-visible change is missing.

## Output format

A heading with the version and date, then the four groups with bullets. Add Upgrade notes when needed. Add a Credits line with verified handles only.

## Avoid

- Copying commit subjects verbatim into the notes.
- Listing internal work as if it were a feature.
- Thanking an author you have not verified.

## Example

## v2.4.0 (2026-11-24)

### Added
- CSV export on the orders page.

### Fixed
- Filters no longer reset when the page reloads.

### Upgrade notes
- Sessions now require a refresh token. Sign in again after updating.
