# Service Worker Documentation

This document explains the service worker implementation and how it enables offline functionality.

## What is a Service Worker?

A Service Worker is a JavaScript file that runs in the background, separate from the web page. It enables:
- **Offline functionality**: App works without internet
- **Background sync**: Sync data when online
- **Push notifications**: Receive notifications even when app is closed
- **Caching**: Store assets for faster loading

## Service Worker Lifecycle

### 1. Registration
```javascript
// In app.js
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js');
}
```

### 2. Installation
```javascript
// In service-worker.js
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});
```

### 3. Activation
```javascript
self.addEventListener('activate', (event) => {
  // Clean up old caches
});
```

### 4. Fetch Interception
```javascript
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

## Current Implementation

### Cache Strategy

**Cache First Strategy**:
1. Check cache for requested resource
2. If found, return from cache
3. If not found, fetch from network
4. Cache new resources for future use

**Benefits**:
- Works offline
- Fast loading from cache
- Graceful degradation

**Limitations**:
- May serve stale content
- Requires cache updates for new versions

### Cached Resources

```javascript
const urlsToCache = [
  '/',
  '/index.html',
  '/styles/style.css',
  '/scripts/app.js',
  '/scripts/db.js',
  '/scripts/notify.js',
  '/scripts/ai.js',
  '/scripts/ui.js',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/dexie@3.2.4/dist/dexie.min.js'
];
```

### Notification Handling

```javascript
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});
```

## Offline Functionality

### What Works Offline

✅ **Fully Functional**:
- View tasks
- Add/edit/delete tasks
- Track hydration
- View stats
- Use AI calculator
- View settings

❌ **Limited**:
- Notifications (require online for initial setup)
- External resources (CDN libraries cached)

### Data Persistence

- **IndexedDB**: Works offline (stored locally)
- **Cache API**: Stores app files
- **No server dependency**: All data local

## Cache Management

### Cache Naming

```javascript
const CACHE_NAME = 'task-completer-v1';
```

**Versioning Strategy**:
- Increment version when files change
- Old caches remain until cleaned up
- New cache created on update

### Cache Updates

**Current Approach**: Manual cache version update

**Future Improvement**: Automatic cache invalidation
```javascript
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});
```

## Notification Integration

### Background Notifications

Service workers can show notifications even when:
- App is closed
- Browser is minimized
- Device is locked (some browsers)

### Notification Click Handling

When user clicks notification:
1. Close notification
2. Open/focus app window
3. Navigate to relevant section (future)

## Advanced Features (Future)

### Background Sync

```javascript
// Sync data when online
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-tasks') {
    event.waitUntil(syncTasks());
  }
});
```

### Push Notifications

```javascript
// Receive push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();
  self.registration.showNotification(data.title, {
    body: data.body,
    icon: '/assets/icons/icon-192.png'
  });
});
```

### Periodic Background Sync

```javascript
// Sync periodically (Chrome only)
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'sync-data') {
    event.waitUntil(syncData());
  }
});
```

## Debugging Service Workers

### Chrome DevTools

1. **Open DevTools** (F12)
2. **Application Tab**
3. **Service Workers** section
4. **Check status**: Activated, running, etc.
5. **Update on reload**: Check to auto-update
6. **Unregister**: Remove service worker

### Console Commands

```javascript
// Check registration
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Service Workers:', regs);
});

// Unregister all
navigator.serviceWorker.getRegistrations().then(regs => {
  regs.forEach(reg => reg.unregister());
});

// Check cache
caches.keys().then(keys => {
  console.log('Caches:', keys);
});
```

### Common Issues

#### Service Worker Not Updating
- **Cause**: Browser caching
- **Solution**: Hard refresh or unregister/re-register

#### Cache Not Updating
- **Cause**: Cache name not changed
- **Solution**: Increment CACHE_NAME version

#### Offline Not Working
- **Cause**: Resources not cached
- **Solution**: Check urlsToCache array

## Best Practices

### 1. Cache Strategy Selection
- **Static assets**: Cache first
- **Dynamic data**: Network first, cache fallback
- **API calls**: Network only (if real-time needed)

### 2. Cache Size Management
- Limit cache size
- Clean up old caches
- Don't cache unnecessary files

### 3. Update Strategy
- Version cache names
- Clean up old versions
- Update on app version change

### 4. Error Handling
- Handle cache failures gracefully
- Fallback to network
- Provide user feedback

## Security Considerations

### HTTPS Requirement
- Service workers require HTTPS (or localhost)
- Prevents man-in-the-middle attacks
- Ensures secure cache

### Content Security Policy
- Service workers respect CSP
- May need to adjust CSP headers
- Ensure external scripts allowed

### Scope Limitations
- Service worker scope is directory-based
- Can't intercept requests outside scope
- Security feature, not limitation

## Performance Impact

### Positive Effects
- Faster page loads (from cache)
- Reduced bandwidth usage
- Better offline experience

### Potential Issues
- Initial cache fill (one-time cost)
- Cache storage usage
- Service worker overhead (minimal)

## Testing Service Workers

### Manual Testing
1. Load app online
2. Check service worker registered
3. Go offline (DevTools → Network → Offline)
4. Test app functionality
5. Verify cached resources load

### Automated Testing
```javascript
// Example test
test('service worker caches resources', async () => {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match('/index.html');
  expect(cached).toBeDefined();
});
```

## Resources

### Documentation
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Service Worker Cookbook](https://serviceworke.rs/)
- [Workbox](https://developers.google.com/web/tools/workbox) (Advanced)

### Tools
- [Workbox](https://developers.google.com/web/tools/workbox): Service worker library
- [Lighthouse](https://developers.google.com/web/tools/lighthouse): PWA audit

### Learning
- [Offline First](https://offlinefirst.org/)
- [PWA Training](https://web.dev/progressive-web-apps/)

## Future Enhancements

### Planned
- [ ] Cache versioning with auto-cleanup
- [ ] Background sync for cloud data
- [ ] Push notifications
- [ ] Offline queue for actions
- [ ] Cache size limits
- [ ] Smart cache invalidation

### Under Consideration
- [ ] Workbox integration
- [ ] Precaching strategies
- [ ] Runtime caching
- [ ] Cache expiration
- [ ] Cache compression

