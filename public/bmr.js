/* =================================================
   BMR Calculator – bmr.js
   ================================================= */

let bmrUnit = 'metric';

function setUnit(unit) {
  bmrUnit = unit;
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');

  document.getElementById('bmrHeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('bmrHeightImperialGroup').classList.toggle('hidden', unit === 'metric');
  document.getElementById('bmrWeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('bmrWeightImperialGroup').classList.toggle('hidden', unit === 'metric');
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

function resetBmrForm() {
  document.getElementById('bmrForm').reset();
  setUnit('metric');
  document.getElementById('bmrPlaceholder').classList.remove('hidden');
  document.getElementById('bmrResultContent').classList.add('hidden');
  clearErrors();
}

// BMR Equations
function mifflinBMR(weight, heightCm, age, gender) {
  if (gender === 'male') {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) + 5;
  } else {
    return (10 * weight) + (6.25 * heightCm) - (5 * age) - 161;
  }
}

function harrisBenedictBMR(weight, heightCm, age, gender) {
  if (gender === 'male') {
    return 88.362 + (13.397 * weight) + (4.799 * heightCm) - (5.677 * age);
  } else {
    return 447.593 + (9.247 * weight) + (3.098 * heightCm) - (4.330 * age);
  }
}

function katchMcArdleBMR(weight, bodyFat) {
  const lbm = weight * (1 - (bodyFat / 100));
  return 370 + 21.6 * lbm;
}

// Boer Formula for Lean Body Mass
function boerLBM(weight, heightCm, gender) {
  if (gender === 'male') {
    return (0.407 * weight) + (0.267 * heightCm) - 19.2;
  } else {
    return (0.252 * weight) + (0.473 * heightCm) - 48.3;
  }
}

// Prefill form from localStorage or query params
function prefillBmrForm() {
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
    document.getElementById('bmrAge').value = age;
  }
  if (gender) {
    if (gender === 'male' || gender === 'm') {
      document.getElementById('bmrGenderMale').checked = true;
    } else if (gender === 'female' || gender === 'f') {
      document.getElementById('bmrGenderFemale').checked = true;
    }
  }

  if (height) {
    if (bmrUnit === 'metric') {
      document.getElementById('bmrHeightCm').value = Math.round(height);
    } else {
      const inchesTotal = height / 2.54;
      const ft = Math.floor(inchesTotal / 12);
      const inches = Math.round(inchesTotal % 12);
      document.getElementById('bmrHeightFt').value = ft;
      document.getElementById('bmrHeightIn').value = inches;
    }
  }

  if (weight) {
    if (bmrUnit === 'metric') {
      document.getElementById('bmrWeightKg').value = parseFloat(weight).toFixed(1);
    } else {
      const lbs = weight * 2.20462;
      document.getElementById('bmrWeightLbs').value = lbs.toFixed(1);
    }
  }

  // If we pre-filled everything, trigger submit to show results immediately
  if (age && height && weight) {
    document.getElementById('bmrCalcBtn').click();
  }
}

document.getElementById('bmrForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  let valid = true;

  // Age
  const age = parseInt(document.getElementById('bmrAge').value);
  if (!age || age < 15 || age > 100) {
    showError('bmrAgeError', 'Enter an age between 15 and 100');
    markError('bmrAge');
    valid = false;
  }

  // Gender
  const gender = document.querySelector('input[name="bmrGender"]:checked').value;

  // Height
  let heightCm;
  if (bmrUnit === 'metric') {
    heightCm = parseFloat(document.getElementById('bmrHeightCm').value);
    if (!heightCm || heightCm < 100 || heightCm > 280) {
      showError('bmrHeightCmError', 'Enter a height between 100 and 280 cm');
      markError('bmrHeightCm');
      valid = false;
    }
  } else {
    const ft = parseInt(document.getElementById('bmrHeightFt').value);
    const inches = parseInt(document.getElementById('bmrHeightIn').value) || 0;
    if (!ft || ft < 1 || ft > 9 || inches < 0 || inches > 11) {
      showError('bmrHeightImperialError', 'Enter a valid height');
      valid = false;
    } else {
      heightCm = (ft * 12 + inches) * 2.54;
    }
  }

  // Weight
  let weightKg;
  if (bmrUnit === 'metric') {
    weightKg = parseFloat(document.getElementById('bmrWeightKg').value);
    if (!weightKg || weightKg < 30 || weightKg > 600) {
      showError('bmrWeightKgError', 'Enter a weight between 30 and 600 kg');
      markError('bmrWeightKg');
      valid = false;
    }
  } else {
    const lbs = parseFloat(document.getElementById('bmrWeightLbs').value);
    if (!lbs || lbs < 66 || lbs > 1300) {
      showError('bmrWeightLbsError', 'Enter a weight between 66 and 1300 lbs');
      markError('bmrWeightLbs');
      valid = false;
    } else {
      weightKg = lbs * 0.453592;
    }
  }

  // Body Fat (Optional)
  const bfVal = document.getElementById('bmrBodyFat').value;
  let bodyFat = null;
  if (bfVal !== '') {
    bodyFat = parseFloat(bfVal);
    if (isNaN(bodyFat) || bodyFat < 2 || bodyFat > 60) {
      showError('bmrBodyFatError', 'Enter a body fat percentage between 2% and 60%');
      markError('bmrBodyFat');
      valid = false;
    }
  }

  if (!valid) return;

  // Calculations
  const bmrMifflin = mifflinBMR(weightKg, heightCm, age, gender);
  const bmrHarris = harrisBenedictBMR(weightKg, heightCm, age, gender);
  let bmrKatch = null;
  let lbmKg;

  if (bodyFat !== null) {
    lbmKg = weightKg * (1 - (bodyFat / 100));
    bmrKatch = katchMcArdleBMR(weightKg, bodyFat);
  } else {
    lbmKg = boerLBM(weightKg, heightCm, gender);
    // Katch McArdle using estimated LBM
    bmrKatch = 370 + 21.6 * lbmKg;
  }

  // Main BMR Display (Mifflin is clinical standard)
  const mainBMR = bmrMifflin;

  // Hourly metabolic rate
  const hourlyBMR = mainBMR / 24;

  // LBM conversion
  const displayUnit = bmrUnit === 'metric' ? 'kg' : 'lbs';
  const convFactor = bmrUnit === 'metric' ? 1 : 2.20462;
  const lbmDisplay = (lbmKg * convFactor).toFixed(1) + ' ' + displayUnit;

  // Update UI Elements
  document.getElementById('bmrPlaceholder').classList.add('hidden');
  document.getElementById('bmrResultContent').classList.remove('hidden');

  document.getElementById('bmrValueDisplay').textContent = Math.round(mainBMR).toLocaleString();
  document.getElementById('bmrHourlyValue').textContent = Math.round(hourlyBMR) + ' kcal/hr';
  document.getElementById('bmrLbmValue').textContent = lbmDisplay;

  // Populate Formula comparison table
  const formulaBody = document.getElementById('bmrFormulaBody');
  let katchBasis = bodyFat !== null ? 'Direct (Measured Body Fat)' : 'Boer Estimate (Height/Weight)';
  
  formulaBody.innerHTML = `
    <tr class="highlight-row">
      <td><span class="formula-tag">Mifflin-St Jeor</span></td>
      <td><strong>${Math.round(bmrMifflin).toLocaleString()} kcal</strong></td>
      <td>Clinical standard, highly accurate for modern body shapes.</td>
    </tr>
    <tr>
      <td><span class="formula-tag">Harris-Benedict</span></td>
      <td><strong>${Math.round(bmrHarris).toLocaleString()} kcal</strong></td>
      <td>Revised model (1984), popular for athletics.</td>
    </tr>
    <tr>
      <td><span class="formula-tag">Katch-McArdle</span></td>
      <td><strong>${Math.round(bmrKatch).toLocaleString()} kcal</strong></td>
      <td>Lean body mass focused. Basis: ${katchBasis}.</td>
    </tr>
  `;

  // Populate Activity levels table (TDEE)
  const levels = [
    { name: 'Sedentary', desc: 'Desk job, little or no exercise', factor: 1.2 },
    { name: 'Lightly Active', desc: 'Light exercise 1–3 days/week', factor: 1.375 },
    { name: 'Moderately Active', desc: 'Moderate exercise 3–5 days/week', factor: 1.55 },
    { name: 'Very Active', desc: 'Hard exercise 6–7 days/week', factor: 1.725 },
    { name: 'Super Active', desc: 'Physical job + hard exercise daily', factor: 1.9 }
  ];

  const actTable = document.getElementById('bmrActivityTable');
  actTable.innerHTML = `
    <thead>
      <tr>
        <th>Activity Level</th>
        <th style="text-align:right">Estimated TDEE</th>
      </tr>
    </thead>
    <tbody>
      ${levels.map(l => {
        const val = Math.round(mainBMR * l.factor);
        return `
          <tr>
            <td>
              <span class="al-name">${l.name}</span><br/>
              <span class="al-desc">${l.desc}</span>
            </td>
            <td class="al-value">${val.toLocaleString()} kcal/day</td>
          </tr>
        `;
      }).join('')}
    </tbody>
  `;

  // Health Message
  const healthMsg = document.getElementById('bmrHealthMsg');
  healthMsg.className = 'health-message msg-normal';
  
  let msg = `💡 Your Basal Metabolic Rate of <strong>${Math.round(mainBMR).toLocaleString()} calories</strong> is the minimum energy required to keep your body alive at rest. `;
  if (bodyFat === null) {
    msg += `You can enter your body fat percentage to calculate a highly customized BMR reading using the Katch-McArdle formula.`;
  } else {
    msg += `Since you provided your body fat percentage, the Katch-McArdle formula estimate (<strong>${Math.round(bmrKatch).toLocaleString()} kcal</strong>) represents your rest needs adjusted for muscular lean tissue.`;
  }
  
  healthMsg.innerHTML = msg;

  // Scroll to results
  document.getElementById('bmrResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Run prefill on load
document.addEventListener('DOMContentLoaded', prefillBmrForm);
