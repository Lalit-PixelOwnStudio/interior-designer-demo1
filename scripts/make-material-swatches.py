"""Generate the material-library swatch images (img/materials/*.webp and
a 360px *-sm.webp copy of each).

    python scripts/make-material-swatches.py

Each swatch is drawn procedurally (wood grain, marble veins, fabric weave,
brushed metal …) so the library works without stock photos. Swap any file
for a real photo of the studio's samples later; keep the same file name.
"""
import pathlib

import numpy as np
from PIL import Image, ImageDraw, ImageFilter

ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "img" / "materials"
SIZE = 720


def rng(seed):
    return np.random.default_rng(seed)


def value_noise(shape, cells, seed):
    """Smooth noise: random grid of `cells` points, bicubic-upscaled."""
    r = rng(seed)
    cy, cx = cells if isinstance(cells, tuple) else (cells, cells)
    grid = r.random((cy + 1, cx + 1)).astype(np.float32)
    img = Image.fromarray((grid * 255).astype(np.uint8)).resize((shape[1], shape[0]), Image.BICUBIC)
    return np.asarray(img, dtype=np.float32) / 255.0


def fbm(shape, base, octaves, seed, gain=0.5):
    total = np.zeros(shape, np.float32)
    amp, norm = 1.0, 0.0
    cells = base
    for o in range(octaves):
        total += amp * value_noise(shape, cells, seed + o * 17)
        norm += amp
        amp *= gain
        cells = (cells[0] * 2, cells[1] * 2) if isinstance(cells, tuple) else cells * 2
    return total / norm


def colorize(t, stops):
    """Map 0..1 values through colour stops [(pos, (r,g,b)), ...]."""
    t = np.clip(t, 0, 1)
    out = np.zeros(t.shape + (3,), np.float32)
    for (p0, c0), (p1, c1) in zip(stops, stops[1:]):
        m = (t >= p0) & (t <= p1)
        k = ((t - p0) / max(p1 - p0, 1e-6))[m][:, None]
        out[m] = np.array(c0) * (1 - k) + np.array(c1) * k
    return out


def save(name, arr, blur=0):
    img = Image.fromarray(np.clip(arr, 0, 255).astype(np.uint8))
    if blur:
        img = img.filter(ImageFilter.GaussianBlur(blur))
    OUT.mkdir(parents=True, exist_ok=True)
    img.save(OUT / (name + ".webp"), "WEBP", quality=82, method=6)
    # small copy for the grid, the quiz and the moodboard (the dialog uses the full one)
    img.resize((360, 360), Image.LANCZOS).save(OUT / (name + "-sm.webp"), "WEBP", quality=80, method=6)
    print("wrote", name)


def grain(shape, seed, strength):
    return (rng(seed).random(shape).astype(np.float32) - 0.5) * strength


S = (SIZE, SIZE)
Y, X = np.mgrid[0:SIZE, 0:SIZE].astype(np.float32) / SIZE


# ----- laminates -----
def matte(name, rgb, seed, gloss=False):
    base = np.ones(S + (3,), np.float32) * np.array(rgb, np.float32)
    shade = (fbm(S, 3, 3, seed) - 0.5) * 10
    arr = base + shade[..., None] + grain(S, seed, 7)[..., None]
    if gloss:
        # soft diagonal reflection band
        band = np.exp(-((X - Y * 0.6 - 0.25) ** 2) / 0.01) * 38 + np.exp(-((X - Y * 0.6 - 0.48) ** 2) / 0.002) * 26
        arr += band[..., None]
    save(name, arr)


# ----- wood -----
def wood(name, dark, mid, light, seed, freq=34, warp=0.06, rings=False):
    """Grain lines of uneven spacing, colour streaks and fine pores along the board."""
    r = rng(seed)
    meander = fbm(S, (6, 2), 4, seed) - 0.5          # slow sideways wander of the grain
    density = fbm(S, (1, 5), 2, seed + 2)            # some areas tighter than others
    if rings:
        cx = 0.5 + (fbm(S, (2, 1), 2, seed + 9) - 0.5) * 0.3
        coord = np.abs(X - cx) * 1.6 + (Y - 0.2) ** 2 * 0.9 * (1 + meander) + meander * warp
    else:
        coord = X + meander * warp
    phase = coord * freq * (0.75 + density * 0.5) + (fbm(S, (3, 1), 3, seed + 4) - 0.5) * 2.5
    saw = phase - np.floor(phase)                    # 0..1 inside each growth ring
    late = np.exp(-saw * 7) * 0.9 + np.exp(-(1 - saw) * 18) * 0.35   # dark late-wood edge
    streaks = fbm(S, (2, 24), 3, seed + 6)           # colour variation running down the board
    pores = fbm(S, (260, 5), 1, seed + 7)
    t = 0.62 - late * 0.42 + (streaks - 0.5) * 0.45 + (pores - 0.5) * 0.22
    arr = colorize(t, [(0, dark), (0.5, mid), (1, light)])
    arr += grain(S, seed, 5)[..., None]
    save(name, arr, blur=0.35)


# ----- marble -----
def marble(name, base_lo, base_hi, vein, seed, freq=4.0, sharp=10.0, angle=0.6, vein_strength=0.95, second=None):
    """Cloudy base with long meandering veins that fork and fade."""
    warp = fbm(S, 2, 5, seed) - 0.5
    warp2 = fbm(S, 5, 4, seed + 11) - 0.5
    clouds = fbm(S, 3, 5, seed + 3)
    coord = X * np.cos(angle) + Y * np.sin(angle)
    width = 0.55 + fbm(S, 3, 2, seed + 7) * 0.9      # veins thicken and thin along their length
    main = np.abs(np.sin((coord * freq + warp * 1.3 + warp2 * 0.25) * np.pi))
    veins = np.exp(-main * sharp / width)
    hair = np.abs(np.sin((coord * freq * 2.7 + warp * 2.2 + warp2 * 0.6 + 0.37) * np.pi))
    hairs = np.exp(-hair * sharp * 3.2) * (fbm(S, 4, 2, seed + 13) > 0.5) * 0.6
    base = colorize(clouds, [(0, base_lo), (1, base_hi)])
    mix = np.clip((veins + hairs) * vein_strength, 0, 1)[..., None]
    arr = base * (1 - mix) + np.array(vein, np.float32) * mix
    if second:
        v2 = np.abs(np.sin((coord * freq * 0.55 + warp * 1.8 + 1.1) * np.pi))
        m2 = (np.exp(-v2 * sharp * 0.9) * 0.75)[..., None]
        arr = arr * (1 - m2) + np.array(second, np.float32) * m2
    arr += grain(S, seed, 3)[..., None]
    save(name, arr, blur=0.6)


def terrazzo(name, seed):
    r = rng(seed)
    img = Image.new("RGB", (SIZE, SIZE), (232, 226, 216))
    d = ImageDraw.Draw(img)
    palette = [(196, 120, 86), (120, 120, 116), (238, 236, 230), (176, 160, 138), (90, 98, 96), (214, 178, 140)]
    for _ in range(520):
        x, y = r.random(2) * SIZE
        s = r.uniform(4, 22)
        pts = [(x + np.cos(a) * s * r.uniform(0.5, 1.1), y + np.sin(a) * s * r.uniform(0.5, 1.1))
               for a in np.linspace(0, 2 * np.pi, r.integers(5, 8), endpoint=False)]
        d.polygon(pts, fill=tuple(int(c) for c in palette[r.integers(len(palette))]))
    arr = np.asarray(img, np.float32) + grain(S, seed, 10)[..., None] + ((fbm(S, 4, 3, seed) - 0.5) * 12)[..., None]
    save(name, arr, blur=0.6)


# ----- fabric -----
def weave(name, rgb, seed, period=6, depth=26, slub=0.35, coarse=False):
    yy, xx = np.mgrid[0:SIZE, 0:SIZE]
    warp_threads = np.sin(xx * 2 * np.pi / period) * 0.5 + 0.5
    weft_threads = np.sin(yy * 2 * np.pi / period) * 0.5 + 0.5
    over = ((xx // period + yy // period) % 2).astype(np.float32)  # plain weave
    pattern = over * warp_threads + (1 - over) * weft_threads
    slubs = fbm(S, (8, 120), 2, seed) if not coarse else fbm(S, (30, 30), 2, seed)
    t = pattern * depth + (slubs - 0.5) * depth * slub * 2 + (fbm(S, 3, 3, seed + 1) - 0.5) * 14
    arr = np.ones(S + (3,), np.float32) * np.array(rgb, np.float32) + t[..., None] - depth / 2
    arr += grain(S, seed, 10)[..., None]
    save(name, arr, blur=0.5 if not coarse else 0.8)


def velvet(name, rgb, seed):
    """Soft pile: broad light folds and a fine directional nap."""
    folds = fbm(S, (2, 3), 3, seed)
    sweep = np.sin((X * 1.1 + Y * 0.7 + (folds - 0.5) * 0.8) * np.pi * 1.6) * 0.5 + 0.5
    nap = fbm(S, (90, 30), 2, seed + 4)
    t = 0.3 + sweep ** 2 * 0.5 + (folds - 0.5) * 0.25 + (nap - 0.5) * 0.12
    dark = np.array(rgb, np.float32) * 0.55
    light = np.minimum(np.array(rgb, np.float32) * 1.3 + 26, 255)
    arr = colorize(t, [(0, tuple(dark)), (0.5, tuple(rgb)), (1, tuple(light))])
    arr += grain(S, seed, 8)[..., None]
    save(name, arr, blur=0.6)


def boucle(name, rgb, seed):
    r = rng(seed)
    img = Image.new("RGB", (SIZE, SIZE), tuple(int(c * 0.8) for c in rgb))
    d = ImageDraw.Draw(img)
    for _ in range(9000):
        x, y = r.random(2) * SIZE
        s = r.uniform(3, 7)
        shade = r.uniform(0.82, 1.08)
        c = tuple(int(min(255, ch * shade)) for ch in rgb)
        d.ellipse([x - s, y - s, x + s, y + s], outline=c, width=2)
    arr = np.asarray(img.filter(ImageFilter.GaussianBlur(0.8)), np.float32)
    arr += ((fbm(S, 4, 3, seed) - 0.5) * 24)[..., None]
    save(name, arr)


def cane(name, seed):
    """Rattan cane webbing: an octagon lattice over a dark backing."""
    img = Image.new("RGB", (SIZE, SIZE), (58, 42, 28))
    d = ImageDraw.Draw(img)
    step = 48
    strand = (214, 176, 120)
    for k in range(-SIZE, SIZE * 2, step):
        d.line([(k, 0), (k, SIZE)], fill=strand, width=7)
        d.line([(0, k), (SIZE, k)], fill=strand, width=7)
        d.line([(k, 0), (k + SIZE, SIZE)], fill=(196, 156, 100), width=6)
        d.line([(k, 0), (k - SIZE, SIZE)], fill=(196, 156, 100), width=6)
    arr = np.asarray(img.filter(ImageFilter.GaussianBlur(1.1)), np.float32)
    arr += ((fbm(S, (40, 40), 2, seed) - 0.5) * 30)[..., None] + grain(S, seed, 10)[..., None]
    save(name, arr)


# ----- metal -----
def brushed(name, lo, hi, seed):
    streak = fbm(S, (400, 3), 2, seed)  # long horizontal streaks
    light = np.exp(-((X - 0.35) ** 2) / 0.08) * 0.5 + np.exp(-((X - 0.8) ** 2) / 0.02) * 0.25
    t = 0.25 + streak * 0.35 + light
    arr = colorize(t, [(0, lo), (0.6, hi), (1, tuple(min(255, c + 50) for c in hi))])
    arr += grain(S, seed, 5)[..., None]
    save(name, arr)


if __name__ == "__main__":
    # Laminates
    matte("laminate-matte-ivory", (232, 224, 208), 1)
    matte("laminate-charcoal-suede", (58, 56, 54), 2)
    matte("laminate-sage-matte", (150, 162, 140), 3)
    matte("laminate-high-gloss-white", (238, 238, 236), 4, gloss=True)
    wood("laminate-natural-oak", (168, 128, 86), (204, 166, 118), (228, 198, 156), 5, freq=18, warp=0.08)
    # Veneers
    wood("veneer-american-walnut", (46, 28, 18), (92, 60, 38), (138, 96, 64), 11, freq=11, warp=0.1, rings=True)
    wood("veneer-natural-oak", (150, 112, 72), (196, 158, 108), (224, 192, 148), 12, freq=24, warp=0.06)
    wood("veneer-burma-teak", (112, 66, 30), (164, 106, 54), (204, 148, 88), 13, freq=9, warp=0.12, rings=True)
    wood("veneer-smoked-oak", (62, 52, 44), (108, 94, 82), (152, 136, 120), 14, freq=22, warp=0.07)
    # Marble & stone
    marble("marble-statuario", (232, 231, 228), (250, 249, 246), (118, 120, 124), 21, freq=2.2, sharp=14)
    marble("marble-calacatta-gold", (240, 236, 228), (253, 251, 247), (128, 124, 118), 22, freq=1.6, sharp=8, angle=0.9, second=(190, 152, 86))
    marble("marble-nero-marquina", (20, 20, 22), (44, 44, 48), (236, 234, 230), 23, freq=2.4, sharp=18, angle=-0.7)
    marble("marble-emperador", (86, 58, 40), (132, 94, 66), (222, 200, 170), 24, freq=3.4, sharp=16, angle=1.1)
    terrazzo("stone-terrazzo", 25)
    # Fabrics
    weave("fabric-natural-linen", (206, 192, 168), 31, period=7, depth=34, slub=0.3)
    velvet("fabric-emerald-velvet", (24, 92, 70), 32)
    boucle("fabric-ivory-boucle", (236, 228, 214), 33)
    weave("fabric-jute", (176, 146, 98), 34, period=12, depth=60, slub=0.5, coarse=True)
    velvet("fabric-terracotta-velvet", (168, 84, 56), 35)
    # Metals & accents
    brushed("metal-brushed-brass", (150, 112, 46), (214, 176, 96), 41)
    brushed("metal-matte-black", (22, 22, 22), (58, 58, 58), 42)
    cane("accent-rattan-cane", 43)
