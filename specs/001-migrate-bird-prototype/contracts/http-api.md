# HTTP Contract: 原型兼容 API

权威来源：锁定提交 9ba9f18 的 app/api 与 lib 构造函数、类型和 presenter。
所有原字段、中文 message、null/空集合、关键头和错误顺序必须保持；不统一响应包装。

| Method | Path | 输入 | 状态与行为 |
|---|---|---|---|
| GET | /api/analysis/birding-outlook | parkId | 400 无效；502 天气失败；200 success/partial |
| GET | /api/analysis/forecast-warning | parkId | 400 无效；502 全失败/异常；200 成功/局部失败 |
| GET | /api/analysis/habitat-species-reference | parkId,view | 400 无效；404 missing；500 unreadable；200 成功/空集合 |
| POST | /api/auth/login | JSON assistantAccount,userPassword | 400 无效；401 账号/密码错误；200 成功并设 Cookie |
| POST | /api/auth/logout | Cookie | 200，删除 Map 会话与 Cookie |
| POST | /api/identify/bird-recognition | multipart image | 400 invalid_image；502 failed；200 success/partial/unrecognized |
| GET | /api/records/location/resolve | longitude,latitude,source | 400 无效；500 异常；200 位置结果 |
| GET | /api/records/notebook | Cookie | 401 未认证；500 读取失败；200 列表摘要 |
| POST | /api/records/notebook | Cookie、NotebookRecordInput | 401/400/500；201 创建 |
| PATCH | /api/records/notebook/:recordId | Cookie、NotebookRecordInput | 401/400/404/500；200 更新 |
| DELETE | /api/records/notebook/:recordId | Cookie | 401/404/500；200 删除 |

## 新增运输适配 GET /api/auth/session

读取当前请求 wtb_auth_session，调用原 getAuthSessionSnapshot，返回 AuthSessionSnapshot：
`{status:"guest"|"authenticated",assistantAccount:string|null,authenticatedAt:string|null}`。
200；Cache-Control: no-store；Content-Language: zh-CN；不创建/续期会话，不回传 sessionId，不更改登录返回体。
先取得快照再挂载 MobileShell；失败时提示启动受阻并允许重试，不伪造认证状态。

## Cookie、请求与导出

wtb_auth_session 保持 HttpOnly、SameSite=Lax、Path=/、Max-Age=604800、production Secure。
请求作用域隔离，禁止全局保存当前请求身份。开发 /api 经 Vite 代理，生产验收 HTTPS 同源代理。
保持 JSON 解析失败转 null、trim、认证与校验先后、recordId 处理和原异常边界。
保留 File/formData、image/*、非空、10MiB 检查；不得让新增中间件的默认限制改变原错误响应。
导出是浏览器 notebook-export 行为，不新增下载 API。

## 对照验证

逐行覆盖成功与所有失败分支；会话测试无/伪造/有效 Cookie、注销与服务重启。
对比状态码、完整 JSON、关键头和 Cookie；仅规范化时间/UUID，不忽略字段差异。
真实外部服务与受控回放分开报告。

2026-11-02 用户授权升级：识别/百科响应的 modelName 改为 qwen3.8-flash；其余 JSON 字段、状态码、文案和网页处理保持原契约。
后端接收供应商流式 content 后聚合解析，前端仍读取单次 JSON，不接收 reasoning_content。
