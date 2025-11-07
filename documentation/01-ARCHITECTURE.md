# Architecture Overview

This document explains the overall architecture of the Task Completer application.

## High-Level Architecture

Task Completer is a **Progressive Web App (PWA)** built with vanilla JavaScript, HTML, and CSS. It follows an offline-first approach, storing all data locally in the browser using IndexedDB.

```
┌─────────────────────────────────────────┐
│         Browser (Client)                │
│  ┌───────────────────────────────────┐  │
│  │     UI Layer (HTML/CSS)           │  │
│  │  - index.html                     │  │
│  │  - style.css                      │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │     Logic Layer (JavaScript)      │  │
│  │  - app.js (main)                  │  │
│  │  - ui.js (UI interactions)        │  │
│  │  - db.js (data operations)        │  │
│  │  - notify.js (notifications)      │  │
│  │  - ai.js (calculations)           │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │     Storage Layer                 │  │
│  │  - IndexedDB (via Dexie.js)       │  │
│  └───────────────────────────────────┘  │
│  ┌───────────────────────────────────┐  │
│  │     Service Worker                │  │
│  │  - Offline caching                │  │
│  │  - Background notifications       │  │
│  └───────────────────────────────────┘  │
└─────────────────────────────────────────┘
```

## Technology Stack

### Frontend
- **HTML5**: Semantic markup, accessibility features
- **CSS3**: Modern styling, animations, responsive design
- **JavaScript (ES6+)**: Vanilla JS, no frameworks

### Libraries
- **Dexie.js**: Wrapper for IndexedDB, simplifies database operations
- Loaded via CDN (no build step required)

### APIs Used
- **IndexedDB API**: Local database storage
- **Service Worker API**: Offline functionality, caching
- **Web Notifications API**: Browser notifications
- **FileReader API**: Background image uploads
- **Web Share API** (planned): Share achievements

## Data Flow

### Task Creation Flow
```
User Input → UI Handler (ui.js)
         → Task DB (db.js)
         → IndexedDB Storage
         → UI Update (renderTasks)
         → Notification Schedule (notify.js)
```

### Task Completion Flow
```
User Click → completeTask() (ui.js)
         → Update DB (mark completed)
         → Add Score (statsDB)
         → Update Streak (statsDB)
         → Render Updated UI
         → Show Notification
         → Check for Repeats
```

### Hydration Tracking Flow
```
User Click → hydrationDB.add()
         → IndexedDB Storage
         → Calculate Total
         → Update Progress Ring
         → Render Log
         → Show Notification
```

## Module Structure

### 1. **db.js** - Database Layer
- Initializes Dexie.js database
- Defines database schema
- Provides CRUD operations for:
  - Tasks
  - User Stats
  - Hydration Logs
  - Settings
- Handles data export/import

### 2. **ui.js** - User Interface Layer
- Handles all UI interactions
- Creates dynamic UI components (task cards, etc.)
- Manages modal dialogs
- Updates DOM elements
- Event listeners and handlers

### 3. **app.js** - Application Logic
- Main entry point
- Initializes application
- Registers service worker
- Coordinates module interactions
- Periodic tasks (reminders, stats updates)

### 4. **notify.js** - Notification System
- Requests notification permissions
- Shows notifications
- Schedules task reminders
- Schedules hydration reminders

### 5. **ai.js** - AI Calculator
- Body fat calculation (Navy method)
- BMI calculation
- BMR calculation (Mifflin-St Jeor)
- TDEE calculation
- Category classification

## Database Schema

### Tasks Table
```javascript
{
  id: auto-increment,
  title: string,
  notes: string,
  dueDateTime: ISO string,
  repeats: 'none' | 'daily' | 'weekly',
  priority: 'low' | 'medium' | 'high',
  completed: boolean,
  scoreValue: number,
  createdAt: ISO string
}
```

### UserStats Table
```javascript
{
  id: auto-increment,
  totalScore: number,
  streak: number,
  completedToday: number,
  lastCompletedDate: date string
}
```

### Hydration Table
```javascript
{
  id: auto-increment,
  date: date string,
  amount: number (cups),
  timestamp: ISO string
}
```

### Settings Table
```javascript
{
  id: auto-increment,
  key: string,
  value: any (JSON-serializable)
}
```

## State Management

The application uses a **reactive pattern**:
1. User action triggers function
2. Function updates database
3. Function triggers UI re-render
4. UI reflects current state

No global state object - state is derived from database queries.

## Service Worker Architecture

### Caching Strategy
- **Cache First**: Check cache, fallback to network
- Cached resources:
  - HTML, CSS, JS files
  - Manifest
  - External libraries (Dexie.js)

### Lifecycle
1. **Install**: Cache static assets
2. **Activate**: Clean up old caches
3. **Fetch**: Serve from cache when offline
4. **Message**: Handle background notifications

## Security Considerations

### Client-Side Security
- XSS prevention via `escapeHtml()` function
- Input validation on forms
- Safe JSON parsing with error handling

### Data Privacy
- All data stored locally
- No external API calls
- No telemetry or tracking
- Export/import gives user full control

### Future Enhancements
- End-to-end encryption for cloud sync
- OAuth for authentication
- Secure token storage

## Performance Optimizations

1. **Lazy Loading**: Load components on demand
2. **Debouncing**: Prevent excessive function calls
3. **Efficient Queries**: IndexedDB indexes for fast lookups
4. **Minimal Re-renders**: Update only changed DOM elements
5. **Service Worker Caching**: Reduce network requests

## Scalability Considerations

### Current Limitations
- All data in single database
- No pagination for large task lists
- No data compression

### Future Improvements
- Implement pagination
- Add data archiving
- Implement lazy loading for large datasets
- Add data compression for exports

## Browser Compatibility

### Fully Supported
- Chrome 90+
- Edge 90+
- Firefox 88+
- Safari 14+ (iOS 14+)

### Partially Supported
- Safari (limited PWA features)
- Older browsers (may need polyfills)

## Build & Deployment

### Development
- No build step required
- Serve via local web server
- Direct file editing

### Production
- Minify CSS/JS (optional)
- Optimize images
- Add compression headers
- Use HTTPS (required for PWA)

## Error Handling

### Database Errors
- Try-catch blocks around DB operations
- Fallback to default values
- User-friendly error messages

### Network Errors
- Service worker handles offline scenarios
- Graceful degradation
- Cache-first strategy

### User Input Errors
- Form validation
- Input sanitization
- Clear error messages

