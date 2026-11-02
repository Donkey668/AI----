import { it,expect,vi } from 'vitest';
import { app } from '../../apps/api/src/app';
import { getAuthSessionCookieOptions } from '../../apps/api/src/lib/auth/session-store';
it('guest, forged cookie, login, refresh, logout',async()=>{
 for(const cookie of ['', 'wtb_auth_session=forged']) {
  const r=await app.request('/api/auth/session',{headers:{Cookie:cookie}});
  expect(r.headers.get('cache-control')).toBe('no-store');
  expect(await r.json()).toEqual({status:'guest',assistantAccount:null,authenticatedAt:null});
 }
 const login=await app.request('/api/auth/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({assistantAccount:'MIGRATION_A',userPassword:'MigrationTest1'})});
 const cookie=login.headers.get('set-cookie')!.split(';')[0];
 for(let i=0;i<2;i++){
  const r=await app.request('/api/auth/session',{headers:{Cookie:cookie}});
  expect((await r.json()).assistantAccount).toBe('MIGRATION_A');expect(r.headers.has('set-cookie')).toBe(false);
 }
 await app.request('/api/auth/logout',{method:'POST',headers:{Cookie:cookie}});
 expect((await (await app.request('/api/auth/session',{headers:{Cookie:cookie}})).json()).status).toBe('guest');
});
it('production secure cookie remains enabled',()=>{
 vi.stubEnv('NODE_ENV','production');expect(getAuthSessionCookieOptions()).toEqual({httpOnly:true,sameSite:'lax',path:'/',secure:true,maxAge:604800});vi.unstubAllEnvs();
});
