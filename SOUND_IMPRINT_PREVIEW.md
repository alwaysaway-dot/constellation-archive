# 声音显影 V1｜预览交付与恢复记录

验收记录日期：2026-10-17。**只发布独立预览，正式站未覆盖。**

- 预览：https://alwaysaway-imprint-preview.liu1773237975.workers.dev/
- 保留正式站：https://alwaysaway-music.liu1773237975.workers.dev/
- 新工作目录：`/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_Sound_Imprint_Preview`
- 原工程：`/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_V1-A`，本轮没有改写。
- 新旧截图与录屏：`outputs/sound-imprint/comparison.html`
- 本地预览（当前已启动）：http://127.0.0.1:4183/

## 1. 改动前的可运行基线

原工程没有 Git 仓库，无法引用一个既有提交作为线上版本。本轮先复制完整源码、正式资源、依赖锁、部署脚本与配置到独立目录，再重建并核验：本地产物清单与部署记录一致，线上全部 50 个可服务资源的实际下载 SHA256 与重建产物逐一相同。核验后才建立保留提交，再从它创建预览分支。原目录没有初始化仓库或覆盖文件。

| 项目 | 已核实标识 |
|---|---|
| 保留分支 | `baseline/gravity-voyage` |
| 保留标签 | `production/gravity-voyage-20261016` |
| 保留提交 | `0be6e4bb68dbc9618e8de1f0a7faf63af0af4fa4` |
| 原正式 Worker | `alwaysaway-music` |
| 原正式 Cloudflare version | `9bb5f8e7-961c-4242-8e61-edb0f68e617d` |
| 原源码指纹 | `9d4783236c7c2880bd2b785759cc1375aaf1711447c25c2c4623e89dd8d32be6` |
| 新分支 | `preview/sound-imprint-v1` |
| 新实现提交 | `cfc540bd2ddb42b7431ed8b7b6559ebf9cd77bb4` |
| 新预览 Worker | `alwaysaway-imprint-preview` |
| 新预览 Cloudflare version | `7bb8b07c-f3d8-4c1f-b061-93115e2ab72e` |
| 新源码指纹 | `32a97b33ea1bdbcbf8d3ecbc616c7811bc35621afcb662c94485df97519d1742` |

另从保留标签建立了独立 worktree：`/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_Production_Restore`。已重新构建，并再次对比资产清单与源码指纹相同。旧版不仅有截图，也有完整可构建源码、原始资源及正式站运行实例。

证据：`evidence/baseline/build-manifest.json`、`online-match.json`、`deployment.json`、`cloudflare-deployments.txt`；构建日志 `outputs/baseline/tag-rebuild.log`。预览发布后再次读取正式部署列表，并比对正式首页 SHA256，确认仍为原版本：`evidence/production-after-preview.json`。

### 恢复操作

正式站没有被修改，目前不需要回退。如果未来正式发布新版本后要撤回，可在已登录 Cloudflare 的环境中执行：

```bash
cd '/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_Sound_Imprint_Preview'
npx wrangler rollback 9bb5f8e7-961c-4242-8e61-edb0f68e617d --config '/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_V1-A/wrangler.jsonc' --message 'Restore verified gravity voyage baseline'
```

本轮没有实际执行线上 rollback，避免不必要的正式站写入。如 Cloudflare 将来不再保留该版本，可从本地标签重建并按原发布流程恢复。创建一个全新的恢复目录（目标不能已存在）：

```bash
git worktree add --detach '/Users/liuxinyang/Documents/Codex/Constellation_Restore_New' production/gravity-voyage-20261016
cd '/Users/liuxinyang/Documents/Codex/Constellation_Restore_New'
npm ci
npm run build:production
npm run preview -- --port 4185
# 仅在需要恢复正式站、且授权发布时执行：
# npm run deploy:production
```

已有 Production_Restore worktree 已验证可构建。本轮保留节点不依赖预览新组件恢复旧首页。

## 2. 实际改动

| 文件/目录 | 用途 |
|---|---|
| `src/Imprint.tsx`（新增） | 原生滚动显影首页、十首精选展陈、响应式封面组件 |
| `src/imprint.css`（新增） | `.sound-imprint` 版本边界、光学揭示、非对称展陈、移动构图、低动态与详情局部样式 |
| `src/main.tsx` | 新 `#exhibit` 路由、首页接入、页面返回与焦点位置记忆 |
| `src/NavigationVeil.tsx` | 首页/精选展陈/星图探索/全部作品四个清晰入口 |
| `src/Pages.tsx` | 详情使用响应式原封面、返回来源、轻量展示样式；正文和播放器不改写 |
| `public/imprint/`（新增 20 文件） | 480/1200px WebP 展示副本，约 2.2MB；原比例、原图内容保持 |
| `scripts/prepare-imprint.py`（新增） | 可复现的封面尺寸/格式衍生工具 |
| `scripts/prepare-cloudflare.mjs` | 将新衍生图纳入发布白名单与指纹校验 |
| `wrangler.preview.jsonc`（新增） | 独立预览 Worker；沿用音频 Range 适配与静态资源行为 |
| `package.json`、`.gitignore` | 增加明确的预览发布命令；忽略本地依赖链接 |
| `evidence/`、本文件 | 基线、部署、回归与恢复证据；不属于网站公开资源 |

旧 `GravityScene`、`GravityRenderer`、布局/星图 CSS、作品数据、原正式封面/音频、`usePlayer`、`StellarTide`、播放器控件、试听抽屉均未修改。源码保护哈希检查通过；原 `public` 资产没有删除或更改。没有新增 npm 依赖、专辑一级导航或演唱相关栏目。

## 3. 视觉与交互结果，对照任务

1. **回退节点：完成。** 先在线资源逐一匹配、保留提交、标签重建与旧页面截图，再实施。
2. **声音显影：完成为独立预览。** 正式作品 01 的原封面为首页单一主体，清楚的斜向光界显示真实纹理；暗处仍有可识别影像。署名与既有中文主文案保留。
3. **首页滑动：完成。** 原生页面滚动控制曝光边界与局部残像，再呈现作品 03、05；它们是首页内容线索，完整名单仍在展陈按原顺序呈现。停下后画面稳定，没有持续循环维持效果。入口一直可直接操作，没有滚动锁定或强制动画等待。
4. **主展陈：完成。** 十首按既有顺序，用不同尺度和留白组织原封面、编号、标题与既有简短信息；提供十首快速定位。现有星图成为明确的次级探索入口，真实 WebGL 代码未替换。
5. **详情：完成局部统一。** 封面使用原图等比例衍生资源，局部边缘显现与排版细化；阅读区稳定。创作灵感、主题叙述、歌词、专辑数据和双翼星潮播放器没有重写。作品 08 保持此前已批准的详情顶部正方形取景规则，展陈显示原竖幅比例；没有再修改原照片。
6. **返回与连续线索：完成。** 首页/展陈/星图进入详情后可回到原来源；首页恢复显影进度，展陈恢复位置并聚焦刚打开的作品。新标签直接打开详情时使用可靠的展陈入口。仍使用既有短页面切换；未另建封面飞行或长镜头系统。
7. **其他作品与菜单：完成。** 其他作品仍为无封面列表、抽屉/Bottom Sheet 和 30 秒音源，完整版提示保留。菜单增加展陈入口，保留动态偏好设置与原滚动锁定。
8. **响应式/静态：完成模拟浏览器验收。** 1440、390、320px 各自构图；低动态首页是完整单幅，不要求长滚动。无 WebGL 时首页仍是同一视觉事件；旧星图继续其已有可点击静态回退。
9. **内容边界：通过保护核对。** 名单、顺序、封面源文件、音频、文字、归属、播放器和其他作品逻辑没有非预期修改。
10. **预览交付：完成，待用户视觉判断。** 独立公开预览可比较，正式站没有更新。是否优于旧版由用户验收，不用技术测试替代审美认可。

### 技术选择与调整

新首页采用 DOM/CSS 分层裁切与原生滚动驱动的一次性 rAF 调度，无额外 WebGL 场景。这让同一清楚构图在无 WebGL 和减少动态模式下也成立，并避免额外 GPU 场景/大型依赖。只有滚动、尺寸、可见性等事件触发绘制，闲置无持续循环；菜单开启/后台暂停调度。Three.js 仍按既有流程用于星图。

这是对新概念的轻量实现选择，并非将旧星图替换为静态截图。没有伪造声音驱动的显影：首页由浏览滚动驱动；真实音频响应仍由原详情播放器负责。

## 4. 实际验收

环境：本机 macOS / Apple M2。实际启动 Chrome `155.0.8059.80` 与 Playwright WebKit `26.5`；视口 `1440×1000`、`390×844`、`320×844`。本地与线上各执行两浏览器六组完整流程，每组 32 项断言。线上结果 `evidence/preview-results.json`。

| 验收 | 结果与证据 |
|---|---|
| 首页滚动揭示真实新作品、停止后无 idle 绘制 | 两浏览器/三视口通过；截图、实际录屏与帧计数 |
| 首页作品进入与返回 | 恢复 scrollY 与当前显影作品，通过 |
| 展陈 10 首、顺序、快速定位、详情返回 | 通过；回到原位置，键盘焦点恢复 |
| WebGL 正常 | 旧星图真实 `WebGLRenderer`；Chrome 报告 ANGLE Metal Apple M2，WebKit 报告 Apple GPU；节点进入/返回通过 |
| WebGL 不可用 | 在 context 层主动禁用 WebGL；两浏览器完整/减少动态模式下首页仍完整、星图十节点仍可进入 |
| 详情播放与跨页续播 | 通过实际 audio 的 time/paused 检查，只有一个实例；波轨组件保留；迷你暂停/收起通过 |
| 其他作品试听 | 实际开始 <31s 的预览音源；打开抽屉背景不滚动，关闭位置恢复；无封面列表与提示保留 |
| 移动输入补验 | 390/320px Chrome CDP 合成 touchStart/move/end 完成滑动，未误入详情；tap、返回通过 |
| 键盘、刷新直接链接、浏览器返回 | 通过；直接加载详情使用展陈默认返回，不出现空白 |
| 页面可读与溢出 | 三视口首页/展陈/详情/星图/列表/抽屉/菜单均无横向溢出；长韩文标题抽检通过 |
| 控制台与请求 | 完整测试捕获 pageerror、console error、>=400 资源响应均为 0（刻意 404 接口测试另列） |
| 线上资源/音频协议 | 70 资源 HEAD 200；35 MP3 的 1024 字节 Range 均 206 且内容吻合；7 个缺失/内部路径正确 404；越界 Range 416 |
| 正式站未变 | 部署 ID 与首页 SHA256 均仍匹配保留基线 |

已执行命令：

```bash
npm run typecheck
npm run build:production
node --test scripts/audio-worker.test.mjs
git diff --check
node evidence/tests/verify-imprint.cjs
TEST_BASE=https://alwaysaway-imprint-preview.liu1773237975.workers.dev TEST_STAGE=preview TEST_PROXY=http://127.0.0.1:7892 node evidence/tests/verify-imprint.cjs
python3 evidence/tests/verify-preview-http.py
node evidence/tests/touch-navigation.cjs
npm run deploy:preview
```

类型检查、构建通过；现有音频 worker 测试 **6/6** 通过；diff whitespace 检查通过。仓库没有独立 lint 脚本，未声称 lint 通过。构建仍提示既有 Three.js 块约 541.58KB 超过 Vite 500KB 建议阈值；该渲染器按既有方式懒加载，新首页实测不请求 GravityRenderer 块。发布总资源约 113.83MiB（包括所有既有音频），新增衍生图约 2.2MB，不等于首屏传输量。

测试脚本中的 Playwright/浏览器路径对应本机；其他机器需调整执行路径。一次补充直接链接测试最初用同文档 hash 跳转模拟刷新，命中已有位置记忆，故测试前提不成立；已改为真实 reload 后重测通过，未为此更改产品逻辑。

## 5. 截图、动态记录与限制

- 新旧同视口对照及关键页面：`outputs/sound-imprint/comparison.html`。
- 旧版真实截图：`outputs/baseline/`，桌面/390/320，首页、星图、详情、列表、抽屉。
- 线上新截图：`outputs/imprint-preview/`，两浏览器、三视口完整页面证据；额外 `detail-5` 与旧详情对应。
- 修改前录屏：`outputs/baseline/video/before.webm`。
- 新交互录屏：`outputs/imprint-video/sound-imprint.webm`，真实本地浏览器、与线上相同构建，包含显影滑动→详情→返回→展陈→星图→其他作品抽屉；未录音。
- 日志：`outputs/build-imprint.log`、`typecheck.log`、`audio-tests.log`、`test-preview.log`、`test-preview-http.log`、`test-touch.log`、`deploy-preview.log`。

**未确认事项：** 未连接真实 iPhone；WebKit 与移动视口不是 iPhone 实机。未测物理触控板/手指设备表现、持续负载 FPS、手机热量或电池影响；未进行主观音质试听评判。音频验证为实际媒体加载和播放时间推进。此次抽屉是回归检查，没有重新等待完整 30 秒自然结束；其原逻辑和音频未修改。线上验收依赖本机网络代理，不能替代用户所在网络可达性。

预览已完成技术核验，等待用户比较视觉。**未经下一步确认，不运行正式站 deploy，不继续下一轮改版。**
