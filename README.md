# Expense Tracking App — React Native + Expo Personal Finance Manager

> Free, open-source **expense tracker** and **budgeting app** built with React Native, Expo Router, Firebase, and Cloudinary. Manage **multiple wallets**, log **income and expense transactions**, attach **receipt photos**, and visualize **weekly and monthly spending** with interactive charts — on **Android, iOS, and the Web**.

**Keywords:** expense tracker, budgeting app, personal finance, money manager, React Native, Expo, Firebase, Cloudinary, wallet app, receipt scanner, spending tracker, income tracker, financial dashboard, cross-platform mobile app, TypeScript.

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

## SEO (Web Build)

The Expo web target outputs a **static site** (`"output": "static"` in [app.json](app.json)), so the app can be indexed by search engines when deployed. Use the steps below to make the build **SEO-friendly**.

### 1. Page metadata

Expo Router supports per-route `<head>` tags via `expo-router/head`. Add a unique **title**, **meta description**, and **Open Graph / Twitter Card** tags on every top-level route so pages render with rich previews when shared on Google, LinkedIn, X, and Slack.

```tsx
import Head from 'expo-router/head';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard — Expense Tracker</title>
        <meta name="description" content="See your weekly and monthly spending at a glance." />
        <meta property="og:title" content="Expense Tracker — Personal Finance Dashboard" />
        <meta property="og:description" content="Track income, expenses, and wallets across devices." />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {/* ... */}
    </>
  );
}
```

### 2. Semantic, crawlable content

- Use headings (`<h1>`–`<h3>`) for landing-page content rather than styled `<Text>` only.
- Provide `alt` text for images and `accessibilityLabel` for icon-only buttons — the same attributes help screen readers **and** crawlers.
- Avoid blocking initial content behind authentication on marketing pages; render a **public landing route** with keyword-rich copy.

### 3. Site-wide SEO files

Add the following to the `public/` directory so they are served at the site root:

- `public/robots.txt` — allow indexing and point to your sitemap.
- `public/sitemap.xml` — list every public route (generate at build time).
- `public/favicon.png` — already configured in [app.json](app.json#L27).

### 4. Performance & Core Web Vitals

Google ranks on **Core Web Vitals** (LCP, INP, CLS). This project already helps by:

- Using `expo-image` with caching and automatic `contentFit` to minimize **CLS**.
- Shipping static assets via Cloudinary (CDN-backed) to improve **LCP**.
- Using `@shopify/flash-list` for virtualized lists to keep **INP** low.

When deploying, prefer a **CDN + gzip/brotli** host (Vercel, Netlify, Cloudflare Pages) and enable HTTP/2 or HTTP/3.

### 5. Structured data

On public pages, include [schema.org](https://schema.org) JSON-LD (e.g. `SoftwareApplication`, `FAQPage`, `BreadcrumbList`) inside `<Head>` to unlock rich results in Google search.

### 6. Canonical URLs & i18n

- Set `<link rel="canonical" href="https://yourdomain.com/path" />` per route to avoid duplicate-content penalties.
- If you localize the app, add `hreflang` tags for each supported language.

### 7. Mobile app store ASO

For the **App Store** and **Google Play**, optimize the store listing (title, subtitle, keywords field, screenshots, promotional text). Mirror the web keywords list above for consistent discoverability across web and mobile.

## Security Notes

- Never commit your `.env` file; only `.env.example` is tracked.
- Rotate any credentials that were previously pushed to a public repo.
- Keep your Firebase Security Rules strict — the client-side API key only identifies the project; Firestore rules are what protect your data.
- Use **unsigned** Cloudinary upload presets on the client; never ship an API secret in the app.
