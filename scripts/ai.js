// AI Calculator for Body Metrics

// Body Fat Percentage Calculator (Navy Method)
function calculateBodyFat(gender, age, height, weight, waist, neck) {
  if (!height || !weight || !waist || !neck) {
    return null;
  }
  
  let bodyFat;
  
  if (gender === 'male') {
    // Male formula
    bodyFat = 495 / (1.0324 - 0.19077 * Math.log10(waist - neck) + 0.15456 * Math.log10(height)) - 450;
  } else {
    // Female formula (requires hip measurement, simplified here)
    // Using modified formula with waist and height
    bodyFat = 495 / (1.29579 - 0.35004 * Math.log10(waist + height - neck) + 0.22100 * Math.log10(height)) - 450;
  }
  
  return Math.max(0, Math.min(100, bodyFat)); // Clamp between 0-100%
}

// BMI Calculator
function calculateBMI(weight, height) {
  if (!weight || !height) return null;
  const heightInMeters = height / 100;
  return (weight / (heightInMeters * heightInMeters)).toFixed(1);
}

// BMR Calculator (Basal Metabolic Rate - Mifflin-St Jeor Equation)
function calculateBMR(gender, age, weight, height) {
  if (!age || !weight || !height) return null;
  
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weight + 6.25 * height - 5 * age + 5;
  } else {
    bmr = 10 * weight + 6.25 * height - 5 * age - 161;
  }
  
  return Math.round(bmr);
}

// TDEE Calculator (Total Daily Energy Expenditure)
function calculateTDEE(bmr, activityLevel = 'moderate') {
  const multipliers = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    veryActive: 1.9
  };
  
  return Math.round(bmr * (multipliers[activityLevel] || 1.55));
}

// Get body fat category
function getBodyFatCategory(bodyFat, gender) {
  if (gender === 'male') {
    if (bodyFat < 6) return 'Essential Fat';
    if (bodyFat < 14) return 'Athletes';
    if (bodyFat < 18) return 'Fitness';
    if (bodyFat < 25) return 'Average';
    return 'Obese';
  } else {
    if (bodyFat < 14) return 'Essential Fat';
    if (bodyFat < 20) return 'Athletes';
    if (bodyFat < 25) return 'Fitness';
    if (bodyFat < 32) return 'Average';
    return 'Obese';
  }
}

// Main calculation function
function calculateBodyMetrics(data) {
  const { gender, age, height, weight, waist, neck } = data;
  
  const results = {
    bodyFat: null,
    bmi: null,
    bmr: null,
    tdee: null,
    category: null
  };
  
  results.bodyFat = calculateBodyFat(gender, age, height, weight, waist, neck);
  results.bmi = calculateBMI(weight, height);
  results.bmr = calculateBMR(gender, age, weight, height);
  results.tdee = results.bmr ? calculateTDEE(results.bmr) : null;
  results.category = results.bodyFat ? getBodyFatCategory(results.bodyFat, gender) : null;
  
  return results;
}

// Export for use in other scripts
window.aiCalculator = {
  calculate: calculateBodyMetrics,
  calculateBodyFat,
  calculateBMI,
  calculateBMR,
  calculateTDEE,
  getBodyFatCategory
};

