#!/usr/bin/env python3
"""
Cuatro variantes de la pantalla de título con hoz y martillo.

    python3 variantes.py salida/
"""
import sys, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

FUENTES = "/mnt/skills/examples/canvas-design/canvas-fonts"
DISPLAY = f"{FUENTES}/BigShoulders-Bold.ttf"
TEXTO   = f"{FUENTES}/InstrumentSans-Bold.ttf"

ROJO  = (200, 16, 46)
NEGRO = (18, 16, 14)
CREMA = (232, 220, 192)
GRIS  = (92, 88, 80)
LAPIZ = (214, 40, 52)

def grano(img, fuerza=6, semilla=3):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    a += np.random.default_rng(semilla).normal(0, fuerza, (img.size[1], img.size[0], 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# ── el emblema ─────────────────────────────────────────────────────────
def hoz(dr, cx, cy, R, color, mango=True):
    """Hoja de hoz de verdad: media luna construida con dos círculos
    desfasados, así el filo nace ancho y termina en punta. Un arco de
    grosor constante no parece una hoz, parece un anillo roto."""
    n = 90
    a0, a1 = math.radians(172), math.radians(-58)
    ox, oy = R*0.26, -R*0.20            # desfase del círculo interior
    Ri = R*0.80
    ext = [(cx + math.cos(a0 + (a1-a0)*i/n)*R,
            cy - math.sin(a0 + (a1-a0)*i/n)*R) for i in range(n+1)]
    interior = []
    for i in range(n+1):
        a = a0 + (a1-a0)*i/n
        interior.append((cx + ox + math.cos(a)*Ri, cy + oy - math.sin(a)*Ri))
    dr.polygon(ext + interior[::-1], fill=color)

    if mango:
        x0, y0 = ext[-1]
        x1, y1 = interior[-1]
        mx, my = (x0+x1)/2, (y0+y1)/2
        g = R*0.115
        dr.polygon([(mx-g*1.25, my-g*0.7), (mx+g*1.25, my-g*0.2),
                    (mx+g*1.05, my+R*0.62), (mx-g*1.45, my+R*0.56)], fill=color)

def martillo(dr, cx, cy, R, color, ang=-38, cabeza_color=None):
    """Mango en diagonal y cabeza arriba a la derecha."""
    cabeza_color = cabeza_color or color
    a = math.radians(ang)
    dx, dy = math.cos(a), math.sin(a)
    g = R*0.115
    x0, y0 = cx - dx*R*0.78, cy - dy*R*0.78
    x1, y1 = cx + dx*R*0.62, cy + dy*R*0.62
    dr.polygon([(x0 - dy*g, y0 + dx*g), (x1 - dy*g, y1 + dx*g),
                (x1 + dy*g, y1 - dx*g), (x0 + dy*g, y0 - dx*g)], fill=color)
    # cabeza
    hg, hl = R*0.24, R*0.46
    px, py = -dy, dx
    cxx, cyy = x1 + dx*hl*0.28, y1 + dy*hl*0.28
    dr.polygon([(cxx - px*hg - dx*hl*0.5, cyy - py*hg - dy*hl*0.5),
                (cxx + px*hg - dx*hl*0.5, cyy + py*hg - dy*hl*0.5),
                (cxx + px*hg + dx*hl*0.5, cyy + py*hg + dy*hl*0.5),
                (cxx - px*hg + dx*hl*0.5, cyy - py*hg + dy*hl*0.5)], fill=cabeza_color)

def lapiz_rojo(dr, cx, cy, R, ang=-38):
    """El martillo, pero es el lápiz con el que Stalin corrige Pravda."""
    a = math.radians(ang)
    dx, dy = math.cos(a), math.sin(a)
    g = R*0.075
    x0, y0 = cx - dx*R*0.82, cy - dy*R*0.82
    x1, y1 = cx + dx*R*0.70, cy + dy*R*0.70
    dr.polygon([(x0 - dy*g, y0 + dx*g), (x1 - dy*g, y1 + dx*g),
                (x1 + dy*g, y1 - dx*g), (x0 + dy*g, y0 - dx*g)], fill=LAPIZ)
    # punta de madera
    dr.polygon([(x1 - dy*g, y1 + dx*g), (x1 + dy*g, y1 - dx*g),
                (x1 + dx*R*0.20, y1 + dy*R*0.20)], fill=(206, 176, 126))
    dr.polygon([(x1 + dx*R*0.13 - dy*g*0.4, y1 + dy*R*0.13 + dx*g*0.4),
                (x1 + dx*R*0.13 + dy*g*0.4, y1 + dy*R*0.13 - dx*g*0.4),
                (x1 + dx*R*0.20, y1 + dy*R*0.20)], fill=(60, 50, 44))

def silueta(dr, cx, base, alto, color):
    r = alto*0.20
    cab = base - alto*0.72
    dr.polygon([(cx-r*3.3, base+r), (cx-r*2.0, cab+r*1.30), (cx-r*0.6, cab+r*0.95),
                (cx+r*1.1, cab+r*1.05), (cx+r*2.4, cab+r*1.55), (cx+r*3.2, base+r)], fill=color)
    dr.ellipse([cx-r*1.5, cab+r*0.75, cx+r*1.7, cab+r*2.1], fill=color)
    dr.ellipse([cx-r*0.88, cab-r*0.92, cx+r*0.98, cab+r*0.98], fill=color)
    dr.polygon([(cx-r*0.80, cab-r*0.18), (cx-r*1.16, cab+r*0.14),
                (cx-r*0.82, cab+r*0.30), (cx-r*0.72, cab+r*0.82)], fill=color)
    dr.chord([cx-r*1.06, cab-r*1.24, cx+r*1.20, cab+r*0.70], 175, 360, fill=color)
    dr.polygon([(cx+r*0.62, cab-r*0.10), (cx+r*1.86, cab+r*0.22),
                (cx+r*1.50, cab+r*1.02), (cx+r*0.58, cab+r*0.74)], fill=color)

# ── tipografía común ───────────────────────────────────────────────────
def titulo(dr, W, H, color_texto=CREMA, subtitulo=True):
    f = ImageFont.truetype(DISPLAY, int(H*0.30))
    caja = dr.textbbox((0,0), "VERUSHKA", font=f)
    tw, th = caja[2]-caja[0], caja[3]-caja[1]
    tx, ty = int(W*0.045), int(H*0.42)
    dr.text((tx+8, ty+8), "VERUSHKA", font=f, fill=(0,0,0), anchor="lt")
    dr.text((tx, ty), "VERUSHKA", font=f, fill=color_texto, anchor="lt")
    dr.rectangle([tx, ty+th+38, tx+tw, ty+th+62], fill=ROJO)
    if subtitulo:
        f2 = ImageFont.truetype(TEXTO, int(H*0.031))
        dr.text((tx+4, ty+th+92), "PETROGRADO · 25 DE OCTUBRE DE 1917",
                font=f2, fill=color_texto, anchor="lt")
        f3 = ImageFont.truetype(TEXTO, int(H*0.024))
        dr.text((tx+4, ty+th+146), "una aventura gráfica", font=f3, fill=(176,168,150), anchor="lt")
    f4 = ImageFont.truetype(TEXTO, int(H*0.021))
    dr.text((tx+4, int(H*0.93)), "TRES DÍAS · TRES ESCENARIOS · CUATRO FINALES",
            font=f4, fill=GRIS, anchor="lt")
    return tx, ty, tw, th

def base_composicion(W, H):
    img = Image.new("RGB", (W, H), CREMA)
    dr = ImageDraw.Draw(img)
    dr.polygon([(0,0), (W,0), (W,H*0.74), (0,H*0.88)], fill=NEGRO)
    return img, dr

# ── A · clásica ────────────────────────────────────────────────────────
def variante_a(W=2048, H=1152):
    img, dr = base_composicion(W, H)
    dr.polygon([(W*0.52,0), (W*1.02,0), (W*1.02,H*0.78), (W*0.30,H*0.80)], fill=ROJO)
    dr.line([(W*0.52,0), (W*0.30,H*0.80)], fill=CREMA, width=9)
    cx, cy, R = int(W*0.745), int(H*0.40), int(H*0.26)
    dr.ellipse([cx-R, cy-R, cx+R, cy+R], fill=NEGRO)
    dr.ellipse([cx-R, cy-R, cx+R, cy+R], outline=CREMA, width=7)
    hoz(dr, cx - R*0.06, cy + R*0.10, R*0.72, CREMA)
    martillo(dr, cx + R*0.04, cy + R*0.04, R*0.86, CREMA)
    titulo(dr, W, H)
    return grano(img)

# ── B · objetos del juego ──────────────────────────────────────────────
def variante_b(W=2048, H=1152):
    img, dr = base_composicion(W, H)
    dr.polygon([(W*0.52,0), (W*1.02,0), (W*1.02,H*0.78), (W*0.30,H*0.80)], fill=ROJO)
    dr.line([(W*0.52,0), (W*0.30,H*0.80)], fill=CREMA, width=9)
    cx, cy, R = int(W*0.745), int(H*0.40), int(H*0.26)
    dr.ellipse([cx-R, cy-R, cx+R, cy+R], fill=NEGRO)
    dr.ellipse([cx-R, cy-R, cx+R, cy+R], outline=CREMA, width=7)
    hoz(dr, cx - R*0.06, cy + R*0.10, R*0.72, CREMA)
    lapiz_rojo(dr, cx + R*0.04, cy + R*0.02, R*0.92)
    titulo(dr, W, H)
    return grano(img)

# ── C · estructural: la cuña roja ES la hoz ────────────────────────────
def variante_c(W=2048, H=1152):
    """La hoz no es un emblema pegado: es la forma del campo rojo.
    Se lee primero como composición y después te das cuenta."""
    img, dr = base_composicion(W, H)
    ccx, ccy, R = W*0.615, H*0.60, H*0.56
    n = 100
    a0, a1 = math.radians(162), math.radians(-62)
    ext = [(ccx + math.cos(a0+(a1-a0)*i/n)*R, ccy - math.sin(a0+(a1-a0)*i/n)*R) for i in range(n+1)]
    ox, oy, Ri = R*0.30, -R*0.20, R*0.72
    inte = [(ccx+ox + math.cos(a0+(a1-a0)*i/n)*Ri, ccy+oy - math.sin(a0+(a1-a0)*i/n)*Ri)
            for i in range(n+1)]
    dr.polygon(ext + inte[::-1], fill=ROJO)
    # mango de la hoz, abajo a la derecha
    x0, y0 = ext[-1]; x1, y1 = inte[-1]
    mx, my = (x0+x1)/2, (y0+y1)/2
    g = R*0.055
    dr.polygon([(mx-g*1.3, my-g*0.8), (mx+g*1.3, my-g*0.2),
                (mx+g*1.0, my+R*0.30), (mx-g*1.6, my+R*0.26)], fill=ROJO)
    # martillo en crema cruzando la hoja
    martillo(dr, int(W*0.655), int(H*0.36), int(H*0.30), CREMA, ang=-40)
    titulo(dr, W, H)
    return grano(img)

# ── D · en negativo, con Verushka encima ───────────────────────────────
def variante_d(W=2048, H=1152):
    img, dr = base_composicion(W, H)
    dr.polygon([(W*0.46,0), (W*1.02,0), (W*1.02,H*0.80), (W*0.26,H*0.82)], fill=ROJO)
    cx, cy, R = int(W*0.745), int(H*0.36), int(H*0.28)
    # emblema calado en negro sobre el campo rojo
    hoz(dr, cx - R*0.10, cy + R*0.06, R*0.86, NEGRO)
    martillo(dr, cx + R*0.02, cy, R*1.00, NEGRO)
    # Verushka chica, de pie sobre el emblema, en crema
    silueta(dr, int(W*0.745), int(H*0.72), int(H*0.30), CREMA)
    dr.line([(W*0.46,0), (W*0.26,H*0.82)], fill=CREMA, width=9)
    titulo(dr, W, H)
    return grano(img)

def main():
    salida = Path(sys.argv[1] if len(sys.argv)>1 else "variantes")
    salida.mkdir(parents=True, exist_ok=True)
    for nombre, fn in [("a_clasica", variante_a), ("b_objetos", variante_b),
                       ("c_estructural", variante_c), ("d_negativo", variante_d)]:
        fn().save(salida / f"titulo_{nombre}.png")
        print(f"✓ titulo_{nombre}.png")

if __name__ == "__main__":
    main()
