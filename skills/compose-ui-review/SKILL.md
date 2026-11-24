---
name: compose-ui-review
description: Review Jetpack Compose UI code for state, recomposition and accessibility before merge. Use when a Compose screen or component needs a review.
---

# compose-ui-review

## Purpose

Find the few Compose problems that change behaviour, cost frames, or block users. Leave style opinions out unless they break a rule the project already uses.

## When to use

- A new Compose screen or component is in a pull request.
- A screen janks, loses state on rotation, or behaves differently after navigation.
- Accessibility or keyboard access is part of the acceptance criteria.

## Steps

1. Name the screen and its single source of truth for state.
2. Trace one user event from click to state change to rendering.
3. Check that state is hoisted to the right owner and that the composable stays reusable.
4. Look for unstable parameters, lambdas created in a loop, or work done during composition.
5. Check modifier order, sizing, and how the screen behaves at large font sizes.
6. Check semantics: content descriptions, heading roles, focus order, and that decorative elements are hidden from accessibility.
7. Check previews for loading, empty, error, and success states.
8. Check back navigation and state restoration with a process or rotation change.
9. Verify a claim with a UI test, a preview, or a profiler trace before calling it a finding.

## Output format

A findings table with four columns: Severity, Location, Why, Fix. Then two short sections named "Checked clean" and "Open questions".

## Avoid

- Rewriting the whole screen in the review comment.
- Calling recomposition a bug without a trace or an obvious state mistake.
- Ignoring focus order because the design looks correct on a screenshot.
- Reporting naming preferences as blockers.

## Example

| Severity | Location | Why | Fix |
| --- | --- | --- | --- |
| High | `FeedScreen.kt:82` | `offset` is recreating state on each scroll event, resetting the selected tab | Hoist `selectedTab` to the view model |
| Medium | `FeedCard.kt:31` | Image has no content description | Add a description from the item title |

Checked clean: previews exist for empty and error states.

Open questions: should the filter row keep its scroll position after rotation?
