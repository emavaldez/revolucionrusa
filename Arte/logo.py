#!/usr/bin/env python3
"""
Logo y pantalla de título de VERUSHKA.

Composición constructivista: una diagonal que manda, un círculo que ancla,
tipografía condensada muy grande y tres colores. La silueta de Verushka
recortada en negro sobre el rojo — fotomontaje sin foto.

    python3 logo.py salida/
"""
import sys, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import numpy as np

FUENTES = "/mnt/skills/examples/canvas-design/canvas-fonts"
DISPLAY = f"{FUENTES}/BigShoulders-Bold.ttf"
TEXTO   = f"{FUENTES}/InstrumentSans-Bold.ttf"

ROJO  = (200, 16, 46)
NEGRO = (18, 16, 14)
CREMA = (232, 220, 192)
GRIS  = (92, 88, 80)

def grano(img, fuerza=7, semilla=3):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    rng = np.random.default_rng(semilla)
    a += rng.normal(0, fuerza, (img.size[1], img.size[0], 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def silueta_verushka(dr, cx, base, alto, color):
    """Busto de perfil mirando a la izquierda, cortado por el círculo.
    Lo único que tiene que leerse a este tamaño: el pañuelo, la nariz y
    unos hombros anchos de alguien que trabaja."""
    r = alto * 0.20                       # cabeza grande: es un busto, no un cuerpo
    cab = base - alto*0.72

    # hombros y pecho, bien anchos
    dr.polygon([(cx - r*3.3, base + r), (cx - r*2.0, cab + r*1.30),
                (cx - r*0.6, cab + r*0.95), (cx + r*1.1, cab + r*1.05),
                (cx + r*2.4, cab + r*1.55), (cx + r*3.2, base + r)], fill=color)
    dr.ellipse([cx - r*1.5, cab + r*0.75, cx + r*1.7, cab + r*2.1], fill=color)

    # cabeza de perfil
    dr.ellipse([cx - r*0.88, cab - r*0.92, cx + r*0.98, cab + r*0.98], fill=color)
    # nariz y mentón hacia la izquierda
    dr.polygon([(cx - r*0.80, cab - r*0.18), (cx - r*1.16, cab + r*0.14),
                (cx - r*0.82, cab + r*0.30), (cx - r*0.72, cab + r*0.82)], fill=color)
    # pañuelo: casquete + nudo atrás. Es la firma de la silueta.
    dr.chord([cx - r*1.06, cab - r*1.24, cx + r*1.20, cab + r*0.70], 175, 360, fill=color)
    dr.polygon([(cx + r*0.62, cab - r*0.10), (cx + r*1.86, cab + r*0.22),
                (cx + r*1.50, cab + r*1.02), (cx + r*0.58, cab + r*0.74)], fill=color)
    dr.polygon([(cx + r*1.50, cab + r*0.62), (cx + r*2.10, cab + r*1.20),
                (cx + r*1.32, cab + r*1.08)], fill=color)

def pantalla_titulo(W=2048, H=1152):
    img = Image.new("RGB", (W, H), CREMA)
    dr = ImageDraw.Draw(img)

    # bloque negro en diagonal: la estructura de la composición
    dr.polygon([(0, 0), (W, 0), (W, H*0.74), (0, H*0.88)], fill=NEGRO)
    # cuña roja
    dr.polygon([(W*0.52, 0), (W*1.02, 0), (W*1.02, H*0.78), (W*0.30, H*0.80)], fill=ROJO)
    # filo crema que separa rojo de negro
    dr.line([(W*0.52, 0), (W*0.30, H*0.80)], fill=CREMA, width=9)

    # círculo: el ancla clásica del cartel constructivista
    cxc, cyc, rc = int(W*0.735), int(H*0.40), int(H*0.255)
    dr.ellipse([cxc-rc, cyc-rc, cxc+rc, cyc+rc], fill=NEGRO)
    dr.ellipse([cxc-rc, cyc-rc, cxc+rc, cyc+rc], outline=CREMA, width=7)
    silueta_verushka(dr, cxc, cyc + int(rc*0.96), int(rc*1.72), CREMA)
    # recorta la silueta al círculo
    mascara = Image.new("L", (W, H), 255)
    md = ImageDraw.Draw(mascara)
    md.rectangle([cxc-rc-260, cyc+rc, cxc+rc+260, H], fill=0)
    base = Image.new("RGB", (W, H), NEGRO)
    img = Image.composite(img, Image.composite(img, base, mascara), mascara)
    dr = ImageDraw.Draw(img)


    # rayos desde el círculo
    for i in range(22):
        a = math.radians(-16 + i*1.9)
        dr.line([(cxc, cyc), (cxc + math.cos(a)*W, cyc + math.sin(a)*W)],
                fill=(214, 34, 60), width=3)
    dr.ellipse([cxc-rc, cyc-rc, cxc+rc, cyc+rc], fill=NEGRO)
    dr.ellipse([cxc-rc, cyc-rc, cxc+rc, cyc+rc], outline=CREMA, width=7)
    silueta_verushka(dr, cxc, cyc + int(rc*0.90), int(rc*1.66), CREMA)

    # título
    f = ImageFont.truetype(DISPLAY, int(H*0.30))
    palabra = "VERUSHKA"
    caja = dr.textbbox((0, 0), palabra, font=f)
    tw, th = caja[2]-caja[0], caja[3]-caja[1]
    tx, ty = int(W*0.045), int(H*0.42)
    dr.text((tx+8, ty+8), palabra, font=f, fill=(0, 0, 0), anchor="lt")
    dr.text((tx, ty), palabra, font=f, fill=CREMA, anchor="lt")

    # barra roja bajo el título
    dr.rectangle([tx, ty+th+38, tx+tw, ty+th+62], fill=ROJO)

    # subtítulo
    f2 = ImageFont.truetype(TEXTO, int(H*0.031))
    dr.text((tx+4, ty+th+92), "PETROGRADO · 25 DE OCTUBRE DE 1917", font=f2, fill=CREMA, anchor="lt")
    f3 = ImageFont.truetype(TEXTO, int(H*0.024))
    dr.text((tx+4, ty+th+146), "una aventura gráfica", font=f3, fill=(176, 168, 150), anchor="lt")

    # pie sobre el crema
    f4 = ImageFont.truetype(TEXTO, int(H*0.021))
    dr.text((tx+4, int(H*0.93)), "TRES DÍAS · TRES ESCENARIOS · CUATRO FINALES",
            font=f4, fill=GRIS, anchor="lt")

    return grano(img, 6)

def wordmark(W=1600, H=440):
    """Sólo la palabra, con fondo transparente, para usar dentro del juego."""
    img = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    dr = ImageDraw.Draw(img)
    f = ImageFont.truetype(DISPLAY, int(H*0.80))
    caja = dr.textbbox((0, 0), "VERUSHKA", font=f)
    tw, th = caja[2]-caja[0], caja[3]-caja[1]
    x, y = (W-tw)//2, int(H*0.06)
    dr.text((x, y), "VERUSHKA", font=f, fill=CREMA+(255,), anchor="lt")
    dr.rectangle([x, y+th+18, x+tw, y+th+34], fill=ROJO+(255,))
    # diagonal roja cruzando la K, marca de la casa
    capa = Image.new("RGBA", (W, H), (0,0,0,0))
    ImageDraw.Draw(capa).line([(x+tw*0.80, y-30), (x+tw*1.02, y+th+60)],
                              fill=ROJO+(230,), width=16)
    return Image.alpha_composite(img, capa)

def main():
    salida = Path(sys.argv[1] if len(sys.argv) > 1 else "logo")
    salida.mkdir(parents=True, exist_ok=True)
    pantalla_titulo().save(salida / "titulo.png")
    wordmark().save(salida / "logo_verushka.png")
    print(f"✓ {salida}/titulo.png  2048×1152")
    print(f"✓ {salida}/logo_verushka.png  1600×440 (transparente)")

if __name__ == "__main__":
    main()
