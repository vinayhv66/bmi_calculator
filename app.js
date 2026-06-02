/* =================================================
   BMI Calculator – app.js
   ================================================= */

// ─── Theme ──────────────────────────────────────
(function initTheme() {
  const saved = localStorage.getItem('bmiTheme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  if (saved === 'dark' || (!saved && prefersDark)) {
    document.documentElement.classList.add('dark');
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  const toggleBtn = document.getElementById('themeToggle');
  const sunIcon   = document.getElementById('sunIcon');
  const moonIcon  = document.getElementById('moonIcon');

  function applyTheme(dark) {
    document.documentElement.classList.toggle('dark', dark);
    sunIcon.style.display  = dark ? 'none'  : 'block';
    moonIcon.style.display = dark ? 'block' : 'none';
    localStorage.setItem('bmiTheme', dark ? 'dark' : 'light');
  }

  // Apply initial icon state
  const isDark = document.documentElement.classList.contains('dark');
  applyTheme(isDark);

  toggleBtn.addEventListener('click', () => {
    applyTheme(!document.documentElement.classList.contains('dark'));
  });

  // ─── Unit system ──────────────────────────────
  window.setUnit = function(unit) {
    const isMetric = unit === 'metric';
    document.getElementById('btnMetric').classList.toggle('active', isMetric);
    document.getElementById('btnImperial').classList.toggle('active', !isMetric);

    document.getElementById('heightMetricGroup').classList.toggle('hidden', !isMetric);
    document.getElementById('heightImperialGroup').classList.toggle('hidden', isMetric);
    document.getElementById('weightMetricGroup').classList.toggle('hidden', !isMetric);
    document.getElementById('weightImperialGroup').classList.toggle('hidden', isMetric);

    clearErrors();
  };

  // ─── Form submission ──────────────────────────
  const form = document.getElementById('bmiForm');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (validate()) calculate();
  });

  // ─── Reset ────────────────────────────────────
  window.resetForm = function () {
    form.reset();
    clearErrors();
    setUnit('metric');
    document.getElementById('resultContent').classList.add('hidden');
    document.getElementById('resultPlaceholder').classList.remove('hidden');

    // Remove table highlights
    document.querySelectorAll('.table-row').forEach(r => r.classList.remove('highlighted'));

    // Hide bmi marker
    document.getElementById('userBmiMarker').classList.add('hidden');

    // Reset needle
    setNeedleAngle(0);
    resetArcs();

    document.getElementById('gaugeBmiValue').textContent = '–';
    // Also hide calories CTA
    const cta = document.getElementById('caloriesCta');
    if (cta) cta.style.animation = '';
  };

  // ─── FAQ accordion ────────────────────────────
  window.toggleFaq = function (btn) {
    const expanded = btn.getAttribute('aria-expanded') === 'true';
    // Close all
    document.querySelectorAll('.faq-question').forEach(q => {
      q.setAttribute('aria-expanded', 'false');
      q.nextElementSibling.classList.remove('open');
    });
    if (!expanded) {
      btn.setAttribute('aria-expanded', 'true');
      btn.nextElementSibling.classList.add('open');
    }
  };

  // ─── Smooth nav links ─────────────────────────
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });

  // Intersection observer for nav
  const sections = document.querySelectorAll('section[id]');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const id = entry.target.getAttribute('id');
        document.querySelectorAll('.nav-link').forEach(l => {
          l.classList.toggle('active', l.getAttribute('href') === `#${id}`);
        });
      }
    });
  }, { rootMargin: '-40% 0px -40% 0px' });

  sections.forEach(s => observer.observe(s));

  // ─── Scroll-Reveal IntersectionObserver ───────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target); // fire once
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
});

// ─── Validation ───────────────────────────────
function isMetric() {
  return document.getElementById('btnMetric').classList.contains('active');
}

function clearErrors() {
  document.querySelectorAll('.form-error').forEach(el => el.textContent = '');
  document.querySelectorAll('.form-input').forEach(el => el.classList.remove('error'));
}

function setError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('error');
  if (error) error.textContent = message;
}

function validate() {
  clearErrors();
  let valid = true;

  // Age
  const age = parseFloat(document.getElementById('ageInput').value);
  if (!age || age < 2 || age > 120) {
    setError('ageInput', 'ageError', 'Please enter a valid age between 2 and 120.');
    valid = false;
  }

  if (isMetric()) {
    const h = parseFloat(document.getElementById('heightCm').value);
    if (!h || h < 50 || h > 280) {
      setError('heightCm', 'heightCmError', 'Enter a height between 50 and 280 cm.');
      valid = false;
    }
    const w = parseFloat(document.getElementById('weightKg').value);
    if (!w || w < 2 || w > 600) {
      setError('weightKg', 'weightKgError', 'Enter a weight between 2 and 600 kg.');
      valid = false;
    }
  } else {
    const ft = parseFloat(document.getElementById('heightFt').value);
    const inn = parseFloat(document.getElementById('heightIn').value);
    if (!ft || ft < 1 || ft > 9) {
      setError('heightFt', 'heightImperialError', 'Enter a valid height in feet (1–9).');
      valid = false;
    } else if (isNaN(inn) || inn < 0 || inn > 11) {
      setError('heightIn', 'heightImperialError', 'Inches must be between 0 and 11.');
      valid = false;
    }
    const lbs = parseFloat(document.getElementById('weightLbs').value);
    if (!lbs || lbs < 5 || lbs > 1300) {
      setError('weightLbs', 'weightLbsError', 'Enter a weight between 5 and 1300 lbs.');
      valid = false;
    }
  }

  return valid;
}

// ─── Calculation ──────────────────────────────
function calculate() {
  const age    = parseFloat(document.getElementById('ageInput').value);
  const gender = document.querySelector('input[name="gender"]:checked').value;

  let weightKg, heightM;

  if (isMetric()) {
    heightM  = parseFloat(document.getElementById('heightCm').value) / 100;
    weightKg = parseFloat(document.getElementById('weightKg').value);
  } else {
    const ft  = parseFloat(document.getElementById('heightFt').value);
    const inn = parseFloat(document.getElementById('heightIn').value) || 0;
    const totalInches = ft * 12 + inn;
    heightM  = totalInches * 0.0254;
    weightKg = parseFloat(document.getElementById('weightLbs').value) * 0.453592;
  }

  const bmi      = weightKg / (heightM * heightM);
  const bmiPrime = bmi / 24.9;

  // Ideal body weight (Devine formula)
  const heightInches = heightM / 0.0254;
  let ibwKg;
  if (gender === 'male') {
    ibwKg = 50 + 2.3 * Math.max(0, heightInches - 60);
  } else {
    ibwKg = 45.5 + 2.3 * Math.max(0, heightInches - 60);
  }

  // Healthy weight range for BMI 18.5–24.9
  const minWeight = 18.5 * heightM * heightM;
  const maxWeight = 24.9 * heightM * heightM;

  const { category, categoryKey } = getCategory(bmi);

  renderResult({
    bmi, bmiPrime, category, categoryKey,
    weightKg, minWeight, maxWeight, ibwKg, heightM, age, gender
  });
}

function getCategory(bmi) {
  if (bmi < 18.5) return { category: 'Underweight', categoryKey: 'underweight' };
  if (bmi < 25)   return { category: 'Normal Weight', categoryKey: 'normal' };
  if (bmi < 30)   return { category: 'Overweight', categoryKey: 'overweight' };
  if (bmi < 35)   return { category: 'Obese (Class I)', categoryKey: 'obese' };
  if (bmi < 40)   return { category: 'Obese (Class II)', categoryKey: 'obese' };
  return            { category: 'Obese (Class III)', categoryKey: 'obese' };
}

function getTableCategory(bmi) {
  if (bmi < 18.5) return 'underweight';
  if (bmi < 25)   return 'normal';
  if (bmi < 30)   return 'overweight';
  if (bmi < 35)   return 'obese1';
  if (bmi < 40)   return 'obese2';
  return 'obese3';
}

// ─── Render Results ───────────────────────────
function renderResult({ bmi, bmiPrime, category, categoryKey, weightKg, minWeight, maxWeight, ibwKg, heightM }) {
  const placeholder = document.getElementById('resultPlaceholder');
  const content     = document.getElementById('resultContent');
  const resultCard  = document.getElementById('resultCard');

  placeholder.classList.add('hidden');
  content.classList.remove('hidden');
  content.classList.add('fade-in-up');

  // Scroll result into view so user doesn't have to scroll up
  setTimeout(() => {
    resultCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 80);

  // Gauge needle
  const angle = bmiToAngle(bmi);
  setNeedleAngle(angle);
  highlightArc(categoryKey);

  // Gauge BMI value
  document.getElementById('gaugeBmiValue').textContent = bmi.toFixed(1);

  // Category badge
  const badge = document.getElementById('categoryBadge');
  badge.className = `category-badge badge-${categoryKey}`;
  document.getElementById('categoryText').textContent = category;
  document.getElementById('categoryIcon').textContent = getCategoryEmoji(categoryKey);

  // Stats
  document.getElementById('statBmi').textContent   = bmi.toFixed(1);
  document.getElementById('statPrime').textContent  = bmiPrime.toFixed(2);

  // Show ideal in current unit
  const showMetric = isMetric();
  if (showMetric) {
    document.getElementById('statIdeal').textContent = `${ibwKg.toFixed(1)} kg`;
    document.getElementById('statRange').textContent = `${minWeight.toFixed(1)}–${maxWeight.toFixed(1)} kg`;
  } else {
    const ibwLbs  = ibwKg  / 0.453592;
    const minLbs  = minWeight / 0.453592;
    const maxLbs  = maxWeight / 0.453592;
    document.getElementById('statIdeal').textContent = `${ibwLbs.toFixed(1)} lbs`;
    document.getElementById('statRange').textContent = `${minLbs.toFixed(1)}–${maxLbs.toFixed(1)} lbs`;
  }

  // Health message
  const msg  = document.getElementById('healthMessage');
  const msgs = {
    underweight: '⚠️ You are underweight. Consider consulting a healthcare professional for guidance on healthy weight gain.',
    normal:      '✅ Great! You are in the healthy weight range. Maintain your lifestyle with balanced nutrition and regular activity.',
    overweight:  '⚠️ You are slightly overweight. Small improvements in diet and activity can help you reach the normal range.',
    obese:       '🚨 Your BMI indicates obesity. Please consult a healthcare professional for personalized guidance.'
  };
  msg.textContent = msgs[categoryKey];
  msg.className   = `health-message msg-${categoryKey}`;

  // Weight diff
  const diffEl = document.getElementById('weightDiff');
  if (categoryKey === 'normal') {
    diffEl.textContent = '🎯 You\'re right in the healthy range — keep it up!';
  } else if (weightKg < minWeight) {
    const diff = minWeight - weightKg;
    diffEl.textContent = showMetric
      ? `📈 Gain ${diff.toFixed(1)} kg to reach the healthy weight range.`
      : `📈 Gain ${(diff / 0.453592).toFixed(1)} lbs to reach the healthy weight range.`;
  } else {
    const diff = weightKg - maxWeight;
    diffEl.textContent = showMetric
      ? `📉 Lose ${diff.toFixed(1)} kg to reach the healthy weight range.`
      : `📉 Lose ${(diff / 0.453592).toFixed(1)} lbs to reach the healthy weight range.`;
  }

  // Highlight table row
  const tableCategory = getTableCategory(bmi);
  document.querySelectorAll('.table-row').forEach(r => {
    r.classList.toggle('highlighted', r.dataset.category === tableCategory);
  });

  // BMI bar marker
  updateBarMarker(bmi);

  // ── Save to localStorage for Calories page ─────
  const age    = parseFloat(document.getElementById('ageInput').value);
  const gender = document.querySelector('input[name="gender"]:checked').value;
  localStorage.setItem('bmiData', JSON.stringify({
    age, gender,
    weightKg: +weightKg.toFixed(2),
    heightM:  +heightM.toFixed(4),
    bmi:      +bmi.toFixed(2),
    categoryKey,
    unit: isMetric() ? 'metric' : 'imperial'
  }));
}

function getCategoryEmoji(key) {
  return { underweight: '📉', normal: '✅', overweight: '⚠️', obese: '🚨' }[key] || '';
}

// ─── Gauge ────────────────────────────────────
// Arc spans from -90° to +90° (left to right half circle)
// BMI scale: 10 → -90°, 40 → +90°
function bmiToAngle(bmi) {
  const MIN_BMI = 10, MAX_BMI = 40;
  const clamped = Math.min(Math.max(bmi, MIN_BMI), MAX_BMI);
  // Map [10,40] → [-90,90]
  return ((clamped - MIN_BMI) / (MAX_BMI - MIN_BMI)) * 180 - 90;
}

function setNeedleAngle(angle) {
  const needle = document.getElementById('gaugeNeedle');
  needle.style.transform = `rotate(${angle}deg)`;
}

function resetArcs() {
  ['arcUnderweight','arcNormal','arcOverweight','arcObese'].forEach(id => {
    document.getElementById(id).style.opacity = '0';
  });
}

function highlightArc(categoryKey) {
  resetArcs();
  const map = {
    underweight: 'arcUnderweight',
    normal:      'arcNormal',
    overweight:  'arcOverweight',
    obese:       'arcObese'
  };
  const arcId = map[categoryKey];
  if (arcId) {
    setTimeout(() => {
      document.getElementById(arcId).style.opacity = '1';
    }, 100);
  }
}

// ─── Bar Chart Marker ─────────────────────────
function updateBarMarker(bmi) {
  const marker = document.getElementById('userBmiMarker');
  const barChart = document.querySelector('.bar-chart');
  if (!barChart) return;

  const MIN_BMI = 10, MAX_BMI = 45;
  const pct = Math.min(Math.max((bmi - MIN_BMI) / (MAX_BMI - MIN_BMI), 0), 1);

  // Position relative to bar-chart-container
  const container = document.querySelector('.bar-chart-container');
  const barRect   = barChart.getBoundingClientRect();
  const contRect  = container.getBoundingClientRect();
  const leftOffset = barRect.left - contRect.left + barRect.width * pct;

  marker.classList.remove('hidden');
  marker.style.left = leftOffset + 'px';
}

// Listen for window resize to reposition marker
window.addEventListener('resize', () => {
  const bmiVal = parseFloat(document.getElementById('statBmi').textContent);
  if (!isNaN(bmiVal)) updateBarMarker(bmiVal);
});
