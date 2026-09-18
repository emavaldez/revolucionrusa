#!/usr/bin/env python3
"""
VERUSHKA: la A es una hoz y el brazo de la K es el lápiz rojo.

Las dos letras se dibujan en su propia capa, se les hace la cirugía, y
recién después se rotan y se pegan fuera de línea. Sacarlas del renglón
no es un capricho: una herramienta alineada con el texto se lee como
tipografía rara; ladeada se lee como herramienta.

    python3 letras2.py salida/
"""
import sys, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

FUENTES = "/mnt/skills/examples/canvas-design/canvas-fonts"
DISPLAY = f"{FUENTES}/BigShoulders-Bold.ttf"
TEXTO   = f"{FUENTES}/InstrumentSans-Bold.ttf"

ROJO    = (200, 16, 46)
ROJO_CL = (226, 52, 74)
NEGRO   = (18, 16, 14)
CREMA   = (232, 220, 192)
GRIS    = (92, 88, 80)
MADERA  = (198, 158, 104)
GRAFITO = (56, 50, 46)
ACERO   = (206, 202, 192)

def grano(img, fuerza=6, semilla=5):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    a += np.random.default_rng(semilla).normal(0, fuerza, (img.size[1], img.size[0], 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def tramos(mask, y, umbral=128):
    fila = np.asarray(mask)[y] > umbral
    out, ini = [], None
    for x, v in enumerate(fila):
        if v and ini is None: ini = x
        elif not v and ini is not None:
            out.append((ini, x-1)); ini = None
    if ini is not None: out.append((ini, len(fila)-1))
    return out

# ── la A que es una hoz ────────────────────────────────────────────────
def tile_a_hoz(size, color_letra, color_hoja, color_mango):
    """Borrarle la diagonal a la A la vuelve ilegible. La dejo entera y le
    agrego el filo por fuera: un arco que nace en el pie izquierdo, se abre
    hacia afuera y termina en punta por encima del vértice. La A sigue
    siendo una A y la curva la convierte en hoja."""
    L = int(size*2.8)
    capa = Image.new("RGBA", (L, L), (0,0,0,0))
    f = ImageFont.truetype(DISPLAY, size)
    dr = ImageDraw.Draw(capa)
    ox, oy = size*0.70, size*0.55
    dr.text((ox, oy), "A", font=f, fill=color_letra + (255,))

    m = capa.split()[3]
    x0, y0, x1, y1 = m.getbbox()
    alto, ancho = y1-y0, x1-x0
    t = tramos(m, y1-max(2, int(alto*0.04)))
    g = ((t[0][1]-t[0][0])+1) if t else ancho*0.22

    # filo: arco por fuera de la diagonal izquierda
    pie   = (x0 + g*0.10, y1)
    cxr   = x1 + ancho*0.10
    cyr   = y1 - alto*0.04
    R     = math.hypot(pie[0]-cxr, pie[1]-cyr)
    a_ini = math.atan2(cyr-pie[1], pie[0]-cxr)
    if a_ini < 0: a_ini += 2*math.pi        # sin esto el arco da la vuelta entera
    a_fin = math.radians(103)
    n, ext, inte = 48, [], []
    for i in range(n+1):
        a = a_ini + (a_fin-a_ini)*i/n
        ext.append((cxr + math.cos(a)*(R+g*0.92), cyr - math.sin(a)*(R+g*0.92)))
        inte.append((cxr + math.cos(a)*R,         cyr - math.sin(a)*R))
    dr.polygon(ext + inte[::-1], fill=color_hoja + (255,))
    # punta
    dr.polygon([ext[-1], inte[-1],
                (ext[-1][0] + g*0.35, ext[-1][1] - g*1.9)], fill=color_hoja + (255,))

    # empuñadura de madera bajo la pata derecha
    hx = x1 - g*0.55
    dr.polygon([(hx-g*0.74, y1-alto*0.03), (hx+g*0.74, y1-alto*0.03),
                (hx+g*0.88, y1+alto*0.24), (hx-g*0.88, y1+alto*0.24)],
               fill=color_mango + (255,))
    dr.rectangle([hx-g*1.02, y1+alto*0.22, hx+g*1.02, y1+alto*0.31],
                 fill=color_mango + (255,))
    return capa, (ox, oy)

# ── la K cuyo brazo es el lápiz rojo ───────────────────────────────────
def tile_k_lapiz(size, color_letra):
    """Le saco el brazo superior a la K y en su lugar pongo el lápiz con
    el que Stalin corrige Pravda — el mismo con el que Verushka falsifica
    la orden del Aurora."""
    L = int(size*2.8)
    capa = Image.new("RGBA", (L, L), (0,0,0,0))
    f = ImageFont.truetype(DISPLAY, size)
    ox, oy = size*0.70, size*0.55
    ImageDraw.Draw(capa).text((ox, oy), "K", font=f, fill=color_letra + (255,))

    m = capa.split()[3]
    x0, y0, x1, y1 = m.getbbox()
    alto, ancho = y1-y0, x1-x0
    t = tramos(m, y0 + int(alto*0.5))
    g = ((t[0][1]-t[0][0])+1) if t else ancho*0.26
    tronco_der = x0 + g
    juntura_y  = y0 + alto*0.52

    # borro todo lo que está a la derecha del tronco y arriba de la juntura
    borrar = Image.new("L", (L, L), 0)
    ImageDraw.Draw(borrar).rectangle([tronco_der, y0-g, x1+g, juntura_y], fill=255)
    capa.putalpha(Image.composite(Image.new("L",(L,L),0), m, borrar))
    dr = ImageDraw.Draw(capa)

    # el lápiz, en la diagonal que dejó libre el brazo
    p0 = (tronco_der - g*0.25, juntura_y + g*0.35)
    p1 = (x1 + ancho*0.30, y0 - alto*0.16)
    dx, dy = p1[0]-p0[0], p1[1]-p0[1]
    Ln = math.hypot(dx, dy); dx, dy = dx/Ln, dy/Ln
    px, py = -dy, dx
    w = g*0.46

    corte = (p1[0]-dx*alto*0.30, p1[1]-dy*alto*0.30)     # donde empieza la madera
    dr.polygon([(p0[0]+px*w, p0[1]+py*w), (corte[0]+px*w, corte[1]+py*w),
                (corte[0]-px*w, corte[1]-py*w), (p0[0]-px*w, p0[1]-py*w)],
               fill=ROJO + (255,))
    # facetas del hexágono
    dr.polygon([(p0[0]+px*w*0.30, p0[1]+py*w*0.30), (corte[0]+px*w*0.30, corte[1]+py*w*0.30),
                (corte[0]+px*w, corte[1]+py*w), (p0[0]+px*w, p0[1]+py*w)],
               fill=ROJO_CL + (255,))
    # virola
    v = (corte[0]-dx*g*0.30, corte[1]-dy*g*0.30)
    dr.polygon([(v[0]+px*w*1.05, v[1]+py*w*1.05), (corte[0]+px*w*1.05, corte[1]+py*w*1.05),
                (corte[0]-px*w*1.05, corte[1]-py*w*1.05), (v[0]-px*w*1.05, v[1]-py*w*1.05)],
               fill=ACERO + (255,))
    # cono de madera y mina
    punta = (p1[0], p1[1])
    mina  = (punta[0]-dx*alto*0.055, punta[1]-dy*alto*0.055)
    dr.polygon([(corte[0]+px*w, corte[1]+py*w), (corte[0]-px*w, corte[1]-py*w),
                punta], fill=MADERA + (255,))
    dr.polygon([(mina[0]+px*w*0.34, mina[1]+py*w*0.34),
                (mina[0]-px*w*0.34, mina[1]-py*w*0.34), punta], fill=GRAFITO + (255,))
    return capa, (ox, oy)

# ── armado de la palabra ───────────────────────────────────────────────
def pegar(img, tile, origen, x_ref, y_ref, giro):
    """Rota el tile alrededor del punto donde se dibujó la letra y lo pega
    de modo que ese punto caiga exactamente en (x_ref, y_ref). Así la letra
    queda donde tiene que quedar aunque la herramienta se salga de la caja."""
    ox, oy = origen
    t = tile.rotate(giro, resample=Image.BICUBIC, expand=False, center=(ox, oy))
    img.alpha_composite(t, (int(x_ref - ox), int(y_ref - oy)))

def palabra(base, x, y, size, color=CREMA, giro_a=-9, giro_k=6):
    capa = Image.new("RGBA", base.size, (0,0,0,0))
    dr = ImageDraw.Draw(capa)
    f = ImageFont.truetype(DISPLAY, size)
    alto = dr.textbbox((0,0), "H", font=f)[3] - dr.textbbox((0,0), "H", font=f)[1]

    dr.text((x, y), "VERUSH", font=f, fill=color + (255,))
    cur = x + dr.textlength("VERUSH", font=f)

    tK, oK = tile_k_lapiz(size, color)
    pegar(capa, tK, oK, cur, y - alto*0.10, giro_k)
    cur += dr.textlength("K", font=f) + size*0.34

    tA, oA = tile_a_hoz(size, ROJO, ROJO, MADERA)
    pegar(capa, tA, oA, cur, y + alto*0.02, giro_a)
    cur += dr.textlength("A", font=f) + size*0.30

    base.alpha_composite(capa)
    return cur - x, alto

def pantalla(W=2048, H=1152, campo_rojo=False):
    img = Image.new("RGBA", (W, H), CREMA + (255,))
    dr = ImageDraw.Draw(img)
    dr.polygon([(0,0), (W,0), (W,H*0.74), (0,H*0.88)], fill=NEGRO + (255,))
    if campo_rojo:
        dr.polygon([(W*0.74,0), (W*1.02,0), (W*1.02,H*0.82), (W*0.60,H*0.84)], fill=ROJO+(255,))
        dr.line([(W*0.74,0), (W*0.60,H*0.84)], fill=CREMA+(255,), width=9)

    size = int(H*0.28)
    x, y = int(W*0.045), int(H*0.40)
    ancho, alto = palabra(img, x, y, size)

    dr = ImageDraw.Draw(img)
    dr.rectangle([x, y+alto+62, x+ancho*0.82, y+alto+86], fill=ROJO+(255,))
    f2 = ImageFont.truetype(TEXTO, int(H*0.031))
    dr.text((x+4, y+alto+116), "PETROGRADO · 25 DE OCTUBRE DE 1917", font=f2, fill=CREMA+(255,), anchor="lt")
    f3 = ImageFont.truetype(TEXTO, int(H*0.024))
    dr.text((x+4, y+alto+170), "una aventura gráfica", font=f3, fill=(176,168,150,255), anchor="lt")
    f4 = ImageFont.truetype(TEXTO, int(H*0.021))
    dr.text((x+4, int(H*0.93)), "TRES DÍAS · TRES ESCENARIOS · CUATRO FINALES",
            font=f4, fill=GRIS+(255,), anchor="lt")
    return grano(img)

def wordmark(W=2100, H=560):
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    palabra(img, 60, int(H*0.30), int(H*0.54))
    return img

def main():
    salida = Path(sys.argv[1] if len(sys.argv)>1 else "letras2")
    salida.mkdir(parents=True, exist_ok=True)
    pantalla().save(salida/"titulo_h_hoz_lapiz.png")
    pantalla(campo_rojo=True).save(salida/"titulo_i_hoz_lapiz_rojo.png")
    wordmark().save(salida/"logo_hoz_lapiz.png")
    for p in sorted(salida.iterdir()): print("✓", p.name)

if __name__ == "__main__":
    main()
