"""Inline fonts, logo and images into prototype/maxus-edeliver9-pdp.html.
usage: python3 build_pdp.py FONTSOURCE_DIR IMG_DIR
Images are referenced in the template as url(IMG_<id>) / 'IMG_<id>' and stored once as CSS variables."""
import base64, io, os, re, sys
from PIL import Image

fs_dir, img_dir = sys.argv[1:3]
here = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(here, 'pdp-edeliver9.template.html'), encoding='utf-8').read()

def font(family, path, weight):
    b = base64.b64encode(open(os.path.join(fs_dir, path), 'rb').read()).decode()
    return f"@font-face{{font-family:'{family}';font-weight:{weight};font-display:block;src:url(data:font/woff2;base64,{b}) format('woff2')}}"
fonts = '\n'.join([
    font('Michroma', 'michroma/files/michroma-latin-400-normal.woff2', 400),
    font('Geist', 'geist-sans/files/geist-sans-latin-300-normal.woff2', 300),
    font('Geist', 'geist-sans/files/geist-sans-latin-400-normal.woff2', 400),
    font('Geist', 'geist-sans/files/geist-sans-latin-500-normal.woff2', 500),
    font('Geist Mono', 'geist-mono/files/geist-mono-latin-400-normal.woff2', 400),
])

ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8h11M9 3.5 13.5 8 9 12.5"/></svg>'
logo = open(os.path.join(here, 'logo.svg'), encoding='utf-8').read().strip()

ids = sorted(set(re.findall(r'IMG_(\d+)', html)))
def img(i):
    im = Image.open(os.path.join(img_dir, f'{i}.jpg')).convert('RGB')
    mx = 2400 if im.width >= 2400 else 1600
    if max(im.size) > mx: im.thumbnail((mx, mx), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=82, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()
vars_css = ':root{' + ';'.join(f'--i-{i}:url({img(i)})' for i in ids) + '}'

html = html.replace('/*FONTS*/', fonts + '\n' + vars_css)
html = re.sub(r'url\(IMG_(\d+)\)', r'var(--i-\1)', html)
html = re.sub(r"'IMG_(\d+)'", r"'var(--i-\1)'", html)
html = html.replace('ARROW', ARROW).replace('LOGO_SVG', logo)
assert 'IMG_' not in html, 'unreplaced image token'
out = os.path.join(here, '..', 'maxus-edeliver9-pdp.html')
open(out, 'w', encoding='utf-8').write(html)
print('wrote', os.path.normpath(out), f'{len(html)/1024/1024:.1f} MB,', len(ids), 'images')
