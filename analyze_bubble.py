#!/usr/bin/env python3
"""
Analyse ciblée de la zone bulle seulement
"""
import os
from PIL import Image
import numpy as np

OUT_DIR = r"C:/Users/rolla/Desktop/Img_Convert"

# Ouvrir les images
real_desk = Image.open(os.path.join(OUT_DIR, "propo-7-real-bulle-organique-desktop.webp")).convert("RGBA")
ref_desk = Image.open(os.path.join(OUT_DIR, "propo-6-bulle-organique-desktop.webp")).convert("RGBA")
real_mob = Image.open(os.path.join(OUT_DIR, "propo-7-real-bulle-organique-mobile.webp")).convert("RGBA")
ref_mob = Image.open(os.path.join(OUT_DIR, "propo-6-bulle-organique-mobile.webp")).convert("RGBA")

print("=== TAILLES ===")
print(f"Real Desktop: {real_desk.size}")
print(f"Ref Desktop:  {ref_desk.size}")
print(f"Real Mobile:  {real_mob.size}")
print(f"Ref Mobile:   {ref_mob.size}")

# Coordonnées connues du panel (CSS px) et DPR=1
# Desktop: panel x=152, y=3987, w=1120, h=560
# La bulle est dans la grille 40/60, justifiée au centre de la colonne gauche
# Colonne gauche = 40% de 1120 = ~448px, bulle max 420px centrée -> left ~152 + (448-420)/2 = ~166
# Mais le panel a gap, donc plus complexe. Utilisons les coords du section crop.

# Le section crop desktop commence à x=0 (section x=0) avec padding 20
# Section x=0, width=1424. Panel x=152 relatif à section.
# Dans le crop: panel_left = 152 + 20 = 172
# Bulle centrée dans colonne gauche (40% de panel = 448px), bulle 420px
# bubble_left_in_panel = (448 - 420) / 2 = 14px
# bubble_left_in_crop = 172 + 14 = 186
# bubble_top_in_panel = 0 (align-items: start) + gap? Le panel a gap clamp(1.5rem, 5vw, 4rem)
# Sur desktop 1440px, 5vw = 72px, gap = 72px
# bubble_top_in_crop = 20 (padding) + 72 (gap?) = ~92

# En fait, le panel a align-items: start et grid-template-rows: auto auto
# La bulle est dans grid-area media, le texte dans body, bouton dans actions
# La bulle commence au top du panel

# Simplifions: cropons la zone bulle connue
# Desktop: panel à x=172 dans le crop, width=1120. Bulle à gauche, ~420px de large
# Zone bulle approx: x=172 à 172+448=620, y=20 à 20+420=440

def crop_bubble_area(img, name, left, top, right, bottom):
    cropped = img.crop((left, top, right, bottom))
    arr = np.array(cropped)
    alpha = arr[:, :, 3]
    
    non_transparent = np.where(alpha > 10)
    if len(non_transparent[0]) == 0:
        print(f"{name}: Aucune pixel visible dans la zone")
        return
    
    y_min, y_max = non_transparent[0].min(), non_transparent[0].max()
    x_min, x_max = non_transparent[1].min(), non_transparent[1].max()
    
    print(f"{name}: Zone bulle crop ({left},{top})-({right},{bottom})")
    print(f"  Contenu non-transparent: x={x_min}-{x_max} ({x_max-x_min}px), y={y_min}-{y_max} ({y_max-y_min}px)")
    
    # Diamètre estimé
    diameter_x = x_max - x_min
    diameter_y = y_max - y_min
    print(f"  Diamètre estimé: {diameter_x}x{diameter_y}px")
    
    # Centre
    cx = (x_min + x_max) // 2
    cy = (y_min + y_max) // 2
    print(f"  Centre relatif: ({cx}, {cy})")
    
    # Vérifier la forme organique - échantillonner le bord
    # Le border-radius organique devrait créer une forme non-circulaire
    return diameter_x, diameter_y, cx, cy

print("\n=== ANALYSE BULLE DESKTOP (zone estimée) ===")
# Crop desktop: section x=0-1424+40padding, panel à x=152+20=172
# Bulle dans colonne gauche 40% = 448px, centrée -> x=172+14=186 à 186+420=606
# y=20 (padding) à 20+420=440
crop_bubble_area(real_desk, "Real Desktop", 186, 20, 606, 440)
crop_bubble_area(ref_desk, "Ref Desktop", 33, 98, 482, 555)  # d'après analyse précédente

print("\n=== ANALYSE BULLE MOBILE (zone estimée) ===")
# Mobile: section x=0-500+40padding, panel à x=20+20=40, width=460
# Bulle centrée, diamètre min(76vw, 320px). 76vw = 0.76*390 = 296px, max 320 -> 296px
# Centrée: left = 40 + (460-296)/2 = 40+82 = 122, right = 122+296 = 418
# y=20 (padding) à 20+296 = 316
crop_bubble_area(real_mob, "Real Mobile", 122, 20, 418, 316)
crop_bubble_area(ref_mob, "Ref Mobile", 24, 61, 382, 397)  # d'après analyse précédente

# Comparaison plus fine: redimensionner les zones bulle à même taille et comparer
def compare_bubble_crops(img1, img2, box1, box2, name):
    crop1 = img1.crop(box1).resize((400, 400), Image.LANCZOS)
    crop2 = img2.crop(box2).resize((400, 400), Image.LANCZOS)
    
    arr1 = np.array(crop1).astype(float)
    arr2 = np.array(crop2).astype(float)
    
    # Masquer les zones transparentes
    mask1 = arr1[:, :, 3] > 10
    mask2 = arr2[:, :, 3] > 10
    mask = mask1 & mask2
    
    if np.sum(mask) == 0:
        print(f"{name}: Pas de chevauchement opaque")
        return
    
    diff = np.mean(np.abs(arr1[mask, :3] - arr2[mask, :3]))
    max_diff = np.max(np.abs(arr1[mask, :3] - arr2[mask, :3]))
    pct_diff = np.sum(np.any(np.abs(arr1[:, :, :3] - arr2[:, :, :3]) > 5, axis=2)) / (400*400) * 100
    
    print(f"{name}: Diff moy={diff:.2f}/255, Max={max_diff:.0f}/255, {pct_diff:.1f}% pixels différents (zone chevauchante)")

print("\n=== COMPARAISON ZONES BULLE ===")
compare_bubble_crops(real_desk, ref_desk, (186, 20, 606, 440), (33, 98, 482, 555), "Desktop bulle")
compare_bubble_crops(real_mob, ref_mob, (122, 20, 418, 316), (24, 61, 382, 397), "Mobile bulle")

# Sauvegarder les crops bulle pour inspection visuelle
real_desk.crop((186, 20, 606, 440)).save(os.path.join(OUT_DIR, "debug_real_desk_bubble.webp"))
ref_desk.crop((33, 98, 482, 555)).save(os.path.join(OUT_DIR, "debug_ref_desk_bubble.webp"))
real_mob.crop((122, 20, 418, 316)).save(os.path.join(OUT_DIR, "debug_real_mob_bubble.webp"))
ref_mob.crop((24, 61, 382, 397)).save(os.path.join(OUT_DIR, "debug_ref_mob_bubble.webp"))
print("\nCrops bulle sauvegardés pour inspection visuelle.")