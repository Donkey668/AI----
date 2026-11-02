// Isolated UI harness: original component/CSS sources stay byte-for-byte intact.
import { createServer } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { resolve,dirname } from 'node:path';
import { mkdirSync,writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const harness=resolve(root,'.migration/ui-harness');mkdirSync(harness,{recursive:true});
writeFileSync(resolve(harness,'index.html'),'<html lang="zh-CN" class="h-full antialiased"><head><meta name="viewport" content="width=device-width,initial-scale=1.0"></head><body class="min-h-full bg-[var(--shell-canvas)] text-[var(--text-primary)]"><div id="root"></div><script type="module" src="/main.tsx"></script></body></html>');
writeFileSync(resolve(harness,'main.tsx'),`import {createRoot} from 'react-dom/client';import {MobileShell} from '../baseline/app/_components/mobile-shell';import './style.css';import '../../apps/web/src/styles/fonts.css';const r=createRoot(document.getElementById('root')!);fetch('/api/auth/session').then(x=>x.json()).then(initialAuthSession=>r.render(<main className="min-h-dvh w-full overflow-hidden bg-[var(--shell-canvas)]"><MobileShell initialAuthSession={initialAuthSession}/></main>));`);
writeFileSync(resolve(harness,'style.css'),'@import "../baseline/app/globals.css";\n@source "../baseline/app/_components";\n@source "../baseline/components";\n');
const server=await createServer({configFile:false,root:harness,publicDir:resolve(root,'.migration/baseline/public'),plugins:[react(),tailwind()],define:{'process.env.NEXT_PUBLIC_AMAP_KEY':'""','process.env.NEXT_PUBLIC_AMAP_SECURITY_JS_CODE':'""','process.env.NEXT_PUBLIC_AMAP_SERVICE_HOST':'""'},resolve:{dedupe:['react','react-dom'],alias:[{find:'@/lib/auth/session-store',replacement:resolve(root,'packages/shared/src/auth/session-store.ts')},{find:'next/image',replacement:resolve(root,'apps/web/src/components/image.tsx')},{find:'@',replacement:resolve(root,'.migration/baseline')}]},server:{port:5175,host:'127.0.0.1',strictPort:true,fs:{allow:[root]},proxy:{'/api':{target:'http://127.0.0.1:3001',changeOrigin:false}}}});
await server.listen();console.log('Isolated original UI harness: http://127.0.0.1:5175');
