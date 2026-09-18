# Pipeline de arte de VERUSHKA — los dos caminos combinados

La combinación no es un rejunte: es **cómo se hacían de verdad estos carteles**.
Ródchenko, Klutsis y Lissitzky trabajaban con fotomontaje — una placa
fotográfica real debajo — y encima una capa geométrica de color plano,
diagonales y tipografía pesada. Eso es exactamente lo que hace este pipeline.

```
  Flux / SDXL en tu Mac           generador.py acá
  ───────────────────────         ──────────────────────
  placa fotográfica               capa constructivista
  arquitectura, materia,          geometría, paleta corta,
  profundidad, suciedad           diagonal roja, trama de imprenta
            └──────────┬──────────────────┘
                       ▼
          generador.py --base plates/
          (blend 58% + trama + grano + viñeta)
                       ▼
              Assets/RR/Arte/fondo_*.png
```

Sin placas, `generador.py` corre solo y da un fondo completo — los tres que ya
están en `Assets/RR/Arte/` salieron así. Con placas, la capa gráfica se apoya
sobre la foto y el resultado tiene materia real.

## Paso 1 — placas con Flux en tu Mac

Salida: `plates/smolny.png`, `plates/vyborg.png`, `plates/palacio.png`,
3072×1024 (o 1536×512 y escalás). Los prompts están abajo.

Con MLX:

```bash
pip install mflux
mflux-generate --model dev --steps 25 --seed 1917 \
  --height 512 --width 1536 \
  --prompt "$(cat prompts/smolny.txt)" \
  --output plates/smolny.png
```

Con ComfyUI o Draw Things, el mismo prompt.

## Paso 2 — componer

```bash
python3 generador.py salida/ --base plates/
```

## Paso 3 — a Unity

Copiar los PNG a `Assets/RR/Arte/`. El constructor de escenas los busca por
nombre (`fondo_<id del escenario>.png`) y arma el plano de fondo solo.

---

# Prompts

Escritos contra la especificación histórica, no contra el estilo: al modelo se
le pide **la foto**, no el cartel. La estética constructivista la pone el código
después. Pedirle las dos cosas al modelo al mismo tiempo es lo que arruina estas
imágenes.

Negativos comunes para los tres:

```
soviet iconography, hammer and sickle, red army uniform, propaganda poster,
modern clothing, modern buildings, cars, people, text, watermark, cgi, 3d render,
oversaturated, cheerful, clean, pristine
```

---

### smolny.txt

```
Interior photograph of a long neoclassical corridor in a Russian institute
building, 1806 architecture by Quarenghi, pale ochre walls, white Corinthian
columns receding to the right, tall arched windows with small panes on the right
wall casting weak grey October daylight in pools across a worn herringbone
parquet floor, dark oil portraits in gilt frames on the left wall, scuffed and
dirty, cigarette ends and mud on the floor, bare electric bulbs where candles
used to be, wide horizontal composition, three to one aspect ratio, side
elevation view, empty of people, desaturated, 1917, archival photograph, large
format, slight film grain
```

### vyborg.txt

```
Night photograph of a Saint Petersburg industrial working class district in
winter 1917, dark red brick factory buildings two and three storeys, tall smoke
chimneys against a foggy sky, a few lit windows of the night shift, cast iron gas
street lamps with weak yellow light, unpaved street covered in trodden dirty snow
mixed with soot, wooden tenement houses, river fog, five degrees below zero, wide
horizontal composition, three to one aspect ratio, empty of people, very dark,
archival photograph, large format, film grain
```

### palacio.txt

```
Interior photograph of an enfilade of baroque state rooms in the Winter Palace,
Rastrelli architecture, gilded door frames receding in a row through six
doorways, malachite and gold ornament, tall windows on the left overlooking the
frozen Neva at dawn, crystal chandeliers unlit, marquetry parquet floor, heavy
shadow, cold blue dawn light from the left against warm gold, wide horizontal
composition, three to one aspect ratio, empty of people, archival photograph,
large format, film grain
```

---

## Sobre los personajes

Lo mismo pero al revés: para los personajes conviene **no** generar con difusión.
Son sprites que tienen que leerse a 120 píxeles de alto contra el fondo, y ahí
una silueta plana bien recortada gana siempre. Se dibujan, o se rotoscopian de
una placa generada.

Si igual querés probar, la especificación de vestuario de cada personaje está en
`verushka-arte-e-historia.md` y sirve de prompt casi literal. Dos cosas que el
modelo siempre te va a errar y hay que poner explícitas:

- **Lenin**: `clean shaven, ill fitting wig, bandaged left cheek, office suit
  and waistcoat` — y en negativo `beard, goatee, flat cap, lenin`. El modelo lo
  conoce y te lo va a dibujar como la estatua.
- **Verushka**: `headscarf` y en negativo `flat cap` — la gorra de obrera es
  iconografía de los años 20, no de octubre del 17.
