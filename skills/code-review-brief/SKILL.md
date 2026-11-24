---
name: code-review-brief
description: Turn a diff or pull request into a short review brief a maintainer can act on. Use when asked to review a PR, summarize changes, or decide what to look at before approving.
---

# code-review-brief

## Purpose

Give a maintainer the smallest useful summary of a change: what it does, what could break, and where to look first.

## When to use

- Asked to review a pull request or a diff.
- Asked what to look at before approving a branch.
- Handing a change to someone else for review.

## Steps

1. Read the PR title, description, and linked issue before the diff. Note the intended behavior.
2. List changed files and group them by purpose: feature, test, config, generated output.
3. Check for behavior that changes at runtime: public API, data shape, auth, migrations, feature flags.
4. Read the tests. Name the cases they cover and the cases a reviewer must verify by hand.
5. Look for concrete risks: unbounded loops, new network calls, changed defaults, missing cleanup.
6. Order findings by impact. A broken data path comes before a naming preference.

## Output format

Five short sections, in this order:

1. What changed: 2 to 4 sentences.
2. Risk: high, medium, or low, with one reason.
3. Look at: a numbered list of files or lines, each with the question a reviewer should answer.
4. Tests: what exists and what is manual.
5. Blockers: only real ones. Write "None found" if there are none.

## Avoid

- Restating the diff file by file.
- Presenting style preferences as blockers.
- Claiming something is safe because tests pass without naming which tests.

## Example

What changed: Adds a cached lookup to the product page and a test for the cache hit path.

Risk: Medium. The cache key omits the user's region, so one region can see another region's price.

Look at:
1. src/product/lookup.ts line 44: does the key include region?
2. src/product/lookup.ts line 61: is the cache invalidated when the price changes?

Tests: Cache hit and miss are covered. Regional pricing is manual.

Blockers: Confirm the cache key before merging.
