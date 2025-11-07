// Database setup using Dexie.js
const db = new Dexie('TaskCompleterDB');

        db.version(1).stores({
          tasks: '++id, title, notes, dueDateTime, repeats, priority, completed, completedAt, scoreValue, createdAt, showCountdown, taskType, medicationId',
          userStats: '++id, totalScore, streak, completedToday, lastCompletedDate',
          hydration: '++id, date, amount, timestamp',
          settings: '++id, key, value',
          taskTitleHistory: '++id, title, lastUsed',
          medications: '++id, name, type, dosage, frequency, reminderTimes, isActive, createdAt',
          houseDuties: '++id, title, category, frequency, lastCompleted, notes',
          motivationalQuotes: '++id, quote, author, createdAt, enabled'
        });

// Initialize default settings
async function initializeSettings() {
  const settings = await db.settings.toArray();
  if (settings.length === 0) {
    await db.settings.bulkAdd([
      { key: 'notificationsEnabled', value: true },
      { key: 'theme', value: 'default' },
      { key: 'syncEnabled', value: false },
      { key: 'backgroundImage', value: null },
      { key: 'modalBackgroundImage', value: null },
      { key: 'hydrationGoal', value: 8 },
      { key: 'medicationRemindersEnabled', value: true },
      { key: 'homepageTheme', value: 'default' },
      { key: 'customPrimaryColor', value: '#4f46e5' },
      { key: 'customSecondaryColor', value: '#10b981' },
      { key: 'customTextColor', value: '#0f172a' },
      { key: 'quotesEnabled', value: false },
      { key: 'quoteDisplayMode', value: 'random' }
    ]);
  }
}

// Task operations
const taskDB = {
  async getAll() {
    return await db.tasks.toArray();
  },
  
  async getById(id) {
    return await db.tasks.get(id);
  },
  
  async add(task) {
    // Save title to history
    if (task.title) {
      await titleHistoryDB.add(task.title);
    }
    
    return await db.tasks.add({
      ...task,
      completed: false,
      showCountdown: task.showCountdown || false,
      createdAt: new Date().toISOString()
    });
  },
  
  async update(id, updates) {
    // Save title to history if it changed
    if (updates.title) {
      await titleHistoryDB.add(updates.title);
    }
    return await db.tasks.update(id, updates);
  },
  
  async delete(id) {
    return await db.tasks.delete(id);
  },
  
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
};

// User stats operations
const statsDB = {
  async get() {
    let stats = await db.userStats.orderBy('id').reverse().first();
    if (!stats) {
      stats = {
        totalScore: 0,
        streak: 0,
        completedToday: 0,
        lastCompletedDate: null
      };
      await db.userStats.add(stats);
      stats = await db.userStats.orderBy('id').reverse().first();
    }
    return stats;
  },
  
  async update(updates) {
    const stats = await this.get();
    if (stats.id) {
      return await db.userStats.update(stats.id, updates);
    }
  },
  
  async addScore(points) {
    const stats = await this.get();
    const newScore = (stats.totalScore || 0) + points;
    await this.update({ totalScore: newScore });
    return newScore;
  },
  
  async updateStreak() {
    const stats = await this.get();
    const today = new Date().toDateString();
    const lastDate = stats.lastCompletedDate ? new Date(stats.lastCompletedDate).toDateString() : null;
    
    let newStreak = stats.streak || 0;
    if (lastDate === today) {
      // Already completed today
      return newStreak;
    } else if (lastDate === new Date(Date.now() - 86400000).toDateString()) {
      // Completed yesterday, increment streak
      newStreak = (stats.streak || 0) + 1;
    } else if (lastDate !== today && lastDate !== null) {
      // Missed a day, reset streak
      newStreak = 1;
    } else {
      // First completion
      newStreak = 1;
    }
    
    await this.update({
      streak: newStreak,
      lastCompletedDate: today
    });
    return newStreak;
  }
};

// Hydration operations
const hydrationDB = {
  async getToday() {
    const today = new Date().toDateString();
    const entries = await db.hydration.toArray();
    return entries.filter(entry => new Date(entry.date).toDateString() === today);
  },
  
  async add(amount) {
    const today = new Date().toDateString();
    return await db.hydration.add({
      date: today,
      amount: amount,
      timestamp: new Date().toISOString()
    });
  },
  
  async getTotalToday() {
    const entries = await this.getToday();
    return entries.reduce((sum, entry) => sum + entry.amount, 0);
  },
  
  async clearToday() {
    const today = new Date().toDateString();
    const entries = await this.getToday();
    const ids = entries.map(entry => entry.id);
    return await db.hydration.bulkDelete(ids);
  }
};

// Settings operations
const settingsDB = {
  async get(key) {
    const setting = await db.settings.where('key').equals(key).first();
    return setting ? setting.value : null;
  },
  
  async set(key, value) {
    const existing = await db.settings.where('key').equals(key).first();
    if (existing) {
      return await db.settings.update(existing.id, { value });
    } else {
      return await db.settings.add({ key, value });
    }
  },
  
  async getAll() {
    const settings = await db.settings.toArray();
    const result = {};
    settings.forEach(s => result[s.key] = s.value);
    return result;
  }
};

// Export/Import
const exportData = async () => {
  const data = {
    tasks: await db.tasks.toArray(),
    userStats: await statsDB.get(),
    hydration: await db.hydration.toArray(),
    settings: await settingsDB.getAll(),
    motivationalQuotes: await db.motivationalQuotes.toArray(),
    exportDate: new Date().toISOString()
  };
  return JSON.stringify(data, null, 2);
};

// Task Title History operations
const titleHistoryDB = {
  async add(title) {
    if (!title || title.trim() === '') return;
    const trimmedTitle = title.trim();
    
    // Check if title already exists
    const existing = await db.taskTitleHistory.where('title').equals(trimmedTitle).first();
    
    if (existing) {
      // Update last used time
      await db.taskTitleHistory.update(existing.id, { lastUsed: new Date().toISOString() });
    } else {
      // Add new title
      await db.taskTitleHistory.add({
        title: trimmedTitle,
        lastUsed: new Date().toISOString()
      });
    }
  },
  
  async getAll() {
    return await db.taskTitleHistory
      .orderBy('lastUsed')
      .reverse()
      .limit(20)
      .toArray();
  },
  
  async delete(id) {
    return await db.taskTitleHistory.delete(id);
  },
  
  async clear() {
    return await db.taskTitleHistory.clear();
  },
  
  async deleteByTitle(title) {
    return await db.taskTitleHistory.where('title').equals(title).delete();
  }
};

const importData = async (jsonData) => {
  try {
    const data = JSON.parse(jsonData);
    
    if (data.tasks) {
      await db.tasks.clear();
      await db.tasks.bulkAdd(data.tasks);
    }
    
    if (data.userStats) {
      await db.userStats.clear();
      await db.userStats.add(data.userStats);
    }
    
    if (data.hydration) {
      await db.hydration.clear();
      await db.hydration.bulkAdd(data.hydration);
    }
    
    if (data.settings) {
      await db.settings.clear();
      for (const [key, value] of Object.entries(data.settings)) {
        await settingsDB.set(key, value);
      }
    }
    
    if (data.motivationalQuotes) {
      await db.motivationalQuotes.clear();
      await db.motivationalQuotes.bulkAdd(data.motivationalQuotes);
    }
    
    return true;
  } catch (error) {
    console.error('Import error:', error);
    return false;
  }
};

// Medication operations
const medicationDB = {
  async getAll() {
    return await db.medications.where('isActive').equals(1).toArray();
  },
  
  async getAllIncludingInactive() {
    return await db.medications.toArray();
  },
  
  async getById(id) {
    return await db.medications.get(id);
  },
  
  async add(medication) {
    return await db.medications.add({
      ...medication,
      isActive: 1,
      createdAt: new Date().toISOString()
    });
  },
  
  async update(id, updates) {
    return await db.medications.update(id, updates);
  },
  
  async delete(id) {
    return await db.medications.delete(id);
  },
  
  async deactivate(id) {
    return await db.medications.update(id, { isActive: 0 });
  }
};

// House Duties operations
const houseDutiesDB = {
  async getAll() {
    return await db.houseDuties.toArray();
  },
  
  async getById(id) {
    return await db.houseDuties.get(id);
  },
  
  async add(duty) {
    return await db.houseDuties.add({
      ...duty,
      lastCompleted: null,
      createdAt: new Date().toISOString()
    });
  },
  
  async update(id, updates) {
    return await db.houseDuties.update(id, updates);
  },
  
  async delete(id) {
    return await db.houseDuties.delete(id);
  },
  
  async markCompleted(id) {
    return await db.houseDuties.update(id, { lastCompleted: new Date().toISOString() });
  }
};

// Motivational Quotes operations
const quotesDB = {
  async getAll() {
    return await db.motivationalQuotes.where('enabled').equals(1).toArray();
  },
  
  async getAllIncludingDisabled() {
    return await db.motivationalQuotes.toArray();
  },
  
  async getById(id) {
    return await db.motivationalQuotes.get(id);
  },
  
  async add(quoteData) {
    return await db.motivationalQuotes.add({
      ...quoteData,
      enabled: 1,
      createdAt: new Date().toISOString()
    });
  },
  
  async update(id, updates) {
    return await db.motivationalQuotes.update(id, updates);
  },
  
  async delete(id) {
    return await db.motivationalQuotes.delete(id);
  },
  
  async toggleEnabled(id, enabled) {
    return await db.motivationalQuotes.update(id, { enabled: enabled ? 1 : 0 });
  },
  
  async getRandom() {
    const quotes = await this.getAll();
    if (quotes.length === 0) return null;
    return quotes[Math.floor(Math.random() * quotes.length)];
  },
  
  async getDaily() {
    const quotes = await this.getAll();
    if (quotes.length === 0) return null;
    const dayOfYear = Math.floor((new Date() - new Date(new Date().getFullYear(), 0, 0)) / 1000 / 60 / 60 / 24);
    return quotes[dayOfYear % quotes.length];
  }
};

// Initialize default medications and house duties
async function initializeMedicationsAndDuties() {
  // Check if medications exist
  const meds = await db.medications.count();
  if (meds === 0) {
    // Add some default medications/vitamins
    await db.medications.bulkAdd([
      { name: 'Multivitamin', type: 'vitamin', dosage: '1 tablet', frequency: 'daily', reminderTimes: ['09:00'], isActive: 1, createdAt: new Date().toISOString() },
      { name: 'Vitamin D', type: 'vitamin', dosage: '1000 IU', frequency: 'daily', reminderTimes: ['09:00'], isActive: 1, createdAt: new Date().toISOString() },
      { name: 'Calcium', type: 'vitamin', dosage: '500 mg', frequency: 'daily', reminderTimes: ['20:00'], isActive: 1, createdAt: new Date().toISOString() }
    ]);
  }
  
  // Check if house duties exist
  const duties = await db.houseDuties.count();
  if (duties === 0) {
    // Add some default house duties
    await db.houseDuties.bulkAdd([
      { title: 'Take out trash', category: 'Cleaning', frequency: 'weekly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Vacuum floors', category: 'Cleaning', frequency: 'weekly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Clean bathroom', category: 'Cleaning', frequency: 'weekly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Do laundry', category: 'Laundry', frequency: 'weekly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Grocery shopping', category: 'Shopping', frequency: 'weekly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Dust furniture', category: 'Cleaning', frequency: 'monthly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Change bed sheets', category: 'Cleaning', frequency: 'biweekly', lastCompleted: null, notes: '', createdAt: new Date().toISOString() },
      { title: 'Clean kitchen', category: 'Cleaning', frequency: 'daily', lastCompleted: null, notes: '', createdAt: new Date().toISOString() }
    ]);
  }
}

// Initialize on load
initializeSettings();

// Initialize default motivational quotes
async function initializeQuotes() {
  const quotes = await db.motivationalQuotes.toArray();
  if (quotes.length === 0) {
    await db.motivationalQuotes.bulkAdd([
      { quote: 'The way to get started is to quit talking and begin doing.', author: 'Walt Disney', enabled: 1, createdAt: new Date().toISOString() },
      { quote: 'Innovation distinguishes between a leader and a follower.', author: 'Steve Jobs', enabled: 1, createdAt: new Date().toISOString() },
      { quote: 'The future belongs to those who believe in the beauty of their dreams.', author: 'Eleanor Roosevelt', enabled: 1, createdAt: new Date().toISOString() },
      { quote: 'It is during our darkest moments that we must focus to see the light.', author: 'Aristotle', enabled: 1, createdAt: new Date().toISOString() },
      { quote: 'Success is not final, failure is not fatal: it is the courage to continue that counts.', author: 'Winston Churchill', enabled: 1, createdAt: new Date().toISOString() }
    ]);
  }
}
initializeQuotes();
initializeMedicationsAndDuties();

