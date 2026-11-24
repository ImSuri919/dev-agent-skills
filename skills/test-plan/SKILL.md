---
name: test-plan
description: Decide which tests are worth writing for a change and which ones are not. Use when adding tests, reviewing a PR that adds tests, or cleaning up a test suite.
---

# test-plan

## Purpose

Produce a short list of test cases that protect the behavior that matters, at the cheapest level that catches a regression.

## When to use

- A new feature or bug fix needs tests.
- A pull request adds tests and you need to judge whether they earn their place.
- A test suite is slow or brittle and needs pruning.

## Steps

1. Write down the behavior being changed in one sentence. If you cannot, stop and ask.
2. List the paths through that behavior: the happy path, each validation failure, and each boundary value.
3. For each path, pick the lowest level that observes it: pure function, component, API, or end to end.
4. Keep one end to end test for the whole user journey. Cover details below that line with smaller tests.
5. Remove cases that only check wiring, implementation details, or framework behavior.
6. For each remaining case, name the bug it would catch. Drop the case if you cannot name one.
7. Check the tests for clock, network, and ordering dependencies before calling the plan done.

## Output format

A table with three columns: case, level, bug it catches. Follow it with one line listing cases deliberately left out and why.

## Avoid

- Covering every branch of a pure helper with a test that restates the code.
- Tests that need a sleeping timer or a fixed delay to pass.
- Adding a test because a coverage number went down.

## Example

| Case | Level | Bug it catches |
| --- | --- | --- |
| Valid coupon lowers total | Unit | Discount is ignored |
| Expired coupon is rejected | Unit | Expiry check removed |
| Checkout shows discounted total | End to end | UI ignores the API value |

Left out: coupon field rendering, already covered by the checkout journey.
