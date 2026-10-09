// Builds deck.html (one 1920x1080 section per slide) + notes.json
const fs = require('fs');
const path = require('path');
const FONT = process.env.FONT_DIR; // .../node_modules/@fontsource
const IMG = f => 'file://' + path.join(__dirname, '..', 'img', f);

const css = `
@import url('file://${FONT}/michroma/400.css');
@import url('file://${FONT}/geist-sans/200.css');
@import url('file://${FONT}/geist-sans/300.css');
@import url('file://${FONT}/geist-sans/400.css');
@import url('file://${FONT}/geist-sans/500.css');
@import url('file://${FONT}/geist-mono/400.css');
@import url('file://${FONT}/noto-sans-sc/300.css');
@import url('file://${FONT}/noto-sans-sc/400.css');
@import url('file://${FONT}/noto-sans-sc/500.css');
:root{--bg:#0C0D0F;--fg:#F3F3F1;--mute:rgba(243,243,241,.64);--dim:rgba(243,243,241,.38);--line:rgba(255,255,255,.12);--blue:#1E5FC8;--card:#141518}
*{margin:0;padding:0;box-sizing:border-box}
body{background:#000}
.s{text-spacing-trim:space-all;font-feature-settings:normal;width:1920px;height:1080px;position:relative;overflow:hidden;background:var(--bg);color:var(--fg);font-family:'Geist Sans','Noto Sans SC',sans-serif;font-weight:300;-webkit-font-smoothing:antialiased}
.cp{font-family:'Noto Sans SC';font-feature-settings:normal}
.mono{font-family:'Geist Mono','Noto Sans SC',monospace;font-weight:400;letter-spacing:.08em;text-transform:uppercase}
.disp{font-family:'Michroma',sans-serif;font-weight:400}
.chrome{position:absolute;font-size:13px;color:var(--dim)}
.tl{left:120px;top:56px}.tr{right:120px;top:56px}.br{right:120px;bottom:52px}.bl{left:120px;bottom:52px}
.bl b{color:var(--blue);font-weight:400}
.head{position:absolute;left:120px;top:122px;right:120px}
.head .eb{font-size:14px;color:var(--blue);margin-bottom:22px}
.head h1{font-size:50px;font-weight:300;letter-spacing:-.01em;line-height:1.2}
.head h1 b{font-weight:500}
.head p{margin-top:18px;font-size:21px;color:var(--mute);max-width:1180px;line-height:1.6}
.rule{position:absolute;left:120px;right:120px;height:1px;background:var(--line)}
img.shot{position:absolute;display:block;object-fit:cover;outline:1px solid rgba(255,255,255,.08)}
svg.ov{position:absolute;left:0;top:0;width:1920px;height:1080px;pointer-events:none}
.co{position:absolute;width:410px}
.co .n{font-size:12px;color:var(--blue);margin-bottom:8px}
.co h3{font-size:21px;font-weight:500;line-height:1.35}
.co .sp{font-size:12.5px;color:var(--dim);margin-top:6px}
.co p{font-size:15px;color:var(--mute);line-height:1.55;margin-top:6px}
.cols{position:absolute;left:120px;right:120px;display:grid;gap:56px}
.cols .co{position:static;width:auto}
`;

const slides = [];
let total = 0;
function S(section, html, notes, opts = {}) { slides.push({ section, html, notes, opts }); }

const chrome = (sec, i, tot, light) => `
<div class="chrome tl mono">MAXUS · Homepage Web UI</div>
<div class="chrome tr mono">${sec}</div>
<div class="chrome bl mono"><b>Drive the Charge</b>&nbsp;&nbsp;驭电先行</div>
<div class="chrome br mono">${String(i).padStart(2, '0')} / ${String(tot).padStart(2, '0')}</div>`;

const head = (eb, title, lede) => `<div class="head"><div class="eb mono">${eb}</div><h1>${title}</h1>${lede ? `<p>${lede}</p>` : ''}</div>`;

// screenshot + callouts on the right with leader lines
function shot(file, fw, fh, pts, items, o = {}) {
  const X = 120, Y = o.y || 330, MW = o.mw || 1150, MH = o.mh || 620;
  let w = MW, h = w * fh / fw; if (h > MH) { h = MH; w = h * fw / fh; }
  const cx = 1390, top = Y, avail = 1010 - Y;
  const step = avail / items.length;
  let svg = '', cos = '';
  items.forEach(([t, sp, d], i) => {
    const ly = top + i * step;
    const [px0, py0] = pts[i];
    const px = X + px0 / fw * w, py = Y + py0 / fh * h;
    svg += `<path d="M${px} ${py} L${cx - 70} ${ly + 30} L${cx - 22} ${ly + 30}" fill="none" stroke="rgba(255,255,255,.42)" stroke-width="1"/>
      <circle cx="${px}" cy="${py}" r="7" fill="rgba(12,13,15,.55)" stroke="#fff" stroke-width="1.2"/><circle cx="${px}" cy="${py}" r="2.2" fill="#fff"/>`;
    cos += `<div class="co" style="left:${cx}px;top:${ly}px"><div class="n mono">${String(i + 1).padStart(2, '0')}</div><h3>${t}</h3><div class="sp mono">${sp}</div><p>${d}</p></div>`;
  });
  return `<img class="shot" src="${IMG(file)}" style="left:${X}px;top:${Y}px;width:${w}px;height:${h}px">${cos}<svg class="ov">${svg}</svg>`;
}
// wide image with callouts in columns below; markers numbered
function wide(imgs, pts, items, o = {}) {
  const Y = o.y || 330; let html = '', svg = '';
  imgs.forEach(([file, x, w, h]) => { html += `<img class="shot" src="${IMG(file)}" style="left:${x}px;top:${Y}px;width:${w}px;height:${h}px">`; });
  pts.forEach(([n, x, y]) => {
    svg += `<circle cx="${x}" cy="${y}" r="13" fill="rgba(12,13,15,.7)" stroke="#fff" stroke-width="1.2"/><text x="${x}" y="${y + 4.5}" text-anchor="middle" font-family="Geist Mono" font-size="12" fill="#fff">${String(n).padStart(2, '0')}</text>`;
  });
  const ch = imgs[0][3];
  html += `<div class="cols" style="top:${Y + ch + 56}px;grid-template-columns:repeat(${items.length},1fr)">` +
    items.map(([t, sp, d], i) => `<div class="co"><div class="n mono">${String(i + 1).padStart(2, '0')}</div><h3>${t}</h3><div class="sp mono">${sp}</div><p>${d}</p></div>`).join('') + '</div>';
  return html + `<svg class="ov">${svg}</svg>`;
}
const fullbleed = (file, grad, pos = 'center') => `<div style="position:absolute;inset:0;background:url('${IMG(file)}') ${pos}/cover"></div><div style="position:absolute;inset:0;background:${grad}"></div>`;

// ─────────────── COVER
S('', `${fullbleed('bg_pickup.jpg', 'linear-gradient(90deg,rgba(12,13,15,.96) 0%,rgba(12,13,15,.82) 34%,rgba(12,13,15,.15) 70%,rgba(12,13,15,.3) 100%),linear-gradient(0deg,rgba(12,13,15,.7),rgba(12,13,15,0) 40%)', '70% 60%')}
<img src="${IMG('logo_white.png')}" style="position:absolute;left:120px;top:96px;width:200px">
<div class="mono" style="position:absolute;left:120px;top:380px;font-size:15px;color:var(--blue)">Homepage Web UI · Design Rationale</div>
<div style="position:absolute;left:120px;top:428px;font-size:92px;font-weight:300;line-height:1.12;letter-spacing:-.01em">官网首页<br>设计说明</div>
<div style="position:absolute;left:124px;top:676px;font-size:22px;color:var(--mute);line-height:1.6">字体、字号、颜色、间距，以及每一屏为什么这样设计。</div>
<div class="disp" style="position:absolute;left:120px;bottom:120px;font-size:26px;letter-spacing:.02em">Drive the Charge</div>
<div class="mono" style="position:absolute;left:122px;bottom:90px;font-size:13px;color:var(--dim)">驭电先行 · 2026.10</div>`,
  '开场：这份文件说明首页每个设计决定的原因——字体、字号、颜色、间距，以及每一屏要表达什么。所有理由都来自贵司的《品牌升级方案 v3》、9/24 和 9/29 两次内容架构会议，以及客户确认的竞品参考。', { nochrome: true });

// ─────────────── CONTENTS
S('Contents', `
<div style="position:absolute;left:120px;top:200px;font-size:88px;font-weight:300">目录</div>
<div class="disp" style="position:absolute;left:124px;top:330px;font-size:18px;color:var(--dim)">Contents</div>
<img src="${IMG('mark_gray.png')}" style="position:absolute;left:-60px;bottom:-80px;width:620px;opacity:.55">
${[['00', '设计依据', 'Basis · References · Principles'], ['01', '设计系统', 'Typography · Color · Spacing · Hover'], ['02', '逐屏说明', 'Screen by Screen'], ['03', '动效与待确认', 'Motion · Next Steps']].map(([n, t, e], i) => `
<div style="position:absolute;left:860px;right:120px;top:${200 + i * 170}px;height:170px;border-top:1px solid var(--line);display:flex;align-items:center">
  <div style="font-size:96px;font-weight:200;color:rgba(255,255,255,.28);width:240px;letter-spacing:-.02em">${n}</div>
  <div style="flex:1;text-align:right"><div style="font-size:36px;font-weight:400">${t}</div><div class="mono" style="font-size:13px;color:var(--dim);margin-top:12px">${e}</div></div>
</div>`).join('')}
<div class="rule" style="left:860px;top:880px"></div>`, '目录：设计依据 → 设计系统 → 逐屏说明 → 动效与问答。');

// ─────────────── BASIS
S('00 — Basis', `${head('00 — Design Basis', '设计依据：<b>贵司的品牌方案和会议结论</b>', '这一版的每个设计决定，都能在下面三份材料里找到出处。')}
<div class="cols" style="top:470px;grid-template-columns:repeat(3,1fr);gap:64px">
${[['品牌升级方案 v3', ['口号 Drive the Charge / 驭电先行', '核心色为黑白，去装饰化', '新 Logo 线条由粗变细', '亮蓝只作点缀，代表电动', 'European-born · Since 1896 · 100+ 国家']],
   ['9/24 · 9/29 会议纪要', ['首页目标：提升品牌调性', '参考奢侈品官网的排版与质感', '首页不放配置表，车型按车系展示', 'News 与 Blog 合并为 News & Insights', '页脚只放直达链接']],
   ['受众与竞品', ['受众：车队、司机、工程现场用户', '风格要 Professional，不是 Business', 'UI 参考：梅赛德斯-奔驰、沃尔沃', '内容参考：福特、丰田、铃木', '全球站负责品牌展示，不直接卖车']]].map(([t, l], i) => `
<div style="border-top:1px solid rgba(255,255,255,.3);padding-top:28px">
  <div class="mono" style="font-size:13px;color:var(--blue)">0${i + 1}</div>
  <div style="font-size:30px;font-weight:400;margin:14px 0 30px">${t}</div>
  ${l.map(x => `<div style="font-size:19px;color:var(--mute);line-height:1.5;padding:13px 0;border-bottom:1px solid var(--line)">${x}</div>`).join('')}
</div>`).join('')}</div>`, '客户最认可的是“按你们自己定的方向做的”。品牌方案、会议纪要、受众与竞品——后面每一页的理由都来自这三处。');

// ─────────────── REFERENCES
S('00 — References', `${head('00 — References', '竞品参考：<b>UI 看奔驰、沃尔沃，内容看福特、丰田、铃木</b>')}
<div class="cols" style="top:400px;grid-template-columns:1fr 1fr;gap:96px">
${[['UI', 'Mercedes-Benz · Volvo', [['字体简洁、层级清楚', '标题不加粗，用字号区分层级；全站一套字体。'], ['按钮悬停有反馈', '悬停只变色、箭头右移，清楚但不花哨。会议纪要点名参考奔驰。'], ['大图加留白', '整屏实拍大图，文字少而集中。'], ['黑白为主', '界面以黑白灰为主，颜色只做点缀。']]],
   ['Content', 'Ford · Toyota · Suzuki', [['按车系组织产品', '先选车型类别，再进入详情。'], ['动力形式用图标标出', '纯电、混动、柴油一眼可辨。会议纪要提到参考丰田。'], ['讲用途和场景', '用实际工作场景介绍车辆和技术，不堆参数。'], ['引导到国家站', '全球站做展示，价格和配置交给国家站。']]]].map(([k, b, l]) => `
<div>
  <div class="mono" style="font-size:13px;color:var(--blue)">${k}</div>
  <div class="disp" style="font-size:26px;margin:16px 0 34px;letter-spacing:.01em">${b}</div>
  ${l.map(([h, d]) => `<div style="display:flex;gap:28px;padding:20px 0;border-top:1px solid var(--line)"><div style="width:240px;font-size:20px;font-weight:400">${h}</div><div style="flex:1;font-size:17px;color:var(--mute);line-height:1.6">${d}</div></div>`).join('')}
</div>`).join('')}</div>`, '客户方确认的对标：UI 层面参考梅赛德斯-奔驰、沃尔沃；内容层面（更偏功能）参考福特、丰田、铃木。动力形式图标目前首页还没有，建议下一版在车型区补上。');

// ─────────────── PRINCIPLES
S('00 — Principles', `${head('00 — Principles', '这一版主要做了<b>三件事</b>')}
<div class="cols" style="top:390px;grid-template-columns:repeat(3,1fr);gap:72px">
${[['统一规范', 'Consistency', '原稿里 Michroma、Arimo、D-DIN 混用，字号和间距也不统一。现在整理成一套：12 级字号、16 个颜色、间距统一用 8 的倍数，各国站可以直接沿用。'],
   ['减少干扰', 'Less noise', '去掉界面里的大面积蓝色和多余装饰，按钮改为“文字 + 箭头”。页面元素少了，车和画面更突出。'],
   ['突出全球布局', 'Global → Local', '原来的照片拼贴信息多但不聚焦。现在用地球展示 100+ 国家，按用户 IP 定位到所在国家，再展示当地用车照片。']].map(([t, e, d], i) => `
<div>
  <div style="font-size:150px;font-weight:200;line-height:1;letter-spacing:-.04em;color:rgba(255,255,255,.9)">0${i + 1}</div>
  <div style="border-top:1px solid rgba(255,255,255,.3);margin-top:34px;padding-top:30px;font-size:34px;font-weight:400">${t}</div>
  <div class="mono" style="font-size:13px;color:var(--dim);margin-top:12px">${e}</div>
  <div style="font-size:19px;color:var(--mute);line-height:1.7;margin-top:26px">${d}</div>
</div>`).join('')}</div>`, '品牌方案要求“黑白核心色、去装饰化”；会议要求首页“提升调性、参考奢侈品官网”。因此做了三件事：统一规范、减少干扰、突出全球布局。');

// ─────────────── STRUCTURE
{
  const th = [['hero.jpg', '01', '首屏'], ['globe0.jpg', '02', '全球'], ['globeA.jpg', '02a', '本地'], ['globeB.jpg', '02b', '数据'], ['vehicles.jpg', '03', '车型'], ['tech.jpg', '04', '科技'], ['electric.jpg', '05', '电驱'], ['offroad.jpg', '06', '越野'], ['news.jpg', '07', '资讯'], ['subscribe.jpg', '08', '订阅'], ['footer.jpg', '09', '页脚']];
  const gw = (1680 - 10 * 14) / 11;
  S('00 — Structure', `${head('00 — Page Structure', '首页结构：<b>10 屏，分三部分</b>')}
${th.map(([f, n, t], i) => `<div style="position:absolute;left:${120 + i * (gw + 14)}px;top:350px;width:${gw}px">
  <div style="height:200px;background:url('${IMG(f)}') center/cover;outline:1px solid rgba(255,255,255,.08)"></div>
  <div class="mono" style="font-size:12px;color:var(--dim);margin-top:16px">${n}</div><div style="font-size:19px;font-weight:400;margin-top:6px">${t}</div></div>`).join('')}
<div class="cols" style="top:700px;grid-template-columns:repeat(3,1fr);gap:64px">
${[['介绍品牌', '首屏 · 全球 · 数据', '先讲欧洲出身、1896 年起步、100+ 国家。品牌方案提到，欧洲血统是海外用户建立信任最快的方式。'], ['介绍产品', '车型 · 科技 · 电驱 · 越野', '按车系和技术能力介绍，不放具体型号和配置表（9/29 会议结论）。'], ['保持联系', '资讯 · 订阅 · 页脚', '资讯区展示新闻；订阅是全页唯一的实心按钮；页脚只放直达链接。']].map(([t, s, d]) => `
<div style="border-top:1px solid rgba(255,255,255,.3);padding-top:24px"><div style="font-size:26px;font-weight:400">${t}</div><div class="mono" style="font-size:12px;color:var(--dim);margin-top:10px">${s}</div><div style="font-size:17px;color:var(--mute);line-height:1.65;margin-top:16px">${d}</div></div>`).join('')}</div>`,
    '整页按三部分组织：介绍品牌 → 介绍产品 → 保持联系。深浅屏交替，长页面读起来有节奏。');
}

// ─────────────── CHAPTER helper
function chapter(no, cn, en, file, note, pos) {
  S('', `${fullbleed(file, 'linear-gradient(90deg,rgba(12,13,15,.94) 0%,rgba(12,13,15,.7) 45%,rgba(12,13,15,.2) 100%)', pos)}
<div style="position:absolute;left:110px;top:250px;font-size:260px;font-weight:200;letter-spacing:-.05em;line-height:1;color:rgba(255,255,255,.92)">${no}</div>
<div style="position:absolute;left:120px;top:560px;font-size:80px;font-weight:300">${cn}</div>
<div class="disp" style="position:absolute;left:124px;top:690px;font-size:20px;color:var(--mute)">${en}</div>
<div class="rule" style="top:760px;right:auto;width:560px;background:rgba(255,255,255,.3)"></div>`, note, { nochrome: true });
}

// ─────────────── BENCHMARK 1: type numbers vs Volvo / WCAG
{
  const rows = [
    ['板块标题字号', 'H1 · 56px', 'heading-1 最大 56px', 'Volvo Cars 设计系统', '与 Volvo 官网规范完全一致'],
    ['标题字重', 'Regular，不加粗', '标题统一 400（Regular）', 'Volvo Cars 设计系统', '高端车企标题同样不加粗'],
    ['正文字号', '20px', '正文档位 16 / 20 / 24px', 'Volvo Cars 设计系统', '取其中大屏更易读的 20'],
    ['正文行高', '150%', '16px 正文行高 1.5', 'Volvo · W3C WCAG', 'WCAG 建议行距至少 1.5 倍'],
    ['一行字数', '620–820px ≈ 60–75 字符', '每行不超过 80 个字符', 'W3C WCAG 2.1 · 1.4.8', '控制在规范范围内'],
    ['最小字号', '14px（标签）', '最小 12px（micro）', 'Volvo Cars 设计系统', '比 Volvo 更大一档，更易读'],
  ];
  S('00 — Benchmark', `${head('00 — Industry Benchmark', '行业对标：<b>我们的字号，和 Volvo 官方规范对得上</b>', 'Volvo 官网公开了它的网页设计系统。把 MAXUS 首页的数字和它逐项对照：')}
<div style="position:absolute;left:120px;right:120px;top:380px">
  <div class="mono" style="display:flex;font-size:12px;color:var(--dim);padding-bottom:16px"><div style="width:300px">项目</div><div style="width:360px;color:var(--blue)">MAXUS 首页</div><div style="width:420px">行业标杆</div><div style="width:300px">来源</div><div style="flex:1">结论</div></div>
  ${rows.map(([a, m, v, src, c]) => `<div style="display:flex;align-items:center;height:76px;border-top:1px solid var(--line)">
    <div style="width:300px;font-size:19px;font-weight:400">${a}</div>
    <div style="width:360px;font-size:22px;font-weight:400;color:#fff">${m}</div>
    <div style="width:420px;font-size:19px;color:var(--mute)">${v}</div>
    <div class="mono" style="width:300px;font-size:12px;color:var(--dim)">${src}</div>
    <div style="flex:1;font-size:16px;color:var(--mute)">${c}</div></div>`).join('')}
  <div style="border-top:1px solid var(--line)"></div>
  <div class="mono" style="font-size:11px;color:var(--dim);margin-top:20px;text-transform:none;letter-spacing:.02em">来源：designsystem.volvocars.com/web/core-concepts/typography · w3.org/WAI/WCAG21/Understanding/visual-presentation</div>
</div>`, '这一页是说服客户的关键：我们的字号不是拍脑袋定的。Volvo 公开的网页设计系统里，板块大标题 heading-1 最大就是 56px、字重 Regular（400），正文行高 1.5——和我们的规范一致。W3C 无障碍规范（WCAG）也建议行距至少 1.5 倍、每行不超过 80 个字符。');
}

// ─────────────── BENCHMARK 2: one typeface, monochrome, unified
S('00 — Benchmark', `${head('00 — Industry Benchmark', '行业对标：<b>统一字体、黑白标识，是一线车企共同的方向</b>')}
<div class="cols" style="top:330px;grid-template-columns:repeat(3,1fr);gap:64px">
${[['统一设计语言', 'Mercedes-Benz', '奔驰请 Edenspiekermann 做数字设计升级，原因是品牌设计语言“已经变得零散”，目标是统一品牌和产品体验：“品牌在最小的触点上也要同样一致。”', 'edenspiekermann.com · Mercedes-Benz case study'],
   ['全站一套主字体', 'Toyota · Volvo', '丰田品牌规范明确写着“不要使用 Toyota Type 以外的字体”。Volvo 规定 Volvo Novum 用于标题、正文、说明等绝大部分文字。', 'brand.toyota.com · design.volvocars.com'],
   ['标识走向扁平、单色', 'Mini · Citroën · Audi · VW · BMW', '2015–2020 年，Mini、雪铁龙、奥迪、大众、宝马相继把立体标识改为扁平设计，理由是在手机等数字屏幕上更清晰、更通用。', 'Dezeen · Seven car brands that have returned to flat logo designs (2020)']].map(([t, b, d, src]) => `
<div style="border-top:1px solid rgba(255,255,255,.3);padding-top:26px">
  <div style="font-size:30px;font-weight:400">${t}</div>
  <div class="disp" style="font-size:16px;color:var(--blue);margin-top:14px">${b}</div>
  <div style="font-size:18px;color:var(--mute);line-height:1.7;margin-top:26px">${d}</div>
  <div class="mono" style="font-size:11px;color:var(--dim);margin-top:24px;text-transform:none;letter-spacing:.02em">${src}</div>
</div>`).join('')}</div>
<div style="position:absolute;left:120px;right:120px;top:830px;border-top:1px solid var(--line);padding-top:26px;display:flex;gap:40px;align-items:baseline">
  <div class="mono" style="font-size:13px;color:var(--blue);width:200px">MAXUS 的做法</div>
  <div style="flex:1;font-size:20px;line-height:1.6">全站收成一套规范：标题用品牌字体 Michroma，其余统一用 Geist；颜色以黑白为主——与新标识的黑白方向一致，也与上述车企的做法一致。</div>
</div>`, '客户问“是不是别人也这么做”，这一页给出答案：奔驰做设计升级的出发点就是“设计语言零散、需要统一”；丰田、Volvo 都规定全站一套主字体；Mini、雪铁龙、奥迪、大众、宝马在 2015–2020 年间都把标识改为扁平。MAXUS 新标识的黑白方向，和这股趋势一致。');

chapter('01', '设计系统', 'Typography · Color · Spacing', 'bg_electric.jpg', '先讲规则，再讲页面。客户问“为什么这里是这个字号”，答案都在这一章。', '70% center');

// ─────────────── TYPEFACES
S('01 — Typefaces', `${head('01 — Typefaces', '字体：<b>为什么用这三套</b>')}
${[['Michroma', '标题 · 品牌字体', `<span class="disp" style="font-size:96px;letter-spacing:-.01em">MAXUS</span>`, '贵司提供的品牌字体，字形和 MAXUS 字标风格一致。只用 Regular：这款字体没有粗体，字形较宽，不加粗也足够醒目；新 Logo 的方向也是“线条变细”。'],
   ['Geist', '正文 · 导航 · 数字', `<span style="font-size:96px;font-weight:300;letter-spacing:-.04em">Aa 1896</span>`, '现代无衬线字体，大字小字都清晰，支持欧洲多语言字符。替换原稿的 Arimo 和 D-DIN 粗体。大数字用细体，字号大但不显得笨重。'],
   ['Geist Mono', '日期 · 地点 · 标签', `<span class="mono" style="font-size:44px;letter-spacing:.06em">2026.10.10 · UK</span>`, '等宽字体常用在车辆铭牌、VIN 码这类工程标注上，有工业感，符合会议提出的“Professional，不是 Business”。只用于短标注。']].map(([n, r, sp, d], i) => `
<div style="position:absolute;left:120px;right:120px;top:${330 + i * 215}px;height:215px;border-top:1px solid var(--line);display:flex;align-items:center">
  <div style="width:280px"><div style="font-size:24px;font-weight:400">${n}</div><div class="mono" style="font-size:12px;color:var(--dim);margin-top:10px">${r}</div></div>
  <div style="width:760px">${sp}</div>
  <div style="flex:1;font-size:17px;color:var(--mute);line-height:1.7">${d}</div>
</div>`).join('')}`, '为什么三套？Michroma 负责品牌识别，Geist 负责阅读，Geist Mono 负责工程标注。客户喜欢的参考站也是“一套无衬线 + 一套等宽”，标题不加粗，靠字号区分层级。');

// ─────────────── TYPE SCALE
function scale(title, eb, rows, note, foot) {
  S(eb, `${head(eb, title)}
<div style="position:absolute;left:120px;right:120px;top:300px">
${rows.map(([n, spec, sample, style, why]) => `
<div style="display:flex;align-items:center;border-top:1px solid var(--line);min-height:${style.h}px">
  <div style="width:250px"><div style="font-size:19px;font-weight:400">${n}</div><div class="mono" style="font-size:12px;color:var(--dim);margin-top:8px">${spec}</div></div>
  <div style="width:700px;overflow:hidden;white-space:nowrap;${style.css}">${sample}</div>
  <div style="flex:1;font-size:16px;color:var(--mute);line-height:1.65">${why}</div>
</div>`).join('')}<div style="border-top:1px solid var(--line)"></div>
<div style="margin-top:26px;display:flex;gap:24px;align-items:baseline"><div class="mono" style="font-size:12px;color:var(--blue);white-space:nowrap">Industry</div><div style="font-size:17px;color:var(--fg);line-height:1.6">${foot.replace(/^行业做法：/, '')}</div></div></div>`, note);
}
scale('标题字号：<b>为什么是 72 / 56 / 44</b>', '01 — Type Scale · Display', [
  ['Display L', 'Michroma · 72 / 112%', 'Maximize', { h: 118, css: "font-family:Michroma;font-size:72px;letter-spacing:-.02em" }, '全页只有首屏标题用 72。在 1920 屏上一行约占 57% 宽度，足够醒目，同时把画面上方留给车。用 96 会占到 76%，在 1440 屏会换行。'],
  ['H1', 'Michroma · 56 / 115%', 'One brand.', { h: 100, css: "font-family:Michroma;font-size:56px;letter-spacing:-.02em" }, '所有板块标题统一 56，整页风格一致。两行的标题（如 News & Insights）也能放进 400px 宽的栏。'],
  ['H2', 'Michroma · 44 / 118%', 'Vans', { h: 88, css: "font-family:Michroma;font-size:44px;letter-spacing:-.015em" }, '比板块标题小一级，用在车型名等板块内部的标题。'],
  ['H4', 'Geist Medium · 24 / 130%', 'MAXUS at IAA 2026', { h: 70, css: "font-size:24px;font-weight:500" }, '新闻标题、卡片名。比正文 20 大一档，稍粗，一看就是标题。'],
  ['Data Display', 'Geist Light · 96 / 100%', '1896', { h: 128, css: "font-size:96px;font-weight:300;letter-spacing:-.05em" }, '三个数字是品牌最有说服力的信息，用全页最大字号；细体避免笨重，字距收紧让数字更紧凑。'],
], '“标题为什么不加粗？”——Michroma 只有 Regular；字形宽，不加粗也醒目；新 Logo 的方向是线条变细。“首屏标题为什么不更大？”——72 已占约 57% 屏宽，再大会挡车。', '行业做法：Volvo 官网设计系统的板块标题 heading-1 最大 56px、字重 Regular——与 MAXUS 的 H1 一致。示例为网页实际像素大小。');
scale('正文字号：<b>为什么导航 18、正文 20</b>', '01 — Type Scale · Text', [
  ['Body L', 'Geist · 22 / 150%', 'Built to keep business moving.', { h: 92, css: "font-size:22px;font-weight:400" }, '标题下的一两句介绍。宽度控制在 620–820px，每行 60–75 个字符，读起来不累。'],
  ['Body M', 'Geist · 20 / 150%', 'European-born since 1896.', { h: 92, css: "font-size:20px;font-weight:400" }, '原来 18px 在大屏上偏小，统一改为 20。行高 30px，两三行也不挤。'],
  ['Nav', 'Geist · 18 / 120%', 'Vehicles&nbsp;&nbsp;&nbsp;&nbsp;Safety & Technology&nbsp;&nbsp;&nbsp;&nbsp;Newsroom', { h: 100, css: "font-size:18px;font-weight:400" }, '导航用得最多，原来 16px 在大屏上偏小，改为 18 更好看清、好点击。不加粗，因为叠在首屏视频上，太粗会抢画面（参考奔驰）。'],
  ['Body S', 'Geist · 16 / 145%', 'Last-mile delivery for neighbourhood businesses.', { h: 84, css: "font-size:16px;font-weight:400" }, '图片说明等辅助信息。全站正文最小 16。'],
  ['Button', 'Geist Medium · 16 + →', 'Our Story&nbsp;&nbsp;→', { h: 84, css: "font-size:16px;font-weight:500" }, '首页按钮改为文字链接；稍粗的字重提示可以点击，箭头 16px、间距 10。'],
  ['Data Mono', 'Geist Mono · 14', '<span class="mono">2026.10.10 · Brand News</span>', { h: 84, css: "font-size:14px" }, '日期、地点、标签，统一大写。14 是这类字体能看清的最小字号。'],
], '“导航为什么是 18？”——原 16 在大屏偏小；18 好看清，又不加粗，不抢视频。“正文为什么 20？”——大屏上 20 读起来最舒服。', '行业做法：Volvo 正文 16 / 20 / 24px、行高 1.5；W3C WCAG 建议行距 ≥1.5 倍、每行 ≤80 字符。MAXUS 正文 20 / 150%，导语 60–75 字符。');

// ─────────────── COLOR
{
  const chips = [['Ink', '#0A0A0B', '主文字'], ['White', '#FFFFFF', '深底文字'], ['Gray 600', '#5A5F68', '说明文字'], ['Gray 400', '#8A8F98', '日期 / 标签'], ['Surface', '#F1F1F0', '浅色区块'], ['Navy', '#070A11', '全球板块底'], ['Brand Blue', '#1E5FC8', '悬停 / 选中'], ['Globe Ocean', '#1F6BC6', '仅地球'], ['Globe Land', '#61F2AD', '仅地球']];
  const cw = (1680 - 8 * 12) / 9;
  S('01 — Color', `${head('01 — Color', '颜色：<b>黑白为主，蓝色只用在悬停</b>')}
${chips.map(([n, h, u], i) => `<div style="position:absolute;left:${120 + i * (cw + 12)}px;top:320px;width:${cw}px">
  <div style="height:300px;background:${h};outline:1px solid rgba(255,255,255,.1)"></div>
  <div style="font-size:17px;font-weight:400;margin-top:18px">${n}</div><div class="mono" style="font-size:12px;color:var(--dim);margin-top:8px">${h}</div><div style="font-size:14px;color:var(--mute);margin-top:6px">${u}</div></div>`).join('')}
<div style="position:absolute;left:120px;top:322px;width:${cw * 6 + 60}px;height:1px"></div>
<div class="mono" style="position:absolute;left:120px;top:290px;font-size:12px;color:var(--dim)">Core · Neutral</div>
<div class="mono" style="position:absolute;left:${120 + 6 * (cw + 12)}px;top:290px;font-size:12px;color:var(--dim)">Accent · Data</div>
<div class="cols" style="top:790px;grid-template-columns:repeat(3,1fr);gap:64px">
${[['黑白是主色', '品牌方案：黑白核心色在不同文化里都传达信任、清晰、权威。'], ['蓝色只在悬停时出现', '方案里蓝色是“一抹点缀，代表电动”。用户把鼠标移上去时才亮起，全站统一用 #1E5FC8。'], ['不做蓝色按钮', '蓝色按钮是很多车企和 B2B 网站的常规做法，用了反而显得普通。']].map(([t, d]) => `<div style="border-top:1px solid rgba(255,255,255,.3);padding-top:20px"><div style="font-size:21px;font-weight:400">${t}</div><div style="font-size:16px;color:var(--mute);line-height:1.65;margin-top:10px">${d}</div></div>`).join('')}</div>`,
    '“为什么不用我们的蓝色？”——品牌方案把核心色定为黑白，蓝色是一抹点缀。我们把蓝色用在用户悬停、聚焦的时候。地球的蓝绿色属于数据图形，只在地球上出现。');
}

// ─────────────── SPACING
{
  const sc = 0.42, L = 120, T = 320, PW = 1920 * sc, PH = 640;
  const m = 120 * sc;
  const blocks = [['Eyebrow · Mono 14', 14, 24], ['Title · H1 56', 64, 24], ['Lede · Body L 22', 66, 32], ['Link · Button 16 →', 20, 80], ['Content', 230, 0]];
  let y = T + 140 * sc, b = '';
  blocks.forEach(([t, h, g]) => {
    const hh = h * sc * 1.6, w = t === 'Content' ? PW - 2 * m : (PW - 2 * m) * .55;
    b += `<div style="position:absolute;left:${L + m}px;top:${y}px;width:${w}px;height:${hh}px;background:${t === 'Content' ? 'rgba(255,255,255,.07)' : 'rgba(255,255,255,.16)'};font-size:11px;line-height:${hh}px;padding-left:8px;color:rgba(255,255,255,.7)" class="mono">${t}</div>`;
    if (g) b += `<div class="mono" style="position:absolute;left:${L + m + w + 10}px;top:${y + hh}px;height:${g * sc * 1.6}px;line-height:${g * sc * 1.6}px;font-size:11px;color:var(--blue)">${g}</div>`;
    y += hh + g * sc * 1.6;
  });
  S('01 — Spacing', `${head('01 — Spacing', '间距：<b>全部用 8 的倍数</b>')}
<div style="position:absolute;left:${L}px;top:${T}px;width:${PW}px;height:${PH}px;background:var(--card);outline:1px solid var(--line)"></div>
<div style="position:absolute;left:${L}px;top:${T}px;width:${m}px;height:${PH}px;background:rgba(30,95,200,.12)"></div>
<div style="position:absolute;left:${L + PW - m}px;top:${T}px;width:${m}px;height:${PH}px;background:rgba(30,95,200,.12)"></div>
<div style="position:absolute;left:${L}px;top:${T}px;width:${PW}px;height:${140 * sc}px;background:rgba(255,180,100,.1)"></div>
<div class="mono" style="position:absolute;left:${L}px;top:${T + PH + 12}px;width:${m}px;text-align:center;font-size:11px;color:var(--blue)">120</div>
<div class="mono" style="position:absolute;left:${L + PW / 2 - 20}px;top:${T + 14}px;font-size:11px;color:#E0A060">140</div>
${b}
<div style="position:absolute;left:1000px;right:120px;top:320px">
${[['页面左右边距', '120', '1920 屏上内容宽 1680，左右各留约 6%'], ['板块上下', '140', '屏与屏之间留出停顿'], ['标题组 → 内容', '80', '先读标题，再看内容'], ['导语 → 文字链接', '32', '读完介绍就能点'], ['眉标 → 标题 → 导语', '24', '同一组信息靠近'], ['卡片间距', '12', '卡片成组'], ['文字 → 箭头', '10', '箭头跟着文字']].map(([a, v, d]) => `
<div style="display:flex;align-items:baseline;padding:20px 0;border-top:1px solid var(--line)"><div style="width:250px;font-size:19px;font-weight:400">${a}</div><div style="width:100px;font-size:30px;font-weight:300;color:var(--blue)">${v}</div><div style="flex:1;font-size:16px;color:var(--mute)">${d}</div></div>`).join('')}
<div style="border-top:1px solid var(--line)"></div>
<div style="font-size:15px;color:var(--dim);margin-top:20px">所有间距都是 8 的倍数（或 4 的细分），开发可以直接写成变量，各国站沿用时不会走样。</div></div>`,
    '留白是奢侈品官网的核心做法（会议要求参考）。所有间距用同一套数值，每一屏的节奏一致，开发也能直接变量化。');
}

// ─────────────── HOVER (live recreations)
{
  const arrow = c => `<svg width="16" height="16" viewBox="0 0 16 16" style="vertical-align:-2px;margin-left:10px"><path d="M3 8h10M9 4l4 4-4 4" stroke="${c}" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
  const pair = (label, a, b, bg) => `<div style="background:${bg};padding:34px 36px;outline:1px solid var(--line)"><div class="mono" style="font-size:12px;color:${bg === '#F1F1F0' ? '#5A5F68' : 'var(--dim)'};margin-bottom:26px">${label}</div><div style="display:flex;gap:56px;align-items:flex-end">${a}${b}</div></div>`;
  const tag = (t, c) => `<div class="mono" style="font-size:11px;color:${c};margin-top:14px">${t}</div>`;
  S('01 — Hover', `${head('01 — Interaction', '悬停效果：<b>只变颜色</b>', '悬停时不加底色、不加粗，全站统一用品牌蓝 #1E5FC8。颜色过渡 200ms；图片放大 400ms。')}
<div style="position:absolute;left:120px;right:120px;top:410px;display:grid;grid-template-columns:1fr 1fr;gap:20px">
${pair('Text link · Light', `<div><div style="font-size:18px;font-weight:500;color:#0A0A0B">Our Story${arrow('#0A0A0B')}</div>${tag('Default', '#8A8F98')}</div>`, `<div><div style="font-size:18px;font-weight:500;color:#1E5FC8">Our Story<span style="margin-left:4px"></span>${arrow('#1E5FC8')}</div>${tag('Hover · 箭头右移 4px', '#1E5FC8')}</div>`, '#F1F1F0')}
${pair('Navigation · Dark', `<div><div style="font-size:18px;font-weight:400">Vehicles</div><div style="height:2px;margin-top:10px"></div>${tag('Default', 'var(--dim)')}</div>`, `<div><div style="font-size:18px;font-weight:400;color:#1E5FC8">Vehicles</div><div style="height:2px;background:#1E5FC8;margin-top:10px"></div>${tag('Hover · 2px 下划线', '#1E5FC8')}</div>`, '#0A0A0B')}
${pair('Vehicle tab · Light', `<div><div style="font-size:18px;color:#5A5F68">Pickups</div><div style="height:2px;margin-top:10px"></div>${tag('Default', '#8A8F98')}</div><div><div style="font-size:18px;color:#1E5FC8">Pickups</div><div style="height:2px;margin-top:10px"></div>${tag('Hover', '#1E5FC8')}</div>`, `<div><div style="font-size:18px;color:#0A0A0B;font-weight:500">Pickups</div><div style="height:2px;background:#0A0A0B;margin-top:10px"></div>${tag('Selected', '#0A0A0B')}</div>`, '#F1F1F0')}
${pair('Social · Play · Dark', `<div style="display:flex;gap:28px;align-items:center"><div style="width:44px;height:44px;border-radius:50%;border:1px solid rgba(255,255,255,.22)"></div><div style="width:72px;height:72px;border-radius:50%;border:1px solid rgba(255,255,255,.38);background:rgba(255,255,255,.06)"></div></div>`, `<div style="display:flex;gap:28px;align-items:center"><div style="width:44px;height:44px;border-radius:50%;border:1px solid #1E5FC8"></div><div style="width:72px;height:72px;border-radius:50%;border:1px solid #1E5FC8;background:rgba(255,255,255,.06)"></div><div class="mono" style="font-size:11px;color:#1E5FC8">Hover · 描边变蓝</div></div>`, '#0A0A0B')}
</div>
<div style="position:absolute;left:120px;top:900px;font-size:15px;color:var(--dim)">依据：会议纪要“参考奔驰的按钮悬停反馈”。Figma 中已建可交互组件“MAXUS / 文字链接（含 Hover）”。</div>`,
    '悬停只改颜色，不加底色、不加粗，反馈清楚但不破坏版面。蓝色只在用户触碰时出现，对应品牌方案里“一抹亮蓝代表电动”。');
}

chapter('02', '逐屏说明', 'Screen by Screen', 'bg_offroad.jpg', '接下来逐屏说明。截图上的标记点用细线连到右侧说明。', '60% center');

// ─────────────── SCREENS
S('02 — Navigation', `${head('02 — 01 Announcement & Navigation', '公告栏与导航：<b>口号放第一行，导航用 18px</b>')}
${wide([['crop_nav.jpg', 120, 1680, 1680 * 106 / 1600]], [[1, 560, 330 + 13], [2, 200, 330 + 78], [3, 960, 330 + 110], [4, 1700, 330 + 110], [5, 420, 330 + 112]],
  [['公告栏', 'Body S · 16', '第一行放口号 Drive the Charge。两侧细箭头取自新 Logo 向前、向上的造型，做细、做渐隐，不抢首屏。'],
   ['横版 Logo', 'Height 24px', '按品牌规范，高度有限的位置用横版。和导航文字对齐。'],
   ['导航', 'Geist Regular · 18', '原 16px 在大屏偏小，改为 18。不加粗，避免压在视频上太重。5 个入口居中，间距 34px。'],
   ['工具图标', '20px · 1.5px 线宽', '搜索、下载、账户。与全站箭头图标同一套样式。'],
   ['分隔线', '1px · White 12%', '导航背景透明，只加一条很淡的线，不用实色底条，首屏画面更完整。']], { y: 330 })}`,
  '“导航为什么是 18？”——导航用得最多，原 16px 在 1920 屏上偏小；18 好看清，又不加粗，不会抢首屏视频。参考了会议提到的奔驰官网。');

S('02 — Hero', `${head('02 — 01 Hero', '首屏：<b>一句标题 + 三条品牌信息</b>')}
${shot('hero.jpg', 1920, 1128, [[385, 905], [95, 1046], [700, 1040], [1592, 1046], [1300, 400]],
  [['主标题', 'Display L · 72', '全页只有这里用 72。一行居中放在画面下方，上方留给车。'],
   ['European-born', 'Body M · 20', '来自品牌定位：European-born commercial vehicle brand。'],
   ['一句话产品线', 'Body M · 20', '从轻客、皮卡到重卡，纯电、混动、柴油都有。来自品牌方案的标准介绍。'],
   ['Heritage since 1896', 'Body M · 20', '品牌方案提出，欧洲血统是海外用户建立信任最快的方式。'],
   ['首屏视频', 'Video', '当前车型是参考素材，正式版需换成 MAXUS 实拍。']])}`,
  '首屏只做三件事：一句标题、一段视频、三条品牌信息。“首屏标题为什么不更大？”——72 在 1920 屏一行已占约 57%，再大会挡车。');

S('02 — Global 1/3', `${head('02 — 02 Global · 1/3', '全球板块 1/3：<b>地球自转</b>')}
${shot('globe0.jpg', 1920, 1080, [[425, 540], [1250, 300], [900, 490], [850, 995]],
  [['标题叠在地球上', 'H1 · 56', '一眼看出这一屏讲全球布局。'],
   ['点阵地球', 'Globe Ocean / Land', '陆地用细点阵，呼应新 Logo 的细线条。蓝绿色只用在地球上。'],
   ['定位点', 'Icon', '方框样式，和全站图标一致。'],
   ['定位提示', 'Data Mono · 14', '进入时后台按 IP 识别国家，这行小字提示正在定位。']])}`,
  '对应会议要求“突出 Glocal 与全球布局”。滚动前地球缓慢自转，约 20 秒一圈。');

S('02 — Global 2/3', `${head('02 — 02 Global · 2/3', '全球板块 2/3：<b>定位到用户所在国家</b>')}
${shot('globeA.jpg', 1920, 1080, [[900, 722], [370, 450], [620, 640], [240, 680]],
  [['定位光环', 'Ring', '地球转到用户所在国家（示例为英国）后停住，两圈细光环标出位置。'],
   ['本地用车照片', '4 Photos · CMS', '配送、木工、花店、接送。对应 9/24 会议的 Global Brand, Local Action。'],
   ['连接线', '1px · White 22%', '把照片连回定位点，说明这些场景就在用户所在国家。'],
   ['地点标注', 'Data Mono · 14', '只标城市名，不放大段文字。']])}`,
  '照片按国家在 CMS 配置，没有配置的国家显示所在大区的通用图。当前为 AI 示意图，上线前换实拍。');

S('02 — Global 3/3', `${head('02 — 02 Global · 3/3', '全球板块 3/3：<b>出现三组数据</b>')}
${shot('globeB.jpg', 1920, 1080, [[245, 880], [795, 880], [960, 700], [900, 553]],
  [['三组数据', 'Data Display · 96', '1896、100+、1.2M+，用全页最大字号；细体避免显得笨重。'],
   ['竖分隔线', '1px · White 16%', '没有用磨砂底板，因为底板会把地球切断。数字直接放在深色背景上。'],
   ['地球渐隐', 'Gradient', '地球下半部逐渐变暗，数字更清楚。'],
   ['保留定位', 'Ring', '保留用户所在国家的定位，前后画面接得上。']])}`,
  '数字滚到位后计数一次（1.4 秒），停在任何位置都显示正确数值。原稿用 D-DIN 粗体压在照片上，看不清也挡车。');

S('02 — Vehicles', `${head('02 — 03 Vehicles', '车型：<b>按车系展示，不放配置</b>')}
${shot('vehicles.jpg', 1920, 1248, [[1500, 250], [120, 452], [1200, 400], [140, 520], [95, 726]],
  [['MAXUS 大字标', 'Light Gray', '浅灰色做背景，八个车系都在 MAXUS 这个名字下，又不抢车的画面。'],
   ['选中状态', 'Ink + 2px', '选中的车系用黑字加下划线，悬停时变蓝。'],
   ['八个车系', 'Nav · 18', '品牌方案的七大车系加改装车，重卡单独列出。'],
   ['车型小图', 'Thumbnail', '切换车系时同步切换，方便识别。'],
   ['车系名与用途', 'H2 44 · Body M 20', '只写一句用途，不放参数和配置表（9/29 会议结论）。']])}`,
  '会议结论：首页目标是提升调性，车型链接“可有可无”。车型区只负责让用户知道 MAXUS 有哪些车系。下一版建议加上动力形式图标（参考丰田）。');

S('02 — Technology', `${head('02 — 04 Technology', '科技：<b>沿用第一版的三张视频卡</b>')}
${shot('tech.jpg', 1920, 1094, [[40, 135], [1600, 450], [960, 620], [30, 885]],
  [['板块标题', 'H1 · 56', '讲技术对用户的用处，不讲参数。'],
   ['三张视频卡', 'Card', '智能驾驶、动力方案、安全各一张，用视频展示场景。会议要求技术内容少用术语。'],
   ['播放按钮', '72px · Frosted', '半透明磨砂底加白色细描边，质感好但不过分科技风。悬停描边变蓝。'],
   ['卡片名', 'H4 · 24', '放在卡片左下角，和标题左对齐。']])}`,
  '这一屏沿用客户已看过的第一版结构，只统一了字体和按钮质感，方便过稿。点击卡片打开详情弹窗。');

S('02 — Engineering', `${head('02 — 05 / 06 Engineering', '电驱与越野：<b>整屏大图，文字放左下角</b>')}
${wide([['electric.jpg', 120, 828, 466], ['offroad.jpg', 972, 828, 466]], [[1, 120, 330 + 270], [2, 120, 330 + 345], [3, 120, 330 + 404], [4, 1600, 330 + 120]],
  [['板块标题', 'H1 · 56', '和其他板块标题同一字号。'], ['正文', 'Body M · 20 · 620px', '三行以内，说清这项技术解决什么问题。'], ['文字链接', 'Button · 16', '按客户要求减少首页按钮，改为文字链接。'], ['只压暗左下角', 'Gradient', '保证文字看得清，画面其他部分保持原样。文字距左 120、距底 140。']], { y: 330 })}`,
  '电驱和越野是一组“工程能力”，两屏文字位置一致，读起来像画册的两页。按钮从白底黑字改为文字链接，是客户“首页不要太多按钮”的要求。');

S('02 — News', `${head('02 — 07 News & Insights', 'News & Insights：<b>沿用第一版结构，统一细节</b>')}
${shot('news.jpg', 1920, 1433, [[90, 180], [95, 310], [640, 190], [545, 625], [1170, 662]],
  [['板块标题', 'H1 · 56 · 400px', '左边标题，右边 2×2 四篇文章，结构和第一版一致。'],
   ['查看全部', 'Button · 16', '原来是蓝色粗体，改成和全站一致的黑色文字链接。'],
   ['分类标签', 'Mono · Frosted', 'Brand News、Country News、Brand Information，对应会议确定的三类内容。'],
   ['日期', 'Data Mono · 14', '灰色小字，不抢标题。'],
   ['文章标题', 'H4 · 24', '悬停时标题变蓝、图片轻微放大。']], { mh: 640 })}`,
  '会议纪要：取消独立 Blog，合并为 News and Insights，分为全球品牌新闻、国家新闻、产品洞察三类。');

S('02 — Subscribe', `${head('02 — 08 Subscribe', '订阅：<b>首页唯一保留的实心按钮</b>')}
${shot('subscribe.jpg', 1920, 960, [[760, 170], [400, 300], [620, 774], [1290, 774], [640, 850]],
  [['引导语', 'H2 · 44', 'Keep up with。'], ['MAXUS 字标', 'Wordmark', '页面结尾放大号字标，加深品牌印象。'], ['输入框', 'White · 64px', '白色输入框在任何背景图上都清楚。'], ['订阅按钮', 'Black · Solid', '首页其他按钮都改成了文字链接，订阅是唯一需要用户留信息的地方，所以保留实心按钮。'], ['同意条款', '14px', '合规需要。']])}`,
  '订阅是首页唯一保留实心样式的按钮。背景图为 AI 示意，上线前换实拍。');

S('02 — Footer', `${head('02 — 09 Footer', '页脚：<b>只放直达链接</b>')}
${shot('footer.jpg', 1920, 700, [[95, 115], [1300, 175], [95, 260], [1300, 310], [1580, 645]],
  [['Logo', 'White · Horizontal', '深色背景用白色横版 Logo。'], ['页脚订阅', 'Underline input', '用简单的下划线输入框，不和上面的订阅区重复。'], ['四组链接', 'Mono label · 18', '按 9/29 会议结论，页脚只放直达链接。'], ['社交媒体', '44px', '统一线性图标，悬停描边变蓝。'], ['选择市场', 'Choose Your Market', '跳转各国站点。价格和配置在国家站。']])}`,
  '页脚回归常规：好找、清楚。Choose Your Market 是全球站通往国家站的出口。');

// ─────────────── MOTION
S('03 — Motion', `${head('03 — Motion', '全球板块动效：<b>分三段随滚动播放</b>')}
${[['globe0.jpg', '01', '地球自转', '进入板块，地球约 20 秒转一圈；后台按 IP 识别国家。'], ['globeA.jpg', '02', '定位到用户所在国家', '滚动 0–40%：地球转到用户所在国家停住，出现光环；4 张本地照片依次出现，连接线画出。'], ['globeB.jpg', '03', '出现数据', '滚动 60–80%：照片淡出，地球上移；数字计数一次，随后进入车型屏。']].map(([f, n, t, d], i) => `
<div style="position:absolute;left:${120 + i * 572}px;top:330px;width:536px">
  <div style="height:302px;background:url('${IMG(f)}') center/cover;outline:1px solid var(--line)"></div>
  <div class="mono" style="font-size:12px;color:var(--blue);margin-top:26px">${n}</div>
  <div style="font-size:24px;font-weight:400;margin-top:10px">${t}</div>
  <div style="font-size:16px;color:var(--mute);line-height:1.65;margin-top:12px">${d}</div></div>`).join('')}
<div class="rule" style="top:880px"></div>
<div style="position:absolute;left:120px;top:904px;font-size:16px;color:var(--dim)">已有可在浏览器运行的 HTML 原型（maxus-global-local.html），开发可直接参考。IP 识别失败时默认显示 Europe / United Kingdom。</div>`,
  '演示时可直接打开 HTML 原型滚动给客户看。数字只计数一次，避免停在中间值。');

// ─────────────── NEXT
S('03 — Next Steps', `${head('03 — Next Steps', '待确认：<b>上线前需要贵司提供的内容</b>')}
<div style="position:absolute;left:120px;right:120px;top:320px">
${[['首屏视频', '当前车型为参考素材，需要 MAXUS 实拍视频。'], ['本地用车照片', '按国家提供 3–4 张真实用车场景，在 CMS 按 IP 配置。'], ['国家站名单', '地球定位和 Choose Your Market 需要实际国家站列表。'], ['数据口径', '请确认 1.2M+ 客户数的出处；1896 / 100+ 来自品牌方案。'], ['动力形式图标', '按会议纪要补充纯电、混动、柴油图标（参考丰田）。'], ['移动端', '桌面版确认后，按同一套规范出移动端。']].map(([t, d], i) => `
<div style="display:flex;align-items:center;height:104px;border-top:1px solid var(--line)"><div style="width:140px;font-size:44px;font-weight:200;color:rgba(255,255,255,.35)">0${i + 1}</div><div style="width:380px;font-size:24px;font-weight:400">${t}</div><div style="flex:1;font-size:18px;color:var(--mute)">${d}</div></div>`).join('')}
<div style="border-top:1px solid var(--line)"></div></div>`, '把需要客户提供和确认的内容列清楚，推动进入下一阶段。');

// ─────────────── CLOSE
S('', `${fullbleed('bg_pickup.jpg', 'linear-gradient(0deg,rgba(12,13,15,.92) 0%,rgba(12,13,15,.4) 50%,rgba(12,13,15,.55) 100%)', '60% 60%')}
<img src="${IMG('logo_white.png')}" style="position:absolute;left:120px;top:96px;width:200px">
<div class="disp" style="position:absolute;left:116px;bottom:220px;font-size:96px;letter-spacing:-.01em">Drive the Charge</div>
<div style="position:absolute;left:122px;bottom:160px;font-size:26px;font-weight:300;color:var(--mute);letter-spacing:.3em">驭电先行</div>
<div class="mono" style="position:absolute;right:120px;bottom:160px;font-size:13px;color:var(--dim)">Thank you</div>`, '谢谢。', { nochrome: true });

// ─────────────── emit
total = slides.length;
const html = `<!doctype html><html><head><meta charset="utf-8"><style>${css}</style></head><body>${slides.map((s, i) =>
  `<section class="s" id="s${i + 1}">${s.html}${s.opts.nochrome ? '' : chrome(s.section, i + 1, total)}</section>`).join('\n')}</body></html>`;
const fixed = html.replace(/>([^<]*)</g, (m, t) => '>' + t.replace(/([，。：；、！？（）“”])/g, '<span class="cp">$1</span>') + '<');
fs.writeFileSync(path.join(__dirname, 'deck.html'), fixed);
fs.writeFileSync(path.join(__dirname, 'notes.json'), JSON.stringify(slides.map(s => s.notes)));
console.log('slides', total);
