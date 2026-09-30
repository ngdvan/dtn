const test = require('node:test');
const assert = require('node:assert/strict');
const { createAccessPolicies } = require('../src/policies/access');

test('administrators retain all main documents without a membership lookup', async () => {
  const policies = createAccessPolicies({ execute() { throw new Error('Unexpected lookup'); } });
  const activities = [{ id: 1, proposal_document_url: 'https://example.com/private' }];
  await policies.restrictActivityDocuments({ id: 1, role: 'admin' }, activities);
  assert.equal(activities[0].proposal_document_url, 'https://example.com/private');
});

for (const role of ['member', 'leader', 'vice_leader']) {
  test(`${role}: only leadership of an involved team grants document access`, async () => {
    const policies = createAccessPolicies({ async execute(sql, params) {
      assert.deepEqual(params, [7]);
      assert.match(sql, /ut\.is_lead=1 OR ut\.is_vice_lead=1/);
      assert.match(sql, /ut\.team_id=at\.team_id/);
      return [[{ activity_id: '2' }]];
    } });
    const activities = [1, 2, 3].map(id => ({ id, creator_id: 7, title: 'Visible activity', proposal_document_url: 'secret' }));
    await policies.restrictActivityDocuments({ id: 7, role }, activities);
    assert.deepEqual(activities.map(a => a.proposal_document_url), [undefined, 'secret', undefined]);
    assert.ok(activities.every(a => a.title === 'Visible activity'));
  });
}

test('ordinary team members cannot see main documents', async () => {
  const policies = createAccessPolicies({ async execute() { return [[]]; } });
  const activities = [{ id: 1, proposal_document_url: 'secret' }];
  await policies.restrictActivityDocuments({ id: 7, role: 'member' }, activities);
  assert.equal(JSON.stringify(activities), '[{"id":1}]');
});

test('activity visibility includes team membership without requiring participation', async () => {
  const policies = createAccessPolicies({ async execute(sql, params) {
    assert.match(sql, /sat\.team_id=sut\.team_id|sut\.team_id=sat\.team_id/);
    assert.match(sql, /sut\.user_id=\?/);
    assert.doesNotMatch(sql, /participants|is_lead|is_vice_lead/);
    assert.deepEqual(params, [12, 7]);
    return [[{ id: 12 }]];
  } });
  assert.equal(await policies.visibleActivity({ id: 7, role: 'member' }, 12), true);
});
