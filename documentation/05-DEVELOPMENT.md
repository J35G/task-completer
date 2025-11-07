# Development Guide

This document explains how to develop, modify, and extend the Task Completer application.

## Development Setup

### Prerequisites
- Modern code editor (VS Code, Sublime Text, etc.)
- Modern web browser (Chrome, Firefox, Edge)
- Local web server (Python, Node.js, PHP, etc.)
- Basic knowledge of HTML, CSS, and JavaScript

### Getting Started

1. **Clone or download the project**
   ```bash
   git clone <repository-url>
   cd "Task Completer"
   ```

2. **Start a local server**
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx http-server -p 8000
   
   # PHP
   php -S localhost:8000
   ```

3. **Open in browser**
   - Navigate to `http://localhost:8000`
   - Open browser DevTools (F12)

4. **Install icons** (see `assets/icons/icon-README.md`)

## Project Structure

```
Task Completer/
├── index.html              # Main HTML structure
├── manifest.json           # PWA configuration
├── service-worker.js       # Service worker for offline support
├── README.md              # Main documentation
├── styles/
│   └── style.css          # All styles
├── scripts/
│   ├── app.js             # Main application entry point
│   ├── db.js              # Database operations
│   ├── notify.js          # Notification system
│   ├── ai.js              # AI calculator
│   └── ui.js              # UI components and handlers
├── assets/
│   ├── icons/             # PWA icons
│   └── fonts/             # Custom fonts (optional)
└── documentation/         # Detailed documentation
```

## Code Organization

### Module Pattern
Each script file represents a module:
- **db.js**: Database layer (data operations)
- **ui.js**: UI layer (DOM manipulation, events)
- **app.js**: Application layer (orchestration)
- **notify.js**: Notification layer (alerts)
- **ai.js**: Calculation layer (business logic)

### Dependencies
```
index.html
  └── Loads scripts in order:
      1. Dexie.js (CDN)
      2. db.js (creates global: taskDB, statsDB, hydrationDB, settingsDB)
      3. notify.js (creates global: showNotification, checkReminders)
      4. ai.js (creates global: aiCalculator)
      5. ui.js (creates global: renderTasks, renderHydration, etc.)
      6. app.js (initializes everything)
```

## Adding New Features

### Example: Adding a New Task Field

1. **Update Database Schema** (`scripts/db.js`)
   ```javascript
   db.version(1).stores({
     tasks: '++id, title, ..., newField', // Add new field
     // ...
   });
   ```

2. **Update UI** (`index.html`)
   ```html
   <div class="form-group">
     <label for="taskNewField">New Field</label>
     <input type="text" id="taskNewField">
   </div>
   ```

3. **Update Form Handler** (`scripts/ui.js`)
   ```javascript
   const taskData = {
     // ... existing fields
     newField: document.getElementById('taskNewField').value
   };
   ```

4. **Update Display** (`scripts/ui.js`)
   ```javascript
   function createTaskCard(task) {
     // Add to card HTML
     ${task.newField ? `<span>${task.newField}</span>` : ''}
   }
   ```

### Example: Adding a New Tab

1. **Add Navigation Button** (`index.html`)
   ```html
   <button class="nav-tab" data-tab="newtab">New Tab</button>
   ```

2. **Add Content Section** (`index.html`)
   ```html
   <section id="newtab-tab" class="tab-content">
     <h2>New Tab Content</h2>
   </section>
   ```

3. **Tab switching works automatically** (handled in `ui.js`)

## Debugging

### Browser DevTools

#### Console
- Check for JavaScript errors
- Use `console.log()` for debugging
- Inspect database: `db.tasks.toArray()` (in console)

#### Application Tab
- **Storage → IndexedDB**: Inspect database
- **Service Workers**: Check registration
- **Manifest**: Verify PWA config

#### Network Tab
- Check service worker caching
- Verify file loading
- Inspect network requests

### Common Issues

#### Service Worker Not Registering
- Ensure serving via HTTP/HTTPS (not `file://`)
- Check browser console for errors
- Clear service worker cache:
  ```javascript
  // In DevTools Console
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
  ```

#### Database Not Persisting
- Check IndexedDB quota
- Verify database operations complete
- Check for errors in console

#### Notifications Not Showing
- Verify permission granted
- Check notification settings in browser
- Ensure notifications enabled in app settings

## Testing

### Manual Testing Checklist

#### Functionality
- [ ] Create task
- [ ] Edit task
- [ ] Complete task
- [ ] Delete task
- [ ] Filter tasks
- [ ] Add hydration
- [ ] Change hydration goal
- [ ] Calculate body metrics
- [ ] Upload background image
- [ ] Export data
- [ ] Import data
- [ ] Clear data

#### Browser Compatibility
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

#### Device Testing
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

#### PWA Features
- [ ] Install as PWA
- [ ] Works offline
- [ ] Service worker active
- [ ] Icons display correctly

### Automated Testing (Future)

#### Unit Tests
```javascript
// Example test structure
describe('TaskDB', () => {
  test('add task', async () => {
    const id = await taskDB.add({ title: 'Test' });
    expect(id).toBeDefined();
  });
});
```

#### Integration Tests
- Test user flows
- Test data persistence
- Test notification triggers

## Code Style Guidelines

### JavaScript
- Use `const` by default, `let` when needed
- Use `async/await` for asynchronous code
- Use arrow functions for callbacks
- Use template literals for strings
- Use meaningful variable names
- Add comments for complex logic

### CSS
- Use CSS variables for colors
- Use BEM-like naming for components
- Group related styles together
- Use mobile-first approach
- Add comments for sections

### HTML
- Use semantic HTML elements
- Add ARIA labels where needed
- Keep structure clean and readable
- Use meaningful IDs and classes

## Performance Optimization

### JavaScript
- Minimize DOM queries (cache elements)
- Use event delegation where possible
- Debounce/throttle expensive operations
- Batch DOM updates
- Use DocumentFragment for multiple inserts

### CSS
- Use transform/opacity for animations
- Avoid layout-triggering properties
- Minimize repaints/reflows
- Use will-change sparingly

### Images
- Optimize image sizes
- Use appropriate formats (WebP, PNG, JPG)
- Lazy load images (future)
- Compress images

## Deployment

### Preparation
1. **Minify code** (optional)
   ```bash
   # Use tools like terser, cssnano
   ```

2. **Optimize images**
   - Compress icons
   - Use appropriate formats

3. **Test thoroughly**
   - Test all features
   - Test on multiple devices
   - Test offline functionality

### Hosting Options

#### Static Hosting
- **GitHub Pages**: Free, easy setup
- **Netlify**: Free, automatic deployments
- **Vercel**: Free, fast CDN
- **Firebase Hosting**: Free tier available

#### Requirements
- HTTPS (required for PWA)
- Service worker support
- IndexedDB support

### Deployment Steps

1. **Build** (if using build tools)
2. **Upload files** to hosting
3. **Configure HTTPS**
4. **Test installation** on devices
5. **Monitor** for errors

## Version Control

### Git Workflow
```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ...

# Commit changes
git add .
git commit -m "Add new feature"

# Push to remote
git push origin feature/new-feature

# Create pull request
```

### Commit Messages
- Use clear, descriptive messages
- Reference issues if applicable
- Use present tense ("Add feature" not "Added feature")

## Contributing

### Before Contributing
1. Check existing issues
2. Discuss major changes
3. Follow code style
4. Write tests (future)
5. Update documentation

### Pull Request Process
1. Fork repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Update documentation
6. Submit pull request

## Resources

### Documentation
- [MDN Web Docs](https://developer.mozilla.org/)
- [Dexie.js Documentation](https://dexie.org/)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API)

### Tools
- [PWA Builder](https://www.pwabuilder.com/)
- [Lighthouse](https://developers.google.com/web/tools/lighthouse)
- [Web.dev](https://web.dev/)

### Learning
- [Progressive Web Apps](https://web.dev/progressive-web-apps/)
- [Offline First](https://offlinefirst.org/)
- [Web Accessibility](https://www.w3.org/WAI/)

## Troubleshooting Development Issues

### Issue: Changes Not Reflecting
- **Solution**: Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- **Cause**: Browser cache or service worker cache

### Issue: Database Errors
- **Solution**: Clear IndexedDB in DevTools
- **Cause**: Schema changes or corrupted data

### Issue: Service Worker Stuck
- **Solution**: Unregister and re-register
- **Cause**: Old service worker cached

### Issue: CORS Errors
- **Solution**: Serve via HTTP server (not file://)
- **Cause**: Local file access restrictions

## Future Development Ideas

### Short Term
- Add unit tests
- Improve error handling
- Add loading states
- Optimize performance

### Medium Term
- Add dark mode
- Implement search
- Add task categories
- Improve mobile UX

### Long Term
- Add cloud sync
- Multi-device support
- Watch app integration
- Advanced analytics

