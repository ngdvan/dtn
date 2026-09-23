'use strict';
const { json } = require('./database');
const { hustEmail } = require('./catalog');

async function identity(db, id) {
  const [[row]] = await db.execute('SELECT id,name,email,identity_source,is_active FROM users WHERE id=?', [id]);
  if (!row || !row.is_active || !hustEmail(row.email)) return null;
  const [memberships] = await db.execute('SELECT m.unit_id,u.name,u.name_vi,u.color FROM memberships m JOIN units u ON u.id=m.unit_id AND u.is_active=1 WHERE m.user_id=?', [id]);
  const [roles] = await db.execute(`SELECT r.*,NULL unit_id FROM global_roles g JOIN roles r ON r.id=g.role_id AND r.scope='global' WHERE g.user_id=?
    UNION ALL SELECT r.*,a.unit_id FROM unit_roles a JOIN roles r ON r.id=a.role_id AND r.scope='unit' JOIN memberships m ON m.user_id=a.user_id AND m.unit_id=a.unit_id JOIN units u ON u.id=a.unit_id AND u.is_active=1 WHERE a.user_id=?`, [id,id]);
  return { ...row, memberships, roles: roles.map(r => ({ ...r, permissions: json(r.permissions) })) };
}
const isAdmin = user => user.roles.some(r => r.code === 'administrator' && r.unit_id === null);
function has(user, permission, unitId = null) {
  return isAdmin(user) || user.roles.some(r => r.permissions.includes(permission) && (r.unit_id === null || Number(r.unit_id) === Number(unitId)));
}
const isLeader = (user, unitId) => user.roles.some(r => r.code === 'leader' && Number(r.unit_id) === Number(unitId));

// Used by list, aggregate, child-resource and download queries. Values below originate
// from the current DB identity, never from request body or cached session roles.
function readScope(user, alias = 'r') {
  if (isAdmin(user)) return '1=1';
  const uid = Number(user.id);
  const teams = user.memberships.map(m => `JSON_CONTAINS(${alias}.audience_rules,JSON_OBJECT('unit_id',${Number(m.unit_id)}))`);
  const roles = user.roles.map(r => `JSON_CONTAINS(${alias}.audience_rules,JSON_OBJECT('role_id',${Number(r.id)},'unit_id',${r.unit_id === null ? 'NULL' : Number(r.unit_id)}))`);
  const dean = has(user, 'school.read') ? '1=1' : '0=1';
  return `(${alias}.audience!='admin' AND ((${alias}.author_id=${uid} AND ${alias}.status IN ('draft','pending')) OR
    (${alias}.status IN ('published','completed') AND (${dean} OR ${alias}.audience='public'
    OR (${alias}.audience='teams' AND (${teams.join(' OR ') || '0=1'}))
    OR (${alias}.audience='roles' AND (${roles.join(' OR ') || '0=1'}))))))`;
}
async function visibleRecord(db, user, id, lock = false) {
  const [[record]] = await db.execute(`SELECT r.*,u.name unit_name,u.color unit_color,a.name author_name FROM records r JOIN units u ON u.id=r.owner_unit_id JOIN users a ON a.id=r.author_id WHERE r.id=? AND ${readScope(user)} ${lock ? 'FOR UPDATE' : ''}`, [id]);
  if (!record) return null;
  record.audience_rules = json(record.audience_rules);
  return record;
}
function canEdit(user, record) {
  return isAdmin(user) || has(user, 'record.edit', record.owner_unit_id) || (Number(record.author_id) === user.id && has(user, 'record.create', record.owner_unit_id));
}
module.exports = { identity, isAdmin, has, isLeader, readScope, visibleRecord, canEdit };
