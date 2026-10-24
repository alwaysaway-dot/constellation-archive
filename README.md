# Constellation Archive｜星图档案馆

阿尾 / alwaysaway 的音乐作品档案。当前阶段已完成，进入阶段性归档；后续仍可继续维护。

正式网站：<https://alwaysaway-music.liu1773237975.workers.dev/>

## 当前成果

- 首页莫比乌斯星系、连续进入的纵向星图、十首精选作品及真实 WebGL 表现。
- 统一详情展陈、正式封面与文字、单音频会话、双翼星潮播放器、阅读时迷你控制及来源位置恢复。
- 25 首其他作品的无封面列表、分类搜索、抽屉详情与已确认的 30 秒试听。
- 关于页、窄屏导航、减少动态与 WebGL 不可用回退。专辑仅作辅助归属，没有独立专辑入口。

本仓库现由创作者授权公开，用于展示与保存工程历史。仓库公开不等于授予音乐、图片或源码的开源使用许可；本项目未添加开源许可证。

## 技术与启动

React 19、TypeScript 5.8、Vite 6、Three.js 0.186.1、Wrangler 4.151.0；精确安装版本以 `package-lock.json` 为准。归档恢复使用 Node.js 24 / npm 11 验证。

```sh
npm ci
npm run dev
```

打开 <http://127.0.0.1:4173/>。同一局域网设备访问可使用 `npm run dev:lan`，访问运行机器的实际局域网 IP。

```sh
npm run typecheck
node --test scripts/audio-worker.test.mjs evidence/review-round2/range.test.mjs evidence/along-ring/model.test.mjs
npm run build:production
npm run preview
```

`build:production` 生成 `dist/`，检查实际发布资源并输出 `work/cloudflare/build-manifest.json`。`preview` 是前端静态检查；本地检查音频 Range Worker 使用 `npm run preview:production`，端口 4180。

## 目录与资源

- `src/`：界面、内容、路由、音频管理、Three.js 场景和内嵌 Shader。
- `public/artwork/`：十首正式封面原件与保留的旧概念 SVG；生产构建只发布实际使用资源。
- `public/audio/`：十首精选 MP3；`previews/` 为 25 段真实试听。完整 WAV 母带不属于网页构建依赖，不在本归档中。
- `public/identity/`：现有正式站使用的肖像和联系二维码。
- `deploy/`：音频分段 Worker、安全头，以及第 08 首经过授权的线上图片副本；原始图片仍保留。
- `scripts/`：构建准备及 Worker 测试；`evidence/`：历史验收脚本和记录。
- `wrangler.jsonc`：正式 Worker 配置；其他 Wrangler 配置仅用于已有独立预览。

所有运行图片和音频均纳入 Git，不依赖本机媒体目录。字体使用系统字体栈，没有需另行下载的远程字体文件。素材哈希清单见 [归档资源清单](docs/ARCHIVE_ASSETS.json)。

## 认证与发布

本地开发与构建不需要秘密环境变量，无需 `.env`。手动发布需要用户自行授权 Cloudflare；凭据由 Wrangler 管理，不能写入仓库。`account_id` 是配置标识，不是 API Token。

**GitHub push 不触发生产发布。** 未设置 GitHub Actions 或 Cloudflare Git 集成。只有明确授权更新正式站时，才执行 [部署说明](DEPLOYMENT.md) 中的手动命令。

## 归档与恢复

封板标签：`archive-2026-10-24`。生产运行代码来自 `14a508a`，发布验收记录位于 `ea2f3b9`；本次仅调整忽略规则和文档，不改运行代码。

- [恢复工程](docs/RESTORE.md)
- [当前状态、限制与归档边界](docs/PROJECT_STATUS.md)
- [最近正式发布记录](evidence/review-round2/正式发布记录.md)

旧版 README / 部署日志仍完整保存在 Git 历史中，可通过 `git show ea2f3b9:README.md` 查看。历史实验分支与 `rejected/*` 标签仅用于追溯，不能当作当前正式版本启动或发布。
