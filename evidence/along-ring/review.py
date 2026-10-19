from pathlib import Path
import json,html
r=Path('outputs/along-ring')
parts=['''<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>沿环进入 · 实测对照</title><style>body{margin:0;background:#07090d;color:#d8dce4;font:16px/1.7 system-ui}main{max-width:1320px;margin:auto;padding:30px}h1{font-weight:400}h2{margin-top:48px;font-weight:450}p,figcaption{color:#aab4c5}a{color:#b8d6fa}.grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:18px}.two{grid-template-columns:repeat(2,minmax(0,1fr))}figure{margin:0}img{width:100%;height:auto;display:block}video{width:100%;max-height:720px;background:#020405}table{border-collapse:collapse;width:100%;font-variant-numeric:tabular-nums}td,th{text-align:left;padding:10px;border-bottom:1px solid #283242}small{color:#aab4c5}@media(max-width:700px){main{padding:18px}.grid,.two{grid-template-columns:1fr}table{font-size:12px}td,th{padding:5px}}</style><main><h1>首页 → 星图：沿环进入</h1><p>独立预览 · 正式站未更新。截图为本机真实 WebGL 页面；390 / 360 是桌面移动视口模拟，不是真实手机。</p><p><a href="https://alwaysaway-ring-entry-preview.liu1773237975.workers.dev/#home">打开预览</a></p><h2>三个连续中间状态 · 390 × 844</h2><div class="grid">''']
for name,label in [('A-expand','A · 扩大，保留环的负空间'),('B-near-band','B · 近侧星带与后方环弧'),('C-discovery','C · 第一首从同一锚点显露')]:parts.append(f'<figure><img src="handoff/390-{name}.png"><figcaption>{label}</figcaption></figure>')
parts.append('</div><h2>实际滚动录屏</h2><p>包含慢滑、快滑、中途反滑、菜单直达和第八首返回。移动录屏使用 Chrome CDP 触摸事件；视频编码帧率不代表网页 FPS。</p><div class="grid two">')
for w in [390,1440]:parts.append(f'<figure><video controls preload="metadata" src="handoff/{w}-handoff.mp4"></video><figcaption>{w}px 实际浏览器录屏</figcaption></figure>')
parts.append('</div><h2>同视口修改前 / 后</h2>')
for w in [390,360,1440]:
 for p in ['0','0.5','1']:
  parts.append(f'<p>{w}px · 归一化滚动进度 {p}（前后转场长度不同）</p><div class="grid two">')
  for phase,title in [('before','原六阶段'),('after','沿环进入')]:parts.append(f'<figure><img loading="lazy" src="{phase}/{w}-p{p}.png"><figcaption>{title}</figcaption></figure>')
  parts.append('</div>')
parts.append('<h2>无 WebGL 回退</h2><div class="grid">')
for p in ['0.25','0.48','0.72']:parts.append(f'<figure><img loading="lazy" src="anchors/fallback-full-{p}.png"><figcaption>静态坐标投影 · 进度 {p}</figcaption></figure>')
parts.append('</div><h2>同设备性能采样</h2><p>Apple M2，Chrome 155 / ANGLE Metal，关闭录屏，每段 5 秒。以下是主线程 rAF 间隔，不是 GPU 帧耗时。前后均未复现用户真机卡顿，不能据此宣称手机性能通过。</p><table><tr><th>宽度</th><th>场景</th><th>前 / 后 P95 ms</th><th>前 / 后 >34ms</th></tr>')
before=json.loads((r/'before/comparison.json').read_text());after=json.loads((r/'after/comparison.json').read_text());labels={'home':'首页','handoff-first':'首次交接','handoff-warm':'预热交接','map-scroll':'连续星图滚动','motif-rest':'停留星象','return':'详情返回'}
for b,a in zip(before,after):
 for x,y in zip(b['phases'],a['phases']):parts.append(f'<tr><td>{a["w"]}</td><td>{labels[y["phase"]]}</td><td>{x["p95"]:.1f} / {y["p95"]:.1f}</td><td>{x["over34"]} / {y["over34"]}</td></tr>')
parts.append('</table><p><a href="before/comparison.json">修改前原始记录</a> · <a href="after/comparison.json">修改后原始记录</a> · <a href="anchors/results.json">真实渲染锚点核对</a> · <a href="local/results.json">Chrome / WebKit 检查</a> · <a href="handoff/results.json">滚动和返回记录</a></p></main></html>')
(r/'review.html').write_text(''.join(parts))
