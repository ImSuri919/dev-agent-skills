---
name: android-permissions-check
description: Audit Android permissions and manifest declarations against what the app actually uses. Use when adding an SDK, preparing a release, or reducing requested permissions.
---

# android-permissions-check

## Purpose

Remove permissions the app does not need and justify the ones it keeps. The merged manifest is the source of truth, not the one file you remember editing.

## When to use

- A new SDK may have added permissions through its own manifest.
- A release checklist asks for a permission review.
- Users report a scary permission prompt on install or first launch.

## Steps

1. Read the merged manifest, not only `AndroidManifest.xml`. List every permission with its source module or library.
2. Mark each permission as install-time or runtime, and name the Android version rules that apply.
3. Map each permission to a user-facing feature. If nobody can name the feature, mark it for removal.
4. Check what each SDK actually needs at runtime. Question permissions that only appear in its manifest.
5. For dangerous permissions, check the in-app rationale and the denial path.
6. Watch for Android 12+ changes such as nearby devices and the exact location forms.
7. Remove one permission at a time and build the affected variant.
8. Test the denial path on a device with the permission revoked.
9. Re-check the merged manifest after removal and record what disappeared.

## Output format

A table with five columns: Permission, Source, Feature, Needed?, Action. Then two sections named "Removed" and "Denial path verified".

## Avoid

- Keeping a permission because an SDK might use it later.
- Assuming a library's README lists every manifest entry.
- Suppressing a lint warning about an unused permission.
- Adding a dangerous permission without a user-visible reason.

## Example

| Permission | Source | Feature | Needed? | Action |
| --- | --- | --- | --- | --- |
| `CAMERA` | `app` | Profile photo | Yes | Add rationale before request |
| `READ_MEDIA_IMAGES` | `:gallery` | Old picker fallback | No | Remove SDK and declaration |
| `ACCESS_FINE_LOCATION` | `ads-sdk` | Ad targeting | No | Disable SDK feature |

Removed: `READ_MEDIA_IMAGES` and `ACCESS_FINE_LOCATION` from the merged manifest.

Denial path verified: profile photo shows explanatory text and does not crash on API 34.
