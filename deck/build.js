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
const INK = '0A0A0B', WHITE = 'FFFFFF', G4 = '8A8F98', G6 = '5A5F68', LIGHT = 'F1F1F0', NAVY = '070A11', BLUE = '1E5FC8', BLUEL = '6E9BF0', LINE_D = '3A3B41', LINE_L = '2C2D32';
const BG = '1A1B1F', CARD = '222328', SIG = '3D6BFF', MUTE = 'A3A7AE';

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.33 x 7.5
pres.theme = { headFontFace: 'Arial', bodyFontFace: 'Arial' };
pres.title = 'MAXUS 官网首页 Web UI 设计解说';
pres.author = 'MAXUS Web Design';

const W = 13.333, H = 7.5, MX = 0.6;

const footerObjs = [
  { text: { text: 'DRIVE THE CHARGE', options: { x: MX, y: 7.0, w: 3, h: 0.3, fontSize: 8, bold: true, color: SIG, charSpacing: 2, margin: 0 } } },
  { text: { text: '驭电先行', options: { x: MX + 1.75, y: 7.0, w: 2, h: 0.3, fontSize: 8, color: G4, margin: 0 } } },
];
pres.defineSlideMaster({ title: 'DARK', background: { color: BG }, objects: footerObjs,
  slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontSize: 8, color: G4, align: 'right' } });
pres.defineSlideMaster({ title: 'LIGHT', background: { color: BG }, objects: footerObjs,
  slideNumber: { x: W - MX - 0.6, y: 7.0, w: 0.6, h: 0.3, fontSize: 8, color: G4, align: 'right' } });
pres.defineSlideMaster({ title: 'BLANK_DARK', background: { color: BG }, objects: [] });

let section = '';
function slide(master, sec) {
  if (sec && sec !== section) { pres.addSection({ title: sec }); section = sec; }
  return pres.addSlide({ masterName: master, sectionTitle: section });
}
function txt(s, text, o) { s.addText(text, Object.assign({ isTextBox: true, margin: 0, fontFace: 'Arial', valign: 'top' }, o)); }
function header(s, eyebrow, title) {
  const i = title.indexOf('：');
  const runs = i > 0 ? [{ text: title.slice(0, i), options: { color: SIG } }, { text: '  ' + title.slice(i + 1), options: { color: WHITE } }] : [{ text: title, options: { color: WHITE } }];
  s.addText(runs, { x: MX, y: 0.42, w: W - 2 * MX, h: 0.62, fontSize: 28, bold: true, fontFace: 'Arial', margin: 0, valign: 'bottom', isTextBox: true });
  s.addShape(pres.shapes.LINE, { x: MX, y: 1.12, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  txt(s, eyebrow.replace(/^\S+\s+\/\s+/, ''), { x: MX, y: 1.2, w: 9, h: 0.22, fontSize: 9, color: G4, charSpacing: 2 });
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
function signature(s, y) {
  txt(s, 'DRIVE THE\nCHARGE', { x: MX, y, w: 4, h: 0.9, fontSize: 26, bold: true, color: SIG, lineSpacingMultiple: 0.95 });
  txt(s, '驭电先行  ·  MAXUS', { x: MX, y: y + 0.92, w: 4, h: 0.25, fontSize: 9, bold: true, color: WHITE, charSpacing: 2 });
}
{
  const s = slide('BLANK_DARK', '开篇');
  s.addImage({ path: IMG('mark_gray.png'), x: 6.3, y: 0.9, w: 7.6, h: 7.6 * 620 / 900 });
  s.addImage({ path: IMG('logo_white.png'), x: MX, y: 0.55, w: 1.9, h: 1.9 * 180 / 800 });
  txt(s, '首页 Web UI\n设计解说', { x: MX, y: 1.55, w: 8, h: 1.75, fontSize: 54, bold: true, color: WHITE, lineSpacingMultiple: 1.02 });
  s.addShape(pres.shapes.LINE, { x: MX, y: 3.45, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  txt(s, 'HOMEPAGE WEB UI  ·  DESIGN RATIONALE', { x: MX, y: 3.55, w: 6, h: 0.25, fontSize: 10, color: G4, charSpacing: 2 });
  txt(s, 'WHAT WE CHANGED,\nAND WHY.', { x: MX, y: 4.0, w: 6.5, h: 0.9, fontSize: 22, color: WHITE, lineSpacingMultiple: 1.05 });
  txt(s, '首页每个板块、字号、颜色和间距的设计说明。', { x: MX, y: 4.95, w: 6, h: 0.3, fontSize: 12, color: MUTE });
  signature(s, 5.75);
  txt(s, '2026.10', { x: W - MX - 2, y: 6.95, w: 2, h: 0.3, fontSize: 10, color: G4, align: 'right' });
  s.addNotes('开场：这份文件逐屏讲清首页每个设计决定的原因——为什么用这个字体、这个字号、这个颜色、这个间距，以及每个板块要表达什么品牌信息。所有理由都回到贵司两份材料：《品牌升级方案 v3》和 9/24、9/29 内容架构会议纪要。');
}

// ───────────────────────── TOC
{
  const s = slide('BLANK_DARK', '开篇');
  txt(s, '目录', { x: MX, y: 0.75, w: 5, h: 1.0, fontSize: 54, bold: true, color: WHITE });
  s.addShape(pres.shapes.LINE, { x: MX, y: 1.9, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  txt(s, 'CONTENTS', { x: MX, y: 2.0, w: 4, h: 0.25, fontSize: 10, color: G4, charSpacing: 2 });
  txt(s, 'ONE MAXUS.\nOVER 100 COUNTRIES.', { x: MX, y: 2.45, w: 5, h: 1.4, fontSize: 22, color: WHITE, lineSpacingMultiple: 1.05 });
  s.addImage({ path: IMG('mark_gray.png'), x: -0.6, y: 4.3, w: 4.6, h: 4.6 * 620 / 900 });
  signature(s, 5.75);
  const items = [['00', '设计依据', 'Design Basis'], ['01', '设计系统', 'Typography · Color · Spacing · Hover'], ['02', '逐屏解说', 'Screen by Screen'], ['03', '交互与问答', 'Motion · Q&A · Next Steps']];
  const x0 = 6.4, x1 = W - MX, rh = 1.18;
  items.forEach(([n, t, e], i) => {
    const y = 2.0 + i * rh;
    txt(s, n, { x: x0, y: y + 0.1, w: 2, h: 0.95, fontSize: 54, color: '4A4B52' });
    txt(s, t, { x: x1 - 4, y: y + 0.18, w: 4, h: 0.45, fontSize: 22, bold: true, color: WHITE, align: 'right' });
    txt(s, e, { x: x1 - 4, y: y + 0.66, w: 4, h: 0.3, fontSize: 11, color: MUTE, align: 'right' });
    s.addShape(pres.shapes.LINE, { x: x0, y: y + rh, w: x1 - x0, h: 0, line: { color: LINE_D, width: 0.75 } });
  });
  s.addNotes('目录：设计依据 → 设计系统 → 逐屏解说 → 交互与问答。');
}

// ───────────────────────── 02 依据
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  DESIGN BASIS', '设计依据：贵司的品牌方案和两次会议结论');
  const cols = [
    ['01', '品牌升级方案 v3', ['口号 Drive the Charge / 驭电先行', '黑白核心色：trust · clarity · authority', '线条由粗重变细锐，去装饰化', '一抹高饱和亮蓝，代表电动能量', 'European-born · Since 1896 · 100+ 国家']],
    ['02', '内容架构会议纪要', ['首页目标：拉高品牌调性', '参考奢侈品官网，跳出传统车企', '首页不放配置表，车型以“家族”呈现', 'News 与 Blog 合并为 News & Insights', '页脚只做直达链接']],
    ['03', '受众与竞品参考', ['受众：车队、司机、工程现场用户', '风格是 Professional，不是 Business', 'UI 参考：梅赛德斯-奔驰、沃尔沃', '内容参考：福特、丰田、铃木', '全球站负责品牌展示，不直接卖车']],
  ];
  const cw = (W - 2 * MX - 0.6) / 3;
  cols.forEach(([n, t, items], i) => {
    const x = MX + i * (cw + 0.3);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.75, w: cw, h: 4.9, fill: { color: CARD }, line: { color: LINE_D, width: 0.75 } });
    txt(s, n, { x: x + 0.35, y: 2.05, w: 1, h: 0.6, fontSize: 30, color: G4 });
    txt(s, t, { x: x + 0.35, y: 2.8, w: cw - 0.7, h: 0.4, fontSize: 18, bold: true, color: WHITE });
    s.addShape(pres.shapes.LINE, { x: x + 0.35, y: 3.35, w: cw - 0.7, h: 0, line: { color: LINE_D, width: 0.75 } });
    s.addText(items.map((it, k) => ({ text: it, options: { bullet: { indent: 14 }, breakLine: k < items.length - 1 } })),
      { x: x + 0.35, y: 3.5, w: cw - 0.7, h: 2.9, fontSize: 13, color: 'C9CCD1', paraSpaceAfter: 9, valign: 'top', margin: 0, isTextBox: true, fontFace: 'Arial' });
  });
  s.addNotes('客户最认可的一句话是：“这是按你们自己定的方向做的。”所以每一页的理由都标注了出处：品牌方案、会议纪要、受众定位。');
}

// ───────────────────────── 竞品参考
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  REFERENCES', '竞品参考：UI 看奔驰、沃尔沃，内容看福特、丰田、铃木');
  const cw = (W - 2 * MX - 0.4) / 2;
  const blocks = [
    ['UI 层面', '梅赛德斯-奔驰  ·  沃尔沃', [['字体简洁、层级克制', '标题不加粗、靠字号区分层级；正文统一一套字体。'], ['按钮悬停反馈', '悬停只变色、箭头右移，反馈清楚但不花哨（会议纪要点名参考奔驰）。'], ['大图 + 留白', '整屏实拍大图，文字少而集中，页面有足够留白。'], ['黑白为主的配色', '界面以黑白灰为主，颜色只做点缀。']]],
    ['内容层面（功能导向）', '福特  ·  丰田  ·  铃木', [['按车系组织产品', '首页按车系展示，用户先选车型类别，再进入详情。'], ['动力形式图标化', '纯电、混动、柴油用图标标出（会议纪要提到参考丰田）。'], ['讲用途、讲场景', '用实际工作场景介绍车辆和技术，而不是堆参数。'], ['导向国家站', '全球站负责展示，具体价格和配置交给国家站。']]],
  ];
  blocks.forEach(([t, brands, list], i) => {
    const x = MX + i * (cw + 0.4);
    s.addShape(pres.shapes.RECTANGLE, { x, y: 1.65, w: cw, h: 4.95, fill: { color: CARD }, line: { color: LINE_D, width: 0.75 } });
    txt(s, t, { x: x + 0.4, y: 1.9, w: cw - 0.8, h: 0.3, fontSize: 11, color: G4 });
    txt(s, brands, { x: x + 0.4, y: 2.2, w: cw - 0.8, h: 0.5, fontSize: 22, bold: true, color: WHITE });
    s.addShape(pres.shapes.LINE, { x: x + 0.4, y: 2.85, w: cw - 0.8, h: 0, line: { color: LINE_D, width: 0.75 } });
    list.forEach(([h, d], k) => {
      const y = 3.05 + k * 0.86;
      txt(s, '0' + (k + 1), { x: x + 0.4, y, w: 0.5, h: 0.3, fontSize: 12, color: SIG, bold: true });
      txt(s, h, { x: x + 0.95, y, w: cw - 1.35, h: 0.3, fontSize: 13, bold: true, color: WHITE });
      txt(s, d, { x: x + 0.95, y: y + 0.32, w: cw - 1.35, h: 0.45, fontSize: 11, color: MUTE, lineSpacingMultiple: 1.2 });
    });
  });
  s.addNotes('客户方确认的对标：UI 层面参考梅赛德斯-奔驰和沃尔沃，内容层面（更偏功能）参考福特、丰田、铃木。首页的字体、按钮反馈、大图留白主要参考前两者；车系组织、动力形式标识、场景化介绍参考后三者。动力形式图标目前首页还没有加，建议在车型区补上，下一版可以出方案。');
}

// ───────────────────────── 03 三原则
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  PRINCIPLES', '设计思路：这一版主要做了三件事');
  const p = [
    ['统一规范', 'Consistency', '原稿里 Michroma、Arimo、D-DIN 等字体混用，字号和间距也不统一。这一版整理成一套规范：12 级字号、16 个颜色、间距统一用 8 的倍数，各国站可以直接沿用。'],
    ['减少干扰', 'Less noise', '去掉界面里的大面积蓝色和多余装饰，按钮改为“文字 + 箭头”。页面元素少了，车和画面更突出，这也是会议里提到的奢侈品官网的做法。'],
    ['突出全球布局', 'Global → Local', '原来的照片拼贴信息多但不聚焦。现在用地球展示 100+ 国家，并按用户 IP 定位到所在国家、展示当地用车照片，对应会议提出的 Global Brand, Local Action。'],
  ];
  const cw = (W - 2 * MX - 0.8) / 3;
  p.forEach(([t, en, d], i) => {
    const x = MX + i * (cw + 0.4);
    txt(s, '0' + (i + 1), { x, y: 1.9, w: 2, h: 1.1, fontSize: 60, color: WHITE });
    s.addShape(pres.shapes.LINE, { x, y: 3.25, w: cw, h: 0, line: { color: LINE_D, width: 0.75 } });
    txt(s, t, { x, y: 3.45, w: cw, h: 0.5, fontSize: 22, bold: true, color: WHITE });
    txt(s, en.toUpperCase(), { x, y: 3.98, w: cw, h: 0.3, fontSize: 9, color: G4, charSpacing: 3 });
    txt(s, d, { x, y: 4.45, w: cw, h: 1.9, fontSize: 13, color: 'C9CCD1', lineSpacingMultiple: 1.35 });
  });
  s.addNotes('品牌方案原话：新标识要“黑白核心色、去装饰化、专业感与国际感更强”；会议要求首页“拉高品牌调性、参考奢侈品官网”。我们因此做了三件事：统一、减法、全球化叙事。');
}

// ───────────────────────── 04 首页结构
{
  const s = slide('DARK', '开篇');
  header(s, '00  /  PAGE STRUCTURE', '首页结构：共 10 屏，分三部分');
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
  s.addShape(pres.shapes.LINE, { x: MX, y: by, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  const acts = [['第一幕 · 我是谁', '首屏 + 全球 + 数据', '先介绍品牌：欧洲出身、1896 年起步、100+ 国家。品牌方案里提到，欧洲血统是海外用户建立信任最快的方式。'], ['第二幕 · 我能做什么', '车型 + 科技 + 电驱 + 越野', '按车系和技术能力介绍产品，不放具体型号和配置表（9/29 会议结论）。'], ['第三幕 · 保持联系', '资讯 + 订阅 + 页脚', '资讯区展示新闻；订阅是全页唯一的实心按钮；页脚只放直达链接。']];
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
  s.addImage({ path: IMG('mark_gray.png'), x: 6.6, y: 1.2, w: 7.2, h: 7.2 * 620 / 900 });
  txt(s, no, { x: MX, y: 1.3, w: 4, h: 1.6, fontSize: 110, color: '4A4B52' });
  txt(s, title, { x: MX, y: 3.15, w: 8, h: 1.0, fontSize: 54, bold: true, color: WHITE });
  s.addShape(pres.shapes.LINE, { x: MX, y: 4.3, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  txt(s, sub, { x: MX, y: 4.42, w: 10, h: 0.3, fontSize: 12, color: MUTE });
  signature(s, 5.75);
  return s;
}
divider('01', '设计系统', '字体 · 字号 · 颜色 · 间距 · 悬停效果').addNotes('先讲规则，再讲页面。客户问“为什么这里是这个字号”，答案都在这一章。');

// ───────────────────────── 字体选择
{
  const s = slide('DARK', '设计系统');
  header(s, '01  /  TYPEFACES', '字体：为什么用这三套');
  const rows = [
    ['sp_michroma.jpg', 'Michroma Regular', '标题 / 品牌声音', '贵司提供的品牌字体，字形和 MAXUS 字标风格一致。只用 Regular：这款字体本身没有粗体，而且字形较宽，不加粗也足够醒目；新标识的方向也是“线条变细”。', 920 / 93],
    ['sp_light.jpg', 'Geist Light / Regular / Medium', '正文 · 导航 · 数字', '一款现代无衬线字体，大字小字都清晰，支持欧洲多语言字符。用来替换原稿的 Arimo 和 D-DIN 粗体。大数字用 Light 细体，字号大但不显得笨重。', 1220 / 125],
    ['sp_mono.jpg', 'Geist Mono', '标签 · 日期 · 地点', '等宽字体常用于车辆铭牌、VIN 码这类工程标注，有工业感，符合会议提出的“Professional，不是 Business”。只用于日期、地点、标签这类短文字。', 540 / 65],
  ];
  let y = 1.75;
  rows.forEach(([f, name, role, why, ar]) => {
    const iw = 4.6, ih = Math.min(iw / ar, 0.85);
    s.addShape(pres.shapes.RECTANGLE, { x: MX, y, w: 5.0, h: 1.4, fill: { color: CARD }, line: { color: LINE_D, width: 0.75 } });
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
  const s = slide('DARK', '设计系统');
  header(s, eyebrow, title);
  const hdr = ['层级', '字体', '字号 / 行高 / 字距', '用在哪里', '为什么是这个数'];
  const opts = { fontFace: 'Arial', fontSize: 10, color: MUTE, bold: false, border: [{ type: 'none' }, { type: 'none' }, { pt: 0.75, color: LINE_D }, { type: 'none' }], margin: [4, 6, 6, 0], valign: 'bottom' };
  const body = rows.map(r => r.map((c, i) => ({ text: c, options: { fontFace: 'Arial', fontSize: i === 4 ? 11.5 : 12, color: i === 0 ? WHITE : (i === 4 ? 'D5D7DB' : G6), bold: i === 0, border: [{ type: 'none' }, { type: 'none' }, { pt: 0.5, color: '2C2D32' }, { type: 'none' }], margin: [9, 8, 9, 0], valign: 'middle' } })));
  s.addTable([hdr.map(h => ({ text: h, options: opts })), ...body], { x: MX, y: 1.6, w: W - 2 * MX, colW: [1.25, 1.75, 1.75, 2.3, 5.08] });
  if (note) txt(s, note, { x: MX, y: 6.35, w: W - 2 * MX, h: 0.5, fontSize: 11, color: MUTE });
  return s;
}
typeTable('标题字号：为什么是 72 / 56 / 44', '01  /  TYPE SCALE · DISPLAY', [
  ['Display L', 'Michroma Regular', '72 / 112% / −2%', '首屏主标题（全页仅 1 处）', '在 1920 宽的屏幕上，一行约占 57% 宽度，足够醒目，同时把画面上方留给车。如果用 96，会占到 76%，在 1440 屏会换行，也会挡住车。'],
  ['H1', 'Michroma Regular', '56 / 115% / −2%', '所有板块标题', '所有板块标题统一用 56，整页风格一致。它比首屏标题小一级，层级清楚；两行的标题（如 News & Insights）也能放进 400px 宽的栏。'],
  ['H2', 'Michroma Regular', '44 / 118% / −1.5%', '车型名、订阅 Keep up with', '比板块标题小一级，用在车型名等板块内部的标题，避免和板块标题抢层级。'],
  ['Card Title', 'Geist Regular', '32 / 125% / −1.5%', '科技详情卡标题', '卡片里的标题需要阅读，所以换成更易读的 Geist。'],
  ['H4', 'Geist Medium', '24 / 130% / −1%', '新闻标题、科技卡名', '图片下方的短标题。用 Medium 稍粗一点，和正文区分开；24 比正文 20 大一档，能看出是标题。'],
  ['Data Display', 'Geist Light', '96 / 100% / −5%', '1896 · 100+ · 1.2M+', '这三个数字是品牌最有说服力的信息，所以用全页最大的字号。用细体避免显得笨重，字距收紧让数字更紧凑。'],
], '比例：96 → 72 → 56 → 44 → 32 → 24，相邻约 ×1.27–1.33（大三度音阶式比例），层级在远看时依然清楚。Michroma 只有 Regular，所有层级都不加粗。')
  .addNotes('客户常问：“标题为什么不用粗体？”——Michroma 只有 Regular；宽体字的视觉重量已足够；新标识方向是“线条细锐”。“为什么首屏标题不再大一点？”——72 已占约 57% 屏宽，再大会与车抢主角，并在 1440 屏折行。');

typeTable('正文字号：为什么导航 18、正文 20', '01  /  TYPE SCALE · TEXT', [
  ['Body L', 'Geist Regular', '22 / 150% / −0.5%', '板块导语（宽 620–820）', '标题下方的一两句介绍。宽度控制在 620–820px，每行 60–75 个字符，读起来不累。'],
  ['Body M 20', 'Geist Regular', '20 / 150% / −0.5%', '首屏信息栏、车型描述、板块正文', '原来 18px 在大屏上偏小，统一改成 20。行高 150%（30px），两三行文字也不挤。'],
  ['Body S', 'Geist Regular', '16 / 145% / 0', '照片说明、数据说明、公告栏', '用于图片说明等辅助信息。全站正文最小 16，不再用更小的字。'],
  ['Nav', 'Geist Regular', '18 / 120% / −0.5%', '顶部导航', '导航用得最多，原来 16px 在大屏上偏小，改成 18 更容易看清和点击。不加粗，因为它叠在首屏视频上，太粗会抢画面。这也是会议提到的奔驰官网的做法。'],
  ['Button', 'Geist Medium', '16 / 120% / −0.5%', '文字链接（+16px 箭头，间距 10）', '按客户要求，首页按钮改为文字链接。用 Medium 稍粗，让用户看出可以点击；箭头 16px，和文字对齐。'],
  ['Data Mono', 'Geist Mono Regular', '14 / 140% / 0', '日期、地点、标签（大写）', '日期、地点、标签用的小字，统一大写。14 是这类字体能看清的最小字号。'],
], '规则：正文 ≥ 16，标注 ≥ 14；不单独改行高与字距——需要调整时改样式本身，全站同步。')
  .addNotes('“导航为什么是 18？”——导航是用户最常点的地方。原 16px 在大屏偏小；18 在 1920 与 1440 屏都清楚，又比标题小得多，不会喧宾夺主。用 Regular 而非粗体，压在视频上也安静。“正文为什么 20？”——大屏阅读距离下 20 最舒适，150% 行高给足呼吸。');

// ───────────────────────── 颜色
{
  const s = slide('DARK', '设计系统');
  header(s, '01  /  COLOR', '颜色：黑白为主，蓝色只用在悬停');
  const groups = [
    ['品牌核心', [['Ink', '0A0A0B', '主文字 / 浅底主按钮'], ['White', 'FFFFFF', '深底文字 / 页面底色'], ['Brand Blue', '1E5FC8', '浅底 Hover / Focus'], ['Blue Light', '6E9BF0', '深底 Hover（对比≈7:1）']]],
    ['中性灰阶', [['Gray 600', '5A5F68', '说明文字'], ['Gray 400', '8A8F98', '日期 / 标签'], ['Surface Light', 'F1F1F0', '浅色区块底']]],
    ['深色界面 · 数据可视化', [['Navy', '070A11', '全球板块底'], ['Surface Dark', '0C0D0F', '页脚底'], ['Globe Ocean', '1F6BC6', '地球海洋（仅地球）'], ['Globe Land', '61F2AD', '陆地点阵（仅地球）']]],
  ];
  let y = 1.6;
  groups.forEach(([g, list]) => {
    txt(s, g, { x: MX, y, w: 2, h: 0.3, fontSize: 10, color: MUTE, charSpacing: 1 });
    list.forEach(([n, hex, use], i) => {
      const x = 2.4 + i * 1.68;
      s.addShape(pres.shapes.RECTANGLE, { x, y, w: 1.55, h: 0.62, fill: { color: hex }, line: { color: LINE_D, width: 0.5 } });
      txt(s, n, { x, y: y + 0.68, w: 1.6, h: 0.22, fontSize: 9.5, bold: true, color: WHITE });
      txt(s, '#' + hex + '  ·  ' + use, { x, y: y + 0.9, w: 1.6, h: 0.4, fontSize: 8, color: MUTE });
    });
    y += 1.55;
  });
  const rx = 9.3;
  txt(s, '为什么', { x: rx, y: 1.6, w: 3.4, h: 0.35, fontSize: 15, bold: true, color: WHITE });
  const why = [
    ['黑白＝信任', '品牌方案：黑白核心色跨文化传达 trust、clarity、authority，去装饰化。'],
    ['蓝色＝电', '方案把辅助色收敛为“一抹高饱和亮蓝，代表电动能量”。我们只让它在 Hover 时亮起——用户触碰，品牌“通电”。'],
    ['不做蓝色按钮', '蓝色按钮是车企和 B2B 网站的通用做法，反而显得普通。'],
    ['深底文字透明度', '标题 100% · 正文 80% · 说明 72% · 标签 60%，用透明度而不是新颜色拉层级。'],
  ];
  let wy = 2.05;
  why.forEach(([t, d]) => {
    txt(s, t, { x: rx, y: wy, w: 3.4, h: 0.28, fontSize: 12, bold: true, color: WHITE });
    txt(s, d, { x: rx, y: wy + 0.3, w: 3.4, h: 0.75, fontSize: 10.5, color: MUTE, lineSpacingMultiple: 1.2 });
    wy += 1.12;
  });
  s.addNotes('“为什么不用我们的蓝色？”——新品牌方案已把核心色定为黑白，亮蓝是“一抹”点缀，代表电动能量。我们把它用在最能体现“能量”的时刻：用户悬停、聚焦时亮起。深色背景上原色对比度不够，所以深底用浅一档的 #6E9BF0。地球的蓝绿色属于数据可视化，只在地球上出现。');
}

// ───────────────────────── 间距
{
  const s = slide('DARK', '设计系统');
  header(s, '01  /  SPACING', '间距：全部用 8 的倍数');
  // page diagram
  const px = MX, py = 1.65, pw = 6.4, sc = pw / 1920;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: 4.9, fill: { color: CARD }, line: { color: LINE_D, width: 0.75 } });
  const m = 120 * sc;
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: m, h: 4.9, fill: { color: '1F2A44' }, line: { type: 'none' } });
  s.addShape(pres.shapes.RECTANGLE, { x: px + pw - m, y: py, w: m, h: 4.9, fill: { color: '1F2A44' }, line: { type: 'none' } });
  s.addShape(pres.shapes.RECTANGLE, { x: px, y: py, w: pw, h: 140 * sc, fill: { color: '3A2C1F' }, line: { type: 'none' } });
  const cx = px + m, cw = pw - 2 * m;
  let y = py + 140 * sc;
  const blocks = [['眉标  Data Mono 14', 0.12, 24], ['板块标题  H1 56', 0.36, 24], ['导语  Body L 22', 0.42, 32], ['文字链接  Button 16 →', 0.12, 80], ['内容区（卡片 / 图片）', 1.55, 0]];
  blocks.forEach(([t, h, gap]) => {
    s.addShape(pres.shapes.RECTANGLE, { x: cx, y, w: t.startsWith('内容') ? cw : cw * 0.6, h, fill: { color: t.startsWith('内容') ? '2C2D33' : '3A3B42' }, line: { type: 'none' } });
    txt(s, t, { x: cx + 0.08, y: y + (h - 0.2) / 2, w: 3.5, h: 0.2, fontSize: 8, color: WHITE, valign: 'middle' });
    if (gap) txt(s, '↕ ' + gap, { x: cx + cw * 0.6 + 0.12, y: y + h - 0.02, w: 0.8, h: gap * sc + 0.05, fontSize: 8, color: BLUEL, valign: 'middle' });
    y += h + gap * sc;
  });
  txt(s, '120', { x: px, y: py + 4.55, w: m, h: 0.2, fontSize: 8, color: BLUEL, align: 'center' });
  txt(s, '120', { x: px + pw - m, y: py + 4.55, w: m, h: 0.2, fontSize: 8, color: BLUEL, align: 'center' });
  txt(s, '140', { x: px + pw / 2 - 0.4, y: py + 0.03, w: 0.8, h: 0.2, fontSize: 8, color: 'E0A060', align: 'center' });
  // table
  const rows = [['页面左右边距', '120', '1920 屏上内容宽 1680，左右各留 6%，画面有“画册”的边'], ['板块上下', '140', '屏与屏之间的停顿，像翻页'], ['标题组 → 内容', '80', '先读标题，再看内容的节奏'], ['导语 → 文字链接', '32', '链接紧跟导语，读完就能点'], ['眉标 → 标题 → 导语', '24', '同一组信息，靠近才是一组'], ['卡片间距', '12', '卡片成组，不散'], ['文字 → 箭头', '10', '箭头属于文字，不是独立按钮']];
  const opts = (b, c) => ({ fontFace: 'Arial', fontSize: 10.5, color: c, bold: b, border: [{ type: 'none' }, { type: 'none' }, { pt: 0.5, color: '2C2D32' }, { type: 'none' }], margin: [5, 4, 5, 0], valign: 'middle' });
  s.addTable(rows.map(r => [{ text: r[0], options: opts(true, INK) }, { text: r[1], options: opts(false, BLUE) }, { text: r[2], options: opts(false, G6) }]), { x: 7.35, y: 1.65, w: 5.4, colW: [1.55, 0.55, 3.3] });
  txt(s, '全部为 8 的倍数（或 4 的细分）：开发可以直接写成变量，各国站复用时不会走样。', { x: 7.35, y: 5.9, w: 5.4, h: 0.5, fontSize: 10.5, color: MUTE, lineSpacingMultiple: 1.2 });
  s.addNotes('“为什么这里空这么多？”——留白是奢侈品官网的核心手法（会议要求参考）。所有间距用同一把尺子，每一屏呼吸感一致，整页看下来稳；开发也能直接变量化。');
}

// ───────────────────────── Hover
{
  const s = slide('DARK', '设计系统');
  header(s, '01  /  INTERACTION', '悬停效果：只变颜色');
  s.addImage({ path: IMG('ds_hover.jpg'), x: MX, y: 1.6, w: 7.6, h: 7.6 * 475 / 1070 });
  const rx = 8.55;
  const rules = [['文字链接', '文字与箭头变主题蓝；箭头右移 4px，提示“往前走”。200ms ease-out。'], ['导航', '文字变 #6E9BF0 + 2px 下划线（深底）。'], ['车型标签', '默认灰 → 悬停蓝 → 选中墨色 + 2px 下划线。三态清楚。'], ['新闻卡片', '标题变蓝，图片放大 1.03（400ms）。'], ['社媒 / 播放按钮', '细描边变蓝，底色不变。']];
  let y = 1.6;
  rules.forEach(([t, d]) => {
    txt(s, t, { x: rx, y, w: 4.2, h: 0.28, fontSize: 13, bold: true, color: WHITE });
    txt(s, d, { x: rx, y: y + 0.3, w: 4.2, h: 0.5, fontSize: 11, color: MUTE, lineSpacingMultiple: 1.2 });
    y += 0.88;
  });
  txt(s, '依据：会议纪要“参考奔驰的按钮悬浮状态反馈”。Figma 中已建成可交互组件“MAXUS / 文字链接（含 Hover）”，演示模式可直接体验。', { x: rx, y: 6.1, w: 4.2, h: 0.7, fontSize: 10, color: MUTE, lineSpacingMultiple: 1.2 });
  s.addNotes('悬停只改变颜色，不加底色、不加粗——反馈清楚但克制，不破坏版面。蓝色只在用户触碰时出现，对应品牌方案里“一抹亮蓝＝电动能量”。');
}

// ───────────────────────── SECTION: 逐屏解说
divider('02', '逐屏解说', '每一屏的设计和理由，截图上的编号对应右侧说明').addNotes('接下来逐屏讲。每页左侧截图上的编号，对应右侧的解说。');

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
  header(s, '02  /  01  ANNOUNCEMENT & NAVIGATION', '公告栏与导航：口号放第一行，导航用 18px');
  const iw = W - 2 * MX, ih = iw * 106 / 1600;
  s.addImage({ path: IMG('crop_nav.jpg'), x: MX, y: 1.7, w: iw, h: ih });
  const fx = px => MX + px / 1920 * iw, fy = py => 1.7 + py / 128 * ih;
  marker(s, 1, fx(960) - 2.6, fy(24)); marker(s, 2, fx(140) - 0.05, fy(88) + 0.45); marker(s, 3, fx(960), fy(88) + 0.45); marker(s, 4, fx(1830), fy(88) + 0.45); marker(s, 5, fx(400), fy(128) + 0.05);
  const items = [
    [1, '公告栏 · Body S 16', '第一行放品牌口号 Drive the Charge。两侧的细箭头取自新 Logo 向前、向上的造型，做得细、做了渐隐，不会抢首屏画面。'],
    [2, 'Logo · 横版组合', '按品牌规范，高度有限的位置用横版 Logo。高 24px，和导航文字对齐。'],
    [3, '导航 · Geist Regular 18', '原 16px 在大屏上偏小，改为 18，更容易看清和点击。不加粗，避免压在视频上太重。5 个一级入口居中，间距 34px。'],
    [4, '工具图标 · 20px 线性', '搜索、下载、账户。1.5px 线宽，和全站箭头图标是同一套样式。'],
    [5, '1px 分隔线 · 白 12%', '导航背景透明，叠在视频上；下面只加一条很淡的分隔线，不用实色底条，画面更完整。'],
  ];
  const cw = (W - 2 * MX - 0.6) / 3;
  items.forEach((it, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    notes(s, [it], MX + col * (cw + 0.3), 3.05 + row * 1.75, cw);
  });
  s.addNotes('客户问“导航为什么是 18？”：导航是全站最常用的工具，原 16px 在 1920 大屏上显得小，18 更稳重也更好点；但我们没有加粗，因为它压在首屏视频上，太重会抢画面。参考了会议里提到的奔驰：字体简洁、层级克制。公告栏的箭头不是装饰，而是 Logo“向前、向上”的延伸。');
}

screenSlide('逐屏解说', '02  /  01  HERO', '首屏：一句标题 + 三条品牌信息', 'hero.jpg', 1920, 1128,
  [[1, 330, 920], [2, 150, 1000], [3, 900, 1010], [4, 1660, 1000], [5, 1500, 400]],
  [[1, '主标题 · Display L 72', '全页只有这里用 72。一行居中，放在画面下方，上方留给车。'],
   [2, 'EUROPEAN-BORN', '来自品牌定位：European-born commercial vehicle brand。'],
   [3, '一句话产品线 · Body M 20', '一句话说明产品线：从轻客、皮卡到重卡，纯电、混动、柴油都有。来自品牌方案的标准介绍。'],
   [4, 'HERITAGE SINCE 1896', '品牌方案提出，欧洲血统是海外用户建立信任最快的方式。'],
   [5, '视频主视觉', '用行驶中的车做首屏视频。当前车型是参考素材，正式版需换成 MAXUS 实拍。']],
  '首屏只做三件事：一句主张（Maximize Your Business）、一个画面（行驶中的车）、三句身份（欧洲出身 / 全系产品 / 1896 传承）。信息栏用一根 1px 细线托住，像画册的图注。“为什么标题这么小？”——72 在 1920 屏一行已占约 57% 宽度；更大会与车抢视线。');

screenSlide('逐屏解说', '02  /  02  GLOBAL · STAGE 1', '全球板块 1/3：地球自转', 'globe0.jpg', 1920, 1080,
  [[1, 560, 470], [2, 1250, 300], [3, 900, 490], [4, 1020, 995]],
  [[1, '标题压在地球上 · H1 56', '标题直接叠在地球上，一眼看出这一屏讲的是全球布局。'],
   [2, '点阵地球', '陆地用细点阵表现，呼应新 Logo 细线条的风格。蓝绿色只用在地球上，不用在按钮等界面元素。'],
   [3, '方框定位标', '方框样式的定位点，和全站图标风格一致。'],
   [4, 'LOCATING YOUR MARKET … · Mono 14', '进入时后台按 IP 识别国家，这行小字提示正在定位。']],
  '这一屏回应会议要求“突出 Glocal 与全球布局”。滚动开始前地球缓慢自转（约 20 秒一圈），给用户一个安静的进场。');

screenSlide('逐屏解说', '02  /  02  GLOBAL · STAGE 2', '全球板块 2/3：定位到用户所在国家', 'globeA.jpg', 1920, 1080,
  [[1, 870, 722], [2, 170, 240], [3, 620, 640], [4, 240, 680]],
  [[1, '定位光环', '地球转到用户所在国家（示例为英国）后停住，两圈细光环标出位置。'],
   [2, '4 张本地实景', '展示该国家的用车场景：配送、木工、花店、接送。对应 9/24 会议提出的 Global Brand, Local Action。'],
   [3, '细引线 · 白 22%', '细线把每张照片连回定位点，说明这些场景都在用户所在的国家。'],
   [4, '地点标注 · Mono 14', '只标城市名，不放大段文字。']],
  '照片按国家由 CMS 配置，没有配置的国家显示所在大区的通用图。当前为 AI 示意图，上线前换实拍。动效：照片从定位点方向依次放大浮出（0.6→1，间隔 120ms），引线跟着画出。');

screenSlide('逐屏解说', '02  /  02  GLOBAL · STAGE 3', '全球板块 3/3：出现三组数据', 'globeB.jpg', 1920, 1080,
  [[1, 240, 860], [2, 795, 860], [3, 960, 640], [4, 1020, 555]],
  [[1, '数据 · Geist Light 96', '1896、100+、1.2M+。这是品牌最有说服力的信息，所以用全页最大字号；细体避免显得笨重。'],
   [2, '1px 竖分隔 · 白 16%', '没有用磨砂底板，因为底板会把地球切断。数字直接放在深色背景上，只用细竖线分隔。'],
   [3, '地球下沉渐隐', '地球下半部逐渐变暗，数字更清楚。'],
   [4, '定位保留', '保留用户所在国家的定位，前后两段画面衔接得上。']],
  '数字滚到位后只计数一次（1.4 秒，依次间隔 120ms），停在任何位置都显示正确终值。原稿数字用 D-DIN 粗体压在照片上，看不清也挡车；现在改为细的大号数字。');

screenSlide('逐屏解说', '02  /  03  VEHICLES', '车型：按车系展示，不放配置', 'vehicles.jpg', 1920, 1248,
  [[1, 960, 180], [2, 120, 360], [3, 600, 400], [4, 260, 516], [5, 60, 726]],
  [[1, '巨幅 MAXUS 字标 · 浅灰', '浅灰色的大字标做背景，八个车系都在 MAXUS 这个名字下，又不抢车的画面。'],
   [2, '选中态 · 墨色 + 2px 下划线', '选中的车系用黑字加下划线，悬停时变蓝。'],
   [3, '八大家族等宽排列 · Nav 18', '品牌方案的七大车系加改装车，重卡单独列出，一眼看到完整产品线。'],
   [4, '车型小图', '切换车系时同步切换，方便识别车型。'],
   [5, '车型名 H2 44 + 描述 Body M 20', '只写一句用途，不放参数和配置表（9/29 会议结论）。']],
  '会议结论：首页核心是拉高调性，车型链接“可有可无”，所以车型区只负责让用户知道“我们有这八个家族”。横幅左侧压暗已减轻，墙面质感透出来，车更清楚。', { gap: 0.06 });

screenSlide('逐屏解说', '02  /  04  TECHNOLOGY', '科技：沿用第一版的三张视频卡', 'tech.jpg', 1920, 1094,
  [[1, 60, 50], [2, 1600, 450], [3, 400, 620], [4, 380, 885]],
  [[1, '标题 · H1 56 两行左对齐', '标题讲技术对用户的用处，不讲参数。'],
   [2, '三张等大视频卡', '智能驾驶、动力方案、安全各一张卡，用视频展示实际场景。会议要求技术内容少用术语、多用场景。'],
   [3, '磨砂播放按钮 · 72px', '半透明磨砂底加白色细描边，质感更好，又不会太科技风。悬停时描边变蓝。'],
   [4, '卡片名 · H4 24', '放在卡片左下角，和板块标题左对齐。']],
  '这一版沿用客户已看过的第一版结构（三列视频入口），只在字体、按钮质感上精修，便于过稿。点击卡片打开详情（弹窗已设计）。');

{
  const s = slide('DARK', '逐屏解说');
  header(s, '02  /  05–06  ENGINEERING CHAPTERS', '电驱与越野：整屏大图，文字放左下角');
  const w = 5.95, h = w * 1080 / 1920;
  annotated(s, 'electric.jpg', MX, 1.62, w, 1920, 1080, [[1, 45, 650], [2, 45, 800], [3, 45, 930]]);
  annotated(s, 'offroad.jpg', MX + w + 0.23, 1.62, w, 1920, 1080, [[4, 1500, 400]]);
  const items = [[1, '标题 · H1 56', '和其他板块标题同一字号。'], [2, '正文 · Body M 20，宽 620', '三行以内，说清这项技术解决什么问题。'], [3, '文字链接 + 箭头', '按客户要求减少首页按钮，改成文字链接；稍粗的字重提示可以点击。'], [4, '画面压暗只在左下', '只在左下角加暗色渐变，保证文字看得清，画面其他部分保持原样。文字距左 120、距底 140。']];
  const cw = (W - 2 * MX - 0.9) / 4;
  items.forEach((it, i) => notes(s, [it], MX + i * (cw + 0.3), 5.2, cw));
  s.addNotes('电驱与越野是一组“工程能力”章节，用整屏画面讲。文字统一放在左下角同一位置，两屏读起来像画册的两页。按钮从白底黑字改为文字链接，是客户“首页不要太多跳转按钮”的要求。');
}

screenSlide('逐屏解说', '02  /  07  NEWS & INSIGHTS', 'News & Insights：沿用第一版结构，统一细节', 'news.jpg', 1920, 1433,
  [[1, 40, 170], [2, 40, 310], [3, 640, 260], [4, 500, 628], [5, 500, 680]],
  [[1, '标题 · H1 56，栏宽 400', '左边放标题，右边 2×2 四篇文章，结构和第一版一致。'],
   [2, 'View all stories → · Button 16', '原来是蓝色粗体，改成和全站一致的黑色文字链接。'],
   [3, '分类标签 · 烟熏磨砂 + Mono 大写', 'Brand News、Country News、Brand Information，对应会议确定的三类内容。'],
   [4, '日期 · Data Mono 14 灰', '日期用灰色小字，不抢标题。'],
   [5, '文章标题 · H4 24', '悬停时标题变蓝、图片轻微放大。']],
  '会议纪要：取消独立 Blog，合并为 News and Insights，分为全球品牌新闻、国家新闻、产品洞察三类。卡片图圆角 4，与按钮同一圆角；页边距按规范统一为 120 / 140。', { gap: 0.06 });

screenSlide('逐屏解说', '02  /  08  SUBSCRIBE', '订阅：首页唯一保留的实心按钮', 'subscribe.jpg', 1920, 960,
  [[1, 760, 170], [2, 400, 300], [3, 650, 774], [4, 1260, 774], [5, 650, 850]],
  [[1, 'Keep up with · H2 44', '订阅区的引导语。'],
   [2, 'MAXUS 字标', '页面结尾放大号字标，加深品牌印象。'],
   [3, '白色输入框 · 64px 高', '白色输入框在任何背景图上都清楚。'],
   [4, '黑底 Subscribe →', '首页其他按钮都改成了文字链接，订阅是唯一需要用户留信息的地方，所以保留实心按钮。'],
   [5, '同意条款 · 14', '合规需要的同意条款，用 14px。']],
  '订阅是首页唯一保留实心样式的按钮：其他入口都是“了解更多”，只有这里是用户主动留下联系方式的转化动作。背景图为 AI 示意，上线前换实拍。', { gap: 0.06 });

screenSlide('逐屏解说', '02  /  09  FOOTER', '页脚：只放直达链接', 'footer.jpg', 1920, 700,
  [[1, 120, 115], [2, 1320, 150], [3, 120, 260], [4, 1320, 310], [5, 1600, 645]],
  [[1, 'Logo · 横版白色', '深色背景用白色横版 Logo，符合品牌规范。'],
   [2, 'Newsletter · 下划线输入', '页脚也能订阅，但用简单的下划线输入框，不和上面的订阅区重复。'],
   [3, '四栏标签 · Mono 大写 + 链接 18', '按 9/29 会议结论，页脚只放直达链接，分成四组。'],
   [4, '社媒 · 44px 细描边圆', '统一的线性图标，悬停时描边变蓝。'],
   [5, 'Choose Your Market', '跳转到各国站点。全球站负责品牌展示，价格和配置在国家站。']],
  '页脚回归常规：好找、松散、清楚，不做花样。“Choose Your Market”是全球站的重要出口：全球站负责形象，国家站负责价格与配置（9/29 会议）。', { imgW: 7.6, gap: 0.08 });

// ───────────────────────── 动效
{
  const s = slide('DARK', '交互与问答');
  header(s, '03  /  MOTION', '全球板块动效：分三段随滚动播放');
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
  const s = slide('DARK', '交互与问答');
  header(s, '03  /  Q & A', '客户可能会问的问题');
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
    s.addShape(pres.shapes.RECTANGLE, { x, y, w: cw, h: 1.12, fill: { color: CARD }, line: { color: '2C2D32', width: 0.5 } });
    txt(s, 'Q', { x: x + 0.25, y: y + 0.2, w: 0.4, h: 0.4, fontSize: 20, color: BLUEL });
    txt(s, q, { x: x + 0.75, y: y + 0.2, w: cw - 1, h: 0.3, fontSize: 13, bold: true, color: WHITE });
    txt(s, a, { x: x + 0.75, y: y + 0.55, w: cw - 1, h: 0.5, fontSize: 11, color: MUTE, lineSpacingMultiple: 1.2 });
  });
  s.addNotes('如果客户坚持使用蓝色：可以只用在一处关键动作上（例如订阅按钮的悬停），不建议做成大面积按钮或底色。');
}

// ───────────────────────── 待确认
{
  const s = slide('DARK', '交互与问答');
  header(s, '03  /  NEXT STEPS', '待确认：上线前需要贵司提供的内容');
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
  s.addImage({ path: IMG('mark_gray.png'), x: 6.3, y: 0.9, w: 7.6, h: 7.6 * 620 / 900 });
  s.addImage({ path: IMG('logo_white.png'), x: MX, y: 0.55, w: 1.9, h: 1.9 * 180 / 800 });
  txt(s, 'DRIVE THE\nCHARGE', { x: MX, y: 1.9, w: 8, h: 2.3, fontSize: 72, bold: true, color: SIG, lineSpacingMultiple: 0.92 });
  s.addShape(pres.shapes.LINE, { x: MX, y: 4.45, w: W - 2 * MX, h: 0, line: { color: LINE_D, width: 0.75 } });
  txt(s, '驭电先行  ·  THANK YOU', { x: MX, y: 4.58, w: 6, h: 0.3, fontSize: 12, bold: true, color: WHITE, charSpacing: 3 });
  s.addNotes('谢谢。');
}

(async () => {
  const out = path.join(__dirname, 'MAXUS_首页WebUI_设计解说.pptx');
  await pres.writeFile({ fileName: out });
  await applyTheme(out, THEME);
  console.log('ok', out);
})();
