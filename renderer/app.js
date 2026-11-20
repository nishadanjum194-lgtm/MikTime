const $ = (selector) => document.querySelector(selector);
const display = $('#display');
const label = $('#label');
const bar = $('#bar');
const { clampMinutes, formatTime } = window.MikTimeUtils;
const MAX_MINUTES = 12 * 60;
const R = 95;
const C = 2 * Math.PI * R;

bar.style.width = '100%';
let total = 25 * 60;
let remaining = total;
let running = false;
let frame = null;
let endAt = 0;
let health = $('#health');

for (let index = 0; index < 10; index += 1) {
  const pip = document.createElement('div');
  pip.className = 'pip';
  health.append(pip);
}

function render() {
  const fraction = total > 0 ? Math.max(0, Math.min(1, remaining / total)) : 0;
  bar.style.width = (fraction * 100) + '%';
  display.textContent = formatTime(Math.ceil(remaining));
  const activePips = Math.round(fraction * 10);
  health.querySelectorAll('.pip').forEach((pip, index) => {
    pip.classList.toggle('on', index < activePips);
  });
}
function notifyDone() {
  label.textContent = 'DONE!';
  label.classList.add('done');
  document.title = 'Done! | MikTime';
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('MikTime', { body: 'Your focus session is complete.' });
    }
  } catch (_error) {}
  try {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    if (AudioContextClass) {
      const context = new AudioContextClass();
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.frequency.value = 880;
      gain.gain.setValueAtTime(0.08, context.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.35);
      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start();
      oscillator.stop(context.currentTime + 0.35);
    }
  } catch (_error) {}
}
function tick() {
  if (!running) return;
  remaining = Math.max(0, (endAt - Date.now()) / 1000);
  render();
  if (remaining <= 0) {
    running = false;
    frame = null;
    notifyDone();
    return;
  }
  frame = requestAnimationFrame(tick);
}
function start() {
  if (running) return;
  if (remaining <= 0) reset();
  label.textContent = 'FOCUS';
  label.classList.remove('done');
  document.title = 'MikTime';
  endAt = Date.now() + remaining * 1000;
  running = true;
  frame = requestAnimationFrame(tick);
}
function pause() {
  if (!running) return;
  running = false;
  if (frame !== null) cancelAnimationFrame(frame);
  frame = null;
  remaining = Math.max(0, (endAt - Date.now()) / 1000);
  render();
}
function reset() {
  pause();
  remaining = total;
  label.textContent = 'FOCUS';
  label.classList.remove('done');
  document.title = 'MikTime';
  render();
}
function setMinutes(value) {
  const minutes = clampMinutes(value, MAX_MINUTES);
  if (minutes === null) {
    $('#mins').setCustomValidity('Enter a duration between 1 and 720 minutes.');
    $('#mins').reportValidity();
    return;
  }
  $('#mins').setCustomValidity('');
  total = minutes * 60;
  $('#mins').value = String(minutes);
  reset();
}
$('#start').addEventListener('click', start);
$('#pause').addEventListener('click', pause);
$('#reset').addEventListener('click', reset);
$('#set').addEventListener('click', () => setMinutes($('#mins').value));
document.querySelectorAll('.presets button').forEach((button) => {
  button.addEventListener('click', () => setMinutes(button.dataset.m));
});
render();
