#!/usr/bin/env node
'use strict';

const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

const migrationDir = path.join(__dirname, '..', 'database', 'migrations');
const migrationPattern = /^(\d{3,})_[a-z0-9_]+\.sql$/;
const baselineArgument = process.argv.find(argument => argument.startsWith('--baseline='));
const baseline = baselineArgument ? Number(baselineArgument.split('=', 2)[1]) : null;
const dryRun = process.argv.includes('--dry-run');

if (baselineArgument && (!Number.isInteger(baseline) || baseline < 0)) {
  console.error('The baseline must be a non-negative migration number, for example --baseline=003.');
  process.exit(1);
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME,
  charset: 'utf8mb4',
  multipleStatements: true
};

if (!config.user || !config.database) {
  console.error('DB_USER and DB_NAME must be configured in the environment or .env file.');
  process.exit(1);
}

const migrations = fs.readdirSync(migrationDir)
  .filter(filename => migrationPattern.test(filename))
  .sort()
  .map(filename => {
    const sql = fs.readFileSync(path.join(migrationDir, filename), 'utf8');
    return {
      filename,
      number: Number(filename.match(migrationPattern)[1]),
      sql,
      checksum: crypto.createHash('sha256').update(sql).digest('hex')
    };
  });

async function schemaHas(connection, table, column = null) {
  const sql = column
    ? 'SELECT 1 FROM information_schema.columns WHERE table_schema=? AND table_name=? AND column_name=? LIMIT 1'
    : 'SELECT 1 FROM information_schema.tables WHERE table_schema=? AND table_name=? LIMIT 1';
  const parameters = column ? [config.database, table, column] : [config.database, table];
  const [rows] = await connection.execute(sql, parameters);
  return rows.length > 0;
}

async function detectLegacyMigrations(connection) {
  const detected = new Set();
  if (await schemaHas(connection, 'activity_teams') &&
      await schemaHas(connection, 'task_assignees') &&
      await schemaHas(connection, 'tasks', 'start_date')) detected.add(2);
  if (await schemaHas(connection, 'task_attachments')) detected.add(3);
  if (await schemaHas(connection, 'documents')) detected.add(4);
  if (await schemaHas(connection, 'documents', 'visibility')) detected.add(5);
  return migrations.filter(migration => detected.has(migration.number));
}

async function run() {
  const connection = await mysql.createConnection(config);
  let locked = false;

  try {
    const [[lock]] = await connection.query("SELECT GET_LOCK('seee_activity_hub_migrations', 30) AS acquired");
    if (lock.acquired !== 1) throw new Error('Could not acquire the database migration lock.');
    locked = true;

    await connection.query(`CREATE TABLE IF NOT EXISTS schema_migrations (
      filename VARCHAR(255) PRIMARY KEY,
      checksum CHAR(64) NOT NULL,
      applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    let [rows] = await connection.query('SELECT filename, checksum FROM schema_migrations');
    if (!rows.length && baseline === null) {
      const detected = await detectLegacyMigrations(connection);
      for (const migration of detected) {
        await connection.execute(
          'INSERT INTO schema_migrations(filename, checksum) VALUES(?, ?)',
          [migration.filename, migration.checksum]
        );
        console.log(`Detected existing schema: ${migration.filename}`);
      }
    }

    if (baseline !== null) {
      const selected = migrations.filter(migration => migration.number <= baseline);
      if (!selected.length || baseline > migrations.at(-1).number) {
        throw new Error(`Baseline ${String(baseline).padStart(3, '0')} does not match the available migrations.`);
      }
      for (const migration of selected) {
        await connection.execute(
          'INSERT IGNORE INTO schema_migrations(filename, checksum) VALUES(?, ?)',
          [migration.filename, migration.checksum]
        );
      }
      console.log(`Baselined migrations through ${String(baseline).padStart(3, '0')}.`);
    }

    [rows] = await connection.query('SELECT filename, checksum FROM schema_migrations');
    const applied = new Map(rows.map(row => [row.filename, row.checksum]));

    for (const migration of migrations) {
      if (applied.has(migration.filename)) {
        if (applied.get(migration.filename) !== migration.checksum) {
          throw new Error(`Applied migration was modified: ${migration.filename}`);
        }
        continue;
      }
      if (dryRun) {
        console.log(`Pending: ${migration.filename}`);
        continue;
      }

      console.log(`Applying: ${migration.filename}`);
      await connection.query(migration.sql);
      await connection.execute(
        'INSERT INTO schema_migrations(filename, checksum) VALUES(?, ?)',
        [migration.filename, migration.checksum]
      );
      console.log(`Applied:  ${migration.filename}`);
    }

    if (dryRun) console.log('Dry run complete; no migrations were applied.');
    else console.log('Database is up to date.');
  } finally {
    if (locked) await connection.query("SELECT RELEASE_LOCK('seee_activity_hub_migrations')");
    await connection.end();
  }
}

run().catch(error => {
  console.error(`Migration failed: ${error.message}`);
  process.exitCode = 1;
});
