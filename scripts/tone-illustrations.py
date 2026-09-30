#!/usr/bin/env python3
"""Ubah semua warna di ilustrasi pengganti (public/img/*.svg) ke palet Modern Minimalist.

Setiap warna dipetakan menurut kecerahannya ke gradasi Charcoal #36454f -> Slate #708090
-> Light Gray #d3d3d3 -> White #ffffff, sehingga kontras dan bentuk tetap terbaca
tetapi seluruh ilustrasi selaras dengan palet situs. Foto asli yang diunggah lewat CMS
tidak terpengaruh.
"""
import glob
import os
import re

RAMP = [(0.0, (0x25, 0x30, 0x37)), (0.30, (0x36, 0x45, 0x4F)), (0.55, (0x70, 0x80, 0x90)), (0.80, (0xD3, 0xD3, 0xD3)), (1.0, (0xFF, 0xFF, 0xFF))]


def to_ramp(r: int, g: int, b: int) -> str:
    lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255
    for (t0, c0), (t1, c1) in zip(RAMP, RAMP[1:]):
        if lum <= t1:
            k = (lum - t0) / (t1 - t0) if t1 > t0 else 0
            c = [round(a + (b_ - a) * k) for a, b_ in zip(c0, c1)]
            return "#%02x%02x%02x" % tuple(c)
    return "#ffffff"


def hex_repl(m: re.Match) -> str:
    h = m.group(1)
    if len(h) == 3:
        h = "".join(ch * 2 for ch in h)
    return to_ramp(int(h[0:2], 16), int(h[2:4], 16), int(h[4:6], 16))


def rgba_repl(m: re.Match) -> str:
    r, g, b, a = m.group(1), m.group(2), m.group(3), m.group(4)
    c = to_ramp(int(r), int(g), int(b))
    return f"rgba({int(c[1:3],16)},{int(c[3:5],16)},{int(c[5:7],16)},{a})"


def tone(svg: str) -> str:
    svg = re.sub(r"#([0-9a-fA-F]{6}|[0-9a-fA-F]{3})\b", hex_repl, svg)
    svg = re.sub(r"rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)", rgba_repl, svg)
    return svg


if __name__ == "__main__":
    folder = os.path.join(os.path.dirname(__file__), "..", "public", "img")
    files = sorted(glob.glob(os.path.join(folder, "*.svg")))
    for f in files:
        with open(f) as fh:
            s = fh.read()
        with open(f, "w") as fh:
            fh.write(tone(s))
    print(f"toned {len(files)} illustrations")
