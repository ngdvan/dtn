'use strict';
function fail(message, status = 400) { throw Object.assign(new Error(message), { status }); }
function text(value, label, max = 180) { const v = String(value || '').trim(); if (!v || v.length > max) fail(`${label} is required (maximum ${max} characters).`); return v; }
function id(value) { const n = Number(value); if (!Number.isSafeInteger(n) || n < 1) fail('A valid ID is required.'); return n; }
function date(value, required = false) {
  if (!value && !required) return null;
  const v = String(value || ''); const parsed = new Date(`${v}T00:00:00Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(v) || !Number.isFinite(+parsed) || parsed.toISOString().slice(0,10) !== v) fail('Use a valid date.');
  return v;
}
function url(value) {
  if (!value) return null;
  let parsed; try { parsed = new URL(value); } catch { fail('Use a valid HTTP(S) link.'); }
  if (!['http:','https:'].includes(parsed.protocol) || String(value).length > 1000) fail('Use a valid HTTP(S) link.');
  return parsed.href;
}
module.exports = { fail, text, id, date, url };
