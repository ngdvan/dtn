function createAccessPolicies(db, isLeadership) {
  function activityScope(user, alias = 'a') {
    if (user.role === 'admin') return { sql: '1=1', params: [] };
    return { sql: `(${alias}.is_public=1 OR EXISTS(SELECT 1 FROM activity_teams sat JOIN user_teams sut ON sut.team_id=sat.team_id WHERE sat.activity_id=${alias}.id AND sut.user_id=?))`, params: [user.id] };
  }
  async function leadsTeam(userId, teamId) { const [rows] = await db.execute('SELECT 1 FROM user_teams WHERE user_id=? AND team_id=? AND (is_lead=1 OR is_vice_lead=1)', [userId, teamId]); return !!rows.length; }
  async function belongsToTeam(userId, teamId) { const [rows] = await db.execute('SELECT 1 FROM user_teams WHERE user_id=? AND team_id=?', [userId, teamId]); return !!rows.length; }
  async function canManageTeam(user, teamId) { return user.role === 'admin' || (isLeadership(user) && await leadsTeam(user.id, teamId)); }
  async function managedTeamIds(user) { if (user.role === 'admin') { const [rows] = await db.execute('SELECT id FROM teams WHERE is_active=1'); return rows.map(row => row.id); } const [rows] = await db.execute('SELECT team_id id FROM user_teams WHERE user_id=? AND (is_lead=1 OR is_vice_lead=1)', [user.id]); return rows.map(row => row.id); }
  async function canManageUser(user, targetId) { if (user.role === 'admin') return true; if (!isLeadership(user) || Number(targetId) === Number(user.id)) return false; const [rows] = await db.execute("SELECT 1 FROM users u JOIN user_teams theirs ON theirs.user_id=u.id JOIN user_teams mine ON mine.team_id=theirs.team_id AND mine.user_id=? AND (mine.is_lead=1 OR mine.is_vice_lead=1) WHERE u.id=? AND u.role='member' LIMIT 1", [user.id, targetId]); return !!rows.length; }
  async function canManageActivity(user, activityId) { if (user.role === 'admin') return true; const [rows] = await db.execute('SELECT 1 FROM activities a JOIN activity_teams at ON at.activity_id=a.id JOIN user_teams ut ON ut.team_id=at.team_id WHERE a.id=? AND (a.creator_id=? OR (ut.user_id=? AND (ut.is_lead=1 OR ut.is_vice_lead=1))) LIMIT 1', [activityId, user.id, user.id]); return !!rows.length; }
  async function visibleActivity(user, activityId) { const scope = activityScope(user); const [rows] = await db.execute(`SELECT 1 FROM activities a WHERE a.id=? AND ${scope.sql}`, [activityId, ...scope.params]); return !!rows.length; }

  return { activityScope, leadsTeam, belongsToTeam, canManageTeam, managedTeamIds, canManageUser, canManageActivity, visibleActivity };
}

module.exports = { createAccessPolicies };
