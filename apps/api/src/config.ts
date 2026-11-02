import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { config } from 'dotenv';
export const apiRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
config({path:resolve(apiRoot,'.env'),quiet:true});
export const apiPort = Number(process.env.PORT || 3001);
