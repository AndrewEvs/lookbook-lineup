#!/usr/bin/env python3
"""Normalise full-body model cut-outs for the lookbook lineup.

  python3 process_models.py IN_DIR OUT_DIR

Each transparent PNG is trimmed to the person, scaled so head-to-shoe height is the same
for everyone, and centred on a 2:5 canvas with the shoes on the bottom edge. Output is
800x2000 WebP with alpha, the size the section expects (Figure width 40%).
"""
import sys, pathlib
from PIL import Image

W, H, TOP = 800, 2000, 40          # canvas and headroom in px
src, out = map(pathlib.Path, sys.argv[1:3])
out.mkdir(parents=True, exist_ok=True)
for f in sorted(src.glob('*.png')):
    im = Image.open(f).convert('RGBA')
    box = im.getchannel('A').point(lambda v: 255 if v > 40 else 0).getbbox()
    person = im.crop(box)
    scale = (H - TOP) / person.height
    pw = round(person.width * scale)
    if pw > W:                         # very wide pose: fit width instead
        scale = W / person.width
        pw = W
    person = person.resize((pw, round(person.height * scale)), Image.LANCZOS)
    canvas = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    canvas.alpha_composite(person, ((W - pw) // 2, H - person.height))
    canvas.save(out / (f.stem + '.webp'), 'WEBP', quality=84, method=6)
    print(f.name, '->', f.stem + '.webp', f'{pw}x{person.height}')
