/* =================================================
   Shared Script – shared.js
   ================================================= */

// ─── Theme Initialization ────────────────────────
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
  if (toggleBtn) {
    const sunIcon   = document.getElementById('sunIcon');
    const moonIcon  = document.getElementById('moonIcon');

    function applyTheme(dark) {
      document.documentElement.classList.toggle('dark', dark);
      if (sunIcon) sunIcon.style.display  = dark ? 'none'  : 'block';
      if (moonIcon) moonIcon.style.display = dark ? 'block' : 'none';
      localStorage.setItem('bmiTheme', dark ? 'dark' : 'light');
    }

    applyTheme(document.documentElement.classList.contains('dark'));

    toggleBtn.addEventListener('click', () => {
      applyTheme(!document.documentElement.classList.contains('dark'));
    });
  }

  // ─── Scroll-Reveal Animation ──────────────────
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.scroll-reveal').forEach(el => revealObserver.observe(el));
});
