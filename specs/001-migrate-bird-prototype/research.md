# Research: 原型等价迁移

日期：2026-11-02。证据仅来自锁定提交 9ba9f18 的 git show/ls-tree，未采用工作区差异。

## 前端与后端

**Decision**: Vite + React 19.2.4/Tailwind 4/Radix；独立 Node/Hono API。
**Rationale**: 原单页 MobileShell 内部切换三个页面，不需新路由框架；原 route.ts 大多已使用 Web Request/Response，Hono 减少适配改动。
**Alternatives considered**: 保留 Next 不符合转写目标；Express 需要更多请求/响应桥接；手写 HTTP 重复 multipart/Cookie 处理；重写组件增加回归风险。
证据：app/page.tsx、app/_components/mobile-shell.tsx、app/api/*、package.json。

## 会话与界面

**Decision**: 请求级 Cookie 适配 + GET /api/auth/session，在挂载原组件前取得原 AuthSessionSnapshot。
**Rationale**: 替代 app/page.tsx 的服务端 Cookie 首屏注入；保留刷新登录语义。
**Alternatives considered**: localStorage/JWT/持久会话或先挂载游客都会改变原行为，不采用。
保留 wtb_auth_session、httpOnly、lax、path=/、7 天 maxAge、production Secure、内存 Map；重启失效不修复。
保留 430px 布局、桌面提示、移动横屏限制、280ms 转场及 reduced-motion，不引入 PC 分栏。
next/image 两处局部适配；next/font/google 改加载方式但保留 Geist/Geist Mono，实施时核验资源与截图。

## 数据与依赖

**Decision**: 保留 JSON 存储规则，账号和笔记仅合成测试数据；parkinfo 静态数据取锁定提交。
**Rationale**: 用户明确不迁移历史账户/笔记；即便 Git 跟踪了这些文件也排除其内容。
**Alternatives considered**: 改数据库、导入原账户、补自助注册均超出范围。
证据：lib/auth/login.ts、session-store.ts、lib/records/notebook-repository.ts、lib/species/park-species-sources.ts。
鸟种当前由 Node 读取 JSON，旧 Python Excel 脚本已废弃，无需 Python/openpyxl。
文件资源根必须明确为新项目目录；原 process.cwd() 布局适配不能改变命名或数据规则。

## 配置与外部服务

**Decision**: 仅公开 NEXT_PUBLIC_AMAP_* 对应的 VITE_AMAP_*；后端读取私密配置，测试夹具控制外部响应。
**Rationale**: VITE_ 会进入浏览器，不能整体注入 process.env。
**Alternatives considered**: 模型调用移浏览器、替换模型/提示词/超时、缺配置假成功都会改变边界或逻辑。
后端配置名称：AMAP_WEATHER_KEY、DASHSCOPE_API_KEY、SZ_WEATHER_APP_KEY、QWEATHER_API_HOST、X-QW-Api-Key/X_QW_API_KEY；位置解析保留原公共高德 key 后备值。
.env.example 不在该提交，不复制原工作区 .env；新示例仅列键名，不含秘密。
保持标准 File/formData、image/*、非空和 10MiB 限制，不加会提前改变错误响应的 multipart 中间件。

## 已决事项和实施前提

无未解决的设计澄清项。依赖可安装性、字体资源、真实服务凭据/网络仍需实施核验，不能视为已验证。
受阻先说明依赖与备选代价；不可等价适配必须先报告，不提前试改逻辑。

## Official References

- [Vite proxy](https://vite.dev/config/server-options)：开发代理，生产另设同源反向代理。
- [Vite env](https://vite.dev/guide/env-and-mode)：仅显式公共变量注入前端。
- [Hono Node](https://hono.dev/docs/getting-started/nodejs)：独立 Node 服务与标准 Web API。
- [Hono Request](https://hono.dev/docs/api/request)、[Cookies](https://hono.dev/docs/helpers/cookie)：标准请求和请求级 Cookie。
