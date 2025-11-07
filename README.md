# Task Completer

Task Completer is an offline-first PWA that blends a task list, hydration tracker, and AI-powered body metrics dashboard. It runs entirely in the browser with IndexedDB storage and a service worker for offline use.

- Tasks with priorities, repeats, streak scoring, and countdowns
- Hydration tracking with quick-add buttons and visual progress ring
- AI calculator for BMI, body-fat %, BMR, and TDEE
- Medication & house-duty management plus customizable themes, quotes, and backgrounds
- Works offline, supports notifications, and installs cleanly on mobile as a PWA

## Live Demo

The production build is hosted on GitHub Pages: [https://j35g.github.io/task-completer/](https://j35g.github.io/task-completer/)

## Run Locally

```bash
git clone https://github.com/J35G/task-completer.git
cd task-completer
python -m http.server 8000 --bind 0.0.0.0 --directory .
```

Then open `http://localhost:8000/index.html`.

Any static server works (Node `http-server`, `serve`, etc.); the service worker just needs an HTTP origin.

## PWA Install Tips

- **Android (Chrome):** open the demo link, tap the three-dot menu, choose `Install app`.
- **iOS (Safari):** open the demo link, tap *Share* → *Add to Home Screen*.
- If you change the icons, update `assets/icons/icon-192.png` and `assets/icons/icon-512.png` before redeploying.

## Deploy

GitHub Pages is already configured. After committing on `master`, merge into `gh-pages` and push:

```bash
git checkout master
git push
git checkout gh-pages
git merge master
git push
```

Pages will rebuild automatically (watch the repo Actions tab for status).

## Project Structure

```
index.html
manifest.json
service-worker.js
styles/style.css
scripts/
  app.js
  ai.js
  db.js
  medications.js
  notify.js
  ui.js
assets/icons/
  icon-192.png
  icon-512.png
```

## License

MIT © Task Completer contributors

