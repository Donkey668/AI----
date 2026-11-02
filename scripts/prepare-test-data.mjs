import { mkdirSync, copyFileSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
for(const base of ['apps/api','.migration/baseline']) {
  const dir=resolve(root,base,'data');
  if(!dir.startsWith(root+'/') && !dir.startsWith(root+'\\')) throw new Error('Outside workspace');
  mkdirSync(resolve(dir,'auth'),{recursive:true});
  mkdirSync(resolve(dir,'notebooks'),{recursive:true});
  const target=resolve(dir,'auth/account-password-library.json');
  if(!existsSync(target)) copyFileSync(resolve(root,'tests/fixtures/accounts.json'),target);
}
console.log('Independent synthetic accounts prepared. Existing files were preserved.');
