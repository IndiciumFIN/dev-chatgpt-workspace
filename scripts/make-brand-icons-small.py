#!/usr/bin/env python3
"""
Gera a variante PEQUENA do ícone, otimizada para 16 e 32 px.

A arte 3D original não sobrevive a 16 px: três objetos com detalhe fino, mais um
brilho radial que come pixels e derruba o contraste. Não é problema de nitidez —
é problema de composição.

O que muda nesta variante, e por quê:

  1. CORTE MAIS FECHADO. O brilho radial vira um anel fino na borda, que é
     exatamente onde o olho não lê nada a 16 px. Cortei o núcleo.
  2. OCUPAÇÃO MAIOR. O ícone preenche ~92% do quadro em vez de ~86%. A 16 px,
     cada pixel gasto em margem é um pixel que não distingue estetoscópio de
     calculadora.
  3. FUNDO CHAPADO. O gradiente vira Navy #1A3E74 (o token canônico congelado).
     Em tamanho grande o gradiente era bonito; em 16 px ele vira ruído que
     compete com a forma. O earlier problema de "halo escuro dentro do quadro"
     vinha do flood-fill deixar a vinheta; aqui o fundo é pintada de uma vez e
     a vinheta é removida junto.

Nada aqui redesenha a marca. É a MESMA arte, com tratamento de tamanho.

   python3 scripts/make-brand-icons-small.py "<png de origem>"
"""
from PIL import Image, ImageEnhance, ImageDraw
import os, sys

SRC = sys.argv[1]
OUT = "audit-evidence/brand"
NAVY = (0x1A, 0x3E, 0x74)
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
w, h = im.size
px = im.load()

# --- núcleo: pixels claramente claros (a arte 3D tem brilho alto) ------------
xs, ys = [], []
for y in range(0, h, 2):
    for x in range(0, w, 2):
        if sum(px[x, y]) > 360:
            xs.append(x); ys.append(y)
nbox = (min(xs), min(ys), max(xs), max(ys))

# padding pequeno: o anel de brilho quase some
side_core = max(nbox[2] - nbox[0], nbox[3] - nbox[1])
pad = int(side_core * 0.03)
box = (max(0, nbox[0] - pad), max(0, nbox[1] - pad),
       min(w, nbox[2] + pad), min(h, nbox[3] + pad))
core = im.crop(box)

# a vinheta escurece as bordas do recorte; cortamos mais para ela nao entrar
core = core.crop((int(core.width * 0.06), int(core.height * 0.06),
                  int(core.width * 0.94), int(core.height * 0.94)))

# --- preenche o quadro, com leve realce de contraste ------------------------
FILL = 0.92
def compose(size):
    inner = int(size * FILL)
    bg = Image.new("RGB", (size, size), NAVY)
    c = core.resize((inner, inner), Image.LANCZOS)
    c = ImageEnhance.Contrast(c).enhance(1.18)
    c = ImageEnhance.Color(c).enhance(1.25)
    # cantos arredondados mínimos: em 16 px o arredondamento some, e o navegador
    # recorta a aba sozinho.
    bg.paste(c, ((size - inner) // 2, (size - inner) // 2))
    return bg

for name, size in [("favicon-16x16", 16), ("favicon-32x32", 32),
                   ("favicon-48x48", 48), ("apple-touch-icon", 180),
                   ("android-chrome-192x192", 192), ("android-chrome-512x512", 512),
                   ("mstile-150x150", 150)]:
    compose(size).save(f"public/{name}.png", optimize=True)

ico = compose(48)
ico.save("public/favicon.ico", sizes=[(16, 16), (32, 32), (48, 48)])

print(f"  gravado em public/ ({NAVY} de fundo, {int(FILL*100)}% de ocupacao)")
for f in sorted(os.listdir("public")):
    if any(k in f for k in ("favicon", "apple-touch", "android-chrome", "mstile")):
        print(f"    {f:34} {os.path.getsize('public/'+f):>7} bytes")