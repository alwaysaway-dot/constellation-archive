# 星河同源 V2 复验

完整基线 `baseline/river-source-v2-20261018` = `f29d2d9`（竖向星图预览）；正式基线仍为 `production/mobius-v11-20261018` = `c9267d4`。独立分支 `preview/river-source-v2`，独立 Worker 配置 `wrangler.river-source-preview.jsonc`。

```bash
npm run typecheck
npm run build:production
npm run preview -- --port 4185
node --test evidence/river-source-v2/model.test.mjs scripts/audio-worker.test.mjs
node evidence/river-source-v2/verify.cjs
node evidence/river-source-v2/handoff.cjs
node evidence/river-source-v2/record.cjs
node evidence/river-source-v2/performance.cjs
node evidence/river-source-v2/handoff-performance.cjs
node evidence/river-source-v2/edges.cjs
node evidence/river-source-v2/echo.cjs
```

以上浏览器脚本应串行执行，避免性能采样受多个测试浏览器争抢GPU影响。Playwright、Chrome、WebKit路径为本机验收依赖，未加入网站依赖。

`verify.cjs`支持`TEST_BASE` / `TEST_PROXY` / `TEST_STAGE`，两引擎、三视口检验实际标题字符边界、所有定位（含首曲）、返回、音频、减少动态及静态回退。`handoff.cjs`记录四阶段、正反滚动/停止、触摸模拟、十首实际截图。`record.cjs`补充节点三状态及中后段返回。

`model.test.mjs`校验共享端点/切线基础、采样可复现、十种不同包围轮廓及预算、焦点稳定区；`handoff-performance.cjs`记录两场景同时可见时的真实WebGL开销。测试数据为本机条件，不代表真实iPhone性能。

未经用户确认不得使用正式发布脚本。预览发布只运行：

```bash
npm run deploy:river-source-preview
```

手机渲染在闲置时限制为30Hz，滚动事件后的120ms内提高调度频率以跟随原生滚动，避免源头CSS位移与支流画布更新不同拍。录屏只是操作证据，性能采样另存。
