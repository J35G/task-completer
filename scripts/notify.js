// Notification management
let notificationPermission = Notification.permission;

// Request notification permission
async function requestNotificationPermission() {
  if ('Notification' in window && Notification.permission === 'default') {
    notificationPermission = await Notification.requestPermission();
  }
  return notificationPermission === 'granted';
}

// Show notification
async function showNotification(title, options = {}) {
  const enabled = await settingsDB.get('notificationsEnabled');
  if (!enabled) return;
  
  if ('Notification' in window && Notification.permission === 'granted') {
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification(title, {
        body: options.body || '',
        icon: options.icon || '/assets/icons/icon-192.png',
        badge: '/assets/icons/icon-192.png',
        tag: options.tag || 'task-reminder',
        requireInteraction: options.requireInteraction || false,
        ...options
      });
    } else {
      new Notification(title, options);
    }
  }
}

// Schedule task reminders
function scheduleTaskReminders(tasks) {
  tasks.forEach(task => {
    if (task.completed || !task.dueDateTime) return;
    
    const dueDate = new Date(task.dueDateTime);
    const now = new Date();
    const timeUntilDue = dueDate - now;
    
    if (timeUntilDue > 0 && timeUntilDue < 86400000) { // Within 24 hours
      setTimeout(() => {
        showNotification(`Task Due: ${task.title}`, {
          body: task.notes || 'Time to complete this task!',
          tag: `task-${task.id}`,
          requireInteraction: true
        });
      }, timeUntilDue);
    }
  });
}

// Schedule hydration reminders
async function scheduleHydrationReminders() {
  const goal = await settingsDB.get('hydrationGoal') || 8;
  const current = await hydrationDB.getTotalToday();
  
  if (current < goal) {
    const hours = [9, 12, 15, 18, 21]; // Reminder times
    hours.forEach(hour => {
      const now = new Date();
      const reminderTime = new Date();
      reminderTime.setHours(hour, 0, 0, 0);
      
      if (reminderTime > now) {
        const timeUntilReminder = reminderTime - now;
        setTimeout(() => {
          showNotification('💧 Time to Hydrate!', {
            body: `Stay hydrated! You've had ${current} cups today. Goal: ${goal} cups.`,
            tag: 'hydration-reminder'
          });
        }, timeUntilReminder);
      }
    });
  }
}

// Schedule medication reminders
async function scheduleMedicationReminders() {
  const enabled = await settingsDB.get('medicationRemindersEnabled');
  if (!enabled) return;
  
  const medications = await medicationDB.getAll();
  const today = new Date();
  
  medications.forEach(med => {
    const reminderTimes = med.reminderTimes ? (Array.isArray(med.reminderTimes) ? med.reminderTimes : [med.reminderTimes]) : [];
    
    reminderTimes.forEach(time => {
      const [hours, minutes] = time.split(':');
      const reminderTime = new Date(today);
      reminderTime.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      if (reminderTime > new Date()) {
        const timeUntilReminder = reminderTime - new Date();
        setTimeout(() => {
          showNotification(`💊 Time to Take ${med.name}`, {
            body: `Dosage: ${med.dosage || 'As prescribed'}`,
            tag: `medication-${med.id}-${time}`,
            requireInteraction: true
          });
        }, timeUntilReminder);
      }
    });
  });
}

// Check and schedule all reminders
async function checkReminders() {
  const tasks = await taskDB.getAll();
  scheduleTaskReminders(tasks);
  await scheduleHydrationReminders();
  await scheduleMedicationReminders();
}

// checkMedicationReminders is defined in medications.js
// This function schedules notifications only
async function scheduleAllMedicationReminders() {
  await scheduleMedicationReminders();
}

// Initialize notifications
requestNotificationPermission();

