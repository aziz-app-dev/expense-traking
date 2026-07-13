<div align="center">

<img src="./assets/images/icon.png" width="120" alt="Expense Tracker logo" />

# 💸 Expense Tracker

### Your money, beautifully organized — powered by AI.

A cross-platform personal-finance app to track **wallets**, log **income & expenses**, attach **receipts**, visualize **spending trends**, and get **AI-driven reports, forecasts, and income ideas** — on Android, iOS, and Web.

<br/>

![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=for-the-badge&logo=expo&logoColor=white)
![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)
![Groq](https://img.shields.io/badge/AI-Groq%20LLaMA%203.3-F55036?style=for-the-badge&logo=meta&logoColor=white)

</div>

---

## ✨ Overview

**Expense Tracker** is a modern money manager built with **React Native + Expo Router**. It uses **Firebase** for authentication and real-time data, **Cloudinary** for receipt image hosting, and **Groq's LLaMA 3.3** model to turn your raw transactions into plain-English insights — spending reports, spending forecasts (with charts), and personalized ways to grow your income.

---

## 📱 Features

### 💼 Core

- 🔐 **Email / password auth** with Firebase — persistent sessions on Web, Android & iOS
- 👛 **Multiple wallets** — create, edit, and delete, each with its own balance
- 🔁 **Transactions** — add / edit / delete income & expenses, auto-updating wallet balances
- 🧾 **Receipt photos** — attach an image to any transaction (Cloudinary CDN)
- 📊 **Statistics** — Weekly / Monthly / Yearly bar charts of income vs. expense
- 🔎 **All Transactions screen** — full history with **search** + **filters** (type & time period) behind a clean filter icon

### 🤖 AI-Powered (Groq · LLaMA 3.3)

- 📝 **AI Report** — a friendly summary of the selected period: overview, top spending, savings, and tips
- 🔮 **AI Forecast** — predicts next week/month/year from your trends, shown as a **bar chart** (recent periods + predicted "Next") with a written breakdown
- 💡 **Grow My Income** — pick your field (e.g. *Software Development*) and get tailored income streams, skills to learn, quick wins, and an earning range — your preference is **remembered** across launches
- ⚡ **Smart caching** — unchanged data reuses the previous AI result instead of calling the API again

### 🎨 Experience

- 🖌️ **Custom themed alert modal** app-wide (no default OS pop-ups)
- 🧭 **File-based routing** with Expo Router + typed routes
- 🌗 Dark, focused UI with reusable components and haptics

---

## 🤖 AI Integration

The app integrates **[Groq](https://groq.com)** (OpenAI-compatible API) running the
**`llama-3.3-70b-versatile`** model to turn raw transactions into useful, plain-English
insights. All AI logic lives in [`services/ai_services.ts`](services/ai_services.ts).

### What it powers

| Feature | What it does | Data sent to the model |
|---|---|---|
| **AI Report** | Summarizes the selected period — overview, top spending, savings, tips | An **aggregated summary** (totals + per-category breakdown), not raw docs |
| **AI Forecast** | Predicts next week/month/year and renders it as a **bar chart** (recent periods + predicted "Next") | Per-period income/expense **history**; returns strict JSON for the chart |
| **Grow My Income** | Concrete, numbered side-hustle ideas tailored to a chosen field (e.g. *Software Development*), each with a how-to and an estimated monthly range | The selected **industry** + total recorded income as loose context |

### How it works

1. Transactions are **aggregated locally** (per-category totals, per-period history) before any request — raw documents are never shipped to the model, keeping calls small and fast.
2. Requests go to `https://api.groq.com/openai/v1/chat/completions` with the key from `EXPO_PUBLIC_GROQ_API_KEY`. The forecast uses **JSON mode** (`response_format: json_object`) so its numbers can drive the chart.
3. Results are **cached** by a signature of the underlying data (period + kind + transactions, or industry + income bracket). If nothing changed, the previous result is reused — **no repeat API call**.
4. The industry preference for **Grow My Income** is remembered across launches via **AsyncStorage**.
5. Every AI call is **logged** (`[AI] …`) so you can trace key presence, request status, timing, and token usage in the Metro console.

> **Setup:** add `EXPO_PUBLIC_GROQ_API_KEY` to `.env` (get a free key at
> [console.groq.com/keys](https://console.groq.com/keys)) and restart with
> `npx expo start -c`. Since `EXPO_PUBLIC_*` values are bundled into the client,
> proxy AI calls through a backend for production.

---

## 🖼️ Screenshots

> _Add your screenshots to `assets/screenshots/` and drop them in below._

| Home | Statistics | AI Forecast | Income Ideas |
|:---:|:---:|:---:|:---:|
| _coming soon_ | _coming soon_ | _coming soon_ | _coming soon_ |

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [Expo](https://expo.dev) SDK 54 · [Expo Router](https://docs.expo.dev/router/introduction) |
| **UI** | [React Native](https://reactnative.dev) 0.81 · TypeScript |
| **Auth & Data** | [Firebase](https://firebase.google.com) Auth + Firestore |
| **Media** | [Cloudinary](https://cloudinary.com) (unsigned uploads) |
| **AI** | [Groq](https://groq.com) — `llama-3.3-70b-versatile` |
| **Charts** | [react-native-gifted-charts](https://github.com/Abhinandan-Kushwaha/react-native-gifted-charts) |
| **Lists** | [@shopify/flash-list](https://shopify.github.io/flash-list/) |
| **Storage** | [AsyncStorage](https://react-native-async-storage.github.io/async-storage/) |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js 18+** and npm
- A **Firebase** project (Auth + Firestore enabled)
- A **Cloudinary** account with an unsigned upload preset
- A free **Groq API key** — [console.groq.com/keys](https://console.groq.com/keys)
- Expo Go, or an Android emulator / iOS simulator

### Installation

```bash
# 1. Clone
git clone <your-repo-url>
cd expense-traking

# 2. Install dependencies
npm install

# 3. Create your environment file
cp .env.example .env      # then fill in your credentials (see below)

# 4. Start the app
npx expo start
```

Then open it in **Expo Go** (scan the QR), an **emulator/simulator**, or the **web** browser.

> 💡 After changing `.env`, restart the bundler with a cleared cache so the new
> values are picked up: `npx expo start -c`.

---

## 🔑 Environment Variables

Copy `.env.example` → `.env` and fill in your own values:

| Variable | Where to get it |
|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | Firebase console → Project settings → Your apps |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | Firebase console |
| `EXPO_PUBLIC_FIREBASE_DATABASE_URL` | Firebase console |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | Firebase console |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | Firebase console |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | Firebase console |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | Firebase console |
| `EXPO_PUBLIC_CLOUDINARY_CLOUD_NAME` | Cloudinary dashboard |
| `EXPO_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | Cloudinary → Settings → Upload → unsigned preset |
| `EXPO_PUBLIC_GROQ_API_KEY` | [Groq console → API Keys](https://console.groq.com/keys) |

> ⚠️ `EXPO_PUBLIC_*` variables are **bundled into the client app** and can be
> extracted from a shipped build. Don't put private server secrets here. For
> production, proxy AI calls through a backend. `.env` is git-ignored and must
> never be committed.

---

## 📂 Project Structure

```text
app/            # Expo Router screens
 ├─ (auth)/     #   login, register, welcome
 ├─ (tabs)/     #   home, statistics, wallet, profile
 ├─ (modals)/   #   transaction, wallet, profile, search
 └─ all_transactions.tsx   # full history + search & filters
components/     # Reusable UI (custom_alert, income_ideas, charts, inputs…)
config/         # Firebase initialization
constants/      # Theme, models, categories, sizes
context/        # Auth provider
hooks/          # Custom hooks (useFetchData…)
services/       # Firestore, Cloudinary & AI (Groq) wrappers
scripts/        # Utilities (seed_test_data.js)
assets/         # Images & fonts
```

---

## 📜 Available Scripts

| Command | Description |
|---|---|
| `npm start` | Start the Expo dev server |
| `npm run android` | Build & run on Android |
| `npm run ios` | Build & run on iOS |
| `npm run web` | Run in the browser |
| `npm run lint` | Lint the project |
| `npm run reset-project` | Reset to a blank `app/` directory |

### 🌱 Seed demo data

Populate a test account with sample wallets & transactions:

```bash
# loads .env, signs in (or creates) the tester account, seeds Firestore
set -a && . ./.env && set +a && node scripts/seed_test_data.js
```

---

## 🔒 Security Notes

- Never commit `.env` — only `.env.example` is tracked.
- Rotate any credentials that were ever pushed to a public repo.
- Keep **Firestore Security Rules** strict — the client API key only identifies the project; rules are what protect your data.
- Use **unsigned** Cloudinary presets on the client; never ship an API secret.
- The Groq key is client-side (`EXPO_PUBLIC_`) — fine for demos, but proxy it via a backend for production.

---

<details>
<summary><strong>🔍 SEO Guide (Expo Web build)</strong></summary>

<br/>

The Expo web target outputs a **static site** (`"output": "static"` in [app.json](app.json)), so it can be indexed by search engines when deployed.

**1. Page metadata** — use `expo-router/head` for per-route `<title>`, meta description, and Open Graph / Twitter Card tags:

```tsx
import Head from 'expo-router/head';

export default function Dashboard() {
  return (
    <>
      <Head>
        <title>Dashboard — Expense Tracker</title>
        <meta name="description" content="See your weekly and monthly spending at a glance." />
        <meta property="og:title" content="Expense Tracker — Personal Finance Dashboard" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
      </Head>
      {/* ... */}
    </>
  );
}
```

**2. Semantic content** — use real headings, `alt` text, and `accessibilityLabel` (helps screen readers **and** crawlers); render a public, keyword-rich landing route not gated behind auth.

**3. Site files** — add `public/robots.txt`, `public/sitemap.xml`, and `public/favicon.png`.

**4. Core Web Vitals** — this project already uses `expo-image` (caching, low CLS), Cloudinary CDN (better LCP), and FlashList (low INP). Deploy behind a CDN with brotli/gzip and HTTP/2+.

**5. Structured data** — add [schema.org](https://schema.org) JSON-LD (`SoftwareApplication`, `FAQPage`) inside `<Head>`.

**6. Canonical & i18n** — set `<link rel="canonical">` per route and `hreflang` tags if localized.

**7. App-store ASO** — optimize title, subtitle, keywords, and screenshots for Google Play / App Store.

</details>

---

<div align="center">

Built with ❤️ using **React Native**, **Expo**, **Firebase** & **Groq AI**.

⭐ Star this repo if you find it useful!

</div>
