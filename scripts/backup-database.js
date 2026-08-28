#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { pipeline } = require('stream/promises');
const zlib = require('zlib');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const required = ['DB_USER', 'DB_NAME'];
const missing = required.filter(key => !String(process.env[key] || '').trim());
if (missing.length) {
  console.error(`Backup configuration is missing: ${missing.join(', ')}`);
  process.exit(1);
}

const backupDir = path.resolve(process.env.DB_BACKUP_DIR || path.join(__dirname, '..', '..', 'backups', 'dtn'));
const publicDir = path.resolve(__dirname, '..', 'public');
if (backupDir === publicDir || backupDir.startsWith(`${publicDir}${path.sep}`)) {
  console.error('DB_BACKUP_DIR must not be inside the public web directory.');
  process.exit(1);
}

const retentionDays = Number(process.env.DB_BACKUP_RETENTION_DAYS || 14);
if (!Number.isInteger(retentionDays) || retentionDays < 1) {
  console.error('DB_BACKUP_RETENTION_DAYS must be a positive whole number.');
  process.exit(1);
}

const stamp = new Date().toISOString().replace(/[:.]/g, '-');
const safeDatabaseName = String(process.env.DB_NAME).replace(/[^a-zA-Z0-9_-]/g, '_');
const filename = `${safeDatabaseName}-${stamp}.sql.gz`;
const finalPath = path.join(backupDir, filename);
const temporaryPath = `${finalPath}.partial`;
const dumpPath = process.env.MYSQLDUMP_PATH || 'mysqldump';

async function removeExpiredBackups() {
  const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
  const pattern = new RegExp(`^${safeDatabaseName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}-\\d{4}-\\d{2}-\\d{2}T.*\\.sql\\.gz$`);
  for (const entry of await fs.promises.readdir(backupDir, { withFileTypes: true })) {
    if (!entry.isFile() || !pattern.test(entry.name)) continue;
    const target = path.resolve(backupDir, entry.name);
    if (path.dirname(target) !== backupDir) continue;
    const stat = await fs.promises.stat(target);
    if (stat.mtimeMs < cutoff) await fs.promises.unlink(target);
  }
}

async function run() {
  await fs.promises.mkdir(backupDir, { recursive: true, mode: 0o700 });
  const args = [
    '--single-transaction', '--quick', '--skip-lock-tables',
    '--routines', '--events', '--triggers', '--hex-blob', '--no-tablespaces',
    '--default-character-set=utf8mb4',
    `--host=${process.env.DB_HOST || 'localhost'}`,
    `--port=${Number(process.env.DB_PORT || 3306)}`,
    `--user=${process.env.DB_USER}`,
    process.env.DB_NAME
  ];
  const child = spawn(dumpPath, args, {
    env: { ...process.env, MYSQL_PWD: process.env.DB_PASSWORD || '' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  let stderr = '';
  child.stderr.on('data', chunk => { stderr += chunk.toString(); });
  const completed = new Promise((resolve, reject) => {
    child.once('error', reject);
    child.once('close', code => code === 0 ? resolve() : reject(new Error(stderr.trim() || `mysqldump exited with code ${code}`)));
  });
  try {
    await Promise.all([
      pipeline(child.stdout, zlib.createGzip({ level: 9 }), fs.createWriteStream(temporaryPath, { mode: 0o600 })),
      completed
    ]);
    const stat = await fs.promises.stat(temporaryPath);
    if (!stat.size) throw new Error('mysqldump produced an empty backup.');
    await fs.promises.rename(temporaryPath, finalPath);
    await removeExpiredBackups();
    console.log(`Database backup created: ${finalPath} (${stat.size} bytes)`);
  } catch (error) {
    await fs.promises.unlink(temporaryPath).catch(unlinkError => {
      if (unlinkError.code !== 'ENOENT') console.error(`Unable to remove partial backup: ${unlinkError.message}`);
    });
    throw error;
  }
}

run().catch(error => {
  console.error(`Database backup failed: ${error.message}`);
  process.exitCode = 1;
});
