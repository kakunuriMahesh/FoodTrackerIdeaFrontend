# Version Update Guide

## Files to Update

| # | File | Field | Current Value | Change To |
|---|------|-------|---------------|-----------|
| 1 | `app.json` | `version` | `"1.0.0"` | new version (e.g. `"1.0.1"`) |
| 2 | `package.json` | `version` | `"1.0.0"` | same new version |
| 3 | `android/app/build.gradle` | `versionName` | `"1.0.0"` | same new version |
| 4 | `android/app/build.gradle` | `versionCode` | `1` | increment by 1 (e.g. `2`) |

## Important Notes

- **EAS Build**: `eas.json` has `"appVersionSource": "remote"` and `"autoIncrement": true` for production builds. EAS Cloud manages versioning automatically on their servers, so local files may be overridden during remote EAS builds.
- **versionCode** (Android): Must be a strictly increasing integer. Always increment by at least 1 for each release. Google Play enforces this — a build with a lower versionCode than the live one will be rejected.
- **versionName** (SemVer format `major.minor.patch`): User-facing version string. Follow semantic versioning.
- **package-lock.json**: Updates automatically when you run `npm install` after changing `package.json`.

## Versioning Flow

### For Local Builds (`expo run:android`)
1. Update all 4 files above manually.
2. Run `npm install` to sync `package-lock.json`.

### For EAS Remote Builds (`eas build`)
1. Update `app.json` version (your source of truth).
2. EAS will handle `versionCode`/`versionName` increment based on its remote config.
3. You can also bump version via `eas build --auto-increment` or rely on `autoIncrement: true` in `eas.json`.

## Semantic Versioning (SemVer)

Given version `MAJOR.MINOR.PATCH`:
- **MAJOR** — incompatible API changes (breaking changes)
- **MINOR** — backward-compatible new functionality
- **PATCH** — backward-compatible bug fixes
