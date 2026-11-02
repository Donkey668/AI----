# Quickstart / Validation Guide

本地迁移已实现。真实服务联调依用户决定留待配置后继续；受控测试与真实联调分开记录。

## 环境与安装

Node.js 22.12+ 受支持版本、npm、Git。当前验证 Node.js 24.14.1。
在项目根目录使用 PowerShell：

```powershell
npm.cmd install
npm.cmd run baseline:export
npm.cmd run data:prepare
npx.cmd playwright install chromium
```

基准导出仅用于对照测试，读取原型锁定 Git 对象。正常运行应用不必导出基准。
账号和笔记只用合成数据；原型目录只读，绝不复制原账号/笔记内容。

## 浏览器开发

```powershell
npm.cmd run dev:api
# 另一终端
npm.cmd run dev:web
```

打开 http://127.0.0.1:5173 ，API 端口 3001。WEB_PORT/API_TARGET 可在前端 .env.local 配置；PORT 在后端配置。
账号 MIGRATION_A / MigrationTest1、MIGRATION_B / MigrationTest2 仅测试使用。

## 配置与联调延期

apps/web/.env.example → .env.local，仅填写 VITE_AMAP_KEY、VITE_AMAP_SECURITY_JS_CODE、VITE_AMAP_SERVICE_HOST 等公共配置。
apps/api/.env.example → .env，填写 AMAP_WEATHER_KEY、DASHSCOPE_API_KEY、SZ_WEATHER_APP_KEY、QWEATHER_API_HOST、X_QW_API_KEY；保留 NEXT_PUBLIC_AMAP_KEY 作为原位置解析后备配置。
不复制原工作区 .env，不输出密钥。运行 npm.cmd run env:check 检查存在状态，配置变更后重启。
没有配置时会显示原缺配置/失败状态；真实服务联调、地图点击与真实定位等待配置完成。

## 回归与构建

```powershell
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:parity
npm.cmd run test:contracts
npm.cmd run test:e2e
npm.cmd run build
npm.cmd run test:built
npm.cmd run audit:migration
```

预期：22 项规则差分、30 项接口测试、6 项浏览器测试通过。
E2E 自动使用独立原组件宿主；宿主仅作组件/CSS 对照，不声称原 Next 全运行栈验证。
API 差分在请求作用域桥接下运行原 route.ts，固定时间/UUID/外部模型边界响应，保留原源码不改。
构建验证自动启动隔离端口与本地自签 HTTPS，核验 Secure Cookie、刷新、重启失效和笔记持久化，不安装系统证书。
截图、E2E JSON、HTTPS 结果在 test-results/；行为与适配对照见 behavior-matrix.md、adapter-audit.md、validation-report.md。

## 手动验收

三屏/四公园与鸟种、本地账号登录/刷新/退出、两账号记录隔离、增改删、100 字备注/坐标/北京时间规则、TXT 文件名及内容、桌面提示/横屏限制均按原流程验证。
图片 success/partial/unrecognized/failed 的受控响应已验证，真实鸟类识别仍需模型配置。
生产运行使用 npm.cmd run start:api 和 npm.cmd run start:web；生产 Cookie 保持 Secure，需要 HTTPS 同源环境。
Electron 与手机安装包不在本轮范围。必要逻辑变更先报告并等待决定。
