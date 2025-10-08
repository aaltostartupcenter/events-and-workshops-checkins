const fs = require('fs');
const path = require('path');

const url = process.env.GOOGLE_SCRIPT_URL || process.env.NEXT_PUBLIC_GOOGLE_SCRIPT_URL;
const outPath = path.join(__dirname, 'config.json');

if (!url) {
  console.warn('GOOGLE_SCRIPT_URL not set — no config.json will be written.');
  process.exit(0);
}

const config = { googleScriptUrl: url };
fs.writeFileSync(outPath, JSON.stringify(config, null, 2), 'utf8');
console.log(`Wrote ${outPath}`);
