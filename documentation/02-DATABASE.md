# Database Architecture

This document explains the database design and implementation using IndexedDB and Dexie.js.

## Why IndexedDB?

IndexedDB was chosen because:
- **Large Storage**: Can store significantly more data than localStorage
- **Structured Data**: Supports complex objects and relationships
- **Asynchronous**: Non-blocking operations
- **Querying**: Supports indexes and efficient queries
- **Offline**: Works without network connection

## Dexie.js Overview

Dexie.js is a wrapper library that simplifies IndexedDB operations:
- Cleaner API than raw IndexedDB
- Promise-based (async/await support)
- Type safety (with TypeScript)
- Easy schema versioning

## Database Initialization

```javascript
const db = new Dexie('TaskCompleterDB');

db.version(1).stores({
  tasks: '++id, title, notes, dueDateTime, repeats, priority, completed, scoreValue, createdAt',
  userStats: '++id, totalScore, streak, completedToday, lastCompletedDate',
  hydration: '++id, date, amount, timestamp',
  settings: '++id, key, value'
});
```

### Schema Explanation

- `++id`: Auto-incrementing primary key
- Other fields: Indexed fields for querying
- Non-indexed fields can still be stored but can't be queried directly

## Table Structures

### Tasks Table

**Purpose**: Store all user tasks

**Fields**:
- `id` (auto-increment): Unique identifier
- `title` (string): Task name
- `notes` (string, optional): Additional details
- `dueDateTime` (ISO string, optional): When task is due
- `repeats` (enum): 'none', 'daily', or 'weekly'
- `priority` (enum): 'low', 'medium', or 'high'
- `completed` (boolean): Completion status
- `scoreValue` (number): Points awarded on completion
- `createdAt` (ISO string): Creation timestamp

**Indexes**:
- `dueDateTime`: For filtering tasks by date
- `completed`: For filtering by status
- `priority`: For sorting

**Operations**:
```javascript
// Add task
await taskDB.add({
  title: "Example",
  priority: "high",
  scoreValue: 10
});

// Get all tasks
const allTasks = await taskDB.getAll();

// Get by ID
const task = await taskDB.getById(1);

// Update task
await taskDB.update(1, { completed: true });

// Delete task
await taskDB.delete(1);
```

### UserStats Table

**Purpose**: Track user progress and achievements

**Fields**:
- `id` (auto-increment): Unique identifier
- `totalScore` (number): Total points earned
- `streak` (number): Current daily streak
- `completedToday` (number): Tasks completed today
- `lastCompletedDate` (date string): Last completion date

**Operations**:
```javascript
// Get stats
const stats = await statsDB.get();

// Add score
await statsDB.addScore(10);

// Update streak
await statsDB.updateStreak();
```

**Streak Logic**:
1. If last completion was today: Keep current streak
2. If last completion was yesterday: Increment streak
3. If last completion was earlier: Reset to 1
4. If never completed: Set to 1

### Hydration Table

**Purpose**: Track daily water intake

**Fields**:
- `id` (auto-increment): Unique identifier
- `date` (date string): Date of entry
- `amount` (number): Cups of water
- `timestamp` (ISO string): Exact time of entry

**Operations**:
```javascript
// Add hydration entry
await hydrationDB.add(1.5); // 1.5 cups

// Get today's entries
const today = await hydrationDB.getToday();

// Get total for today
const total = await hydrationDB.getTotalToday();
```

### Settings Table

**Purpose**: Store user preferences and configuration

**Fields**:
- `id` (auto-increment): Unique identifier
- `key` (string): Setting name
- `value` (any): Setting value (JSON-serializable)

**Default Settings**:
```javascript
{
  notificationsEnabled: true,
  theme: 'default',
  syncEnabled: false,
  backgroundImage: null,
  hydrationGoal: 8
}
```

**Operations**:
```javascript
// Get setting
const enabled = await settingsDB.get('notificationsEnabled');

// Set setting
await settingsDB.set('hydrationGoal', 10);

// Get all settings
const allSettings = await settingsDB.getAll();
```

## Data Relationships

### Current Design
- **No foreign keys**: Tables are independent
- **Task ID references**: Used in history (future feature)
- **Date-based queries**: Join-like operations via JavaScript

### Example: Get Tasks Due Today
```javascript
async getToday() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  return await db.tasks
    .where('dueDateTime')
    .between(today.toISOString(), tomorrow.toISOString(), true, false)
    .toArray();
}
```

## Query Patterns

### Filtering
```javascript
// Get pending tasks
const pending = await db.tasks
  .where('completed')
  .equals(false)
  .toArray();
```

### Sorting
```javascript
// Sort by priority
const sorted = await db.tasks
  .orderBy('priority')
  .reverse()
  .toArray();
```

### Complex Queries
```javascript
// Get high priority, incomplete tasks
const urgent = await db.tasks
  .where('priority').equals('high')
  .and(task => !task.completed)
  .toArray();
```

## Data Export/Import

### Export Format
```json
{
  "tasks": [...],
  "userStats": {...},
  "hydration": [...],
  "settings": {...},
  "exportDate": "2025-11-06T..."
}
```

### Import Process
1. Parse JSON
2. Clear existing data (optional)
3. Bulk add imported data
4. Handle errors gracefully

### Export Implementation
```javascript
const exportData = async () => {
  const data = {
    tasks: await db.tasks.toArray(),
    userStats: await statsDB.get(),
    hydration: await db.hydration.toArray(),
    settings: await settingsDB.getAll(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};
```

## Migration Strategy

### Version Upgrades
```javascript
// Example: Adding a new field
db.version(2).stores({
  tasks: '++id, title, ..., category', // Added category
  // ... other tables
}).upgrade(tx => {
  // Migrate existing data
  return tx.tasks.toCollection().modify(task => {
    task.category = 'general'; // Default value
  });
});
```

## Performance Considerations

### Indexing
- Index frequently queried fields
- Don't over-index (storage overhead)
- Use compound indexes for multi-field queries

### Bulk Operations
```javascript
// Efficient bulk insert
await db.tasks.bulkAdd([
  { title: "Task 1", ... },
  { title: "Task 2", ... },
  // ...
]);
```

### Query Optimization
- Use indexes for filtering
- Limit result sets
- Use `toArray()` only when needed
- Consider pagination for large datasets

## Error Handling

### Database Errors
```javascript
try {
  await db.tasks.add(task);
} catch (error) {
  if (error.name === 'ConstraintError') {
    // Handle duplicate key
  } else {
    // Handle other errors
    console.error('Database error:', error);
  }
}
```

### Transaction Errors
- Use transactions for multi-step operations
- Rollback on error
- Provide user feedback

## Data Validation

### Input Validation
- Validate before database operations
- Type checking
- Range validation
- Required field validation

### Data Sanitization
- Escape HTML in user input
- Validate dates
- Normalize strings (trim, etc.)

## Storage Limits

### Browser Limits
- Chrome: ~60% of disk space
- Firefox: ~50% of disk space
- Safari: ~1GB per origin

### Practical Limits
- Recommended: < 100MB per app
- Current app: ~1-5MB typical usage
- Watch for storage quota errors

## Backup & Recovery

### Automatic Backup
- Not implemented (future feature)
- Could use periodic exports
- Background sync to cloud

### Manual Backup
- Export feature in settings
- Download JSON file
- Store externally

### Recovery
- Import from backup
- Validate data structure
- Handle missing fields

## Security Considerations

### Data Privacy
- All data stored locally
- No server-side storage
- User controls all data

### Data Encryption
- Not encrypted at rest (local storage)
- Future: End-to-end encryption for cloud sync
- Future: Password protection option

## Testing Database Operations

### Unit Tests (Example)
```javascript
// Test task creation
test('create task', async () => {
  const id = await taskDB.add({ title: 'Test' });
  const task = await taskDB.getById(id);
  expect(task.title).toBe('Test');
});

// Test streak calculation
test('streak increments', async () => {
  await statsDB.updateStreak();
  const stats = await statsDB.get();
  expect(stats.streak).toBeGreaterThan(0);
});
```

## Future Enhancements

### Planned Features
- Data archiving (old tasks)
- Data compression
- Incremental sync
- Conflict resolution
- Multi-device sync
- Data analytics

