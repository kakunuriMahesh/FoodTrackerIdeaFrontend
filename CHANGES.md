# Changes Made

## App Logo & Splash Screen Update

### 1. App Icon Replaced
- **Before**: `assets/icon.png` was used as the app icon
- **After**: `assets/PlateSpoons.png` is now the app icon

### 2. Splash Screen Updated
- **Before**: `assets/splash-icon.png` was displayed on app launch with `contain` resize mode
- **After**: `assets/PlateSpoons.png` is now the splash screen image (same `contain` resize mode, white background)

### 3. Android Adaptive Icon Updated
- **Before**: `assets/adaptive-icon.png` was the Android adaptive icon foreground
- **After**: `assets/PlateSpoons.png` is now the Android adaptive icon foreground

### 4. Web Favicon Updated
- **Before**: `assets/favicon.png` was the web favicon
- **After**: `assets/PlateSpoons.png` is now the web favicon

### 5. Removed Unused/Default Images
The following files were deleted from `assets/`:
| File | Reason |
|------|--------|
| `icon.png` | Replaced by `PlateSpoons.png` |
| `splash-icon.png` | Replaced by `PlateSpoons.png` |
| `adaptive-icon.png` | Replaced by `PlateSpoons.png` |
| `favicon.png` | Replaced by `PlateSpoons.png` |
| `Leaf.png` | Unused in any source file |

### 6. Configuration (`app.json`)
All image paths in `app.json` now point to `./assets/PlateSpoons.png`:
- `expo.icon`
- `expo.splash.image`
- `expo.android.adaptiveIcon.foregroundImage`
- `expo.web.favicon`

### Retained Assets
The following images were kept as they are actively referenced in source code:
- `DropImgLogin.png` — used in `LoginScreen.tsx`
- `ListPad.png` — used in `HomeScreen.tsx`
- `PlateSpoons.png` — used in `LoginScreen.tsx` and now as the app logo
- `ProfileBg.png` — used in `ProfileScreen.tsx`
