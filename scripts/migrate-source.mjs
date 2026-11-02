// One-time mechanical migration. Re-running overwrites generated target modules.
import { readFileSync,writeFileSync,mkdirSync,readdirSync,copyFileSync } from 'node:fs';
import { resolve,dirname,relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const base=resolve(root,'.migration/baseline');
const write=(p,s)=>{mkdirSync(dirname(resolve(root,p)),{recursive:true});writeFileSync(resolve(root,p),s);};
const walk=p=>readdirSync(p,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(resolve(p,e.name)):[resolve(p,e.name)]);
const pure=new Set(['utils','maps/park-options','records/notebook','records/notebook-export','records/notebook-presenter','weather/birding-outlook','time/beijing-time','identify/identify-contract','analysis/analysis-overview']);
const targetLib=p=> pure.has(p)?`packages/shared/src/${p}.ts`:p==='maps/amap-loader'?`apps/web/src/lib/${p}.ts`:`apps/api/src/lib/${p}.ts`;
const mappings=[];
function imports(s,src,dest){
 return s.replace(/(from\s*["'])([^"']+)(["'])/g,(all,a,spec,b)=>{
  let target;
  if(spec.startsWith('@/lib/')) target=targetLib(spec.slice(6));
  else if(spec.startsWith('@/components/')) target='apps/web/src/'+spec.slice(2)+'.tsx';
  else if(spec.startsWith('@/data/')) target='apps/api/'+spec.slice(2);
  else if(spec.startsWith('.')) {
   const abs=resolve(dirname(src),spec);const key=relative(resolve(base,'lib'),abs).replaceAll('\\','/');
   if(src.startsWith(resolve(base,'lib'))) target=targetLib(key);
  }
  if(!target) return all;
  let rel=relative(dirname(resolve(root,dest)),resolve(root,target)).replaceAll('\\','/');
  if(!rel.startsWith('.')) rel='./'+rel;
  return a+rel.replace(/\.tsx?$/,'')+b;
 });
}
for(const src of walk(resolve(base,'lib'))){
 const key=relative(resolve(base,'lib'),src).replaceAll('\\','/').replace(/\.ts$/,'');
 const dest=targetLib(key);let s=readFileSync(src,'utf8');
 s=s.replace('import "server-only";','// Server-only module: enforced by workspace boundary.');
 s=imports(s,src,dest);
 if(key==='maps/amap-loader') s=s.replaceAll('process.env.NEXT_PUBLIC_AMAP_', 'import.meta.env.VITE_AMAP_');
 if(key==='auth/session-resolver') s=s.replace('from "next/headers"','from "../../cookies"').replace('resolveAssistantAccountFromCookies()', 'resolveAssistantAccountFromCookies(request: Request)').replace('cookies()', 'cookies(request)');
 if(key==='records/notebook-repository'||key==='species/park-species-sources'){
  s='import { apiRoot } from "../../config";\n'+s.replaceAll('process.cwd()', 'apiRoot');
 }
 write(dest,s);mappings.push({source:relative(base,src).replaceAll('\\','/'),target:dest,adaptation:s!==readFileSync(src,'utf8')});
}
// Shared type surfaces are extracted verbatim by TypeScript AST, without server code/imports.
for(const key of ['auth/login','weather/sz-forecast-warning','species/habitat-species-reference']) {
 const s=readFileSync(resolve(base,'lib',key+'.ts'),'utf8');const ast=ts.createSourceFile(key,s,ts.ScriptTarget.Latest,true);
 let types=ast.statements.filter(n=>(ts.isTypeAliasDeclaration(n)||ts.isInterfaceDeclaration(n))&&n.modifiers?.some(m=>m.kind===ts.SyntaxKind.ExportKeyword)).map(n=>n.getText(ast)).join('\n\n');
 if(key==='species/habitat-species-reference') types='export const SPECIES_REFERENCE_VIEWS = ["preview", "full"] as const;\ntype ParkSpeciesSourceStatus = "available" | "missing" | "unreadable";\n'+types;
 write(`packages/shared/src/${key}.ts`,types+'\n');
}
write('packages/shared/src/auth/session-store.ts','import type { AuthSessionSnapshot } from "./login";\nexport const GUEST_AUTH_SESSION: AuthSessionSnapshot = { status: "guest", assistantAccount: null, authenticatedAt: null };\n');
for(const src of walk(resolve(base,'app/_components'))){
 const name=relative(resolve(base,'app/_components'),src).replaceAll('\\','/');const dest='apps/web/src/components/'+name;
 let s=readFileSync(src,'utf8');
 s=s.replace(/from "@\/lib\/([^"\n]+)"/g,(_all,key)=>{
  let target=targetLib(key);
  if(['auth/login','auth/session-store','weather/sz-forecast-warning','species/habitat-species-reference'].includes(key)) target=`packages/shared/src/${key}.ts`;
  let rel=relative(dirname(resolve(root,dest)),resolve(root,target)).replaceAll('\\','/').replace(/\.ts$/,'');
  return `from "${rel.startsWith('.')?rel:'./'+rel}"`;
 });
 s=imports(s,src,dest).replace('from "next/image"','from "./image"');
 write(dest,s);mappings.push({source:'app/_components/'+name,target:dest,adaptation:s!==readFileSync(src,'utf8')});
}
for(const src of walk(resolve(base,'components'))){const dest='apps/web/src/components/'+relative(resolve(base,'components'),src).replaceAll('\\','/');write(dest,imports(readFileSync(src,'utf8'),src,dest));mappings.push({source:relative(base,src).replaceAll('\\','/'),target:dest,adaptation:true});}
for(const src of walk(resolve(base,'app/api'))){
 const rel=relative(resolve(base,'app/api'),src).replaceAll('\\','/');const dest='apps/api/src/routes/'+rel;
 let s=imports(readFileSync(src,'utf8'),src,dest).replace('import type { NextRequest } from "next/server";','');
 s=s.replaceAll('request: NextRequest','request: Request').replaceAll('request.nextUrl.searchParams','new URL(request.url).searchParams');
 let cookieRel=relative(dirname(resolve(root,dest)),resolve(root,'apps/api/src/cookies')).replaceAll('\\','/');
 s=s.replace('from "next/headers"',`from "${cookieRel}"`).replaceAll('await cookies()', 'cookies(request)');
 s=s.replace('function GET()', 'function GET(request: Request)').replace('function POST()', 'function POST(request: Request)').replaceAll('_request: Request','request: Request').replaceAll('resolveAssistantAccountFromCookies()', 'resolveAssistantAccountFromCookies(request)');
 // Apply Cookie mutations to the returned standard response, preserving original body/status.
 if(rel.startsWith('auth/')) s=s.replace('return Response.json(', 'return cookieStore.apply(Response.json(').replace(/\n  \}\);\n\}/,'\n  }));\n}').replace(/\n    \},\n  \);\n\}/,'\n    },\n  ));\n}');
 // login's store must exist even when authentication fails.
 if(rel==='auth/login/route.ts') s=s.replace('  if (statusCode === 200','  const cookieStore = cookies(request);\n\n  if (statusCode === 200').replace('    const cookieStore = cookies(request);\n','');
 write(dest,s);mappings.push({source:'app/api/'+rel,target:dest,adaptation:true});
}
for(const area of ['public','parkinfo']) for(const src of walk(resolve(base,area))){const dest=resolve(root,area==='public'?'apps/web/public':'apps/api/parkinfo',relative(resolve(base,area),src));mkdirSync(dirname(dest),{recursive:true});copyFileSync(src,dest);mappings.push({source:relative(base,src).replaceAll('\\','/'),target:relative(root,dest).replaceAll('\\','/'),adaptation:false});}
write('apps/web/src/styles/globals.css',readFileSync(resolve(base,'app/globals.css'),'utf8')+'\n@source "../components";\n');
write('specs/001-migrate-bird-prototype/source-mapping.json',JSON.stringify(mappings,null,2)+'\n');
console.log('Mechanically migrated',mappings.length,'modules/resources; baseline untouched.');
