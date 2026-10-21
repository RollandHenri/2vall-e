#!/usr/bin/env python3
"""
Generate 4 WebP proposals with different border-radius styles for pro.webp
Target: 1200 x 1035 px (4/3 ratio + 15% height)
Output: C:/Users/rolla/Desktop/Img_Convert/propo-{1,2,3,4}-*.webp
"""

from PIL import Image, ImageDraw, ImageFilter
import os

SRC = r"C:/Users/rolla/Desktop/Dev_26/_Test_/T_Camp_Craw/assets/img/pro.webp"
OUT_DIR = r"C:/Users/rolla/Desktop/Img_Convert"
TARGET_W, TARGET_H = 1200, 1035

def load_and_prepare():
    img = Image.open(SRC).convert("RGBA")
    # Resize to cover target (crop center)
    img_ratio = img.width / img.height
    target_ratio = TARGET_W / TARGET_H
    if img_ratio > target_ratio:
        # Image wider: fit height, crop width
        new_h = TARGET_H
        new_w = int(TARGET_H * img_ratio)
    else:
        # Image taller: fit width, crop height
        new_w = TARGET_W
        new_h = int(TARGET_W / img_ratio)
    img = img.resize((new_w, new_h), Image.LANCZOS)
    # Center crop
    left = (new_w - TARGET_W) // 2
    top = (new_h - TARGET_H) // 2
    img = img.crop((left, top, left + TARGET_W, top + TARGET_H))
    return img

def apply_rounded_corners(img, radii_tl, radii_tr, radii_br, radii_bl):
    """Apply elliptical rounded corners. Each radius is (rx, ry) in pixels."""
    mask = Image.new("L", img.size, 0)
    draw = ImageDraw.Draw(mask)
    w, h = img.size
    # Draw rounded rectangle using 4 ellipses + rectangles
    # Top-left
    draw.pieslice([0, 0, 2*radii_tl[0], 2*radii_tl[1]], 180, 270, fill=255)
    # Top-right
    draw.pieslice([w - 2*radii_tr[0], 0, w, 2*radii_tr[1]], 270, 360, fill=255)
    # Bottom-right
    draw.pieslice([w - 2*radii_br[0], h - 2*radii_br[1], w, h], 0, 90, fill=255)
    # Bottom-left
    draw.pieslice([0, h - 2*radii_bl[0], 2*radii_bl[0], h], 90, 180, fill=255)
    # Fill center rectangles
    draw.rectangle([radii_tl[0], 0, w - radii_tr[0], h], fill=255)
    draw.rectangle([0, radii_tl[1], w, h - radii_bl[1]], fill=255)
    # Apply mask
    img.putalpha(mask)
    return img

def apply_arch(img):
    """L'Arche: top corners as semi-ellipse (50% width, 30% height), bottom sharp"""
    w, h = img.size
    rx = w // 2
    ry = int(h * 0.30)
    return apply_rounded_corners(img, (rx, ry), (rx, ry), (0, 0), (0, 0))

def apply_diagonal(img):
    """La Diagonale: top-right and bottom-left at 30%, others sharp"""
    w, h = img.size
    r = int(min(w, h) * 0.30)
    return apply_rounded_corners(img, (0, 0), (r, r), (0, 0), (r, r))

def apply_galet(img):
    """Le Galet: organic squircle - elliptical corners 22%/28%"""
    w, h = img.size
    rx = int(w * 0.22)
    ry = int(h * 0.28)
    return apply_rounded_corners(img, (rx, ry), (rx, ry), (rx, ry), (rx, ry))

def apply_petale(img):
    """Le Pétale: bottom-right at 50% (circle), others minimal 4px"""
    w, h = img.size
    r = min(w, h) // 2
    return apply_rounded_corners(img, (4, 4), (4, 4), (r, r), (4, 4))

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    base = load_and_prepare()
    
    proposals = [
        ("propo-1-arche.webp", apply_arch, "L'Arche"),
        ("propo-2-diagonale.webp", apply_diagonal, "La Diagonale"),
        ("propo-3-galet.webp", apply_galet, "Le Galet"),
        ("propo-4-petale.webp", apply_petale, "Le Pétale"),
    ]
    
    for fname, fn, label in proposals:
        img = base.copy()
        img = fn(img)
        out_path = os.path.join(OUT_DIR, fname)
        img.save(out_path, "WEBP", quality=90, method=6)
        print(f"OK {label} -> {fname} ({img.size[0]}x{img.size[1]})")
    
    # Generate README.md
    readme = """# 4 Propositions de radius pour pro.webp

Taille cible : **1200 x 1035 px** (ratio 4/3 + 15% hauteur)

| # | Fichier | Style | CSS equivalent |
|---|---------|-------|----------------|
| 1 | `propo-1-arche.webp` | **L'Arche** - coins hauts en plein cintre, bas droits | `border-radius: 50% 50% 0 0 / 30% 30% 0 0` |
| 2 | `propo-2-diagonale.webp` | **La Diagonale** - deux coins opposés arrondis (30%) | `border-radius: 0 30% 0 30%` |
| 3 | `propo-3-galet.webp` | **Le Galet** - squircle organique, 4 coins elliptiques | `border-radius: 22% / 28%` |
| 4 | `propo-4-petale.webp` | **Le Pétale** - un seul coin a 50%, signature minimale | `border-radius: 4px 4px 4px 50%` |

**Remplacement dans le CSS :**
```css
.history__media {
  /* Remplace border-radius: var(--radius); par l'un des ci-dessus */
  aspect-ratio: 80 / 69;  /* 4/3 + 15% hauteur */
}
```
"""
    with open(os.path.join(OUT_DIR, "README.md"), "w", encoding="utf-8") as f:
        f.write(readme)
    print("OK README.md generated")

if __name__ == "__main__":
    main()