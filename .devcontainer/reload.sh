#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
npm run build
node --input-type=module <<'JS'
import { readdirSync, readFileSync, readlinkSync } from 'node:fs';
import { resolve, basename } from 'node:path';
const root = process.cwd();
for (const entry of readdirSync('/proc')) {
  if (!/^\d+$/.test(entry) || Number(entry) === process.pid) continue;
  try {
    if (readlinkSync(`/proc/${entry}/cwd`) !== root) continue;
    const args = readFileSync(`/proc/${entry}/cmdline`, 'utf8').split('\0').filter(Boolean);
    if (basename(args[0] || '') === 'node' && args.slice(1).some(a => resolve(root,a) === resolve(root,'server.mjs'))) process.kill(Number(entry),'SIGTERM');
  } catch (error) { if (!['ENOENT','ESRCH','EACCES'].includes(error.code)) throw error; }
}
await new Promise(resolve => setTimeout(resolve, 1000));
JS
bash .devcontainer/start.sh
