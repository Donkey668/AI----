import { readFileSync,writeFileSync,existsSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { resolve,dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const dir=resolve(root,'specs/001-migrate-bird-prototype');
const manifest=JSON.parse(readFileSync(resolve(dir,'baseline-manifest.json'),'utf8'));
const maps=JSON.parse(readFileSync(resolve(dir,'source-mapping.json'),'utf8'));
const status=execFileSync('git',['-C',manifest.source,'status','--porcelain=v1','-uall']).toString('utf8');
const changed=Object.entries(manifest.worktreeHashes).filter(([path,hash])=>{
 const p=resolve(manifest.source,path);return (existsSync(p)?createHash('sha256').update(readFileSync(p)).digest('hex'):null)!==hash;
}).map(([p])=>p);
const missing=maps.filter(m=>!existsSync(resolve(root,m.target)));
const exact=maps.filter(m=>existsSync(resolve(root,m.target))&&readFileSync(resolve(root,'.migration/baseline',m.source)).equals(readFileSync(resolve(root,m.target))));
const result={commit:manifest.commit,sourceStatusUnchanged:status===manifest.initialStatus,sourceWorktreeChanges:changed,mappedCount:maps.length,byteIdenticalCount:exact.length,missingTargets:missing};
writeFileSync(resolve(dir,'source-audit.json'),JSON.stringify(result,null,2)+'\n');
let report='# 框架适配审查\n\n基准：`'+manifest.commit+'`。完整映射见 source-mapping.json。\n\n';
report+='适配范围：导入路径/目录分离、移除 server-only 标记（改为 lint/构建边界）、共享纯类型提取、标准 URL 和请求级 Cookie、明确资源根、公共地图环境映射、图片与字体适配、首屏会话运输。\n\n';
report+='路由保留原 route.ts 文件结构以减少 diff，页面组件保留原平铺相邻关系而未按 plan 的分组子目录重排。实际路径以 source-mapping.json 为准；这是目录适配，无业务规则变化。\n\n';
report+='原型存在注册占位、日期仅格式校验、内存会话重启失效等行为，均保留。尚未发现必须修改业务逻辑的事项。\n\n';
report+='用户后续明确授权的模型升级例外：qwen3.8-flash、北京兼容接口、流式思考调用，固定 JSON/网页功能保留；新增 apps/api/src/lib/ai/current-upload-json.ts 保证每次仅当前输入，不回传历史或思考。详见 change-requests.md。此授权不修改原型基准。\n\n';
report+='| 原文件 | 目标文件 | 审查范围 |\n|---|---|---|\n';
for(const m of maps){const same=exact.includes(m);report+=`| ${m.source} | ${m.target} | ${same?'字节相同':'框架/导入适配；参见差分与接口验证'} |\n`;}
report+='\n验证限制：UI 基准以未改动的原组件/CSS 加隔离测试宿主运行，图片、字体和 guest 常量由等价适配提供；不是原 Next.js 运行栈的全量回归。真实外部服务仍待配置。\n';
writeFileSync(resolve(dir,'adapter-audit.md'),report);
console.log(JSON.stringify(result));
if(changed.length||!result.sourceStatusUnchanged||missing.length)process.exitCode=1;
