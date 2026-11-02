# 本地迁移验证报告

日期：2026-11-02。基准：9ba9f18e18e29826ac6fc6694b5a873d015bbdf8。
结论：本地迁移完成，受控验证通过；真实外部服务按用户要求留待配置后继续，本报告不声明真实服务联调完成。

## 实现

Vite 8.3.5 / React 19.2.4 前端、独立 Node/Hono 后端、共享纯代码包；保留原路由文件结构和组件相邻关系。
新增只读 session 接口替代 Next 首屏注入；未引入新业务、账户迁移、数据库、容器或自助注册。
依赖兼容检查发现插件/测试工具使用 Vite 8，将 Web 构建工具统一到该兼容版本；这是构建依赖对齐，不是业务依赖降级。

## 已执行验证

| 检查 | 结果 |
|---|---|
| npm run typecheck | 通过，web/api 类型检查 |
| npm run lint | 通过；原导出正则保留，规则例外仅限原文件 |
| npm run test:parity | 22/22 通过 |
| npm run test:contracts | 30/30 通过，11 原操作与会话接口及错误分支 |
| npm run test:e2e | 6/6 通过，Chromium；包含三屏截图对照 |
| npm run build | 前端/后端构建通过 |
| npm run test:built | HTTPS 构建产物、Secure/HttpOnly/Lax Cookie、刷新、重启会话失效及 JSON 记录保留通过 |
| npm run audit:migration | 72 源文件映射无缺失，19 文件字节相同，原型状态与校验无变化 |

详细命令输出与截图生成在忽略跟踪的 test-results/；来源摘要在 source-audit.json，实际映射在 source-mapping.json。
UI 同条件三次导航耗时（毫秒）：原组件宿主 482/240/227，迁移页 449/247/219；样本仅作本机回归观察，不是服务性能承诺。
analysis/identify/records 三屏截图在相同尺寸/受控本地数据下逐像素相同。

## 验证边界

原 UI 验证宿主直接加载未修改的锁定组件与 CSS；使用共同的图片/字体/guest 常量适配和同一本地 API。
因此覆盖组件和布局回归，不等同于运行原 Next.js 服务端渲染/图片优化链。
接口差分运行原 route.ts 与业务模块，next/headers 在测试中以请求作用域桥接，不改原模块源文件。
模型对照模拟的是模型边界返回内容，并检查原/新请求提示词与参数一致，不证明真实模型输出。
地图点击、设备定位的真实地图 SDK、实时天气/气象/模型可用性，以及生产网络部署均未验证。

## 用户明确延期的联调

用户决定：“先完成本地迁移，真实服务联调留待配置后继续”。
缺失配置：VITE_AMAP_KEY、VITE_AMAP_SECURITY_JS_CODE（或 SERVICE_HOST）、AMAP_WEATHER_KEY、DASHSCOPE_API_KEY、SZ_WEATHER_APP_KEY、QWEATHER_API_HOST、X_QW_API_KEY。
后续在 apps/web/.env.local 和 apps/api/.env 填写，不要把密钥提交或发到聊天。无配置时按原型显示失败/缺配置状态，不虚构成功。

## 逻辑变更与隔离复核

未发现必须变更业务逻辑项，未授权业务逻辑变更为 0，原型文件修改为 0。
原账号与笔记内容未导入；测试只使用 MIGRATION_A/B 合成账号。运行文件限新项目。
FR001–FR014/SC001–SC005 对照见 behavior-matrix.md；SC002 的真实服务部分仍待配置验收。

## 后续授权修改：qwen3.8-flash（2026-11-02）

用户明确要求模型升级并保持网页功能。识别及百科统一使用 qwen3.8-flash；baseURL 改为指定北京地址。
stream=true、enable_thinking=true、preserve_thinking=false。后端只聚合 delta.content 后走原 JSON 解析与响应，不保存/显示/回传 reasoning_content。
每次新建固定 system + 当前 user 消息；识别只提交当前图片，百科只提交本次识别出的中英拉鸟名，不带任何历史图片/回答/对话。

已验证：typecheck、lint、build 通过；34 项接口测试通过（含 4 项真实 SDK 请求序列化/SSE/连续与并发隔离测试），6 项浏览器回归通过。
旧提交模型字段的差分仅对用户明确授权的模型名和流式参数作例外，其他提示词、请求内容、响应字段、状态与网页行为继续对照。
真实服务仍待配置，未作外部付费调用；锁定原型目录状态与文件校验未变。当前映射中有 18 个文件字节相同，其他变化见 adapter-audit.md。

参考：[千问模型与多模态说明](https://platform.qianwenai.com/docs/developer-guides/getting-started/latest-model)、[结构化 JSON 输出](https://platform.qianwenai.com/docs/developer-guides/text-generation/structured-output)。

## 后续真实联调：地图与天气配置恢复（2026-11-02）

用户授权按原项目本地 .env 配置直接填入当前项目。仅复制地图与天气相关变量；未复制其他用途密钥。
前端原 NEXT_PUBLIC_AMAP_KEY/SECURITY_JS_CODE 映射为 VITE_AMAP_KEY/SECURITY_JS_CODE，后端天气及气象变量保留原名，包括 X-QW-Api-Key。
本地配置写入 apps/web/.env.local、apps/api/.env，已确认被 Git 忽略；未将任何密钥值写入报告或日志。
前端自动重新加载，后端已重启。

实际验证：高德地图 SDK 加载成功，页面 canvas 正常生成，无缺配置提示或外部加载失败。
/api/analysis/birding-outlook 返回 HTTP 200 / success，实时天气和本地观鸟指数成功。
/api/analysis/forecast-warning 返回 HTTP 200 / success：小时预报当前为空，分区预报、日出日落、灾害预警模块成功。
以上取代先前关于地图/天气尚未配置和未真实联调的状态；模型密钥与真实模型联调仍未配置，不在本次恢复范围。
配置检查脚本已支持 X-QW-Api-Key/X_QW_API_KEY 和安全码/代理地址二选一，lint 通过。
