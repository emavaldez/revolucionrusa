#!/usr/bin/env python3
"""
Generador de sprites de personajes para VERUSHKA.

Sistema paramétrico: un cuerpo base y piezas de vestuario intercambiables,
todas dibujadas con formas planas y una sola sombra. Sirve para que los
quince personajes se lean como del mismo juego, y para que cambiar el largo
de un capote sea cambiar un número.

La regla acá es la silueta: a 150 píxeles de alto no se ve una cara, se ve
una forma. Cada personaje tiene que ser reconocible en negro sobre blanco.

    python3 personajes.py salida/
"""
import sys, math
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter

A, AL = 384, 768              # lienzo por sprite
SUELO = 744

# paleta base
PIEL   = (198, 162, 130)
PIELS  = (162, 128, 100)
ROJO   = (200, 16, 46)
CREMA  = (232, 220, 192)

def oscuro(c, k=0.66): return tuple(int(v*k) for v in c)
def claro(c, k=0.22):  return tuple(int(v+(255-v)*k) for v in c)

# ── piezas ─────────────────────────────────────────────────────────────
def piernas(dr, cx, y0, y1, ancho, color, pollera=False, largo_pollera=0.0):
    if pollera:
        top = y0
        bot = y0 + (y1-y0)*largo_pollera
        dr.polygon([(cx-ancho*0.52, top), (cx+ancho*0.52, top),
                    (cx+ancho*0.95, bot), (cx-ancho*0.95, bot)], fill=color)
        dr.polygon([(cx, top), (cx+ancho*0.52, top),
                    (cx+ancho*0.95, bot), (cx, bot)], fill=oscuro(color, 0.80))
        return bot
    else:
        w = ancho*0.30
        dr.rectangle([cx-ancho*0.42, y0, cx-ancho*0.42+w, y1], fill=color)
        dr.rectangle([cx+ancho*0.42-w, y0, cx+ancho*0.42, y1], fill=oscuro(color, 0.82))
        return y1

def botas(dr, cx, y, ancho, color):
    for s in (-1, 1):
        x = cx + s*ancho*0.30
        dr.rectangle([x-ancho*0.17, y-34, x+ancho*0.17, y], fill=color)
        dr.rectangle([x-ancho*0.17, y-10, x+ancho*0.24 if s>0 else x+ancho*0.17,
                      y], fill=oscuro(color, 0.8))

def torso(dr, cx, y0, y1, ancho, color, solapas=None, botones=None, cinto=None):
    dr.polygon([(cx-ancho*0.5, y0+10), (cx+ancho*0.5, y0+10),
                (cx+ancho*0.56, y1), (cx-ancho*0.56, y1)], fill=color)
    dr.polygon([(cx+ancho*0.06, y0+10), (cx+ancho*0.5, y0+10),
                (cx+ancho*0.56, y1), (cx+ancho*0.06, y1)], fill=oscuro(color, 0.82))
    dr.ellipse([cx-ancho*0.5, y0-2, cx+ancho*0.5, y0+24], fill=color)   # hombros
    if solapas:
        dr.polygon([(cx-ancho*0.26, y0+12), (cx, y0+70), (cx+ancho*0.26, y0+12)], fill=solapas)
    if botones:
        for i in range(4):
            yy = y0+64 + i*(y1-y0-90)/3
            dr.ellipse([cx-5, yy-5, cx+5, yy+5], fill=botones)
    if cinto:
        yy = y0 + (y1-y0)*0.66
        dr.rectangle([cx-ancho*0.56, yy, cx+ancho*0.56, yy+16], fill=cinto)

def brazos(dr, cx, y0, largo, ancho, color, cruzados=False):
    w = ancho*0.19
    if cruzados:
        dr.polygon([(cx-ancho*0.52, y0+30), (cx+ancho*0.52, y0+70),
                    (cx+ancho*0.52, y0+70+w), (cx-ancho*0.52, y0+30+w)], fill=oscuro(color,0.9))
        return
    for s in (-1, 1):
        x = cx + s*ancho*0.52
        dr.rectangle([x-w/2, y0+16, x+w/2, y0+16+largo], fill=color if s<0 else oscuro(color,0.84))
        dr.ellipse([x-w*0.62, y0+16+largo-6, x+w*0.62, y0+16+largo+16], fill=PIELS)

def rasgos(dr, cx, y, r, lentes=None):
    """Ceja/ojo y anteojos, al final del todo para que nada los tape."""
    dr.rectangle([cx-r*0.62, y-r*0.16, cx-r*0.20, y-r*0.02], fill=(50,42,36))
    dr.rectangle([cx+r*0.22, y-r*0.16, cx+r*0.58, y-r*0.02], fill=(72,62,54))
    if lentes:
        dr.ellipse([cx-r*0.76, y-r*0.28, cx-r*0.08, y+r*0.26], outline=lentes, width=4)
        dr.ellipse([cx+r*0.12, y-r*0.28, cx+r*0.80, y+r*0.26], outline=lentes, width=4)
        dr.line([cx-r*0.08, y-r*0.02, cx+r*0.12, y-r*0.02], fill=lentes, width=4)

def cabeza(dr, cx, y, r, piel=PIEL, barba=None, bigote=None, lentes=None, vendaje=False):
    dr.ellipse([cx-r, y-r, cx+r, y+r*1.16], fill=piel)
    dr.ellipse([cx, y-r, cx+r, y+r*1.16], fill=oscuro(piel, 0.88))
    dr.rectangle([cx-r*0.34, y+r*1.05, cx+r*0.34, y+r*1.46], fill=oscuro(piel,0.9))  # cuello
    if barba:
        dr.ellipse([cx-r*0.9, y+r*0.10, cx+r*0.9, y+r*1.30], fill=barba)
    if bigote:
        dr.ellipse([cx-r*0.62, y+r*0.24, cx+r*0.62, y+r*0.58], fill=bigote)
    if vendaje:
        dr.polygon([(cx-r*0.94, y+r*0.16), (cx-r*0.26, y+r*0.26),
                    (cx-r*0.30, y+r*0.74), (cx-r*0.90, y+r*0.58)], fill=(226,220,206))
        dr.line([(cx-r*0.90, y+r*0.34), (cx-r*0.28, y+r*0.44)], fill=(198,192,178), width=3)

def pelo(dr, cx, y, r, color, salvaje=False):
    """Casquete por encima de la línea de la ceja. Nunca toca la cara:
    si el pelo tapa los ojos, el personaje parece que lleva antifaz."""
    if salvaje:
        dr.ellipse([cx-r*1.70, y-r*1.44, cx+r*1.70, y+r*0.16], fill=color)
        dr.ellipse([cx-r*1.34, y-r*1.62, cx+r*1.34, y-r*0.30], fill=color)
    dr.chord([cx-r*1.04, y-r*1.16, cx+r*1.04, y+r*0.30], 180, 360, fill=color)
    dr.rectangle([cx-r*1.04, y-r*0.42, cx-r*0.72, y+r*0.30], fill=color)   # patilla
    dr.rectangle([cx+r*0.72, y-r*0.42, cx+r*1.04, y+r*0.30], fill=oscuro(color,0.85))

def panuelo_atras(dr, cx, y, r, color):
    """El pañuelo va DETRÁS de la cara. Verushka no es una monja."""
    dr.ellipse([cx-r*1.22, y-r*1.30, cx+r*1.22, y+r*1.10], fill=color)
    dr.polygon([(cx-r*1.22, y+r*0.10), (cx+r*1.22, y+r*0.10),
                (cx+r*0.40, y+r*1.70), (cx-r*0.40, y+r*1.70)], fill=oscuro(color,0.84))

def panuelo_adelante(dr, cx, y, r, color):
    dr.chord([cx-r*1.22, y-r*1.30, cx+r*1.22, y-r*0.20], 180, 360, fill=color)
    for s_ in (-1, 1):                                    # bordes a los lados de la cara
        dr.polygon([(cx+s_*r*1.04, y-r*0.66), (cx+s_*r*1.26, y-r*0.60),
                    (cx+s_*r*1.12, y+r*0.62), (cx+s_*r*0.94, y+r*0.50)],
                   fill=color if s_<0 else oscuro(color,0.86))
    dr.polygon([(cx-r*0.26, y+r*0.92), (cx+r*0.26, y+r*0.92),
                (cx+r*0.08, y+r*1.44), (cx-r*0.08, y+r*1.44)], fill=oscuro(color,0.9))

def gorra(dr, cx, y, r, color):
    dr.ellipse([cx-r*1.06, y-r*1.30, cx+r*1.06, y-r*0.10], fill=color)
    dr.rectangle([cx-r*1.06, y-r*0.60, cx+r*1.06, y-r*0.24], fill=color)
    dr.polygon([(cx-r*1.20, y-r*0.24), (cx+r*0.40, y-r*0.24),
                (cx+r*0.30, y-r*0.02), (cx-r*1.34, y-r*0.02)], fill=oscuro(color,0.6))

def gorro_marinero(dr, cx, y, r, color):
    dr.ellipse([cx-r*1.12, y-r*1.24, cx+r*1.12, y-r*0.16], fill=color)
    dr.rectangle([cx-r*1.12, y-r*0.62, cx+r*1.12, y-r*0.26], fill=oscuro(color,0.5))
    for s in (-1,1):
        dr.line([(cx+s*r*0.3, y-r*0.26), (cx+s*r*0.5, y+r*0.9)], fill=color, width=6)

def sombrero_ala(dr, cx, y, r, color):
    dr.ellipse([cx-r*1.9, y-r*0.66, cx+r*1.9, y-r*0.14], fill=color)
    dr.ellipse([cx-r*0.94, y-r*1.46, cx+r*0.94, y-r*0.30], fill=color)

def gorro_alto(dr, cx, y, r, color):
    dr.rectangle([cx-r*0.92, y-r*1.84, cx+r*0.92, y-r*0.30], fill=color)
    dr.ellipse([cx-r*0.92, y-r*2.0, cx+r*0.92, y-r*1.62], fill=claro(color,0.12))

# ── props ──────────────────────────────────────────────────────────────
def fusil(dr, cx, ancho, color=(58,44,32), acero=(140,146,152), grande=True):
    x = cx + ancho*0.62
    y0, y1 = SUELO-30, SUELO-470 if grande else SUELO-410
    dr.line([(x, y0), (x, y1)], fill=color, width=13)
    dr.line([(x, y1), (x, y1-96)], fill=acero, width=6)          # bayoneta
    dr.rectangle([x-9, y0-70, x+9, y0-10], fill=oscuro(color,0.8))

def diario(dr, cx, ancho, y):
    dr.polygon([(cx-ancho*0.62, y), (cx+ancho*0.30, y-16),
                (cx+ancho*0.30, y+92), (cx-ancho*0.62, y+108)], fill=(222,214,194))
    for i in range(6):
        dr.line([(cx-ancho*0.54, y+16+i*14), (cx+ancho*0.22, y+2+i*14)], fill=(150,142,126), width=3)
    dr.line([(cx-ancho*0.54, y+10), (cx+ancho*0.22, y-4)], fill=ROJO, width=7)

def lapiz(dr, cx, ancho, y):
    dr.line([(cx+ancho*0.60, y), (cx+ancho*0.60, y+70)], fill=ROJO, width=11)
    dr.polygon([(cx+ancho*0.60-6, y+70), (cx+ancho*0.60+6, y+70), (cx+ancho*0.60, y+88)], fill=(90,70,50))

def bandeja(dr, cx, ancho, y):
    dr.ellipse([cx-ancho*0.66, y, cx+ancho*0.66, y+26], fill=(170,150,110))
    dr.rectangle([cx-30, y-34, cx+30, y+6], fill=(210,206,196))

def botella(dr, cx, ancho, y):
    x = cx+ancho*0.60
    dr.rectangle([x-16, y, x+16, y+86], fill=(52,72,46))
    dr.rectangle([x-6, y-30, x+6, y], fill=(52,72,46))
    dr.rectangle([x-16, y+26, x+16, y+48], fill=(214,198,150))

def bolsa(dr, cx, ancho, y):
    dr.polygon([(cx-ancho*0.74, y), (cx-ancho*0.24, y),
                (cx-ancho*0.18, y+96), (cx-ancho*0.80, y+96)], fill=(122,104,78))

# ── definición de los personajes ───────────────────────────────────────
# altura: 1.0 = 1,75 m. Las alturas son deliberadas: Lenin era bajo,
# Kolia es un chico, Praskovia está encorvada de la cola.
P = {
 "verushka": dict(altura=0.97, abrigo=(96,74,58), pollera=(58,50,44), largo=0.62,
                  cabeza_="panuelo", tocado=(168,62,58), pelo_=(72,52,38), botas_=(52,44,36)),
 "centinela": dict(altura=1.00, abrigo=(112,112,96), pantalon=(88,88,74), capote=0.78,
                   cabeza_="gorra", tocado=(96,96,80), cinto=(70,58,44), prop="fusil", botas_=(58,50,40)),
 "ivanov":   dict(altura=0.90, abrigo=(58,54,62), pantalon=(52,48,56), solapas=(214,208,196),
                  cabeza_="calvo", pelo_=(120,104,86), vendaje=True, prop="diario", botas_=(44,40,38)),
 "martov":   dict(altura=1.03, abrigo=(78,74,84), pantalon=(66,62,70), solapas=(196,190,178),
                  cabeza_="pelo", pelo_=(84,74,64), lentes=(40,36,32), botas_=(46,42,40)),
 "trotski":  dict(altura=1.02, abrigo=(46,44,52), pantalon=(44,42,50), solapas=(224,218,206),
                  cabeza_="salvaje", pelo_=(38,32,28), lentes=(30,28,26), botas_=(40,36,34)),
 "stalin":   dict(altura=0.98, abrigo=(96,100,88), pantalon=(80,84,74), botones=(190,172,120),
                  cabeza_="pelo", pelo_=(44,36,30), bigote=(44,36,30), prop="lapiz", botas_=(52,46,38)),
 "praskovia":dict(altura=0.93, abrigo=(104,92,74), pollera=(72,62,52), largo=0.70,
                  cabeza_="panuelo", tocado=(142,124,96), pelo_=(90,78,62), prop="bolsa", botas_=(54,46,38)),
 "delegado": dict(altura=1.00, abrigo=(70,80,96), pantalon=(58,66,80), botones=(180,180,170),
                  cabeza_="gorra", tocado=(58,66,80), brazos_cruzados=True, botas_=(46,42,38)),
 "liudmila": dict(altura=0.95, abrigo=(222,216,204), pollera=(64,60,72), largo=0.58,
                  cabeza_="pelo", pelo_=(96,72,48), auriculares=True, botas_=(50,46,44)),
 "kolia":    dict(altura=0.88, abrigo=(122,118,104), pantalon=(96,94,84), capote=0.84,
                  cabeza_="gorra", tocado=(104,102,90), prop="fusil", botas_=(60,54,44)),
 "marinero": dict(altura=1.01, abrigo=(46,58,72), pantalon=(40,50,62), cuello_marinero=True,
                  cabeza_="marinero", tocado=(226,222,210), botas_=(38,36,34)),
 "editor":   dict(altura=0.99, abrigo=(70,62,52), pantalon=(60,54,46), solapas=(206,198,182),
                  cabeza_="pelo", pelo_=(140,136,130), lentes=(40,36,32), prop="diario", botas_=(44,40,36)),
 "cocinero": dict(altura=0.99, abrigo=(198,192,178), pantalon=(72,68,62), delantal=True,
                  cabeza_="gorro_alto", tocado=(226,222,212), pelo_=(80,68,56), botas_=(48,44,40)),
 "antonov":  dict(altura=1.00, abrigo=(52,48,44), pantalon=(48,44,40), solapas=(180,174,160),
                  cabeza_="sombrero", tocado=(40,36,34), pelo_=(58,48,40), lentes=(36,32,30), botas_=(40,38,36)),
 "konovalov":dict(altura=0.98, abrigo=(66,62,58), pantalon=(58,54,50), solapas=(200,194,180),
                  cabeza_="sombrero", tocado=(54,50,46), pelo_=(120,116,110),
                  brazos_cruzados=True, botas_=(44,40,38)),
}

def sprite(spec):
    img = Image.new("RGBA", (A, AL), (0,0,0,0))
    dr = ImageDraw.Draw(img)
    cx = A//2
    esc = spec.get("altura", 1.0)
    alto_total = 610*esc
    top = SUELO - alto_total
    r = 52*esc                                    # radio de cabeza
    ancho = 150*esc

    y_cuello  = top + r*2.25
    y_cintura = top + alto_total*0.52
    capote    = spec.get("capote", 0.0)
    y_torso1  = y_cintura + alto_total*capote*0.42 if capote else y_cintura

    # piernas
    if "pollera" in spec:
        piernas(dr, cx, y_cintura, SUELO-30, ancho, spec["pollera"],
                pollera=True, largo_pollera=spec.get("largo",0.6)/0.62)
    else:
        piernas(dr, cx, y_cintura, SUELO-30, ancho, spec.get("pantalon",(60,56,50)))
    botas(dr, cx, SUELO, ancho, spec.get("botas_", (50,44,38)))

    # torso / abrigo
    torso(dr, cx, y_cuello, y_torso1, ancho, spec["abrigo"],
          solapas=spec.get("solapas"), botones=spec.get("botones"), cinto=spec.get("cinto"))
    if spec.get("delantal"):
        dr.polygon([(cx-ancho*0.40, y_cuello+40), (cx+ancho*0.40, y_cuello+40),
                    (cx+ancho*0.50, y_torso1+70), (cx-ancho*0.50, y_torso1+70)], fill=(214,208,192))
        for m in ((-0.2,0.3),(0.25,0.6),(-0.05,0.75)):
            dr.ellipse([cx+ancho*m[0], y_cuello+40+(y_torso1-y_cuello)*m[1],
                        cx+ancho*m[0]+26, y_cuello+62+(y_torso1-y_cuello)*m[1]], fill=(176,164,140))
    if spec.get("cuello_marinero"):
        dr.polygon([(cx-ancho*0.46, y_cuello+6), (cx+ancho*0.46, y_cuello+6),
                    (cx, y_cuello+86)], fill=(226,222,210))

    brazos(dr, cx, y_cuello, alto_total*0.36, ancho, spec["abrigo"],
           cruzados=spec.get("brazos_cruzados", False))

    # cabeza: primero lo que va detrás, después la cara, después lo de adelante
    y_cab = top + r
    tipo = spec.get("cabeza_", "pelo")
    tocado = spec.get("tocado", (60,56,50))

    if tipo == "panuelo":   panuelo_atras(dr, cx, y_cab, r, tocado)
    elif tipo == "sombrero":
        dr.ellipse([cx-r*1.30, y_cab-r*1.20, cx+r*1.30, y_cab+r*0.90],
                   fill=spec.get("pelo_",(60,50,42)))

    cabeza(dr, cx, y_cab, r, barba=spec.get("barba"), bigote=spec.get("bigote"),
           vendaje=spec.get("vendaje", False))

    if tipo == "panuelo":       panuelo_adelante(dr, cx, y_cab, r, tocado)
    elif tipo == "gorra":       gorra(dr, cx, y_cab, r, tocado)
    elif tipo == "marinero":    gorro_marinero(dr, cx, y_cab, r, tocado)
    elif tipo == "sombrero":    sombrero_ala(dr, cx, y_cab, r, tocado)
    elif tipo == "gorro_alto":  gorro_alto(dr, cx, y_cab, r, tocado)
    elif tipo == "salvaje":     pelo(dr, cx, y_cab, r, spec.get("pelo_",(40,34,30)), salvaje=True)
    elif tipo == "pelo":        pelo(dr, cx, y_cab, r, spec.get("pelo_",(70,58,46)))
    # "calvo": no se dibuja nada; el chiste de Ivanov es justamente ese

    rasgos(dr, cx, y_cab, r, lentes=spec.get("lentes"))

    if spec.get("auriculares"):
        dr.arc([cx-r*1.12, y_cab-r*1.20, cx+r*1.12, y_cab+r*0.30], 180, 360, fill=(52,48,44), width=8)
        for s in (-1,1):
            dr.ellipse([cx+s*r*1.12-14, y_cab-r*0.30, cx+s*r*1.12+14, y_cab+r*0.24], fill=(52,48,44))

    # props
    prop = spec.get("prop")
    if prop == "fusil":   fusil(dr, cx, ancho, grande=esc>0.9)
    elif prop == "diario": diario(dr, cx, ancho, y_cuello+alto_total*0.22)
    elif prop == "lapiz":  lapiz(dr, cx, ancho, y_cuello+alto_total*0.30)
    elif prop == "bolsa":  bolsa(dr, cx, ancho, y_cintura-20)
    elif prop == "botella":botella(dr, cx, ancho, y_cuello+alto_total*0.30)

    # sombra en el piso
    som = Image.new("RGBA", (A, AL), (0,0,0,0))
    ImageDraw.Draw(som).ellipse([cx-ancho*0.85, SUELO-16, cx+ancho*0.85, SUELO+22],
                                fill=(0,0,0,110))
    som = som.filter(ImageFilter.GaussianBlur(9))
    return Image.alpha_composite(som, img)

def main():
    salida = Path(sys.argv[1] if len(sys.argv)>1 else "personajes")
    salida.mkdir(parents=True, exist_ok=True)
    for nombre, spec in P.items():
        s = sprite(spec)
        s.save(salida / f"{nombre}.png")
        print(f"✓ {nombre}")
    print(f"\n{len(P)} sprites en {salida}/")

if __name__ == "__main__":
    main()
