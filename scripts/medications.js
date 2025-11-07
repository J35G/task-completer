// Medications and House Duties UI Functions

// Format time for display (helper function)
function formatMedicationTime(timeStr) {
  if (!timeStr) return '';
  const [hours, minutes] = timeStr.split(':');
  const hour = parseInt(hours);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const displayHour = hour % 12 || 12;
  return `${displayHour}:${minutes} ${ampm}`;
}

// Render medications list
async function renderMedications(filter = 'all') {
  const medications = await medicationDB.getAll();
  const list = document.getElementById('medicationsList');
  
  // Filter medications by type
  let filteredMedications = medications;
  if (filter !== 'all') {
    filteredMedications = medications.filter(med => med.type === filter);
  }
  
  list.innerHTML = '';
  
  if (filteredMedications.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No medications found.</p>';
    return;
  }
  
  filteredMedications.forEach(med => {
    const card = document.createElement('div');
    card.className = 'medication-card';
    
    const reminderTimes = med.reminderTimes ? (Array.isArray(med.reminderTimes) ? med.reminderTimes : [med.reminderTimes]) : [];
    
    card.innerHTML = `
      <div class="medication-header">
        <div>
          <span class="medication-name">${escapeHtml(med.name)}</span>
          <span class="medication-type ${med.type}">${med.type}</span>
        </div>
        <div class="task-actions">
          <button class="btn btn-secondary btn-small" onclick="openMedicationModal(${med.id})">✏️ Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteMedication(${med.id})">🗑️ Delete</button>
        </div>
      </div>
      <div class="medication-info">
        ${med.dosage ? `<div>Dosage: ${escapeHtml(med.dosage)}</div>` : ''}
        <div>Frequency: ${med.frequency.replace('-', ' ')}</div>
      </div>
      ${reminderTimes.length > 0 ? `
        <div class="medication-reminders">
          <strong>Reminder Times:</strong> ${reminderTimes.map(t => formatMedicationTime(t)).join(', ')}
        </div>
      ` : ''}
    `;
    
    list.appendChild(card);
  });
}

// Render house duties list
async function renderHouseDuties(filter = 'all') {
  const duties = await houseDutiesDB.getAll();
  const list = document.getElementById('dutiesList');
  
  let filteredDuties = duties;
  if (filter !== 'all') {
    filteredDuties = duties.filter(d => d.category.toLowerCase() === filter.toLowerCase());
  }
  
  list.innerHTML = '';
  
  if (filteredDuties.length === 0) {
    list.innerHTML = '<p style="text-align: center; color: var(--text-secondary); padding: 2rem;">No house duties found.</p>';
    return;
  }
  
  filteredDuties.forEach(duty => {
    const card = document.createElement('div');
    card.className = 'duty-card';
    
    const lastCompleted = duty.lastCompleted ? new Date(duty.lastCompleted) : null;
    const daysSince = lastCompleted ? Math.floor((new Date() - lastCompleted) / (1000 * 60 * 60 * 24)) : null;
    
    card.innerHTML = `
      <div class="duty-header">
        <div>
          <div class="medication-name">${escapeHtml(duty.title)}</div>
          <div class="duty-info">
            Category: ${duty.category} | Frequency: ${duty.frequency.replace('-', ' ')}
            ${lastCompleted ? ` | Last completed: ${formatDateTime(lastCompleted)} (${daysSince} days ago)` : ' | Never completed'}
          </div>
        </div>
        <div class="task-actions">
          <button class="btn btn-success btn-small" onclick="completeDuty(${duty.id})">✓ Complete</button>
          <button class="btn btn-secondary btn-small" onclick="openDutyModal(${duty.id})">✏️ Edit</button>
          <button class="btn btn-danger btn-small" onclick="deleteDuty(${duty.id})">🗑️ Delete</button>
        </div>
      </div>
      ${duty.notes ? `<div class="duty-info">${escapeHtml(duty.notes)}</div>` : ''}
    `;
    
    list.appendChild(card);
  });
}


// Open medication modal
async function openMedicationModal(medId = null) {
  const modal = document.getElementById('medicationModal');
  const form = document.getElementById('medicationForm');
  const modalTitle = document.getElementById('medicationModalTitle');
  const container = document.getElementById('reminderTimesContainer');
  
  // Apply background
  const modalContent = document.querySelector('#medicationModal .modal-content');
  const modalBg = await settingsDB.get('modalBackgroundImage');
  const pageBg = await settingsDB.get('backgroundImage');
  const bgToUse = modalBg || pageBg;
  if (bgToUse) {
    modalContent.style.backgroundImage = `url(${bgToUse})`;
    modalContent.classList.add('has-background');
  }
  
  if (medId) {
    const med = await medicationDB.getById(medId);
    modalTitle.textContent = 'Edit Medication/Vitamin';
    document.getElementById('medicationId').value = med.id;
    document.getElementById('medicationName').value = med.name;
    document.getElementById('medicationType').value = med.type;
    document.getElementById('medicationDosage').value = med.dosage || '';
    document.getElementById('medicationFrequency').value = med.frequency || 'daily';
    
    container.innerHTML = '';
    const reminderTimes = med.reminderTimes ? (Array.isArray(med.reminderTimes) ? med.reminderTimes : [med.reminderTimes]) : [];
    reminderTimes.forEach(time => {
      addReminderTimeInput(time);
    });
    if (reminderTimes.length === 0) {
      addReminderTimeInput();
    }
  } else {
    modalTitle.textContent = 'Add Medication/Vitamin';
    form.reset();
    document.getElementById('medicationId').value = '';
    container.innerHTML = '';
    addReminderTimeInput();
  }
  
  modal.classList.add('show');
}

function closeMedicationModal() {
  document.getElementById('medicationModal').classList.remove('show');
}

// Add reminder time input
function addReminderTimeInput(time = '') {
  const container = document.getElementById('reminderTimesContainer');
  const item = document.createElement('div');
  item.className = 'reminder-time-item';
  item.innerHTML = `
    <input type="time" value="${time}" class="reminder-time-input">
    <button type="button" class="btn-danger btn-small" onclick="this.parentElement.remove()">Remove</button>
  `;
  container.appendChild(item);
}

// Handle medication form submit
async function handleMedicationSubmit(e) {
  e.preventDefault();
  
  const medId = document.getElementById('medicationId').value;
  const reminderInputs = document.querySelectorAll('.reminder-time-input');
  const reminderTimes = Array.from(reminderInputs).map(input => input.value).filter(v => v);
  
  const medData = {
    name: document.getElementById('medicationName').value,
    type: document.getElementById('medicationType').value,
    dosage: document.getElementById('medicationDosage').value,
    frequency: document.getElementById('medicationFrequency').value,
    reminderTimes: reminderTimes
  };
  
  if (medId) {
    await medicationDB.update(parseInt(medId), medData);
  } else {
    await medicationDB.add(medData);
    // Create daily task for medication
    await window.createMedicationTasks(await medicationDB.getAllIncludingInactive());
  }
  
  closeMedicationModal();
  await renderMedications();
  await loadMedicationDropdown();
  await checkMedicationReminders();
}

// Create tasks for medications
window.createMedicationTasks = async function(medications) {
  if (!medications || medications.length === 0) return;
  
  const today = new Date();
  const activeMeds = medications.filter(m => m.isActive === 1 || m.isActive === true);
  
  for (const med of activeMeds) {
    const reminderTimes = med.reminderTimes ? (Array.isArray(med.reminderTimes) ? med.reminderTimes : [med.reminderTimes]) : [];
    
    for (const time of reminderTimes) {
      if (!time) continue;
      
      const [hours, minutes] = time.split(':');
      if (!hours || !minutes) continue;
      
      const dueDate = new Date(today);
      dueDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
      
      // Check if task already exists for today
      try {
        const existingTasks = await taskDB.getAll();
        const exists = existingTasks.some(t => 
          t.taskType === 'medication' && 
          t.medicationId === med.id &&
          t.dueDateTime &&
          new Date(t.dueDateTime).toDateString() === dueDate.toDateString() &&
          !t.completed
        );
        
        if (!exists && dueDate > new Date()) {
          await taskDB.add({
            title: `Take ${med.name}`,
            notes: `Dosage: ${med.dosage || 'As prescribed'}`,
            dueDateTime: dueDate.toISOString(),
            repeats: 'daily',
            priority: 'high',
            scoreValue: 15,
            showCountdown: true,
            taskType: 'medication',
            medicationId: med.id
          });
        }
      } catch (error) {
        console.error('Error creating medication task:', error);
      }
    }
  }
};

// Load medication dropdown
async function loadMedicationDropdown(filterType = 'all') {
  const medications = await medicationDB.getAll();
  const select = document.getElementById('medicationSelect');
  const typeFilter = document.getElementById('medicationTypeFilter');
  
  // Get filter type from dropdown if it exists
  if (typeFilter) {
    filterType = typeFilter.value || 'all';
  }
  
  // Filter medications by type
  const filteredMedications = filterType === 'all' 
    ? medications 
    : medications.filter(med => med.type === filterType);
  
  select.innerHTML = '<option value="">-- Select Medication --</option>';
  filteredMedications.forEach(med => {
    const option = document.createElement('option');
    option.value = med.id;
    option.textContent = `${med.name} (${med.type})`;
    select.appendChild(option);
  });
}

// Load house duty dropdown
async function loadHouseDutyDropdown() {
  const duties = await houseDutiesDB.getAll();
  const select = document.getElementById('houseDutySelect');
  
  select.innerHTML = '<option value="">-- Select House Duty --</option>';
  duties.forEach(duty => {
    const option = document.createElement('option');
    option.value = duty.id;
    option.textContent = duty.title;
    select.appendChild(option);
  });
}

// Open duty modal
async function openDutyModal(dutyId = null) {
  const modal = document.getElementById('dutyModal');
  const form = document.getElementById('dutyForm');
  const modalTitle = document.getElementById('dutyModalTitle');
  
  // Apply background
  const modalContent = document.querySelector('#dutyModal .modal-content');
  const modalBg = await settingsDB.get('modalBackgroundImage');
  const pageBg = await settingsDB.get('backgroundImage');
  const bgToUse = modalBg || pageBg;
  if (bgToUse) {
    modalContent.style.backgroundImage = `url(${bgToUse})`;
    modalContent.classList.add('has-background');
  }
  
  if (dutyId) {
    const duty = await houseDutiesDB.getById(dutyId);
    modalTitle.textContent = 'Edit House Duty';
    document.getElementById('dutyId').value = duty.id;
    document.getElementById('dutyTitle').value = duty.title;
    document.getElementById('dutyCategory').value = duty.category;
    document.getElementById('dutyFrequency').value = duty.frequency;
    document.getElementById('dutyNotes').value = duty.notes || '';
  } else {
    modalTitle.textContent = 'Add House Duty';
    form.reset();
    document.getElementById('dutyId').value = '';
  }
  
  modal.classList.add('show');
}

function closeDutyModal() {
  document.getElementById('dutyModal').classList.remove('show');
}

// Handle duty form submit
async function handleDutySubmit(e) {
  e.preventDefault();
  
  const dutyId = document.getElementById('dutyId').value;
  const dutyData = {
    title: document.getElementById('dutyTitle').value,
    category: document.getElementById('dutyCategory').value,
    frequency: document.getElementById('dutyFrequency').value,
    notes: document.getElementById('dutyNotes').value
  };
  
  if (dutyId) {
    await houseDutiesDB.update(parseInt(dutyId), dutyData);
  } else {
    await houseDutiesDB.add(dutyData);
  }
  
  closeDutyModal();
  await renderHouseDuties();
  await loadHouseDutyDropdown();
}

// Global functions
window.openMedicationModal = openMedicationModal;
window.deleteMedication = async function(medId) {
  if (confirm('Are you sure you want to delete this medication?')) {
    await medicationDB.delete(medId);
    await renderMedications();
    await loadMedicationDropdown();
  }
};

window.openDutyModal = openDutyModal;
window.deleteDuty = async function(dutyId) {
  if (confirm('Are you sure you want to delete this house duty?')) {
    await houseDutiesDB.delete(dutyId);
    await renderHouseDuties();
    await loadHouseDutyDropdown();
  }
};

window.completeDuty = async function(dutyId) {
  await houseDutiesDB.markCompleted(dutyId);
  await renderHouseDuties();
};

window.addReminderTimeInput = addReminderTimeInput;

// Check medication reminders (exported)
window.checkMedicationReminders = async function() {
  if (typeof scheduleMedicationReminders === 'function') {
    await scheduleMedicationReminders();
  }
  // Also create daily tasks for medications
  const medications = await medicationDB.getAll();
  await window.createMedicationTasks(medications);
  if (typeof renderTasks === 'function') {
    await renderTasks();
  }
};

