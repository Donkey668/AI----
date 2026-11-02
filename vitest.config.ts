import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';
export default defineConfig({resolve:{alias:{'server-only':fileURLToPath(new URL('./tests/helpers/server-only.ts',import.meta.url)),'next/headers':fileURLToPath(new URL('./tests/helpers/next-headers.ts',import.meta.url)),'@':fileURLToPath(new URL('./.migration/baseline',import.meta.url))}},test:{include:['tests/**/*.test.ts'],fileParallelism:false,setupFiles:['./tests/helpers/setup.ts']}});
