const pptxgen = require('pptxgenjs');
const path = require('path');
const { applyTheme } = require('/root/.claude/skills/synced/d732b448-7cde-41a0-90ce-cfaedd63fa61_3ef55afa-2608-4808-9028-0d7b70f81f05/pptx/scripts/apply_theme.js');

const IMG = f => path.join(__dirname, 'img', f);
const THEME = {
  name: 'MAXUS Homepage UI',
  headFontFace: 'Arial', bodyFontFace: 'Arial',
  colors: { dk1: '0A0A0B', lt1: 'FFFFFF', dk2: '5A5F68', lt2: 'F1F1F0',
    accent1: '1E5FC8', accent2: '6E9BF0', accent3: '8A8F98', accent4: '070A11',
    accent5: '1F6BC6', accent6: '61F2AD', hlink: '6E9BF0', folHlink: '8A8F98' },
};
const INK = '0A0A0B', WHITE = 'FFFFFF', G4 = '8A8F98', G6 = '5A5F68', LIGHT = 'F1F1F0', NAVY = '070A11', BLUE = '1E5FC8', BLUEL = '6E9BF0', LINE_D = '2A2B2E', LINE_L = 'D9D9D8';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };
pres.title = 'MAXUS 官网首页 Web UI 设计解说';
pres.author = 'MAXUS Web Design';

const W = 13.333, H = 7.5, MX = 0.6;

pres.defineSlideMaster({
  title: 'DARK', background: { color: INK },
  objects: [
    { line: { x: MX, y: 7.0, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } } },
    { text: { text: 'MAXUS  ·  HOMEPAGE WEB UI', options: { x: MX, y: 7.05, w: 5, h: 0.3, fontSize: 8, color: G4, charSpacing: 2, margin: 0 } } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 7.05, w: 0.6, h: 0.3, fontSize: 8, color: G4, align: 'right' },
  placeholders: [],
});
pres.defineSlideMaster({
  title: 'LIGHT', background: { color: LIGHT },
  objects: [
    { line: { x: MX, y: 7.0, w: W - 2 * MX, h: 0, line: { color: LINE_L, width: 0.75 } } },
    { text: { text: 'MAXUS  ·  HOMEPAGE WEB UI', options: { x: MX, y: 7.05, w: 5, h: 0.3, fontSize: 8, color: G6, charSpacing: 2, margin: 0 } } },
  ],
  slideNumber: { x: W - MX - 0.6, y: 7.05, w: 0.6, h: 0.3, fontSize: 8, color: G6, align: 'right' },
});
pres.defineSlideMaster({ title: 'BLANK_DARK', background: { color: INK }, objects: [] });

let section = '';
function slide(master, sec) {
  if (sec && sec !== section) { pres.addSection({ title: sec }); section = sec; }
  return pres.addSlide({ masterName: master, sectionTitle: section });
}
function txt(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: 'Arial', valign: 'top' }, o)); }
function header(s, eyebrow, title, dark = true) {
  txt(s, eyebrow, { x: MX, y: 0.45, w: 8, h: 0.25, fontSize: 9, color: dark ? G4 : G6, charSpacing: 3 });
  txt(s, title, { x: MX, y: 0.72, w: 12, h: 0.6, fontSize: 28, color: dark ? WHITE : INK });
}
function marker(s, n, x, y, dark = false) {
  s.addShape(pres.shapes.OVAL, { x: x - 0.15, y: y - 0.15, w: 0.3, h: 0.3, fill: { color: dark ? INK : WHITE }, line: { color: dark ? WHITE : INK, width: 0.75 }, objectName: 'marker ' + n });
  txt(s, String(n), { x: x - 0.15, y: y - 0.15, w: 0.3, h: 0.3, fontSize: 10, bold: true, color: dark ? WHITE : INK, align: 'center', valign: 'middle' });
}
// image with markers; frame coordinates in px of the 1920-wide design
function annotated(s, file, x, y, w, fw, fh, pts) {
  const h = w * fh / fw;
  s.addImage({ path: IMG(file), x, y, w, h, objectName: file });
  s.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { type: 'none' }, line: { color: LINE_D, width: 0.75 } });
  pts.forEach(([n, px, py]) => marker(s, n, x + px / fw * w, y + py / fh * h));
  return h;
}
function notes(s, items, x, y, w, dark = true, gap = 0.12) {
  let cy = y;
  items.forEach(([n, t, d]) => {
    marker(s, n, x + 0.15, cy + 0.14, !dark ? false : false);
    txt(s, t, { x: x + 0.45, y: cy, w: w - 0.45, h: 0.3, fontSize: 13, bold: true, color: dark ? WHITE : INK, valign: 'middle' });
    const lines = Math.ceil(d.length / ((w - 0.45) * 6.4));
    const dh = Math.max(0.3, lines * 0.205);
    txt(s, d, { x: x + 0.45, y: cy + 0.32, w: w - 0.45, h: dh, fontSize: 11, color: dark ? 'B4B7BD' : G6, lineSpacingMultiple: 1.15 });
    cy += 0.32 + dh + gap;
  });
  return cy;
}

// ───────────────────────── 01 COVER
{
  const s = slide('BLANK_DARK', '开篇');
  s.addImage({ path: IMG('globeB.jpg'), x: 5.9, y: 1.1, w: 7.43, h: 7.43 * 9 / 16 });
  s.addImage({ path: IMG('logo_white.png'), x: MX, y: 0.7, w: 2.2, h: 2.2 * 180 / 800 });
  txt(s, 'HOMEPAGE  WEB UI  ·  DESIGN RATIONALE', { x: MX, y: 2.6, w: 6, h: 0.3, fontSize: 10, color: G4, charSpacing: 3 });
  txt(s, '官网首页 Web UI\n设计解说', { x: MX, y: 3.0, w: 6, h: 1.6, fontSize: 40, color: WHITE, lineSpacingMultiple: 1.05 });
  txt(s, '每一个字号、颜色、间距与板块，为什么这样设计，\n以及它如何表达 MAXUS 的品牌。', { x: MX, y: 4.75, w: 5.4, h: 0.8, fontSize: 14, color: 'B4B7BD', lineSpacingMultiple: 1.3 });
  txt(s, 'Drive the Charge  ·  驭电先行', { x: MX, y: 6.55, w: 5, h: 0.3, fontSize: 11, color: WHITE, charSpacing: 2 });
  txt(s, '2026.10', { x: 4.6, y: 6.55, w: 1.2, h: 0.3, fontSize: 11, color: G4, align: 'right' });
  s.addNotes('开场：这份文件逐屏讲清首页每个设计决定的原因——为什么用这个字体、这个字号、这个颜色、这个间距，以及每个板块要表达什么品牌信息。所有理由都回到贵司两份材料：《品牌升级方案 v3》和 9/24、9/29 内容架构会议纪要。');
}

// ───────────────────────── 02 依据
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  DESIGN BASIS', '所有设计决定，都来自贵司自己的三份依据');
  const cols = [
    ['01', '品牌升级方案 v3', ['口号 Drive the Charge / 驭电先行', '黑白核心色：trust · clarity · authority', '线条由粗重变细锐，去装饰化', '一抹高饱和亮蓝，代表电动能量', 'European-born · Since 1896 · 100+ 国家']],
    ['02', '内容架构会议纪要', ['首页目标：拉高品牌调性', '参考奢侈品官网，跳出传统车企', '首页不放配置表，车型以“家族”呈现', 'News 与 Blog 合并为 News & Insights', '页脚只做直达链接']],
    ['03', '受众与风格定位', ['受众：车队、司机、工程现场用户', '风格是 Professional，不是 Business', '参考奔驰：简洁字体 + 按钮悬停反馈', 'Global Brand, Local Action', '全球站负责形象与拉新，不卖车']],
  ];
  const cw = (W - 2 * MX - 0.6) / 3;
  cols.forEach(([n, t, items], i) => {
    const x = MX + i * (cw + 0.3);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.75, w: cw, h: 4.9, fill: { color: '121315' }, line: { color: LINE_D, width: 0.75 } });
    txt(s, n, { x: x + 0.35, y: 2.05, w: 1, h: 0.6, fontSize: 30, color: G4 });
    txt(s, t, { x: x + 0.35, y: 2.8, w: cw - 0.7, h: 0.4, fontSize: 18, bold: true, color: WHITE });
    s.addShape(pres.shapes.LINE, { x: x + 0.35, y: 3.35, w: cw - 0.7, h: 0, line: { color: LINE_D, width: 0.75 } });
    s.addText(items.map((it, k) => ({ text: it, options: { bullet: { indent: 14 }, breakLine: k < items.length - 1 } })),
      { x: x + 0.35, y: 3.5, w: cw - 0.7, h: 2.9, fontSize: 13, color: 'C9CCD1', paraSpaceAfter: 9, valign: 'top', margin: 0, isTextBox: true, fontFace: 'Arial' });
  });
  s.addNotes('客户最认可的一句话是：“这是按你们自己定的方向做的。”所以每一页的理由都标注了出处：品牌方案、会议纪要、受众定位。');
}

// ───────────────────────── 03 三原则
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  PRINCIPLES', '一句话：把首页对齐到 ONE MAXUS');
  const p = [
    ['统一', 'One voice', '字体、颜色、间距、按钮、箭头全部收成一套规范。12 级字号、16 个颜色、8 的倍数间距，全站只有一种声音，各国站拿过去直接复用。'],
    ['减法', 'Less, but sharper', '去掉 UI 里的大面积蓝色和装饰；按钮弱化为“文字 + 箭头”。颜色越克制，车和画面越成为主角——这正是奢侈品官网的方法。'],
    ['全球化叙事', 'Global → Local', '用地球把“100+ 国家”讲成一个故事：自转 → 停在用户所在国 → 本地实拍 → 数据。Global Brand, Local Action。'],
  ];
  const cw = (W - 2 * MX - 0.8) / 3;
  p.forEach(([t, en, d], i) => {
    const x = MX + i * (cw + 0.4);
    txt(s, '0' + (i + 1), { x, y: 1.9, w: 2, h: 1.1, fontSize: 60, color: WHITE });
    s.addShape(pres.shapes.LINE, { x, y: 3.25, w: cw, h: 0, line: { color: '3A3B3F', width: 0.75 } });
    txt(s, t, { x, y: 3.45, w: cw, h: 0.5, fontSize: 22, bold: true, color: WHITE });
    txt(s, en.toUpperCase(), { x, y: 3.98, w: cw, h: 0.3, fontSize: 9, color: G4, charSpacing: 3 });
    txt(s, d, { x, y: 4.45, w: cw, h: 1.9, fontSize: 13, color: 'C9CCD1', lineSpacingMultiple: 1.35 });
  });
  s.addNotes('品牌方案原话：新标识要“黑白核心色、去装饰化、专业感与国际感更强”；会议要求首页“拉高品牌调性、参考奢侈品官网”。我们因此做了三件事：统一、减法、全球化叙事。');
}

// ───────────────────────── 04 首页结构
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  PAGE STRUCTURE', '首页 10 屏：从品牌到产品，再到资讯与服务');
  const items = [['hero.jpg', '01', '首屏', '品牌主张'], ['globe0.jpg', '02', '全球', '一个品牌'], ['globeA.jpg', '02a', '本地', '用户所在国'], ['globeB.jpg', '02b', '数据', '1896 · 100+'], ['vehicles.jpg', '03', '车型', '七大家族'], ['tech.jpg', '04', '科技', '三大能力'], ['electric.jpg', '05', '电驱', '工程章节'], ['offroad.jpg', '06', '越野', '工程章节'], ['news.jpg', '07', '资讯', 'News & Insights'], ['subscribe.jpg', '08', '订阅', '唯一转化'], ['footer.jpg', '09', '页脚', '直达链接']];
  const n = items.length, gap = 0.1, tw = (W - 2 * MX - gap * (n - 1)) / n;
  items.forEach(([f, no, t, d], i) => {
    const x = MX + i * (tw + gap);
    s.addImage({ path: IMG(f), x, y: 1.95, w: tw, h: tw * 0.75, sizing: { type: 'cover', w: tw, h: tw * 0.75 } });
    txt(s, no, { x, y: 1.95 + tw * 0.75 + 0.15, w: tw, h: 0.25, fontSize: 9, color: G4 });
    txt(s, t, { x, y: 1.95 + tw * 0.75 + 0.4, w: tw, h: 0.3, fontSize: 13, bold: true, color: WHITE });
    txt(s, d, { x, y: 1.95 + tw * 0.75 + 0.72, w: tw, h: 0.4, fontSize: 9, color: 'B4B7BD' });
  });
  const by = 4.55;
  s.addShape(pres.shapes.LINE, { x: MX, y: by, w: W - 2 * MX, h: 0, line: { color: '3A3B3F', width: 0.75 } });
  const acts = [['第一幕 · 我是谁', '首屏 + 全球 + 数据', '先讲品牌：European-born、Since 1896、100+ 国家。这是海外信任成本最低的叙事（品牌方案 ④）。'], ['第二幕 · 我能做什么', '车型 + 科技 + 电驱 + 越野', '以“家族”和“能力”呈现产品，不放 SKU、不放配置表（9/29 会议）。'], ['第三幕 · 保持联系', '资讯 + 订阅 + 页脚', 'News & Insights 承接内容；订阅是全页唯一的实心按钮；页脚只做直达。']];
  acts.forEach(([t, sub, d], i) => {
    const x = MX + i * 4.1;
    txt(s, t, { x, y: by + 0.3, w: 3.8, h: 0.35, fontSize: 15, bold: true, color: WHITE });
    txt(s, sub, { x, y: by + 0.68, w: 3.8, h: 0.3, fontSize: 10, color: G4 });
    txt(s, d, { x, y: by + 1.02, w: 3.8, h: 1.1, fontSize: 12, color: 'C9CCD1', lineSpacingMultiple: 1.3 });
  });
  s.addNotes('整页按“三幕”组织：我是谁 → 我能做什么 → 保持联系。像一本品牌画册，而不是模块的堆砌。深浅屏交替（深 · 深 · 浅 · 浅 · 深 · 深 · 浅 · 深 · 深），给长页面呼吸节奏。');
}

// ───────────────────────── SECTION: 设计系统
function divider(no, title, sub) {
  const s = slide('BLANK_DARK', title);
  txt(s, no, { x: MX, y: 2.2, w: 4, h: 1.4, fontSize: 96, color: '2A2B2E' });
  txt(s, title, { x: MX, y: 3.75, w: 10, h: 0.8, fontSize: 40, color: WHITE });
  txt(s, sub, { x: MX, y: 4.65, w: 10, h: 0.5, fontSize: 14, color: G4 });
  s.addShape(pres.shapes.LINE, { x: MX, y: 6.6, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  return s;
}
divider('01', '设计系统', 'Typography · Color · Spacing · Hover —— 先定规则，再做页面').addNotes('先讲规则，再讲页面。客户问“为什么这里是这个字号”，答案都在这一章。');

// ───────────────────────── 字体选择
{
  const s = slide('DARK', '设计系统');
  header(s, '01  /  TYPEFACES', '三套字体，各司其职');
  const rows = [
    ['sp_michroma.jpg', 'Michroma Regular', '标题 / 品牌声音', '贵司提供的品牌字体。宽体几何字形与 MAXUS 字标同源，一眼就是“MAXUS 的字”。只用 Regular：新标识要求“线条由粗重变细锐”，宽体字本身视觉重量已足够，加粗反而笨重。', 920 / 93],
    ['sp_light.jpg', 'Geist Light / Regular / Medium', '正文 · 导航 · 数字', '中性的现代无衬线，大屏小字都清晰，覆盖欧洲多语言字符。替换原稿的 Arimo（Arial 替代字体）与 D-DIN 粗体——后者显得陈旧、喧闹。数字用 Light，大而不重。', 1220 / 125],
    ['sp_mono.jpg', 'Geist Mono', '标签 · 日期 · 地点', '等宽字像发动机铭牌、车辆 VIN 码的工程标注，传递“Professional”的工业气质，而不是办公室的“Business”。全大写 + 小字号，只做标注，不做阅读。', 540 / 65],
  ];
  let y = 1.75;
  rows.forEach(([f, name, role, why, ar]) => {
    const iw = 4.6, ih = Math.min(iw / ar, 0.85);
    s.addShape(pres.shapes.RECTANGLE, { x: MX, y, w: 5.0, h: 1.4, fill: { color: '121315' }, line: { color: LINE_D, width: 0.75 } });
    s.addImage({ path: IMG(f), x: MX + 0.2, y: y + (1.4 - ih) / 2, w: ih * ar, h: ih });
    txt(s, name, { x: 6.0, y: y + 0.05, w: 6.7, h: 0.32, fontSize: 15, bold: true, color: WHITE });
    txt(s, role.toUpperCase(), { x: 6.0, y: y + 0.4, w: 6.7, h: 0.25, fontSize: 9, color: G4, charSpacing: 2 });
    txt(s, why, { x: 6.0, y: y + 0.68, w: 6.7, h: 0.75, fontSize: 11.5, color: 'C9CCD1', lineSpacingMultiple: 1.25 });
    y += 1.65;
  });
  s.addNotes('为什么三套？一套负责“品牌声音”（Michroma），一套负责“读得舒服”（Geist），一套负责“工程标注”（Geist Mono）。客户喜欢的参考站 Outer Spaces、Lightship、Rivian 都是“一套无衬线 + 一套等宽”，标题不用粗体，靠字号拉开层级。左侧是首页里的实际渲染截图。');
}

// ───────────────────────── 字号 · 标题层
function typeTable(title, eyebrow, rows, note) {
  const s = slide('LIGHT', '设计系统');
  header(s, eyebrow, title, false);
  const hdr = ['层级', '字体', '字号 / 行高 / 字距', '用在哪里', '为什么是这个数'];
  const opts = { fontFace: 'Arial', fontSize: 10, color: G6, bold: false, border: [{ type: 'none' }, { type: 'none' }, { pt: 0.75, color: 'C8C8C6' }, { type: 'none' }], margin: [4, 6, 6, 0], valign: 'bottom' };
  const body = rows.map(r => r.map((c, i) => ({ text: c, options: { fontFace: 'Arial', fontSize: i === 4 ? 11.5 : 12, color: i === 0 ? INK : (i === 4 ? '2E3238' : G6), bold: i === 0, border: [{ type: 'none' }, { type: 'none' }, { pt: 0.5, color: 'D9D9D8' }, { type: 'none' }], margin: [9, 8, 9, 0], valign: 'middle' } })));
  s.addTable([hdr.map(h => ({ text: h, options: opts })), ...body], { x: MX, y: 1.6, w: W - 2 * MX, colW: [1.25, 1.75, 1.75, 2.3, 5.08] });
  if (note) txt(s, note, { x: MX, y: 6.35, w: W - 2 * MX, h: 0.5, fontSize: 11, color: G6 });
  return s;
}
typeTable('字号 · 标题层：靠尺寸拉开层级，不靠加粗', '01  /  TYPE SCALE · DISPLAY', [
  ['Display L', 'Michroma Regular', '72 / 112% / −2%', '首屏主标题（全页仅 1 处）', '1920 屏上一行约占 57% 宽度：够大、够有气势，又把画面上方 2/3 留给车。96 会占到 76%，在 1440 屏会折行并与车抢视线。'],
  ['H1', 'Michroma Regular', '56 / 115% / −2%', '所有板块标题', '全站只用一个板块标题字号＝一个声音。56 ≈ 72 × 0.78，层级清楚；两行标题（News & Insights）也能放进 400px 栏。'],
  ['H2', 'Michroma Regular', '44 / 118% / −1.5%', '车型名、订阅 Keep up with', '比 H1 小一级（÷1.27），用于“板块内的主角”，不与板块标题竞争。'],
  ['Card Title', 'Geist Regular', '32 / 125% / −1.5%', '科技详情卡标题', '卡片内最大字，换成 Geist：卡片要“读”，不再是品牌喊话。'],
  ['H4', 'Geist Medium', '24 / 130% / −1%', '新闻标题、科技卡名', '图片下方的短标题，Medium 让它在图片旁站得住；24 是“标题”与“正文 20”之间的最小可辨差。'],
  ['Data Display', 'Geist Light', '96 / 100% / −5%', '1896 · 100+ · 1.2M+', '数据是证据，所以与全页最大字同级；用 Light 保持“大而不重”；−5% 字距让数字紧凑成一个整体。'],
], '比例：96 → 72 → 56 → 44 → 32 → 24，相邻约 ×1.27–1.33（大三度音阶式比例），层级在远看时依然清楚。Michroma 只有 Regular，所有层级都不加粗。')
  .addNotes('客户常问：“标题为什么不用粗体？”——Michroma 只有 Regular；宽体字的视觉重量已足够；新标识方向是“线条细锐”。“为什么首屏标题不再大一点？”——72 已占约 57% 屏宽，再大会与车抢主角，并在 1440 屏折行。');

typeTable('字号 · 正文层：读得舒服，点得到', '01  /  TYPE SCALE · TEXT', [
  ['Body L', 'Geist Regular', '22 / 150% / −0.5%', '板块导语（宽 620–820）', '导语是标题的“副歌”，22 与 H1 56 的比例约 1:2.5，衔接自然。宽度限制在 620–820px，每行 60–75 字符，是公认最舒适的阅读长度。'],
  ['Body M 20', 'Geist Regular', '20 / 150% / −0.5%', '首屏信息栏、车型描述、板块正文', '1920 屏、60–70cm 观看距离下最舒适的正文尺寸；行高 150%＝30px，两三行文字不会挤。原 18px 在大屏偏小，统一提到 20。'],
  ['Body S', 'Geist Regular', '16 / 145% / 0', '照片说明、数据说明、公告栏', '辅助信息，16 是正文的最小值——全站正文绝不小于 16。'],
  ['Nav', 'Geist Regular', '18 / 120% / −0.5%', '顶部导航', '导航是常驻工具：比 Body S 大一级，保证在 1920 和 1440 屏都第一眼可读；用 Regular 不用粗体，压在视频上依然安静（参考奔驰的简洁字体）；单行所以行高 120%。'],
  ['Button', 'Geist Medium', '16 / 120% / −0.5%', '文字链接（+16px 箭头，间距 10）', '首页弱化 CTA，按钮改为文字链接；用 Medium 与正文区分“可点击”；箭头与字同高 16，视觉居中。'],
  ['Data Mono', 'Geist Mono Regular', '14 / 140% / 0', '日期、地点、标签（大写）', '工程标注式的小字；14 是等宽体的可读下限。全大写让它像铭牌，而不是正文。'],
], '规则：正文 ≥ 16，标注 ≥ 14；不单独改行高与字距——需要调整时改样式本身，全站同步。')
  .addNotes('“导航为什么是 18？”——导航是用户最常点的地方。原 16px 在大屏偏小；18 在 1920 与 1440 屏都清楚，又比标题小得多，不会喧宾夺主。用 Regular 而非粗体，压在视频上也安静。“正文为什么 20？”——大屏阅读距离下 20 最舒适，150% 行高给足呼吸。');

// ───────────────────────── 颜色
{
  const s = slide('LIGHT', '设计系统');
  header(s, '01  /  COLOR', '黑白为核心，蓝色只在“交互的一瞬间”出现', false);
  const groups = [
    ['品牌核心', [['Ink', '0A0A0B', '主文字 / 浅底主按钮'], ['White', 'FFFFFF', '深底文字 / 页面底色'], ['Brand Blue', '1E5FC8', '浅底 Hover / Focus'], ['Blue Light', '6E9BF0', '深底 Hover（对比≈7:1）']]],
    ['中性灰阶', [['Gray 600', '5A5F68', '说明文字'], ['Gray 400', '8A8F98', '日期 / 标签'], ['Surface Light', 'F1F1F0', '浅色区块底']]],
    ['深色界面 · 数据可视化', [['Navy', '070A11', '全球板块底'], ['Surface Dark', '0C0D0F', '页脚底'], ['Globe Ocean', '1F6BC6', '地球海洋（仅地球）'], ['Globe Land', '61F2AD', '陆地点阵（仅地球）']]],
  ];
  let y = 1.6;
  groups.forEach(([g, list]) => {
    txt(s, g, { x: MX, y, w: 2, h: 0.3, fontSize: 10, color: G6, charSpacing: 1 });
    list.forEach(([n, hex, use], i) => {
      const x = 2.4 + i * 1.68;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.55, h: 0.62, fill: { color: hex }, line: { color: 'C8C8C6', width: 0.5 } });
      txt(s, n, { x, y: y + 0.68, w: 1.6, h: 0.22, fontSize: 9.5, bold: true, color: INK });
      txt(s, '#' + hex + '  ·  ' + use, { x, y: y + 0.9, w: 1.6, h: 0.4, fontSize: 8, color: G6 });
    });
    y += 1.55;
  });
  const rx = 9.3;
  txt(s, '为什么', { x: rx, y: 1.6, w: 3.4, h: 0.35, fontSize: 15, bold: true, color: INK });
  const why = [
    ['黑白＝信任', '品牌方案：黑白核心色跨文化传达 trust、clarity、authority，去装饰化。'],
    ['蓝色＝电', '方案把辅助色收敛为“一抹高饱和亮蓝，代表电动能量”。我们只让它在 Hover 时亮起——用户触碰，品牌“通电”。'],
    ['不做蓝色按钮', '蓝色按钮是车企和 B2B 网站的通用做法，反而显得普通。'],
    ['深底文字透明度', '标题 100% · 正文 80% · 说明 72% · 标签 60%，用透明度而不是新颜色拉层级。'],
  ];
  let wy = 2.05;
  why.forEach(([t, d]) => {
    txt(s, t, { x: rx, y: wy, w: 3.4, h: 0.28, fontSize: 12, bold: true, color: INK });
    txt(s, d, { x: rx, y: wy + 0.3, w: 3.4, h: 0.75, fontSize: 10.5, color: G6, lineSpacingMultiple: 1.2 });
    wy += 1.12;
  });
  s.addNotes('“为什么不用我们的蓝色？”——新品牌方案已把核心色定为黑白，亮蓝是“一抹”点缀，代表电动能量。我们把它用在最能体现“能量”的时刻：用户悬停、聚焦时亮起。深色背景上原色对比度不够，所以深底用浅一档的 #6E9BF0。地球的蓝绿色属于数据可视化，只在地球上出现。');
}

// ───────────────────────── 间距
{
  const s = slide('LIGHT', '设计系统');
  header(s, '01  /  SPACING', '同一把尺子：8 的倍数，每一屏的呼吸一样', false);
  // page diagram
  const px = MX, py = 1.65, pw = 6.4, sc = pw / 1920;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: 4.9, fill: { color: WHITE }, line: { color: 'C8C8C6', width: 0.75 } });
  const m = 120 * sc;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: m, h: 4.9, fill: { color: 'E4ECFA' }, line: { type: 'none' } });
  s.addShape(pres.shapes.RECTANGLE, { x: px + pw - m, y: py, w: m, h: 4.9, fill: { color: 'E4ECFA' }, line: { type: 'none' } });
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: 140 * sc, fill: { color: 'FBE9D7' }, line: { type: 'none' } });
  const cx = px + m, cw = pw - 2 * m;
  let y = py + 140 * sc;
  const blocks = [['眉标  Data Mono 14', 0.12, 24], ['板块标题  H1 56', 0.36, 24], ['导语  Body L 22', 0.42, 32], ['文字链接  Button 16 →', 0.12, 80], ['内容区（卡片 / 图片）', 1.55, 0]];
  blocks.forEach(([t, h, gap]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y, w: t.startsWith('内容') ? cw : cw * 0.6, h, fill: { color: t.startsWith('内容') ? 'DADBDD' : 'C9CBCF' }, line: { type: 'none' } });
    txt(s, t, { x: cx + 0.08, y: y + (h - 0.2) / 2, w: 3.5, h: 0.2, fontSize: 8, color: INK, valign: 'middle' });
    if (gap) txt(s, '↕ ' + gap, { x: cx + cw * 0.6 + 0.12, y: y + h - 0.02, w: 0.8, h: gap * sc + 0.05, fontSize: 8, color: BLUE, valign: 'middle' });
    y += h + gap * sc;
  });
  txt(s, '120', { x: px, y: py + 4.55, w: m, h: 0.2, fontSize: 8, color: BLUE, align: 'center' });
  txt(s, '120', { x: px + pw - m, y: py + 4.55, w: m, h: 0.2, fontSize: 8, color: BLUE, align: 'center' });
  txt(s, '140', { x: px + pw / 2 - 0.4, y: py + 0.03, w: 0.8, h: 0.2, fontSize: 8, color: 'B5671E', align: 'center' });
  // table
  const rows = [['页面左右边距', '120', '1920 屏上内容宽 1680，左右各留 6%，画面有“画册”的边'], ['板块上下', '140', '屏与屏之间的停顿，像翻页'], ['标题组 → 内容', '80', '先读标题，再看内容的节奏'], ['导语 → 文字链接', '32', '链接紧跟导语，读完就能点'], ['眉标 → 标题 → 导语', '24', '同一组信息，靠近才是一组'], ['卡片间距', '12', '卡片成组，不散'], ['文字 → 箭头', '10', '箭头属于文字，不是独立按钮']];
  const opts = (b, c) => ({ fontFace: 'Arial', fontSize: 10.5, color: c, bold: b, border: [{ type: 'none' }, { type: 'none' }, { pt: 0.5, color: 'D9D9D8' }, { type: 'none' }], margin: [5, 4, 5, 0], valign: 'middle' });
  s.addTable(rows.map(r => [{ text: r[0], options: opts(true, INK) }, { text: r[1], options: opts(false, BLUE) }, { text: r[2], options: opts(false, G6) }]), { x: 7.35, y: 1.65, w: 5.4, colW: [1.55, 0.55, 3.3] });
  txt(s, '全部为 8 的倍数（或 4 的细分）：开发可以直接写成变量，各国站复用时不会走样。', { x: 7.35, y: 5.9, w: 5.4, h: 0.5, fontSize: 10.5, color: G6, lineSpacingMultiple: 1.2 });
  s.addNotes('“为什么这里空这么多？”——留白是奢侈品官网的核心手法（会议要求参考）。所有间距用同一把尺子，每一屏呼吸感一致，整页看下来稳；开发也能直接变量化。');
}

// ───────────────────────── Hover
{
  const s = slide('LIGHT', '设计系统');
  header(s, '01  /  INTERACTION', 'Hover：只变色，不加底、不加粗', false);
  s.addImage({ path: IMG('ds_hover.jpg'), x: MX, y: 1.6, w: 7.6, h: 7.6 * 475 / 1070 });
  const rx = 8.55;
  const rules = [['文字链接', '文字与箭头变主题蓝；箭头右移 4px，提示“往前走”。200ms ease-out。'], ['导航', '文字变 #6E9BF0 + 2px 下划线（深底）。'], ['车型标签', '默认灰 → 悬停蓝 → 选中墨色 + 2px 下划线。三态清楚。'], ['新闻卡片', '标题变蓝，图片放大 1.03（400ms）。'], ['社媒 / 播放按钮', '细描边变蓝，底色不变。']];
  let y = 1.6;
  rules.forEach(([t, d]) => {
    txt(s, t, { x: rx, y, w: 4.2, h: 0.28, fontSize: 13, bold: true, color: INK });
    txt(s, d, { x: rx, y: y + 0.3, w: 4.2, h: 0.5, fontSize: 11, color: G6, lineSpacingMultiple: 1.2 });
    y += 0.88;
  });
  txt(s, '依据：会议纪要“参考奔驰的按钮悬浮状态反馈”。Figma 中已建成可交互组件“MAXUS / 文字链接（含 Hover）”，演示模式可直接体验。', { x: rx, y: 6.1, w: 4.2, h: 0.7, fontSize: 10, color: G6, lineSpacingMultiple: 1.2 });
  s.addNotes('悬停只改变颜色，不加底色、不加粗——反馈清楚但克制，不破坏版面。蓝色只在用户触碰时出现，对应品牌方案里“一抹亮蓝＝电动能量”。');
}

// ───────────────────────── SECTION: 逐屏解说
divider('02', '逐屏解说', '每一屏：看到什么 · 为什么这样 · 体现什么品牌').addNotes('接下来逐屏讲。每页左侧截图上的编号，对应右侧的解说。');

function screenSlide(sec, eyebrow, title, file, fw, fh, pts, items, note, opt = {}) {
  const s = slide('DARK', sec);
  header(s, eyebrow, title);
  const maxH = 5.15, maxW = opt.imgW || 8.2;
  let w = maxW, h = w * fh / fw;
  if (h > maxH) { h = maxH; w = h * fw / fh; }
  annotated(s, file, MX, 1.62, w, fw, fh, pts);
  const nx = MX + w + 0.45;
  notes(s, items, nx, 1.62, W - MX - nx, true, opt.gap ?? 0.1);
  if (note) s.addNotes(note);
  return s;
}

// 公告栏 + 导航（放大）
{
  const s = slide('DARK', '逐屏解说');
  header(s, '02  /  01  ANNOUNCEMENT & NAVIGATION', '公告栏与导航：第一眼读到口号，第二眼找到路');
  const iw = W - 2 * MX, ih = iw * 106 / 1600;
  s.addImage({ path: IMG('crop_nav.jpg'), x: MX, y: 1.7, w: iw, h: ih });
  const fx = px => MX + px / 1920 * iw, fy = py => 1.7 + py / 128 * ih;
  marker(s, 1, fx(960) - 2.6, fy(24)); marker(s, 2, fx(140) - 0.05, fy(88) + 0.45); marker(s, 3, fx(960), fy(88) + 0.45); marker(s, 4, fx(1830), fy(88) + 0.45); marker(s, 5, fx(400), fy(128) + 0.05);
  const items = [
    [1, '公告栏 · Body S 16', '第一行就是口号 Drive the Charge。两侧细箭头呼应新标识“向远方打开的路”与“向前冲锋”的动势；做细、做渐隐，不抢首屏。'],
    [2, 'Logo · 横版组合', '按品牌规范，横版用于高度受限的位置。高 24px，与导航文字光学对齐。'],
    [3, '导航 · Geist Regular 18', '常驻工具，比正文小字大一级，1920 / 1440 屏都第一眼可读；Regular 不加粗，压在视频上也安静。5 个一级入口居中，项间距 34px。'],
    [4, '工具图标 · 20px 线性', '搜索 / 下载 / 账户。1.5px 线宽、圆头，与箭头图标同一套笔画。'],
    [5, '1px 分隔线 · 白 12%', '导航透明叠在视频上，保持沉浸；只用一根极淡的线分层，不用实色底条。'],
  ];
  const cw = (W - 2 * MX - 0.6) / 3;
  items.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    notes(s, [it], MX + col * (cw + 0.3), 3.05 + row * 1.75, cw);
  });
  s.addNotes('客户问“导航为什么是 18？”：导航是全站最常用的工具，原 16px 在 1920 大屏上显得小，18 更稳重也更好点；但我们没有加粗，因为它压在首屏视频上，太重会抢画面。参考了会议里提到的奔驰：字体简洁、层级克制。公告栏的箭头不是装饰，而是 Logo“向前、向上”的延伸。');
}

screenSlide('逐屏解说', '02  /  01  HERO', '首屏：一句主张，一个画面，三句身份', 'hero.jpg', 1920, 1128,
  [[1, 330, 920], [2, 150, 1000], [3, 900, 1010], [4, 1660, 1000], [5, 1500, 400]],
  [[1, '主标题 · Display L 72', '全页唯一的 72。一行居中、压在下 1/3，把上方 2/3 留给车——车是主角，字是旁白。'],
   [2, 'EUROPEAN-BORN', '直接取自品牌定位陈述“European-born commercial vehicle brand”。'],
   [3, '一句话产品线 · Body M 20', '“从轻客、皮卡到重卡，纯电/混动/柴油”——方案 Boilerplate 的浓缩。20px，两行居中。'],
   [4, 'HERITAGE SINCE 1896', '欧洲血统是海外信任的捷径（品牌方案 ④）。'],
   [5, '视频主视觉', '动态画面传递“驭电先行”的速度感。当前车型为参考素材，正式版换 MAXUS 实拍。']],
  '首屏只做三件事：一句主张（Maximize Your Business）、一个画面（行驶中的车）、三句身份（欧洲出身 / 全系产品 / 1896 传承）。信息栏用一根 1px 细线托住，像画册的图注。“为什么标题这么小？”——72 在 1920 屏一行已占约 57% 宽度；更大会与车抢视线。');

screenSlide('逐屏解说', '02  /  02  GLOBAL · STAGE 1', '全球 · 第一段：地球自转，“One brand”', 'globe0.jpg', 1920, 1080,
  [[1, 560, 470], [2, 1250, 300], [3, 900, 490], [4, 1020, 995]],
  [[1, '标题压在地球上 · H1 56', '标题与地球合成一个画面——“一个品牌，一个世界”，字面即画面。'],
   [2, '点阵地球', '陆地用细点阵：呼应新标识“线条细锐、数字化光束质感”。蓝绿只用于地球，作为数据可视化，不进入 UI。'],
   [3, '方框定位标', '与箭头图标同一笔画语言，克制、工程化。'],
   [4, 'LOCATING YOUR MARKET … · Mono 14', '后台按 IP 识别国家，小字提示“正在找到你”。']],
  '这一屏回应会议要求“突出 Glocal 与全球布局”。滚动开始前地球缓慢自转（约 20 秒一圈），给用户一个安静的进场。');

screenSlide('逐屏解说', '02  /  02  GLOBAL · STAGE 2', '全球 · 第二段：停在“你”的国家，看见本地', 'globeA.jpg', 1920, 1080,
  [[1, 870, 722], [2, 170, 240], [3, 620, 640], [4, 240, 680]],
  [[1, '定位光环', '地球转到用户所在国（示例：英国）停住，两圈细光环表示“你在这里”。'],
   [2, '4 张本地实景', '同一国家的真实用车场景：配送、木工、花店、接送。Global Brand, Local Action（9/24 会议）。'],
   [3, '细引线 · 白 22%', '每张照片都连回定位点：所有本地故事，属于同一个 MAXUS。'],
   [4, '地点标注 · Mono 14', '只标地点，不放正文，控制文字量。']],
  '照片按国家由 CMS 配置，没有配置的国家显示所在大区的通用图。当前为 AI 示意图，上线前换实拍。动效：照片从定位点方向依次放大浮出（0.6→1，间隔 120ms），引线跟着画出。');

screenSlide('逐屏解说', '02  /  02  GLOBAL · STAGE 3', '全球 · 第三段：先讲故事，再给证据', 'globeB.jpg', 1920, 1080,
  [[1, 240, 860], [2, 795, 860], [3, 960, 640], [4, 1020, 555]],
  [[1, '数据 · Geist Light 96', '1896 · 100+ · 1.2M+。与全页最大字同级——数据是证据，要被看清、被记住。Light 字重，大而不重。'],
   [2, '1px 竖分隔 · 白 16%', '不用磨砂底板：底板会切断地球，让画面变成两层。数字直接站在深色上。'],
   [3, '地球下沉渐隐', '地球下半部融入 Navy 底，数字自然浮出。'],
   [4, '定位保留', '提醒用户：这些数字，也包括你的国家。']],
  '数字滚到位后只计数一次（1.4 秒，依次间隔 120ms），停在任何位置都显示正确终值。原稿数字用 D-DIN 粗体压在照片上，看不清也挡车；现在改为细的大号数字。');

screenSlide('逐屏解说', '02  /  03  VEHICLES', '车型：讲“家族”，不讲 SKU', 'vehicles.jpg', 1920, 1248,
  [[1, 960, 180], [2, 120, 360], [3, 600, 400], [4, 260, 516], [5, 60, 726]],
  [[1, '巨幅 MAXUS 字标 · 浅灰', '品牌在场但不喧哗；把八个车型收在一个名字下——ONE MAXUS。'],
   [2, '选中态 · 墨色 + 2px 下划线', '黑白表达选中，不用蓝色；悬停时变蓝。'],
   [3, '八大家族等宽排列 · Nav 18', '对应品牌方案的七大家族 + 改装车，一眼看到全谱系（重卡显性列出）。'],
   [4, '车型小图', '随标签切换，帮助快速识别车型轮廓。'],
   [5, '车型名 H2 44 + 描述 Body M 20', '一句用途，不放参数和配置表（9/29 会议：首页不放配置表）。']],
  '会议结论：首页核心是拉高调性，车型链接“可有可无”，所以车型区只负责让用户知道“我们有这八个家族”。横幅左侧压暗已减轻，墙面质感透出来，车更清楚。', { gap: 0.06 });

screenSlide('逐屏解说', '02  /  04  TECHNOLOGY', '科技：三件事，各用一个画面讲', 'tech.jpg', 1920, 1094,
  [[1, 60, 50], [2, 1600, 450], [3, 400, 620], [4, 380, 885]],
  [[1, '标题 · H1 56 两行左对齐', '“Technology for the way you move.”——科技服务于“你的工作方式”，而不是参数。'],
   [2, '三张等大视频卡', '智能驾驶 / 动力方案 / 安全。会议要求“避免堆砌术语，场景化呈现”，一张卡只讲一件事。'],
   [3, '磨砂播放按钮 · 72px', '玻璃质感 + 白色细描边：高级但不“太 tech”。悬停描边变蓝。'],
   [4, '卡片名 · H4 24', '左下角对齐，与板块标题同一条左边线。']],
  '这一版沿用客户已看过的第一版结构（三列视频入口），只在字体、按钮质感上精修，便于过稿。点击卡片打开详情（弹窗已设计）。');

{
  const s = slide('DARK', '逐屏解说');
  header(s, '02  /  05–06  ENGINEERING CHAPTERS', '电驱与越野：电影感大画面，文字只占左下一角');
  const w = 5.95, h = w * 1080 / 1920;
  annotated(s, 'electric.jpg', MX, 1.62, w, 1920, 1080, [[1, 45, 650], [2, 45, 800], [3, 45, 930]]);
  annotated(s, 'offroad.jpg', MX + w + 0.23, 1.62, w, 1920, 1080, [[4, 1500, 400]]);
  const items = [[1, '标题 · H1 56', '与其他板块同一字号，全站一个声音。'], [2, '正文 · Body M 20，宽 620', '三行以内说清“这项工程解决什么问题”。'], [3, '文字链接 + 箭头', '首页不堆 CTA（客户要求），按钮弱化为文字；Medium 字重表示可点击。'], [4, '画面压暗只在左下', '渐变只覆盖左下 45%，保证文字可读，又不把整张画面压黑。文字距左 120、距底 140。']];
  const cw = (W - 2 * MX - 0.9) / 4;
  items.forEach((it, i) => notes(s, [it], MX + i * (cw + 0.3), 5.2, cw));
  s.addNotes('电驱与越野是一组“工程能力”章节，用整屏画面讲。文字统一放在左下角同一位置，两屏读起来像画册的两页。按钮从白底黑字改为文字链接，是客户“首页不要太多跳转按钮”的要求。');
}

screenSlide('逐屏解说', '02  /  07  NEWS & INSIGHTS', 'News & Insights：回到第一版结构，细节精修', 'news.jpg', 1920, 1433,
  [[1, 40, 170], [2, 40, 310], [3, 640, 260], [4, 500, 628], [5, 500, 680]],
  [[1, '标题 · H1 56，栏宽 400', '左栏固定标题，右侧 2×2 内容，阅读路径清楚。'],
   [2, 'View all stories → · Button 16', '原蓝色粗体改为墨色文字链接，与全站一致。'],
   [3, '分类标签 · 烟熏磨砂 + Mono 大写', 'Brand News / Country News / Brand Information——正是会议定的三类内容。'],
   [4, '日期 · Data Mono 14 灰', '工程标注式的日期，不抢标题。'],
   [5, '文章标题 · H4 24', '图片下方短标题；悬停变蓝，图片放大 1.03。']],
  '会议纪要：取消独立 Blog，合并为 News and Insights，分为全球品牌新闻、国家新闻、产品洞察三类。卡片图圆角 4，与按钮同一圆角；页边距按规范统一为 120 / 140。', { gap: 0.06 });

screenSlide('逐屏解说', '02  /  08  SUBSCRIBE', '订阅：全页唯一的实心按钮', 'subscribe.jpg', 1920, 960,
  [[1, 760, 170], [2, 400, 300], [3, 650, 774], [4, 1260, 774], [5, 650, 850]],
  [[1, 'Keep up with · H2 44', '一句邀请，语气平和。'],
   [2, 'MAXUS 字标', '整页最大的品牌露出放在结尾，形成记忆收束。'],
   [3, '白色输入框 · 64px 高', '在任何背景图上都看得清、点得到（设计师与客户已确认白底更好）。'],
   [4, '黑底 Subscribe →', '首页其他按钮都已弱化为文字链接，这里是唯一真正的转化动作，所以用最高对比。'],
   [5, '同意条款 · 14', '合规必需，最小可读字号。']],
  '订阅是首页唯一保留实心样式的按钮：其他入口都是“了解更多”，只有这里是用户主动留下联系方式的转化动作。背景图为 AI 示意，上线前换实拍。', { gap: 0.06 });

screenSlide('逐屏解说', '02  /  09  FOOTER', '页脚：干净的工具区', 'footer.jpg', 1920, 700,
  [[1, 120, 115], [2, 1320, 150], [3, 120, 260], [4, 1320, 310], [5, 1600, 645]],
  [[1, 'Logo · 横版白色', '深色底使用反白横版组合，符合品牌规范。'],
   [2, 'Newsletter · 下划线输入', '页脚只是“顺手订阅”，用轻量的下划线样式，不与上方订阅区重复抢眼。'],
   [3, '四栏标签 · Mono 大写 + 链接 18', '页脚仅作直达链接（9/29 会议），分 About / Support / Contact / Follow 四组。'],
   [4, '社媒 · 44px 细描边圆', '统一线性图标；悬停描边变蓝。'],
   [5, 'Choose Your Market', '通往各国站点——全球站导流到国家站的出口。']],
  '页脚回归常规：好找、松散、清楚，不做花样。“Choose Your Market”是全球站的重要出口：全球站负责形象，国家站负责价格与配置（9/29 会议）。', { imgW: 7.6, gap: 0.08 });

// ───────────────────────── 动效
{
  const s = slide('DARK', '交互与问答');
  header(s, '03  /  MOTION', '全球板块的滚动脚本：一段话讲完“Global → Local”');
  const st = [['globe0.jpg', '01  地球自转', '进入板块：地球约 20 秒一圈缓慢自转；后台按 IP 识别国家。'], ['globeA.jpg', '02  停在用户所在国', '滚动 0–40%：地球减速转到用户所在国（1.2s），光环出现；4 张本地照片依次浮出（间隔 120ms），引线画出。'], ['globeB.jpg', '03  数据出现', '滚动 60–80%：照片淡出，地球上移下沉；数字滚到位后计数一次（1.4s），随后进入车型屏。']];
  const cw = (W - 2 * MX - 0.6) / 3;
  st.forEach(([f, t, d], i) => {
    const x = MX + i * (cw + 0.3);
    s.addImage({ path: IMG(f), x, y: 1.7, w: cw, h: cw * 9 / 16 });
    if (i < 2) txt(s, '→', { x: x + cw + 0.02, y: 1.7 + cw * 9 / 32 - 0.2, w: 0.26, h: 0.4, fontSize: 16, color: G4, align: 'center' });
    txt(s, t, { x, y: 1.85 + cw * 9 / 16, w: cw, h: 0.35, fontSize: 15, bold: true, color: WHITE });
    txt(s, d, { x, y: 2.25 + cw * 9 / 16, w: cw, h: 1.0, fontSize: 11.5, color: 'C9CCD1', lineSpacingMultiple: 1.3 });
  });
  s.addShape(pres.shapes.LINE, { x: MX, y: 5.85, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  txt(s, '已有可在浏览器直接运行的 HTML 原型（maxus-global-local.html），开发可直接参考；动画跟随滚动，可倒放。IP 识别失败时默认展示 Europe / United Kingdom。', { x: MX, y: 6.0, w: W - 2 * MX, h: 0.6, fontSize: 11.5, color: 'B4B7BD', lineSpacingMultiple: 1.3 });
  s.addNotes('演示时直接打开 HTML 原型滚动给客户看。三段节奏：安静进场 → 找到“你” → 用数据收尾。数字只计数一次，避免停在中间值。');
}

// ───────────────────────── Q&A
{
  const s = slide('LIGHT', '交互与问答');
  header(s, '03  /  Q & A', '客户可能会问', false);
  const qa = [
    ['标题为什么不加粗？', 'Michroma 只有 Regular；宽体字视觉重量已足；新标识方向是“线条细锐”。'],
    ['导航为什么是 18？', '最常用的工具，大屏上 16 偏小；18 清楚又不抢视频，所以不加粗。'],
    ['正文为什么统一 20？', '1920 屏、60–70cm 观看距离下最舒适；150% 行高给足呼吸。'],
    ['为什么不用我们的蓝色？', '方案定黑白为核心、蓝为“一抹”；蓝色只在 Hover 时亮起，代表电动能量。'],
    ['为什么按钮这么少、只是文字？', '首页负责品牌形象，不堆 CTA；只有订阅保留实心按钮。'],
    ['数字为什么这么大？', '数据是信任证据；Light 字重让它大而不重。'],
    ['会不会像 Rivian / 别家？', '借鉴的是高端品牌的克制方法；字体、口号、地球、1896 叙事都是 MAXUS 独有。'],
    ['图片和视频能直接用吗？', '部分为 AI 示意图，首屏视频车型也需替换为 MAXUS 实拍。'],
  ];
  const cw = (W - 2 * MX - 0.4) / 2;
  qa.forEach(([q, a], i) => {
    const x = MX + (i % 2) * (cw + 0.4), y = 1.65 + Math.floor(i / 2) * 1.28;
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 1.12, fill: { color: WHITE }, line: { color: 'DEDEDC', width: 0.5 } });
    txt(s, 'Q', { x: x + 0.25, y: y + 0.2, w: 0.4, h: 0.4, fontSize: 20, color: BLUE });
    txt(s, q, { x: x + 0.75, y: y + 0.2, w: cw - 1, h: 0.3, fontSize: 13, bold: true, color: INK });
    txt(s, a, { x: x + 0.75, y: y + 0.55, w: cw - 1, h: 0.5, fontSize: 11, color: G6, lineSpacingMultiple: 1.2 });
  });
  s.addNotes('如果客户坚持使用蓝色：可以只用在一处关键动作上（例如订阅按钮的悬停），不建议做成大面积按钮或底色。');
}

// ───────────────────────── 待确认
{
  const s = slide('DARK', '交互与问答');
  header(s, '03  /  NEXT STEPS', '上线前需要贵司确认的事项');
  const it = [['01', '首屏视频', '当前车型为参考素材，需提供 MAXUS 实拍视频。'], ['02', '本地实景照片', '按国家提供 3–4 张真实用车场景，由 CMS 按 IP 配置。'], ['03', '国家站名单', '地球定位与 Choose Your Market 需要实际国家站列表。'], ['04', '数据口径', '1.2M+ 客户数请确认出处；1896 / 100+ 依据品牌方案。'], ['05', '移动端', '确认桌面版后，按同一套规范输出移动端（字号已预留 Mobile 样式）。']];
  it.forEach(([n, t, d], i) => {
    const y = 1.7 + i * 0.98;
    txt(s, n, { x: MX, y, w: 0.8, h: 0.5, fontSize: 24, color: G4 });
    txt(s, t, { x: MX + 1.0, y: y + 0.02, w: 3, h: 0.4, fontSize: 16, bold: true, color: WHITE });
    txt(s, d, { x: MX + 4.0, y: y + 0.05, w: 8.1, h: 0.45, fontSize: 13, color: 'C9CCD1' });
    s.addShape(pres.shapes.LINE, { x: MX, y: y + 0.78, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  });
  s.addNotes('结尾把需要客户提供的素材和确认项列清楚，推动进入下一阶段。');
}

// ───────────────────────── CLOSE
{
  const s = slide('BLANK_DARK', '交互与问答');
  s.addImage({ path: IMG('subscribe.jpg'), x: 0, y: 0, w: W, h: H, transparency: 55, sizing: { type: 'cover', w: W, h: H } });
  s.addShape(pres.shapes.RECTANGLE, { x: 0, y: 0, w: W, h: H, fill: { color: INK, transparency: 35 }, line: { type: 'none' } });
  s.addImage({ path: IMG('logo_white.png'), x: W / 2 - 1.6, y: 2.5, w: 3.2, h: 3.2 * 180 / 800 });
  txt(s, 'Drive the Charge', { x: 0, y: 3.55, w: W, h: 0.7, fontSize: 32, color: WHITE, align: 'center' });
  txt(s, '驭电先行', { x: 0, y: 4.25, w: W, h: 0.4, fontSize: 14, color: 'C9CCD1', align: 'center', charSpacing: 6 });
  s.addNotes('谢谢。');
}

(async () => {
  const out = path.join(__dirname, 'MAXUS_首页WebUI_设计解说.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('ok', out);
})();
