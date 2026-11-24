---
name: debug-triage
description: Narrow an error spike or reported bug to a supported claim with evidence. Use when production errors rise, a bug report arrives, or a failure needs a first pass.
---

# debug-triage

## Purpose

Turn a vague failure into a scoped statement: where it happens, how often, and which explanation survives the checks.

## When to use

- An error rate climbs and you need a first pass.
- A user reports a bug with few details.
- A failing test or job needs a cause before a fix.

## Steps

1. State the observation in plain terms: what failed, for whom, and since when. Do not name a cause yet.
2. Bound it. Compare the count before and after the start. Check whether one route, tenant, region, or version dominates.
3. Find one concrete example: a request ID, trace, log line, or failing input. Keep the identifiers in the notes.
4. Read the first error, not only the last one in the stack. Note any release or config change near the start time.
5. Write two or three hypotheses. For each, name the evidence that would confirm it and the evidence that would rule it out.
6. Test the cheapest distinguishing check first. Change one thing at a time.
7. Mark each hypothesis as confirmed, ruled out, or open. Stop when one is confirmed or when you need access you do not have.
8. Say what you did not check and what you need next.

## Output format

Five sections: observation, scope with counts, evidence with identifiers, hypotheses with status, next check. Label the confidence as high, medium, or low and say why.

## Avoid

- Calling a hypothesis a cause before a distinguishing check.
- Counting log lines without checking whether they are one event repeated.
- Broadening the target beyond what the observation supports.

## Example

Observation: Checkout returns 500 for some users since 09:10 UTC.

Scope: 42 failures out of 18,000 checkouts, all on app version 3.8.1.

Evidence: request id 7fd2a9, log line "missing refresh token", one deploy at 09:04.

Hypotheses: token refresh regression, confirmed by replaying the request with the previous version. Upstream outage, ruled out, other routes use the same provider and are healthy.

Next check: confirm the fix on the staging release. Confidence high.
