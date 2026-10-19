from pathlib import Path
r=Path('outputs/six-stage')
parts=['''<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>星图档案馆 · 本轮预览证据</title><style>body{background:#080d12;color:#dce1e6;font:15px/1.8 system-ui;margin:0 auto;padding:40px 5%;max-width:1440px}h1,h2{font-weight:400}a{color:#bdcede}section{margin:45px 0}.grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(230px,1fr));gap:20px}.grid img{width:100%;height:auto;display:block}figure{margin:0;background:#030609}figcaption{padding:10px 12px;color:#a7b5c1}video{width:100%;max-height:850px}p{max-width:900px}small{color:#96a8b7}.mobile{max-width:390px}</style><h1>星图档案馆｜六阶段转场与个人名片</h1><p><a href="https://alwaysaway-passage-preview.liu1773237975.workers.dev/#home">打开独立预览</a> · 正式站保持原版本。以下为本机真实 WebGL 浏览器记录；移动尺寸是桌面模拟，不是真 iPhone 性能验收。</p>''']
def figure(src,label):return f'<figure><a href="{src}"><img loading="lazy" src="{src}" alt="{label}"></a><figcaption>{label}</figcaption></figure>'
for w in [1440,390,360]:
 parts.append(f'<section><h2>{w}px｜旧 / 新首页同视口</h2><div class="grid">'+figure(f'before/pages/chromium-{w}-home.png','修改前 · 正式基线')+figure(f'local/chromium-{w}-home.png','修改后 · 独立预览')+'</div></section>')
for w in [1440,390]:
 parts.append(f'<section><h2>{w}px｜六个实际滚动状态</h2><div class="grid">')
 for name,label in [('01-source','01 完整环体'),('02-release','02 扩大与分散'),('03-dark','03 暗场余星'),('04-river','04 宽河铺展'),('05-retreat','05 后撤'),('06-archive','06 竖向星图')]:parts.append(figure(f'handoff/{w}-{name}.png',label))
 parts.append(f'</div><h2>实际输入与返回录屏 · {w}px</h2><video controls preload="metadata" src="handoff/{w}-handoff.mp4"></video><p>前段定位六个滚动状态，随后执行滚轮/触摸慢滑、快滑、反滑、菜单直接进入、作品详情与返回。播放器录屏容器帧率不等于页面渲染帧率。</p></section>')
parts.append('<section><h2>十首原有星象</h2><div class="grid">')
for i in range(1,11):parts.append(figure(f'handoff/motif-{i}.png',f'{i:02} 保留原有轮廓与内部流动'))
parts.append('</div></section>')
for name,label in [('menu','导航'),('works','作品档案'),('about','独立关于'),('qr','微信二维码'),('drawer','试听抽屉')]:
 parts.append(f'<section><h2>{label}</h2><div class="grid">')
 for w in [1440,390,360]:parts.append(figure(f'support/chromium-{w}-{name}.png',f'{w}px · {label}'))
 parts.append('</div></section>')
parts.append('<section><h2>降级与减少动态</h2><div class="grid">'+figure('local/chromium-fallback.png','WebGL 不可用 · 可点击竖向星图')+figure('context-loss.png','实际 WebGL 上下文丢失后回退')+figure('support/chromium-390-reduced-home.png','系统减少动态 · 首页完整构图')+'</div></section>')
parts.append('<section><h2>验收边界</h2><p>Apple M2，Chrome 155、WebKit 26.5，1440×900 / 390×844 / 360×740。内容与音源保持；关于三段原文、邮箱、头像与二维码分别核对。二维码通过 Apple Vision 解码一致性验证，未执行微信添加好友。性能测量为同机浏览器 rAF 与 Long Tasks，非真实手机 GPU 完帧时间。真 iPhone、安全区与地址栏实际行为、温升和长期性能待用户验收。</p><p><a href="../../evidence/six-stage/交付报告.md">完整交付报告</a> · <a href="local/results.json">浏览器回归</a> · <a href="support/results.json">辅助页面回归</a> · <a href="handoff/results.json">动态路径结果</a> · <a href="before-final/comparison.json">基线同机性能</a> · <a href="after/comparison.json">新版同机性能</a></p></section>')
(r/'review.html').write_text(''.join(parts))
