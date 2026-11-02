import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { mkdirSync, writeFileSync, existsSync, readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
export const source = 'F:/VibeCoding/watch_the_bird';
export const commit = '9ba9f18e18e29826ac6fc6694b5a873d015bbdf8';
const git = (...args) => execFileSync('git', ['-C', source, ...args], { maxBuffer: 32 * 1024 * 1024 });
const entries = git('ls-tree', '-r', commit).toString('utf8').trim().split('\n').map(line => {
  const [info, path] = line.split('\t');
  const [mode, type, object] = info.split(' ');
  return { path, mode, type, object };
});
const allowed = p => /^(app\/|components\/|lib\/|parkinfo\/|public\/)/.test(p)
  || ['package.json', 'package-lock.json', 'tsconfig.json', 'next.config.ts', 'postcss.config.mjs'].includes(p);
const manifestPath = resolve(root, 'specs/001-migrate-bird-prototype/baseline-manifest.json');
const manifest = existsSync(manifestPath) ? JSON.parse(readFileSync(manifestPath, 'utf8')) : {
  source, commit, initialStatus: git('status', '--porcelain=v1', '-uall').toString('utf8'), entries,
};
if (manifest.commit !== commit) throw new Error('Baseline commit mismatch');
for (const entry of entries.filter(e => allowed(e.path))) {
  const dest = resolve(root, '.migration/baseline', entry.path);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, git('show', `${commit}:${entry.path}`));
}
manifest.exported = entries.filter(e => allowed(e.path)).map(e => e.path);
manifest.worktreeHashes ??= Object.fromEntries(entries.filter(e=> allowed(e.path)).map(e => {
  const path=resolve(source,e.path);
  return [e.path,existsSync(path)?createHash('sha256').update(readFileSync(path)).digest('hex'):null];
}));
mkdirSync(dirname(manifestPath), { recursive: true });
writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
console.log(`Exported ${manifest.exported.length} files from ${commit}; account/notebook data excluded.`);
