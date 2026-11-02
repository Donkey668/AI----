import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeFileSync,mkdirSync } from 'node:fs';
import { chromium } from '@playwright/test';
import assert from 'node:assert/strict';
import { createBuiltServer } from './serve-built.mjs';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
let api;
async function startApi(){
 api=spawn(process.execPath,[resolve(root,'apps/api/dist/server.mjs')],{env:{...process.env,PORT:'3101',NODE_ENV:'production'},stdio:['ignore','pipe','pipe'],windowsHide:true});
 let stderr='';api.stderr.on('data',d=>stderr+=d);api.stdout.on('data',()=>{});
 for(let i=0;i<100;i++){
  if(api.exitCode!==null)throw new Error(stderr);
  try{if((await fetch('http://127.0.0.1:3101/api/auth/session')).ok)return;}catch{/* API may not be listening yet. */}
  await new Promise(r=>setTimeout(r,100));
 }
 throw new Error('API start timeout '+stderr);
}
async function stopApi(){if(api&&api.exitCode===null){const exited=once(api,'exit');api.kill();await exited;}}
const server=await createBuiltServer({tls:true,target:'http://127.0.0.1:3101'});
let browser;let recordId;
try{
 await startApi();server.listen(4174,'127.0.0.1');await once(server,'listening');
 browser=await chromium.launch();const context=await browser.newContext({ignoreHTTPSErrors:true});const page=await context.newPage();
 const url='https://127.0.0.1:4174';const request=context.request;
 await page.goto(url);await page.getByRole('button',{name:'我知道了'}).click();
 const login=await request.post(url+'/api/auth/login',{data:{assistantAccount:'MIGRATION_B',userPassword:'MigrationTest2'}});assert.equal(login.status(),200);
 const cookie=(await context.cookies()).find(c=>c.name==='wtb_auth_session');assert.ok(cookie?.secure&&cookie.httpOnly);assert.equal(cookie.sameSite,'Lax');
 await page.reload();await page.getByRole('button',{name:'我知道了'}).click();await page.getByRole('button',{name:'当前登录用户 @MIGRATION_B'}).filter({visible:true}).waitFor();
 const created=await request.post(url+'/api/records/notebook',{data:{observationDate:'2026-11-02',observationTime:'08:00',birdPoint:'build-test',speciesName:'build-test',note:'',locationSource:'manual',coordinates:null}});
 assert.equal(created.status(),201);const body=await created.json();
 recordId=body.record?.recordId; // Read response shape from the original presenter.
 if(!recordId){const list=await (await request.get(url+'/api/records/notebook')).json();recordId=list.notebook?.records?.find(r=>r.speciesName==='build-test')?.recordId;}
 assert.ok(recordId,'created record id');
 await stopApi();await startApi();
 assert.equal((await (await request.get(url+'/api/auth/session')).json()).status,'guest');
 await request.post(url+'/api/auth/login',{data:{assistantAccount:'MIGRATION_B',userPassword:'MigrationTest2'}});
 const snapshot=await (await request.get(url+'/api/records/notebook')).json();
 assert.ok(snapshot.notebook.records.some(r=>r.recordId===recordId),'JSON notebook survives API restart');
 await request.delete(url+'/api/records/notebook/'+recordId);
 await page.screenshot({path:resolve(root,'test-results/built-https.png')});
 mkdirSync(resolve(root,'test-results'),{recursive:true});writeFileSync(resolve(root,'test-results/built-verification.json'),JSON.stringify({https:true,secureCookie:true,refresh:true,restartLosesSession:true,restartKeepsNotebook:true},null,2));
 console.log('PASS built HTTPS, Secure cookie, refresh session, restart invalidation and JSON persistence');
}finally{await browser?.close();await stopApi();server.close();}
