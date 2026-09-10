const { test } = require('node:test');
const assert = require('node:assert/strict');
const crypto = require('node:crypto');
const bcrypt = require('bcryptjs');
const { findOrCreateHustAccount } = require('../src/auth/hust-account');
const { withHustIdentity } = require('../src/auth/hust-identity');

function fixture(existing, race = false) {
  let row = existing;
  const inserts = [];
  return {
    inserts,
    context: { crypto, bcrypt, db: { async execute(sql, values) {
      if (sql.startsWith('SELECT')) return [row ? [{ ...row }] : []];
      assert.match(sql, /'member',1/);
      inserts.push(values);
      row = { id: 1, name: values[0], email: values[1], role: 'member', is_active: 1 };
      if (race) throw Object.assign(new Error('Duplicate email'), { code: 'ER_DUP_ENTRY' });
      return [{ insertId: 1 }];
    } } }
  };
}

for (const [email, onboarding] of [['student241234@sis.hust.edu.vn', 'student_class'], ['staff@hust.edu.vn', 'faculty_notice']]) {
  test(`First login creates an active member: ${onboarding}`, async () => {
    const f = fixture();
    const user = await findOrCreateHustAccount(f.context, email, { name: 'Test User' });
    assert.equal(user.role, 'member');
    assert.equal(user.name, 'Test User');
    assert.equal(user.email, email);
    assert.deepEqual(withHustIdentity(user).onboarding, { type: onboarding, required: true });
    assert.match(f.inserts[0][2], /^\$2[aby]\$/);
    assert.equal('password_hash' in user, false);
    await findOrCreateHustAccount(f.context, email, {});
    assert.equal(f.inserts.length, 1);
  });
}

test('Existing roles and onboarding data are preserved', async () => {
  const row = { id: 7, email: 'staff@hust.edu.vn', name: 'Existing', role: 'admin', is_active: 1, faculty_notice_acknowledged_at: '2026-09-01' };
  const f = fixture(row);
  const user = await findOrCreateHustAccount(f.context, row.email, { name: 'Changed' });
  assert.equal(user.role, 'admin');
  assert.equal(user.name, 'Existing');
  assert.equal(withHustIdentity(user).onboarding.required, false);
  assert.equal(f.inserts.length, 0);
});

test('Deactivated accounts are not recreated or reactivated', async () => {
  const f = fixture({ id: 1, is_active: 0 });
  assert.equal(await findOrCreateHustAccount(f.context, 'staff@hust.edu.vn', {}), null);
  assert.equal(f.inserts.length, 0);
});

test('Concurrent first logins reuse the account and missing names fall back to email', async () => {
  const f = fixture(null, true);
  const user = await findOrCreateHustAccount(f.context, 'staff@hust.edu.vn', {});
  assert.equal(user.id, 1);
  assert.equal(user.name, 'staff');
});

test('Database failures propagate', async () => {
  const error = new Error('Database unavailable');
  const context = { crypto, bcrypt, db: { async execute(sql) {
    if (sql.startsWith('SELECT')) return [[]];
    throw error;
  } } };
  await assert.rejects(findOrCreateHustAccount(context, 'staff@hust.edu.vn', {}), error);
});
