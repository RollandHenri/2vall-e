#!/usr/bin/env python3
"""
Analyse détaillée des captures : mesures précises + comparaison avec références
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

def analyze_bubble(img, name):
    """Analyser la bulle : trouver le cercle organique"""
    arr = np.array(img)
    h, w = arr.shape[:2]
    
    # Trouver les pixels non transparents (alpha > 0)
    alpha = arr[:, :, 3]
    non_transparent = np.where(alpha > 0)
    
    if len(non_transparent[0]) == 0:
        print(f"{name}: Aucune pixel visible")
        return
    
    y_min, y_max = non_transparent[0].min(), non_transparent[0].max()
    x_min, x_max = non_transparent[1].min(), non_transparent[1].max()
    
    print(f"{name}: Bounding box contenu: x={x_min}-{x_max} ({x_max-x_min}px), y={y_min}-{y_max} ({y_max-y_min}px)")
    
    # Chercher la bulle (zone circulaire à gauche sur desktop, centrée sur mobile)
    # On cherche une zone dense de pixels non-transparents qui forme un cercle
    
    # Analyser les colonnes pour trouver la bulle
    col_density = np.sum(alpha > 0, axis=0)
    row_density = np.sum(alpha > 0, axis=1)
    
    # Pic de densité = centre de la bulle
    bubble_center_x = np.argmax(col_density)
    bubble_center_y = np.argmax(row_density)
    bubble_width = col_density[bubble_center_x]
    bubble_height = row_density[bubble_center_y]
    
    print(f"  Centre bulle estimé: ({bubble_center_x}, {bubble_center_y})")
    print(f"  Largeur bulle (densité max): {bubble_width}px")
    print(f"  Hauteur bulle (densité max): {bubble_height}px")
    
    # Estimer le diamètre en cherchant où la densité tombe
    # Côté gauche
    left = bubble_center_x
    while left > 0 and col_density[left] > bubble_width * 0.1:
        left -= 1
    right = bubble_center_x
    while right < w - 1 and col_density[right] > bubble_width * 0.1:
        right += 1
    top = bubble_center_y
    while top > 0 and row_density[top] > bubble_height * 0.1:
        top -= 1
    bottom = bubble_center_y
    while bottom < h - 1 and row_density[bottom] > bubble_height * 0.1:
        bottom += 1
    
    est_diameter_x = right - left
    est_diameter_y = bottom - top
    print(f"  Diamètre estimé X: {est_diameter_x}px, Y: {est_diameter_y}px")
    print(f"  Position bulle: left={left}, right={right}, top={top}, bottom={bottom}")

print("\n=== ANALYSE DESKTOP ===")
analyze_bubble(real_desk, "Real Desktop")
analyze_bubble(ref_desk, "Ref Desktop")

print("\n=== ANALYSE MOBILE ===")
analyze_bubble(real_mob, "Real Mobile")
analyze_bubble(ref_mob, "Ref Mobile")

# Comparaison pixel par pixel (différence)
def compare_images(img1, img2, name):
    # Redimensionner au même taille si différent
    if img1.size != img2.size:
        img2 = img2.resize(img1.size, Image.LANCZOS)
    
    arr1 = np.array(img1).astype(float)
    arr2 = np.array(img2).astype(float)
    
    # Différence absolue moyenne sur les canaux RGB (ignorer alpha pour la comparaison)
    diff = np.mean(np.abs(arr1[:, :, :3] - arr2[:, :, :3]))
    max_diff = np.max(np.abs(arr1[:, :, :3] - arr2[:, :, :3]))
    
    # Pourcentage de pixels différents (seuil 5/255)
    diff_mask = np.any(np.abs(arr1[:, :, :3] - arr2[:, :, :3]) > 5, axis=2)
    pct_diff = np.sum(diff_mask) / diff_mask.size * 100
    
    print(f"{name}: Diff moy={diff:.2f}/255, Max={max_diff:.0f}/255, {pct_diff:.1f}% pixels différents")

print("\n=== COMPARAISON ===")
compare_images(real_desk, ref_desk, "Desktop")
compare_images(real_mob, ref_mob, "Mobile")