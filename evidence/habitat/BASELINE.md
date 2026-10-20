# 首页局部自然生境：恢复节点

- 实施分支：`preview/habitat-home`。
- 保留标签：`baseline/habitat-home-20261020`。
- 基线代码：`394a20546331c6811f0d76b50f127826ebeee91a`（正式展陈推广后的记录提交；实现包含 `63f9286`）。
- 正式 Worker：`alwaysaway-music`；当前版本 `43c94a6f-28fe-4d84-b5cd-f4c0c70021d6`。
- 基线重新构建成功，源指纹 `e2f735a94a1518ed594a56d7d65efcdf92adaf2efd276534e19f2b77cbe378c7`。
- 新预览 Worker：`alwaysaway-habitat-preview`；本轮不发布正式 Worker。
- 上一轮第一首专属视觉仍在 `preview/late-reply-01` / `cf5a4ca`，独立保留。
- 原有未跟踪 `node_modules` 符号链接未覆盖、未提交。

## 恢复

正式站没有变更，无需执行线上回退。要在另一目录重建基线，可执行：

```sh
git worktree add --detach ../habitat-baseline baseline/habitat-home-20261020
cd ../habitat-baseline
npm ci
npm run build:production
```

不要在有未提交工作的目录执行强制重置。若只撤回新交互，在 `src/MobiusHabitat.ts` 将 `HABITAT_ENABLED` 设为 `false`，重新构建并部署**预览**配置即可；全部现有页面及播放逻辑保留。

仅在将来明确需要恢复正式部署时，既有版本的恢复命令为：

```sh
npx wrangler rollback 43c94a6f-28fe-4d84-b5cd-f4c0c70021d6 --config wrangler.jsonc
```

本轮没有执行此命令。

## 基线证据

同目录 `../../outputs/habitat/before/` 保存实际首页、鼠标交互、进入星图截图和 `interaction.webm`；`performance.json` 为同设备基线记录。`production-before.txt` 为修改前读取的部署列表，`baseline-build.log` 为基线构建结果。输出目录保留在本机、不纳入网站资产。
