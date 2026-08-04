/* main.js — Navigace, scroll animace, čítače, akordeon, formuláře */

document.addEventListener('DOMContentLoaded', () => {

  // === HAMBURGER MENU ===
  const hamburger = document.querySelector('.hamburger');
  const mobileNav = document.querySelector('.mobile-nav');

  if (hamburger && mobileNav) {
    hamburger.addEventListener('click', () => {
      const isOpen = hamburger.classList.toggle('open');
      mobileNav.classList.toggle('open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen);
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !mobileNav.contains(e.target)) {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      }
    });

    mobileNav.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('open');
        mobileNav.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // === ACTIVE NAV LINK ===
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-list a, .mobile-nav-list a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // === HEADER STATE + SCROLL PROGRESS ===
  const header = document.querySelector('.site-header');
  const progress = document.querySelector('.scroll-progress span');
  const onScroll = () => {
    if (header) header.classList.toggle('scrolled', window.scrollY > 12);
    if (progress) {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (window.scrollY / max) * 100 : 0) + '%';
    }
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // === SCROLL ANIMATIONS ===
  const animateObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        animateObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.animate-on-scroll').forEach(el => animateObserver.observe(el));

  // === ANIMATED COUNTERS ===
  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      counterObserver.unobserve(el);
      const target = parseFloat(el.dataset.count);
      if (isNaN(target)) return;
      const dur = 1400;
      const t0 = performance.now();
      const fmt = new Intl.NumberFormat('cs-CZ');
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = fmt.format(Math.round(target * eased));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

  // === ACCORDION ===
  document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const wasOpen = item.classList.contains('open');
      item.closest('.accordion').querySelectorAll('.accordion-item.open')
        .forEach(i => i.classList.remove('open'));
      if (!wasOpen) item.classList.add('open');
    });
  });

  // === CONTACT FORM VALIDATION ===
  document.querySelectorAll('.contact-form').forEach(form => {
    form.addEventListener('submit', handleFormSubmit);
  });

  // === PHONE LINKS ===
  document.querySelectorAll('a[href^="tel:"]').forEach(link => {
    link.setAttribute('aria-label', 'Zavolat ' + link.textContent.trim());
  });

});

function handleFormSubmit(e) {
  e.preventDefault();
  const form = e.target;
  let isValid = true;

  form.querySelectorAll('.form-error').forEach(err => err.textContent = '');
  form.querySelectorAll('.form-input, .form-textarea').forEach(inp => inp.classList.remove('error'));

  form.querySelectorAll('[required]').forEach(field => {
    if (!field.value.trim()) {
      isValid = false;
      field.classList.add('error');
      const errEl = field.closest('.form-group')?.querySelector('.form-error');
      if (errEl) errEl.textContent = 'Toto pole je povinné.';
    }
  });

  const emailField = form.querySelector('input[type="email"]');
  if (emailField && emailField.value && !isValidEmail(emailField.value)) {
    isValid = false;
    emailField.classList.add('error');
    const errEl = emailField.closest('.form-group')?.querySelector('.form-error');
    if (errEl) errEl.textContent = 'Zadejte platnou emailovou adresu.';
  }

  const gdpr = form.querySelector('[name="gdpr"]');
  if (gdpr && !gdpr.checked) {
    isValid = false;
    const errEl = gdpr.closest('.form-group')?.querySelector('.form-error');
    if (errEl) errEl.textContent = 'Souhlas se zpracováním je povinný.';
  }

  if (!isValid) return;

  const btn = form.querySelector('button[type="submit"]');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Odesílám…';
  }

  const data = new FormData(form);
  fetch('https://formspree.io/f/mvzvkkeq', {
    method: 'POST',
    body: data,
    headers: { 'Accept': 'application/json' }
  })
  .then(res => {
    if (res.ok) {
      const successEl = form.closest('.form-wrap')?.querySelector('.form-success');
      if (successEl) {
        form.style.display = 'none';
        successEl.classList.add('show');
      } else if (btn) {
        btn.textContent = 'Odesláno ✓';
      }
    } else {
      if (btn) {
        btn.disabled = false;
        btn.textContent = 'Odeslat zprávu';
      }
      alert('Chyba při odesílání. Zkuste to prosím znovu.');
    }
  })
  .catch(() => {
    if (btn) {
      btn.disabled = false;
      btn.textContent = 'Odeslat zprávu';
    }
    alert('Chyba při odesílání. Zkuste to prosím znovu.');
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

window.handleFormSubmit = handleFormSubmit;

// === COOKIE BANNER ===
(function() {
  if (localStorage.getItem('cookieConsent') === '1') return;
  const banner = document.getElementById('cookie-banner');
  if (!banner) return;
  setTimeout(() => banner.classList.add('show'), 600);
  document.getElementById('cookie-accept').addEventListener('click', () => {
    localStorage.setItem('cookieConsent', '1');
    banner.classList.remove('show');
    setTimeout(() => banner.remove(), 500);
  });
})();
