/* =================================================
   Macro Calculator – macro.js
   ================================================= */

let macroUnit = 'metric';
let currentDailyCalories = 2000;
let currentMacros = { p: 30, c: 40, f: 30 }; // Balanced default

function setUnit(unit) {
  macroUnit = unit;
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');

  document.getElementById('macroHeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('macroHeightImperialGroup').classList.toggle('hidden', unit === 'metric');
  document.getElementById('macroWeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('macroWeightImperialGroup').classList.toggle('hidden', unit === 'metric');
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function markError(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('error');
}

function resetMacroForm() {
  document.getElementById('macroForm').reset();
  setUnit('metric');
  document.getElementById('macroPlaceholder').classList.remove('hidden');
  document.getElementById('macroResultContent').classList.add('hidden');
  clearErrors();
}

function calculateBMR(weight, heightCm, age, gender) {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
  }
}

// Prefill form from localStorage or query params
function prefillMacroForm() {
  const params = new URLSearchParams(window.location.search);
  const age = params.get('age') || localStorage.getItem('bmi_age');
  const gender = params.get('gender') || localStorage.getItem('bmi_gender');
  const height = params.get('height') || localStorage.getItem('bmi_height');
  const weight = params.get('weight') || localStorage.getItem('bmi_weight');
  const unit = params.get('unit') || localStorage.getItem('bmi_unit');

  if (unit === 'imperial') {
    setUnit('imperial');
  }

  if (age) {
    document.getElementById('macroAge').value = age;
  }
  if (gender) {
    if (gender === 'male' || gender === 'm') {
      document.getElementById('macroGenderMale').checked = true;
    } else if (gender === 'female' || gender === 'f') {
      document.getElementById('macroGenderFemale').checked = true;
    }
  }

  if (height) {
    if (macroUnit === 'metric') {
      document.getElementById('macroHeightCm').value = Math.round(height);
    } else {
      const inchesTotal = height / 2.54;
      const ft = Math.floor(inchesTotal / 12);
      const inches = Math.round(inchesTotal % 12);
      document.getElementById('macroHeightFt').value = ft;
      document.getElementById('macroHeightIn').value = inches;
    }
  }

  if (weight) {
    if (macroUnit === 'metric') {
      document.getElementById('macroWeightKg').value = parseFloat(weight).toFixed(1);
    } else {
      const lbs = weight * 2.20462;
      document.getElementById('macroWeightLbs').value = lbs.toFixed(1);
    }
  }

  // Calculate immediately if core data pre-filled
  if (age && height && weight) {
    document.getElementById('macroCalcBtn').click();
  }
}

function updateMealBreakdown() {
  const count = parseInt(document.getElementById('mealCountSelect').value);
  const mealsContainer = document.getElementById('mealsContainer');
  if (!mealsContainer) return;

  // Meal configurations (ratios of daily intake)
  let configs = [];
  if (count === 3) {
    configs = [
      { name: '🍳 Breakfast', ratio: 0.33 },
      { name: '🥗 Lunch', ratio: 0.34 },
      { name: '🥩 Dinner', ratio: 0.33 }
    ];
  } else if (count === 4) {
    configs = [
      { name: '🍳 Breakfast', ratio: 0.30 },
      { name: '🥗 Lunch', ratio: 0.30 },
      { name: '🍿 Afternoon Snack', ratio: 0.10 },
      { name: '🥩 Dinner', ratio: 0.30 }
    ];
  } else if (count === 5) {
    configs = [
      { name: '🍳 Breakfast', ratio: 0.25 },
      { name: '🍿 Morning Snack', ratio: 0.10 },
      { name: '🥗 Lunch', ratio: 0.25 },
      { name: '🍿 Afternoon Snack', ratio: 0.15 },
      { name: '🥩 Dinner', ratio: 0.25 }
    ];
  }

  // Calculate daily grams of macros
  const proteinG = (currentDailyCalories * (currentMacros.p / 100)) / 4;
  const carbsG = (currentDailyCalories * (currentMacros.c / 100)) / 4;
  const fatG = (currentDailyCalories * (currentMacros.f / 100)) / 9;

  mealsContainer.innerHTML = configs.map(cfg => {
    const mealKcal = Math.round(currentDailyCalories * cfg.ratio);
    const mealP = Math.round(proteinG * cfg.ratio);
    const mealC = Math.round(carbsG * cfg.ratio);
    const mealF = Math.round(fatG * cfg.ratio);

    return `
      <div class="meal-card">
        <div class="meal-card-title">${cfg.name}</div>
        <div class="meal-card-kcal">${mealKcal} kcal</div>
        <div class="meal-card-macros">
          P: <strong>${mealP}g</strong> &bull; C: <strong>${mealC}g</strong> &bull; F: <strong>${mealF}g</strong>
        </div>
      </div>
    `;
  }).join('');
}

document.getElementById('macroForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  let valid = true;

  // Age
  const age = parseInt(document.getElementById('macroAge').value);
  if (!age || age < 15 || age > 100) {
    showError('macroAgeError', 'Enter an age between 15 and 100');
    markError('macroAge');
    valid = false;
  }

  // Gender
  const gender = document.querySelector('input[name="macroGender"]:checked').value;

  // Height
  let heightCm;
  if (macroUnit === 'metric') {
    heightCm = parseFloat(document.getElementById('macroHeightCm').value);
    if (!heightCm || heightCm < 100 || heightCm > 280) {
      showError('macroHeightCmError', 'Enter a height between 100 and 280 cm');
      markError('macroHeightCm');
      valid = false;
    }
  } else {
    const ft = parseInt(document.getElementById('macroHeightFt').value);
    const inches = parseInt(document.getElementById('macroHeightIn').value) || 0;
    if (!ft || ft < 1 || ft > 9 || inches < 0 || inches > 11) {
      showError('macroHeightImperialError', 'Enter a valid height');
      valid = false;
    } else {
      heightCm = (ft * 12 + inches) * 2.54;
    }
  }

  // Weight
  let weightKg;
  if (macroUnit === 'metric') {
    weightKg = parseFloat(document.getElementById('macroWeightKg').value);
    if (!weightKg || weightKg < 30 || weightKg > 600) {
      showError('macroWeightKgError', 'Enter a weight between 30 and 600 kg');
      markError('macroWeightKg');
      valid = false;
    }
  } else {
    const lbs = parseFloat(document.getElementById('macroWeightLbs').value);
    if (!lbs || lbs < 66 || lbs > 1300) {
      showError('macroWeightLbsError', 'Enter a weight between 66 and 1300 lbs');
      markError('macroWeightLbs');
      valid = false;
    } else {
      weightKg = lbs * 0.453592;
    }
  }

  // Activity
  const activityFactor = parseFloat(document.querySelector('input[name="macroActivity"]:checked').value);

  // Goal
  const goal = document.querySelector('input[name="macroGoal"]:checked').value;

  // Preset
  const preset = document.querySelector('input[name="macroPreset"]:checked').value;

  if (!valid) return;

  // Calculate TDEE
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = bmr * activityFactor;

  // Goal adjustment
  let goalCal = 0;
  if (goal === 'lose2') goalCal = -500;
  else if (goal === 'lose1') goalCal = -250;
  else if (goal === 'maintain') goalCal = 0;
  else if (goal === 'gain1') goalCal = 250;
  else if (goal === 'gain2') goalCal = 500;

  const targetCalories = Math.max(1000, Math.round(tdee + goalCal));
  currentDailyCalories = targetCalories;

  // Set macro percentages based on preset
  let pPct = 30, cPct = 40, fPct = 30;
  if (preset === 'highprotein') {
    pPct = 40; cPct = 30; fPct = 30;
  } else if (preset === 'lowcarb') {
    pPct = 30; cPct = 20; fPct = 50;
  } else if (preset === 'keto') {
    pPct = 20; cPct = 5; fPct = 75;
  }
  currentMacros = { p: pPct, c: cPct, f: fPct };

  // Calculate grams
  const proteinG = Math.round((targetCalories * (pPct / 100)) / 4);
  const carbsG = Math.round((targetCalories * (cPct / 100)) / 4);
  const fatG = Math.round((targetCalories * (fPct / 100)) / 9);

  // Show result section
  document.getElementById('macroPlaceholder').classList.add('hidden');
  document.getElementById('macroResultContent').classList.remove('hidden');

  // Hero displays
  document.getElementById('macroCaloriesDisplay').textContent = targetCalories.toLocaleString();
  document.getElementById('macroTdeeDisplay').textContent = Math.round(tdee).toLocaleString();

  // Percentage & Gram text displays
  document.getElementById('mPctProtein').textContent = pPct + '%';
  document.getElementById('mPctCarbs').textContent = cPct + '%';
  document.getElementById('mPctFat').textContent = fPct + '%';

  document.getElementById('mGProtein').textContent = proteinG + 'g (' + Math.round(proteinG * 4) + ' kcal)';
  document.getElementById('mGCarbs').textContent = carbsG + 'g (' + Math.round(carbsG * 4) + ' kcal)';
  document.getElementById('mGFat').textContent = fatG + 'g (' + Math.round(fatG * 9) + ' kcal)';

  // Animate progress bars
  setTimeout(() => {
    document.getElementById('mBarProtein').style.width = pPct + '%';
    document.getElementById('mBarCarbs').style.width = cPct + '%';
    document.getElementById('mBarFat').style.width = fPct + '%';
  }, 100);

  // Donut Chart updates
  // For circle with circumference 100: stroke-dasharray="pct (100 - pct)"
  const donutP = document.getElementById('donutProtein');
  const donutC = document.getElementById('donutCarbs');
  const donutF = document.getElementById('donutFat');

  // Protein segment starts at 12 o'clock (dashoffset = 25)
  const offsetP = 25;
  donutP.setAttribute('stroke-dasharray', `${pPct} 100`);
  donutP.setAttribute('stroke-dashoffset', offsetP);

  // Carbs segment starts where Protein ends
  const offsetC = offsetP - pPct;
  donutC.setAttribute('stroke-dasharray', `${cPct} 100`);
  donutC.setAttribute('stroke-dashoffset', offsetC);

  // Fats segment starts where Carbs ends
  const offsetF = offsetC - cPct;
  donutF.setAttribute('stroke-dasharray', `${fPct} 100`);
  donutF.setAttribute('stroke-dashoffset', offsetF);

  // Meal breakdown
  updateMealBreakdown();

  // Health Message
  const healthMsg = document.getElementById('macroHealthMsg');
  healthMsg.className = 'health-message msg-normal';

  let msg = `✅ Your macros have been calculated for a daily target of <strong>${targetCalories} kcal</strong>. `;
  if (preset === 'balanced') {
    msg += `The balanced ratio is suitable for overall athletic performance, weight management, and steady metabolic energy.`;
  } else if (preset === 'highprotein') {
    msg += `The high protein ratio helps preserve lean muscle mass during dieting and maximizes post-meal fullness (satiety).`;
  } else if (preset === 'lowcarb') {
    msg += `The low carbohydrate ratio stabilizes blood glucose and encourages fat burning while providing rich energy from lipids.`;
  } else if (preset === 'keto') {
    msg += `The ketogenic ratio is designed for keto-adaptation. Ensure your daily carbohydrate intake stays below 30–50 grams to enter ketosis.`;
  }
  healthMsg.innerHTML = msg;

  // Scroll to results
  document.getElementById('macroResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Run prefill on load
document.addEventListener('DOMContentLoaded', prefillMacroForm);
window.updateMealBreakdown = updateMealBreakdown;
