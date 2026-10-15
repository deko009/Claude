// Detail pass for the Chinese page (needs HarmonyOS Sans SC installed locally):
// 1. fixes line breaks with real glyph widths — balanced 2-line headings, no 1–2 character orphan lines,
//    single tokens (numbers, units) that wrap inside too-narrow boxes,
// 2. fits fixed-height text boxes to their line count,
// 3. re-flows each frame so spacing to the element above is kept, grows background panels whose
//    content now runs past them, and keeps centred text centred.
const PAGE_ID = '689:1250';
const SKIP = new Set(['689:3773']);   // original typography spec (documentation)
const BOARD = '718:1485';             // CN typography board: only refreshed
const FAMILY = 'HarmonyOS Sans SC';
const NO_START = '，。、：；！？）》」』”’·%,.;:!?)';
const isCJK = c => /[　-〿㐀-鿿＀-￯]/.test(c);

const wcache = new Map(); let probe = null;
async function charW(ch, fn, fs, ls) {
  const k = fn.family + '|' + fn.style + '|' + fs + '|' + ch; if (wcache.has(k)) return wcache.get(k);
  if (!probe) { probe = figma.createText(); probe.visible = false; }
  probe.fontName = fn; probe.fontSize = fs; probe.letterSpacing = ls; probe.textAutoResize = 'WIDTH_AND_HEIGHT'; probe.characters = ch;
  const w = probe.width; wcache.set(k, w); return w;
}
function tokens(s) { const out = []; let buf = '';
  for (const ch of s) { if (isCJK(ch) || ch === ' ' || ch === '\n') { if (buf) { out.push(buf); buf = ''; } out.push(ch); } else buf += ch; }
  if (buf) out.push(buf); return out; }
async function tokW(tok, fn, fs, ls) { let w = 0; for (const ch of tok) w += await charW(ch, fn, fs, ls); return w; }
async function breakLines(s, fn, fs, ls, maxW) {
  const lines = [];
  for (const para of s.split('\n')) {
    let cur = '', cw = 0;
    for (const tok of tokens(para)) {
      const w = await tokW(tok, fn, fs, ls);
      if (cur && cw + w > maxW + 0.5 && tok !== ' ' && !NO_START.includes(tok[0])) { lines.push(cur.trimEnd()); cur = ''; cw = 0; }
      if (!cur && tok === ' ') continue;
      cur += tok; cw += w;
    }
    lines.push(cur.trimEnd());
  }
  return lines;
}
const visLen = s => { let n = 0; for (const t of tokens(s.trim())) if (t !== ' ') n += isCJK(t) ? 1 : Math.max(1, Math.ceil(t.length / 3)); return n; };
const orphan = ls => ls.length >= 2 && visLen(ls[ls.length - 1]) <= 2;
async function loadAll(t) { for (const s of t.getStyledTextSegments(['fontName'])) await figma.loadFontAsync(s.fontName); }

(async () => {
  const page = await figma.getNodeByIdAsync(PAGE_ID); await figma.setCurrentPageAsync(page); await page.loadAsync();
  const tops = [];
  for (const c of page.children) { if (SKIP.has(c.id) || c.id === BOARD) continue;
    if (c.type === 'SECTION') tops.push(...c.children.filter(k => k.type === 'FRAME')); else if (c.type === 'FRAME') tops.push(c); }
  const stats = { refreshed: 0, token: 0, heading: 0, para: 0, fitted: 0, moved: 0, panels: 0, frames: 0, errors: [] };

  // 0. refresh the CN typography board (created without the font)
  const board = await figma.getNodeByIdAsync(BOARD);
  if (board) for (const t of board.findAllWithCriteria({ types: ['TEXT'] })) { try { await loadAll(t); const n = t.characters.length; t.insertCharacters(n, ' ', 'BEFORE'); t.deleteCharacters(n, n + 1); stats.refreshed++; } catch (e) {} }

  // 1. baseline sizes
  const base = new Map();
  for (const F of tops) { base.set(F.id, { h: F.height, w: F.width, x: F.x }); for (const n of F.findAll(() => true)) if ('height' in n) base.set(n.id, { h: n.height, w: n.width, x: n.x }); }

  // 2. text fixes
  for (const F of tops) for (const t of F.findAllWithCriteria({ types: ['TEXT'] })) {
    try {
      if (t.hasMissingFont || !t.characters.trim()) continue;
      const segs = t.getStyledTextSegments(['fontName', 'fontSize', 'letterSpacing']);
      if (segs.length !== 1 || segs[0].fontName.family !== FAMILY) continue;
      await loadAll(t);
      const fn = segs[0].fontName, fs = segs[0].fontSize, ls = segs[0].letterSpacing;
      const inAL = t.parent.type === 'FRAME' && t.parent.layoutMode && t.parent.layoutMode !== 'NONE';
      const chars = t.characters;
      if (t.textAutoResize === 'WIDTH_AND_HEIGHT') continue;
      // a) a single token squeezed into a too-narrow box → auto width
      if (!/\s/.test(chars) && [...chars].length <= 12 && !/[一-鿿]{4,}/.test(chars)) {
        const w = await tokW(chars, fn, fs, ls);
        if (w > t.width + 0.5) { t.textAutoResize = 'WIDTH_AND_HEIGHT'; if (inAL) { try { t.layoutSizingVertical = 'HUG'; } catch (e) {} } stats.token++; continue; }
      }
      let lines = await breakLines(chars, fn, fs, ls, t.width);
      // b) orphans
      if (orphan(lines)) {
        const heading = fs >= 30 || (fs >= 20 && fn.style !== 'Regular' && fn.style !== 'Light');
        if (heading && lines.length === 2 && !chars.includes('\n')) {
          const toks = tokens(chars); let best = null, bestScore = Infinity, left = 0; const total = await tokW(chars, fn, fs, ls);
          for (let i = 1; i < toks.length; i++) { left += await tokW(toks[i - 1], fn, fs, ls); const nxt = toks[i];
            if (nxt === ' ' || NO_START.includes(nxt[0])) continue; const right = total - left; if (left > t.width || right > t.width) continue;
            const score = Math.abs(left - right) - (toks[i - 1] === ' ' ? fs : 0); if (score < bestScore) { bestScore = score; best = i; } }
          if (best !== null) { const a = toks.slice(0, best).join('').trimEnd(), b = toks.slice(best).join('').trimStart(); t.characters = a + '\n' + b; lines = [a, b]; stats.heading++; }
        } else if (!(inAL && t.layoutSizingHorizontal === 'FILL')) {
          for (let k = 1; k <= 4; k++) { const nw = t.width - k * fs; if (nw < base.get(t.id).w * 0.86) break;
            const l2 = await breakLines(chars, fn, fs, ls, nw);
            if (l2.length === lines.length && !orphan(l2)) { const mode = t.textAutoResize, a = t.textAlignHorizontal, ow = t.width;
              t.resize(nw, t.height); if (mode === 'HEIGHT') t.textAutoResize = 'HEIGHT'; if (a === 'CENTER') t.x += (ow - nw) / 2; else if (a === 'RIGHT') t.x += ow - nw;
              lines = l2; stats.para++; break; } }
        }
      }
      // c) fit fixed boxes to their line count
      if (t.textAutoResize === 'NONE' && t.textAlignVertical === 'TOP') {
        const lh = typeof t.lineHeight === 'object' && t.lineHeight.unit === 'PIXELS' ? t.lineHeight.value : fs * 1.4;
        const h = Math.round(lines.length * lh); if (Math.abs(h - t.height) >= 1) { t.resize(t.width, h); stats.fitted++; }
      }
    } catch (e) { stats.errors.push(t.id + ' ' + e.message); }
  }
  if (probe) probe.remove();

  // 3. re-flow
  const flat = n => n.type === 'GROUP' ? n.children.flatMap(flat) : [n];
  const box = (n, ref) => { const b = n.absoluteBoundingBox, r = ref.absoluteBoundingBox; return { l: b.x - r.x, t: b.y - r.y, w: b.width, h: b.height }; };
  for (const F of tops) {
    // keep centred auto-width text centred
    for (const t of F.findAllWithCriteria({ types: ['TEXT'] })) { const b = base.get(t.id); if (!b || t.textAutoResize !== 'WIDTH_AND_HEIGHT') continue;
      if (t.parent.type === 'FRAME' && t.parent.layoutMode && t.parent.layoutMode !== 'NONE') continue;
      const dw = b.w - t.width; if (Math.abs(dw) < 1) continue; const a = t.textAlignHorizontal; if (a === 'CENTER') t.x += dw / 2; else if (a === 'RIGHT') t.x += dw; }
    const process = (K, isTop) => {
      const items = K.children.flatMap(flat).filter(n => n.visible);
      for (const it of items) if (it.type === 'FRAME' && (!it.layoutMode || it.layoutMode === 'NONE') && it.children.length && !it.clipsContent) process(it, false);
      const rec = items.map(n => { const b = box(n, K), o = base.get(n.id); const oh = o ? o.h : b.h; return { n, l: b.l, r: b.l + b.w, t: b.t, ob: b.t + oh, nh: b.h, nt: b.t, grow: 0 }; }).sort((a, b) => a.t - b.t);
      const panels = rec.filter(x => x.n.type === 'RECTANGLE' && x.r - x.l >= 300 && x.ob - x.t >= 200);
      const flow = () => {
        for (const I of rec) { I.nt = I.t; let best = null;
          for (const A of rec) { if (A === I || A.ob > I.t + 1 || A.t >= I.t) continue; if (Math.min(A.r, I.r) - Math.max(A.l, I.l) <= 1) continue;
            const c = A.nt + A.nh + (I.t - A.ob); if (best === null || c > best) best = c; }
          if (best !== null) I.nt = best; }
      };
      for (let pass = 0; pass < 3; pass++) {
        flow(); let grown = false;
        for (const P of panels) { const inner = rec.filter(x => x !== P && x.n.type !== 'RECTANGLE' && x.l >= P.l - 1 && x.r <= P.r + 1 && x.t >= P.t && x.t < P.ob);
          if (!inner.length) continue; const pad = Math.max(P.ob - Math.max(...inner.map(x => x.ob)), 0);
          const need = Math.max(...inner.map(x => x.nt + x.nh)) + pad - P.nt;
          if (need > P.nh + 0.5) { const add = need - P.nh; for (const Y of rec) if (Y.n.type === 'RECTANGLE' && Math.abs(Y.t - P.t) <= 4 && Math.abs(Y.ob - P.ob) <= 4) { Y.nh += add; Y.grow += add; } grown = true; } }
        if (!grown) break;
      }
      const hero = isTop ? rec.find(x => x.t <= 60 && x.r - x.l >= K.width * 0.95 && x.ob - x.t > 300 && (x.n.type === 'RECTANGLE' || x.n.type === 'FRAME')) : null;
      if (hero) { const inside = rec.filter(x => x !== hero && x.t > 80 && x.ob <= hero.ob + 1 && x.l >= hero.l - 1);
        if (inside.length) { const d = Math.max(...inside.map(x => x.ob)) - Math.max(...inside.map(x => x.nt + x.nh)); if (d > 0.5) for (const x of inside) x.nt += d; } }
      for (const I of rec) { if (I.grow) { I.n.resize(I.n.width, Math.round(I.nh)); stats.panels++; }
        const d = I.nt - I.t; if (Math.abs(d) >= 0.5) { I.n.y += Math.round(d); stats.moved++; } }
      const o = base.get(K.id); if (o && K.type === 'FRAME') { const oMax = Math.max(...rec.map(x => x.ob)), nMax = Math.max(...rec.map(x => x.nt + x.nh)); const margin = o.h - oMax;
        if (Math.abs(nMax - oMax) >= 0.5 && margin >= -1 && margin < 400) { K.resize(K.width, Math.round(nMax + margin)); if (isTop) stats.frames++; } }
    };
    process(F, true);
  }
  console.log('errors', stats.errors);
  figma.closePlugin(`完成：标题断行 ${stats.heading} · 段落孤字 ${stats.para} · 窄框数字 ${stats.token} · 文本框适配 ${stats.fitted} · 移动 ${stats.moved} · 背景加高 ${stats.panels} · 画板调整 ${stats.frames} · 规范板刷新 ${stats.refreshed} · 错误 ${stats.errors.length}`);
})();
