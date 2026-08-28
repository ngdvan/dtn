const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const roots = ['app.js', 'src', 'public', 'scripts/migrate.js', 'scripts/backup-database.js', 'scripts/restore-2208-deleted-records.js'];
const files = [];
function collect(target) {
  const stat = fs.statSync(target);
  if (stat.isDirectory()) {
    for (const name of fs.readdirSync(target)) collect(path.join(target, name));
  } else if (target.endsWith('.js') && !target.endsWith(path.join('scripts', 'check.js'))) {
    files.push(target);
  }
}
for (const root of roots) collect(root);
for (const file of files) execFileSync(process.execPath, ['--check', file], { stdio: 'inherit' });
console.log(`Syntax checked ${files.length} JavaScript files.`);
