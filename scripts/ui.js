// UI Components and Event Handlers

// Update greeting based on time of day
function updateGreeting() {
  const hour = new Date().getHours();
  let greeting = 'Good morning!';
  
  if (hour >= 12 && hour < 17) {
    greeting = 'Good afternoon!';
  } else if (hour >= 17) {
    greeting = 'Good evening!';
  }
  
  document.getElementById('greeting').textContent = greeting;
}

// Update date and time with seconds
function updateDateTimeDisplay() {
  const dateElement = document.getElementById('currentDate');
  const timeElement = document.getElementById('currentTime');

  if (!dateElement || !timeElement) return;

  const now = new Date();
  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });
  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    second: '2-digit'
  });

  dateElement.textContent = dateFormatter.format(now);
  timeElement.textContent = timeFormatter.format(now);
}

function startDateTimeClock() {
  updateDateTimeDisplay();
  setInterval(updateDateTimeDisplay, 1000);
}

// Tab navigation
function initTabs() {
  const tabs = document.querySelectorAll('.nav-tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const targetTab = tab.dataset.tab;
      
      // Update active states
      tabs.forEach(t => t.classList.remove('active'));
      tabContents.forEach(tc => tc.classList.remove('active'));
      
      tab.classList.add('active');
      document.getElementById(`${targetTab}-tab`).classList.add('active');
    });
  });
}

// Calculate countdown
function calculateCountdown(dueDate) {
  if (!dueDate) return null;
  const now = new Date();
  const due = new Date(dueDate);
  const diff = due - now;
  
  if (diff <= 0) return { expired: true };
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  
  return { days, hours, minutes, seconds, expired: false };
}

// Format countdown display
function formatCountdown(countdown) {
  if (!countdown || countdown.expired) return 'Expired';
  
  const { days, hours, minutes, seconds } = countdown;
  
  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`;
  } else if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  } else if (minutes > 0) {
    return `${minutes}m ${seconds}s`;
  } else {
    return `${seconds}s`;
  }
}

// Task card component
function createTaskCard(task) {
  const card = document.createElement('div');
  card.className = `task-card ${task.completed ? 'completed' : ''}`;
  card.dataset.taskId = task.id;
  
  const dueDate = task.dueDateTime ? new Date(task.dueDateTime) : null;
  const isOverdue = dueDate && dueDate < new Date() && !task.completed;
  const countdown = task.showCountdown && dueDate ? calculateCountdown(task.dueDateTime) : null;
  const countdownDisplay = countdown ? formatCountdown(countdown) : null;
  const isUrgent = countdown && countdown.days === 0 && countdown.hours < 24;
  
  // Format priority display
  let priorityDisplay = task.priority;
  if (task.priority === 'daddy-chill') priorityDisplay = 'Daddy Chill';
  else if (task.priority === 'super-high') priorityDisplay = 'Super High';
  else priorityDisplay = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
  
  // Format creation timestamp (when task was entered)
  let createdAtDisplay = '';
  let completedAtDisplay = '';
  
  if (task.createdAt) {
    const createdAt = new Date(task.createdAt);
    const now = new Date();
    const diffMs = now - createdAt;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);
    
    if (diffMins < 1) {
      createdAtDisplay = '🕐 Entered: Just now';
    } else if (diffMins < 60) {
      createdAtDisplay = `🕐 Entered: ${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    } else if (diffHours < 24) {
      createdAtDisplay = `🕐 Entered: ${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    } else if (diffDays < 7) {
      createdAtDisplay = `🕐 Entered: ${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    } else {
      createdAtDisplay = `🕐 Entered: ${formatDateTime(createdAt)}`;
    }
  }
  
  // Format completion timestamp if task is completed - always show full date and time
  if (task.completed && task.completedAt) {
    const completedAt = new Date(task.completedAt);
    // Format as: "Nov 15, 2024 at 3:45 PM"
    const dateStr = completedAt.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    });
    const timeStr = completedAt.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
    completedAtDisplay = `✅ Completed on ${dateStr} at ${timeStr}`;
  }
  
  card.innerHTML = `
    <div class="task-header-row">
      <div>
        <div class="task-title">${escapeHtml(task.title)}${countdownDisplay && !task.completed ? `<span class="countdown-timer ${isUrgent ? 'urgent' : ''}" data-task-id="${task.id}">⏱️ ${countdownDisplay}</span>` : ''}</div>
        ${task.notes ? `<div class="task-notes">${escapeHtml(task.notes)}</div>` : ''}
      </div>
      <span class="task-priority ${task.priority}">${priorityDisplay}</span>
    </div>
    ${task.completed && completedAtDisplay ? `
      <div class="task-completed-info">
        <span class="completed-timestamp">${completedAtDisplay}</span>
      </div>
    ` : ''}
    <div class="task-meta">
      ${createdAtDisplay ? `<span>${createdAtDisplay}</span>` : ''}
      ${dueDate ? `<span>📅 Due: ${formatDateTime(dueDate)}</span>` : ''}
      ${task.repeats !== 'none' ? `<span>🔄 ${task.repeats.charAt(0).toUpperCase() + task.repeats.slice(1)}</span>` : ''}
      <span>⭐ ${task.scoreValue} pts</span>
      ${isOverdue ? '<span style="color: var(--danger-color);">⚠️ Overdue</span>' : ''}
    </div>
    <div class="task-actions">
      ${!task.completed ? `
        <button class="btn btn-success btn-small" onclick="completeTask(${task.id})">✓ Complete</button>
        <button class="btn btn-secondary btn-small" onclick="openTaskModal(${task.id})">✏️ Edit</button>
      ` : ''}
      <button class="btn btn-danger btn-small" onclick="deleteTask(${task.id})">🗑️ Delete</button>
    </div>
  `;
  
  return card;
}

// Render tasks
async function renderTasks(filter = 'all') {
  const taskList = document.getElementById('taskList');
  let tasks = await taskDB.getAll();
  
  // Apply filter
  if (filter === 'pending') {
    tasks = tasks.filter(t => !t.completed);
  } else if (filter === 'completed') {
    tasks = tasks.filter(t => t.completed);
  }
  
  // Sort by due date and priority
  tasks.sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.dueDateTime && b.dueDateTime) {
      return new Date(a.dueDateTime) - new Date(b.dueDateTime);
    }
    const priorityOrder = { 'super-high': 4, high: 3, medium: 2, 'daddy-chill': 1 };
    return (priorityOrder[b.priority] || 0) - (priorityOrder[a.priority] || 0);
  });
  
  taskList.innerHTML = '';
  
  if (tasks.length === 0) {
    taskList.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No tasks found. Add one to get started!</p>';
    return;
  }
  
  tasks.forEach(task => {
    taskList.appendChild(createTaskCard(task));
  });
}

// Load title history
async function loadTitleHistory() {
  const history = await titleHistoryDB.getAll();
  const datalist = document.getElementById('titleHistory');
  const historyList = document.getElementById('titleHistoryList');
  
  datalist.innerHTML = '';
  historyList.innerHTML = '';
  
  if (history.length > 0) {
    history.forEach(item => {
      const option = document.createElement('option');
      option.value = item.title;
      datalist.appendChild(option);
      
      const historyItem = document.createElement('div');
      historyItem.className = 'title-history-item';
      
      const titleSpan = document.createElement('span');
      titleSpan.textContent = item.title;
      titleSpan.style.cursor = 'pointer';
      titleSpan.addEventListener('click', () => {
        document.getElementById('taskTitle').value = item.title;
        historyList.classList.remove('show');
      });
      
      const deleteBtn = document.createElement('button');
      deleteBtn.type = 'button';
      deleteBtn.className = 'delete-title';
      deleteBtn.textContent = '✕';
      deleteBtn.addEventListener('click', async (e) => {
        e.stopPropagation();
        await titleHistoryDB.delete(item.id);
        await loadTitleHistory();
      });
      
      historyItem.appendChild(titleSpan);
      historyItem.appendChild(deleteBtn);
      historyList.appendChild(historyItem);
    });
    historyList.classList.add('show');
  } else {
    historyList.classList.remove('show');
  }
}

// Modal handlers
async function openTaskModal(taskId = null) {
  const modal = document.getElementById('taskModal');
  const form = document.getElementById('taskForm');
  const modalTitle = document.getElementById('modalTitle');
  const modalContent = document.querySelector('.modal-content');
  
  // Apply modal background image
  const modalBg = await settingsDB.get('modalBackgroundImage');
  const pageBg = await settingsDB.get('backgroundImage');
  
  // Use modal background if set, otherwise use page background
  const bgToUse = modalBg || pageBg;
  if (bgToUse) {
    modalContent.style.backgroundImage = `url(${bgToUse})`;
    modalContent.classList.add('has-background');
  } else {
    modalContent.style.backgroundImage = 'none';
    modalContent.classList.remove('has-background');
  }
  
  // Load title history
  await loadTitleHistory();
  
  if (taskId) {
    taskDB.getById(taskId).then(task => {
      modalTitle.textContent = 'Edit Task';
      document.getElementById('taskId').value = task.id;
      document.getElementById('taskTitle').value = task.title;
      document.getElementById('taskNotes').value = task.notes || '';
      
      if (task.dueDateTime) {
        const dueDate = new Date(task.dueDateTime);
        document.getElementById('taskDueDate').value = dueDate.toISOString().split('T')[0];
        const hours = String(dueDate.getHours()).padStart(2, '0');
        const minutes = String(dueDate.getMinutes()).padStart(2, '0');
        document.getElementById('taskDueTime').value = `${hours}:${minutes}`;
      } else {
        document.getElementById('taskDueDate').value = '';
        document.getElementById('taskDueTime').value = '';
      }
      
      document.getElementById('taskRepeat').value = task.repeats || 'none';
      document.getElementById('taskPriority').value = task.priority || 'medium';
      document.getElementById('taskScoreValue').value = task.scoreValue || 10;
      document.getElementById('taskShowCountdown').checked = task.showCountdown || false;
    });
  } else {
    modalTitle.textContent = 'Add New Task';
    form.reset();
    document.getElementById('taskId').value = '';
    document.getElementById('taskShowCountdown').checked = false;
    document.getElementById('taskDueDate').value = '';
    document.getElementById('taskDueTime').value = '';
    document.getElementById('taskType').value = 'general';
  }
  
  // Update title suggestions based on current task type
  const taskType = document.getElementById('taskType').value;
  updateTitleSuggestions(taskType);
  
  modal.classList.add('show');
}

function closeTaskModal() {
  document.getElementById('taskModal').classList.remove('show');
}

// Hydration rendering
async function renderHydration() {
  const goal = await settingsDB.get('hydrationGoal') || 8;
  const current = await hydrationDB.getTotalToday();
  const entries = await hydrationDB.getToday();
  
  document.getElementById('hydrationGoal').value = goal;
  document.getElementById('hydrationGoalDisplay').textContent = goal;
  document.getElementById('hydrationCurrent').textContent = current.toFixed(1);
  
  // Update progress ring
  const progress = Math.min((current / goal) * 100, 100);
  const circumference = 2 * Math.PI * 90;
  const offset = circumference - (progress / 100) * circumference;
  document.getElementById('hydrationProgress').style.strokeDashoffset = offset;
  
  // Render log
  const log = document.getElementById('hydrationLog');
  if (entries.length === 0) {
    log.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entries today. Start hydrating!</p>';
  } else {
    log.innerHTML = entries.reverse().map(entry => `
      <div class="hydration-entry">
        <span>${entry.amount} cups</span>
        <span>${formatTime(new Date(entry.timestamp))}</span>
      </div>
    `).join('');
  }
}

// Settings rendering
async function renderSettings() {
  const settings = await settingsDB.getAll();
  document.getElementById('notificationsEnabled').checked = settings.notificationsEnabled !== false;
  document.getElementById('medicationRemindersEnabled').checked = settings.medicationRemindersEnabled !== false;
  
  // Load homepage theme
  const theme = settings.homepageTheme || 'default';
  document.getElementById('homepageTheme').value = theme;
  applyHomepageTheme(theme);
  
  // Hide theme buttons and status on settings reload
  document.getElementById('themeButtonsContainer').style.display = 'none';
  document.getElementById('themeStatusMessage').style.display = 'none';
  
  // Load custom colors
  const primaryColor = settings.customPrimaryColor || '#4f46e5';
  const secondaryColor = settings.customSecondaryColor || '#10b981';
  const textColor = settings.customTextColor || '#0f172a';
  document.getElementById('primaryColorPicker').value = primaryColor;
  document.getElementById('primaryColorText').value = primaryColor;
  document.getElementById('secondaryColorPicker').value = secondaryColor;
  document.getElementById('secondaryColorText').value = secondaryColor;
  document.getElementById('textColorPicker').value = textColor;
  document.getElementById('textColorText').value = textColor;
  applyCustomColors(primaryColor, secondaryColor, textColor);
  
  // Load quotes settings
  document.getElementById('quotesEnabled').checked = settings.quotesEnabled || false;
  document.getElementById('quoteDisplayMode').value = settings.quoteDisplayMode || 'random';
  await renderQuotesList();
  await updateQuoteDisplay();
  
  // Load page background image with higher opacity
  if (settings.backgroundImage) {
    document.querySelector('.background-overlay').style.backgroundImage = `url(${settings.backgroundImage})`;
    document.querySelector('.background-overlay').style.opacity = '0.6';
  } else {
    document.querySelector('.background-overlay').style.backgroundImage = 'none';
    document.querySelector('.background-overlay').style.opacity = '0.1';
  }
}

// Apply custom colors
function applyCustomColors(primary, secondary, text) {
  document.documentElement.style.setProperty('--primary-color', primary);
  document.documentElement.style.setProperty('--secondary-color', secondary);
  document.documentElement.style.setProperty('--text-primary', text);
  
  // Update primary dark (darker shade)
  const primaryDark = adjustBrightness(primary, -20);
  document.documentElement.style.setProperty('--primary-dark', primaryDark);
}

// Adjust color brightness
function adjustBrightness(hex, percent) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, Math.min(255, (num >> 16) + percent));
  const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + percent));
  const b = Math.max(0, Math.min(255, (num & 0x0000FF) + percent));
  return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

// Render quotes list
async function renderQuotesList() {
  const quotes = await quotesDB.getAllIncludingDisabled();
  const list = document.getElementById('quotesList');
  
  if (quotes.length === 0) {
    list.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No quotes added yet. Add your first quote!</p>';
    return;
  }
  
  list.innerHTML = quotes.map(quote => `
    <div class="quote-item" style="padding: 1rem; margin-bottom: 0.5rem; background: var(--bg-secondary); border-radius: 8px; border: 2px solid var(--border-color);">
      <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem;">
        <div style="flex: 1;">
          <p style="font-style: italic; margin-bottom: 0.5rem; font-weight: 500;">"${escapeHtml(quote.quote)}"</p>
          ${quote.author ? `<p style="font-size: 0.9rem; color: var(--text-secondary);">— ${escapeHtml(quote.author)}</p>` : ''}
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-small" onclick="openQuoteModal(${quote.id})">✏️</button>
          <button class="btn btn-danger btn-small" onclick="deleteQuote(${quote.id})">🗑️</button>
        </div>
      </div>
    </div>
  `).join('');
}

// Update quote display on page
async function updateQuoteDisplay() {
  const enabled = await settingsDB.get('quotesEnabled');
  const mode = await settingsDB.get('quoteDisplayMode') || 'random';
  
  let quoteElement = document.getElementById('motivationalQuote');
  if (!quoteElement) {
    quoteElement = document.createElement('div');
    quoteElement.id = 'motivationalQuote';
    quoteElement.style.cssText = 'position: fixed; bottom: 2rem; left: 50%; transform: translateX(-50%); background: rgba(255, 255, 255, 0.95); padding: 1.5rem 2rem; border-radius: 12px; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2); max-width: 600px; z-index: 1000; text-align: center; border: 2px solid rgba(79, 70, 229, 0.3);';
    document.body.appendChild(quoteElement);
  }
  
  if (!enabled) {
    quoteElement.style.display = 'none';
    return;
  }
  
  quoteElement.style.display = 'block';
  
  let quote = null;
  if (mode === 'random') {
    quote = await quotesDB.getRandom();
  } else if (mode === 'daily') {
    quote = await quotesDB.getDaily();
  } else {
    // Show all in rotation
    const quotes = await quotesDB.getAll();
    if (quotes.length > 0) {
      const rotationIndex = Math.floor(Date.now() / 30000) % quotes.length; // Change every 30 seconds
      quote = quotes[rotationIndex];
    }
  }
  
  if (quote) {
    quoteElement.innerHTML = `
      <p style="font-size: 1.1rem; font-style: italic; margin-bottom: 0.5rem; color: var(--text-primary); font-weight: 500;">"${escapeHtml(quote.quote)}"</p>
      ${quote.author ? `<p style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.5rem;">— ${escapeHtml(quote.author)}</p>` : ''}
    `;
  } else {
    quoteElement.style.display = 'none';
  }
}

// Quote modal handlers
async function openQuoteModal(quoteId = null) {
  const modal = document.getElementById('quoteModal');
  const form = document.getElementById('quoteForm');
  const modalTitle = document.getElementById('quoteModalTitle');
  
  // Apply background
  const modalContent = document.querySelector('#quoteModal .modal-content');
  const modalBg = await settingsDB.get('modalBackgroundImage');
  const pageBg = await settingsDB.get('backgroundImage');
  const bgToUse = modalBg || pageBg;
  if (bgToUse) {
    modalContent.style.backgroundImage = `url(${bgToUse})`;
    modalContent.classList.add('has-background');
  } else {
    modalContent.style.backgroundImage = 'none';
    modalContent.classList.remove('has-background');
  }
  
  if (quoteId) {
    const quote = await quotesDB.getById(quoteId);
    modalTitle.textContent = 'Edit Quote';
    document.getElementById('quoteId').value = quote.id;
    document.getElementById('quoteText').value = quote.quote;
    document.getElementById('quoteAuthor').value = quote.author || '';
  } else {
    modalTitle.textContent = 'Add Motivational Quote';
    form.reset();
    document.getElementById('quoteId').value = '';
  }
  
  modal.classList.add('show');
}

function closeQuoteModal() {
  document.getElementById('quoteModal').classList.remove('show');
}

async function handleQuoteSubmit(e) {
  e.preventDefault();
  
  const quoteId = document.getElementById('quoteId').value;
  const quoteData = {
    quote: document.getElementById('quoteText').value,
    author: document.getElementById('quoteAuthor').value || null
  };
  
  if (quoteId) {
    await quotesDB.update(parseInt(quoteId), quoteData);
  } else {
    await quotesDB.add(quoteData);
  }
  
  closeQuoteModal();
  await renderQuotesList();
  await updateQuoteDisplay();
}

window.openQuoteModal = openQuoteModal;
window.deleteQuote = async function(quoteId) {
  if (confirm('Are you sure you want to delete this quote?')) {
    await quotesDB.delete(quoteId);
    await renderQuotesList();
    await updateQuoteDisplay();
  }
};

// Apply homepage theme
function applyHomepageTheme(theme) {
  const topBar = document.querySelector('.top-bar');
  topBar.className = 'top-bar';
  topBar.classList.add(`theme-${theme}`);
}

// Title suggestions by category
const titleSuggestions = {
  general: [
    'Complete project',
    'Review documents',
    'Schedule meeting',
    'Call client',
    'Send email',
    'Update report',
    'Prepare presentation',
    'Attend conference',
    'Review budget',
    'Plan schedule',
    'Exercise',
    'Read book',
    'Learn new skill',
    'Practice meditation',
    'Write journal',
    'Organize workspace',
    'Update resume',
    'Network event',
    'Study for exam',
    'Finish homework'
  ],
  medication: [
    'Take multivitamin',
    'Take vitamin D',
    'Take medication',
    'Take morning pills',
    'Take evening pills',
    'Refill prescription',
    'Pick up medication',
    'Take calcium supplement',
    'Take iron supplement',
    'Take omega-3',
    'Take probiotic',
    'Take allergy medicine',
    'Check medication stock',
    'Schedule doctor appointment'
  ],
  'house-duty': [
    'Do laundry',
    'Vacuum floors',
    'Clean bathroom',
    'Clean kitchen',
    'Take out trash',
    'Dust furniture',
    'Mop floors',
    'Change bed sheets',
    'Grocery shopping',
    'Organize closet',
    'Wash dishes',
    'Clean windows',
    'Water plants',
    'Pay bills',
    'Fix leaky faucet',
    'Change light bulbs',
    'Clean refrigerator',
    'Organize garage',
    'Mow lawn',
    'Clean car'
  ]
};

// Update title suggestions based on task type
function updateTitleSuggestions(taskType) {
  const suggestionsContainer = document.getElementById('titleSuggestions');
  const suggestions = titleSuggestions[taskType] || [];
  
  if (suggestions.length === 0) {
    suggestionsContainer.innerHTML = '';
    return;
  }
  
  suggestionsContainer.innerHTML = suggestions.map(suggestion => 
    `<button type="button" class="title-suggestion-item" data-suggestion="${escapeHtml(suggestion)}">${escapeHtml(suggestion)}</button>`
  ).join('');
  
  // Add click handlers to suggestion items
  suggestionsContainer.querySelectorAll('.title-suggestion-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const suggestion = btn.dataset.suggestion;
      document.getElementById('taskTitle').value = suggestion;
      document.getElementById('taskTitle').focus();
    });
  });
}

// Utility functions
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function formatDateTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

function formatTime(date) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit'
  }).format(date);
}

// Initialize UI
function initUI() {
  updateGreeting();
  startDateTimeClock();
  initTabs();
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderTasks(btn.dataset.filter);
    });
  });
  
  // Task modal
  document.getElementById('addTaskBtn').addEventListener('click', () => openTaskModal());
  document.getElementById('taskForm').addEventListener('submit', (e) => handleTaskSubmit(e, false));
  document.querySelector('.modal-close').addEventListener('click', closeTaskModal);
  document.getElementById('cancelTaskBtn').addEventListener('click', closeTaskModal);
  document.getElementById('saveForLaterBtn').addEventListener('click', (e) => {
    e.preventDefault();
    handleTaskSubmit(e, true);
  });
  
  // Clear title history
  document.getElementById('clearTitleHistoryBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    if (confirm('Clear all title history?')) {
      await titleHistoryDB.clear();
      await loadTitleHistory();
    }
  });
  
  // Quick time buttons
  document.querySelectorAll('.btn-time').forEach(btn => {
    btn.addEventListener('click', () => {
      const hours = parseInt(btn.dataset.hours);
      const minutes = parseInt(btn.dataset.minutes);
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');
      document.getElementById('taskDueTime').value = `${hoursStr}:${minutesStr}`;
    });
  });
  
  // Show/hide title history list
  document.getElementById('taskTitle').addEventListener('focus', async () => {
    await loadTitleHistory();
  });
  
  document.getElementById('taskTitle').addEventListener('input', async () => {
    await loadTitleHistory();
  });
  
  // Close title history when clicking outside
  document.addEventListener('click', (e) => {
    const titleInput = document.getElementById('taskTitle');
    const historyList = document.getElementById('titleHistoryList');
    if (!titleInput.contains(e.target) && !historyList.contains(e.target)) {
      historyList.classList.remove('show');
    }
  });
  
  // Task type change handler
  document.getElementById('taskType').addEventListener('change', async (e) => {
    const taskType = e.target.value;
    const medicationGroup = document.getElementById('medicationSelectionGroup');
    const dutyGroup = document.getElementById('houseDutySelectionGroup');
    
    if (taskType === 'medication') {
      medicationGroup.style.display = 'block';
      dutyGroup.style.display = 'none';
      await loadMedicationDropdown();
    } else if (taskType === 'house-duty') {
      medicationGroup.style.display = 'none';
      dutyGroup.style.display = 'block';
      await loadHouseDutyDropdown();
    } else {
      medicationGroup.style.display = 'none';
      dutyGroup.style.display = 'none';
    }
    
    // Update title suggestions based on task type
    updateTitleSuggestions(taskType);
  });
  
  // Medication type filter dropdown in task modal
  const medicationTypeFilter = document.getElementById('medicationTypeFilter');
  if (medicationTypeFilter) {
    medicationTypeFilter.addEventListener('change', async () => {
      await loadMedicationDropdown();
    });
  }
  
  // Medication filter buttons in medications tab
  const medicationFilters = document.querySelectorAll('#medications-tab .filter-btn');
  medicationFilters.forEach(btn => {
    btn.addEventListener('click', async () => {
      medicationFilters.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.dataset.filter;
      if (typeof renderMedications === 'function') {
        await renderMedications(filter);
      }
    });
  });
  
  // Manage medications button
  document.getElementById('manageMedicationsBtn').addEventListener('click', () => {
    closeTaskModal();
    // Switch to medications tab
    document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
    document.querySelector('[data-tab="medications"]').classList.add('active');
    document.getElementById('medications-tab').classList.add('active');
    openMedicationModal();
  });
  
  // Medication modal handlers
  document.getElementById('addMedicationBtn').addEventListener('click', () => openMedicationModal());
  document.getElementById('medicationForm').addEventListener('submit', handleMedicationSubmit);
  document.getElementById('closeMedicationModal').addEventListener('click', closeMedicationModal);
  document.getElementById('cancelMedicationBtn').addEventListener('click', closeMedicationModal);
  document.getElementById('addReminderTimeBtn').addEventListener('click', () => addReminderTimeInput());
  document.getElementById('medicationModal').addEventListener('click', (e) => {
    if (e.target.id === 'medicationModal') closeMedicationModal();
  });
  
  // Duty modal handlers
  document.getElementById('addDutyBtn').addEventListener('click', () => openDutyModal());
  document.getElementById('dutyForm').addEventListener('submit', handleDutySubmit);
  document.getElementById('closeDutyModal').addEventListener('click', closeDutyModal);
  document.getElementById('cancelDutyBtn').addEventListener('click', closeDutyModal);
  document.getElementById('dutyModal').addEventListener('click', (e) => {
    if (e.target.id === 'dutyModal') closeDutyModal();
  });
  
  // House duties filter buttons
  document.querySelectorAll('#duties-tab .filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#duties-tab .filter-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderHouseDuties(btn.dataset.filter);
    });
  });
  
  // Medication reminders setting
  document.getElementById('medicationRemindersEnabled').addEventListener('change', (e) => {
    settingsDB.set('medicationRemindersEnabled', e.target.checked);
  });
  
  // Homepage theme setting - Store original theme and show preview/save/cancel buttons
  let originalTheme = null;
  let isPreviewingTheme = false;
  
  document.getElementById('homepageTheme').addEventListener('change', async (e) => {
    const newTheme = e.target.value;
    const currentSavedTheme = await settingsDB.get('homepageTheme') || 'default';
    
    // Store original theme if this is the first change
    if (originalTheme === null) {
      originalTheme = currentSavedTheme;
    }
    
    // Show buttons if theme changed from saved
    const buttonsContainer = document.getElementById('themeButtonsContainer');
    const statusMessage = document.getElementById('themeStatusMessage');
    
    if (newTheme !== currentSavedTheme) {
      buttonsContainer.style.display = 'flex';
      statusMessage.style.display = 'none';
    } else {
      buttonsContainer.style.display = 'none';
      originalTheme = null;
      isPreviewingTheme = false;
    }
  });
  
  // Preview theme button
  document.getElementById('previewThemeBtn').addEventListener('click', () => {
    const selectedTheme = document.getElementById('homepageTheme').value;
    applyHomepageTheme(selectedTheme);
    isPreviewingTheme = true;
    document.getElementById('themeStatusMessage').textContent = '👁️ Previewing theme... Changes are temporary until you click Save.';
    document.getElementById('themeStatusMessage').style.color = 'var(--primary-color)';
    document.getElementById('themeStatusMessage').style.display = 'block';
  });
  
  // Save theme button with confirmation
  document.getElementById('saveThemeBtn').addEventListener('click', async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const selectedTheme = document.getElementById('homepageTheme').value;
      const themeSelect = document.getElementById('homepageTheme');
      const themeName = themeSelect.options[themeSelect.selectedIndex].text;
      
      // Show confirmation
      const confirmMessage = `Are you sure you want to save the "${themeName}" theme?`;
      if (confirm(confirmMessage)) {
        // Save to database
        await settingsDB.set('homepageTheme', selectedTheme);
        
        // Apply the theme
        applyHomepageTheme(selectedTheme);
        
        // Hide buttons and show success message
        document.getElementById('themeButtonsContainer').style.display = 'none';
        document.getElementById('themeStatusMessage').textContent = '✅ Theme saved successfully!';
        document.getElementById('themeStatusMessage').style.color = 'var(--secondary-color)';
        document.getElementById('themeStatusMessage').style.display = 'block';
        
        // Reset state
        originalTheme = null;
        isPreviewingTheme = false;
        
        // Verify it was saved
        const savedTheme = await settingsDB.get('homepageTheme');
        console.log('Theme saved:', savedTheme); // Debug log
        
        // Hide success message after 3 seconds
        setTimeout(() => {
          document.getElementById('themeStatusMessage').style.display = 'none';
        }, 3000);
      }
    } catch (error) {
      console.error('Error saving theme:', error);
      alert('Error saving theme. Please try again.');
    }
  });
  
  // Cancel theme button
  document.getElementById('cancelThemeBtn').addEventListener('click', async () => {
    if (originalTheme !== null) {
      // Revert to original theme
      document.getElementById('homepageTheme').value = originalTheme;
      await settingsDB.set('homepageTheme', originalTheme);
      applyHomepageTheme(originalTheme);
    } else {
      // Revert to currently saved theme
      const savedTheme = await settingsDB.get('homepageTheme') || 'default';
      document.getElementById('homepageTheme').value = savedTheme;
      applyHomepageTheme(savedTheme);
    }
    
    // Hide buttons and status
    document.getElementById('themeButtonsContainer').style.display = 'none';
    document.getElementById('themeStatusMessage').style.display = 'none';
    originalTheme = null;
    isPreviewingTheme = false;
  });
  
  // Color pickers
  ['primary', 'secondary', 'text'].forEach(colorType => {
    const picker = document.getElementById(`${colorType}ColorPicker`);
    const textInput = document.getElementById(`${colorType}ColorText`);
    
    picker.addEventListener('input', (e) => {
      textInput.value = e.target.value;
    });
    
    textInput.addEventListener('input', (e) => {
      if (/^#[0-9A-F]{6}$/i.test(e.target.value)) {
        picker.value = e.target.value;
      }
    });
  });
  
  // Apply colors button
  document.getElementById('applyColorsBtn').addEventListener('click', async () => {
    const primary = document.getElementById('primaryColorText').value;
    const secondary = document.getElementById('secondaryColorText').value;
    const text = document.getElementById('textColorText').value;
    
    if (!/^#[0-9A-F]{6}$/i.test(primary) || !/^#[0-9A-F]{6}$/i.test(secondary) || !/^#[0-9A-F]{6}$/i.test(text)) {
      alert('Please enter valid hex colors (e.g., #4f46e5)');
      return;
    }
    
    await settingsDB.set('customPrimaryColor', primary);
    await settingsDB.set('customSecondaryColor', secondary);
    await settingsDB.set('customTextColor', text);
    applyCustomColors(primary, secondary, text);
    alert('Colors applied successfully!');
  });
  
  // Reset colors button
  document.getElementById('resetColorsBtn').addEventListener('click', async () => {
    const defaultPrimary = '#4f46e5';
    const defaultSecondary = '#10b981';
    const defaultText = '#0f172a';
    
    document.getElementById('primaryColorPicker').value = defaultPrimary;
    document.getElementById('primaryColorText').value = defaultPrimary;
    document.getElementById('secondaryColorPicker').value = defaultSecondary;
    document.getElementById('secondaryColorText').value = defaultSecondary;
    document.getElementById('textColorPicker').value = defaultText;
    document.getElementById('textColorText').value = defaultText;
    
    await settingsDB.set('customPrimaryColor', defaultPrimary);
    await settingsDB.set('customSecondaryColor', defaultSecondary);
    await settingsDB.set('customTextColor', defaultText);
    applyCustomColors(defaultPrimary, defaultSecondary, defaultText);
  });
  
  // Quotes handlers
  document.getElementById('addQuoteBtn').addEventListener('click', () => openQuoteModal());
  document.getElementById('quoteForm').addEventListener('submit', handleQuoteSubmit);
  document.getElementById('closeQuoteModal').addEventListener('click', closeQuoteModal);
  document.getElementById('cancelQuoteBtn').addEventListener('click', closeQuoteModal);
  document.getElementById('quoteModal').addEventListener('click', (e) => {
    if (e.target.id === 'quoteModal') closeQuoteModal();
  });
  
  document.getElementById('quotesEnabled').addEventListener('change', async (e) => {
    await settingsDB.set('quotesEnabled', e.target.checked);
    await updateQuoteDisplay();
  });
  
  document.getElementById('quoteDisplayMode').addEventListener('change', async (e) => {
    await settingsDB.set('quoteDisplayMode', e.target.value);
    await updateQuoteDisplay();
  });
  
  document.getElementById('toggleQuotesBtn').addEventListener('click', async () => {
    const current = await settingsDB.get('quotesEnabled');
    const newValue = !current;
    document.getElementById('quotesEnabled').checked = newValue;
    await settingsDB.set('quotesEnabled', newValue);
    await updateQuoteDisplay();
  });
  
  // Background click to close modal
  document.getElementById('taskModal').addEventListener('click', (e) => {
    if (e.target.id === 'taskModal') closeTaskModal();
  });
  
  // Settings handlers
  document.getElementById('notificationsEnabled').addEventListener('change', (e) => {
    settingsDB.set('notificationsEnabled', e.target.checked);
  });
  
  document.getElementById('uploadBackgroundBtn').addEventListener('click', () => {
    document.getElementById('backgroundImageInput').click();
  });
  
  document.getElementById('backgroundImageInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target.result;
        const location = document.getElementById('backgroundLocation').value;
        
        if (location === 'page' || location === 'both') {
          await settingsDB.set('backgroundImage', dataUrl);
        }
        if (location === 'modal' || location === 'both') {
          await settingsDB.set('modalBackgroundImage', dataUrl);
        }
        
        renderSettings();
        // Update modal if it's open
        const modalContent = document.querySelector('.modal-content');
        if (modalContent) {
          const modalBg = await settingsDB.get('modalBackgroundImage');
          const pageBg = await settingsDB.get('backgroundImage');
          const bgToUse = modalBg || pageBg;
          if (bgToUse && (location === 'modal' || location === 'both')) {
            modalContent.style.backgroundImage = `url(${bgToUse})`;
            modalContent.classList.add('has-background');
          }
        }
      };
      reader.readAsDataURL(file);
    }
  });
  
  document.getElementById('removeBackgroundBtn').addEventListener('click', async () => {
    await settingsDB.set('backgroundImage', null);
    renderSettings();
  });
  
  document.getElementById('removeModalBackgroundBtn').addEventListener('click', async () => {
    await settingsDB.set('modalBackgroundImage', null);
    const modalContent = document.querySelector('.modal-content');
    if (modalContent) {
      modalContent.style.backgroundImage = 'none';
    }
  });
  
  document.getElementById('hydrationGoal').addEventListener('change', async (e) => {
    await settingsDB.set('hydrationGoal', parseInt(e.target.value));
    renderHydration();
  });
  
  // Export/Import
  document.getElementById('exportDataBtn').addEventListener('click', async () => {
    const data = await exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `task-completer-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });
  
  document.getElementById('importDataBtn').addEventListener('click', () => {
    document.getElementById('importDataInput').click();
  });
  
  document.getElementById('importDataInput').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file) {
      const text = await file.text();
      const success = await importData(text);
      if (success) {
        alert('Data imported successfully!');
        location.reload();
      } else {
        alert('Error importing data. Please check the file format.');
      }
    }
  });
  
  // Clear data warning modal
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    document.getElementById('clearDataWarningModal').classList.add('show');
  });
  
  document.getElementById('cancelClearDataBtn').addEventListener('click', () => {
    document.getElementById('clearDataWarningModal').classList.remove('show');
  });
  
  document.getElementById('confirmClearDataBtn').addEventListener('click', async () => {
    await db.delete();
    location.reload();
  });
  
  // Close modal when clicking outside
  document.getElementById('clearDataWarningModal').addEventListener('click', (e) => {
    if (e.target.id === 'clearDataWarningModal') {
      document.getElementById('clearDataWarningModal').classList.remove('show');
    }
  });
}

// Build due date from date and time inputs
function buildDueDateTime() {
  const date = document.getElementById('taskDueDate').value;
  const time = document.getElementById('taskDueTime').value;
  
  if (!date) return null;
  
  if (time) {
    return new Date(`${date}T${time}`).toISOString();
  } else {
    // Default to end of day if no time specified
    return new Date(`${date}T23:59:59`).toISOString();
  }
}

// Task form handler
async function handleTaskSubmit(e, saveForLater = false) {
  e.preventDefault();
  
  const taskId = document.getElementById('taskId').value;
  const dueDateTime = buildDueDateTime();
  const taskType = document.getElementById('taskType').value;
  const medicationId = document.getElementById('medicationSelect').value;
  const houseDutyId = document.getElementById('houseDutySelect').value;
  
  let title = document.getElementById('taskTitle').value;
  let notes = document.getElementById('taskNotes').value;
  
  // Auto-fill from medication or house duty
  if (taskType === 'medication' && medicationId) {
    const med = await medicationDB.getById(parseInt(medicationId));
    if (med) {
      title = `Take ${med.name}`;
      notes = `Dosage: ${med.dosage || 'As prescribed'}`;
    }
  } else if (taskType === 'house-duty' && houseDutyId) {
    const duty = await houseDutiesDB.getById(parseInt(houseDutyId));
    if (duty) {
      title = duty.title;
      notes = duty.notes || notes;
    }
  }
  
  const taskData = {
    title: title,
    notes: notes,
    dueDateTime: saveForLater ? null : dueDateTime,
    repeats: document.getElementById('taskRepeat').value,
    priority: document.getElementById('taskPriority').value,
    scoreValue: parseInt(document.getElementById('taskScoreValue').value) || 10,
    showCountdown: document.getElementById('taskShowCountdown').checked,
    taskType: taskType,
    medicationId: medicationId ? parseInt(medicationId) : null
  };
  
  if (taskId) {
    await taskDB.update(parseInt(taskId), taskData);
  } else {
    await taskDB.add(taskData);
  }
  
  closeTaskModal();
  await renderTasks();
  await checkReminders();
  
  // Start countdown update interval if needed
  startCountdownUpdates();
}

// Task actions (global for onclick handlers)
window.completeTask = async function(taskId) {
  const task = await taskDB.getById(taskId);
  await taskDB.update(taskId, { completed: true, completedAt: new Date().toISOString() });
  
  // Add score
  await statsDB.addScore(task.scoreValue);
  
  // Update streak
  await statsDB.updateStreak();
  
  // Update UI
  await renderTasks();
  await updateStats();
  
  // Check for repeats
  if (task.repeats === 'daily') {
    const newDueDate = new Date(task.dueDateTime);
    newDueDate.setDate(newDueDate.getDate() + 1);
    await taskDB.add({
      ...task,
      id: undefined,
      completed: false,
      completedAt: null,
      dueDateTime: newDueDate.toISOString(),
      createdAt: new Date().toISOString()
    });
    await renderTasks();
  } else if (task.repeats === 'weekly') {
    const newDueDate = new Date(task.dueDateTime);
    newDueDate.setDate(newDueDate.getDate() + 7);
    await taskDB.add({
      ...task,
      id: undefined,
      completed: false,
      completedAt: null,
      dueDateTime: newDueDate.toISOString(),
      createdAt: new Date().toISOString()
    });
    await renderTasks();
  } else if (task.repeats === 'monthly') {
    const newDueDate = new Date(task.dueDateTime);
    newDueDate.setMonth(newDueDate.getMonth() + 1);
    await taskDB.add({
      ...task,
      id: undefined,
      completed: false,
      completedAt: null,
      dueDateTime: newDueDate.toISOString(),
      createdAt: new Date().toISOString()
    });
    await renderTasks();
  } else if (task.repeats === 'yearly') {
    const newDueDate = new Date(task.dueDateTime);
    newDueDate.setFullYear(newDueDate.getFullYear() + 1);
    await taskDB.add({
      ...task,
      id: undefined,
      completed: false,
      completedAt: null,
      dueDateTime: newDueDate.toISOString(),
      createdAt: new Date().toISOString()
    });
    await renderTasks();
  }
  
  await showNotification('Task Completed! 🎉', {
    body: `You earned ${task.scoreValue} points!`,
    tag: 'task-completed'
  });
};

window.deleteTask = async function(taskId) {
  if (confirm('Are you sure you want to delete this task?')) {
    await taskDB.delete(taskId);
    await renderTasks();
  }
};

window.openTaskModal = openTaskModal;

// Countdown update interval
let countdownInterval = null;

function startCountdownUpdates() {
  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  
  // Update countdowns every second
  countdownInterval = setInterval(() => {
    const countdownElements = document.querySelectorAll('.countdown-timer');
    countdownElements.forEach(element => {
      const taskId = parseInt(element.dataset.taskId);
      if (taskId) {
        taskDB.getById(taskId).then(task => {
          if (task && task.showCountdown && task.dueDateTime && !task.completed) {
            const countdown = calculateCountdown(task.dueDateTime);
            const display = formatCountdown(countdown);
            const isUrgent = countdown && countdown.days === 0 && countdown.hours < 24;
            
            element.textContent = `⏱️ ${display}`;
            if (isUrgent && !element.classList.contains('urgent')) {
              element.classList.add('urgent');
            } else if (!isUrgent && element.classList.contains('urgent')) {
              element.classList.remove('urgent');
            }
          }
        });
      }
    });
  }, 1000);
}

// Export startCountdownUpdates for use in app.js
window.startCountdownUpdates = startCountdownUpdates;

// Wrap renderTasks to start countdown updates
const originalRenderTasks = renderTasks;
window.renderTasks = async function(filter = 'all') {
  await originalRenderTasks(filter);
  startCountdownUpdates();
};

