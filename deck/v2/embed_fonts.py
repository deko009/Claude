"""Embed TrueType fonts into a PPTX (ppt/fonts/*.fntdata, EOT-wrapped) so PowerPoint
renders them on machines without the fonts installed.
usage: python3 embed_fonts.py deck.pptx used_chars.json FONT_ROOT"""
import io, json, re, struct, sys, zipfile, shutil
from fontTools.ttLib import TTFont
from fontTools import subset

pptx, used_path, root = sys.argv[1:4]
used = json.load(open(used_path))

FONTS = {
    'Michroma': 'michroma/400Regular/Michroma_400Regular.ttf',
    'Geist ExtraLight': 'geist/200ExtraLight/Geist_200ExtraLight.ttf',
    'Geist Light': 'geist/300Light/Geist_300Light.ttf',
    'Geist': 'geist/400Regular/Geist_400Regular.ttf',
    'Geist Medium': 'geist/500Medium/Geist_500Medium.ttf',
    'Geist Mono': 'geist-mono/400Regular/GeistMono_400Regular.ttf',
    'Noto Sans SC Light': 'noto-sans-sc/300Light/NotoSansSC_300Light.ttf',
    'Noto Sans SC': 'noto-sans-sc/400Regular/NotoSansSC_400Regular.ttf',
    'Noto Sans SC Medium': 'noto-sans-sc/500Medium/NotoSansSC_500Medium.ttf',
}
# GB2312 level-1 (3755 most common hanzi) + CJK punctuation, so edits keep working
common = []
for hi in range(0xB0, 0xD8):
    for lo in range(0xA1, 0xFF):
        try: common.append(bytes([hi, lo]).decode('gb2312'))
        except Exception: pass
common = ''.join(common) + '，。、；：？！“”‘’（）《》【】—…·「」'
all_text = ''.join(used.values())

def u16(s): return s.encode('utf-16-le')

def eot(ttf_bytes, font):
    os2, head, name = font['OS/2'], font['head'], font['name']
    fam = name.getDebugName(1) or ''
    sty = name.getDebugName(2) or 'Regular'
    ver = name.getDebugName(5) or 'Version 1.0'
    full = name.getDebugName(4) or fam
    def field(s):
        b = u16(s); return struct.pack('<H', len(b)) + b
    panose = os2.panose
    pan = bytes([panose.bFamilyType, panose.bSerifStyle, panose.bWeight, panose.bProportion, panose.bContrast,
                 panose.bStrokeVariation, panose.bArmStyle, panose.bLetterForm, panose.bMidline, panose.bXHeight])
    body = b''
    body += pan + struct.pack('<B', 1) + struct.pack('<B', 1 if os2.fsSelection & 1 else 0)
    body += struct.pack('<I', os2.usWeightClass) + struct.pack('<H', 0) + struct.pack('<H', 0x504C)
    body += struct.pack('<IIII', os2.ulUnicodeRange1, os2.ulUnicodeRange2, os2.ulUnicodeRange3, os2.ulUnicodeRange4)
    body += struct.pack('<II', getattr(os2, 'ulCodePageRange1', 0), getattr(os2, 'ulCodePageRange2', 0))
    body += struct.pack('<I', head.checkSumAdjustment) + struct.pack('<IIII', 0, 0, 0, 0)
    body += struct.pack('<H', 0) + field(fam) + struct.pack('<H', 0) + field(sty)
    body += struct.pack('<H', 0) + field(ver) + struct.pack('<H', 0) + field(full)
    body += struct.pack('<H', 0) + struct.pack('<H', 0)  # Padding5 + RootStringSize=0 (same layout as fontello/ttf2eot)
    hdr_len = 16 + len(body)
    total = hdr_len + len(ttf_bytes)
    return struct.pack('<IIII', total, len(ttf_bytes), 0x00020001, 0) + body + ttf_bytes

def build(face):
    f = TTFont(f'{root}/{FONTS[face]}')
    if face.startswith('Noto'):
        opts = subset.Options(); opts.name_IDs = ['*']; opts.name_languages = ['*']; opts.notdef_outline = True
        opts.layout_features = ['*']; opts.hinting = False
        sub = subset.Subsetter(opts)
        sub.populate(text=all_text + common + ''.join(chr(c) for c in range(0x20, 0x7F)))
        sub.subset(f)
    f['OS/2'].fsType = 0
    buf = io.BytesIO(); f.save(buf)
    return eot(buf.getvalue(), f), f

faces = [f for f in FONTS if f in used]
tmp = pptx + '.tmp'
zin = zipfile.ZipFile(pptx)
names = zin.namelist()
rels = zin.read('ppt/_rels/presentation.xml.rels').decode()
pres = zin.read('ppt/presentation.xml').decode()
ct = zin.read('[Content_Types].xml').decode()
ids = [int(x) for x in re.findall(r'Id="rId(\d+)"', rels)]
nxt = max(ids) + 1
blobs, entries = {}, []
for k, face in enumerate(faces, 1):
    data, f = build(face)
    part = f'ppt/fonts/font{k}.fntdata'
    blobs[part] = data
    rid = f'rId{nxt}'; nxt += 1
    rels = rels.replace('</Relationships>', f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/font" Target="fonts/font{k}.fntdata"/></Relationships>')
    pitch = '49' if 'Mono' in face else '2'
    charset = '-122' if face.startswith('Noto') else '0'
    entries.append(f'<p:embeddedFont><p:font typeface="{face}" pitchFamily="{pitch}" charset="{charset}"/><p:regular r:id="{rid}"/></p:embeddedFont>')
    print(f'{face:22s} {len(data)/1024:8.0f} KB')
lst = '<p:embeddedFontLst>' + ''.join(entries) + '</p:embeddedFontLst>'
pres = re.sub(r'(<p:notesSz[^>]*/>)', r'\1' + lst, pres, count=1)
pres = re.sub(r'\s(embedTrueTypeFonts|saveSubsetFonts)="[^"]*"', '', pres); pres = pres.replace('<p:presentation ', '<p:presentation embedTrueTypeFonts="1" saveSubsetFonts="1" ', 1)
if 'Extension="fntdata"' not in ct:
    ct = ct.replace('<Default Extension="xml"', '<Default Extension="fntdata" ContentType="application/x-fontdata"/><Default Extension="xml"', 1)
zout = zipfile.ZipFile(tmp, 'w', zipfile.ZIP_DEFLATED)
for i in zin.infolist():
    d = zin.read(i.filename)
    if i.filename == 'ppt/_rels/presentation.xml.rels': d = rels.encode()
    elif i.filename == 'ppt/presentation.xml': d = pres.encode()
    elif i.filename == '[Content_Types].xml': d = ct.encode()
    zout.writestr(i, d)
for p, d in blobs.items(): zout.writestr(p, d)
zout.close(); zin.close(); shutil.move(tmp, pptx)
print('embedded', len(faces), 'fonts')
