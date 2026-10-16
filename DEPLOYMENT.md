# Cloudflare 生产部署与维护

项目：`/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_V1-A`

正式网址：<https://alwaysaway-music.liu1773237975.workers.dev>

Cloudflare 项目：`alwaysaway-music`，使用 Workers Static Assets，未配置自定义域名。

2026-10-16：启用免费品牌地址；旧项目及旧链接继续可访问，后续常规部署只更新新项目。没有修改账号级子域名、购买域名或启用付费服务。

## 构建与更新

```bash
npm ci
npm run typecheck
node --test scripts/audio-worker.test.mjs
npm run build:production
npx wrangler whoami
npm run deploy:production
```

`wrangler.jsonc` 的 build.command 会在每次 deploy 时重新运行生产构建，防止误上传旧 dist。源代码指纹及公开文件清单生成于 `work/cloudflare/build-manifest.json`。生产构建只操作 Vite 生成的 dist，不删除 public 原件。准备脚本遇到超限文件、缺失媒体、可识别的本地路径或密钥字样时失败。

若当前网络依赖系统代理，给该次命令设置 HTTP_PROXY/HTTPS_PROXY；本机本次使用已配置的 `http://127.0.0.1:7892`，没有修改全局网络设置。不要把凭据放进代码或聊天。认证失效时运行 `npx wrangler login`，在浏览器授权。

## 路由与资源

项目继续使用 `/#map`、`/#work/ID`、`/#works` 哈希路由，直接打开和刷新都请求根路径。因此 `not_found_handling: none` 可以同时支持既有路由及真实缺失资源 404；不需要把缺失 MP3/JS 伪装成 index.html。

只有十首精选的正式封面、完整 MP3、25 个用户确认的 30 秒 MP3、JS/CSS、favicon 和 index.html 会发布。旧概念封面和工作文件不在发布包中。其他作品的完整审听音频只在本地 work 目录，没有上传。

原始 `public/artwork/08-official.jpg` 保留。经用户授权生成的线上副本在 `deploy/assets/artwork/08-official.jpg`，2048×3072，约 1.11 MiB，保持 2:3 比例；仅在生产 dist 中替换同路径文件。既有 CSS 顶部正方形展示方式保持不变。

Cloudflare 原生静态音频在本次实测中忽略 Range。`deploy/audio-worker.mjs` 仅为 `/audio/*` 提供分段响应，复用 Assets 绑定，支持完整响应、GET 单区间/后缀区间、HEAD、If-Range 和 416。没有数据库、R2 或新播放器。该路径会调用 Worker，计入账户现有 Workers 请求额度；本轮未开通或升级任何付费服务。所有媒体在构建时限定 ≤25 MiB，目前最大 12.23 MiB；分段适配读取当前音频字节后截取，不适合未来直接扩大为大型媒体服务。

HTML、固定名称封面与音频要求重新验证缓存，带哈希 JS/CSS 使用长期 immutable 缓存。安全头只有 nosniff 与 Referrer-Policy，没有新增可能破坏 WebGL/音频的 CSP。

## 验证

```bash
TEST_BASE=https://alwaysaway-music.liu1773237975.workers.dev TEST_PROXY=http://127.0.0.1:7892 node work/cloudflare/verify-production.cjs
TEST_BASE=https://alwaysaway-music.liu1773237975.workers.dev TEST_PROXY=http://127.0.0.1:7892 node work/cloudflare/verify-scene.cjs
TEST_BASE=https://alwaysaway-music.liu1773237975.workers.dev python3 work/cloudflare/verify-http.py
```

这些验收脚本使用本机已有 Playwright/浏览器路径；迁移机器时需调整依赖路径与代理地址。检查结束后不要把本地测试文件复制进 dist。

## 回滚

本次验收基线版本：`e487272a-e0e6-4a70-aca9-ce6fa23ecdd8`。

先查看 `npx wrangler deployments list` 与 `npx wrangler versions list`，核对目标。将来需要回到本次基线时，明确执行：

```bash
npx wrangler rollback e487272a-e0e6-4a70-aca9-ce6fa23ecdd8 --message "Restore verified production baseline"
```

本轮没有执行回滚。此版本属于新项目 alwaysaway-music，旧项目 constellation-archive 的版本 ID 不可用于这个新项目。

本目录不是 Git 仓库，没有创建远程仓库或伪造 Git commit。代码版本由 SHA-256 清单记录；可恢复快照为 `work/cloudflare/releases/production-20261015.tar.gz`，包含 src、部署脚本、配置、锁文件及当次 dist，不含凭据、完整 WAV 或工作资料。恢复应解包到新目录核对，不能直接覆盖当前工作区。

## 2026-10-16 线上 UI/UX 审查 V1

当前生产版本：`d593577f-dd12-4bae-a105-0994adc79b74`。域名仍为 `alwaysaway-music.liu1773237975.workers.dev`，本轮不继续改域名。

本轮仅修改前端交互、分类措辞和局部样式。作品数据、正式素材、音频和三维渲染核心未改。修复前源码快照在 `work/baselines/before-online-ux-v1-20261016/`。需要撤回本轮 UI/UX 修改时，可使用上文 `e487272a-e0e6-4a70-aca9-ce6fa23ecdd8` 回滚命令；本轮未实际执行回滚。

详细结果及截图：`outputs/online-ux-v1/验收报告.md`。

## 2026-10-16 详情播放器「双翼星潮」

当前生产版本：`9b6c382c-a3d8-40d7-a868-35d26ae0e728`，源码指纹 `7f313dc1066e2c2838aea6f081ef749653bda5479e3d009e9cb2e1cb30fe6f7f`。地址不变。

只更新共用详情播放器及音频分析视图；资源、内容和三维核心未改。可恢复基线 `work/baselines/before-stellar-tide-20261016/`；本轮前线上版本 `d593577f-dd12-4bae-a105-0994adc79b74`（未执行回滚）。详细验收及边界见 `outputs/stellar-tide/验收报告.md`。

## 2026-10-16 首页与星图「引力航行」

当前生产版本：`9bb5f8e7-961c-4242-8e61-edb0f68e617d`，源码指纹 `9d4783236c7c2880bd2b785759cc1375aaf1711447c25c2c4623e89dd8d32be6`。正式地址不变。

改动限于首页、星图渲染、导航动态偏好及其样式，作品内容、资源、详情播放器和试听抽屉保持基线字节一致。基线 `work/baselines/before-gravity-voyage-20261016/`；需要撤回本轮时的前一版本为 `9b6c382c-a3d8-40d7-a868-35d26ae0e728`，本轮未执行回滚。

本地与生产 Chrome / WebKit 真实 GPU WebGL 验收通过，真实 iPhone 和物理滚轮／触控板仍待用户验收。完整结果见 `outputs/gravity-voyage/验收报告.md`。
