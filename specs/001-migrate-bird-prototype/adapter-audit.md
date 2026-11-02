# 框架适配审查

基准：`9ba9f18e18e29826ac6fc6694b5a873d015bbdf8`。完整映射见 source-mapping.json。

适配范围：导入路径/目录分离、移除 server-only 标记（改为 lint/构建边界）、共享纯类型提取、标准 URL 和请求级 Cookie、明确资源根、公共地图环境映射、图片与字体适配、首屏会话运输。

路由保留原 route.ts 文件结构以减少 diff，页面组件保留原平铺相邻关系而未按 plan 的分组子目录重排。实际路径以 source-mapping.json 为准；这是目录适配，无业务规则变化。

原型存在注册占位、日期仅格式校验、内存会话重启失效等行为，均保留。尚未发现必须修改业务逻辑的事项。

用户后续明确授权的模型升级例外：qwen3.8-flash、北京兼容接口、流式思考调用，固定 JSON/网页功能保留；新增 apps/api/src/lib/ai/current-upload-json.ts 保证每次仅当前输入，不回传历史或思考。详见 change-requests.md。此授权不修改原型基准。

| 原文件 | 目标文件 | 审查范围 |
|---|---|---|
| lib/ai/birding-index.ts | apps/api/src/lib/ai/birding-index.ts | 框架/导入适配；参见差分与接口验证 |
| lib/ai/dashscope-client.ts | apps/api/src/lib/ai/dashscope-client.ts | 框架/导入适配；参见差分与接口验证 |
| lib/analysis/analysis-overview.ts | packages/shared/src/analysis/analysis-overview.ts | 框架/导入适配；参见差分与接口验证 |
| lib/auth/login.ts | apps/api/src/lib/auth/login.ts | 框架/导入适配；参见差分与接口验证 |
| lib/auth/session-resolver.ts | apps/api/src/lib/auth/session-resolver.ts | 框架/导入适配；参见差分与接口验证 |
| lib/auth/session-store.ts | apps/api/src/lib/auth/session-store.ts | 字节相同 |
| lib/identify/bird-encyclopedia.ts | apps/api/src/lib/identify/bird-encyclopedia.ts | 框架/导入适配；参见差分与接口验证 |
| lib/identify/bird-recognition.ts | apps/api/src/lib/identify/bird-recognition.ts | 框架/导入适配；参见差分与接口验证 |
| lib/identify/identify-contract.ts | packages/shared/src/identify/identify-contract.ts | 框架/导入适配；参见差分与接口验证 |
| lib/identify/image-upload.ts | apps/api/src/lib/identify/image-upload.ts | 框架/导入适配；参见差分与接口验证 |
| lib/maps/amap-loader.ts | apps/web/src/lib/maps/amap-loader.ts | 框架/导入适配；参见差分与接口验证 |
| lib/maps/park-options.ts | packages/shared/src/maps/park-options.ts | 字节相同 |
| lib/records/location-resolver.ts | apps/api/src/lib/records/location-resolver.ts | 框架/导入适配；参见差分与接口验证 |
| lib/records/notebook-export.ts | packages/shared/src/records/notebook-export.ts | 字节相同 |
| lib/records/notebook-presenter.ts | packages/shared/src/records/notebook-presenter.ts | 字节相同 |
| lib/records/notebook-repository.ts | apps/api/src/lib/records/notebook-repository.ts | 框架/导入适配；参见差分与接口验证 |
| lib/records/notebook.ts | packages/shared/src/records/notebook.ts | 字节相同 |
| lib/species/habitat-species-reference.ts | apps/api/src/lib/species/habitat-species-reference.ts | 框架/导入适配；参见差分与接口验证 |
| lib/species/park-species-sources.ts | apps/api/src/lib/species/park-species-sources.ts | 框架/导入适配；参见差分与接口验证 |
| lib/species/park-species-workbooks.ts | apps/api/src/lib/species/park-species-workbooks.ts | 框架/导入适配；参见差分与接口验证 |
| lib/time/beijing-time.ts | packages/shared/src/time/beijing-time.ts | 字节相同 |
| lib/utils.ts | packages/shared/src/utils.ts | 字节相同 |
| lib/weather/amap-weather.ts | apps/api/src/lib/weather/amap-weather.ts | 框架/导入适配；参见差分与接口验证 |
| lib/weather/birding-outlook.ts | packages/shared/src/weather/birding-outlook.ts | 框架/导入适配；参见差分与接口验证 |
| lib/weather/sz-forecast-warning.ts | apps/api/src/lib/weather/sz-forecast-warning.ts | 框架/导入适配；参见差分与接口验证 |
| app/_components/analysis-birding-outlook.tsx | apps/web/src/components/analysis-birding-outlook.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/analysis-forecast-warning-modal.tsx | apps/web/src/components/analysis-forecast-warning-modal.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/analysis-habitat-species-reference.tsx | apps/web/src/components/analysis-habitat-species-reference.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/analysis-map-panel.tsx | apps/web/src/components/analysis-map-panel.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/analysis-overview-panel.tsx | apps/web/src/components/analysis-overview-panel.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/analysis-screen.tsx | apps/web/src/components/analysis-screen.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/auth-entry.tsx | apps/web/src/components/auth-entry.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/identify-encyclopedia-card.tsx | apps/web/src/components/identify-encyclopedia-card.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/identify-result-card.tsx | apps/web/src/components/identify-result-card.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/identify-screen.tsx | apps/web/src/components/identify-screen.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/identify-upload-card.tsx | apps/web/src/components/identify-upload-card.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/login-register-dialog.tsx | apps/web/src/components/login-register-dialog.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/mobile-shell.tsx | apps/web/src/components/mobile-shell.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/record-editor-dialog.tsx | apps/web/src/components/record-editor-dialog.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/record-map-picker-dialog.tsx | apps/web/src/components/record-map-picker-dialog.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/records-auth-required-dialog.tsx | apps/web/src/components/records-auth-required-dialog.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/records-notebook-panel.tsx | apps/web/src/components/records-notebook-panel.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/records-screen.tsx | apps/web/src/components/records-screen.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/screen-frame.tsx | apps/web/src/components/screen-frame.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/top-nav.tsx | apps/web/src/components/top-nav.tsx | 框架/导入适配；参见差分与接口验证 |
| app/_components/wtb-logo-footer.tsx | apps/web/src/components/wtb-logo-footer.tsx | 字节相同 |
| components/ui/button.tsx | apps/web/src/components/ui/button.tsx | 框架/导入适配；参见差分与接口验证 |
| components/ui/card.tsx | apps/web/src/components/ui/card.tsx | 框架/导入适配；参见差分与接口验证 |
| components/ui/dialog.tsx | apps/web/src/components/ui/dialog.tsx | 框架/导入适配；参见差分与接口验证 |
| components/ui/input.tsx | apps/web/src/components/ui/input.tsx | 框架/导入适配；参见差分与接口验证 |
| components/ui/select.tsx | apps/web/src/components/ui/select.tsx | 框架/导入适配；参见差分与接口验证 |
| components/ui/separator.tsx | apps/web/src/components/ui/separator.tsx | 框架/导入适配；参见差分与接口验证 |
| components/ui/textarea.tsx | apps/web/src/components/ui/textarea.tsx | 框架/导入适配；参见差分与接口验证 |
| app/api/analysis/birding-outlook/route.ts | apps/api/src/routes/analysis/birding-outlook/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/analysis/forecast-warning/route.ts | apps/api/src/routes/analysis/forecast-warning/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/analysis/habitat-species-reference/route.ts | apps/api/src/routes/analysis/habitat-species-reference/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/auth/login/route.ts | apps/api/src/routes/auth/login/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/auth/logout/route.ts | apps/api/src/routes/auth/logout/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/identify/bird-recognition/route.ts | apps/api/src/routes/identify/bird-recognition/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/records/location/resolve/route.ts | apps/api/src/routes/records/location/resolve/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/records/notebook/route.ts | apps/api/src/routes/records/notebook/route.ts | 框架/导入适配；参见差分与接口验证 |
| app/api/records/notebook/[recordId]/route.ts | apps/api/src/routes/records/notebook/[recordId]/route.ts | 框架/导入适配；参见差分与接口验证 |
| public/file.svg | apps/web/public/file.svg | 字节相同 |
| public/globe.svg | apps/web/public/globe.svg | 字节相同 |
| public/images/default-admin-avatar.png | apps/web/public/images/default-admin-avatar.png | 字节相同 |
| public/next.svg | apps/web/public/next.svg | 字节相同 |
| public/vercel.svg | apps/web/public/vercel.svg | 字节相同 |
| public/window.svg | apps/web/public/window.svg | 字节相同 |
| parkinfo/Bijiashan Park.json | apps/api/parkinfo/Bijiashan Park.json | 字节相同 |
| parkinfo/Fairylake Botanical Garden.json | apps/api/parkinfo/Fairylake Botanical Garden.json | 字节相同 |
| parkinfo/Shenzhen Bay Park.json | apps/api/parkinfo/Shenzhen Bay Park.json | 字节相同 |
| parkinfo/Shenzhen Donghu Park.json | apps/api/parkinfo/Shenzhen Donghu Park.json | 字节相同 |

验证限制：UI 基准以未改动的原组件/CSS 加隔离测试宿主运行，图片、字体和 guest 常量由等价适配提供；不是原 Next.js 运行栈的全量回归。真实外部服务仍待配置。
