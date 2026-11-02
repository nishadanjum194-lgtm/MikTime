const $ = (s) => document.querySelector(s);
const display = $('#display'), label = $('#label'), bar = $('#bar');
const R = 95, C = 2 * Math.PI * R;
bar.style.strokeDasharray = C;

let total = 25 * 60;
let remaining = total;
let running = false;
let raf = null;
let end = 0;

function fmt(s) {
  const m = Math.floor(s / 60), sec = s % 60;
  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}
let health = $('#health');
for (let i = 0; i < 10; i++) { const p = document.createElement('div'); p.className='pip'; health.appendChild(p); }

function setProgress() {
  const frac = total ? remaining / total : 0;
  const pct = Math.round(frac * 100);
  bar.style.width = pct + '%';
  display.textContent = fmt(Math.ceil(remaining));
  const on = Math.round(frac * 10);
  health.querySelectorAll('.pip').forEach((p,i)=> p.classList.toggle('on', i < on));
}
function tick() {
  if (!running) return;
  remaining = Math.max(0, (end - Date.now()) / 1000);
  setProgress();
  if (remaining <= 0) { running = false; label.textContent = 'Done!'; try { new Audio('data:audio/wav;base64,UklGRlQAAABXQVZFZm10IBAAAAABAAEAQB8AAIA+AAACABAAZGF0YQAAAAA=') } catch (e) {} return; }
  raf = requestAnimationFrame(tick);
}
function start() { if (running) return; if (remaining <= 0) remaining = total; end = Date.now() + remaining * 1000; running = true; label.textContent = 'Focus'; raf = requestAnimationFrame(tick); }
function pause() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }
function reset() { pause(); remaining = total; setProgress(); label.textContent = 'Focus'; }
$('#start').onclick = start;
$('#pause').onclick = pause;
$('#reset').onclick = reset;
$('#set').onclick = () => { const m = Number($('#mins').value) || 25; total = m * 60; reset(); };

document.querySelectorAll('.presets button').forEach(b => {
  b.onclick = () => { const m = Number(b.dataset.m); total = m * 60; $('#mins').value = m; reset(); };
});

setProgress();
EOF