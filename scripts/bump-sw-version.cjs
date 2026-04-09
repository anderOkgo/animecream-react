/* eslint-env node */
const fs = require('fs');
const path = require('path');

const swPath = path.join(__dirname, '..', 'public', 'sw.js');
const content = fs.readFileSync(swPath, 'utf8');

// Match: const VERSION = 'X.Y.Z';
const versionRegex = /const VERSION = '(\d+)\.(\d+)\.(\d+)';/;
const match = content.match(versionRegex);

if (!match) {
  console.error('bump-sw-version: No VERSION found in sw.js');
  process.exit(1);
}

const major = parseInt(match[1], 10);
const minor = parseInt(match[2], 10);
const patch = parseInt(match[3], 10) + 1;
const newVersion = `${major}.${minor}.${patch}`;

const newContent = content.replace(versionRegex, `const VERSION = '${newVersion}';`);
fs.writeFileSync(swPath, newContent);

console.log(`sw.js VERSION: ${match[0].replace("const VERSION = '", '').replace("';", '')} → ${newVersion}`);
