import http from 'node:http';
import https from 'node:https';
import { readFileSync,existsSync,statSync,mkdirSync,writeFileSync } from 'node:fs';
import { resolve,dirname,extname } from 'node:path';
import { fileURLToPath,pathToFileURL } from 'node:url';
import selfsigned from 'selfsigned';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export async function createBuiltServer({tls=false,target='http://127.0.0.1:3001'}={}){
 const dir=resolve(root,'apps/web/dist');
 const handler=(req,res)=>{
  if(req.url.startsWith('/api/')){
   const upstream=http.request(new URL(req.url,target),{method:req.method,headers:req.headers},r=>{res.writeHead(r.statusCode,r.headers);r.pipe(res);});
   upstream.on('error',()=>{res.writeHead(502,{'Content-Type':'text/plain;charset=utf-8'});res.end('API unavailable');});req.pipe(upstream);return;
  }
  let path;try{path=resolve(dir,'.'+decodeURIComponent(new URL(req.url,'http://local').pathname));}catch{res.writeHead(400);res.end();return;}
  if(path!==dir&&!path.startsWith(dir+'/')&&!path.startsWith(dir+'\\')){res.writeHead(403);res.end();return;}
  if(!existsSync(path)||!statSync(path).isFile())path=resolve(dir,'index.html');
  const mime={'.html':'text/html;charset=utf-8','.js':'text/javascript','.css':'text/css','.woff2':'font/woff2','.svg':'image/svg+xml','.png':'image/png','.ico':'image/x-icon'}[extname(path)]||'application/octet-stream';
  res.writeHead(200,{'Content-Type':mime});res.end(readFileSync(path));
 };
 if(!tls)return http.createServer(handler);
 const certdir=resolve(root,'.migration/certs');mkdirSync(certdir,{recursive:true});
 const keyPath=resolve(certdir,'localhost.key'),certPath=resolve(certdir,'localhost.crt');
 if(!existsSync(keyPath)||!existsSync(certPath)){
  const pem=await selfsigned.generate([{name:'commonName',value:'localhost'}],{keySize:2048,days:1,extensions:[{name:'subjectAltName',altNames:[{type:2,value:'localhost'},{type:7,ip:'127.0.0.1'}]}]});
  writeFileSync(keyPath,pem.private);writeFileSync(certPath,pem.cert);
 }
 return https.createServer({key:readFileSync(keyPath),cert:readFileSync(certPath)},handler);
}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const tls=process.argv.includes('--https');const port=Number(process.env.WEB_PORT||4173);
 const server=await createBuiltServer({tls,target:process.env.API_TARGET||'http://127.0.0.1:3001'});
 server.listen(port,'127.0.0.1',()=>console.log(`Built web: ${tls?'https':'http'}://127.0.0.1:${port}`));
}
