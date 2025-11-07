# Task Completer

A private, offline-first task manager PWA with hydration tracking and AI body metrics calculator.

## Features

- ✅ Task management with due dates, priorities, and repeats
- 💧 Daily hydration tracking with progress visualization
- 🧠 AI-powered body metrics calculator (body fat, BMI, BMR, TDEE)
- 🎯 Gamified scoring system with streaks
- 🔔 Browser notifications for reminders
- 🎨 Customizable background images
- 💾 Offline-first with IndexedDB (works without internet)
- 📱 PWA-ready (installable on Android/iOS)

## Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- A local web server (required for service workers)

### Installation

1. **Clone or download this repository**
   ```bash
   git clone <repository-url>
   cd "Task Completer"
   ```

2. **Create icon files** (see `assets/icons/icon-README.md`)
   - You need `icon-192.png` and `icon-512.png` in the `assets/icons/` folder

3. **Start a local web server**

   **Using Python 3:**
   ```bash
   python -m http.server 8000
   ```

   **Using Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```

   **Using Node.js (http-server):**
   ```bash
   npx http-server -p 8000
   ```

   **Using PHP:**
   ```bash
   php -S localhost:8000
   ```

4. **Open in browser**
   - Navigate to `http://localhost:8000`
   - The app should load and work offline

## PWA Installation

### Android (Chrome)
1. Open the app in Chrome
2. Tap the menu (three dots) → "Install app" or "Add to Home Screen"
3. The app will appear on your home screen

### iOS (Safari)
1. Open the app in Safari
2. Tap the Share button (square with arrow)
3. Scroll down and tap "Add to Home Screen"
4. Customize the name and tap "Add"

## Usage Guide

### Tasks
- Click **"+ Add Task"** to create a new task
- Set due dates, priorities (low/medium/high), and repeat schedules (none/daily/weekly)
- Complete tasks to earn points and maintain streaks
- Filter tasks by status (All/Pending/Completed)

### Hydration
- Set your daily water intake goal in the Hydration tab
- Log water consumption using quick buttons (+1, +2, +0.5 cups)
- Track progress with the visual progress ring
- View your hydration history for the day

### AI Calculator
- Enter your body measurements (age, height, weight, waist, neck)
- Select your gender
- Get estimates for:
  - Body fat percentage (Navy method)
  - BMI (Body Mass Index)
  - BMR (Basal Metabolic Rate)
  - TDEE (Total Daily Energy Expenditure)
- **Note**: These are estimates, not medical advice. Consult healthcare professionals for accurate assessments.

### Settings
- **Notifications**: Enable/disable task and hydration reminders
- **Background Image**: Upload a custom background image for personalization
- **Data Management**: Export your data as JSON for backup, or import previously exported data
- **Clear Data**: Reset the app (use with caution!)

## Technical Details

### Tech Stack
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Database**: IndexedDB (via Dexie.js)
- **PWA**: Service Worker for offline functionality
- **Notifications**: Web Notifications API

### Browser Support
- Chrome/Edge (recommended) - Full PWA support
- Firefox - Full PWA support
- Safari (iOS 11.3+) - Limited PWA support
- Opera - Full PWA support

### Data Storage
- All data is stored locally in your browser using IndexedDB
- Nothing is sent to external servers (unless you explicitly export)
- Data persists even when the app is closed
- Export/Import feature allows backup and migration

### Privacy
- ✅ All data stays on your device
- ✅ No tracking or analytics
- ✅ No data collection
- ✅ Optional cloud sync (future feature, not yet implemented)

## Project Structure

```
Task Completer/
├── index.html              # Main HTML file
├── manifest.json           # PWA manifest
├── service-worker.js       # Service worker for offline support
├── README.md              # This file
├── styles/
│   └── style.css          # Main stylesheet
├── scripts/
│   ├── app.js             # Main application logic
│   ├── db.js              # Database operations (IndexedDB)
│   ├── notify.js          # Notification management
│   ├── ai.js              # AI calculator functions
│   └── ui.js              # UI components and handlers
├── assets/
│   ├── icons/             # PWA icons (you need to add these)
│   └── fonts/             # Custom fonts (optional)
└── documentation/         # Detailed documentation
```

## Development

### Adding New Features
1. Modify the appropriate script file
2. Update the UI in `ui.js` or `index.html`
3. Update the database schema in `db.js` if needed
4. Test thoroughly before deploying

### Testing
- Test in multiple browsers
- Test offline functionality (disable network in DevTools)
- Test PWA installation on mobile devices
- Verify notifications work (requires user permission)

## Troubleshooting

### Service Worker Not Working
- Ensure you're serving via HTTP/HTTPS (not `file://`)
- Check browser console for errors
- Clear browser cache and reload

### Notifications Not Showing
- Check browser notification permissions
- Ensure notifications are enabled in app settings
- Some browsers require user interaction before showing notifications

### Icons Not Showing
- Verify icon files exist in `assets/icons/`
- Check file names are exactly `icon-192.png` and `icon-512.png`
- Clear browser cache and reload

### Data Not Persisting
- Check browser storage settings (IndexedDB should be enabled)
- Clear browser cache may remove data
- Use Export feature to backup data regularly

## Future Enhancements

- [ ] Cloud sync (optional, end-to-end encrypted)
- [ ] Watch app integration via notifications
- [ ] More AI features and insights
- [ ] Task templates and categories
- [ ] Social sharing of achievements
- [ ] Dark mode
- [ ] Multiple themes
- [ ] Task search and sorting
- [ ] Recurring task templates
- [ ] Export to calendar formats

## License

MIT License - Feel free to use and modify as needed.

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## Support

For issues, questions, or suggestions, please open an issue on the repository.

---

**Made with ❤️ for productivity and wellness**

