// Main application logic

// Update stats display
async function updateStats() {
  const stats = await statsDB.get();
  document.getElementById('totalScore').textContent = stats.totalScore || 0;
  document.getElementById('streak').textContent = stats.streak || 0;
}

// Initialize app
async function initApp() {
  // Register service worker
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('./service-worker.js', { scope: './' });
      console.log('Service Worker registered');
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
  
  // Initialize UI
  initUI();
  
  // Load initial data
  await renderTasks();
  if (typeof renderMedications === 'function') {
    await renderMedications();
  }
  if (typeof renderHouseDuties === 'function') {
    await renderHouseDuties();
  }
  await renderHydration();
  await renderSettings();
  await updateStats();
  await updateQuoteDisplay(); // Display quotes on load
  
  // Load dropdowns
  if (typeof loadMedicationDropdown === 'function') {
    await loadMedicationDropdown();
  }
  if (typeof loadHouseDutyDropdown === 'function') {
    await loadHouseDutyDropdown();
  }
  
  // Check medication reminders and create daily tasks
  if (typeof checkMedicationReminders === 'function') {
    await checkMedicationReminders();
  }
  
  // Set up hydration buttons using event delegation on hydration actions container
  const hydrationActions = document.querySelector('.hydration-actions');
  if (hydrationActions) {
    hydrationActions.addEventListener('click', async (e) => {
      const btn = e.target.closest('.water-btn');
      if (btn) {
        e.preventDefault();
        e.stopPropagation();
        
        const amount = parseFloat(btn.dataset.amount);
        
        if (isNaN(amount) || amount <= 0) {
          console.error('Invalid hydration amount:', btn.dataset.amount);
          return;
        }
        
        try {
          await hydrationDB.add(amount);
          await renderHydration();
          if (typeof showNotification === 'function') {
            await showNotification('💧 Water Added', {
              body: `Added ${amount} cup(s). Keep it up!`,
              tag: 'water-added'
            });
          }
        } catch (error) {
          console.error('Error adding hydration:', error);
          alert('Error adding hydration. Please try again.');
        }
      }
    });
  }
  
  // Also set up direct listeners as fallback
  setTimeout(() => {
    document.querySelectorAll('.water-btn').forEach(btn => {
      // Remove any existing listeners by cloning
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      // Add fresh listener
      newBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const amount = parseFloat(newBtn.dataset.amount);
        
        if (isNaN(amount) || amount <= 0) {
          console.error('Invalid hydration amount:', newBtn.dataset.amount);
          return;
        }
        
        try {
          await hydrationDB.add(amount);
          await renderHydration();
          if (typeof showNotification === 'function') {
            await showNotification('💧 Water Added', {
              body: `Added ${amount} cup(s). Keep it up!`,
              tag: 'water-added'
            });
          }
        } catch (error) {
          console.error('Error adding hydration:', error);
          alert('Error adding hydration. Please try again.');
        }
      });
    });
  }, 100);
  
  // Custom hydration input
  const addCustomHydrationBtn = document.getElementById('addCustomHydrationBtn');
  if (addCustomHydrationBtn) {
    addCustomHydrationBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      const input = document.getElementById('customHydrationAmount');
      const amount = parseFloat(input.value);
      
      if (isNaN(amount) || amount <= 0) {
        alert('Please enter a valid amount greater than 0');
        return;
      }
      
      try {
        await hydrationDB.add(amount);
        input.value = '';
        await renderHydration();
        if (typeof showNotification === 'function') {
          await showNotification('💧 Water Added', {
            body: `Added ${amount} cup(s). Keep it up!`,
            tag: 'water-added'
          });
        }
      } catch (error) {
        console.error('Error adding hydration:', error);
        alert('Error adding hydration. Please try again.');
      }
    });
  }
  
  // Allow Enter key to submit custom hydration
  const customHydrationInput = document.getElementById('customHydrationAmount');
  if (customHydrationInput) {
    customHydrationInput.addEventListener('keypress', async (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const addBtn = document.getElementById('addCustomHydrationBtn');
        if (addBtn) {
          addBtn.click();
        }
      }
    });
  }
  
  // Reset hydration counter
  const resetHydrationBtn = document.getElementById('resetHydrationBtn');
  if (resetHydrationBtn) {
    resetHydrationBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      if (confirm('Are you sure you want to reset today\'s hydration counter? This cannot be undone.')) {
        try {
          await hydrationDB.clearToday();
          await renderHydration();
          if (typeof showNotification === 'function') {
            await showNotification('💧 Counter Reset', {
              body: 'Today\'s hydration counter has been reset.',
              tag: 'hydration-reset'
            });
          }
        } catch (error) {
          console.error('Error resetting hydration:', error);
          alert('Error resetting hydration. Please try again.');
        }
      }
    });
  }
  
  // Initialize AI Calculator
  await initAICalculator();
  
  // Check reminders periodically
  checkReminders();
  setInterval(checkReminders, 60000); // Check every minute
  
  // Check medication reminders daily at midnight
  if (typeof checkMedicationReminders === 'function') {
    const now = new Date();
    const midnight = new Date();
    midnight.setHours(24, 0, 0, 0);
    const msUntilMidnight = midnight - now;
    setTimeout(() => {
      if (typeof checkMedicationReminders === 'function') {
        checkMedicationReminders();
        setInterval(checkMedicationReminders, 86400000); // Every 24 hours
      }
    }, msUntilMidnight);
  }
  
  // Update stats periodically
  setInterval(updateStats, 5000);
}

// AI Calculator unit conversion functions
function convertHeightToCm(feet, inches) {
  return (feet * 30.48) + (inches * 2.54);
}

function convertCmToFeetInches(cm) {
  const totalInches = cm / 2.54;
  const feet = Math.floor(totalInches / 12);
  const inches = Math.round(totalInches % 12);
  return { feet, inches };
}

function convertKgToLbs(kg) {
  return kg * 2.20462;
}

function convertLbsToKg(lbs) {
  return lbs / 2.20462;
}

// AI Calculator state
let aiCalculatorState = {
  heightUnit: 'cm',
  weightUnit: 'kg'
};

// Initialize AI Calculator
async function initAICalculator() {
  try {
    // Wait a bit to ensure DOM is ready
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Get DOM elements
    const heightCmContainer = document.getElementById('heightCmContainer');
    const heightFtContainer = document.getElementById('heightFtContainer');
    const heightUnitBtn = document.getElementById('heightUnitBtn');
    const heightUnitBtnFt = document.getElementById('heightUnitBtnFt');
    const weightUnitBtnKg = document.getElementById('weightUnitBtnKg');
    const weightUnitBtnLbs = document.getElementById('weightUnitBtnLbs');
    const calculateBtn = document.getElementById('calculateBtn');
    
    // Check if elements exist
    if (!heightCmContainer || !heightFtContainer || !heightUnitBtn || !heightUnitBtnFt || 
        !weightUnitBtnKg || !weightUnitBtnLbs || !calculateBtn) {
      console.error('AI Calculator elements not found');
      return;
    }
    
    // Load saved unit preferences
    aiCalculatorState.heightUnit = await settingsDB.get('heightUnit') || 'cm';
    aiCalculatorState.weightUnit = await settingsDB.get('weightUnit') || 'kg';
    
    function updateHeightUnitDisplay() {
      if (aiCalculatorState.heightUnit === 'cm') {
        heightCmContainer.style.display = 'block';
        heightFtContainer.style.display = 'none';
        heightUnitBtn.classList.add('active');
        heightUnitBtnFt.classList.remove('active');
        heightUnitBtn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        heightUnitBtn.style.color = 'white';
        heightUnitBtnFt.style.background = '';
        heightUnitBtnFt.style.color = '';
      } else {
        heightCmContainer.style.display = 'none';
        heightFtContainer.style.display = 'block';
        heightUnitBtnFt.classList.add('active');
        heightUnitBtn.classList.remove('active');
        heightUnitBtnFt.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        heightUnitBtnFt.style.color = 'white';
        heightUnitBtn.style.background = '';
        heightUnitBtn.style.color = '';
      }
    }
    
    function updateWeightUnitDisplay() {
      const weightInput = document.getElementById('weight');
      if (!weightInput) return;
      
      if (aiCalculatorState.weightUnit === 'kg') {
        weightInput.placeholder = 'kg';
        weightUnitBtnKg.classList.add('active');
        weightUnitBtnLbs.classList.remove('active');
        weightUnitBtnKg.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        weightUnitBtnKg.style.color = 'white';
        weightUnitBtnLbs.style.background = '';
        weightUnitBtnLbs.style.color = '';
      } else {
        weightInput.placeholder = 'lbs';
        weightUnitBtnLbs.classList.add('active');
        weightUnitBtnKg.classList.remove('active');
        weightUnitBtnLbs.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
        weightUnitBtnLbs.style.color = 'white';
        weightUnitBtnKg.style.background = '';
        weightUnitBtnKg.style.color = '';
      }
    }
    
    // Initialize unit displays
    updateHeightUnitDisplay();
    updateWeightUnitDisplay();
    
    // Height unit toggle handlers
    heightUnitBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Convert existing value if any
      const heightFeetEl = document.getElementById('heightFeet');
      const heightInchesEl = document.getElementById('heightInches');
      if (heightFeetEl && heightInchesEl) {
        const heightFeet = heightFeetEl.value;
        const heightInches = heightInchesEl.value;
        if (heightFeet || heightInches) {
          const cmValue = convertHeightToCm(parseFloat(heightFeet || 0), parseFloat(heightInches || 0));
          const heightEl = document.getElementById('height');
          if (heightEl) heightEl.value = Math.round(cmValue);
        }
      }
      
      aiCalculatorState.heightUnit = 'cm';
      await settingsDB.set('heightUnit', 'cm');
      updateHeightUnitDisplay();
    });
    
    heightUnitBtnFt.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Convert existing value if any
      const heightEl = document.getElementById('height');
      if (heightEl && heightEl.value) {
        const { feet, inches } = convertCmToFeetInches(parseFloat(heightEl.value));
        const heightFeetEl = document.getElementById('heightFeet');
        const heightInchesEl = document.getElementById('heightInches');
        if (heightFeetEl) heightFeetEl.value = feet;
        if (heightInchesEl) heightInchesEl.value = inches;
      }
      
      aiCalculatorState.heightUnit = 'ft';
      await settingsDB.set('heightUnit', 'ft');
      updateHeightUnitDisplay();
    });
    
    // Weight unit toggle handlers
    weightUnitBtnKg.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Convert existing value if any
      const weightEl = document.getElementById('weight');
      if (weightEl && weightEl.value && aiCalculatorState.weightUnit === 'lbs') {
        const kgValue = convertLbsToKg(parseFloat(weightEl.value));
        weightEl.value = Math.round(kgValue * 10) / 10;
      }
      
      aiCalculatorState.weightUnit = 'kg';
      await settingsDB.set('weightUnit', 'kg');
      updateWeightUnitDisplay();
    });
    
    weightUnitBtnLbs.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      // Convert existing value if any
      const weightEl = document.getElementById('weight');
      if (weightEl && weightEl.value && aiCalculatorState.weightUnit === 'kg') {
        const lbsValue = convertKgToLbs(parseFloat(weightEl.value));
        weightEl.value = Math.round(lbsValue * 10) / 10;
      }
      
      aiCalculatorState.weightUnit = 'lbs';
      await settingsDB.set('weightUnit', 'lbs');
      updateWeightUnitDisplay();
    });
    
    // AI Calculator calculate button
    calculateBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      
      try {
        // Get values and convert to metric for calculations
        let height, weight;
        
        if (aiCalculatorState.heightUnit === 'cm') {
          const heightEl = document.getElementById('height');
          height = heightEl ? parseFloat(heightEl.value) : null;
        } else {
          const heightFeetEl = document.getElementById('heightFeet');
          const heightInchesEl = document.getElementById('heightInches');
          const feet = heightFeetEl ? parseFloat(heightFeetEl.value || 0) : 0;
          const inches = heightInchesEl ? parseFloat(heightInchesEl.value || 0) : 0;
          height = convertHeightToCm(feet, inches);
        }
        
        if (aiCalculatorState.weightUnit === 'kg') {
          const weightEl = document.getElementById('weight');
          weight = weightEl ? parseFloat(weightEl.value) : null;
        } else {
          const weightEl = document.getElementById('weight');
          const lbs = weightEl ? parseFloat(weightEl.value) : null;
          weight = lbs ? convertLbsToKg(lbs) : null;
        }
        
        const genderEl = document.getElementById('gender');
        const ageEl = document.getElementById('age');
        const waistEl = document.getElementById('waist');
        const neckEl = document.getElementById('neck');
        
        const data = {
          gender: genderEl ? genderEl.value : '',
          age: ageEl ? parseInt(ageEl.value) : null,
          height: height,
          weight: weight,
          waist: waistEl ? parseFloat(waistEl.value) : null,
          neck: neckEl ? parseFloat(neckEl.value) : null
        };
        
        if (!data.age || !data.height || !data.weight || !data.waist || !data.neck) {
          alert('Please fill in all fields');
          return;
        }
        
        if (!window.aiCalculator || !window.aiCalculator.calculate) {
          alert('AI Calculator not loaded. Please refresh the page.');
          console.error('aiCalculator not available');
          return;
        }
        
        const results = window.aiCalculator.calculate(data);
        const resultsDiv = document.getElementById('aiResults');
        
        if (!resultsDiv) {
          alert('Results container not found');
          return;
        }
        
        resultsDiv.innerHTML = `
          <h3>Your Results</h3>
          <div class="result-item">
            <div class="result-label">Body Fat Percentage</div>
            <div class="result-value">${results.bodyFat ? results.bodyFat.toFixed(1) : 'N/A'}%</div>
            ${results.category ? `<div style="font-size: 0.9rem; color: var(--text-secondary); margin-top: 0.25rem;">Category: ${results.category}</div>` : ''}
          </div>
          <div class="result-item">
            <div class="result-label">BMI (Body Mass Index)</div>
            <div class="result-value">${results.bmi || 'N/A'}</div>
          </div>
          <div class="result-item">
            <div class="result-label">BMR (Basal Metabolic Rate)</div>
            <div class="result-value">${results.bmr || 'N/A'} kcal/day</div>
          </div>
          <div class="result-item">
            <div class="result-label">TDEE (Total Daily Energy Expenditure)</div>
            <div class="result-value">${results.tdee || 'N/A'} kcal/day</div>
          </div>
        `;
        
        resultsDiv.classList.add('show');
      } catch (error) {
        console.error('Error calculating:', error);
        alert('Error calculating results. Please check your inputs and try again.');
      }
    });
    
    console.log('AI Calculator initialized successfully');
  } catch (error) {
    console.error('Error initializing AI Calculator:', error);
  }
}

// Start app when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initApp);
} else {
  initApp();
}

