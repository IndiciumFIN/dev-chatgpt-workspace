#!/usr/bin/env python3
"""
Gera o conjunto de ícones a partir da arte enviada pelo dono.

Duas leituras, porque a escolha é do dono e não minha:
  fiel — a arte como veio, recortada no conteúdo
  ds   — o ícone sobre Navy #1A3E74, o token canônico congelado

O flood-fill parte dos cantos e só remove o fundo CONECTADO. Um limiar de
brilho apagaria junto o estetoscópio, que é navy escuro — e apagar parte da
marca é exatamente o erro que veio antes.
"""
from PIL import Image, ImageDraw, ImageFilter
import os, sys

SRC = sys.argv[1]
OUT = "audit-evidence/brand-inbox/icons"
NAVY = (0x1A, 0x3E, 0x74)
os.makedirs(OUT, exist_ok=True)

im = Image.open(SRC).convert("RGB")
w, h = im.size

# ---------------------------------------------------- extrair o fundo conectado
small = im.resize((256, 256), Image.LANCZOS)
sp = small.load()
bg = bytearray(256 * 256)
stack = [(0, 0), (255, 0), (0, 255), (255, 255), (128, 0), (0, 128), (255, 128), (128, 255)]
for x, y in stack:
    if not bg[y * 256 + x]:
        bg[y * 256 + x] = 1
        stack.append((x, y))
while stack:
    x, y = stack.pop()
    for dx, dy in ((1,0),(-1,0),(0,1),(0,-1)):
        nx, ny = x+dx, y+dy
        if 0 <= nx < 256 and 0 <= ny < 256 and not bg[ny*256+nx]:
            r, g, b = sp[nx, ny]
            # fundo = escuro. o ícone é bem mais claro que isto.
            if (r+g+b) < 150:
                bg[ny*256+nx] = 1
                stack.append((nx, ny))

mask_small = Image.frombytes("L", (256, 256), bytes(0 if b else 255 for b in bg))
mask_small = mask_small.resize((w, h), Image.LANCZOS).filter(ImageFilter.GaussianBlur(1.2))
alpha = mask_small

# ------------------------------------------------------- bbox do ícone
bbox = alpha.getbbox()
if not bbox:
    sys.exit("flood-fill removeu tudo — a arte nao serve como ícone")
print(f"fundo conectado: {(sum(bg)/len(bg))*100:.1f}%   bbox do ícone: {bbox}")

# A arte JÁ é um ícone de app quadrado, com fundo e brilho próprios. Impor uma
# moldura navy em cima disso produzia um halo escuro dentro do quadrado — pior que
# não fazer nada. Então: sem moldura. Duas saídas, recorte generoso e recorte
# fechado no nucleo, para o favicon pequeno ganhar contraste.
def square(im2, box2):
    c = im2.crop(box2)
    side = max(c.size)
    out = Image.new("RGB", (side, side))
    out.paste(c, ((side-c.width)//2, (side-c.height)//2))
    return out

box_largo = (max(0,bbox[0]-int((bbox[3]-bbox[1])*0.10)), max(0,bbox[1]-int((bbox[3]-bbox[1])*0.10)),
             min(w,bbox[2]+int((bbox[3]-bbox[1])*0.10)), min(h,bbox[3]+int((bbox[3]-bbox[1])*0.10)))

# nucleo = pixels claramente claros (a arte 3D), para cortar o halo
px = im.load()
xs, ys = [], []
for y in range(0, h, 3):
    for x in range(0, w, 3):
        if sum(px[x, y]) > 330:
            xs.append(x); ys.append(y)
nbox = (max(0,min(xs)), max(0,min(ys)), min(w,max(xs)), min(h,max(ys)))
print("bbox nucleo:", nbox)
pad_n = int((nbox[3]-nbox[1]) * 0.10)
nbox = (max(0,nbox[0]-pad_n), max(0,nbox[1]-pad_n), min(w,nbox[2]+pad_n), min(h,nbox[3]+pad_n))

icon_sq   = square(im, box_largo)   # fiel: fundo e brilho da propria arte
icon_cut  = square(im, nbox)        # focado: nucleo, halo cortado
fiel = Image.new("RGBA", icon_sq.size, (0,0,0,255))
fiel.putalpha(255)

# ---------------------------------------------------------------- variantes
def rounded(color, size, radius_ratio=0.0):
    s = size * 4
    im2 = Image.new("RGBA", (s, s), (0, 0, 0, 0))
    d = ImageDraw.Draw(im2)
    d.rounded_rectangle([0, 0, s-1, s-1], radius=int(s*radius_ratio), fill=color + (255,))
    return im2.resize((size, size), Image.LANCZOS)

def fit(inner, size):
    """Sem moldura, sem arredondamento de nossa parte: o formato do icone e
    do navegador/sistema. So redimensiona."""
    return inner.convert("RGBA").resize((size, size), Image.LANCZOS)

def save(img, name, size):
    img.convert("RGBA").resize((size, size), Image.LANCZOS).save(f"{OUT}/{name}")

for name, size in [("favicon-16x16",16),("favicon-32x32",32),("favicon-48x48",48),
                   ("apple-touch-icon",180),("apple-touch-icon-152x152",152),
                   ("android-chrome-192x192",192),("android-chrome-512x512",512),
                   ("mstile-150x150",150)]:
    save(fit(icon_cut, size), f"{name}.png", size)

save(icon_sq, "favicon-fiel-512.png", 512)
save(icon_cut, "favicon-nucleo-512.png", 512)

# favicon.ico multi-resolução
ico_sizes = [(16,16),(32,32),(48,48)]
ico = fit(icon_cut, 48)
ico.save(f"{OUT}/favicon.ico", sizes=ico_sizes, append_images=[])

print(f"\ngerado em {OUT}/")
for f in sorted(os.listdir(OUT)):
    print("  ", f, os.path.getsize(f"{OUT}/{f}"), "bytes")