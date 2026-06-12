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


/* ---- 5. CHATBOT WIDGET TOGGLE --------------------------- */
(function () {
  const toggleBtn = document.getElementById('chatbotToggle');
  const closeBtn  = document.getElementById('chatbotClose');
  const box       = document.getElementById('chatbotBox');
  if (!toggleBtn || !box) return;

  function openChat() {
    box.classList.add('open');
    toggleBtn.setAttribute('aria-expanded', 'true');
    document.getElementById('chatbotInput')?.focus();
  }

  function closeChat() {
    box.classList.remove('open');
    toggleBtn.setAttribute('aria-expanded', 'false');
    toggleBtn.focus();
  }

  toggleBtn.addEventListener('click', function () {
    box.classList.contains('open') ? closeChat() : openChat();
  });

  if (closeBtn) closeBtn.addEventListener('click', closeChat);

  // Close on Escape
  box.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeChat();
  });
})();


/* ---- 6. AI CHATBOT — PROXIED API CALL -------------------- */
/*
 * SECURITY NOTE:
 * The Anthropic API key must NEVER be placed in client-side code.
 * This chatbot sends requests to YOUR OWN backend proxy endpoint
 * (/api/chat), which then adds the API key server-side before
 * forwarding to Anthropic.
 *
 * To set up a proxy, see: https://docs.anthropic.com/en/docs/
 * Quick options:
 *   - Cloudflare Worker  (free, edge-deployed)
 *   - Vercel Edge Function
 *   - Express.js route on your server
 *
 * The proxy should accept: { messages: [...], system: "..." }
 * and return the raw Anthropic API response.
 *
 * Change PROXY_URL below to your actual proxy endpoint.
 */
(function () {
  const PROXY_URL = '/api/chat'; // ← Replace with your actual proxy URL

  const sendBtn  = document.getElementById('chatbotSend');
  const input    = document.getElementById('chatbotInput');
  const messages = document.getElementById('chatbotMessages');
  if (!sendBtn || !input || !messages) return;

  const history = [];

  const SYSTEM_PROMPT = `You are the friendly AI assistant for Maverick Gaming, a premium online sweepstakes casino. Keep answers short (2–4 sentences max) and warm. Always point customers to WhatsApp (+${CONFIG.whatsappNumber}) for account setup, payments, or anything needing a human agent.

Key facts:
- Games: Juwa, Orion Stars, Game Vault, Fire Kirin, Milky Way, Panda Master, Game Room, Noble (and others on request)
- Payments: Chime and PayPal only (no Cash App or Zelle)
- Minimum deposit: $20
- Withdrawals: same-day via Chime or PayPal — message your agent on WhatsApp
- Account setup: message WhatsApp, agents create it within minutes
- Hours: daily, agents respond as soon as possible
- Support: WhatsApp at +${CONFIG.whatsappNumber}
- Website: ${CONFIG.domain}

Never make up promotions, odds, or payout percentages. If unsure, direct them to WhatsApp.`;

  function appendMessage(text, role) {
    const div = document.createElement('div');
    div.className = 'chat-msg ' + (role === 'user' ? 'user-msg' : 'bot-msg');
    const p = document.createElement('p');
    p.textContent = text;
    div.appendChild(p);
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
    return div;
  }

  function showTyping() {
    const div = document.createElement('div');
    div.className = 'chat-msg bot-msg typing-indicator';
    div.id = 'typingIndicator';
    div.setAttribute('aria-label', 'Assistant is typing');
    div.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  function removeTyping() {
    document.getElementById('typingIndicator')?.remove();
  }

  async function sendMessage() {
    const text = input.value.trim();
    if (!text) return;

    input.value = '';
    sendBtn.disabled = true;

    appendMessage(text, 'user');
    history.push({ role: 'user', content: text });
    showTyping();

    try {
      const response = await fetch(PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6',
          max_tokens: 300,
          system: SYSTEM_PROMPT,
          messages: history
        })
      });

      if (!response.ok) throw new Error('Request failed: ' + response.status);

      const data = await response.json();
      removeTyping();

      const reply = data.content
        .filter(function (b) { return b.type === 'text'; })
        .map(function (b) { return b.text; })
        .join('');

      if (reply) {
        appendMessage(reply, 'bot');
        history.push({ role: 'assistant', content: reply });
      }

    } catch {
      removeTyping();
      appendMessage(
        'I\'m having a little trouble right now. For instant help, please message us on WhatsApp!',
        'bot'
      );
    } finally {
      sendBtn.disabled = false;
      input.focus();
    }
  }

  sendBtn.addEventListener('click', sendMessage);

  input.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  });
})();
