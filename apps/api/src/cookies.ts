import { parse, serialize, type CookieOptions } from 'hono/utils/cookie';

// Per-request state only. Mirrors the subset of next/headers used by the baseline.
export function cookies(request: Request) {
  const values = parse(request.headers.get('cookie') || '');
  const mutations: string[] = [];
  return {
    get(name: string) { return values[name] === undefined ? undefined : {name,value:values[name]}; },
    set(name: string,value: string,options: CookieOptions) {
      mutations.push(serialize(name,value,options));
    },
    delete(name: string) {
      mutations.push(serialize(name,'',{path:'/',expires:new Date(0)}));
    },
    apply(response: Response) {
      for(const cookie of mutations) response.headers.append('Set-Cookie',cookie);
      return response;
    },
  };
}
