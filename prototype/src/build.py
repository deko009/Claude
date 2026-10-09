"""Inline fonts, images and globe dots into prototype/maxus-global-local.html.
usage: python3 build.py FONTSOURCE_DIR DOTS_JSON HERO VEHICLES LONDON MANCHESTER EDINBURGH BIRMINGHAM"""
import base64, io, sys, os
from PIL import Image

fs_dir, dots, hero, veh, lon, man, edi, bir = sys.argv[1:9]
here = os.path.dirname(os.path.abspath(__file__))
html = open(os.path.join(here, 'global-local.template.html'), encoding='utf-8').read()

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

def img(path, width=None, q=84):
    im = Image.open(path).convert('RGB')
    if width and im.width > width: im = im.resize((width, round(im.height * width / im.width)), Image.LANCZOS)
    buf = io.BytesIO(); im.save(buf, 'JPEG', quality=q, optimize=True, progressive=True)
    return 'data:image/jpeg;base64,' + base64.b64encode(buf.getvalue()).decode()

html = html.replace('/*FONTS*/', fonts)
for key, path, w in [('IMG_HERO', hero, 1920), ('IMG_VEHICLES', veh, 1920), ('IMG_LONDON', lon, None),
                     ('IMG_MANCHESTER', man, None), ('IMG_EDINBURGH', edi, None), ('IMG_BIRMINGHAM', bir, None)]:
    html = html.replace(f'"{key}"', f'"{img(path, w)}"')
html = html.replace('DOTS_JSON', open(dots).read())
out = os.path.join(here, '..', 'maxus-global-local.html')
open(out, 'w', encoding='utf-8').write(html)
print('wrote', os.path.normpath(out), f'{len(html)/1024:.0f} KB')
