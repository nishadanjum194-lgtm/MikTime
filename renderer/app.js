const $ = (selector) => document.querySelector(selector);
const display = $('#display');
const label = $('#label');
const bar = $('#bar');
const health = $('#health');
const R = 95;
const C = 2 * Math.PI * R;
bar.style.strokeDasharray = C;

let total = 25 * 60;
let remaining = total;
let running = false;
let raf = null;
let end = 0;

function fmt(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return String(minutes).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
}

for (let i = 0; i < 10; i += 1) {
  const pip = document.createElement('div');
  pip.className = 'pip';
  health.appendChild(pip);
}

function setProgress() {
  const fraction = total ? remaining / total : 0;
  bar.style.width = Math.round(fraction * 100) + '%';
  display.textContent = fmt(Math.ceil(remaining));
  const activePips = Math.round(fraction * 10);
  health.querySelectorAll('.pip').forEach((pip, index) => {
    pip.classList.toggle('on', index < activePips);
  });
}

function tick() {
  if (!running) return;
  remaining = Math.max(0, (end - Date.now()) / 1000);
  setProgress();
  if (remaining <= 0) {
    running = false;
    raf = null;
    label.textContent = 'Done!';
    return;
  }
  raf = requestAnimationFrame(tick);
}

function start() {
  if (running) return;
  if (remaining <= 0) remaining = total;
  end = Date.now() + remaining * 1000;
  running = true;
  label.textContent = 'Focus';
  raf = requestAnimationFrame(tick);
}

function pause() {
  running = false;
  if (raf !== null) cancelAnimationFrame(raf);
  raf = null;
}

function reset() {
  pause();
  remaining = total;
  setProgress();
  label.textContent = 'Focus';
}

$('#start').onclick = start;
$('#pause').onclick = pause;
$('#reset').onclick = reset;

if (window.electronAPI) {
  const cornerButton = $('#corner');
  const normalButton = $('#normal');
  if (cornerButton) cornerButton.onclick = () => window.electronAPI.cornerMode().catch(console.error);
  if (normalButton) normalButton.onclick = () => window.electronAPI.normalMode().catch(console.error);
}

$('#set').onclick = () => {
  const minutes = Number($('#mins').value);
  if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) {
    label.textContent = 'Choose 1–180 min';
    return;
  }
  total = minutes * 60;
  reset();
};

document.querySelectorAll('.presets button').forEach(button => {
  button.onclick = () => {
    const minutes = Number(button.dataset.m);
    if (!Number.isInteger(minutes) || minutes < 1 || minutes > 180) return;
    total = minutes * 60;
    $('#mins').value = minutes;
    reset();
  };
});

const msgsEl = $('#msgs');
let stack = [];
try {
  const saved = JSON.parse(localStorage.getItem('miktime_msgs') || '[]');
  if (Array.isArray(saved)) stack = saved.filter(message => typeof message === 'string').slice(0, 10);
} catch {
  localStorage.removeItem('miktime_msgs');
}

function renderStack() {
  msgsEl.replaceChildren();
  stack.forEach(message => {
    const element = document.createElement('div');
    element.className = 'bigmsg';
    element.textContent = message;
    msgsEl.appendChild(element);
  });
}

$('#msgset').onclick = () => {
  const message = $('#msg').value.trim().slice(0, 160);
  if (!message) return;
  stack.unshift(message);
  if (stack.length > 10) stack.pop();
  try { localStorage.setItem('miktime_msgs', JSON.stringify(stack)); }
  catch (error) { console.error('Could not save messages:', error); }
  renderStack();
  $('#msg').value = '';
};

$('#msgclear').onclick = () => {
  stack = [];
  localStorage.removeItem('miktime_msgs');
  renderStack();
};

renderStack();
setProgress();

function scaleCard() {
  const scale = Math.max(0.6, Math.min(window.innerWidth / 360, window.innerHeight / 440));
  document.body.style.zoom = scale;
}
window.addEventListener('resize', scaleCard);
scaleCard();

const resizeHandle = document.getElementById('resizeHandle');
if (resizeHandle && window.electronAPI) {
  resizeHandle.onmousedown = event => {
    event.preventDefault();
    const startX = event.screenX;
    const startY = event.screenY;
    const startWidth = window.innerWidth;
    const startHeight = window.innerHeight;
    const move = moveEvent => {
      const width = Math.max(216, startWidth + moveEvent.screenX - startX);
      const height = Math.max(264, startHeight + moveEvent.screenY - startY);
      window.electronAPI.resizeWindow(width, height).catch(console.error);
    };
    const up = () => {
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
    };
    document.addEventListener('mousemove', move);
    document.addEventListener('mouseup', up);
  };
}
