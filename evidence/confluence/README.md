# 声场交汇 V1 · 独立预览

本分支 `preview/field-confluence-v1` 从正式基线 `0be6e4bb68dbc9618e8de1f0a7faf63af0af4fa4` 创建。基线 tag：`production/gravity-voyage-20261016`；对应正式 Worker `alwaysaway-music` 的版本 `9bb5f8e7-961c-4242-8e61-edb0f68e617d`。本轮不部署正式 Worker。

原目录名称 Sound_Imprint_Preview 只是本地目录历史名称。未采用的声音显影实验保留在 `rejected/sound-imprint-v1-20261017`，本分支没有沿用其实现。

## 实现边界

- `field-shape.ts`：两片开放曲面，桌面与手机分别构图，同一几何定义也生成 SVG 回退。
- `FieldRenderer.ts`：透视相机、两片有深度的暗面 Mesh、两组批量线段；4 次绘制提交。低幅弯曲、局部指针响应与约 13 秒一周期中仅约 1.1 秒的环境信号，不宣称音频响应。
- `Confluence.tsx`：原生滚动驱动前后连续衔接；旧 GravityScene 保持同一实例和原节点，在交接结束前 inert；隐藏、减弱动态、离开页面时停止无用绘制。
- `confluence.css`：仅本轮首页/导航样式及嵌入星图的衔接。
- `main.tsx` / `NavigationVeil.tsx`：导航、连续首页/星图路由、观察位置保留。
- `AboutIdentity.tsx`：复用既有署名和一句创作者介绍的可关闭对话框，没有编造新页面或个人履历。
- `Pages.tsx`：仅添加目录初始筛选参数，使“其他作品”准确进入原目录的其他作品筛选。
- `wrangler.field-preview.jsonc`、package script、构建清单：独立预览 Worker；正式配置保持不变。

作品内容、45 个媒体文件（10 封面＋10 完整音频＋25 试听）、旧星图渲染、双翼星潮播放器及试听抽屉保持基线一致。

## 检查与构建

```bash
npm run typecheck
node --test scripts/audio-worker.test.mjs
npm run build:production
node evidence/confluence/verify.cjs
node evidence/confluence/gestures.cjs
```

本地测试默认 `http://127.0.0.1:4183/`，使用本机已安装的 Chrome、Playwright WebKit。TEST_BASE、TEST_STAGE、TEST_PROXY 可覆盖地址、结果目录与代理。浏览器依赖路径写在测试脚本开头，换机器需调整；未新增产品运行依赖。

只有独立预览发布命令可用于本轮：

```bash
npm run deploy:field-preview
```

测试结果、截图、录屏、最终交付报告在 `outputs/confluence/`，未纳入部署包。基线构建与线上对应证据在 `evidence/baseline/` 及 `outputs/baseline-restored/`。

## 恢复方式

正式站本轮未改，无需回退线上。现存旧版可运行工作区：
`/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_Production_Restore`。

需要从保留节点再建旧版时，在新目录执行：

```bash
git worktree add --detach /Users/liuxinyang/Documents/Codex/Constellation_Gravity_Baseline production/gravity-voyage-20261016
cd /Users/liuxinyang/Documents/Codex/Constellation_Gravity_Baseline
npm ci
npm run build:production
npm run preview -- --port 4184
```

不得用 reset --hard 覆盖其他工作。只有未来确认正式 Worker 被误更新且需恢复时，在基线目录核对版本后执行：

```bash
npx wrangler rollback 9bb5f8e7-961c-4242-8e61-edb0f68e617d --config wrangler.jsonc --message "Restore verified gravity voyage baseline"
```

本轮没有执行该回退命令，也没有在正式配置上运行 deploy。
