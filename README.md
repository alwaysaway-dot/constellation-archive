# Constellation Archive｜V1-A.3

## 第08首《A Violet Afterglow》正式内容 V1（2026-10-14）

入口 `/#work/8`。五段创作灵感、六段主题叙述、4＋1五句歌词与专属献词已接入。dedication可选字段仅本首使用，复用现有标题区。ava新增唯一最小记录，仅收录本曲，使用既有专辑模板，不添加专辑封面/描述。

用户授权1:1顶部裁切：public/artwork/08-official.jpg保留原照片，通过网页方形容器及顶部定位呈现，源文件未修改。音频为T06_full.mp3原样副本a-violet-afterglow.mp3，288.0135秒。其他九首数据、旧资产及格外关联不变。

类型检查、构建、Chrome/WebKit专项及全站回归通过；真实iPhone待验收。基线work/baselines/before-song08-2026-10-14，素材/脚本work/song08，交付在本聊天outputs/song08。停止于第08首，未公开部署。


## 第07首《Almost There》正式内容 V1（2026-10-14）

入口 `/#work/7`。仅在content.ts接入第07首正式封面、Dark House × Slap House × Brazilian Bass风格、三段Origin V1、九段Interpretation V2和2＋3＋1六句歌词。独立短句及最后Almost.原样保留；未知专辑隐藏。公共组件、样式、播放器及三维场景未变。

public/artwork/07-official.png为用户1254×1254原图副本。本曲未找到既有MP3，故由只读Almost There.wav另存public/audio/almost-there.mp3网页试听版（320kbps/48kHz、320.600167秒），无剪辑或音量/淡出处理；源WAV及其他既有资源哈希不变。详见work/song07/audio-provenance.json。

类型检查、构建、Chrome/WebKit五档宽度专项和全站回归通过；真实iPhone待用户验收。其余九首和专辑数据不变，第10首替换留待其任务。基线work/baselines/before-song07-2026-10-14，素材及脚本work/song07，截图与报告在本聊天outputs/song07。停止于第07首，未公开部署。


## 第06首《Minority of One》正式内容 V1（2026-10-14）

入口 `/#work/6`。仅在content.ts接入第06首正式封面、Afro-R&B × Afrobeats、三段创作灵感、六段主题叙述、两句长英文lyrics；现有组件自然换行，无公共组件和样式变更。格外复用gewai对象，曲目顺序[5,6]，无孤辰公开标签或新增说明。

封面public/artwork/06-official.png为用户1254×1254原图副本；public/audio/minority-of-one.mp3为已核实T02完整MP3原样副本（221.680167秒）。其他九首数据和既有资源哈希不变。

类型检查、构建、Chrome/WebKit五档宽度专项及全站回归通过；真实iPhone待验收，原有Three分包体积提示保留。基线work/baselines/before-song06-2026-10-14，素材/脚本work/song06，截图与报告在本聊天outputs/song06。停止于第06首，未公开部署。


## 第05首《AFTERIMAGE》V1.1（2026-10-14，已完成）

已录入三段创作灵感、六段主题叙述及3＋3六句歌词，复用T10完整MP3（181.1735秒），入口 `/#work/5`。格外使用既有专辑模板，仅确认本首归属。正式封面 public/artwork/05-official.png 为用户确认的1254×1254原图副本，详情及所有共用引用一致，已移除概念封面标注。

按用户全站规范删除演唱字段/UI/对应样式，仅最小删改第03/04首正文中的人声介绍，其余内容、旧资源、播放器和3D逻辑保持不变。差异与测试在本聊天 `outputs/song05/`；素材/测试脚本 `work/song05/`；基线 `work/baselines/before-song05-2026-10-14/`。类型检查、构建、Chrome/WebKit专项和全站回归通过；真实iPhone待用户验收。未公开部署，未推进第06首。


## 第04首《Leave the Hallway Light On》正式内容 V1（2026-10-14）

入口 `/#work/4`。复用第01–03首的详情模板，仅在 `src/content.ts` 第04首数据录入正式封面、男性主唱、三段创作灵感、五段主题叙述 V3 与三组六句英文歌词。未知专辑、副标题与发行时间隐藏，无新增公共组件、样式或播放器逻辑。

`public/artwork/04-official.png` 为用户1254×1254原图副本，未加工；既有 `public/audio/hallway.mp3` 及其余九首数据、既有资源校验不变。类型检查、构建、Chrome/WebKit专项测试和全站回归通过，真实iPhone待用户验收。已有Three分包大于500kB的构建提示仍在。

本机 `http://127.0.0.1:4173/#work/4`；当前局域网 `http://192.168.124.12:4173/#work/4`。启动方式仍为 `npm run dev:lan`。基线 `work/baselines/before-song04-2026-10-14/`，素材与测试记录 `work/song04/`，交付截图和报告位于本聊天 `outputs/song04/`。停止于第04首，未公开部署。


## 第03首《物我》正式内容 V1（2026-10-14）

入口 `/#work/3`。仅录入第03首确认的正式封面、Cosmic Modal Jazz × Chamber Soul风格、年轻低女中音演唱、创作灵感/主题叙述与六句歌词。`vocal`为可选基本信息字段，歌词沿用 `lyricGroups`；专辑和副标题未新增。

封面 `public/artwork/03-official.png` 为用户1254×1254原图副本；`public/audio/wuwo.mp3` 为既有评审T01完整MP3原样副本，播放器代码未改。第03首歌词按容器宽度控制字号，实测五档宽度保持三组六句六行、不溢出。其余九首数据和既有资源校验不变。

typecheck/build、Chrome/WebKit专项验证和全站回归通过，真iPhone待用户验收。基线 `work/baselines/before-song03-2026-10-14/`；检查脚本/素材说明 `work/song03/`；本聊天 `outputs/song03/` 保存截图、原始测试结果和交付说明。未公开部署，停止于第03首。


## 第02首《格林尼治》正式内容 V1（2026-10-14）

入口 `/#work/2`。本轮仅增加第02首正式封面、原文创作灵感/主题叙述与六句繁体歌词。`lyricGroups` 为可选的分组歌词字段，每组独立引用；已有 `lyrics` 路径保留。未知副标题、发行日期和专辑数据未新增。

原图为 `public/artwork/02-official.png`，音源为既有评审 `T11_full.mp3` 原样副本 `public/audio/greenwich.mp3`；播放器源码未改。源码只修改 `content.ts`、`Pages.tsx`、`gravity.css`。其余九首数据和原有音频均校验不变。

本机 http://127.0.0.1:4173/#work/2；局域网 http://192.168.124.12:4173/#work/2。服务器启动方法仍为 `npm run dev:lan`。类型检查、构建、Chrome/WebKit针对性检查及全站回归最终通过；历史返回位置断言首轮差异详见交付说明，真机待用户验收。

基线 `work/baselines/before-song02-2026-10-14/`；脚本/素材说明 `work/song02/`；交付截图、日志和说明位于本聊天 `outputs/song02/`。停止于第02首，未公开部署。


## 内容更新：V1-B.1（2026-10-14）

仅第01首《我们隔着从前相爱》接入用户确认封面与V1正文：副标题、创作灵感、主题叙述、三句歌词；未知专辑隐藏。内容存于 `src/content.ts`，原图 `public/artwork/01-official.png` 不裁剪/加工。

既有评审清单确认第01首为 `T05_full.mp3`，已原样复用至 `public/audio/through-the-past.mp3`。播放器由固定第04首扩展为同一音频实例显式切换第01/04首；浏览页面不换源，其他歌曲无新增音频。过期播放请求不会影响当前曲目。原有素材和其他九首数据保持不变。

当前预览：http://127.0.0.1:4173/#work/1；当前局域网：http://192.168.124.12:4173/#work/1（IP可能变化）。运行方式仍为 `npm run dev:lan`。

已通过 typecheck/build、Chrome/WebKit移动视口内容与播放检查、音频异常/异步竞争检查及全站回归；真实iPhone验收仍待反馈。脚本在 `work/v1-b1/`，基线在 `work/baselines/before-v1-b1-2026-10-14/`，截图和原始结果在本聊天 `outputs/v1-b1/`。用户提供的副标题/文案为暂定稿，正式发布前再次核对成品歌词。


## 当前版本：V1-A.3「引力剧场」（2026-10-13）

本版本为现有工程增量重构。启动 `npm run dev:lan`；Mac：http://127.0.0.1:4173/；当前局域网：http://192.168.3.135:4173/。IP 可变化，使用 `ipconfig getifaddr en0` 核实。已运行的 4173 服务器无需重复启动。

- `#home` 首页、`#map` 唯一星图、`#albums` 专辑、`#works` 全部作品，`#work/1`…`#work/10` 保留。旧 `#archive` 安全兼容到星图，档案双视图已删除。
- 首页/星图接入真正的 Three.js WebGL2：`GravityRenderer.ts` 管理相机、批量粒子和渐隐尾迹；`GravityScene.tsx` 保留可访问 DOM 标签。独立手势柄观察视差，手机其它区域正常纵向滚动；方向键/Home 可操作。
- Three 仅按需加载，无后期/阴影。mobile DPR ≤1.25、约30 FPS渲染上限，desktop DPR ≤1.6；慢帧自适应降画质；reduced-motion 静态单帧；无 WebGL 时静态节点可导航；后台/离屏暂停绘制，卸载释放资源。
- `NavigationVeil.tsx` 使用原生 dialog、焦点和滚动恢复。SVG 控件统一；播放器依旧单音频实例，只有诚实的播放状态反馈，不使用装饰频谱冒充真实分析。
- 原 `Space.tsx` 已移除，`content.ts`、`usePlayer.ts` 与音频/十张概念封面校验未变；仍只有第四首具有已接入真实音频，正式封面、缘起、歌词与专辑归属待确认。
- 新增运行依赖 `three@0.186.1`，开发类型 `@types/three@0.186.0`。lazy renderer chunk 533.69 kB / gzip135.26 kB，构建存在 >500kB 提示。未增加服务端或外部服务。
- 已通过 typecheck、build、Chrome 浏览器回归、Mac WebKit 播放/导航检查。`work/v1-a3/` 保存实际执行脚本，引用此 Mac 的 Playwright/浏览器路径，换设备需调整路径。未配置 lint 或独立单元测试脚本。
- 实测 Mac 移动视口+DPR3：Chrome 首页/星图约30 FPS，WebKit约26 FPS；不是 iPhone 实测帧率。真实 iPhone 仍待用户验收。
- 交付截图、25秒录屏、原始测试JSON、完整说明与图册：`/Users/liuxinyang/Documents/Codex/2026-10-12/e-constellation-archive-v1-a-constellation/outputs/v1-a3/`。
- 可恢复基线：`work/baselines/before-v1-a3-2026-10-13/`。未初始化Git或公开部署。批准参考存于 `design-references/`。

以下为保留的历史版本记录；路由及渲染实现以本节为准。

---

当前工作目录保留 React + TypeScript + Vite 与单音频实例结构。

```bash
npm run dev:lan
```

Mac 预览：http://127.0.0.1:4173/

同一局域网手机预览（2026-10-13 当前 Wi-Fi IP）：http://192.168.124.12:4173/

`npm run dev:lan` 与 `启动原型.command` 监听所有本机 IPv4 接口，方便同一 Wi-Fi 手机访问；`npm run dev` 仍仅监听 127.0.0.1。IP 可能随 Wi-Fi 或 DHCP 变化，可用 `ipconfig getifaddr en0` 查看当前 Wi-Fi 地址。未设置公网隧道或端口转发。

构建：`npm run build`。依赖已安装；重新安装使用 `npm ci`。

本轮完整交付说明与截图：

`/Users/liuxinyang/Documents/Codex/2026-10-12/e-constellation-archive-v1-a-constellation/outputs/v1-a1`

修改前可恢复基线：`work/baselines/V1-A-before-A1.tar.gz`；恢复说明见同目录 README。

素材生成与浏览器检查脚本位于 `work/v1-a1/`。

全部十张封面为原创程序化概念研究，不代表正式发行封面。歌词与原始 Prompt 未定位，保持明确待补。原始音频未修改、未上传。停止于 V1-A.1，未公开部署。

## V1-A.2（2026-10-13）

保持 React + TypeScript + Vite，无新增运行依赖。使用 `npm run dev:lan` 保持本机/局域网预览；`npm run build` 构建；`npm run typecheck` 单独进行类型检查。项目未配置 lint 工具和 lint 脚本。

### 访问路径

- `/#home` 首页（根地址兼容）
- `/#map` 星图；`/#archive` 档案
- `/#albums` 专辑索引；`/#album/<id>` 已确认专辑详情
- `/#works` 全部作品及搜索/筛选
- `/#work/1` … `/#work/10` 原有十首访问地址保留

### 内容维护

`src/content.ts` 为统一公开数据源。`featured` 表示精选十首；`core` 表示其中前六首核心作品。请保持现有 ID 和排列顺序。新非精选作品设 `featured: false`，不创建独立详情路由。

- 歌曲：`title`、`art`、`artworkKind`（concept / official）、`audio`、`origin`、`lyrics`（原始歌词片段数组）、`albumId`、`externalUrl`、`language`、`release`。
- 专辑：`id`（稳定的英文/数字/连字符标识）、`title`、`subtitle`、`cover`、`concept`、`description`、`songIds`。`songIds` 的长度由页面自动计算为作品数量。录入时同步填写歌曲的 `albumId`，不要推断归属。
- 所有可选字段仅填已核实数据；`albums` 目前为空。精选十首以外暂无已确认记录。外链只接受 HTTPS；录入前应人工核实官方来源。
- `legacyIntent` 只保留已有创作意图参考，不作为正式创作缘起展示；正式文案确认后填 `origin`。原始提示词、参数和实验记录不可写入公开数据模块。
- 全局音频本轮仍专用于 ID 4 的示例 MP3。其余九首的试听区域明确显示待确认。加入更多本地音源不在本轮范围。

### 实现与检查

- `Pages.tsx`：统一单曲模板、专辑索引/详情、全部作品、非精选信息对话框。
- `PlayerControls.tsx`：SVG 星核播放器与频谱装饰；不将频谱装饰称为真实波形。
- `Space.tsx`：缓存轨道装置，桌面约 30 FPS/移动约 20 FPS 绘制上限；移动约 70 星点；减少动态模式静态绘制；页面隐藏取消视觉帧循环。
- `usePlayer.ts`：单一音频实例、用户点击直接触发播放；暂停/隐藏/减少动态时停止频谱采样。仅暂停视觉不会暂停音频。
- 手机端无全屏噪声滤镜、迷你播放器无 backdrop blur，减少绘制成本。真实 iPhone Safari 的滚动性能及安全区仍需真机反馈，不能以桌面模拟替代。
- 浏览器回归脚本保存在 `work/v1-a2/regression.cjs`。脚本目前使用本机安装的 Chrome 和 Codex Playwright 运行时；可根据另一台机器的路径调整。
- 源码基线：`work/baselines/before-v1-a2-2026-10-13/`。音频 SHA-256 已核对不变。专辑、非精选分支的测试数据仅在隔离浏览器网络响应中注入，没有写入内容数据或发布文件。
