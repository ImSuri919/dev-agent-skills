#!/usr/bin/env python3
"""Generate simple launcher PNGs without external Python packages."""

import math
import os
import struct
import zlib

RES = os.path.join(os.path.dirname(__file__), "app", "src", "main", "res")
SIZES = {
    "mipmap-mdpi": 48,
    "mipmap-hdpi": 72,
    "mipmap-xhdpi": 96,
    "mipmap-xxhdpi": 144,
    "mipmap-xxxhdpi": 192,
}

BG = (11, 16, 32, 255)
CYAN = (34, 211, 238, 255)
PURPLE = (167, 139, 250, 255)
SHAPES = [
    ((14, 10, 34, 15), CYAN),
    ((14, 15, 19, 24), CYAN),
    ((19, 22, 33, 27), CYAN),
    ((29, 27, 34, 36), CYAN),
    ((14, 33, 34, 38), CYAN),
    ((36, 22, 40, 26), PURPLE),
]


def chunk(kind, data):
    return (
        struct.pack(">I", len(data))
        + kind
        + data
        + struct.pack(">I", zlib.crc32(kind + data) & 0xFFFFFFFF)
    )


def write_png(path, size, round_icon=False):
    scale = size / 48.0
    rows = []
    for y in range(size):
        row = bytearray()
        for x in range(size):
            if round_icon and math.hypot(x + 0.5 - size / 2, y + 0.5 - size / 2) > size / 2 - scale:
                row.extend((0, 0, 0, 0))
                continue
            color = BG
            for (x1, y1, x2, y2), shape_color in SHAPES:
                if x1 * scale <= x < x2 * scale and y1 * scale <= y < y2 * scale:
                    color = shape_color
            row.extend(color)
        rows.append(bytes(row))
    raw = b"".join(b"\x00" + row for row in rows)
    png = (
        b"\x89PNG\r\n\x1a\n"
        + chunk(b"IHDR", struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0))
        + chunk(b"IDAT", zlib.compress(raw, 9))
        + chunk(b"IEND", b"")
    )
    with open(path, "wb") as handle:
        handle.write(png)


for folder, size in SIZES.items():
    directory = os.path.join(RES, folder)
    os.makedirs(directory, exist_ok=True)
    write_png(os.path.join(directory, "ic_launcher.png"), size)
    write_png(os.path.join(directory, "ic_launcher_round.png"), size, round_icon=True)
    print(f"{folder}: {size}px")
