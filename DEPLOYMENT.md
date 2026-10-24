# Cloudflare 手动部署与保护

正式站：<https://alwaysaway-music.liu1773237975.workers.dev/>

正式配置为 `wrangler.jsonc`，Worker 名称 `alwaysaway-music`。本次 GitHub 归档不重新部署、不调整 DNS、不更改账户设置，也不建立自动发布。

## 本地构建与验证

```sh
npm ci
npm run typecheck
node --test scripts/audio-worker.test.mjs
npm run build:production
npm run preview:production
```

最后一条在本机 4180 端口运行 Wrangler 本地模式，供音频 Range 和资源验证。关闭本地进程即可，不会更新线上 Worker。

生产准备脚本只清理 Vite 生成的 `dist/`，不会删除 `public/`。它会检查十首完整 MP3、25 段试听、正式图片和页面文件，拒绝缺失/超限资源，并生成 `work/cloudflare/build-manifest.json`。第 08 首在 dist 使用 `deploy/assets/artwork/08-official.jpg`，保留 public 中原图。

`deploy/audio-worker.mjs` 只处理 `/audio/*` 分段请求，复用 ASSETS；没有数据库、R2 或外部媒体存储。哈希路由使直接打开详情也请求根页面。缺失媒体应返回 404，不伪装成 HTML。

## 将来获准后才执行的正式发布

```sh
npx wrangler login
npx wrangler whoami
npx wrangler deployments list --config wrangler.jsonc
npm run deploy:production
```

`deploy:production` 读取正式配置并自动执行生产构建。必须核对账户、Worker 和产物后再运行。不要将本机凭据、Token、Cookie 放进 `.env.example`、源码或日志。网络代理如有需要只按本机实际设置，不复制旧日志中的端口。

本次归档时线上版本：`39bfb112-6052-4268-9706-ef883768df2e`，对应运行源码指纹 `6b1f6e19cf830f24ac0927ef5f7bf1424fc54f3744d0cec12aa69ff91768315f`。归档前已重新只读核对。

## 恢复已确认版本

代码恢复使用 `archive-2026-10-24` 标签，在新目录克隆构建，见 [RESTORE](docs/RESTORE.md)。当前分支仍有未提交工作时不要强制 reset。

如果未来需要 Cloudflare 回滚，先列出该 Worker 的部署与版本，确认目标仍可用，再在用户授权后执行：

```sh
npx wrangler rollback 39bfb112-6052-4268-9706-ef883768df2e --config wrangler.jsonc
```

Cloudflare 的历史版本保留并非长期源码备份；若目标部署已不可回滚，应从 Git 归档重新构建并手动发布。本轮不执行上述发布或回滚命令。
