/* ============================================================
   MAVERICK GAMING — script.js
   ============================================================ */

/* ---- SITE CONFIG (single source of truth) ---------------- */
const CONFIG = {
  // Update these values when your contact info or domain changes
  whatsappNumber: '447393159712',        // International format, no +
  domain:         'https://maverickgaming.com',
  facebook:       'maverick.gaming.822160',
};


/* ---- 1. NAVBAR SCROLL ------------------------------------ */
(function () {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 30);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
})();


/* ---- 2. HAMBURGER / MOBILE MENU ------------------------- */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobileMenu');
  if (!btn || !menu) return;

  function closeMenu() {
    menu.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-label', 'Open menu');
  }

  btn.addEventListener('click', function () {
    const isOpen = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', String(isOpen));
    btn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
  });

  // Close on link click
  menu.querySelectorAll('a').forEach(function (link) {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape key
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && menu.classList.contains('open')) closeMenu();
  });

  // Close when clicking outside
  document.addEventListener('click', function (e) {
    if (!btn.contains(e.target) && !menu.contains(e.target)) closeMenu();
  });
})();


/* ---- 3. FAQ ACCORDION ------------------------------------ */
(function () {
  const questions = document.querySelectorAll('.faq-question');

  questions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      const answerId   = btn.getAttribute('aria-controls');
      const answer     = answerId ? document.getElementById(answerId) : btn.nextElementSibling;

      // Close all others
      questions.forEach(function (other) {
        if (other !== btn) {
          other.setAttribute('aria-expanded', 'false');
          const otherId = other.getAttribute('aria-controls');
          const otherAnswer = otherId ? document.getElementById(otherId) : other.nextElementSibling;
          if (otherAnswer) otherAnswer.classList.remove('open');
        }
      });

      // Toggle this one
      btn.setAttribute('aria-expanded', String(!isExpanded));
      if (answer) answer.classList.toggle('open', !isExpanded);
    });
  });
})();


/* ---- 4. COPY LINK BUTTON --------------------------------- */
(function () {
  const btn   = document.getElementById('copyLinkBtn');
  const input = document.getElementById('shareUrl');
  if (!btn || !input) return;

  btn.addEventListener('click', async function () {
    const url = input.value;
    try {
      await navigator.clipboard.writeText(url);
      const original = btn.textContent;
      btn.textContent = '✓ Copied!';
      btn.classList.add('btn-copied');
      setTimeout(function () {
        btn.textContent = original;
        btn.classList.remove('btn-copied');
      }, 2200);
    } catch {
      // Fallback for older browsers
      input.select();
      document.execCommand('copy');
      btn.textContent = '✓ Copied!';
      setTimeout(function () { btn.textContent = 'Copy Link'; }, 2200);
    }
  });
})();




