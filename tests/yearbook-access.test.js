const test = require('node:test');
const assert = require('node:assert/strict');
const { canManageYearbook, yearbookAdmin, rolesOf } = require('../src/middleware/auth');
const { requestedRoles } = require('../src/auth/user-roles');

for (const user of [
  { role: 'admin', roles: ['admin'] },
  { role: 'member', roles: ['member', 'ky-yeu-admin'] },
  { role: 'leader', roles: ['leader', 'ky-yeu-admin'] },
  { role: 'vice_leader', roles: ['vice_leader', 'ky-yeu-admin'] }
]) {
  test(`${user.role} with applicable roles can manage the yearbook`, () => {
    assert.equal(canManageYearbook(user), true);
    let allowed = false;
    yearbookAdmin({ session: { user } }, {}, () => { allowed = true; });
    assert.equal(allowed, true);
  });
}

for (const user of [
  { role: 'member', roles: ['member'] },
  { role: 'leader', roles: ['leader'] },
  { role: 'vice_leader', roles: ['vice_leader'] },
  null
]) {
  test(`${user?.role || 'signed-out visitor'} without yearbook authority is denied`, () => {
    assert.equal(canManageYearbook(user), false);
    let statusCode;
    yearbookAdmin({ session: { user } }, { status(code) { statusCode = code; return this; }, json() {} }, () => assert.fail('Access should be denied.'));
    assert.equal(statusCode, 403);
  });
}

test('roles combine the primary role with additional roles without duplicates', () => {
  assert.deepEqual(rolesOf({ role: 'leader', roles: ['leader', 'ky-yeu-admin'] }), ['leader', 'ky-yeu-admin']);
  assert.deepEqual(requestedRoles(['ky-yeu-admin', 'unknown'], 'member'), ['member', 'ky-yeu-admin']);
});
