const $ = (selector) => document.querySelector(selector);

const display = $('#display');
const label = $('#label');
const startButton = $('#start');
const progressRing = $('#progressRing');
const progressPercent = $('#progressPercent');
const messagePreview = $('#messagePreview');
const settingsPanel = $('#settingsPanel');

let total = 25 * 60;
let remaining = total;
let running = false;
let endAt = 0;
let ticker = null;
let messages = [];

function formatTime(seconds) {
  const safe = Math.max(0, Math.ceil(seconds));
  const minutes = Math.floor(safe / 60);
  const secs = safe % 60;
  return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

function setProgress() {
  const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  const angle = fraction * 360;
  const percent = Math.round(fraction * 100);

  display.textContent = formatTime(remaining);
  progressPercent.textContent = percent + '%';
  progressRing.style.background =
    'conic-gradient(var(--accent) 0deg ' + angle + 'deg, rgba(255,255,255,0.10) ' + angle + 'deg 360deg)';
}

function setStatus(text, done = false) {
  label.textContent = text;
  label.classList.toggle('done', done);
}

function stopTicker() {
  if (ticker !== null) window.clearInterval(ticker);
  ticker = null;
}

function updateButtons() {
  startButton.textContent = running ? 'Pause' : (remaining < total && remaining > 0 ? 'Resume' : 'Start');
  startButton.setAttribute('aria-label', running ? 'Pause timer' : 'Start timer');
}

function tick() {
  if (!running) return;
  remaining = Math.max(0, (endAt - Date.now()) / 1000);
  setProgress();

  if (remaining <= 0) {
    running = false;
    stopTicker();
    setStatus('Session complete', true);
    updateButtons();
  }
}

function start() {
  if (running) {
    pause();
    return;
  }

  if (remaining <= 0) remaining = total;
  endAt = Date.now() + remaining * 1000;
  running = true;
  setStatus('Stay with it');
  updateButtons();
  tick();
  ticker = window.setInterval(tick, 250);
}

function pause() {
  if (running) {
    remaining = Math.max(0, (endAt - Date.now()) / 1000);
  }
  running = false;
  stopTicker();
  setProgress();
  setStatus('Paused');
  updateButtons();
}

function reset() {
  running = false;
  stopTicker();
  remaining = total;
  setProgress();
  setStatus('Ready when you are');
  updateButtons();
}

startButton.addEventListener('click', start);
$('#reset').addEventListener('click', reset);

function markPreset(minutes) {
  document.querySelectorAll('.preset').forEach((button) => {
    button.classList.toggle('active', Number(button.dataset.m) === minutes);
  });
  $('#mins').value = minutes;
}

document.querySelectorAll('.preset').forEach((button) => {
  button.addEventListener('click', () => {
    const minutes = Number(button.dataset.m);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) return;
    total = minutes * 60;
    markPreset(minutes);
    reset();
    settingsPanel.classList.remove('open');
  });
});

$('#set').addEventListener('click', () => {
  const minutes = Number($('#mins').value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    setStatus('Choose 1–180 minutes');
    return;
  }
  total = minutes * 60;
  markPreset(minutes);
  reset();
  settingsPanel.classList.remove('open');
});

function persistMessages() {
  try {
    window.localStorage.setItem('miktime_msgs', JSON.stringify(messages));
  } catch (error) {
    console.error('Could not save MikTime messages:', error);
  }
}

function renderMessages() {
  const list = $('#messageList');
  list.replaceChildren();

  messages.forEach((message) => {
    const item = document.createElement('div');
    item.className = 'saved-message';
    item.textContent = message;
    list.appendChild(item);
  });

  const latest = messages[0] || '';
  messagePreview.textContent = latest;
  messagePreview.classList.toggle('visible', Boolean(latest));
}

try {
  const saved = JSON.parse(window.localStorage.getItem('miktime_msgs') || '[]');
  if (Array.isArray(saved)) {
    messages = saved.filter((message) => typeof message === 'string').slice(0, 10);
  }
} catch {
  messages = [];
}

$('#msgset').addEventListener('click', () => {
  const value = $('#msg').value.trim().slice(0, 160);
  if (!value) return;
  messages.unshift(value);
  messages = messages.slice(0, 10);
  persistMessages();
  renderMessages();
  $('#msg').value = '';
});

$('#msgclear').addEventListener('click', () => {
  messages = [];
  persistMessages();
  renderMessages();
});

$('#settingsToggle').addEventListener('click', () => {
  const isOpen = settingsPanel.classList.toggle('open');
  $('#settingsToggle').setAttribute('aria-expanded', String(isOpen));
});

$('#close').addEventListener('click', () => {
  if (window.electronAPI && typeof window.electronAPI.close === 'function') {
    window.electronAPI.close().catch(console.error);
  } else {
    window.close();
  }
});

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') settingsPanel.classList.remove('open');
});

document.addEventListener('click', (event) => {
  if (!settingsPanel.classList.contains('open')) return;
  if (settingsPanel.contains(event.target) || event.target === $('#settingsToggle')) return;
  settingsPanel.classList.remove('open');
});

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && running) tick();
});

renderMessages();
setProgress();
updateButtons();
