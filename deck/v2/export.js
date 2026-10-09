// deck.html -> editable PPTX: background image per slide (text hidden) + native text boxes
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, '..', 'MAXUS_首页设计说明.pptx');
const PX = 13.333 / 1920; // inches per css px
const PT = 0.5;           // points per css px (1920px = 960pt)

(async () => {
  const bgDir = path.join(__dirname, 'bg'); fs.mkdirSync(bgDir, { recursive: true });
  const pngDir = path.join(__dirname, 'png'); fs.mkdirSync(pngDir, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.5 });
  await pg.goto('file://' + path.join(__dirname, 'deck.html'));
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1200);
  const n = await pg.locator('section').count();

  // 1) full renders (for PDF) + text extraction
  const data = [];
  for (let i = 1; i <= n; i++) {
    await pg.locator('#s' + i).screenshot({ path: path.join(pngDir, `s${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
    data.push(await pg.evaluate(id => {
      const sec = document.getElementById(id), sr = sec.getBoundingClientRect();
      const inl = el => el.tagName === 'BR' || (getComputedStyle(el).display.startsWith('inline') && el.tagName !== 'svg' && el.tagName !== 'IMG');
      const allInlineDesc = el => [...el.querySelectorAll('*')].every(c => inl(c) || c.closest('svg'));
      const hasText = el => el.textContent.replace(/\s+/g, '').length > 0;
      const blocks = [];
      sec.querySelectorAll('*').forEach(el => {
        if (el.closest('svg') || inl(el) || !hasText(el)) return;
        if (![...el.childNodes].some(c => (c.nodeType === 3 && c.textContent.trim()) || (c.nodeType === 1 && inl(c)))) return;
        if (!allInlineDesc(el)) return;
        const cs = getComputedStyle(el), r = el.getBoundingClientRect();
        if (cs.visibility === 'hidden' || r.width === 0) return;
        const runs = [];
        const walk = node => {
          node.childNodes.forEach(c => {
            if (c.nodeType === 3) {
              const t = c.textContent.replace(/[ \t\n\r]+/g, ' ');
              if (!t) return;
              const ps = getComputedStyle(c.parentElement);
              runs.push({ t: ps.textTransform === 'uppercase' ? t.toUpperCase() : t, fam: ps.fontFamily, w: +ps.fontWeight, size: parseFloat(ps.fontSize), color: ps.color, ls: ps.letterSpacing === 'normal' ? 0 : parseFloat(ps.letterSpacing), op: +ps.opacity });
            } else if (c.nodeType === 1) {
              if (c.tagName === 'BR') runs.push({ br: true });
              else if (c.tagName !== 'svg') walk(c);
            }
          });
        };
        walk(el);
        // trim
        while (runs.length && runs[0].t !== undefined && !runs[0].t.trim()) runs.shift();
        if (runs.length && runs[0].t) runs[0].t = runs[0].t.replace(/^ +/, '');
        const last = [...runs].reverse().find(r => r.t !== undefined); if (last) last.t = last.t.replace(/ +$/, '');
        const lh = cs.lineHeight === 'normal' ? parseFloat(cs.fontSize) * 1.25 : parseFloat(cs.lineHeight);
        const range = document.createRange(); range.selectNodeContents(el);
        const tr = range.getBoundingClientRect();
        const lines = new Set([...range.getClientRects()].map(q => Math.round(q.top))).size;
        blocks.push({ x: r.left - sr.left, y: r.top - sr.top, w: r.width, h: r.height, tx: tr.left - sr.left, tw: tr.width, ty: tr.top - sr.top, align: cs.textAlign, lh, lines, pad: parseFloat(cs.paddingLeft) || 0, padT: parseFloat(cs.paddingTop) || 0, runs, op: (() => { let o = 1, e = el; while (e && e !== sec) { o *= +getComputedStyle(e).opacity; e = e.parentElement; } return o; })() });
      });
      return blocks;
    }, 's' + i));
  }
  // 2) backgrounds without HTML text
  await pg.addStyleTag({ content: 'section, section *{color:transparent !important;-webkit-text-fill-color:transparent !important;text-decoration:none !important}' });
  for (let i = 1; i <= n; i++) await pg.locator('#s' + i).screenshot({ path: path.join(bgDir, `b${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
  await b.close();

  // 3) PPTX
  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'notes.json')));
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'MAXUS 官网首页设计说明';
  pres.theme = { headFontFace: 'Geist', bodyFontFace: 'Geist' };
  const CJK = /[⺀-鿿豈-﫿︰-﹏＀-￯　-〿“”‘’…]/;
  const BG = [12, 13, 15];
  const hex = (c, op) => {
    const m = c.match(/[\d.]+/g).map(Number); const a = (m[3] ?? 1) * op;
    return m.slice(0, 3).map((v, k) => Math.round(v * a + BG[k] * (1 - a)).toString(16).padStart(2, '0')).join('').toUpperCase();
  };
  const latin = (fam, w) => {
    if (/Michroma/.test(fam)) return 'Michroma';
    if (/Geist Mono/.test(fam)) return 'Geist Mono';
    if (/^['"]?Noto/.test(fam)) return null;
    return w <= 250 ? 'Geist ExtraLight' : w <= 350 ? 'Geist Light' : w <= 450 ? 'Geist' : 'Geist Medium';
  };
  const cjk = w => (w <= 350 ? 'Noto Sans SC Light' : w <= 450 ? 'Noto Sans SC' : 'Noto Sans SC Medium');
  const used = {};
  data.forEach((blocks, i) => {
    const s = pres.addSlide();
    s.addImage({ path: path.join(bgDir, `b${String(i + 1).padStart(2, '0')}.jpg`), x: 0, y: 0, w: 13.333, h: 7.5 });
    blocks.forEach(bk => {
      const out = [];
      bk.runs.forEach(r => {
        if (r.br) { if (out.length) out[out.length - 1].options.breakLine = true; return; }
        const lf = latin(r.fam, r.w);
        // split by script
        let buf = '', isC = null;
        const flush = () => {
          if (!buf) return;
          const face = isC || !lf ? cjk(r.w) : lf;
          used[face] = (used[face] || '') + buf;
          out.push({ text: buf, options: { fontFace: face, fontSize: +(r.size * PT).toFixed(1), color: hex(r.color, bk.op), charSpacing: r.ls ? +(r.ls * PT).toFixed(2) : undefined } });
          buf = '';
        };
        for (const ch of r.t) { const c = CJK.test(ch); if (isC !== null && c !== isC) flush(); isC = c; buf += ch; }
        flush();
      });
      if (!out.length) return;
      const single = bk.lines <= 1;
      let x = bk.tx, w = bk.tw, y = bk.ty, h = Math.max(bk.lh * bk.lines, 10);
      if (single) {
        const extra = w * 0.25 + 20;
        if (bk.align === 'right' || bk.align === 'end') x -= extra; else if (bk.align === 'center') x -= extra / 2;
        w += extra;
      } else { x = bk.x + bk.pad; w = (bk.w - bk.pad * 2) * 1.04 + 8; }
      s.addText(out, { x: x * PX, y: y * PX, w: w * PX, h: h * PX, margin: 0, valign: 'top', align: single ? (bk.align === 'right' || bk.align === 'end' ? 'right' : bk.align === 'center' ? 'center' : 'left') : (bk.align === 'center' ? 'center' : 'left'), lineSpacing: +(bk.lh * PT).toFixed(1), wrap: !single, fit: 'none', isTextBox: true });
    });
    if (notes[i]) s.addNotes(notes[i]);
  });
  await pres.writeFile({ fileName: OUT });
  fs.writeFileSync(path.join(__dirname, 'used_chars.json'), JSON.stringify(used));
  console.log('pptx', n, 'faces:', Object.keys(used).join(', '));
})();
