# LocalLink Market

LocalLink Market is an offline-first PWA marketplace that lets neighbors list items for **local pickup**, **ship-from-home online orders**, or **hybrid deals** that offer both options. It bakes in quick account sign-up, payout/app linking, escrow-style checkout notes, identity checks, pickup PINs, and a loyalty points system that boosts trustworthy buyers and sellers.

> Optimized for Android: add it to your home screen, enable push notifications, and manage trades entirely from your phone.

## Highlights

- 🔐 **Secure-by-default** – ID verification reminders, two-factor toggle, escrow logging, pickup PIN generator, and dispute tracking all live client-side for offline resilience.
- 🧾 **Account & linking flow** – one card handles sign-up, login, account linking (Google Pay, PayPal, Cash App, bank), and trust status in seconds.
- 🛒 **Local / Online / Hybrid feeds** – filter listings by delivery scope, radius, or keyword; cards surface trust badges, pickup radius, and shipping promises.
- 🏅 **Feedback + loyalty points** – every transaction feeds a reputation engine that awards points, levels, and boosts listing placement.
- 📦 **Trade operations console** – log escrow requests, pickup confirmations, disputes, and shipping scans even while offline; data syncs locally via IndexedDB (Dexie).

## Quick Start

```bash
git clone <this repo>
cd workspace
python -m http.server 8000 --bind 0.0.0.0 --directory .
```

Then open `http://localhost:8000` (or the forwarded URL) in Chrome. The PWA requires an HTTP origin for the service worker.

### Demo credentials

- Email: `demo@locallink.app`
- Password: `demo1234`

You can also register your own account—everything is stored locally inside IndexedDB so it works offline.

## Project Structure

```
index.html
manifest.json
service-worker.js
styles/style.css
scripts/
  db.js              # Dexie models, seeding, and data helpers
  ai.js              # Reputation & loyalty scoring engine
  medications.js     # Reused as logistics + delivery helpers
  notify.js          # Toasts, push stubs, and risk alerts
  ui.js              # Render helpers for cards, badges, timelines
  app.js             # Event wiring + state management
assets/icons/
  icon-192.png
  icon-512.png
```

## Android install tips

1. Open the app URL in Chrome.
2. Tap the *three dots* menu → **Install app** (or *Add to Home screen*).
3. Accept notification permissions for trade alerts.
4. The PWA runs fullscreen, caches locally, and continues to work offline.

## Deploy

Any static host works. For GitHub Pages:

```bash
git checkout master
git push origin master
# or publish the dist folder to gh-pages / Netlify / Vercel
```

## License

MIT © LocalLink Market contributors
