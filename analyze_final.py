#!/usr/bin/env python3
"""
Analyse finale des captures panel-only
"""
import os
from PIL import Image
import numpy as np

OUT_DIR = r"C:/Users/rolla/Desktop/Img_Convert"

real_desk = Image.open(os.path.join(OUT_DIR, "propo-7-real-bulle-organique-desktop.webp")).convert("RGBA")
ref_desk = Image.open(os.path.join(OUT_DIR, "propo-6-bulle-organique-desktop.webp")).convert("RGBA")
real_mob = Image.open(os.path.join(OUT_DIR, "propo-7-real-bulle-organique-mobile.webp")).convert("RGBA")
ref_mob = Image.open(os.path.join(OUT_DIR, "propo-6-bulle-organique-mobile.webp")).convert("RGBA")

print("=== TAILLES CAPTURES ===")
print(f"Real Desktop: {real_desk.size} (panel 1120x560 + 30px padding)")
print(f"Ref Desktop:  {ref_desk.size}")
print(f"Real Mobile:  {real_mob.size} (panel 460x857 + 30px padding)")
print(f"Ref Mobile:   {ref_mob.size}")

# Coordonnées dans le crop (avec padding 30px)
# Desktop: panel à x=30, y=30, taille 1120x560
# Bubble: x=30+14=44 (166-152), y=30+28=58 (4015-3987), taille 420x560
# Media: même que bubble
# Mobile: panel à x=30, y=30, taille 460x857
# Bubble: x=30+0=30 (20-20), y=30+28=58 (3506-3478), taille 420x420
# Media: x=30, y=58, taille 420x262.5

def analyze_region(img, name, left, top, right, bottom):
    cropped = img.crop((left, top, right, bottom))
    arr = np.array(cropped)
    alpha = arr[:, :, 3]
    
    non_transparent = np.where(alpha > 10)
    if len(non_transparent[0]) == 0:
        print(f"{name}: Vide")
        return
    
    y_min, y_max = non_transparent[0].min(), non_transparent[0].max()
    x_min, x_max = non_transparent[1].min(), non_transparent[1].max()
    
    w = x_max - x_min + 1
    h = y_max - y_min + 1
    print(f"{name}: zone ({left},{top})-({right},{bottom}) -> contenu {w}x{h}px à ({x_min},{y_min})-({x_max},{y_max})")
    
    # Vérifier forme (carré vs rectangle)
    ratio = w / h if h > 0 else 0
    print(f"  Ratio W/H: {ratio:.2f} {'(carré)' if 0.95 < ratio < 1.05 else '(rectangle)'}")
    
    return w, h, x_min, y_min, x_max, y_max

print("\n=== DESKTOP: BULLE (attendu 420x420, réel 420x560) ===")
analyze_region(real_desk, "Real Desktop Bubble", 44, 58, 44+420, 58+560)
analyze_region(ref_desk, "Ref Desktop Bubble", 30, 30, 30+450, 30+450)  # approx

print("\n=== DESKTOP: MEDIA (image dans bulle) ===")
analyze_region(real_desk, "Real Desktop Media", 44, 58, 44+420, 58+560)

print("\n=== DESKTOP: TEXTE (colonne droite, ~60% panel = 672px, après gap 72px) ===")
# Panel: 1120px, 40% = 448px (col gauche), gap ~72px, col droite = 600px
# Dans crop: panel commence x=30, col gauche 0-448, gap 448-520, col droite 520-1120
# Texte dans col droite, aligné gauche
analyze_region(real_desk, "Real Desktop Texte", 30+520, 58, 30+1120, 58+560)

print("\n=== MOBILE: BULLE (attendu ~296px, max 320px, réel 420x420) ===")
analyze_region(real_mob, "Real Mobile Bubble", 30, 58, 30+420, 58+420)
analyze_region(ref_mob, "Ref Mobile Bubble", 30, 30, 30+360, 30+360)  # approx

print("\n=== MOBILE: MEDIA (dans bulle, attendu 420x420, réel 420x262.5) ===")
analyze_region(real_mob, "Real Mobile Media", 30, 58, 30+420, 58+262)

print("\n=== MOBILE: TEXTE (sous bulle, aligné gauche) ===")
# Bulle bottom à y=58+420=478, gap ~20px, texte à partir de y=500
analyze_region(real_mob, "Real Mobile Texte", 30, 500, 30+460, 58+857)

# Comparaison visuelle bulle
def compare_bubble(img1, img2, box1, box2, name):
    crop1 = img1.crop(box1).resize((400, 400), Image.LANCZOS)
    crop2 = img2.crop(box2).resize((400, 400), Image.LANCZOS)
    
    arr1 = np.array(crop1).astype(float)
    arr2 = np.array(crop2).astype(float)
    
    mask1 = arr1[:, :, 3] > 10
    mask2 = arr2[:, :, 3] > 10
    mask = mask1 & mask2
    
    if np.sum(mask) > 0:
        diff = np.mean(np.abs(arr1[mask, :3] - arr2[mask, :3]))
        print(f"{name}: Diff moy={diff:.1f}/255 sur zone chevauchante")
    else:
        print(f"{name}: Pas de chevauchement opaque")

print("\n=== COMPARAISON BULLE ===")
compare_bubble(real_desk, ref_desk, (44, 58, 464, 618), (30, 30, 480, 480), "Desktop")
compare_bubble(real_mob, ref_mob, (30, 58, 450, 478), (30, 30, 390, 390), "Mobile")

# Sauvegarder crops pour inspection
real_desk.crop((44, 58, 464, 618)).save(os.path.join(OUT_DIR, "debug_real_desk_bubble.webp"))
real_mob.crop((30, 58, 450, 478)).save(os.path.join(OUT_DIR, "debug_real_mob_bubble.webp"))
print("\nCrops bulle sauvegardés.")