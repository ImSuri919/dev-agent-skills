---
name: gradle-build-triage
description: Turn a failing Gradle build into a supported cause and one fix. Use when an Android build fails, sync breaks, or a task returns an error.
---

# gradle-build-triage

## Purpose

Narrow a build failure to one task and one cause, then prove the fix with the same command. A build log is evidence; a guess is not.

## When to use

- `./gradlew build`, `assembleDebug`, or a Gradle sync fails.
- A dependency, plugin, or version bump breaks compilation.
- CI fails but the failure is not explained by a test assertion.

## Steps

1. Record the exact command, Gradle task, module, and working directory.
2. Capture the first real error and the last 40 lines of the log. Keep the stacktrace.
3. Classify the failure: configuration, dependency resolution, compilation, resource processing, signing, or task execution.
4. Write down the versions that matter: Gradle, Android Gradle Plugin, Kotlin, JDK, and the changed dependency.
5. Name the last known green state and list what changed since then.
6. Reproduce once with the same command. If it does not reproduce, report the environment difference and stop.
7. Isolate one variable: one task, one module, or one version change.
8. Make the smallest edit that addresses the classified cause.
9. Re-run the exact command. If it still fails, return to step 3 with the new log.
10. End with what you ruled out so nobody repeats the search.

## Output format

Six short sections: Failing task, Evidence, Cause, Change, Verification. End with one line named "Ruled out".

## Avoid

- Deleting caches or re-running with `--refresh-dependencies` as the first fix.
- Changing several versions at once and crediting the wrong one.
- Quoting only the final exception without the task that produced it.
- Saying it works without pasting the command and result.

## Example

Failing task: `:app:compileDebugKotlin` after an AGP bump.

Evidence: `e: Incompatible plugin request: AGP 8.5 requires Gradle 8.7, wrapper is 8.4`.

Cause: The wrapper version was not updated with the plugin.

Change: Set `distributionUrl` to Gradle 8.7 in `gradle-wrapper.properties`.

Verification: `./gradlew assembleDebug` passes in 1m 42s.

Ruled out: dependency resolution, signing config, Kotlin source changes.
