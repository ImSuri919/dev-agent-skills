---
name: adb-debug
description: Debug a device or emulator issue with adb and logcat using evidence, not guesses. Use when an app crashes, misbehaves on device, or a device is not detected.
---

# adb-debug

## Purpose

Get a reproducible capture from a device or emulator, narrow it to one variable, and prove the fix on the same setup.

## When to use

- An app crashes or freezes only on a real device.
- A device is offline, unauthorized, or not listed by adb.
- A permission, sensor, or background behaviour differs from the emulator.

## Steps

1. Confirm the target with `adb devices -l`. Record the model, Android API level, and serial if more than one device is connected.
2. Record the app package, version name, version code, and build type.
3. Reproduce the problem once before capturing anything that changes device state.
4. Start a filtered logcat with a timestamp and the app PID. Keep the capture, do not paste the entire buffer.
5. Note the exact action that produced the failure and the time it happened.
6. Check one hypothesis at a time: permission denied, missing feature, null state, lifecycle restart, or an SDK API difference.
7. Compare against one other device or emulator with a different API level when the cause is still unclear.
8. Apply one fix. Rebuild and re-run the same action on the same device.
9. Remove any sensitive token, phone number, or email from the capture before sharing it.

## Output format

Six sections: Device, Reproduction, Log evidence, Cause, Fix, Verification. Quote only the lines that support the claim.

## Avoid

- Running `pm clear`, reinstalling, or restarting adb before taking a capture.
- Dumping unfiltered logcat and calling it evidence.
- Blaming the device without naming its API level and model.
- Sharing logs that contain personal data or secrets.

## Example

Device: Pixel 6a, Android 14, API 34, serial `emulator-5554`.

Reproduction: Open profile, tap Add photo, deny camera permission, return to the screen.

Log evidence: `java.lang.SecurityException: Permission denied: android.permission.CAMERA` at `PhotoSheetKt.openCamera`.

Cause: The denial path assumes the camera is available and calls `startActivity` anyway.

Fix: Show a rationale and keep the button disabled while the permission is denied.

Verification: Same steps on API 34 no longer crash; `adb logcat` has no exception for the package.
