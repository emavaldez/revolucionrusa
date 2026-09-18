#!/usr/bin/env python3
"""
VERUSHKA con la hoz y el martillo dentro de las letras.

La idea: la U ya es una media luna con la abertura para arriba — o sea que
ya es media hoz, sólo hay que afilarle un asta y ponerle mango en la otra.
Y la K ya tiene un brazo que sale en diagonal del tronco: es un martillo
esperando la cabeza.

Nada de reconstruir letras a mano. Dibujo el glifo real, lo escaneo para
saber exactamente dónde están las astas y a qué altura, y engancho la
herramienta ahí. Si cambiás de tipografía, sigue calzando.

    python3 letras.py salida/
"""
import sys, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import numpy as np

FUENTES = "/mnt/skills/examples/canvas-design/canvas-fonts"
DISPLAY = f"{FUENTES}/BigShoulders-Bold.ttf"
TEXTO   = f"{FUENTES}/InstrumentSans-Bold.ttf"

ROJO   = (200, 16, 46)
NEGRO  = (18, 16, 14)
CREMA  = (232, 220, 192)
GRIS   = (92, 88, 80)
MADERA = (176, 138, 92)

def grano(img, fuerza=6, semilla=5):
    a = np.asarray(img.convert("RGB")).astype(np.float32)
    a += np.random.default_rng(semilla).normal(0, fuerza, (img.size[1], img.size[0], 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

# ── métrica real del glifo ─────────────────────────────────────────────
def medir(letra, f, size):
    """Renderiza la letra sola y devuelve (mask, bbox) para poder
    escanearla. Es la única forma de enganchar geometría a un glifo sin
    adivinar dónde están los trazos."""
    lienzo = int(size*2.4)
    m = Image.new("L", (lienzo, lienzo), 0)
    ImageDraw.Draw(m).text((size*0.3, size*0.3), letra, font=f, fill=255)
    return m, m.getbbox()

def tramos(mask, y, umbral=128):
    """Tramos horizontales pintados en la fila y: [(x0, x1), ...]."""
    fila = np.asarray(mask)[y] > umbral
    out, ini = [], None
    for x, v in enumerate(fila):
        if v and ini is None: ini = x
        elif not v and ini is not None:
            out.append((ini, x-1)); ini = None
    if ini is not None: out.append((ini, len(fila)-1))
    return out

# ── herramientas enganchadas al glifo ──────────────────────────────────
def hoz_sobre_u(dr, ox, oy, mask, bbox, color, mango_color):
    """ox, oy: dónde quedó dibujada la letra en el lienzo final, en las
    mismas coordenadas en que se midió la máscara."""
    x0, y0, x1, y1 = bbox
    alto = y1 - y0
    fila = y0 + max(2, int(alto*0.03))
    t = tramos(mask, fila)
    if len(t) < 2: return
    izq, der = t[0], t[-1]
    g = (izq[1] - izq[0]) + 1                      # grosor del asta

    # El arco largo no funciona: tapa la letra y se lee como mancha.
    # La U ya ES la media luna; sólo hay que afilar un asta y poner mango
    # en la otra, sin invadir el glifo.
    ax = ox + (izq[0] + izq[1]) / 2
    ay = oy + y0
    dr.polygon([(ax - g*0.5, ay + alto*0.06), (ax + g*0.5, ay + alto*0.06),
                (ax + g*0.5, ay - alto*0.02),
                (ax - g*2.1, ay - alto*0.30), (ax - g*0.5, ay - alto*0.02)],
               fill=color)
    # empuñadura corta y compacta sobre el asta derecha
    hx = ox + (der[0] + der[1]) / 2
    dr.polygon([(hx - g*0.58, ay + alto*0.04), (hx + g*0.58, ay + alto*0.04),
                (hx + g*0.70, ay - alto*0.20), (hx - g*0.70, ay - alto*0.20)],
               fill=mango_color)
    dr.rectangle([hx - g*0.92, ay - alto*0.255, hx + g*0.92, ay - alto*0.185],
                 fill=mango_color)

def martillo_sobre_k(dr, ox, oy, mask, bbox, color):
    """La cabeza se planta en la punta del brazo superior de la K."""
    x0, y0, x1, y1 = bbox
    alto = y1 - y0
    fila = y0 + max(2, int(alto*0.03))
    t = tramos(mask, fila)
    if not t: return
    brazo = t[-1]
    ax = ox + (brazo[0] + brazo[1]) / 2
    ay = oy + y0 + alto*0.02
    g = (brazo[1] - brazo[0]) + 1

    # prolongo un poco el mango para que la cabeza no quede pegada al borde
    dx, dy = 0.66, -0.75
    lar = alto*0.16
    dr.polygon([(ax - g*0.5, ay), (ax + g*0.5, ay),
                (ax + g*0.5 + dx*lar, ay + dy*lar),
                (ax - g*0.5 + dx*lar, ay + dy*lar)], fill=color)
    cx, cy = ax + dx*lar, ay + dy*lar
    hl, hg = alto*0.46, alto*0.155
    px, py = -dy, dx
    dr.polygon([(cx - px*hg - dx*hl*0.5, cy - py*hg - dy*hl*0.5),
                (cx + px*hg - dx*hl*0.5, cy + py*hg - dy*hl*0.5),
                (cx + px*hg + dx*hl*0.5, cy + py*hg + dy*hl*0.5),
                (cx - px*hg + dx*hl*0.5, cy - py*hg + dy*hl*0.5)], fill=color)

def martillo_cruzando_u(dr, ox, oy, mask, bbox, color):
    """Variante 'juntas': el martillo cruza la U en diagonal, como en el
    emblema, en vez de vivir en la K."""
    x0, y0, x1, y1 = bbox
    alto, ancho = y1 - y0, x1 - x0
    g = ancho*0.15
    p0 = (ox + x0 - ancho*0.10, oy + y1 + alto*0.06)
    p1 = (ox + x1 + ancho*0.34, oy + y0 - alto*0.20)
    dx, dy = p1[0]-p0[0], p1[1]-p0[1]
    L = math.hypot(dx, dy); dx, dy = dx/L, dy/L
    px, py = -dy, dx
    dr.polygon([(p0[0]+px*g, p0[1]+py*g), (p1[0]+px*g, p1[1]+py*g),
                (p1[0]-px*g, p1[1]-py*g), (p0[0]-px*g, p0[1]-py*g)], fill=color)
    hl, hg = alto*0.34, alto*0.12
    dr.polygon([(p1[0]-px*hg-dx*hl*0.5, p1[1]-py*hg-dy*hl*0.5),
                (p1[0]+px*hg-dx*hl*0.5, p1[1]+py*hg-dy*hl*0.5),
                (p1[0]+px*hg+dx*hl*0.5, p1[1]+py*hg+dy*hl*0.5),
                (p1[0]-px*hg+dx*hl*0.5, p1[1]-py*hg+dy*hl*0.5)], fill=color)

# ── la palabra ─────────────────────────────────────────────────────────
def palabra(dr, x, y, size, color, modo="separadas", acento=ROJO, mango=MADERA, sobre_rojo=False):
    f = ImageFont.truetype(DISPLAY, size)
    off = size*0.3                       # desplazamiento usado al medir

    def ancho_de(s): return dr.textlength(s, font=f)
    cur = x
    def escribir(s):
        nonlocal cur
        dr.text((cur, y), s, font=f, fill=color, anchor="lt")
        cur += ancho_de(s)

    def escribir_color(s_, c):
        nonlocal cur
        dr.text((cur, y), s_, font=f, fill=c, anchor="lt")
        cur += ancho_de(s_)

    escribir("VER")
    xU = cur; escribir_color("U", acento)
    mU, bU = medir("U", f, size)

    escribir("SH")
    xK = cur
    color_k = color if sobre_rojo else (acento if modo == "separadas" else color)
    escribir_color("K", color_k)
    mK, bK = medir("K", f, size)
    escribir("A")

    # las herramientas, ancladas a la métrica real del glifo
    hoz_sobre_u(dr, xU - off, y - off, mU, bU, acento, mango)
    if modo == "juntas":
        martillo_cruzando_u(dr, xU - off, y - off, mU, bU, acento)
    else:
        martillo_sobre_k(dr, xK - off, y - off, mK, bK, color_k)

    alto = bU[3] - bU[1]
    return cur - x, alto

def pantalla(modo, W=2048, H=1152, campo_rojo=False):
    img = Image.new("RGB", (W, H), CREMA)
    dr = ImageDraw.Draw(img)
    dr.polygon([(0,0), (W,0), (W,H*0.74), (0,H*0.88)], fill=NEGRO)
    if campo_rojo:
        dr.polygon([(W*0.52,0), (W*1.02,0), (W*1.02,H*0.80), (W*0.30,H*0.82)], fill=ROJO)
        dr.line([(W*0.52,0), (W*0.30,H*0.82)], fill=CREMA, width=9)

    size = int(H*0.30)
    x, y = int(W*0.045), int(H*0.38)
    ancho, alto = palabra(dr, x, y, size, CREMA, modo=modo, sobre_rojo=campo_rojo)

    dr.rectangle([x, y+alto+52, x+ancho, y+alto+76], fill=ROJO)
    f2 = ImageFont.truetype(TEXTO, int(H*0.031))
    dr.text((x+4, y+alto+106), "PETROGRADO · 25 DE OCTUBRE DE 1917", font=f2, fill=CREMA, anchor="lt")
    f3 = ImageFont.truetype(TEXTO, int(H*0.024))
    dr.text((x+4, y+alto+160), "una aventura gráfica", font=f3, fill=(176,168,150), anchor="lt")
    f4 = ImageFont.truetype(TEXTO, int(H*0.021))
    dr.text((x+4, int(H*0.93)), "TRES DÍAS · TRES ESCENARIOS · CUATRO FINALES",
            font=f4, fill=GRIS, anchor="lt")
    return grano(img)

def wordmark(modo, W=2000, H=520):
    img = Image.new("RGBA", (W, H), (0,0,0,0))
    dr = ImageDraw.Draw(img)
    palabra(dr, 50, int(H*0.30), int(H*0.62), CREMA, modo=modo)
    return img

def main():
    salida = Path(sys.argv[1] if len(sys.argv)>1 else "letras")
    salida.mkdir(parents=True, exist_ok=True)
    pantalla("separadas").save(salida/"titulo_e_separadas.png")
    pantalla("juntas").save(salida/"titulo_f_juntas.png")
    pantalla("separadas", campo_rojo=True).save(salida/"titulo_g_rojo.png")
    wordmark("separadas").save(salida/"logo_separadas.png")
    wordmark("juntas").save(salida/"logo_juntas.png")
    for p in sorted(salida.iterdir()): print("✓", p.name)

if __name__ == "__main__":
    main()
