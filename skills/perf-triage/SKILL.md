---
name: perf-triage
description: Find the measured cause of a slowdown before changing code. Use when a page, endpoint, or job feels slow and you need evidence for where time goes.
---

# perf-triage

## Purpose

Turn "it is slow" into a measured statement about one component, then verify that a fix moves that measurement.

## When to use

- A page, API route, or background job is reported as slow.
- A performance change is proposed without a measurement.
- An alert fires on latency or response time.

## Steps

1. Define the symptom in numbers: which operation, what duration, compared with what baseline, on what environment.
2. Reproduce it once with the same inputs. If you cannot reproduce it, record what varies and stop.
3. Measure before any edit. Use a profiler, server timing, query log, or browser network panel. Save the numbers.
4. Divide the time into buckets: client render, network, server logic, database, external call, queue wait.
5. Pick the largest bucket. Drill into it once, with a second measurement.
6. Change one thing that affects that bucket.
7. Measure again with the same inputs. Report the delta, not the absolute number alone.
8. Record what you ruled out so the next person does not repeat it.

## Output format

Five short sections: symptom with numbers, measurement, cause, change, verification. End with one line named "Ruled out".

## Avoid

- Rewriting code before the first measurement.
- Quoting a mean when a few requests dominate the tail. Say which you measured.
- Calling a fix successful because the code looks cleaner.

## Example

Symptom: /api/report takes 2.4 s at p95, up from 400 ms last week.

Measurement: 1.9 s in one query that lost its index after a schema change.

Change: Restore the composite index on (tenant_id, created_at).

Verification: p95 back to 430 ms with the same input set.

Ruled out: client render (60 ms), external billing call (80 ms).
