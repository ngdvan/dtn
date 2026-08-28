#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const execute = process.argv.includes('--execute');
const reuseRecovery = process.argv.includes('--reuse-recovery');
const confirmArgument = process.argv.find(value => value.startsWith('--confirm-db='));
const confirmedDatabase = confirmArgument?.slice('--confirm-db='.length);
const productionDatabase = String(process.env.DB_NAME || '').trim();
const recoveryDatabase = String(process.env.RECOVERY_DB_NAME || `${productionDatabase}_2208_recovery`).trim();
const dumpPath = path.resolve(__dirname, '..', 'debug', 'nhsvsvwx_seee_activity_hub_db 2208.sql');

function identifier(value) {
  if (!/^[a-zA-Z0-9_]+$/.test(value) || value.length > 64) {
    throw new Error(`Unsafe or invalid database identifier: ${value}`);
  }
  return `\`${value}\``;
}

function requireConfiguration() {
  const missing = ['DB_USER', 'DB_NAME'].filter(key => !String(process.env[key] || '').trim());
  if (missing.length) throw new Error(`Missing database configuration: ${missing.join(', ')}`);
  if (!fs.existsSync(dumpPath)) throw new Error(`Recovery dump not found: ${dumpPath}`);
  if (recoveryDatabase === productionDatabase) throw new Error('Recovery database must differ from production.');
  identifier(productionDatabase);
  identifier(recoveryDatabase);
}

const connectionConfig = database => ({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database,
  charset: 'utf8mb4',
  multipleStatements: true
});

async function scalar(connection, sql, parameters = []) {
  const [rows] = await connection.execute(sql, parameters);
  return Number(Object.values(rows[0] || {})[0] || 0);
}

async function assertCount(connection, sql, expected, message, parameters = []) {
  const actual = await scalar(connection, sql, parameters);
  if (actual !== expected) throw new Error(`${message} Expected ${expected}, found ${actual}.`);
}

async function importRecoveryDatabase(server) {
  const recoveryName = identifier(recoveryDatabase);
  const exists = await scalar(server,
    'SELECT COUNT(*) total FROM information_schema.schemata WHERE schema_name=?',
    [recoveryDatabase]);
  if (!exists) {
    throw new Error(
      `Recovery database ${recoveryDatabase} does not exist. Create it in cPanel and grant ${process.env.DB_USER} access first.`
    );
  }
  const tableCount = await scalar(server,
    'SELECT COUNT(*) total FROM information_schema.tables WHERE table_schema=?',
    [recoveryDatabase]);
  if (tableCount && reuseRecovery) {
    console.log(`Reusing populated recovery database ${recoveryName}; source validation will run before restoration.`);
    return;
  }
  if (tableCount) {
    throw new Error(`Recovery database ${recoveryDatabase} is not empty; refusing to drop or overwrite it.`);
  }

  const dump = fs.readFileSync(dumpPath, 'utf8');
  if (/^\s*(CREATE\s+DATABASE|USE\s+)/im.test(dump)) {
    throw new Error('Recovery dump unexpectedly selects or creates a database; refusing import.');
  }
  const recovery = await mysql.createConnection(connectionConfig(recoveryDatabase));
  try {
    await recovery.query(dump);
  } finally {
    await recovery.end();
  }
  console.log(`Imported audited dump into ${recoveryName}.`);
}

async function validateSource(connection) {
  const source = identifier(recoveryDatabase);
  await assertCount(connection,
    `SELECT COUNT(*) total FROM ${source}.users WHERE id=1 AND email='admin@seee.edu.vn'`, 1,
    'Unexpected recovery user data.');
  await assertCount(connection,
    `SELECT COUNT(*) total FROM ${source}.activities WHERE id IN (1,6,8) AND creator_id=1`, 3,
    'Unexpected recovery activity data.');
  await assertCount(connection,
    `SELECT COUNT(*) total FROM ${source}.tasks WHERE id IN (1,2) AND activity_id=1`, 2,
    'Unexpected recovery task data.');
  await assertCount(connection,
    `SELECT
      (SELECT COUNT(*) FROM ${source}.activity_teams WHERE activity_id IN (1,6,8)) +
      (SELECT COUNT(*) FROM ${source}.participants WHERE activity_id IN (1,6,8)) +
      (SELECT COUNT(*) FROM ${source}.task_assignees WHERE task_id IN (1,2)) +
      (SELECT COUNT(*) FROM ${source}.task_attachments WHERE task_id IN (1,2)) +
      (SELECT COUNT(*) FROM ${source}.documents WHERE id=1 AND created_by=1) total`, 30,
    'Unexpected dependent-row counts in recovery data.');
}

async function validateTarget(connection) {
  const target = identifier(productionDatabase);
  await assertCount(connection,
    `SELECT COUNT(*) total FROM ${target}.schema_migrations
     WHERE filename IN ('013_remove_seed_records.sql','014_multiple_comment_person_tags.sql')`, 2,
    'Production is not on the expected current schema.');
  await assertCount(connection,
    `SELECT
      (SELECT COUNT(*) FROM ${target}.users WHERE id=1 OR email='admin@seee.edu.vn') +
      (SELECT COUNT(*) FROM ${target}.activities WHERE id IN (1,6,8)) +
      (SELECT COUNT(*) FROM ${target}.documents WHERE id=1) +
      (SELECT COUNT(*) FROM ${target}.tasks WHERE id IN (1,2)) +
      (SELECT COUNT(*) FROM ${target}.task_attachments WHERE id IN (1,2)) total`, 0,
    'Production contains a conflicting recovery ID or email; nothing was changed.');
}

async function insertExpected(connection, sql, expected, label) {
  const [result] = await connection.query(sql);
  if (result.affectedRows !== expected) {
    throw new Error(`${label}: expected ${expected} inserted rows, got ${result.affectedRows}.`);
  }
  console.log(`${label}: ${result.affectedRows}`);
}

async function restore(connection) {
  const source = identifier(recoveryDatabase);
  const target = identifier(productionDatabase);
  await connection.beginTransaction();
  try {
    await insertExpected(connection, `INSERT INTO ${target}.users
      (id,name,email,password_hash,role,phone,avatar_color,is_active,created_at)
      SELECT id,name,email,password_hash,role,phone,avatar_color,is_active,created_at
      FROM ${source}.users WHERE id=1 AND email='admin@seee.edu.vn'`, 1, 'Users restored');

    await insertExpected(connection, `INSERT INTO ${target}.user_teams
      (user_id,team_id,is_lead,is_vice_lead)
      SELECT user_id,team_id,is_lead,0 FROM ${source}.user_teams WHERE user_id=1`, 1,
    'User-team memberships restored');

    await insertExpected(connection, `INSERT INTO ${target}.activities
      (id,title,description,is_public,public_image_url,proposal_document_url,type,status,priority,
       team_id,creator_id,requested_by,location,start_date,deadline,result_summary,created_at,updated_at)
      SELECT id,title,description,0,NULL,proposal_document_url,type,status,priority,team_id,creator_id,
       requested_by,location,start_date,deadline,result_summary,created_at,updated_at
      FROM ${source}.activities WHERE id IN (1,6,8) AND creator_id=1`, 3, 'Activities restored');

    await insertExpected(connection, `INSERT INTO ${target}.activity_teams
      (activity_id,team_id,role,responsibility,contact_user_id)
      SELECT activity_id,team_id,role,responsibility,contact_user_id
      FROM ${source}.activity_teams WHERE activity_id IN (1,6,8)`, 15, 'Activity-team links restored');

    await insertExpected(connection, `INSERT INTO ${target}.participants
      (activity_id,user_id,state,responsibility,joined_at)
      SELECT activity_id,user_id,state,responsibility,joined_at
      FROM ${source}.participants WHERE activity_id IN (1,6,8)`, 10, 'Participants restored');

    await insertExpected(connection, `INSERT INTO ${target}.tasks
      (id,activity_id,title,description,stage,status,priority,team_id,assignee_id,assigned_by,
       start_date,deadline,deliverable,completed_at,created_at)
      SELECT id,activity_id,title,description,stage,status,priority,team_id,assignee_id,1,
       start_date,deadline,deliverable,completed_at,created_at
      FROM ${source}.tasks WHERE activity_id IN (1,6,8)`, 2, 'Tasks restored');

    await insertExpected(connection, `INSERT INTO ${target}.task_assignees (task_id,user_id,assigned_at)
      SELECT a.task_id,a.user_id,a.assigned_at FROM ${source}.task_assignees a
      JOIN ${source}.tasks t ON t.id=a.task_id WHERE t.activity_id IN (1,6,8)`, 2,
    'Task assignees restored');

    await insertExpected(connection, `INSERT INTO ${target}.task_attachments
      (id,task_id,user_id,kind,label,link_url,stored_name,original_name,mime_type,size_bytes,created_at)
      SELECT x.id,x.task_id,x.user_id,x.kind,x.label,x.link_url,x.stored_name,x.original_name,
       x.mime_type,x.size_bytes,x.created_at FROM ${source}.task_attachments x
      JOIN ${source}.tasks t ON t.id=x.task_id WHERE t.activity_id IN (1,6,8)`, 2,
    'Attachment records restored');

    await insertExpected(connection, `INSERT INTO ${target}.documents
      (id,name,link_url,description,applicable_year,issuing_team_id,visibility,created_by,created_at,updated_at)
      SELECT id,name,link_url,description,applicable_year,issuing_team_id,
       CASE WHEN visibility='all' THEN 'all_teams' ELSE 'issuing_team' END,
       created_by,created_at,updated_at FROM ${source}.documents WHERE id=1 AND created_by=1`, 1,
    'Documents restored');

    await connection.commit();
  } catch (error) {
    await connection.rollback();
    throw error;
  }
}

async function verify(connection) {
  const target = identifier(productionDatabase);
  const [summary] = await connection.query(`SELECT
    (SELECT COUNT(*) FROM ${target}.users WHERE id=1) users,
    (SELECT COUNT(*) FROM ${target}.activities WHERE id IN (1,6,8)) activities,
    (SELECT COUNT(*) FROM ${target}.tasks WHERE activity_id IN (1,6,8)) tasks,
    (SELECT COUNT(*) FROM ${target}.task_attachments WHERE task_id IN (1,2)) attachments,
    (SELECT COUNT(*) FROM ${target}.documents WHERE id=1) documents`);
  console.log('Verification:', summary[0]);
}

async function run() {
  requireConfiguration();
  console.log(`Production database: ${productionDatabase}`);
  console.log(`Recovery database:   ${recoveryDatabase}`);
  console.log(`Source dump:         ${dumpPath}`);
  if (!execute) {
    console.log('\nDry safety mode: no database was changed.');
    console.log(`To execute, create and grant access to the empty recovery database, then run:`);
    console.log(`node scripts/restore-2208-deleted-records.js --execute --confirm-db=${productionDatabase}`);
    return;
  }
  if (confirmedDatabase !== productionDatabase) {
    throw new Error(`Refusing execution. Pass --confirm-db=${productionDatabase} exactly.`);
  }

  const server = await mysql.createConnection(connectionConfig(undefined));
  try {
    await importRecoveryDatabase(server);
  } finally {
    await server.end();
  }

  const production = await mysql.createConnection(connectionConfig(productionDatabase));
  try {
    await validateSource(production);
    await validateTarget(production);
    await restore(production);
    await verify(production);
  } finally {
    await production.end();
  }
  console.log('Selective recovery completed. The recovery database was retained for inspection.');
}

run().catch(error => {
  console.error(`Recovery failed: ${error.message}`);
  process.exitCode = 1;
});
