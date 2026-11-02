# Data Model: 保留原型模型

权威来源：锁定提交 9ba9f18 的 lib/auth、records、weather、species、identify 类型与构造函数；迁移时逐字段比对，不据本文重设计。

## AccountPasswordLibraryRecord

assistantAccount、userPassword 为字符串；按原规则 trim、忽略空项、重复账号 Map 覆盖。
仅使用合成账号，服务端加载，禁止打包进前端。不新增注册写入 API。

## StoredAuthSession / AuthSessionSnapshot

Map key 为随机 sessionId，值为 assistantAccount、authenticatedAt。
快照为 status(guest/authenticated)、assistantAccount、authenticatedAt；游客后两项 null。
登录创建会话，注销删除；服务重启 Map 丢失。Cookie 7 天并不授权新增服务端过期清理机制。

## NotebookRecordInput / StoredObservationRecord

输入：observationDate、observationTime、birdPoint、speciesName、note、locationSource、coordinates。
日期时间保持原格式校验，不增强为新日历校验；鸟点、鸟名 trim 后必填。
备注以 Array.from 计数，最多 100 字；超限保留原错误，不能截断后假定有效。
locationSource 为 manual/device/map；manual 不带坐标，其他两种必须有坐标。
经纬度必须有限，经度 -180..180、纬度 -90..90。
存储增加 recordId、assistantAccount、observationDateTimeIso、createdAt、updatedAt；北京时间 ISO 转换沿用 UTC+8 算法。

## StoredNotebookDocument / NotebookSnapshot

文档字段：assistantAccount、records、updatedAt；文件名为账号 UTF-8 十六进制编码，目录只指向新项目。
会话账号决定访问归属，更新/删除不存在或他人记录维持原 404。
列表按观测时间降序、updatedAt 降序；summary 为总数和 trim 后鸟名去重数。
导出按原升序与 tie-break 规则，与列表不同，不统一排序。
TXT 为 UTF-8 text/plain，清洗后的“账号的观鸟记录.txt”；精确保留行格式和换行。

## 公园、天气、鸟种

4 个公园保留 id/name/city/location/districtName/districtCode/isDefault 及原默认选择。
天气、birdingIndex、analysisOverview 的字段与 success/partial/failed 沿用原类型，不改提示词/参数。
预报预警模块独立聚合成功失败，不改成统一整页失败。
parkinfo JSON 按原解析/view 筛选、去重、排序；missing/unreadable/空集合分开处理。

## 图片识别与百科

BirdIdentifyResponse：requestStatus、message、requestedAt、recognition、encyclopedia。
状态为 success/partial/invalid_image/unrecognized/failed。
recognition 保留中英拉名称、message、modelName；百科四节为 traits/habits/distribution/protection。
识别成功而百科失败保留识别结果并返回 partial。

## 迁移审计

MigrationBaseline：源路径、完整提交 SHA、导出清单与校验值，不含私密数据。
BehaviorCase：来源、初始状态/输入、预期、目标位置、验证结果与证据。
ChangeRequest：原逻辑、阻碍证据、方案/影响、用户决定；未决定不实施。
