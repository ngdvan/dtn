'use strict';

const allowedRoles = new Set(['admin','leader','vice_leader','member','ky-yeu-admin']);

async function loadUserRoles(db,user) {
  if (!user?.id) return user;
  if (user.role) await db.execute('INSERT IGNORE INTO user_roles(user_id,role) VALUES(?,?)',[user.id,user.role]);
  const [rows] = await db.execute('SELECT role FROM user_roles WHERE user_id=? ORDER BY role',[user.id]);
  user.roles = [...new Set([user.role,...rows.map(row=>row.role)].filter(Boolean))];
  return user;
}

function requestedRoles(value,primaryRole) {
  const input = Array.isArray(value) ? value : value ? [value] : [];
  return [...new Set([primaryRole,...input.map(String)].filter(role=>allowedRoles.has(role)))];
}

async function replaceUserRoles(conn,userId,roles) {
  await conn.execute('DELETE FROM user_roles WHERE user_id=?',[userId]);
  for (const role of roles) await conn.execute('INSERT INTO user_roles(user_id,role) VALUES(?,?)',[userId,role]);
}

module.exports = { allowedRoles, loadUserRoles, requestedRoles, replaceUserRoles };
