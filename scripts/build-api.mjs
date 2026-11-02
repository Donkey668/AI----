import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
await build({absWorkingDir:fileURLToPath(new URL('../apps/api',import.meta.url)),entryPoints:['src/server.ts'],outfile:'dist/server.mjs',bundle:true,packages:'external',platform:'node',format:'esm',target:'node22',sourcemap:true});
