# 莫比乌斯星系 V1.1 验收复现

代码目录：`/Users/liuxinyang/Documents/Codex/E池_Constellation_Archive_Sound_Imprint_Preview`。
本机测试工具为 Playwright、Chrome 155、WebKit 26.5；脚本中的可执行路径需在其他机器上调整，不是网站运行依赖。

```bash
npm run build
npm run preview -- --port 4183
node --test evidence/mobius-v11/model.test.mjs evidence/mobius-v11/input.test.mjs scripts/audio-worker.test.mjs
node evidence/mobius-v11/verify.cjs
node evidence/mobius-v11/inputs.cjs
node evidence/mobius-v11/flow.cjs
node evidence/mobius-v11/edge-cases.cjs
node evidence/mobius-v11/gestures.cjs
node evidence/mobius-v11/lifecycle.cjs
PROFILE_OUT=outputs/mobius-v11/after-performance.json node evidence/mobius/profile.cjs
node evidence/mobius-v11/profile-input.cjs
```

输入录屏中的小圆圈是验收脚本添加的指针/触点位置标记，非网站光效。真实网页没有持续追随手指的光点。
`inputs.cjs` 实际发送鼠标或 CDP 触摸事件，依次验证接近/离开、远处无效轻触、主体轻触、微小误差、横向意图、有限倾转、松手恢复、纵向原生滚动至星图。
`profile-input.cjs` 为合成 PointerEvent 流的开销采样；不能称为真实硬件输入性能。
`lifecycle.cjs` 检查两引擎的悬停、菜单暂停、减弱动态、卸载后监听解除和断点重建次数。
`verify.cjs` 含两引擎三视口、回退、真实音频与导航回归。

浏览器测试支持 `TEST_BASE`、`TEST_STAGE`（输出子目录），部分网络测试支持 `TEST_PROXY`；性能采样应串行执行，避免多浏览器争抢GPU。不得以录屏文件FPS冒充渲染FPS。
