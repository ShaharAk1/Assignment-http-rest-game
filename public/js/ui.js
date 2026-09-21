const STATUS_TEXT = {
  200: 'OK',
  201: 'Created',
  204: 'No Content',
  400: 'Bad Request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Not Found',
  405: 'Method Not Allowed',
  409: 'Conflict',
  500: 'Internal Server Error',
};

const CHECK_LABELS = {
  method: 'Method',
  path: 'Path',
  query: 'Query',
  body: 'Body',
  status: 'Status',
};

const CONFETTI_COLORS = ['#ef6a45', '#6aa84f', '#36699a', '#f4c04e', '#d69ac4'];

function renderStatusBadge(el, status) {
  el.hidden = false;
  el.textContent = `${status} ${STATUS_TEXT[status] || ''}`.trim();
  el.className = 'status-badge';
  if (status >= 200 && status < 300) {
    el.classList.add('status-success');
  } else if (status >= 400 && status < 500) {
    el.classList.add('status-client-error');
  } else if (status >= 500) {
    el.classList.add('status-server-error');
  }
}

// kind: 'success' | 'error' | 'info'
function renderResultMessage(el, kind, title, message) {
  el.hidden = false;
  el.className = `result-banner result-${kind}`;
  el.innerHTML = '';

  const titleEl = document.createElement('p');
  titleEl.className = 'result-banner__title';
  titleEl.textContent = title;

  const messageEl = document.createElement('p');
  messageEl.textContent = message;

  el.appendChild(titleEl);
  el.appendChild(messageEl);
}

function renderCheckList(el, checks) {
  el.innerHTML = '';
  const keys = Object.keys(checks || {});
  el.hidden = keys.length === 0;
  keys.forEach((key) => {
    const item = document.createElement('li');
    item.className = checks[key] ? 'check-pass' : 'check-fail';
    const glyph = document.createElement('span');
    glyph.className = 'glyph';
    glyph.textContent = checks[key] ? '✓' : '✗';
    item.appendChild(glyph);
    item.appendChild(document.createTextNode(` ${CHECK_LABELS[key] || key}`));
    el.appendChild(item);
  });
}

function renderResponseBody(el, data) {
  el.hidden = false;
  if (data === null) {
    el.textContent = '(empty or non-JSON response)';
    return;
  }
  // The stage verdict is shown separately; display only what the API itself returned.
  const { stage, ...apiPayload } = data;
  el.textContent = JSON.stringify(apiPayload, null, 2);
}

function renderConcepts(el, concepts) {
  el.innerHTML = '';
  (concepts || []).forEach((concept) => {
    const item = document.createElement('li');
    item.textContent = concept;
    el.appendChild(item);
  });
}

// Restarts a one-shot CSS animation class (shake, pop...) on an element.
function replayAnimation(el, className) {
  el.classList.remove(className);
  void el.offsetWidth; // force reflow so the animation can run again
  el.classList.add(className);
  el.addEventListener('animationend', () => el.classList.remove(className), { once: true });
}

function showScorePop(el, points) {
  el.textContent = `+${points}`;
  replayAnimation(el, 'is-popping');
}

function launchConfetti(container, pieces = 60) {
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement('span');
    piece.className = 'confetti__piece';
    piece.style.left = `${Math.random() * 100}%`;
    piece.style.background = CONFETTI_COLORS[i % CONFETTI_COLORS.length];
    piece.style.animationDelay = `${Math.random() * 0.4}s`;
    piece.style.setProperty('--duration', `${1.4 + Math.random() * 1.2}s`);
    piece.style.setProperty('--drift', `${(Math.random() - 0.5) * 200}px`);
    piece.style.setProperty('--spin', `${(Math.random() - 0.5) * 1440}deg`);
    piece.addEventListener('animationend', () => piece.remove(), { once: true });
    container.appendChild(piece);
  }
}
