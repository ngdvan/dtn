const test = require('node:test');
const assert = require('node:assert/strict');
const { manager, canManageYearbook } = require('../src/middleware/auth');

for (const role of ['admin', 'leader', 'vice_leader']) {
  test(`${role} can open and modify the yearbook`, () => {
    const user = { id: 1, role };
    assert.equal(canManageYearbook(user), true);
    let allowed = false;
    manager({ session: { user } }, {}, () => { allowed = true; });
    assert.equal(allowed, true);
  });
}

for (const role of ['member', null]) {
  test(`${role || 'signed-out visitor'} cannot manage the yearbook`, () => {
    const user = role ? { id: 2, role } : null;
    assert.equal(canManageYearbook(user), false);
    let statusCode;
    manager({ session: { user } }, { status(code) { statusCode = code; return this; }, json() {} }, () => assert.fail('Access should be denied.'));
    assert.equal(statusCode, 403);
  });
}
