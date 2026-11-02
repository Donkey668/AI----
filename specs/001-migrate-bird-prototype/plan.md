# Implementation Plan: 原型等价迁移

**Branch**: 未创建功能分支；目录标识为 `001-migrate-bird-prototype` | **Date**: 2026-11-02 | **Spec**: [spec.md](spec.md)

**Input**: `specs/001-migrate-bird-prototype/spec.md`

## Summary

以提交 `9ba9f18e18e29826ac6fc6694b5a873d015bbdf8` 为唯一基准，转写为 Vite/React 前端和独立 Node/Hono 后端。
保留组件、样式、业务函数、提示词、数据规则和响应分支；本轮仅验收浏览器，不交付容器或安装包，不导入原账户和记录。

## Technical Context

**Language/Version**: TypeScript 5.x，React/React DOM 19.2.4，Node.js 22.12+ 受支持版本。
**Primary Dependencies**: Vite、@vitejs/plugin-react、Hono、@hono/node-server、tsx；沿用原 Radix、Tailwind 4、OpenAI SDK、高德 loader。实施时核验兼容版本并锁定依赖，不无理由升级业务依赖。
**Storage**: 内存会话 Map、本地 JSON 账号库与按账号编码的笔记文件；账号和笔记仅用合成测试数据；公园鸟种使用提交中的 parkinfo JSON。
**Testing**: Vitest 差分和接口集成、Playwright 浏览器流程/截图；固定时间、UUID、外部响应的控制仅用于测试。
**Target Platform**: Windows 本地开发，现代桌面浏览器和手机尺寸验证；Electron/Capacitor 后续实施。
**Project Type**: npm workspaces，独立 web/api 应用与纯共享包。
**Performance Goals**: 保留基准超时、重试、缓存和交互时序；在同环境受控输入下对比主要交互耗时，报告退化，不虚构并发指标。
**Constraints**: 原型只读、锁定提交、零未授权逻辑变更、测试数据隔离、服务端配置不进入前端。
**Scale/Scope**: 分析/识别/记录三屏、4 公园、9 个原路由文件共 11 个 HTTP 操作，加 1 个会话初始化适配接口。

## Constitution Check

| Gate | 研究前 | 设计后 | 依据 |
|---|---|---|---|
| 前后端分离 | PASS | PASS | Vite 与 Hono 分进程，/api 经代理 |
| 多端复用 | PASS | PASS | Web 不依赖容器，后续复用 |
| 浏览器优先 | PASS | PASS | quickstart 直接运行浏览器 |
| 缺依赖先告知 | PASS | PASS | 安装受阻先报告，不静默降级 |
| 原逻辑不变 | PASS | PASS（设计） | 业务模块复用，仅框架适配，待实施差分验证 |
| 数据/来源隔离 | PASS | PASS | 仅锁定提交，排除原账户笔记 |

尚未发现必须改变业务逻辑的原因。实施发现无法等价适配时，停止受影响项，先报告并等待用户决定。
原型 430px 窄屏、桌面提示、横屏限制保持不变；开发文档 PC 分栏不纳入本轮。

## Project Structure

### Documentation (this feature)

```text
specs/001-migrate-bird-prototype/
  spec.md
  plan.md
  research.md
  data-model.md
  contracts/http-api.md
  contracts/ui-parity.md
  quickstart.md
  checklists/requirements.md
```

### Source Code (repository root)

以下为待实施结构，尚未创建：

```text
apps/web/              # Vite、组件/CSS、静态资源
apps/api/              # Hono 路由、原服务端 lib、parkinfo、独立 data
packages/shared/       # 纯类型/常量/纯函数
scripts/               # 基准提取、环境检查
tests/
  fixtures/
  parity/
  contracts/
  e2e/
```

**Structure Decision**: npm workspaces 分离 web/api，共享包禁止引入 fs、node:crypto、账号库、会话 Map 或私密环境变量。

## Phase 0: Research

已从锁定提交盘点耦合与接口，见 research.md。未读取原型私密配置。
.env.example 不在锁定提交内，不复制工作区版本；Python Excel 脚本已废弃，不需 openpyxl。

## Phase 1: Design

1. 从 Git 对象导出隔离基准到当前项目内，按清单选取源码和资源；排除原 .agents/.specify/specs、真实账号笔记及缓存。
2. 复用 React/CSS，局部适配 next/image、字体和 HTML 入口，保持 Geist 字体与原尺寸/交互。
3. Hono 使用标准 Request/Response；nextUrl 替换标准 URL；请求级 Cookie 适配保留原属性。
4. 新增 GET /api/auth/session 替代首屏服务端会话注入，取得快照后才挂载 MobileShell，避免游客闪现；失败允许重试，不伪造认证状态。
5. 将 GUEST_AUTH_SESSION 等共享纯值从服务端模块隔离；避免前端引入账号库、内存 Map 或 node:crypto。
6. 后端明确资源根目录，保留 JSON 文件结构/账号编码规则，合成数据不指向原型。
7. Vite 开发代理和构建后的同源反向代理保留相对 URL/Cookie；production Secure 不因 HTTP 调试关闭。
8. 对每个来源模块记录目标位置、适配差异与验证结果，契约见 contracts/。

本命令到设计阶段结束；不生成 tasks.md，不编写应用实现。

## Validation Strategy

差分覆盖账号校验、坐标、100 字备注、北京时间、排序和 TXT 导出；HTTP 覆盖全部 11 个原操作和会话适配。
状态码、字段、文案、空值、关键头与 Cookie 必须一致；只正规化时间/UUID 等非确定值。
受控服务回放覆盖成功/局部成功/失败/空态，真实服务单独联调，缺配置明确阻塞。
基准如需运行，使用当前项目内独立导出副本和合成数据，不能在原工作目录启动可写服务。

## Complexity Tracking

无章程例外。会话读取接口是替代框架首屏注入的运输适配，不新增产品功能。
