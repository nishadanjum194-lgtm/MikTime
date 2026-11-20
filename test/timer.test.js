const test = require('node:test');
const assert = require('node:assert/strict');
const { clampMinutes, formatTime } = require('../renderer/timer-utils');

test('accepts valid timer durations and rejects invalid values', () => {
  assert.equal(clampMinutes('25', 720), 25);
  assert.equal(clampMinutes(1, 720), 1);
  assert.equal(clampMinutes(720, 720), 720);
  for (const value of [0, -1, 721, 'abc', 1.5, Infinity, NaN, '']) {
    assert.equal(clampMinutes(value, 720), null);
  }
});

test('formats remaining seconds consistently', () => {
  assert.equal(formatTime(0), '00:00');
  assert.equal(formatTime(65), '01:05');
  assert.equal(formatTime(1500), '25:00');
  assert.equal(formatTime(-4), '00:00');
});
