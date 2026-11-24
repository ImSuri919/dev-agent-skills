---
name: refactor-simplify
description: Find code that can be deleted or merged without changing behavior. Use when a PR is larger than it needs to be or a module accumulated extra layers.
---

# refactor-simplify

## Purpose

Produce a small list of concrete deletions and merges that keep the same behavior and reduce the diff.

## When to use

- A pull request adds more code than the change seems to need.
- A helper or abstraction was added for one caller.
- A cleanup pass is planned before a release.

## Steps

1. List the files and functions added or changed by the work under review.
2. For each one, find its callers. If there are none, mark it for deletion.
3. Look for two branches doing the same thing with different variable names. Merge them.
4. Look for wrappers that only forward arguments. Call the underlying function directly.
5. Check config keys, feature flags, and test-only seams that no longer serve a purpose.
6. Ask what breaks if each item is removed. If the answer is "nothing", include it with that reason.
7. Keep changes that add a clear boundary, such as a parser at an external input. Do not delete those to shrink a diff.
8. Order the list by lines removed, then by risk.

## Output format

A table with four columns: item, action, reason, risk. Then one line with the total lines removed and the one change you would do first.

## Avoid

- Renaming things and calling it simplification.
- Removing a test seam while the reason for the seam still exists.
- Rewriting a working module without evidence that the new version is smaller.

## Example

| Item | Action | Reason | Risk |
| --- | --- | --- | --- |
| formatDate wrapper | Delete, call Intl directly | Forwards one argument, one caller | Low |
| legacy flag branch | Delete | Flag has been true for all tenants | Medium, check old clients |

About 80 lines removed. Start with the legacy flag branch.
