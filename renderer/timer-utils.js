(function (root) {
  function clampMinutes(value, maxMinutes) {
    const number = Number(value);
    if (!Number.isFinite(number) || !Number.isInteger(number)) return null;
    if (number < 1 || number > maxMinutes) return null;
    return number;
  }
  function formatTime(seconds) {
    const safeSeconds = Math.max(0, Math.floor(Number(seconds) || 0));
    const minutes = Math.floor(safeSeconds / 60);
    const remainder = safeSeconds % 60;
    return String(minutes).padStart(2, '0') + ':' + String(remainder).padStart(2, '0');
  }
  const api = { clampMinutes, formatTime };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.MikTimeUtils = api;
})(typeof window !== 'undefined' ? window : globalThis);
