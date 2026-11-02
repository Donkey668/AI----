import { beforeAll,beforeEach,afterEach,it,expect,vi } from 'vitest';
import { resolve } from 'node:path';
import { rmSync } from 'node:fs';
import { originalCookieContext } from '../helpers/next-headers';
import { cookies } from '../../apps/api/src/cookies';
import { app } from '../../apps/api/src/app';
import { weather } from '../fixtures/external/responses';

const model=vi.hoisted(()=>({mode:'success',calls:[] as unknown[]}));
const files=vi.hoisted(()=>({mode:''}));
vi.mock('node:fs/promises',async importOriginal=>{
 const real=await importOriginal<typeof import('node:fs/promises')>();
 return {...real,access:async(...args:Parameters<typeof real.access>)=>{
  if(String(args[0]).includes('parkinfo')&&['missing','unreadable'].includes(files.mode))throw Object.assign(new Error('controlled filesystem error'),{code:files.mode==='missing'?'ENOENT':'EACCES'});
  return real.access(...args);
 },readFile:async(...args:Parameters<typeof real.readFile>)=>{
  if(String(args[0]).includes('parkinfo')&&files.mode==='emptySpecies')return '[]';
  if(String(args[0]).includes('parkinfo')&&files.mode==='invalidSpecies')return '{';
  if(String(args[0]).includes('notebooks')&&files.mode==='readError')throw Object.assign(new Error('controlled read error'),{code:'EACCES'});
  return real.readFile(...args);
 },writeFile:async(...args:Parameters<typeof real.writeFile>)=>{
  if(String(args[0]).includes('notebooks')&&files.mode==='writeError')throw new Error('controlled write error');
  return real.writeFile(...args);
 }};
});
const createModel=vi.hoisted(()=>async (payload:any)=>{
 model.calls.push(payload);
 const isImage=Array.isArray(payload.messages[1].content);
 if(model.mode==='failed'||(model.mode==='partial'&&!isImage)) throw new Error('controlled upstream failure');
 const content=isImage?(model.mode==='unrecognized'?{status:'unrecognized'}:{status:'success',speciesNameZh:'白鹭',speciesNameEn:'Little Egret',speciesNameLa:'Egretta garzetta'}):{traits:'体羽白色。',habits:'常在湿地觅食。',distribution:'分布于深圳湿地。',protection:'请遵循当地保护规定。'};
 if(payload.stream)return(async function*(){yield{choices:[{delta:{reasoning_content:'controlled reasoning'}}]};yield{choices:[{delta:{content:JSON.stringify(content)}}]};})();
 return {choices:[{message:{content:JSON.stringify(content)}}]};
});
vi.mock('../../apps/api/src/lib/ai/dashscope-client',()=>({getDashScopeClient:()=>({chat:{completions:{create:createModel}}})}));
vi.mock('../../.migration/baseline/lib/ai/dashscope-client',()=>({getDashScopeClient:()=>({chat:{completions:{create:createModel}}})}));

const base=resolve('.migration/baseline');
const originals:Record<string,any>={};
beforeAll(async()=>{
 const spy=vi.spyOn(process,'cwd').mockReturnValue(base);
 const entries=await Promise.all([
  import('../../.migration/baseline/app/api/auth/login/route'),import('../../.migration/baseline/app/api/auth/logout/route'),
  import('../../.migration/baseline/app/api/analysis/birding-outlook/route'),import('../../.migration/baseline/app/api/analysis/forecast-warning/route'),
  import('../../.migration/baseline/app/api/analysis/habitat-species-reference/route'),import('../../.migration/baseline/app/api/identify/bird-recognition/route'),
  import('../../.migration/baseline/app/api/records/location/resolve/route'),import('../../.migration/baseline/app/api/records/notebook/route'),
  import('../../.migration/baseline/app/api/records/notebook/[recordId]/route'),
 ]);
 ['auth/login','auth/logout','analysis/birding-outlook','analysis/forecast-warning','analysis/habitat-species-reference','identify/bird-recognition','records/location/resolve','records/notebook','records/notebook/:recordId'].forEach((p,i)=>originals['/api/'+p]=entries[i]);
 spy.mockRestore();
 for(const dir of [base,resolve('apps/api')]) for(const account of ['MIGRATION_A','MIGRATION_B']) rmSync(resolve(dir,'data/notebooks',Buffer.from(account).toString('hex')+'.json'),{force:true});
});
beforeEach(()=>{
 model.mode='success';model.calls=[];files.mode='';
 vi.useFakeTimers({toFake:['Date']});vi.setSystemTime(new Date('2026-11-02T00:00:00Z'));
 vi.spyOn(crypto,'randomUUID').mockReturnValue('00000000-0000-4000-8000-000000000123');
});
afterEach(()=>{vi.unstubAllGlobals();vi.unstubAllEnvs();});
async function originalRequest(path:string,init:RequestInit={}){
 const request=new Request('http://localhost'+path,init) as Request&{nextUrl:URL};request.nextUrl=new URL(request.url);
 const key=new URL(request.url).pathname;const route=originals[key]||originals['/api/records/notebook/:recordId'];
 const jar=cookies(request);
 return originalCookieContext.run(jar,async()=>jar.apply(await route[init.method||'GET'](request,{params:Promise.resolve({recordId:key.split('/').at(-1)})})));
}
function normal(value:any):any{
 if(Array.isArray(value))return value.map(normal);
 if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).map(([k,v])=>[k,k==='recordId'||k==='deletedRecordId'?'UUID':k==='modelName'&&['qwen3.6-plus','qwen3.8-flash'].includes(String(v))?'user-approved-identify-model':normal(v)]));
 return value;
}
async function compare(path:string,init:RequestInit={},expectedStatus?:number){
 const old=await originalRequest(path,init);const next=await app.request('http://localhost'+path,init);
 if(expectedStatus)expect(next.status).toBe(expectedStatus);
 expect(next.status).toBe(old.status);
 expect(normal(await next.clone().json())).toEqual(normal(await old.clone().json()));
 for(const h of ['cache-control','content-language','content-type']) expect(next.headers.get(h)).toBe(old.headers.get(h));
 return {old,next};
}
const json=(body:unknown,method='POST',cookie?:string):RequestInit=>({method,headers:{'Content-Type':'application/json',...(cookie?{Cookie:cookie}:{})},body:JSON.stringify(body)});
async function pairedLogin(){
 const {old,next}=await compare('/api/auth/login',json({assistantAccount:'MIGRATION_A',userPassword:'MigrationTest1'}),200);
 return {old:old.headers.get('set-cookie')!.split(';')[0],next:next.headers.get('set-cookie')!.split(';')[0]};
}
it.each([{},null,{assistantAccount:'missing',userPassword:'x'},{assistantAccount:'MIGRATION_A',userPassword:'wrong'},{assistantAccount:' MIGRATION_A ',userPassword:' MigrationTest1 '}])('login differential %j',async body=>{
 const {old,next}=await compare('/api/auth/login',json(body));
 const scrub=(s:string|null)=>s?.replace(/wtb_auth_session=[^;]+/,'wtb_auth_session=UUID');
 expect(scrub(next.headers.get('set-cookie'))).toBe(scrub(old.headers.get('set-cookie')));
});
it('malformed JSON',()=>compare('/api/auth/login',{method:'POST',body:'{',headers:{'Content-Type':'application/json'}},400));
it('unauthenticated records methods and location validation',async()=>{
 await compare('/api/records/notebook',{},401);await compare('/api/records/notebook',json({}),401);
 for(const method of ['PATCH','DELETE'])await compare('/api/records/notebook/nope',{method},401);
 await compare('/api/records/location/resolve?longitude=181&latitude=22&source=device',{},400);
});
it('complete records isolation, CRUD, malformed and missing records',async()=>{
 const login=await pairedLogin();
 async function pair(path:string,method:string,body?:any,status=200){
  const request=(cookie:string)=>body===undefined?{method,headers:{Cookie:cookie}}:json(body,method,cookie);
  const a=await originalRequest(path,request(login.old));const b=await app.request('http://localhost'+path,request(login.next));
  expect(b.status).toBe(status);expect(b.status).toBe(a.status);expect(normal(await b.clone().json())).toEqual(normal(await a.clone().json()));return b.json();
 }
 await pair('/api/records/notebook','GET');await pair('/api/records/notebook','POST',{},400);
 const input={observationDate:'2026-11-02',observationTime:'08:00',birdPoint:'深圳湾',speciesName:'白鹭',note:'hello',locationSource:'manual',coordinates:null};
 await pair('/api/records/notebook','POST',input,201);await pair('/api/records/notebook','GET');
 await pair('/api/records/notebook/00000000-0000-4000-8000-000000000123','PATCH',{...input,note:'edited'});
 await pair('/api/records/notebook/missing','PATCH',input,404);await pair('/api/records/notebook/missing','DELETE',undefined,404);
 await pair('/api/records/notebook/00000000-0000-4000-8000-000000000123','DELETE');
 const accountB=await app.request('/api/auth/login',json({assistantAccount:'MIGRATION_B',userPassword:'MigrationTest2'}));
 const b=await app.request('/api/records/notebook',{headers:{Cookie:accountB.headers.get('set-cookie')!.split(';')[0]}});
 expect((await b.json()).notebook?.records||[]).toEqual([]);
 const a=await originalRequest('/api/auth/logout',{method:'POST',headers:{Cookie:login.old}});
 const bLogout=await app.request('/api/auth/logout',{method:'POST',headers:{Cookie:login.next}});
 expect(await bLogout.json()).toEqual(await a.json());expect(bLogout.headers.get('set-cookie')).toBe(a.headers.get('set-cookie'));
});
it.each(['birding-outlook','forecast-warning','habitat-species-reference'])('invalid park %s',p=>compare('/api/analysis/'+p+'?parkId=unknown',{},400));
it.each(['shenzhen-bay-park','shenzhen-east-lake-park','bijia-mountain-park','fairy-lake-botanical-garden'])('species JSON %s',p=>compare('/api/analysis/habitat-species-reference?parkId='+p+'&view=full',{},200));
it.each([['missing',404],['unreadable',500],['emptySpecies',200],['invalidSpecies',500]] as const)('species source error %s',async(mode,status)=>{
 files.mode=mode;await compare('/api/analysis/habitat-species-reference?parkId=shenzhen-bay-park',{},status);
});
it('notebook filesystem read and write failures',async()=>{
 const login=await pairedLogin();files.mode='readError';
 await compare('/api/records/notebook',{headers:{Cookie:login.next}},500);
 files.mode='writeError';await compare('/api/records/notebook',json({observationDate:'2026-11-02',observationTime:'08:00',birdPoint:'test',speciesName:'test'},'POST',login.next),500);
});
it('weather success, partial and upstream failure',async()=>{
 vi.stubEnv('AMAP_WEATHER_KEY','fixture');
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json(weather)));
 await compare('/api/analysis/birding-outlook?parkId=shenzhen-bay-park',{},200);
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({...weather,lives:[{...weather.lives[0],weather:'unknown-weather'}]})));
 const {next}=await compare('/api/analysis/birding-outlook?parkId=shenzhen-bay-park',{},200);expect((await next.json()).requestStatus).toBe('partial');
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('',{status:503})));
 await compare('/api/analysis/birding-outlook?parkId=shenzhen-bay-park',{},502);
});
it('forecast failure and location fallback/success',async()=>{
 vi.stubEnv('SZ_WEATHER_APP_KEY','fixture');vi.stubEnv('X_QW_API_KEY','fixture');vi.stubEnv('AMAP_WEATHER_KEY','fixture');
 vi.stubGlobal('fetch',vi.fn(async()=>new Response('',{status:503})));
 await compare('/api/analysis/forecast-warning?parkId=shenzhen-bay-park',{},502);
 await compare('/api/records/location/resolve?longitude=114&latitude=22&source=map',{},200);
 vi.stubGlobal('fetch',vi.fn(async()=>Response.json({status:'1',regeocode:{formatted_address:'深圳湾公园',addressComponent:{district:'南山区'}}})));
 await compare('/api/records/location/resolve?longitude=114&latitude=22&source=device',{},200);
});
it('forecast success, empty and partial aggregation',async()=>{
 vi.stubEnv('SZ_WEATHER_APP_KEY','fixture');vi.stubEnv('X_QW_API_KEY','fixture');
 const data=(url:string)=>url.includes('339779363')?[{AREANAME:'南山区',FORECASTTIME:'2026-11-02 09:00:00',WEATHERSTATUS:'晴',QPFTEMP:'23'}]:url.includes('1964883385')?[{FORECASTDATE:'2026-11-02',WEATH:'晴',MINTEMP:'20',MAXTEMP:'25'}]:url.includes('1214604037')?[{DDATETIME:'2026-11-02',ATTRIBNAME:'日出',ATTRIBVALUE:'06:30'}]:{alerts:[],metadata:{zeroResult:true}};
 vi.stubGlobal('fetch',vi.fn(async(url:any)=>Response.json(data(String(url)))));
 await compare('/api/analysis/forecast-warning?parkId=shenzhen-bay-park',{},200);
 vi.stubGlobal('fetch',vi.fn(async(url:any)=>String(url).includes('339779363')?new Response('',{status:503}):Response.json(data(String(url)))));
 const {next}=await compare('/api/analysis/forecast-warning?parkId=shenzhen-bay-park',{},200);expect((await next.json()).requestStatus).toBe('partial');
});
it('image invalid/empty/too large',async()=>{
 for(const image of [null,new File(['text'],'x.txt',{type:'text/plain'}),new File([],'empty.png',{type:'image/png'}),new File([new Uint8Array(10*1024*1024+1)],'large.png',{type:'image/png'})]){
  const data=new FormData();if(image)data.set('image',image);await compare('/api/identify/bird-recognition',{method:'POST',body:data},400);
 }
});
it.each(['success','partial','unrecognized','failed'])('image model %s',async mode=>{
 model.mode=mode;const data=new FormData();data.set('image',new File([new Uint8Array([1,2,3])],'bird.png',{type:'image/png'}));
 const {next}=await compare('/api/identify/bird-recognition',{method:'POST',body:data},mode==='failed'?502:200);
 expect((await next.json()).requestStatus).toBe(mode);
 const half=model.calls.length/2;
 const oldCalls=model.calls.slice(0,half) as any[];
 for(const [i,call] of (model.calls.slice(half) as any[]).entries()){
  expect(call).toEqual({...oldCalls[i],model:'qwen3.8-flash',stream:true,enable_thinking:true,preserve_thinking:false});
 }
});
