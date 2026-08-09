# Mini Desk Dashboard 📱⚡

A minimalist, mobile-first landscape web app designed to run on repurposed smartphones, tablets, or workstation monitors as a dedicated productivity screen.

Built with **Next.js**, **React**, **Tailwind CSS**, and **Lucide React**.

## 🌟 Key Features

- **Split View (55% / 45%)**: Optimized for landscape mobile viewports.
- **Today's Focus**: Task list with 300ms smooth slide-out completion animations and quick task addition.
- **Header & Live Weather**: Real-time clock (HH:MM), live date, and dynamic weather integration via Open-Meteo.
- **Smart Schedule**: Dynamic time block highlighting (emerald pulsing indicator), auto-fading past events, and auto-scrolling to current meeting.
- **Immersive Fullscreen Mode**: Hide URL bars and browser controls with 1-click.
- **Vercel Ready**: Deploy in seconds via Vercel CLI or GitHub integration.

## 🚀 Quick Start (Local Development)

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
# Visit http://localhost:3000
```

## 📦 Deploy to Vercel

### Method 1: Using Vercel CLI

```bash
npx vercel
```

### Method 2: Deploying via GitHub Integration

1. Push this repository to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Import your GitHub repository.
4. Click **Deploy**.

## 🔑 Google API & OAuth Configuration (Optional)

To enable live Google Tasks and Google Calendar synchronization:

1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Enable `Google Calendar API` and `Google Tasks API`.
3. Create OAuth 2.0 Web Client Credentials.
4. Add your Vercel URL to Authorized Redirect URIs.
5. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in Vercel Environment Variables.
