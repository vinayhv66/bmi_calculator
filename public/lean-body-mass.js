/* =================================================
   Lean Body Mass Calculator – lean-body-mass.js
   ================================================= */

let lbmUnit = 'metric';

function setUnit(unit) {
  lbmUnit = unit;
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');

  document.getElementById('lbmHeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('lbmHeightImperialGroup').classList.toggle('hidden', unit === 'metric');
  document.getElementById('lbmWeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('lbmWeightImperialGroup').classList.toggle('hidden', unit === 'metric');
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

function resetLbmForm() {
  document.getElementById('lbmForm').reset();
  setUnit('metric');
  document.getElementById('lbmPlaceholder').classList.remove('hidden');
  document.getElementById('lbmResultContent').classList.add('hidden');
  clearErrors();
}

// Formulas
function boerLBM(weight, heightCm, gender) {
  if (gender === 'male') {
    return (0.407 * weight) + (0.267 * heightCm) - 19.2;
  } else {
    return (0.252 * weight) + (0.473 * heightCm) - 48.3;
  }
}

function jamesLBM(weight, heightCm, gender) {
  if (gender === 'male') {
    return 1.1 * weight - 128 * ((weight / heightCm) ** 2);
  } else {
    return 1.07 * weight - 148 * ((weight / heightCm) ** 2);
  }
}

function humeLBM(weight, heightCm, gender) {
  if (gender === 'male') {
    return 0.32810 * weight + 0.33929 * heightCm - 29.5336;
  } else {
    return 0.29569 * weight + 0.41813 * heightCm - 43.2933;
  }
}

// Classify FFMI
function classifyFFMI(ffmi, gender) {
  if (gender === 'male') {
    if (ffmi < 18) return 'Below Average';
    if (ffmi < 20) return 'Average';
    if (ffmi < 22) return 'Above Average';
    if (ffmi < 25) return 'Excellent (Athletic)';
    if (ffmi < 28) return 'Superior (Natural Limit)';
    return 'Extreme Muscularity';
  } else {
    if (ffmi < 15) return 'Below Average';
    if (ffmi < 17) return 'Average';
    if (ffmi < 19) return 'Above Average';
    if (ffmi < 22) return 'Excellent (Athletic)';
    return 'Superior / Muscular';
  }
}

// Prefill form from localStorage or query params
function prefillLbmForm() {
  const params = new URLSearchParams(window.location.search);
  const age = params.get('age') || localStorage.getItem('bmi_age');
  const gender = params.get('gender') || localStorage.getItem('bmi_gender');
  const height = params.get('height') || localStorage.getItem('bmi_height');
  const weight = params.get('weight') || localStorage.getItem('bmi_weight');
  const unit = params.get('unit') || localStorage.getItem('bmi_unit');
  const bodyFat = params.get('bf') || params.get('bodyfat') || localStorage.getItem('bmi_bodyfat');

  if (unit === 'imperial') {
    setUnit('imperial');
  }

  if (age) {
    document.getElementById('lbmAge').value = age;
  }
  if (gender) {
    if (gender === 'male' || gender === 'm') {
      document.getElementById('lbmGenderMale').checked = true;
    } else if (gender === 'female' || gender === 'f') {
      document.getElementById('lbmGenderFemale').checked = true;
    }
  }

  if (height) {
    if (lbmUnit === 'metric') {
      document.getElementById('lbmHeightCm').value = Math.round(height);
    } else {
      const inchesTotal = height / 2.54;
      const ft = Math.floor(inchesTotal / 12);
      const inches = Math.round(inchesTotal % 12);
      document.getElementById('lbmHeightFt').value = ft;
      document.getElementById('lbmHeightIn').value = inches;
    }
  }

  if (weight) {
    if (lbmUnit === 'metric') {
      document.getElementById('lbmWeightKg').value = parseFloat(weight).toFixed(1);
    } else {
      const lbs = weight * 2.20462;
      document.getElementById('lbmWeightLbs').value = lbs.toFixed(1);
    }
  }

  if (bodyFat) {
    document.getElementById('lbmBodyFat').value = bodyFat;
  }

  // If we pre-filled crucial details, calculate immediately
  if (age && height && weight) {
    document.getElementById('lbmCalcBtn').click();
  }
}

document.getElementById('lbmForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  let valid = true;

  // Age
  const age = parseInt(document.getElementById('lbmAge').value);
  if (!age || age < 15 || age > 100) {
    showError('lbmAgeError', 'Enter an age between 15 and 100');
    markError('lbmAge');
    valid = false;
  }

  // Gender
  const gender = document.querySelector('input[name="lbmGender"]:checked').value;

  // Height
  let heightCm;
  if (lbmUnit === 'metric') {
    heightCm = parseFloat(document.getElementById('lbmHeightCm').value);
    if (!heightCm || heightCm < 100 || heightCm > 280) {
      showError('lbmHeightCmError', 'Enter a height between 100 and 280 cm');
      markError('lbmHeightCm');
      valid = false;
    }
  } else {
    const ft = parseInt(document.getElementById('lbmHeightFt').value);
    const inches = parseInt(document.getElementById('lbmHeightIn').value) || 0;
    if (!ft || ft < 1 || ft > 9 || inches < 0 || inches > 11) {
      showError('lbmHeightImperialError', 'Enter a valid height');
      valid = false;
    } else {
      heightCm = (ft * 12 + inches) * 2.54;
    }
  }

  // Weight
  let weightKg;
  if (lbmUnit === 'metric') {
    weightKg = parseFloat(document.getElementById('lbmWeightKg').value);
    if (!weightKg || weightKg < 30 || weightKg > 600) {
      showError('lbmWeightKgError', 'Enter a weight between 30 and 600 kg');
      markError('lbmWeightKg');
      valid = false;
    }
  } else {
    const lbs = parseFloat(document.getElementById('lbmWeightLbs').value);
    if (!lbs || lbs < 66 || lbs > 1300) {
      showError('lbmWeightLbsError', 'Enter a weight between 66 and 1300 lbs');
      markError('lbmWeightLbs');
      valid = false;
    } else {
      weightKg = lbs * 0.453592;
    }
  }

  // Body Fat (Optional)
  const bfVal = document.getElementById('lbmBodyFat').value;
  let bodyFat = null;
  if (bfVal !== '') {
    bodyFat = parseFloat(bfVal);
    if (isNaN(bodyFat) || bodyFat < 2 || bodyFat > 60) {
      showError('lbmBodyFatError', 'Enter a body fat percentage between 2% and 60%');
      markError('lbmBodyFat');
      valid = false;
    }
  }

  if (!valid) return;

  // Calculate LBM across formulas
  const lbmBoer = boerLBM(weightKg, heightCm, gender);
  const lbmJames = jamesLBM(weightKg, heightCm, gender);
  const lbmHume = humeLBM(weightKg, heightCm, gender);
  let lbmDirect = null;

  if (bodyFat !== null) {
    lbmDirect = weightKg * (1 - (bodyFat / 100));
  }

  // Main LBM value (Direct is gold standard, Boer is default estimate)
  const mainLbmKg = lbmDirect !== null ? lbmDirect : lbmBoer;
  const fatWeightKg = weightKg - mainLbmKg;
  const lbmPct = (mainLbmKg / weightKg) * 100;

  // FFMI calculations
  const heightM = heightCm / 100;
  const ffmi = mainLbmKg / (heightM * heightM);
  const normalizedFfmi = ffmi + 6.1 * (1.8 - heightM);
  const ffmiClass = classifyFFMI(normalizedFfmi, gender);

  // Conversions for display
  const displayUnit = lbmUnit === 'metric' ? 'kg' : 'lbs';
  const convFactor = lbmUnit === 'metric' ? 1 : 2.20462;

  // Update UI display
  document.getElementById('lbmPlaceholder').classList.add('hidden');
  document.getElementById('lbmResultContent').classList.remove('hidden');

  document.getElementById('lbmValueDisplay').textContent = (mainLbmKg * convFactor).toFixed(1);
  document.getElementById('lbmUnitDisplay').textContent = displayUnit;
  document.getElementById('lbmPctDisplay').textContent = lbmPct.toFixed(1) + '%';
  document.getElementById('lbmFatWeightDisplay').textContent = (fatWeightKg * convFactor).toFixed(1) + ' ' + displayUnit;

  document.getElementById('lbmFfmiDisplay').textContent = normalizedFfmi.toFixed(1);
  document.getElementById('lbmFfmiDesc').textContent = ffmiClass;

  // Comparison Table
  const formulaBody = document.getElementById('lbmFormulaBody');
  let rowsHtml = `
    <tr class="${lbmDirect === null ? 'highlight-row' : ''}">
      <td><span class="formula-tag">Boer Formula</span></td>
      <td><strong>${(lbmBoer * convFactor).toFixed(1)} ${displayUnit}</strong></td>
      <td>${((lbmBoer / weightKg) * 100).toFixed(1)}%</td>
    </tr>
    <tr>
      <td><span class="formula-tag">James Formula</span></td>
      <td><strong>${(lbmJames * convFactor).toFixed(1)} ${displayUnit}</strong></td>
      <td>${((lbmJames / weightKg) * 100).toFixed(1)}%</td>
    </tr>
    <tr>
      <td><span class="formula-tag">Hume Formula</span></td>
      <td><strong>${(lbmHume * convFactor).toFixed(1)} ${displayUnit}</strong></td>
      <td>${((lbmHume / weightKg) * 100).toFixed(1)}%</td>
    </tr>
  `;

  if (lbmDirect !== null) {
    rowsHtml = `
      <tr class="highlight-row">
        <td><span class="formula-tag">Direct Calculation</span></td>
        <td><strong>${(lbmDirect * convFactor).toFixed(1)} ${displayUnit}</strong></td>
        <td>${lbmPct.toFixed(1)}%</td>
      </tr>
    ` + rowsHtml;
  }

  formulaBody.innerHTML = rowsHtml;

  // Health Message
  const healthMsg = document.getElementById('lbmHealthMsg');
  healthMsg.className = 'health-message msg-normal';

  let msg = `💡 Your estimated Lean Body Mass is <strong>${(mainLbmKg * convFactor).toFixed(1)} ${displayUnit}</strong> (<strong>${lbmPct.toFixed(1)}%</strong> of total weight). `;
  
  if (gender === 'male') {
    if (lbmPct < 75) {
      msg += `Your body fat level is slightly high. Resistance training and a slight caloric deficit can help improve your lean ratio.`;
    } else if (lbmPct <= 86) {
      msg += `This is a healthy, typical lean mass percentage for adult males.`;
    } else {
      msg += `You have an exceptionally high lean mass percentage (typical of athletes and bodybuilders).`;
    }
  } else {
    // female
    if (lbmPct < 68) {
      msg += `Your body fat level is slightly high. Regular strength exercises and active movements can help tone and build lean tissue.`;
    } else if (lbmPct <= 79) {
      msg += `This is a healthy, typical lean mass percentage for adult females.`;
    } else {
      msg += `You have an exceptionally high lean mass percentage (typical of well-conditioned athletes).`;
    }
  }

  msg += `<br/><br/>Your Normalized FFMI is <strong>${normalizedFfmi.toFixed(1)}</strong>, classifying your muscularity as <strong>${ffmiClass}</strong>. `;
  if (bodyFat === null) {
    msg += `Enter your body fat percentage to calculate a highly precise, non-estimated LBM and FFMI analysis.`;
  }
  
  healthMsg.innerHTML = msg;

  // Scroll to results
  document.getElementById('lbmResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});

// Run prefill on load
document.addEventListener('DOMContentLoaded', prefillLbmForm);
