import type { AuthSessionSnapshot } from '../../../packages/shared/src/auth/login';
export async function readInitialSession():Promise<AuthSessionSnapshot>{
 const response=await fetch('/api/auth/session',{cache:'no-store'});
 if(!response.ok) throw new Error('会话初始化失败');
 const session=await response.json();
 if(!['guest','authenticated'].includes(session.status)) throw new Error('会话响应无效');
 return session;
}
