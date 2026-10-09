// Render each <section> of deck.html to PNG at 2x, then build PPTX (image slides + notes)
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const fs = require('fs');
const path = require('path');

(async () => {
  const out = path.join(__dirname, 'png');
  fs.mkdirSync(out, { recursive: true });
  const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
  const pg = await b.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1.5 });
  await pg.goto('file://' + path.join(__dirname, 'deck.html'));
  await pg.evaluate(() => document.fonts.ready);
  await pg.waitForTimeout(1500);
  const n = await pg.locator('section').count();
  const only = process.env.ONLY ? process.env.ONLY.split(',').map(Number) : null;
  for (let i = 1; i <= n; i++) {
    if (only && !only.includes(i)) continue;
    await pg.locator('#s' + i).screenshot({ path: path.join(out, `s${String(i).padStart(2, '0')}.jpg`), type: 'jpeg', quality: 90 });
  }
  const fontsUsed = await pg.evaluate(() => [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family + ' ' + f.weight).filter((v, i, a) => a.indexOf(v) === i));
  console.log('fonts loaded:', fontsUsed.join(', '));
  await b.close();
  if (only) return;

  const notes = JSON.parse(fs.readFileSync(path.join(__dirname, 'notes.json')));
  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'MAXUS 官网首页设计说明';
  for (let i = 1; i <= n; i++) {
    const s = pres.addSlide();
    s.background = { color: '0C0D0F' };
    s.addImage({ path: path.join(out, `s${String(i).padStart(2, '0')}.jpg`), x: 0, y: 0, w: 13.333, h: 7.5 });
    if (notes[i - 1]) s.addNotes(notes[i - 1]);
  }
  await pres.writeFile({ fileName: path.join(__dirname, '..', 'MAXUS_首页设计说明.pptx') });
  console.log('pptx ok', n);
})();
