# Tasks: 原型等价迁移

**Input**: `specs/001-migrate-bird-prototype/` 的 spec、plan、research、data-model、contracts、quickstart。
**Prerequisites**: 章程与三项澄清已生效；源提交固定为 `9ba9f18e18e29826ac6fc6694b5a873d015bbdf8`。
**Tests**: 规格要求等价验证（FR-010、SC-002），因此包含必要的规则差分、接口与浏览器验证；不采用强制 TDD，也不为文档/流程添加镜像测试。
**Organization**: US1 原功能等价迁移；US2 浏览器独立运行与交付；US3 必要变更先告知。三者均为 P1。

**实施补充决定**：用户明确要求先完成本地迁移，真实服务联调留待配置后继续。T033 本轮完成联调配置状态/延期记录与本地耗时对照，不将真实服务记为通过；详见 validation-report.md。

## Format / Path Conventions

任务格式为 `- [ ] Tnnn [P?] [USn?] 描述及文件路径`。[P] 仅表示所述前置条件完成后可并行，不授权自动委派。
全部目标路径相对本项目根目录；原型 `F:\VibeCoding\watch_the_bird` 仅只读。
`.migration/baseline/` 为忽略跟踪的隔离基准副本，仅导出锁定提交允许的文件，不含原账户和笔记。
源到目标映射、行为与变更记录放在 `specs/001-migrate-bird-prototype/`；它们是后续实施产物，当前不假定存在。

## Phase 1: Setup

**Purpose**: 建立受控来源与开发工具，完成后才能复制原实现。

- [X] T001 在 `specs/001-migrate-bird-prototype/baseline-manifest.json` 记录完整提交、Git 树文件清单/对象校验值及原型当前状态摘要；不得输出秘密或改变原型。
- [X] T002 在 `scripts/export-baseline.mjs` 实现按 T001 从 Git 对象读取的允许清单导出到 `.migration/baseline/`，排除原 `.agents/`、`.specify/`、`specs/`、原账号/笔记内容和工作区文件，并在 `.gitignore` 忽略副本、环境文件、测试产物和运行数据（依赖 T001）。
- [X] T003 在 `package.json`、`apps/web/package.json`、`apps/api/package.json`、`packages/shared/package.json` 建立 npm workspaces，安装并锁定计划中的兼容依赖到 `package-lock.json`；保留原业务依赖版本约束，缺依赖先告知，不静默降级（依赖 T002）。
- [X] T004 在 `tsconfig.base.json`、各 workspace 的 `tsconfig.json`、`eslint.config.mjs` 配置类型与 lint 边界，建立根 `typecheck`/`lint` 脚本，禁止 web 导入 api 或服务端模块（依赖 T003）。
- [X] T005 在 `vitest.config.ts`、`playwright.config.ts` 配置差分/接口/浏览器环境及根 `test:parity`、`test:contracts`、`test:e2e` 命令，测试数据与基准运行均限于当前项目（依赖 T004）。

## Phase 2: Foundational

**Purpose**: 先建立业务边界、数据隔离和变更规则，阻塞后续功能迁移。

- [X] T006 在 `specs/001-migrate-bird-prototype/behavior-matrix.md` 依据锁定提交盘点所有入口、算法、原型缺陷/占位、11 个 HTTP 操作、外部依赖及失败分支，逐项关联源路径、目标路径、FR/SC 与验收场景；新增适配接口单列（依赖 T002）。
- [X] T007 在 `specs/001-migrate-bird-prototype/change-requests.md` 建立迁移前规则和空记录表：必要逻辑变更先说明原逻辑、阻碍证据、影响、方案并等待用户决定；记录缺依赖、待决定范围和可继续工作，不提前试改；将此规则作为所有实施任务的前置检查（依赖 T006）。
- [X] T008 [P] 在 `packages/shared/src/` 迁移纯类型/常量/纯函数与 `GUEST_AUTH_SESSION`；快照严格保留“status(guest/authenticated)、assistantAccount、authenticatedAt；游客后两项 null”，不得导入 Map、账号库、fs 或 node:crypto（依赖 T004、T006、T007）。
- [X] T009 [P] 在 `tests/fixtures/accounts.json`、`scripts/prepare-test-data.mjs`、`apps/api/data/` 创建至少两个合成账号与隔离笔记存储，校验所有写入路径在当前项目内；从不复制原账号/笔记数据（依赖 T004、T006、T007）。
- [X] T010 [P] 在 `apps/api/src/config.ts`、`apps/api/.env.example`、`apps/web/.env.example`、`scripts/check-env.mjs` 定义公开高德变量与后端私密配置，保留位置解析原 key 后备规则，仅报告缺失键名，不复制原型 .env 或整体注入 process.env（依赖 T004、T006、T007）。
- [X] T011 在 `apps/api/src/app.ts`、`apps/api/src/server.ts` 建立可独立启动的 Hono/Node 服务和请求级 Cookie/标准 Request/Response 适配；不增加改变原错误响应的统一包装、上传限制或认证规则（依赖 T008、T009、T010）。

**Checkpoint**: 数据不指向原型；来源和变更前置约束可检查；仅基础服务就绪，不代表业务通过。

## Phase 3: User Story 1 — 在新项目中使用原有功能 (Priority: P1)

**Goal**: 原有功能、交互、数据与异常规则等价。
**Independent Test**: 使用隔离基准与目标运行环境，对相同输入/状态/受控服务响应比较输出、状态和浏览器行为。

### 等价验证用例

- [X] T012 [P] [US1] 在 `tests/parity/notebook.test.ts`、`tests/parity/export.test.ts` 建立北京时间、格式校验、备注/坐标、列表排序/摘要与 TXT 排序/文件名差分用例；只固定时间/UUID，不改原逻辑（依赖 Phase 2）。
- [X] T013 [P] [US1] 在 `tests/contracts/legacy-api.test.ts`、`tests/fixtures/external/` 定义全部 11 个原 HTTP 操作及成功/失败回放，对比完整 JSON、状态码、中文文案、空值和关键头；认证/上传边界按 contracts/http-api.md 覆盖（依赖 Phase 2）。

### 模型、服务、接口与界面

- [X] T014 [US1] 在 `apps/api/src/lib/auth/` 迁移原账号校验与会话 Map，使用 T009 合成账号库；保留“按原规则 trim、忽略空项、重复账号 Map 覆盖”与服务重启丢会话，不补自助注册或持久认证。
- [X] T015 [US1] 在 `apps/api/src/routes/auth.ts` 迁移登录/退出及新增 GET /api/auth/session；保持 Cookie HttpOnly、SameSite=Lax、Path=/、Max-Age=604800、production Secure，session 不续期/不泄漏 ID，保留登录原返回体（依赖 T014）。
- [X] T016 [US1] 在 `packages/shared/src/records/`、`apps/api/src/lib/records/` 迁移原验证与仓库；保留“日期时间保持原格式校验，不增强为新日历校验”“鸟点、鸟名 trim 后必填”“备注以 Array.from 计数，最多 100 字”；超限保留原错误（依赖 T008、T009、T014）。
- [X] T017 [US1] 在 `packages/shared/src/records/`、`apps/api/src/routes/records.ts` 迁移位置来源与 GET/POST/PATCH/DELETE 笔记接口；保留“locationSource 为 manual/device/map；manual 不带坐标，其他两种必须有坐标”“经纬度必须有限，经度 -180..180、纬度 -90..90”，以及原认证/校验顺序、归属和 404（依赖 T016、T015）。
- [X] T018 [US1] 在 `apps/api/src/lib/records/`、`apps/api/src/routes/location.ts` 迁移逆地理位置解析，保留 query、key 后备、超时、结果及 400/500；文件笔记保留账号 UTF-8 十六进制文件名，列表降序/摘要规则与原算法（依赖 T017）。
- [X] T019 [P] [US1] 在 `apps/api/src/lib/weather/`、`apps/api/src/lib/ai/`、`apps/api/src/lib/analysis/`、`apps/api/src/routes/analysis.ts` 迁移天气/指数/概览/预报预警；模型、提示词、参数、缓存、超时及局部失败聚合不改（依赖 T013；与 T014–T018 不改同一文件）。
- [X] T020 [P] [US1] 在 `apps/api/parkinfo/`、`apps/api/src/lib/species/`、`apps/api/src/routes/species.ts` 迁移四公园 JSON 和鸟种筛选/排序/去重；保留 missing/unreadable/空集合区别，不引入旧 Python Excel 路径（依赖 T013）。
- [X] T021 [P] [US1] 在 `apps/api/src/lib/identify/`、`apps/api/src/routes/identify.ts` 迁移识别/百科；保留 image/*、非空、10MiB、状态 success/partial/invalid_image/unrecognized/failed 及四节 traits/habits/distribution/protection，识别成功百科失败保留 partial（依赖 T013）。
- [X] T022 [US1] 在 `apps/api/src/app.ts` 注册全部原路径及会话适配接口；标准 URL 和动态参数仅作框架替换，核验 Request/FormData/File/Cookie 不改变处理分支（依赖 T015、T018–T021）。
- [X] T023 [US1] 在 `apps/web/src/components/`、`apps/web/src/styles/`、`apps/web/public/` 迁移原 shell、UI 和资源，保持三屏、默认页、430px 窄屏、桌面提示、横屏限制、280ms/reduced-motion 及连续切换逻辑，不引入桌面分栏（依赖 T008）。
- [X] T024 [US1] 在 `apps/web/src/components/image.tsx`、`apps/web/src/styles/fonts.css`、`apps/web/index.html` 适配 next/image、Geist/Geist Mono 和原 HTML metadata，保持尺寸/比例/预览，无法取得依赖先告知，不静默换字体（依赖 T023）。
- [X] T025 [US1] 在 `apps/web/src/main.tsx`、`apps/web/src/session-bootstrap.ts` 将 Cookie 首屏注入改为挂载前 session 读取，失败提示启动受阻并可重试，不先渲染游客或改登录协议（依赖 T015、T024）。
- [X] T026 [US1] 在 `apps/web/src/components/analysis/`、`apps/web/src/lib/maps/` 迁移公园选择/地图/天气/鸟种/预警界面和公共配置映射，保持原组件状态与请求竞态处理（依赖 T019、T020、T025）。
- [X] T027 [US1] 在 `apps/web/src/components/identify/` 迁移上传、预览、结果/百科与所有失败状态，沿用原表单和接口（依赖 T021、T026）。
- [X] T028 [US1] 在 `apps/web/src/components/records/`、`packages/shared/src/records/notebook-export.ts` 迁移账户入口/记录弹窗/增改删/三种定位/TXT 下载；保留未认证提醒、原导出升序 tie-break、“清洗后的账号的观鸟记录.txt”、UTF-8 文本/换行及列表不同排序（依赖 T018、T027）。
- [X] T029 [US1] 运行 T012/T013 对照与 `tests/contracts/session.test.ts` 会话验证，覆盖刷新、注销、伪造 Cookie、跨账号及重启失效；结果逐项记录 `specs/001-migrate-bird-prototype/behavior-matrix.md`，失败不得计为通过（依赖 T022、T028）。

**Checkpoint**: US1 在独立服务和验证宿主中可对照运行，核心功能等价结果有证据；尚不能省略 US2 交付验证。

## Phase 4: User Story 2 — 按章程验证与交付 (Priority: P1)

**Goal**: 不依赖容器，前后端独立启动并在浏览器验收。
**Independent Test**: 从干净安装环境按 quickstart 启动两个进程，跑浏览器流程与构建产物验证。

- [X] T030 [US2] 在 `apps/web/vite.config.ts`、根 `package.json` 建立 `dev:web`、`dev:api`、`build` 和可配置 5173/3001 端口及 /api 同源代理，保持相对请求与 Cookie 行为（依赖 T022、T025）。
- [X] T031 [US2] 在 `scripts/serve-built.mjs`、`scripts/verify-built.ps1` 配置构建后静态宿主与独立 API 的同源代理验证；生产 Cookie 使用本地 HTTPS 证书，不关闭 Secure，证书获取受阻明确记录（依赖 T030）。
- [X] T032 [US2] 在 `tests/e2e/parity.spec.ts`、`tests/e2e/download.spec.ts` 验证三屏/四公园/登录记录/上传/TXT，覆盖手机竖横屏、桌面提示、字体/图片截图和 reduced-motion；对照 T006 基准与契约（依赖 T029、T030）。
- [X] T033 [US2] 在 `specs/001-migrate-bird-prototype/validation-report.md` 记录真实高德/天气/气象/模型联调、浏览器交互耗时对比、配置缺失与未验证项；受控回放不得冒充真实联调（依赖 T032）。
- [X] T034 [US2] 执行类型、lint、差分、接口、E2E 和构建验证，核查前端产物无账号库/后端秘密/Node 模块，更新 `specs/001-migrate-bird-prototype/validation-report.md` 和 `quickstart.md` 为实际可复现命令（依赖 T031、T033）。

**Checkpoint**: 浏览器交付和构建验证均有结果；未通过或受阻明确保留，不宣称全量完成。

## Phase 5: User Story 3 — 必要逻辑变更先告知 (Priority: P1)

**Goal**: 核实迁移没有绕过用户决策；规则从 T007 起即生效，不等待本阶段才执行。
**Independent Test**: 逐项检查适配差异和变更记录，确认用户决定之前无对应逻辑试改；零事件时明确“未发现需改逻辑项”。

- [X] T035 [P] [US3] 在 `specs/001-migrate-bird-prototype/adapter-audit.md` 汇总每个源模块与目标差异，区分框架适配和业务行为变化，逐项关联 T006 用例/证据；发现无法等价项立即先报告用户，不试改（依赖 T029）。
- [X] T036 [US3] 审查 `specs/001-migrate-bird-prototype/change-requests.md` 的依赖受阻/逻辑变更决定与落实时间，核实“先告知、后决定、再实施”；若无事件据实记录，不虚构审批（依赖 T035）。
- [X] T037 [US3] 将未授权逻辑变更数、待决定项和可继续范围写入 `specs/001-migrate-bird-prototype/validation-report.md`，存在未授权变化则纠正迁移适配或阻塞验收，不擅自调整原业务（依赖 T034、T036）。

## Phase 6: Polish & Cross-Cutting Concerns

仅整合证据和交付说明，不借收尾重构/优化原业务。

- [X] T038 复核所有 FR-001–FR-014、SC-001–SC-005 与 `specs/001-migrate-bird-prototype/behavior-matrix.md` 的覆盖、状态和证据；查清遗漏/未通过/受阻项（依赖 T037）。
- [X] T039 比对原型迁移前后 Git 状态及 T001 文件校验清单，确认本次操作未写原型且未混入其他提交/私密数据，将结果记入 `specs/001-migrate-bird-prototype/validation-report.md`（依赖 T038）。
- [X] T040 在 `README.md` 整理启动、合成账号准备、配置键名和验收入口；校对 `specs/001-migrate-bird-prototype/quickstart.md`，明确本轮浏览器范围、真实服务限制和后续容器阶段（依赖 T039）。

## Dependencies & Execution Order

```text
Phase 1 → Phase 2（含先告知规则 T007）→ US1 → US2 → 最终验收
                                         └→ US3 差异审查 → 最终验收
```

- T006/T007 可在工具初始化之外准备，但 Phase 2 全部完成后才迁移业务。
- T012/T013 先建立对照依据；不要求人为强制失败。差分预期来自原基准，不从迁移实现反推。
- US1 实现模型/服务后接接口，再接界面；T029 需要全部迁移模块。
- US2 T030 可在 US1 后端/首屏就绪后提前进行；完整 T032–T034 依赖 US1 验证。
- US3 T035/T036 可与 US2 后期验证并行，T037 汇总必须等待 T034；所有任务始终受 T007 约束。
- 任务完成后填写证据再勾选。逻辑阻塞只暂停受影响任务，独立任务可继续。

## Parallel Examples

- US1：Phase 2/T013 完成后，天气分析 T019、鸟种 T020、识别 T021 可分别进行；认证/记录链 T014–T018 顺序执行。共享 app.ts 只由 T022 统一注册。
- US2：T030 完成后，构建宿主 T031 与浏览器用例 T032 可在不同文件并行；T034 等待双方及真实联调报告。
- US3：T035 可与 US2 T031/T032 并行；T036 依赖差异审查，T037 最后整合，不并发写最终报告。

## Implementation Strategy

先完成 Setup/Foundational；首个可演示切片为 US1 的登录+笔记闭环（T014–T018、T023–T025、T028 的对应部分，必要时提前完成 T030 运行脚本），用隔离测试数据验证。
这是增量演示，不代表 US1 或整轮迁移完成；随后补齐分析/识别等全部原功能，再完成 US2 与 US3。
三个 P1 故事均为本轮最终完成条件。Electron、手机套壳、原型缺陷修复、新 RAG/自助注册不纳入任务。
