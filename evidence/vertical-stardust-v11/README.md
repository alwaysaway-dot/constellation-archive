# 竖向星尘航道 V1.1 复验

独立分支 `preview/vertical-stardust-v11`，基于 `production/mobius-v11-20261018`。原三维星图 `GravityScene.tsx` / `GravityRenderer.ts` 完整保留，新版仅替换 main.tsx 的星图组件引用并导入作用域样式。

```bash
npm run typecheck
npm run build:production
npm run preview -- --port 4185
node --test evidence/vertical-stardust-v11/model.test.mjs scripts/audio-worker.test.mjs
node evidence/vertical-stardust-v11/verify.cjs
node evidence/vertical-stardust-v11/record.cjs
node evidence/vertical-stardust-v11/performance.cjs
node evidence/vertical-stardust-v11/edges.cjs
```

浏览器路径针对本机 Chrome / WebKit；脚本中的 Playwright 为本机验收工具，不属于网站依赖。`verify.cjs` 支持 `TEST_BASE` / `TEST_PROXY` / `TEST_STAGE`，可复验独立预览。录屏和性能采样应串行运行，避免多个浏览器争抢GPU。`record.cjs` 的小圆圈是测试指针/触点标记，非产品光效。

`verify.cjs`：两引擎×三个视口，标题边界/顺序、自然正反滚动、索引定位、锁滚/关闭、末段和中段返回、播放续播、减弱、其他作品试听、WebGL不可用回退。
`record.cjs`：桌面真实滚轮事件 + CDP原生触摸事件；三种状态节点位置一致；移动端第08首回到原scrollY。
`performance.cjs`：每视口闲置与滚动各4秒；记录rAF间隔、实际绘制次数、CPU提交和Long Tasks；模态暂停及卸载。
`edges.cjs`：键盘、直接详情入口、索引遮罩关闭、模拟后台、实际WebGL context loss及系统减弱优先。

移动宽度模拟不是iPhone实机；rAF间隔和录屏编码帧率不是GPU帧耗时。静态回退使用同源三维样本投影，不伪称运行了WebGL。
