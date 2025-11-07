# Quick Start Guide

Get Task Completer up and running in 5 minutes!

## Step 1: Create Icon Files

You need two icon files for PWA installation:

1. Go to `assets/icons/` folder
2. Create two PNG files:
   - `icon-192.png` (192x192 pixels)
   - `icon-512.png` (512x512 pixels)

**Quick Option**: Use any square images temporarily, or use an online icon generator like [RealFaviconGenerator](https://realfavicongenerator.net/)

## Step 2: Start a Web Server

The app needs to be served via HTTP (not `file://`) for service workers to work.

### Option A: Python (Recommended)
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

### Option B: Node.js
```bash
npx http-server -p 8000
```

### Option C: PHP
```bash
php -S localhost:8000
```

## Step 3: Open in Browser

1. Open your browser
2. Navigate to `http://localhost:8000`
3. The app should load!

## Step 4: Install as PWA (Optional)

### Android (Chrome)
1. Tap the menu (three dots)
2. Select "Install app" or "Add to Home Screen"

### iOS (Safari)
1. Tap the Share button
2. Select "Add to Home Screen"

## Step 5: Start Using!

- **Add Tasks**: Click "+ Add Task" button
- **Track Hydration**: Go to Hydration tab, click water buttons
- **Calculate Metrics**: Go to AI Calculator tab, enter measurements
- **Customize**: Go to Settings tab, upload background image

## Troubleshooting

### Service Worker Not Working
- Make sure you're using `http://localhost:8000` (not `file://`)
- Check browser console for errors
- Try hard refresh (Ctrl+Shift+R)

### Icons Not Showing
- Make sure icon files exist in `assets/icons/`
- Files must be named exactly `icon-192.png` and `icon-512.png`
- Clear browser cache

### App Not Loading
- Check that all files are in the correct folders
- Verify web server is running
- Check browser console for errors

## Next Steps

- Read the [README.md](README.md) for full documentation
- Check [documentation/](documentation/) for detailed guides
- Start adding tasks and tracking your progress!

## Need Help?

- Check the main [README.md](README.md)
- Review [documentation/README.md](documentation/README.md)
- Check browser console for errors
- Verify all files are present

---

**That's it! You're ready to use Task Completer! 🎉**

