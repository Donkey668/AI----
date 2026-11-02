import { AsyncLocalStorage } from 'node:async_hooks';
import { cookies as requestCookies } from '../../apps/api/src/cookies';
export const originalCookieContext=new AsyncLocalStorage<ReturnType<typeof requestCookies>>();
export async function cookies(){
 const store=originalCookieContext.getStore();
 if(!store) throw new Error('Missing isolated baseline request context');
 return store;
}
