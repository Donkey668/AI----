# 行为与验收对照

基准：9ba9f18e18e29826ac6fc6694b5a873d015bbdf8。实际逐文件映射见 source-mapping.json；自动来源复核见 source-audit.json。
“通过”仅表示下列受控范围；真实地图/天气/气象/模型联调由用户明确留待配置后继续。

| 范围/来源 | 迁移位置 | 验证证据 | 结果 | 需求 |
|---|---|---|---|---|
| lib/auth/login、session-store | apps/api/src/lib/auth、packages/shared/src/auth | legacy-api/session 测试：无效/未知/错密/成功、刷新/退出/伪造、Cookie | 通过 | FR004、010、014 |
| app/page.tsx 首屏会话 | apps/web/src/session-bootstrap.ts、GET /api/auth/session | session 测试、浏览器刷新、HTTPS 构建验证 | 通过；运输适配 | FR006、009 |
| lib/records/notebook | packages/shared/src/records/notebook.ts | 备注 100/101/Unicode、日期格式、坐标边界、北京时间、摘要与排序差分 | 通过 | FR004、010 |
| notebook-repository 与四个笔记 HTTP 操作 | apps/api/src/lib/records、routes/records/notebook | CRUD/401/400/404/500、两账号、文件失败、重启持久化 | 通过 | FR004、012、014 |
| lib/records/location-resolver | apps/api/src/lib/records、routes/records/location | 无效输入、坐标后备/受控逆地理响应 | 通过；真实定位/地图待联调 | FR004、010 |
| lib/records/notebook-export | packages/shared/src/records/notebook-export.ts | 排序/保留字符/文件名差分、浏览器下载内容 | 通过 | FR004、005 |
| analysis/birding-outlook 路由、weather、ai/birding-index、analysis-overview | apps/api/src/lib/weather、ai，shared，routes/analysis | 固定天气与成功/partial/502 对照 | 通过；真实天气待配置 | FR004、010 |
| analysis/forecast-warning 与 sz-forecast-warning | apps/api/src/lib/weather、routes/analysis | 无效/全失败/受控成功/局部失败聚合对照 | 通过；真实气象待配置 | FR004、010 |
| analysis/habitat-species-reference、parkinfo 四 JSON | apps/api/src/lib/species、apps/api/parkinfo | 四公园、全量/预览、missing/unreadable/空/坏 JSON | 通过 | FR003、004 |
| identify/bird-recognition 与识别/百科 lib | apps/api/src/lib/identify、routes/identify | 无效/空/10MiB、success/partial/unrecognized/failed；原/新模型请求内容一致 | 通过；真实模型待配置 | FR004、010 |
| app/_components 三屏与 UI | apps/web/src/components | 三屏/四公园、注册占位、错误提示、登录记录流程；相同受控数据截图像素一致 | 通过；原组件宿主，不是原 Next 全栈 | FR005、006 |
| next/image、next/font、layout | image.tsx、styles/fonts.css、index.html | 自托管原字体系列、图片预览、桌面/手机截图 | 通过受控渲染；原图片优化链不在对照内 | FR005、006 |
| Vite/Node 分离与静态部署 | vite.config.ts、server.ts、serve-built.mjs | 类型/lint、独立双进程、生产构建、HTTPS Cookie、重启验证 | 通过 | FR006、009、013 |
| 原型提交/数据隔离 | scripts/export-baseline、prepare-test-data、audit-migration | 81 文件按 Git 对象提取，72 文件映射，原工作区状态/校验不变 | 通过 | FR001、002、012、014 |
| 必要变更先告知 | change-requests.md、adapter-audit.md | 无需改业务逻辑项；所有差异限框架/导入/运输 | 无未授权业务变更 | FR007、008、011 |

## 原型行为与占位保留

注册仅管理员联系提示；日期只做原格式校验；服务端会话为内存 Map，重启失效；列表降序与导出升序不同；桌面窄屏提示和横屏限制均不修正。

## 成功标准

SC001：已建立清单和源到目标映射，无已知漏迁模块。
SC002：本地受控差分/接口/浏览器与构建验证通过，真实服务仍未验收，不能宣称全场景最终等价验证完成。
SC003：未授权业务逻辑变更为 0。
SC004：浏览器可直接运行共享功能，无容器前置。
SC005：原型迁移前后 Git 状态与已记录文件校验一致。
