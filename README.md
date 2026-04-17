# Expense Tracking App

A React Native expense tracking application built with Expo, Firebase, and Cloudinary. Track your income and expenses across multiple wallets, upload receipt images, and visualize your spending with charts.

## Features

- Email/password authentication (Firebase Auth)
- Create and manage multiple wallets
- Add, edit, and delete income/expense transactions
- Upload transaction receipt images (Cloudinary)
- Visualize weekly/monthly spending with charts
- Persistent sessions on Web, Android and iOS
- File-based routing with Expo Router

## Tech Stack

- [Expo](https://expo.dev) (SDK 54) + [Expo Router](https://docs.expo.dev/router/introduction)
- [React Native](https://reactnative.dev) 0.81
- [Firebase](https://firebase.google.com) (Auth + Firestore)
- [Cloudinary](https://cloudinary.com) (image hosting)
- TypeScript

## Prerequisites

- Node.js 18+
- npm or yarn
- A Firebase project (Auth + Firestore enabled)
- A Cloudinary account with an unsigned upload preset
- Expo Go app, or an Android emulator / iOS simulator

## Setup

1. **Clone the repo**

   ```bash
   git clone <your-repo-url>
   cd expense-traking
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy `.env.example` to `.env` and fill in your own credentials:

   ```bash
   cp .env.example .env
   ```

   Required variables:

   | Variable | Where to get it |
   |----------|-----------------|
   | `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase console → Project settings → Your apps |
   | `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase console |
   | `EXPO_PUBLIC_FIREBASE_DATABASE_URL` | Firebase console |
   | `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase console |
   | `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase console |
   | `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase console |
   | `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase console |
   | `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
   | `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → unsigned preset |

   > **Note:** `EXPO_PUBLIC_*` variables are bundled into the client app. Do not put private server keys here. The `.env` file is git-ignored and must never be committed.

4. **Start the app**

   ```bash
   npx expo start
   ```

   Then choose one of:

   - [Expo Go](https://expo.dev/go) (scan the QR code)
   - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
   - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
   - Web browser

## Project Structure

```text
app/           # Expo Router screens (auth, tabs, modals)
components/    # Reusable UI components
config/        # Firebase initialization
constants/     # Theme, models, static data
context/       # React context providers (auth, etc.)
hooks/         # Custom hooks
services/      # Firestore + Cloudinary API wrappers
assets/        # Images and fonts
```

## Available Scripts

- `npm start` – start the Expo dev server
- `npm run android` – build and run on Android
- `npm run ios` – build and run on iOS
- `npm run web` – run in the browser
- `npm run lint` – lint the project
- `npm run reset-project` – reset to a blank `app/` directory

## Security Notes

- Never commit your `.env` file; only `.env.example` is tracked.
- Rotate any credentials that were previously pushed to a public repo.
- Keep your Firebase Security Rules strict — the client-side API key only identifies the project; Firestore rules are what protect your data.
- Use **unsigned** Cloudinary upload presets on the client; never ship an API secret in the app.
