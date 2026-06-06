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

function initShared() {
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

  // Mobile menu toggle
  const menuToggle = document.getElementById('mobileMenuToggle');
  const siteHeader = document.querySelector('.site-header');
  
  if (menuToggle && siteHeader) {
    menuToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      siteHeader.classList.toggle('mobile-nav-active');
    });

    document.addEventListener('click', (e) => {
      if (!siteHeader.contains(e.target)) {
        siteHeader.classList.remove('mobile-nav-active');
      }
    });

    siteHeader.querySelectorAll('.nav-link').forEach(link => {
      link.addEventListener('click', () => {
        siteHeader.classList.remove('mobile-nav-active');
      });
    });
  }

  // ─── Dropdown Navigation ──────────────────────
  const dropdowns = document.querySelectorAll('.nav-dropdown');

  dropdowns.forEach(dropdown => {
    const trigger = dropdown.querySelector('.nav-dropdown-trigger');
    if (!trigger) return;

    // Desktop: click toggle (works on both desktop and mobile)
    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      
      // Close all other dropdowns
      dropdowns.forEach(d => {
        if (d !== dropdown) d.classList.remove('open');
      });

      dropdown.classList.toggle('open', !isOpen);
      trigger.setAttribute('aria-expanded', !isOpen);
    });

    // Desktop: hover open/close with delay
    let hoverTimeout;

    dropdown.addEventListener('mouseenter', () => {
      if (window.innerWidth > 768) {
        clearTimeout(hoverTimeout);
        dropdowns.forEach(d => {
          if (d !== dropdown) d.classList.remove('open');
        });
        dropdown.classList.add('open');
        trigger.setAttribute('aria-expanded', 'true');
      }
    });

    dropdown.addEventListener('mouseleave', () => {
      if (window.innerWidth > 768) {
        hoverTimeout = setTimeout(() => {
          dropdown.classList.remove('open');
          trigger.setAttribute('aria-expanded', 'false');
        }, 200);
      }
    });
  });

  // Close dropdowns when clicking outside
  document.addEventListener('click', (e) => {
    dropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('open');
        const trigger = dropdown.querySelector('.nav-dropdown-trigger');
        if (trigger) trigger.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // Close dropdown items on navigation (mobile)
  document.querySelectorAll('.nav-dropdown-item').forEach(item => {
    item.addEventListener('click', () => {
      if (siteHeader) siteHeader.classList.remove('mobile-nav-active');
    });
  });

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
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initShared);
} else {
  initShared();
}

// ─── FAQ Toggle (shared across pages) ────────────
function toggleFaq(btn) {
  const item = btn.parentElement;
  const answer = item.querySelector('.faq-answer');
  const expanded = btn.getAttribute('aria-expanded') === 'true';

  btn.setAttribute('aria-expanded', !expanded);
  answer.classList.toggle('open', !expanded);
}
