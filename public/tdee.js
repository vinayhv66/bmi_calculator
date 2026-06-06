/* =================================================
   TDEE Calculator – tdee.js
   ================================================= */

let tdeeUnit = 'metric';

function setUnit(unit) {
  tdeeUnit = unit;
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');

  document.getElementById('tdeeHeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('tdeeHeightImperialGroup').classList.toggle('hidden', unit === 'metric');
  document.getElementById('tdeeWeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('tdeeWeightImperialGroup').classList.toggle('hidden', unit === 'metric');
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

function resetTdeeForm() {
  document.getElementById('tdeeForm').reset();
  setUnit('metric');
  document.getElementById('tdeePlaceholder').classList.remove('hidden');
  document.getElementById('tdeeResultContent').classList.add('hidden');
  clearErrors();
}

function calculateBMR(weight, heightCm, age, gender) {
  // Mifflin-St Jeor
  if (gender === 'male') {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
  }
}

document.getElementById('tdeeForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  let valid = true;

  // Age
  const age = parseInt(document.getElementById('tdeeAge').value);
  if (!age || age < 15 || age > 100) {
    showError('tdeeAgeError', 'Enter an age between 15 and 100');
    markError('tdeeAge');
    valid = false;
  }

  // Gender
  const gender = document.querySelector('input[name="tdeeGender"]:checked').value;

  // Height
  let heightCm;
  if (tdeeUnit === 'metric') {
    heightCm = parseFloat(document.getElementById('tdeeHeightCm').value);
    if (!heightCm || heightCm < 100 || heightCm > 280) {
      showError('tdeeHeightCmError', 'Enter a height between 100 and 280 cm');
      markError('tdeeHeightCm');
      valid = false;
    }
  } else {
    const ft = parseInt(document.getElementById('tdeeHeightFt').value);
    const inches = parseInt(document.getElementById('tdeeHeightIn').value) || 0;
    if (!ft || ft < 1 || ft > 9 || inches < 0 || inches > 11) {
      showError('tdeeHeightImperialError', 'Enter a valid height');
      valid = false;
    } else {
      heightCm = (ft * 12 + inches) * 2.54;
    }
  }

  // Weight
  let weightKg;
  if (tdeeUnit === 'metric') {
    weightKg = parseFloat(document.getElementById('tdeeWeightKg').value);
    if (!weightKg || weightKg < 30 || weightKg > 600) {
      showError('tdeeWeightKgError', 'Enter a weight between 30 and 600 kg');
      markError('tdeeWeightKg');
      valid = false;
    }
  } else {
    const lbs = parseFloat(document.getElementById('tdeeWeightLbs').value);
    if (!lbs || lbs < 66 || lbs > 1300) {
      showError('tdeeWeightLbsError', 'Enter a weight between 66 and 1300 lbs');
      markError('tdeeWeightLbs');
      valid = false;
    } else {
      weightKg = lbs * 0.453592;
    }
  }

  // Activity
  const activityFactor = parseFloat(document.querySelector('input[name="tdeeActivity"]:checked').value);

  if (!valid) return;

  // Calculate
  const bmr = calculateBMR(weightKg, heightCm, age, gender);
  const tdee = bmr * activityFactor;

  // Show results
  document.getElementById('tdeePlaceholder').classList.add('hidden');
  document.getElementById('tdeeResultContent').classList.remove('hidden');

  // TDEE value
  document.getElementById('tdeeValue').textContent = Math.round(tdee).toLocaleString();
  document.getElementById('tdeeBmrValue').textContent = Math.round(bmr).toLocaleString() + ' kcal';

  // Goal strip
  const goals = [
    { label: 'Fast Loss', delta: -750, desc: '−750 kcal/day' },
    { label: 'Weight Loss', delta: -500, desc: '−500 kcal/day' },
    { label: 'Mild Loss', delta: -250, desc: '−250 kcal/day' },
    { label: 'Maintain', delta: 0, desc: 'At TDEE' },
    { label: 'Lean Bulk', delta: 250, desc: '+250 kcal/day' },
    { label: 'Bulk', delta: 500, desc: '+500 kcal/day' },
  ];

  const goalStrip = document.getElementById('tdeeGoalStrip');
  goalStrip.innerHTML = goals.map(g => {
    const kcal = Math.round(tdee + g.delta);
    const isActive = g.delta === 0;
    return `<div class="goal-strip-card ${isActive ? 'active-goal' : ''}">
      <div class="goal-strip-label">${g.label}</div>
      <div class="goal-strip-kcal">${kcal.toLocaleString()}</div>
      <div class="goal-strip-desc">${g.desc}</div>
    </div>`;
  }).join('');

  // Activity level table
  const levels = [
    { name: 'Sedentary', desc: 'Desk job, little exercise', factor: 1.2 },
    { name: 'Lightly Active', desc: 'Exercise 1–3 days/week', factor: 1.375 },
    { name: 'Moderately Active', desc: 'Exercise 3–5 days/week', factor: 1.55 },
    { name: 'Very Active', desc: 'Hard exercise 6–7 days/week', factor: 1.725 },
    { name: 'Super Active', desc: 'Physical job + training', factor: 1.9 },
  ];

  const actTable = document.getElementById('tdeeActivityTable');
  actTable.innerHTML = levels.map(l => {
    const val = Math.round(bmr * l.factor);
    const isActive = Math.abs(l.factor - activityFactor) < 0.01;
    return `<tr class="${isActive ? 'al-active' : ''}">
      <td><span class="al-name">${l.name}</span><br/><span class="al-desc">${l.desc}</span></td>
      <td class="al-value">${val.toLocaleString()} kcal</td>
    </tr>`;
  }).join('');

  // Macros (30/40/30)
  const proteinCal = tdee * 0.30;
  const carbsCal = tdee * 0.40;
  const fatCal = tdee * 0.30;
  const proteinG = Math.round(proteinCal / 4);
  const carbsG = Math.round(carbsCal / 4);
  const fatG = Math.round(fatCal / 9);

  document.getElementById('tdeePctProtein').textContent = '30%';
  document.getElementById('tdeePctCarbs').textContent = '40%';
  document.getElementById('tdeePctFat').textContent = '30%';
  document.getElementById('tdeeGProtein').textContent = proteinG + 'g';
  document.getElementById('tdeeGCarbs').textContent = carbsG + 'g';
  document.getElementById('tdeeGFat').textContent = fatG + 'g';

  setTimeout(() => {
    document.getElementById('tdeeBarProtein').style.width = '30%';
    document.getElementById('tdeeBarCarbs').style.width = '40%';
    document.getElementById('tdeeBarFat').style.width = '30%';
  }, 100);

  // Health message
  const healthMsg = document.getElementById('tdeeHealthMsg');
  if (tdee < 1200) {
    healthMsg.className = 'health-message msg-underweight';
    healthMsg.innerHTML = '⚠️ Your calculated TDEE is below 1200 kcal. This is unusually low — please verify your inputs and consult a healthcare professional before restricting calories further.';
  } else if (tdee < 1800) {
    healthMsg.className = 'health-message msg-normal';
    healthMsg.innerHTML = '💡 Your TDEE is on the lower end. If your goal is weight loss, aim for a modest deficit of 200–300 kcal to avoid metabolic slowdown.';
  } else if (tdee < 2800) {
    healthMsg.className = 'health-message msg-normal';
    healthMsg.innerHTML = '✅ Your TDEE is in a typical range. A 500 kcal deficit is safe for steady fat loss, while a 250–500 kcal surplus supports lean muscle gain.';
  } else {
    healthMsg.className = 'health-message msg-normal';
    healthMsg.innerHTML = '💪 Your high TDEE indicates significant daily activity. Ensure you are meeting protein and micronutrient needs with whole foods, especially if pursuing demanding training.';
  }

  // Scroll to results
  document.getElementById('tdeeResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
