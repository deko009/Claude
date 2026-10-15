// Re-shapes every text layer in the file with the real fonts (ELECTROX / Stolzl).
// Layers edited without the font installed keep fallback glyphs until they are touched;
// inserting and deleting one character forces Figma to lay the text out again
// without changing content or mixed styling.
(async () => {
  let done = 0, skipped = 0, missing = 0;
  const inInstance = (n) => { for (let p = n.parent; p; p = p.parent) if (p.type === 'INSTANCE') return true; return false; };
  for (const page of figma.root.children) {
    await page.loadAsync();
    const texts = page.findAllWithCriteria({ types: ['TEXT'] });
    const fonts = new Map();
    for (const t of texts) {
      if (t.hasMissingFont || t.characters.length === 0) continue;
      for (const f of t.getRangeAllFontNames(0, t.characters.length)) fonts.set(f.family + '|' + f.style, f);
    }
    for (const f of fonts.values()) { try { await figma.loadFontAsync(f); } catch (e) {} }
    for (const t of texts) {
      if (t.hasMissingFont) { missing++; continue; }
      if (t.characters.length === 0 || inInstance(t)) { skipped++; continue; }
      try {
        const end = t.characters.length;
        t.insertCharacters(end, ' ', 'BEFORE');
        t.deleteCharacters(end, end + 1);
        done++;
      } catch (e) { skipped++; }
    }
    figma.notify(`${page.name}: ${texts.length} text layers checked`);
  }
  figma.closePlugin(`Done: ${done} refreshed, ${skipped} skipped, ${missing} with missing fonts`);
})();
