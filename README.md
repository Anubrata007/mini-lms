# mini-lms# MiniLMS — React Native Learning Management System

A production-ready mobile LMS app built with React Native Expo, demonstrating native features, WebView integration, state management, and API integration.

---

## Tech Stack

| Category | Technology |
|---|---|
| Framework | React Native Expo SDK 54 |
| Language | TypeScript (strict mode) |
| Navigation | Expo Router (file-based) |
| Styling | NativeWind (Tailwind CSS) |
| State Management | React Context + useReducer |
| Secure Storage | Expo SecureStore |
| App Storage | AsyncStorage |
| API Client | Axios with interceptors |
| Forms | React Hook Form + Zod |
| Notifications | expo-notifications |
| WebView | react-native-webview |
| Image | expo-image + expo-image-picker |

---

## Features

### Authentication
- Login and Register with form validation
- Tokens stored securely in Expo SecureStore
- Auto-login on app restart
- Token refresh via Axios interceptor
- Logout with confirmation

### Course Catalog
- Fetches courses from freeapi.app public API
- Infinite scroll with pagination
- Pull-to-refresh
- Real-time search filtering
- Skeleton loading states
- Offline banner when no internet

### Course Detail
- Full course information display
- Instructor profile card
- Enroll with persistence to AsyncStorage
- Bookmark toggle with local storage
- Share course via native share sheet

### WebView Integration
- Embedded course content viewer
- Local HTML template rendered in WebView
- Bidirectional communication:
  - Native → WebView: injects course data via JavaScript
  - WebView → Native: lesson completion, progress updates
- Progress persisted to AsyncStorage
- Native alert on course completion
- Error handling with retry

### Notifications (requires development build)
- Permission request on first launch
- Bookmark milestone notification at 5 bookmarks
- Enrollment confirmation notification
- 24h inactivity reminder (checked on app open)
- Daily reminder scheduled at 9:00 AM

### Profile
- User info display with avatar
- Real enrolled and bookmark counts
- Notification toggle settings
- Logout

---

## Prerequisites

Make sure you have these installed:

- Node.js 18 or higher
- npm or yarn
- Git
- Expo Go app on your phone **or** a development build APK (see below)
- Android Studio (optional — for emulator)

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone https://github.com/yourusername/mini-lms.git
cd mini-lms
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Environment Variables

Create a `.env` file in the project root:
```
EXPO_PUBLIC_API_BASE_URL=https://api.freeapi.app
```

> Note: The API base URL is also hardcoded in `src/utils/constants.ts` as a fallback, so this step is optional.

### 4. Start the Development Server
```bash
npx expo start --clear
```

---

## Running the App

### Option A — Expo Go (Limited)

> Expo Go on SDK 54 does not support push notifications or background tasks.
> All other features work normally.

1. Install **Expo Go** from the Play Store or App Store
2. Run `npx expo start`
3. Scan the QR code with Expo Go

Install **APK**
https://expo.dev/accounts/anubrata95/projects/mini-lms/builds/654e632b-aaf8-4ae7-87b7-56325d9df180