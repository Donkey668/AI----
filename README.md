# AI 观鸟助手

按原型提交 `9ba9f18` 等价迁移为 Vite/React 前端与独立 Node/Hono 后端。本轮使用浏览器验证，Electron 和手机套壳留到后续阶段。

## 本地启动

需要 Node.js 22.12+ 的受支持版本、npm。在项目根目录执行（PowerShell 使用 npm.cmd）：

```powershell
npm.cmd install
npm.cmd run data:prepare
npm.cmd run dev:api
```

另一终端执行：

```powershell
npm.cmd run dev:web
```

打开 http://127.0.0.1:5173 。API 默认端口 3001。
独立测试账号：`MIGRATION_A / MigrationTest1`、`MIGRATION_B / MigrationTest2`；仅用于本地测试。
测试账号由 tests/fixtures/accounts.json 生成到忽略跟踪的运行数据目录，准备脚本不覆盖已存在文件。

## 服务配置

将 apps/web/.env.example 复制为 apps/web/.env.local，apps/api/.env.example 复制为 apps/api/.env，再本地填写。
前端仅公开 VITE_AMAP_KEY、VITE_AMAP_SECURITY_JS_CODE、VITE_AMAP_SERVICE_HOST；天气/气象/DashScope 密钥放后端。
运行 `npm.cmd run env:check` 只显示配置存在状态，不打印值。修改环境配置后重启对应服务。
界面的缺配置提示保留原型 NEXT_PUBLIC_* 文案；新前端配置应填写其对应 VITE_AMAP_* 名称。
当前真实服务联调依用户决定延期；未配置时地图、天气或识别显示原错误状态，鸟种参考和账户记录可本地运行。

鸟类识别与百科当前使用 `qwen3.8-flash`，地址为 `https://cn-beijing.maas.qianwenaiapi.com/compatible-mode/v1`。
后端以流式思考模式调用，仅拼接最终回答，继续返回网页原有 JSON；每次请求仅带当前任务数据和固定格式指令，不带历史图片/对话/回答。百科请求仅包含本次识别出的鸟名。

## 验证与构建

```powershell
npm.cmd run baseline:export
npm.cmd run data:prepare
npm.cmd run typecheck
npm.cmd run lint
npm.cmd run test:parity
npm.cmd run test:contracts
npm.cmd run test:e2e
npm.cmd run build
npm.cmd run test:built
npm.cmd run audit:migration
```

首次 E2E 需要 `npx.cmd playwright install chromium`。基准验证依赖原型仓库的锁定 Git 对象，原型仅只读。
单独使用应用不需要导出基准。`migrate-source.mjs` 是首次转写工具，不应在正常开发中重复运行以免覆盖已编辑模块。
`test:built` 自动启动隔离端口 API/HTTPS 静态宿主，使用临时自签名证书验证 Secure Cookie，不会安装系统信任证书。
生产配置下需 HTTPS 同源代理，不能为了 HTTP 测试关闭 Secure。

已构建应用可用 `npm.cmd run start:api` 和 `npm.cmd run start:web` 双进程运行；后者默认 4173，`--https` 启用本地 HTTPS。
详细验收范围、结果和待联调项见 [验证报告](specs/001-migrate-bird-prototype/validation-report.md)。
