/* =================================================
   Body Fat Calculator – body-fat.js
   ================================================= */

let bfUnit = 'metric';

function setUnit(unit) {
  bfUnit = unit;
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');
  document.getElementById('bfHeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('bfHeightImperialGroup').classList.toggle('hidden', unit === 'metric');
  document.getElementById('bfWeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('bfWeightImperialGroup').classList.toggle('hidden', unit === 'metric');

  const measUnit = unit === 'metric' ? 'cm' : 'in';
  document.getElementById('bfMeasUnit').textContent = `(${measUnit})`;
  document.getElementById('bfNeckUnit').textContent = measUnit;
  document.getElementById('bfWaistUnit').textContent = measUnit;
  const hipUnit = document.getElementById('bfHipUnit');
  if (hipUnit) hipUnit.textContent = measUnit;
}

// Show/hide hip input based on gender
document.querySelectorAll('input[name="bfGender"]').forEach(r => {
  r.addEventListener('change', () => {
    const female = document.querySelector('input[name="bfGender"]:checked').value === 'female';
    document.getElementById('bfHipGroup').style.display = female ? '' : 'none';
  });
});

function resetBfForm() {
  document.getElementById('bfForm').reset();
  setUnit('metric');
  document.getElementById('bfHipGroup').style.display = 'none';
  document.getElementById('bfPlaceholder').classList.remove('hidden');
  document.getElementById('bfResultContent').classList.add('hidden');
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function getMaleCategories() {
  return [
    { name: 'Essential', min: 2, max: 5, color: '#3b82f6' },
    { name: 'Athletes', min: 6, max: 13, color: '#10b981' },
    { name: 'Fitness', min: 14, max: 17, color: '#22c55e' },
    { name: 'Average', min: 18, max: 24, color: '#f59e0b' },
    { name: 'Obese', min: 25, max: 40, color: '#ef4444' },
  ];
}

function getFemaleCategories() {
  return [
    { name: 'Essential', min: 10, max: 13, color: '#3b82f6' },
    { name: 'Athletes', min: 14, max: 20, color: '#10b981' },
    { name: 'Fitness', min: 21, max: 24, color: '#22c55e' },
    { name: 'Average', min: 25, max: 31, color: '#f59e0b' },
    { name: 'Obese', min: 32, max: 50, color: '#ef4444' },
  ];
}

function getCategoryName(bf, gender) {
  const cats = gender === 'male' ? getMaleCategories() : getFemaleCategories();
  for (const cat of cats) {
    if (bf >= cat.min && bf <= cat.max) return cat.name;
  }
  if (bf < cats[0].min) return 'Very Low';
  return 'Obese';
}

document.getElementById('bfForm').addEventListener('submit', function(e) {
  e.preventDefault();
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));

  let valid = true;
  const gender = document.querySelector('input[name="bfGender"]:checked').value;

  // Height
  let heightCm;
  if (bfUnit === 'metric') {
    heightCm = parseFloat(document.getElementById('bfHeightCm').value);
    if (!heightCm || heightCm < 100 || heightCm > 280) {
      document.getElementById('bfHeightCmError').textContent = 'Enter height between 100–280 cm';
      valid = false;
    }
  } else {
    const ft = parseInt(document.getElementById('bfHeightFt').value);
    const inches = parseInt(document.getElementById('bfHeightIn').value) || 0;
    if (!ft || ft < 1 || ft > 9) {
      document.getElementById('bfHeightImperialError').textContent = 'Enter a valid height';
      valid = false;
    } else {
      heightCm = (ft * 12 + inches) * 2.54;
    }
  }

  // Weight
  let weightKg;
  if (bfUnit === 'metric') {
    weightKg = parseFloat(document.getElementById('bfWeightKg').value);
    if (!weightKg || weightKg < 30 || weightKg > 600) {
      document.getElementById('bfWeightKgError').textContent = 'Enter weight between 30–600 kg';
      valid = false;
    }
  } else {
    const lbs = parseFloat(document.getElementById('bfWeightLbs').value);
    if (!lbs || lbs < 66 || lbs > 1300) {
      document.getElementById('bfWeightLbsError').textContent = 'Enter weight between 66–1300 lbs';
      valid = false;
    } else {
      weightKg = lbs * 0.453592;
    }
  }

  // Measurements
  let neckCm, waistCm, hipCm;
  const convM = bfUnit === 'metric' ? 1 : 2.54;

  const neckVal = parseFloat(document.getElementById('bfNeck').value);
  const waistVal = parseFloat(document.getElementById('bfWaist').value);

  if (!neckVal || !waistVal) {
    document.getElementById('bfMeasError').textContent = 'Please enter neck and waist measurements';
    valid = false;
  } else {
    neckCm = neckVal * convM;
    waistCm = waistVal * convM;
  }

  if (gender === 'female') {
    const hipVal = parseFloat(document.getElementById('bfHip').value);
    if (!hipVal) {
      document.getElementById('bfMeasError').textContent = 'Please enter hip measurement for women';
      valid = false;
    } else {
      hipCm = hipVal * convM;
    }
  }

  if (!valid) return;

  // U.S. Navy formula
  let bodyFat;
  if (gender === 'male') {
    bodyFat = 86.010 * Math.log10(waistCm - neckCm) - 70.041 * Math.log10(heightCm) + 36.76;
  } else {
    bodyFat = 163.205 * Math.log10(waistCm + hipCm - neckCm) - 97.684 * Math.log10(heightCm) - 78.387;
  }

  bodyFat = Math.max(1, Math.min(60, bodyFat)); // clamp
  const fatMass = weightKg * (bodyFat / 100);
  const leanMass = weightKg - fatMass;
  const bmi = weightKg / ((heightCm / 100) ** 2);

  // Show results
  document.getElementById('bfPlaceholder').classList.add('hidden');
  document.getElementById('bfResultContent').classList.remove('hidden');

  document.getElementById('bfValue').textContent = bodyFat.toFixed(1) + '%';
  const catName = getCategoryName(bodyFat, gender);
  document.getElementById('bfCategory').textContent = catName;

  const wUnit = bfUnit === 'metric' ? 'kg' : 'lbs';
  const wConv = bfUnit === 'metric' ? 1 : 2.20462;
  document.getElementById('bfFatMass').textContent = (fatMass * wConv).toFixed(1) + ' ' + wUnit;
  document.getElementById('bfLeanMass').textContent = (leanMass * wConv).toFixed(1) + ' ' + wUnit;
  document.getElementById('bfCatName').textContent = catName;
  document.getElementById('bfBmi').textContent = bmi.toFixed(1);

  // Category bar
  const cats = gender === 'male' ? getMaleCategories() : getFemaleCategories();
  const totalRange = cats[cats.length - 1].max - cats[0].min;
  const barHtml = `<div class="bf-category-bar">${cats.map(c => {
    const width = ((c.max - c.min) / totalRange) * 100;
    return `<div class="bf-category-segment" style="flex:${width};background:${c.color}">
      <span class="bf-category-label">${c.name}<br/>${c.min}–${c.max}%</span>
    </div>`;
  }).join('')}</div>`;
  document.getElementById('bfCategoryBar').innerHTML = barHtml;

  // Ranges table
  const rangeHtml = `<table class="comparison-table"><thead><tr><th>Category</th><th>Range</th><th>Status</th></tr></thead><tbody>${cats.map(c => {
    const isCurrent = bodyFat >= c.min && bodyFat <= c.max;
    return `<tr class="${isCurrent ? 'highlight-row' : ''}">
      <td><span class="category-dot" style="background:${c.color}"></span> ${c.name}</td>
      <td>${c.min}% – ${c.max}%</td>
      <td>${isCurrent ? '<strong>← You</strong>' : ''}</td>
    </tr>`;
  }).join('')}</tbody></table>`;
  document.getElementById('bfRangesTable').innerHTML = rangeHtml;

  // Health message
  const hm = document.getElementById('bfHealthMsg');
  if (catName === 'Essential' || catName === 'Very Low') {
    hm.className = 'health-message msg-underweight';
    hm.innerHTML = '⚠️ Your body fat is at or below essential levels. This can impact hormonal function and overall health. Consider consulting a healthcare professional.';
  } else if (catName === 'Athletes' || catName === 'Fitness') {
    hm.className = 'health-message msg-normal';
    hm.innerHTML = '✅ Your body fat is in an excellent range for health and fitness. Maintain your current routine with balanced nutrition.';
  } else if (catName === 'Average') {
    hm.className = 'health-message msg-overweight';
    hm.innerHTML = '💡 Your body fat is in the average range. You can improve body composition through resistance training and a moderate caloric deficit.';
  } else {
    hm.className = 'health-message msg-obese';
    hm.innerHTML = '⚠️ Your body fat is above the recommended range. Focus on gradual fat loss through a sustainable caloric deficit, regular exercise, and adequate protein intake.';
  }

  document.getElementById('bfResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
