#!/usr/bin/env python3
"""
Generador de fondos constructivistas para VERUSHKA.

No usa modelos de difusión: dibuja. El constructivismo ruso es geometría,
paleta corta y trama de imprenta, y eso se programa mejor de lo que se
promptea. La salida es la capa gráfica; si además hay una placa fotográfica
generada con Flux, se compone debajo con --base.

    python3 generador.py salida/ [--base plates/]

Regla de oro de estos fondos: son escenario, no cuadro. Tienen que quedar
en tonos medios para que un personaje oscuro se lea encima. Lo más oscuro
de la imagen es el marco; el centro respira.
"""
import sys, math, random
from pathlib import Path
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageChops

W, H = 3072, 1024

ROJO   = (200, 16, 46)
NEGRO  = (20, 18, 16)
CREMA  = (232, 220, 192)
TIERRA = (58, 54, 50)

def mezcla(a, b, t):
    t = max(0.0, min(1.0, t))
    return tuple(int(a[i] + (b[i] - a[i]) * t) for i in range(3))

# ── texturas ───────────────────────────────────────────────────────────
def halftone(size, celda=8, angulo=27, intensidad=0.18, semilla=0):
    w, h = size
    d = int(math.hypot(w, h)) + celda * 4
    cap = Image.new("L", (d, d), 0)
    dr = ImageDraw.Draw(cap)
    rnd = random.Random(semilla)
    for y in range(0, d, celda):
        for x in range(0, d, celda):
            r = celda * 0.30 * (0.7 + rnd.random() * 0.6)
            dr.ellipse([x - r, y - r, x + r, y + r], fill=255)
    cap = cap.rotate(angulo, resample=Image.BILINEAR)
    cap = cap.crop(((d - w) // 2, (d - h) // 2, (d - w) // 2 + w, (d - h) // 2 + h))
    return cap.point(lambda v: int(v * intensidad))

def vineta(size, fuerza=0.40):
    w, h = size
    yy, xx = np.mgrid[0:h, 0:w]
    r = np.sqrt(((xx - w/2) / (w/2)) ** 2 + ((yy - h/2) / (h/2)) ** 2)
    return np.clip(1 - fuerza * np.clip(r - 0.55, 0, None) ** 1.4, 0, 1)[:, :, None]

def acabado(img, semilla=0, celda=8, ht=0.16, gr=6, vin=0.40):
    a = np.asarray(img).astype(np.float32)
    a *= vineta(img.size, vin)
    ht_map = np.asarray(halftone(img.size, celda=celda, intensidad=ht, semilla=semilla)).astype(np.float32)
    a -= ht_map[:, :, None] * 0.45
    rng = np.random.default_rng(semilla)
    a += rng.normal(0, gr, (img.size[1], img.size[0], 1))
    return Image.fromarray(np.clip(a, 0, 255).astype(np.uint8))

def luz(img, centro, radio, color, fuerza=1.0):
    """Mancha de luz sumada. Es lo que salva estas imágenes de ser planas."""
    capa = Image.new("RGB", img.size, (0, 0, 0))
    d = ImageDraw.Draw(capa)
    d.ellipse([centro[0]-radio, centro[1]-radio*0.55, centro[0]+radio, centro[1]+radio*0.55],
              fill=tuple(int(c*fuerza) for c in color))
    return ImageChops.add(img, capa.filter(ImageFilter.GaussianBlur(radio*0.42)))

# ── piezas ─────────────────────────────────────────────────────────────
def columna(dr, x, base_y, alto, ancho, claro, oscuro):
    top = base_y - alto
    dr.rectangle([x-ancho/2, top, x+ancho/2, base_y], fill=claro)
    dr.rectangle([x+ancho*0.12, top, x+ancho/2, base_y], fill=oscuro)          # sombra propia
    dr.rectangle([x-ancho*0.5, top, x-ancho*0.34, base_y], fill=mezcla(claro,(255,255,255),0.18))
    cap = ancho*0.82
    dr.rectangle([x-cap, top-ancho*0.30, x+cap, top+ancho*0.06], fill=claro)   # capitel
    dr.rectangle([x-cap, top-ancho*0.30, x+cap, top-ancho*0.16], fill=mezcla(claro,(255,255,255),0.12))
    dr.rectangle([x-cap*1.06, base_y-ancho*0.26, x+cap*1.06, base_y], fill=oscuro)  # basa

def ventanal(dr, x, y, w, h, cielo, marco):
    dr.rectangle([x-w*0.10, y-h*0.03, x+w*1.10, y+h*1.03], fill=marco)
    dr.rectangle([x, y, x+w, y+h], fill=cielo)
    dr.line([x+w/2, y, x+w/2, y+h], fill=marco, width=max(3, int(w*0.055)))
    for i in range(1, 5):
        yy = y + h*i/5
        dr.line([x, yy, x+w, yy], fill=marco, width=max(3, int(w*0.045)))
    # arco superior
    dr.arc([x-w*0.10, y-h*0.22, x+w*1.10, y+h*0.18], 180, 360, fill=marco, width=int(w*0.10))

def banda(img, p1, p2, grosor, color, alpha=225):
    capa = Image.new("RGBA", img.size, (0,0,0,0))
    ImageDraw.Draw(capa).line([p1, p2], fill=color+(alpha,), width=grosor)
    return Image.alpha_composite(img.convert("RGBA"), capa).convert("RGB")

# ── ESCENARIOS ─────────────────────────────────────────────────────────
def smolny():
    """Corredor del Instituto, de día. Quarenghi: pared ocre pálida,
    columnata blanca, ventanales altos. Luz gris de octubre entrando
    por la derecha y cayendo en manchas sobre el parqué."""
    img = Image.new("RGB", (W, H), (150, 140, 118))
    dr = ImageDraw.Draw(img)
    hz = int(H*0.66)

    # pared: degradé lateral, más clara cerca de los ventanales
    for x in range(W):
        t = (x / W) ** 1.25
        dr.line([(x,0),(x,hz)], fill=mezcla((118,110,92), (206,196,168), t))
    # zócalo y cornisa
    dr.rectangle([0, hz-46, W, hz], fill=(96,88,72))
    dr.rectangle([0, int(H*0.055), W, int(H*0.085)], fill=(212,202,176))
    dr.rectangle([0, int(H*0.085), W, int(H*0.10)], fill=(120,112,94))

    # piso de parqué: tablas en perspectiva suave, tono cálido
    dr.rectangle([0, hz, W, H], fill=(112,88,60))
    fuga = (int(W*0.72), hz)
    for i in range(-40, 70):
        dr.line([fuga, (fuga[0]+i*150, H)], fill=(96,74,50), width=3)
    for k in range(1, 11):
        y = hz + (H-hz)*(k/10)**1.9
        dr.line([(0,y),(W,y)], fill=(100,78,52), width=2)

    # ventanales altos a la derecha
    for i in range(5):
        x = int(W*0.44 + i*W*0.115)
        ventanal(dr, x, int(H*0.16), int(W*0.062), int(H*0.40),
                 (186,196,204), (86,78,64))

    # columnata: más juntas hacia la derecha para dar profundidad
    for i in range(8):
        f = i/7
        x = int(W*0.03 + (W*0.94)*(f**0.85))
        alto = int(H*0.56 - f*H*0.05)
        columna(dr, x, hz+10, alto, int(W*0.026 - f*W*0.006),
                (214,206,186), (140,132,112))

    # retratos de egresadas: el mundo viejo todavía colgado
    for i in range(3):
        x = int(W*0.06 + i*W*0.105)
        y = int(H*0.19)
        dr.rectangle([x, y, x+104, y+138], fill=(72,58,42))
        dr.rectangle([x+11, y+11, x+93, y+127], fill=(104,88,66))

    # manchas de luz en el piso, una por ventanal
    for i in range(5):
        x = int(W*0.44 + i*W*0.115 + W*0.031)
        img = luz(img, (x+120, hz+150), 260, (70,66,54), 1.0)
    img = luz(img, (int(W*0.86), int(H*0.30)), 520, (46,44,38), 1.0)
    dr = ImageDraw.Draw(img)

    img = banda(img, (int(W*0.755), -20), (int(W*1.02), int(H*0.62)), 52, ROJO, 230)
    img = banda(img, (int(W*0.805), -20), (int(W*1.07), int(H*0.62)), 9, CREMA, 150)
    return acabado(img, semilla=1, celda=9, ht=0.14, gr=5, vin=0.40)

def vyborg():
    """Výborg de noche, cinco bajo cero. Fábricas de ladrillo, chimeneas,
    faroles de gas, nieve pisada con hollín. El más oscuro de los tres,
    pero con la calle clara para que se lea la gente."""
    img = Image.new("RGB", (W, H), (18, 21, 28))
    dr = ImageDraw.Draw(img)
    hz = int(H*0.70)

    for y in range(hz):
        t = (y/hz)**0.7
        dr.line([(0,y),(W,y)], fill=mezcla((12,15,22),(58,64,78), t))

    rnd = random.Random(11)
    planos = [(0.19,(44,48,58)), (0.26,(30,34,43)), (0.34,(19,22,29))]
    for alt, color in planos:
        x = -100
        while x < W+100:
            w = rnd.randint(190, 460)
            h = int(H*alt*(0.75+rnd.random()*0.55))
            dr.rectangle([x, hz-h, x+w, hz], fill=color)
            dr.rectangle([x, hz-h, x+w, hz-h+10], fill=mezcla(color,(255,255,255),0.10))
            for fy in range(4):
                for fx in range(max(1, w//72)):
                    if rnd.random() < 0.26:
                        vx, vy = x+26+fx*72, hz-h+30+fy*54
                        if vy < hz-26 and vx < x+w-26:
                            dr.rectangle([vx, vy, vx+26, vy+34],
                                         fill=mezcla(color,(236,186,104),0.80))
            if rnd.random() < 0.5:
                cx = x+w*0.72
                ch = int(H*alt*1.0)
                dr.polygon([(cx-22, hz-h), (cx+22, hz-h), (cx+13, hz-h-ch), (cx-13, hz-h-ch)], fill=color)
            x += w + rnd.randint(14, 70)

    # calle: nieve pisada, en franjas horizontales y no en lunares
    dr.rectangle([0, hz, W, H], fill=(96,98,105))
    for k in range(70):
        y = hz + (H-hz)*(k/70)**1.25
        t = k/70
        dr.line([(0,y),(W,y)], fill=mezcla((118,120,127),(66,66,72), t*0.9), width=int(3+t*10))
    for _ in range(260):                      # huellas y hollín, muy bajas en contraste
        x, y = rnd.randint(0,W), rnd.randint(hz,H)
        w_ = rnd.randint(40,190); h_ = rnd.randint(4,13)
        c = (128,130,137) if rnd.random()<0.5 else (74,74,80)
        dr.ellipse([x,y,x+w_,y+h_], fill=mezcla((96,98,105), c, 0.38))
    dr.rectangle([0, hz, W, hz+7], fill=(138,140,147))

    # faroles de gas, al frente de todo
    for i in range(5):
        x = int(W*0.11 + i*W*0.195)
        dr.line([(x,hz+40),(x, hz-H*0.30)], fill=(26,28,35), width=11)
        dr.polygon([(x-26,hz-H*0.30),(x+26,hz-H*0.30),(x+17,hz-H*0.345),(x-17,hz-H*0.345)], fill=(26,28,35))
        dr.ellipse([x-19, hz-H*0.342, x+19, hz-H*0.292], fill=(250,222,162))
        img = luz(img, (x, int(hz-H*0.317)), 330, (86,68,34))
        img = luz(img, (x, hz+90), 300, (44,38,22))
        dr = ImageDraw.Draw(img)

    # bandera roja en un poste: la única superficie roja grande del acto
    bx = int(W*0.63)
    dr.line([(bx,hz),(bx, hz-H*0.40)], fill=(40,40,46), width=9)
    dr.polygon([(bx, hz-H*0.40), (bx+210, hz-H*0.375), (bx+196, hz-H*0.275), (bx, hz-H*0.29)], fill=ROJO)

    img = banda(img, (int(W*0.015), int(H*1.02)), (int(W*0.26), int(H*-0.02)), 40, ROJO, 190)
    return acabado(img, semilla=2, celda=8, ht=0.12, gr=8, vin=0.55)

def palacio():
    """Enfilada del Palacio de noche. Rastrelli: oro, malaquita, parqué de
    marquetería. Las arañas apagadas, la luz viene de las ventanas del Nevá
    y de un par de candelabros. Planos sólidos que se van al negro."""
    img = Image.new("RGB", (W, H), (58, 44, 30))
    dr = ImageDraw.Draw(img)
    hz = int(H*0.70)
    cx = int(W*0.56)

    for y in range(hz):
        t = (y/hz)**1.1
        dr.line([(0,y),(W,y)], fill=mezcla((128,100,62),(52,40,27), t))

    # enfilada: rectángulos sólidos encajados, cada uno más oscuro
    for k in range(6):
        f = 1 - k*0.135
        w, h = int(W*0.50*f), int(H*0.68*f)
        x0, y0 = cx - w//2, hz - h
        tono = mezcla((120,94,58), (16,12,9), (k/5)**0.8)
        dr.rectangle([x0, y0, x0+w, hz], fill=tono)
        # marco dorado del vano
        oro = mezcla((196,162,96), (60,48,30), k/5)
        dr.rectangle([x0, y0, x0+w, hz], outline=oro, width=max(4, int(22*f)))
        dr.rectangle([x0, y0-int(26*f), x0+w, y0], fill=oro)

    # parqué
    dr.rectangle([0, hz, W, H], fill=(96,70,46))
    for i in range(-24, 50):
        dr.line([(cx,hz),(cx+i*160,H)], fill=(80,58,38), width=3)
    for k in range(1, 10):
        y = hz + (H-hz)*(k/9)**1.8
        dr.line([(0,y),(W,y)], fill=(84,61,40), width=2)

    # ventanales del Nevá, a la izquierda: ya amanece
    for i in range(3):
        x = int(W*0.035 + i*W*0.115)
        ventanal(dr, x, int(H*0.17), int(W*0.058), int(H*0.42),
                 (150,164,178), (54,42,28))

    # arañas apagadas
    for i in range(4):
        x = int(W*0.18 + i*W*0.22)
        dr.line([(x,0),(x,int(H*0.14))], fill=(74,58,38), width=5)
        dr.ellipse([x-62, int(H*0.14), x+62, int(H*0.14)+80], outline=(168,138,84), width=6)
        for j in range(8):
            dr.line([(x,int(H*0.14)+40),(x-62+124*j/7, int(H*0.14)+112)], fill=(132,106,64), width=3)

    for i in range(3):
        x = int(W*0.035 + i*W*0.115 + W*0.029)
        img = luz(img, (x+90, hz+120), 240, (54,50,44))
    img = luz(img, (cx, int(H*0.42)), 420, (52,40,22))
    img = luz(img, (int(W*0.20), int(H*0.30)), 380, (40,34,24))

    img = banda(img, (int(W*0.34), int(H*1.02)), (int(W*0.045), int(H*-0.02)), 44, ROJO, 200)
    return acabado(img, semilla=3, celda=9, ht=0.13, gr=5, vin=0.45)


ESCENAS = {"smolny": smolny, "vyborg": vyborg, "palacio": palacio}

def main():
    salida = Path(sys.argv[1] if len(sys.argv) > 1 else "arte")
    salida.mkdir(parents=True, exist_ok=True)
    base = None
    if "--base" in sys.argv:
        base = Path(sys.argv[sys.argv.index("--base")+1])

    for nombre, fn in ESCENAS.items():
        capa = fn()
        if base and (base / f"{nombre}.png").exists():
            # Fotomontaje: placa fotográfica debajo, geometría encima.
            # Así trabajaban Ródchenko y Klutsis.
            plate = Image.open(base / f"{nombre}.png").convert("RGB").resize((W, H))
            capa = Image.blend(plate, capa, 0.58)
            capa = acabado(capa, semilla=9, celda=9, ht=0.11, gr=4, vin=0.35)
        ruta = salida / f"fondo_{nombre}.png"
        capa.save(ruta, optimize=True)
        print(f"✓ {ruta}  {capa.size[0]}×{capa.size[1]}")

if __name__ == "__main__":
    main()
