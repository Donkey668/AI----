import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { fileURLToPath } from 'node:url';
export default defineConfig(({mode})=>{
 const env=loadEnv(mode,process.cwd(),'');
 const proxy={'/api':{target:env.API_TARGET||'http://127.0.0.1:3001',changeOrigin:false}};
 return {plugins:[react(),tailwind()],resolve:{alias:{'@':fileURLToPath(new URL('./src',import.meta.url))}},server:{port:Number(env.WEB_PORT||5173),strictPort:true,proxy},preview:{proxy}};
});
