'use strict';
const path = require('node:path');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env.local'), quiet: true });
const mysql = require('mysql2/promise');
const dbConfig = {
  host: process.env.WORKSPACE_DB_HOST || '127.0.0.1',
  port: Number(process.env.WORKSPACE_DB_PORT || 3307),
  user: process.env.WORKSPACE_DB_USER || 'seee_local',
  password: process.env.WORKSPACE_DB_PASSWORD || '',
  database: process.env.WORKSPACE_DB_NAME || 'seee_workspace_local',
  charset: 'utf8mb4', timezone: '+07:00', dateStrings: true
};
function createPool() { return mysql.createPool({ ...dbConfig, connectionLimit: 10 }); }
const json = value => typeof value === 'string' ? JSON.parse(value) : value;
async function transaction(pool, fn) {
  const conn = await pool.getConnection();
  try { await conn.beginTransaction(); const result = await fn(conn); await conn.commit(); return result; }
  catch (e) { await conn.rollback(); throw e; }
  finally { conn.release(); }
}
async function audit(db, actor, action, target, details = {}) {
  await db.execute('INSERT INTO audit_events(actor_id,action,target,details) VALUES(?,?,?,?)', [actor || null, action, String(target), JSON.stringify(details)]);
}
module.exports = { dbConfig, createPool, json, transaction, audit };
