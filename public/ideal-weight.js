/* =================================================
   Ideal Weight Calculator – ideal-weight.js
   ================================================= */

let iwUnit = 'metric';

function setUnit(unit) {
  iwUnit = unit;
  document.getElementById('btnMetric').classList.toggle('active', unit === 'metric');
  document.getElementById('btnImperial').classList.toggle('active', unit === 'imperial');
  document.getElementById('iwHeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('iwHeightImperialGroup').classList.toggle('hidden', unit === 'metric');
  document.getElementById('iwWeightMetricGroup').classList.toggle('hidden', unit !== 'metric');
  document.getElementById('iwWeightImperialGroup').classList.toggle('hidden', unit === 'metric');
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function resetIwForm() {
  document.getElementById('iwForm').reset();
  setUnit('metric');
  document.getElementById('iwPlaceholder').classList.remove('hidden');
  document.getElementById('iwResultContent').classList.add('hidden');
  clearErrors();
}

// Ideal weight formulas (all take height in inches over 5 feet)
function devineIBW(inchesOver5, gender) {
  return gender === 'male' ? 50 + 2.3 * inchesOver5 : 45.5 + 2.3 * inchesOver5;
}
function robinsonIBW(inchesOver5, gender) {
  return gender === 'male' ? 52 + 1.9 * inchesOver5 : 49 + 1.7 * inchesOver5;
}
function millerIBW(inchesOver5, gender) {
  return gender === 'male' ? 56.2 + 1.41 * inchesOver5 : 53.1 + 1.36 * inchesOver5;
}
function hamwiIBW(inchesOver5, gender) {
  return gender === 'male' ? 48 + 2.7 * inchesOver5 : 45.5 + 2.2 * inchesOver5;
}

document.getElementById('iwForm').addEventListener('submit', function(e) {
  e.preventDefault();
  clearErrors();

  let valid = true;
  const gender = document.querySelector('input[name="iwGender"]:checked').value;
  const frame = document.querySelector('input[name="iwFrame"]:checked').value;

  // Height
  let heightCm;
  if (iwUnit === 'metric') {
    heightCm = parseFloat(document.getElementById('iwHeightCm').value);
    if (!heightCm || heightCm < 100 || heightCm > 280) {
      document.getElementById('iwHeightCmError').textContent = 'Enter a height between 100 and 280 cm';
      document.getElementById('iwHeightCm').classList.add('error');
      valid = false;
    }
  } else {
    const ft = parseInt(document.getElementById('iwHeightFt').value);
    const inches = parseInt(document.getElementById('iwHeightIn').value) || 0;
    if (!ft || ft < 1 || ft > 9 || inches < 0 || inches > 11) {
      document.getElementById('iwHeightImperialError').textContent = 'Enter a valid height';
      valid = false;
    } else {
      heightCm = (ft * 12 + inches) * 2.54;
    }
  }

  // Current weight (optional)
  let currentWeightKg = null;
  if (iwUnit === 'metric') {
    const wv = parseFloat(document.getElementById('iwWeightKg').value);
    if (wv && wv >= 20 && wv <= 600) currentWeightKg = wv;
  } else {
    const wv = parseFloat(document.getElementById('iwWeightLbs').value);
    if (wv && wv >= 44 && wv <= 1300) currentWeightKg = wv * 0.453592;
  }

  if (!valid) return;

  // Convert cm to inches over 5 feet
  const totalInches = heightCm / 2.54;
  const inchesOver5 = Math.max(0, totalInches - 60);

  // Calculate all formulas
  const formulas = [
    { name: 'Devine', fn: devineIBW },
    { name: 'Robinson', fn: robinsonIBW },
    { name: 'Miller', fn: millerIBW },
    { name: 'Hamwi', fn: hamwiIBW },
  ];

  // Frame adjustment
  const frameAdj = frame === 'small' ? 0.90 : frame === 'large' ? 1.10 : 1.0;

  const results = formulas.map(f => {
    const raw = f.fn(inchesOver5, gender);
    const adjusted = raw * frameAdj;
    const bmiAtIdeal = adjusted / ((heightCm / 100) ** 2);
    return { name: f.name, weight: adjusted, bmi: bmiAtIdeal };
  });

  const avgWeight = results.reduce((s, r) => s + r.weight, 0) / results.length;
  const heightM = heightCm / 100;

  // Show results
  document.getElementById('iwPlaceholder').classList.add('hidden');
  document.getElementById('iwResultContent').classList.remove('hidden');

  // Average value
  const displayUnit = iwUnit === 'metric' ? 'kg' : 'lbs';
  const convFactor = iwUnit === 'metric' ? 1 : 2.20462;

  document.getElementById('iwAvgValue').textContent = (avgWeight * convFactor).toFixed(1);
  document.getElementById('iwAvgUnit').textContent = displayUnit;

  // Formula table
  const tbody = document.getElementById('iwFormulaBody');
  tbody.innerHTML = results.map(r => {
    const w = (r.weight * convFactor).toFixed(1);
    return `<tr>
      <td><span class="formula-tag">${r.name}</span></td>
      <td><strong>${w} ${displayUnit}</strong></td>
      <td>${r.bmi.toFixed(1)}</td>
    </tr>`;
  }).join('') + `<tr class="highlight-row">
    <td><strong>Average</strong></td>
    <td><strong>${(avgWeight * convFactor).toFixed(1)} ${displayUnit}</strong></td>
    <td>${(avgWeight / (heightM * heightM)).toFixed(1)}</td>
  </tr>`;

  // Healthy weight range (BMI 18.5 – 24.9)
  const minHealthy = 18.5 * heightM * heightM;
  const maxHealthy = 24.9 * heightM * heightM;
  document.getElementById('iwHealthyRange').textContent =
    `${(minHealthy * convFactor).toFixed(1)} – ${(maxHealthy * convFactor).toFixed(1)} ${displayUnit}`;

  // Weight delta
  const diffEl = document.getElementById('iwWeightDiff');
  if (currentWeightKg) {
    const delta = currentWeightKg - avgWeight;
    const absDelta = Math.abs(delta * convFactor).toFixed(1);
    diffEl.style.display = '';
    if (Math.abs(delta) < 1) {
      diffEl.innerHTML = `✅ You are at your ideal weight! Excellent!`;
    } else if (delta > 0) {
      diffEl.innerHTML = `📉 You are <strong>${absDelta} ${displayUnit}</strong> above your ideal weight average.`;
    } else {
      diffEl.innerHTML = `📈 You are <strong>${absDelta} ${displayUnit}</strong> below your ideal weight average.`;
    }
  } else {
    diffEl.style.display = 'none';
  }

  // Health message
  const healthMsg = document.getElementById('iwHealthMsg');
  healthMsg.className = 'health-message msg-normal';
  healthMsg.innerHTML = `💡 Your ideal weight range across all four formulas is <strong>${(Math.min(...results.map(r => r.weight)) * convFactor).toFixed(1)} – ${(Math.max(...results.map(r => r.weight)) * convFactor).toFixed(1)} ${displayUnit}</strong>. Remember, these are estimates — muscle mass, body composition, and individual health markers matter more than any single number.`;

  document.getElementById('iwResultCard').scrollIntoView({ behavior: 'smooth', block: 'start' });
});
