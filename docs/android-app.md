# Dev Agent Skills Android app

A small Android app that opens the [browser playground](https://imsuri919.github.io/dev-agent-skills/) in a focused WebView shell. It keeps the repo's skills, router and Android pack one tap away from a phone.

## Download

- Latest APK: [dev-agent-skills-1.0.apk](https://github.com/ImSuri919/dev-agent-skills/releases/download/android-app-v1.0.0/dev-agent-skills-1.0.apk)
- Release page: [android-app-v1.0.0](https://github.com/ImSuri919/dev-agent-skills/releases/tag/android-app-v1.0.0)

Android 7.0 (API 24) or newer is required. The APK is signed with the Android debug key so it installs without a private keystore; it is not meant for Play Store distribution.

## What it does

- Opens the live playground for all 16 skills.
- Keeps navigation inside the app for the playground domain.
- Opens GitHub and other links in your browser.
- Shows a build progress bar and a REFRESH button.
- Shows an offline card with a retry action when the network is unavailable.

## Build it yourself

You need JDK 17 and the Android SDK with platform 35. From the repo root:

```sh
cd android
echo "sdk.dir=$ANDROID_HOME" > local.properties
gradle :app:assembleRelease --no-daemon
```

The APK is written to `android/app/build/outputs/apk/release/app-release.apk`.

GitHub Actions builds the same file on every `android-app-v*` tag and attaches it to a release. You can also trigger the workflow manually with `workflow_dispatch`.

## Why it is thin

The playground is already a static site. Wrapping it avoids maintaining two copies of the skill catalog: the site reads `site/data.js`, which is generated from `skills.manifest.json`. The app stays small and the source of truth remains the repo.
