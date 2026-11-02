import js from '@eslint/js';
import ts from 'typescript-eslint';
export default ts.config(
  { ignores: ['**/node_modules/**','**/dist/**','.migration/**','coverage/**','test-results/**','playwright-report/**','.agents/**','.specify/**'] },
  js.configs.recommended, ...ts.configs.recommended,
  { rules: {'@typescript-eslint/no-explicit-any':'off','@typescript-eslint/no-unused-vars':['error',{argsIgnorePattern:'^_',varsIgnorePattern:'^_'}]}, languageOptions:{globals:{console:'readonly',process:'readonly',Buffer:'readonly',URL:'readonly',Request:'readonly',Response:'readonly',File:'readonly',FormData:'readonly',fetch:'readonly',crypto:'readonly',setTimeout:'readonly',clearTimeout:'readonly',window:'readonly',document:'readonly'}} },
  { files:['apps/web/src/**/*.{ts,tsx}','packages/shared/src/**/*.ts'], rules:{'no-restricted-imports':['error',{patterns:['node:*','**/api/**'],paths:['next/headers','next/server']}] }},
  { files:['packages/shared/src/records/notebook-export.ts'],rules:{'no-control-regex':'off','no-useless-escape':'off'}},
  { files:['scripts/migrate-source.mjs'],rules:{'no-regex-spaces':'off'}}
);
