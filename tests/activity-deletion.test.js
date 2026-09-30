const test = require('node:test');
const assert = require('node:assert/strict');
const express = require('express');
const path = require('node:path');
const auth = require('../src/middleware/auth');
const { createActivityRoutes } = require('../src/routes/activities');
const { createTaskRoutes } = require('../src/routes/tasks');

async function request(t, factory, role, url, overrides = {}) {
  const app = express();
  app.use((req, res, next) => { req.session = { user: role ? { id: 7, role } : null }; next(); });
  app.use(factory({ ...auth, asyncRoute: fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next),
    taskUpload: { single: () => (req, res, next) => next() }, ...overrides }));
  app.use((err, req, res, next) => res.status(500).json({ error: err.message }));
  const server = app.listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  t.after(() => new Promise(resolve => server.close(resolve)));
  return fetch(`http://127.0.0.1:${server.address().port}${url}`, { method: 'DELETE' });
}

for (const role of ['admin', 'leader', 'vice_leader']) {
  test(`${role} can remove a participant without managing their team`, async t => {
    const response = await request(t, createActivityRoutes, role, '/api/activities/12/participants/9', {
      visibleActivity: async () => true,
      db: { async execute(sql, params) {
        assert.equal(sql, 'DELETE FROM participants WHERE activity_id=? AND user_id=?');
        assert.deepEqual(params, [12, 9]);
        return [{ affectedRows: 1 }];
      } }
    });
    assert.equal(response.status, 200);
  });
}

test('members cannot remove participants', async t => {
  assert.equal((await request(t, createActivityRoutes, 'member', '/api/activities/12/participants/9')).status, 403);
});
test('leaders cannot remove participants from inaccessible activities', async t => {
  assert.equal((await request(t, createActivityRoutes, 'leader', '/api/activities/12/participants/9', { visibleActivity: async () => false })).status, 404);
});
for (const role of ['leader', 'vice_leader', 'member', null]) {
  test(`${role || 'anonymous'} cannot delete tasks`, async t => {
    assert.equal((await request(t, createTaskRoutes, role, '/api/tasks/5')).status, role ? 403 : 401);
  });
}

test('admin deletion commits before removing stored attachments', async t => {
  const events = [];
  const conn = {
    async beginTransaction() { events.push('begin'); },
    async execute(sql, params) {
      assert.deepEqual(params, [5]);
      if (sql.startsWith('SELECT id')) return [[{ id: 5 }]];
      if (sql.startsWith('SELECT stored_name')) return [[{ stored_name: '5-file.pdf' }]];
      assert.equal(sql, 'DELETE FROM tasks WHERE id=?');
      events.push('delete'); return [{ affectedRows: 1 }];
    },
    async commit() { events.push('commit'); },
    async rollback() { events.push('rollback'); },
    release() { events.push('release'); }
  };
  const response = await request(t, createTaskRoutes, 'admin', '/api/tasks/5', {
    db: { getConnection: async () => conn }, path, attachmentRoot: path.resolve('storage/task-attachments'),
    fs: { promises: { async unlink(file) { assert.equal(file, path.resolve('storage/task-attachments/5-file.pdf')); events.push('unlink'); } } },
    logger: { error() { assert.fail('Unexpected cleanup failure'); } }
  });
  assert.equal(response.status, 200);
  assert.deepEqual(events, ['begin', 'delete', 'commit', 'release', 'unlink']);
});

test('failed task deletion rolls back without removing files', async t => {
  const events = [];
  const response = await request(t, createTaskRoutes, 'admin', '/api/tasks/5', {
    db: { async getConnection() { return {
      async beginTransaction() {},
      async execute(sql) {
        if (sql.startsWith('SELECT id')) return [[{ id: 5 }]];
        if (sql.startsWith('SELECT stored_name')) return [[]];
        throw new Error('Database failure');
      },
      async rollback() { events.push('rollback'); },
      release() { events.push('release'); }
    }; } }
  });
  assert.equal(response.status, 500);
  assert.deepEqual(events, ['rollback', 'release']);
});
