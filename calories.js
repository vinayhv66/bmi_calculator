/* =================================================
   Calories Calculator – calories.js
   ================================================= */

// ─── Theme (shared with BMI page) ─────────────
(function initTheme() {
  const saved = localStorage.getItem('bmiTheme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // Theme toggle
  const toggleBtn = document.getElementById('themeToggle');
  const sunIcon   = document.getElementById('sunIcon');
  const moonIcon  = document.getElementById('moonIcon');

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    sunIcon.style.display  = dark ? 'none'  : 'block';
    moonIcon.style.display = dark ? 'block' : 'none';
    localStorage.setItem('bmiTheme', dark ? 'dark' : 'light');
  }

  applyTheme(document.documentElement.classList.contains('dark'));

  toggleBtn.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'));
  });

  // ─── Pre-fill from BMI data ──────────────────
  const bmiRaw = localStorage.getItem('bmiData');
  if (bmiRaw) {
    try {
      const d = JSON.parse(bmiRaw);
      prefillFromBmi(d);
    } catch(e) { /* ignore */ }
  }

  // ─── Scroll-Reveal IntersectionObserver ───────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));

  // ─── Unit toggle ────────────────────────────
  window.setUnit = function(unit) {
    const metric = unit === 'metric';
    document.getElementById('btnMetric').classList.toggle('active', metric);
    document.getElementById('btnImperial').classList.toggle('active', !metric);
    document.getElementById('calHeightMetricGroup').classList.toggle('hidden', !metric);
    document.getElementById('calHeightImperialGroup').classList.toggle('hidden', metric);
    document.getElementById('calWeightMetricGroup').classList.toggle('hidden', !metric);
    document.getElementById('calWeightImperialGroup').classList.toggle('hidden', metric);
    clearErrors();
  };

  // ─── Form submit ────────────────────────────
  const form = document.getElementById('calForm');
  form.addEventListener('submit', e => {
    e.preventDefault();
    if (validateCal()) calculateCalories();
  });

  // ─── Reset ──────────────────────────────────
  window.resetCalForm = function() {
    form.reset();
    clearErrors();
    setUnit('metric');
    document.getElementById('calResultContent').classList.add('hidden');
    document.getElementById('calPlaceholder').classList.remove('hidden');
  };
});

// ─── Pre-fill helper ────────────────────────────
function prefillFromBmi(d) {
  const notice = document.getElementById('prefillNotice');
  const text   = document.getElementById('prefillText');

  if (d.age)    document.getElementById('calAge').value   = d.age;
  if (d.gender === 'female') {
    document.getElementById('calGenderFemale').checked = true;
    document.getElementById('calGenderMale').checked   = false;
  }

  if (d.unit === 'metric') {
    setUnit('metric');
    if (d.heightM) document.getElementById('calHeightCm').value = Math.round(d.heightM * 100);
    if (d.weightKg) document.getElementById('calWeightKg').value = d.weightKg.toFixed(1);
  } else {
    setUnit('imperial');
    if (d.heightM) {
      const totalIn = Math.round(d.heightM / 0.0254);
      document.getElementById('calHeightFt').value = Math.floor(totalIn / 12);
      document.getElementById('calHeightIn').value = totalIn % 12;
    }
    if (d.weightKg) {
      document.getElementById('calWeightLbs').value = (d.weightKg / 0.453592).toFixed(1);
    }
  }

  // Auto-select goal based on BMI category
  const goalMap = {
    underweight: 'gain1',
    normal:      'maintain',
    overweight:  'lose1',
    obese:       'lose2'
  };
  const suggestedGoal = goalMap[d.categoryKey] || 'maintain';
  const goalEl = document.getElementById('goal' + capitalize(suggestedGoal));
  if (goalEl) goalEl.checked = true;

  const goalLabels = { lose2:'lose weight', lose1:'mild loss', maintain:'maintain', gain1:'mild gain', gain2:'gain muscle', aggressive:'fast loss' };
  text.textContent = `Pre-filled from your BMI (${d.bmi}) — goal set to "${goalLabels[suggestedGoal] || 'maintain'}"`;
  notice.classList.remove('hidden');
}

function capitalize(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

// ─── Validation ─────────────────────────────────
function isMetric() {
  return document.getElementById('btnMetric').classList.contains('active');
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function setError(inputId, errorId, msg) {
  const inp = document.getElementById(inputId);
  const err = document.getElementById(errorId);
  if (inp) inp.classList.add('error');
  if (err) err.textContent = msg;
}

function validateCal() {
  clearErrors();
  let valid = true;

  const age = parseFloat(document.getElementById('calAge').value);
  if (!age || age < 15 || age > 100) {
    setError('calAge', 'calAgeError', 'Enter a valid age between 15 and 100.');
    valid = false;
  }

  if (isMetric()) {
    const h = parseFloat(document.getElementById('calHeightCm').value);
    if (!h || h < 100 || h > 280) {
      setError('calHeightCm', 'calHeightCmError', 'Enter height between 100 and 280 cm.');
      valid = false;
    }
    const w = parseFloat(document.getElementById('calWeightKg').value);
    if (!w || w < 30 || w > 600) {
      setError('calWeightKg', 'calWeightKgError', 'Enter weight between 30 and 600 kg.');
      valid = false;
    }
  } else {
    const ft  = parseFloat(document.getElementById('calHeightFt').value);
    const inn = parseFloat(document.getElementById('calHeightIn').value);
    if (!ft || ft < 1 || ft > 9) {
      setError('calHeightFt', 'calHeightImperialError', 'Enter a valid height in feet (1–9).');
      valid = false;
    } else if (isNaN(inn) || inn < 0 || inn > 11) {
      setError('calHeightIn', 'calHeightImperialError', 'Inches must be 0–11.');
      valid = false;
    }
    const lbs = parseFloat(document.getElementById('calWeightLbs').value);
    if (!lbs || lbs < 66 || lbs > 1300) {
      setError('calWeightLbs', 'calWeightLbsError', 'Enter weight between 66 and 1300 lbs.');
      valid = false;
    }
  }

  return valid;
}

// ─── Main Calculation ────────────────────────────
function calculateCalories() {
  const age    = parseFloat(document.getElementById('calAge').value);
  const gender = document.querySelector('input[name="calGender"]:checked').value;
  const actMul = parseFloat(document.querySelector('input[name="activity"]:checked').value);
  const goal   = document.querySelector('input[name="goal"]:checked').value;

  let weightKg, heightCm;

  if (isMetric()) {
    heightCm = parseFloat(document.getElementById('calHeightCm').value);
    weightKg = parseFloat(document.getElementById('calWeightKg').value);
  } else {
    const ft  = parseFloat(document.getElementById('calHeightFt').value);
    const inn = parseFloat(document.getElementById('calHeightIn').value) || 0;
    heightCm = (ft * 12 + inn) * 2.54;
    weightKg = parseFloat(document.getElementById('calWeightLbs').value) * 0.453592;
  }

  // Mifflin-St Jeor BMR
  let bmr;
  if (gender === 'male') {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age + 5;
  } else {
    bmr = 10 * weightKg + 6.25 * heightCm - 5 * age - 161;
  }

  const tdee = bmr * actMul;

  const goalOffsets = {
    lose2:      -500,
    lose1:      -250,
    maintain:   0,
    gain1:      +250,
    gain2:      +500,
    aggressive: -750
  };

  const targetCals = tdee + (goalOffsets[goal] || 0);

  renderCalResult({ bmr, tdee, targetCals, goal, weightKg });
}

// ─── Goal strip data ─────────────────────────────
const GOAL_DEFS = [
  { id: 'lose2',      label: 'Lose Weight',   emoji: '📉', offset: -500,  desc: '~0.5 kg/week' },
  { id: 'lose1',      label: 'Mild Loss',     emoji: '🔽', offset: -250,  desc: '~0.25 kg/week' },
  { id: 'maintain',   label: 'Maintain',      emoji: '⚖️', offset: 0,     desc: 'Stay at TDEE' },
  { id: 'gain1',      label: 'Mild Gain',     emoji: '🔼', offset: +250,  desc: '~0.25 kg/week' },
  { id: 'gain2',      label: 'Gain Muscle',   emoji: '📈', offset: +500,  desc: '~0.5 kg/week' },
  { id: 'aggressive', label: 'Fast Loss',     emoji: '⚡', offset: -750,  desc: '~0.75 kg/week' },
];

// ─── Render ──────────────────────────────────────
function renderCalResult({ bmr, tdee, targetCals, goal, weightKg }) {
  const placeholder = document.getElementById('calPlaceholder');
  const content     = document.getElementById('calResultContent');
  const resultCard  = document.getElementById('calResultCard');

  placeholder.classList.add('hidden');
  content.classList.remove('hidden');
  content.classList.remove('fade-in-up');
  // Force reflow for animation re-trigger
  void content.offsetWidth;
  content.classList.add('fade-in-up');

  // Scroll result into view so user doesn't have to scroll up
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);

  // TDEE hero
  document.getElementById('tdeeValue').textContent = Math.round(targetCals).toLocaleString();

  const goalLabelMap = {
    lose2: 'lose weight (fast)',
    lose1: 'lose weight (mild)',
    maintain: 'maintain weight',
    gain1: 'gain weight (mild)',
    gain2: 'build muscle',
    aggressive: 'lose weight aggressively'
  };
  document.getElementById('tdeeGoalLabel').textContent = goalLabelMap[goal] || 'reach your goal';

  // BMR
  document.getElementById('bmrValue').textContent = `${Math.round(bmr).toLocaleString()} kcal/day`;

  // Goal strip
  const strip = document.getElementById('goalStrip');
  strip.innerHTML = '';
  GOAL_DEFS.forEach(def => {
    const kcal = Math.round(tdee + def.offset);
    const isActive = def.id === goal;
    strip.innerHTML += `
      <div class="goal-strip-card${isActive ? ' active-goal' : ''}">
        <div class="goal-strip-label">${def.emoji} ${def.label}</div>
        <div class="goal-strip-kcal">${kcal.toLocaleString()}</div>
        <div class="goal-strip-desc">${def.desc}</div>
      </div>`;
  });

  // Macros (30% protein, 40% carbs, 30% fat)
  const proteinPct = 30, carbsPct = 40, fatPct = 30;
  const proteinKcal = targetCals * proteinPct / 100;
  const carbsKcal   = targetCals * carbsPct   / 100;
  const fatKcal     = targetCals * fatPct     / 100;

  const proteinG = Math.round(proteinKcal / 4);
  const carbsG   = Math.round(carbsKcal   / 4);
  const fatG     = Math.round(fatKcal     / 9);

  document.getElementById('pctProtein').textContent = proteinPct + '%';
  document.getElementById('pctCarbs').textContent   = carbsPct + '%';
  document.getElementById('pctFat').textContent     = fatPct + '%';

  document.getElementById('gProtein').textContent = `${proteinG}g`;
  document.getElementById('gCarbs').textContent   = `${carbsG}g`;
  document.getElementById('gFat').textContent     = `${fatG}g`;

  // Animate bars after a tick
  setTimeout(() => {
    document.getElementById('barProtein').style.width = proteinPct + '%';
    document.getElementById('barCarbs').style.width   = carbsPct   + '%';
    document.getElementById('barFat').style.width     = fatPct     + '%';
  }, 150);

  // Health tip
  const msgEl = document.getElementById('calHealthMsg');
  const tips = {
    lose2:      { cls: 'msg-overweight', text: '📉 A 500 kcal/day deficit targets ~0.5 kg of fat loss per week. Stay hydrated, prioritize protein, and avoid extreme restriction.' },
    lose1:      { cls: 'msg-overweight', text: '🔽 A mild 250 kcal deficit is sustainable long-term and minimizes muscle loss. Perfect for gradual, lasting results.' },
    maintain:   { cls: 'msg-normal',     text: '⚖️ Eating at TDEE maintains your current weight. Focus on food quality and micronutrient balance for optimal health.' },
    gain1:      { cls: 'msg-underweight', text: '🔼 A small caloric surplus supports lean muscle gains with minimal fat. Prioritize resistance training and adequate protein.' },
    gain2:      { cls: 'msg-underweight', text: '📈 A 500 kcal surplus accelerates muscle growth ("bulking"). Pair with progressive overload resistance training for best results.' },
    aggressive: { cls: 'msg-obese',      text: '⚡ Aggressive deficits can cause rapid weight loss but risk muscle loss. Consider shorter cycles and regular diet breaks.' }
  };
  const tip = tips[goal] || tips['maintain'];
  msgEl.textContent = tip.text;
  msgEl.className   = `health-message ${tip.cls}`;
}
