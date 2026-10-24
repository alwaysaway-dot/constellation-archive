# 从正式归档恢复

## 独立克隆

仓库现已公开，克隆无需登录。推送修改仍需要相应权限，不在文件中保存明文 Token。

```sh
git clone https://github.com/alwaysaway-dot/constellation-archive.git constellation-archive-restored
cd constellation-archive-restored
git switch --detach archive-2026-10-24
npm ci
npm run typecheck
npm run build:production
npm run dev
```

使用 Node.js 24 / npm 11。源码依赖从锁文件指定的 npmjs / npmmirror 地址安装，需要联网；网站媒体无需从原作者磁盘或生产站补拷。不要把原工程的 node_modules 符号链接复制进新目录。

构建后静态检查用 `npm run preview`；音频 Worker 本地检查用 `npm run preview:production`。本地运行无秘密环境变量要求。

## 完整性检查

```sh
node --test scripts/audio-worker.test.mjs evidence/review-round2/range.test.mjs evidence/along-ring/model.test.mjs
python3 - <<'PYCODE'
import hashlib, json
from pathlib import Path
for item in json.loads(Path('docs/ARCHIVE_ASSETS.json').read_text())['assets']:
    p = Path(item['path'])
    assert p.stat().st_size == item['bytes'], p
    assert hashlib.sha256(p.read_bytes()).hexdigest() == item['sha256'], p
print('归档素材完整')
PYCODE
```

`work/cloudflare/build-manifest.json` 应包含 55 个生产文件。运行源码指纹应与 `PROJECT_STATUS.md` 相同。该指纹不覆盖文档与 public 原件，素材另由 `ARCHIVE_ASSETS.json` 校验。浏览器自动化的旧证据脚本有本机 Chrome/Playwright 路径，迁移后需单独适配；它们不参与安装、构建和运行。

## 继续开发

```sh
git switch -c development/next-iteration
```

先保护现有改动，再开始新工作。默认 `main` 表示正式归档；历史 `preview/*` 与 `rejected/*` 是保留的实验及验收过程，不覆盖正式状态。所有历史分支可通过 `git branch -r` 查看。

## 不包含的本地材料

- `node_modules`、dist、Wrangler 登录缓存及系统缓存：重新安装或构建。
- `outputs/` 的录屏截图和性能原始记录、`work/` 的快照与全长试听工作素材：留在原机器，未作为网页必需文件上传。
- 源 WAV、音乐制作工程、用户 Downloads：不纳入本次工程归档。网页所需十首 MP3 与 25 段试听已归档，无关键媒体缺口。

不需要 Git LFS、R2 或额外付费存储。若要保存创作母带和历史录屏，应另行进行个人文件备份；此仓库不声称包含全部创作过程资料。

生产部署与 GitHub 相互独立，只有再次明确获准发布时才按根目录 `DEPLOYMENT.md` 操作。
