#!/usr/bin/env python3
"""Generate a cohesive set of refined, textured SVG illustrations for the village site.
Style: layered organic bands, soft duotone-brand palette, film grain, subtle sun glow.
No cartoon figures. Deterministic (seeded) so output is stable across runs."""
import math, random, os

W, H = 1600, 1000
OUT = os.path.join(os.path.dirname(__file__), "..", "public", "img")

# Brand palette (matches globals.css)
BRAND = ["#062723", "#10443c", "#115248", "#116759", "#13806c", "#1f9f85", "#42bb9f", "#78d5bd", "#aee8d6", "#d5f4ea"]
SUN = "#f6c454"
SAND = "#e8d6a8"
WATER = ["#0e4f5c", "#0e7490", "#0891b2", "#22a6bd"]

def grain(seed, n=1400, opacity=0.05):
    random.seed(seed)
    dots = []
    for _ in range(n):
        x = random.random() * W
        y = random.random() * H
        r = random.uniform(0.4, 1.3)
        o = random.uniform(0.02, opacity)
        c = "#ffffff" if random.random() > 0.5 else "#000000"
        dots.append(f'<circle cx="{x:.1f}" cy="{y:.1f}" r="{r:.2f}" fill="{c}" opacity="{o:.3f}"/>')
    return f'<g>{"".join(dots)}</g>'

def band(y, amp, curve, color, opacity=1.0, seed=0):
    """A soft organic horizontal band from y to bottom."""
    random.seed(seed)
    pts = []
    steps = 8
    for i in range(steps + 1):
        x = W * i / steps
        yy = y + math.sin(i * curve + seed) * amp - random.uniform(0, amp * 0.4)
        pts.append((x, yy))
    d = f"M0 {H} L0 {pts[0][1]:.1f} "
    for i in range(1, len(pts)):
        x0, y0 = pts[i - 1]
        x1, y1 = pts[i]
        cx = (x0 + x1) / 2
        d += f"C{cx:.1f} {y0:.1f} {cx:.1f} {y1:.1f} {x1:.1f} {y1:.1f} "
    d += f"L{W} {H} Z"
    return f'<path d="{d}" fill="{color}" opacity="{opacity}"/>'

def sun(cx, cy, r, color=SUN, glow=True):
    out = ""
    if glow:
        out += f'<circle cx="{cx}" cy="{cy}" r="{r*2.6}" fill="{color}" opacity="0.10"/>'
        out += f'<circle cx="{cx}" cy="{cy}" r="{r*1.7}" fill="{color}" opacity="0.16"/>'
    out += f'<circle cx="{cx}" cy="{cy}" r="{r}" fill="{color}"/>'
    return out

def wrap(defs, body, grain_seed=7):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
            f'preserveAspectRatio="xMidYMid slice" role="img"><defs>{defs}</defs>{body}{grain(grain_seed)}</svg>\n')

def linear(id, stops, x1=0, y1=0, x2=0, y2=1):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<linearGradient id="{id}" x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}">{s}</linearGradient>'

def radial(id, stops, cx=0.5, cy=0.5, r=0.8):
    s = "".join(f'<stop offset="{o}" stop-color="{c}"/>' for o, c in stops)
    return f'<radialGradient id="{id}" cx="{cx}" cy="{cy}" r="{r}">{s}</radialGradient>'

def mist(y, h, color="#ffffff", opacity=0.12):
    return f'<rect x="0" y="{y}" width="{W}" height="{h}" fill="{color}" opacity="{opacity}"/>'

def reeds(base_y, color, n=14, seed=3, hmin=60, hmax=160):
    random.seed(seed)
    out = []
    for _ in range(n):
        x = random.uniform(0, W)
        hh = random.uniform(hmin, hmax)
        sway = random.uniform(-18, 18)
        out.append(f'<path d="M{x:.0f} {base_y} Q{x+sway/2:.0f} {base_y-hh/2:.0f} {x+sway:.0f} {base_y-hh:.0f}" '
                   f'stroke="{color}" stroke-width="{random.uniform(2,4):.1f}" fill="none" stroke-linecap="round" opacity="0.8"/>')
    return "".join(out)

def palm_silhouette(x, base_y, s, color):
    trunk = f'<path d="M{x} {base_y} q{-14*s} {-150*s} {18*s} {-270*s}" stroke="{color}" stroke-width="{11*s}" fill="none" stroke-linecap="round"/>'
    tx, ty = x + 18 * s, base_y - 270 * s
    fronds = ""
    for a in (-165, -120, -70, -30, 15, -95):
        r = math.radians(a)
        ex = tx + math.cos(r) * 150 * s
        ey = ty + math.sin(r) * 80 * s + 20 * s
        mx = (tx + ex) / 2
        my = ty + (ey - ty) / 2 - 55 * s
        fronds += (f'<path d="M{tx:.0f} {ty:.0f} Q{mx:.0f} {my:.0f} {ex:.0f} {ey:.0f}" '
                   f'stroke="{color}" stroke-width="{9*s}" fill="none" stroke-linecap="round"/>')
    return trunk + fronds

illus = {}

# --- HERO: warm dawn over sawah & sea; clean sun, layered depth, twin palms ---
defs = (linear("hsky", [(0, "#0b3b47"), (0.42, "#1c6f66"), (0.72, "#4f9e7e"), (1, "#f0c66a")])
        + radial("hsun", [(0, "#fff2cc"), (0.55, "#ffd873"), (1, "#f4b942")], 0.5, 0.5, 0.5)
        + radial("hglow", [(0, "#ffdf8f"), (1, "rgba(255,223,143,0)")], 0.5, 0.5, 0.5))
body = (f'<rect width="{W}" height="{H}" fill="url(#hsky)"/>'
        # matahari + halo hangat di kanan atas
        + f'<circle cx="1230" cy="300" r="420" fill="url(#hglow)" opacity="0.7"/>'
        + f'<circle cx="1230" cy="300" r="150" fill="url(#hsun)"/>'
        + mist(360, 130, "#ffffff", 0.07)
        # pita bukit & sawah, dari terang di belakang ke gelap di depan
        + band(540, 24, 0.9, BRAND[7], 0.35, 11)
        + band(600, 28, 1.1, BRAND[6], 0.7, 5)
        + band(680, 30, 0.7, BRAND[5], 1.0, 8)
        + band(770, 30, 1.2, BRAND[4], 1.0, 2)
        + band(860, 26, 0.9, BRAND[3], 1.0, 14)
        # sawah depan bertekstur + refleksi air tipis
        + f'<rect x="0" y="905" width="{W}" height="{H-905}" fill="{BRAND[2]}"/>'
        + reeds(H, BRAND[0], 30, 4, 90, 240)
        + palm_silhouette(150, 760, 1.25, BRAND[0])
        + palm_silhouette(1440, 800, 1.0, BRAND[0]))
illus["hero-desa"] = wrap(defs, body, 7)

# --- SAWAH: bright terraced rice fields ---
defs = linear("ssky", [(0, "#bfe6f2"), (1, "#f3ecc9")])
rows = ""
palette = ["#8bc34a", "#7cb342", "#689f38", "#9ccc65"]
for i in range(7):
    y = 430 + i * 82
    rows += band(y, 14, 0.6 + i * 0.1, palette[i % len(palette)], 1.0, 20 + i)
body = (f'<rect width="{W}" height="{H}" fill="url(#ssky)"/>' + sun(360, 250, 90)
        + band(400, 20, 0.8, BRAND[7], 0.6, 3) + rows
        + reeds(H, "#4d7c0f", 20, 6, 60, 150))
illus["sawah"] = wrap(defs, body, 9)

# --- PESISIR: calm sea, horizon, sun path, boats as clean shapes ---
defs = (linear("psky", [(0, "#12405b"), (0.6, "#3f7fa0"), (1, "#f6b98a")])
        + linear("psea", [(0, WATER[3]), (1, WATER[0])]))
def boat(x, y, s, color):
    return (f'<path d="M{x-95*s:.0f} {y} q{95*s:.0f} {58*s:.0f} {190*s:.0f} 0 z" fill="{color}"/>'
            f'<path d="M{x+6*s:.0f} {y-8*s:.0f} L{x+6*s:.0f} {y-120*s:.0f} L{x+86*s:.0f} {y-16*s:.0f} Z" fill="#f7f3e8" opacity="0.92"/>')
random.seed(30)
shimmer = "".join(
    f'<ellipse cx="{800+random.uniform(-260,260):.0f}" cy="{560+i*26}" rx="{random.uniform(40,150):.0f}" ry="3" fill="#ffe6a3" opacity="{max(0.08,0.5-i*0.06):.2f}"/>'
    for i in range(6)
)
body = (f'<rect width="{W}" height="{H}" fill="url(#psky)"/>' + sun(800, 330, 96)
        + f'<rect x="0" y="540" width="{W}" height="{H-540}" fill="url(#psea)"/>'
        + shimmer + boat(520, 640, 1.0, BRAND[0]) + boat(980, 590, 0.75, BRAND[1]) + boat(1230, 690, 1.15, BRAND[0])
        + band(H-90, 12, 1.0, SAND, 1.0, 12))
illus["pesisir"] = wrap(defs, body, 5)

# --- TAMBAK: aquaculture ponds grid seen at low angle ---
defs = (linear("tsky", [(0, "#a9d6e5"), (1, "#eaf3d8")]) + linear("tpond", [(0, "#2a9db5"), (1, "#0e6b7f")]))
ponds = ""
for r in range(3):
    for c in range(4):
        x = 120 + c * 360; y = 470 + r * 175
        ponds += f'<rect x="{x}" y="{y}" width="320" height="150" rx="10" fill="url(#tpond)"/>'
        ponds += f'<rect x="{x}" y="{y}" width="320" height="20" rx="10" fill="#ffffff" opacity="0.14"/>'
body = (f'<rect width="{W}" height="{H}" fill="url(#tsky)"/>' + sun(1300, 220, 80)
        + band(430, 18, 0.7, "#7bbf6a", 1.0, 4)
        + f'<rect x="0" y="450" width="{W}" height="{H-450}" fill="#9db06a"/>' + ponds
        + reeds(460, "#3f6212", 16, 8, 40, 90))
illus["tambak"] = wrap(defs, body, 6)

# --- KANTOR DESA: clean civic building, flag, flat modern ---
defs = linear("ksky", [(0, "#9fd0e8"), (1, "#e9f4f0")])
b = (f'<rect x="440" y="430" width="720" height="330" fill="#fbfaf5"/>'
     f'<rect x="440" y="430" width="720" height="66" fill="{BRAND[2]}"/>'
     f'<path d="M410 430 L800 320 L1190 430 Z" fill="{BRAND[3]}"/>'
     f'<path d="M760 320 h80 v-70 h-80 z" fill="#c96a2b"/>')
cols = "".join(f'<rect x="{490+i*150}" y="540" width="70" height="220" fill="#e7e5e4"/>' for i in range(5))
b += cols + f'<rect x="440" y="740" width="720" height="24" fill="#d6d3d1"/>'
flag = (f'<rect x="1250" y="300" width="9" height="360" fill="#57534e"/>'
        f'<rect x="1259" y="305" width="150" height="50" fill="#d1362f"/><rect x="1259" y="355" width="150" height="50" fill="#f7f3e8"/>')
body = (f'<rect width="{W}" height="{H}" fill="url(#ksky)"/>' + sun(300, 250, 74)
        + band(700, 12, 0.6, "#8bc34a", 1.0, 3) + b + flag
        + reeds(H, "#4d7c0f", 12, 5, 40, 90))
illus["kantor-desa"] = wrap(defs, body, 3)

# --- POSYANDU: warm health / care, abstract heart + shelter, no figures ---
defs = (linear("hesky", [(0, "#ffe3ea"), (1, "#fff6ec")]) + radial("heglow", [(0, "#ffd9df"), (1, "#ffe3ea")], 0.5, 0.4, 0.7))
heart = ('<path transform="translate(800 430) scale(3.4)" '
         'd="M0 34 C-30 6 -46 -14 -30 -32 C-18 -44 0 -36 0 -20 C0 -36 18 -44 30 -32 C46 -14 30 6 0 34 Z" '
         'fill="#e8536b"/>')
shelter = f'<path d="M540 620 L800 470 L1060 620 Z" fill="{BRAND[4]}" opacity="0.16"/>'
body = (f'<rect width="{W}" height="{H}" fill="url(#heglow)"/>'
        + band(720, 14, 0.7, "#bbe7c4", 1.0, 4) + shelter + heart
        + f'<circle cx="470" cy="360" r="34" fill="{SUN}" opacity="0.8"/>'
        + f'<circle cx="1180" cy="420" r="22" fill="{BRAND[5]}" opacity="0.5"/>')
illus["posyandu"] = wrap(defs, body, 8)

# --- GOTONG ROYONG: community / hands, abstract interlocking rings ---
defs = linear("gsky", [(0, "#bfe0f0"), (1, "#f2eccf")])
rings = ""
cols_r = [BRAND[3], SUN, WATER[2], "#c96a2b", BRAND[5]]
for i in range(5):
    cx = 460 + i * 170; cy = 470 + (i % 2) * 40
    rings += f'<circle cx="{cx}" cy="{cy}" r="90" fill="none" stroke="{cols_r[i]}" stroke-width="26" opacity="0.85"/>'
body = (f'<rect width="{W}" height="{H}" fill="url(#gsky)"/>' + sun(300, 240, 70)
        + band(650, 20, 0.8, BRAND[6], 0.6, 3) + band(720, 16, 1.0, "#7cb342", 1.0, 5)
        + rings + reeds(H, "#4d7c0f", 14, 7, 50, 110))
illus["gotong-royong"] = wrap(defs, body, 4)

# --- SILAT: culture, abstract dynamic brush strokes, no figures ---
defs = linear("sisky", [(0, "#c8622b"), (0.6, "#e39b53"), (1, "#f6d9a0")])
strokes = ""
random.seed(21)
for i in range(5):
    x = 400 + i * 180
    strokes += (f'<path d="M{x} 720 Q{x-60} 480 {x+40} 300" stroke="{BRAND[0]}" '
                f'stroke-width="{random.uniform(14,26):.0f}" fill="none" stroke-linecap="round" opacity="0.9"/>')
body = (f'<rect width="{W}" height="{H}" fill="url(#sisky)"/>' + sun(800, 300, 90, "#fff0cf")
        + band(760, 16, 0.7, BRAND[2], 1.0, 3) + strokes)
illus["silat"] = wrap(defs, body, 2)

# --- ANYAMAN: craft, refined woven diagonal lattice, warm bamboo tones ---
defs = linear("ansky", [(0, "#f3e6c8"), (1, "#e3cc9b")])
weave = ""
step = 70
for i in range(-H, W, step):
    weave += f'<line x1="{i}" y1="0" x2="{i+H}" y2="{H}" stroke="#c69a5b" stroke-width="26" opacity="0.55"/>'
for i in range(0, W + H, step):
    weave += f'<line x1="{i}" y1="0" x2="{i-H}" y2="{H}" stroke="#a9782f" stroke-width="20" opacity="0.4"/>'
body = f'<rect width="{W}" height="{H}" fill="url(#ansky)"/>{weave}'
illus["anyaman"] = wrap(defs, body, 10)

# --- MUSYAWARAH: governance, abstract assembly / dialogue arcs ---
defs = linear("msky", [(0, "#0e443d"), (1, "#1a6f5c")])
arcs = ""
for i in range(4):
    r = 200 + i * 90
    arcs += f'<circle cx="800" cy="640" r="{r}" fill="none" stroke="{BRAND[6-i%3]}" stroke-width="6" opacity="{0.5-i*0.08:.2f}"/>'
dots = "".join(f'<circle cx="{800+math.cos(math.radians(a))*260:.0f}" cy="{640-abs(math.sin(math.radians(a)))*180:.0f}" r="26" fill="{SUN if i%3 else BRAND[7]}"/>' for i, a in enumerate(range(200, 341, 20)))
body = (f'<rect width="{W}" height="{H}" fill="url(#msky)"/>' + arcs + dots
        + f'<circle cx="800" cy="640" r="60" fill="{SUN}"/>')
illus["musyawarah"] = wrap(defs, body, 12)

# --- UMKM PRODUCT placeholders: neutral, per-product tint so cards aren't identical banners ---
def product(name, tint, motif):
    defs = radial(f"pg{name}", [(0, "#ffffff"), (1, tint)], 0.5, 0.32, 0.9)
    body = (f'<rect width="{W}" height="{H}" fill="url(#pg{name})"/>'
            + f'<circle cx="800" cy="500" r="300" fill="#ffffff" opacity="0.35"/>'
            + motif)
    return wrap(defs, body, 14)

# Bandeng presto — fish silhouette
fish = ('<g transform="translate(800 500)"><path d="M-260 0 C-160 -120 160 -120 250 0 C160 120 -160 120 -260 0 Z" fill="#3f6f8f"/>'
        '<path d="M250 0 L340 -70 L320 0 L340 70 Z" fill="#2f5670"/>'
        '<circle cx="-170" cy="-24" r="16" fill="#fff"/><circle cx="-170" cy="-24" r="7" fill="#1f2937"/>'
        '<path d="M-60 -70 Q0 -30 60 -70" stroke="#fff" stroke-width="8" fill="none" opacity="0.5"/></g>')
illus["produk-bandeng"] = product("bandeng", "#bfe0f0", fish)
# Kerupuk — stacked chips
chips = "".join(f'<ellipse cx="{800+ (i-2)*90}" cy="{520+ (i%2)*40}" rx="120" ry="60" fill="{["#e8a13c","#d98a2b","#f0b866"][i%3]}" opacity="0.9"/>' for i in range(5))
illus["produk-kerupuk"] = product("kerupuk", "#f7e6c4", chips)
# Ikan asin — sun + small fish
salt = ('<circle cx="800" cy="430" r="110" fill="#f6c454"/>'
        + "".join(f'<path d="M{560+i*140} 660 c40 -30 90 -30 130 0 c-40 30 -90 30 -130 0 z" fill="#6b7f8f"/>' for i in range(4)))
illus["produk-ikan-asin"] = product("ikanasin", "#cfe3ea", salt)
# Beras — grains
grains = "".join(f'<ellipse cx="{700+ (i%5)*50}" cy="{460+(i//5)*46}" rx="20" ry="9" transform="rotate({(i*37)%360} {700+(i%5)*50} {460+(i//5)*46})" fill="#f4efe2" stroke="#d9cdae"/>' for i in range(20))
illus["produk-beras"] = product("beras", "#e6efd6", f'<circle cx="800" cy="500" r="220" fill="#c9a96a" opacity="0.35"/>{grains}')
# Anyaman product reuse
illus["produk-anyaman"] = product("anyamanp", "#f0dcb4", '<g transform="translate(800 500)"><ellipse cx="0" cy="60" rx="230" ry="70" fill="#b5843b"/><path d="M-230 60 Q0 -140 230 60" fill="#d3ab63"/></g>')

for name, svg in illus.items():
    with open(os.path.join(OUT, f"{name}.svg"), "w") as f:
        f.write(svg)
print(f"wrote {len(illus)} illustrations")
