#!/usr/bin/env python3
"""
Analyse complète du layout : grille, positions, texte, bouton
"""
import os
from PIL import Image
import numpy as np

OUT_DIR = r"C:/Users/rolla/Desktop/Img_Convert"

real_desk = Image.open(os.path.join(OUT_DIR, "propo-7-real-bulle-organique-desktop.webp")).convert("RGBA")
real_mob = Image.open(os.path.join(OUT_DIR, "propo-7-real-bulle-organique-mobile.webp")).convert("RGBA")

arr_desk = np.array(real_desk)
arr_mob = np.array(real_mob)

alpha_desk = arr_desk[:, :, 3]
alpha_mob = arr_mob[:, :, 3]

h_desk, w_desk = alpha_desk.shape
h_mob, w_mob = alpha_mob.shape

print(f"Desktop crop: {w_desk}x{h_desk}")
print(f"Mobile crop:  {w_mob}x{h_mob}")

# ===== DESKTOP LAYOUT ANALYSIS =====
print("\n=== DESKTOP LAYOUT ===")

# Trouver les colonnes de contenu (densité verticale)
col_density = np.sum(alpha_desk > 10, axis=0)
row_density = np.sum(alpha_desk > 10, axis=1)

# Identifier la bulle (zone dense à gauche, carrée ~420px)
# Colonne gauche du panel: x=172 à 172+448=620 dans le crop
# Mais le crop commence à section x=0+20padding
# Panel à x=152+20=172
# Grille 40/60: col1 = 40% de 1120 = 448px, col2 = 672px
# Bulle centrée dans col1: x=172 + (448-420)/2 = 186 à 606

# Vérifier la séparation bulle/texte
# Chercher où la densité change (bord droit de la bulle)
bubble_right = 0
for x in range(600, 172, -1):
    if col_density[x] < 100:  # peu de contenu
        bubble_right = x
        break
print(f"Bord droit bulle estimé: x={bubble_right}")

# Colonne texte commence après gap
# Gap = clamp(1.5rem, 5vw, 4rem) = 5vw = 72px sur 1440px
text_left = bubble_right + 72
print(f"Début colonne texte estimé: x={text_left}")

# Vérifier présence de texte à droite
text_region_density = np.sum(col_density[text_left:text_left+600])
print(f"Densité colonne texte (600px): {text_region_density}")

# Vérifier alignement vertical: bulle top vs texte top
# Bulle top = padding 20
# Texte top = padding 20 + 1.5rem (24px) = 44px environ
# Le panel a align-items: start, grid-template-areas: "media body" / "media actions"
# Donc body et actions alignés au top de media

# Analyser les lignes pour trouver le badge, titre, paragraphes, bouton
# Chercher des bandes horizontales de densité (lignes de texte)
print("\nAnalyse lignes (densité horizontale):")
for y in range(0, h_desk, 50):
    if row_density[y] > 200:
        print(f"  y={y}: densité={row_density[y]}")

# ===== MOBILE LAYOUT ANALYSIS =====
print("\n=== MOBILE LAYOUT ===")
col_density_m = np.sum(alpha_mob > 10, axis=0)
row_density_m = np.sum(alpha_mob > 10, axis=1)

# Mobile: bulle centrée, diamètre ~296px
# Panel width = 460px, section padding 20, panel x=20+20=40
# Bulle centrée: left = 40 + (460-296)/2 = 122, right = 418
# Texte en dessous, aligné gauche (text-align: left sur .history__body)
# Bouton centré (justify-content: center sur .swap-panel__actions)

# Vérifier bulle centrée
bubble_center_x = np.argmax(col_density_m)
print(f"Centre bulle horizontal: x={bubble_center_x} (attendu ~260 au centre du crop 540/2=270)")

# Vérifier que le texte est SOUS la bulle (y > bulle_bottom)
# Bulle top ~20, hauteur ~296 -> bottom ~316
# Texte devrait commencer vers y=316 + gap
bubble_bottom = 0
for y in range(316, h_mob):
    if row_density_m[y] < 50:
        bubble_bottom = y
        break
print(f"Bas bulle estimé: y={bubble_bottom}")

# Vérifier présence texte après bulle
text_region_y = bubble_bottom + 20  # gap
if text_region_y < h_mob:
    text_density = row_density_m[text_region_y:text_region_y+200].sum()
    print(f"Densité zone texte (sous bulle): {text_density}")

# Vérifier pas de débordement horizontal
# Largeur max du contenu non-transparent
non_zero_cols = np.where(col_density_m > 10)[0]
if len(non_zero_cols) > 0:
    content_width = non_zero_cols[-1] - non_zero_cols[0]
    print(f"Largeur contenu horizontal: {content_width}px (crop width: {w_mob}px)")
    if content_width < w_mob * 0.95:
        print("  OK: Pas de débordement horizontal apparent")
    else:
        print("  ATTENTION: Contenu près des bords")

# ===== VÉRIFICATION OM BRE =====
print("\n=== VÉRIFICATION OM BRE (shadow) ===")
# L'ombre est sur .history__media: box-shadow: var(--shadow)
# var(--shadow) = rgba(29, 59, 45, 0.12) 0px 12px 40px 0px
# Cela crée un halo flou sous la bulle
# Vérifier s'il y a des pixels semi-transparents autour de la bulle

# Échantillonner autour de la bulle desktop
bubble_cx = 186 + 210  # centre bulle ~209 dans crop bulle + offset 186
bubble_cy = 20 + 209
print(f"Centre bulle desktop dans crop: ({bubble_cx}, {bubble_cy})")

# Vérifier pixels autour (zone d'ombre)
shadow_region = alpha_desk[bubble_cy+200:bubble_cy+250, bubble_cx-100:bubble_cx+100]
shadow_pixels = np.sum(shadow_region > 10)
print(f"Pixels ombre potentielle sous bulle: {shadow_pixels}")

# ===== SAUVEGARDE DEBUG ANNOTÉ =====
from PIL import ImageDraw

def annotate_layout(img, name, annotations):
    """Ajouter des repères visuels"""
    annotated = img.convert("RGBA")
    draw = ImageDraw.Draw(annotated)
    for ann in annotations:
        if ann['type'] == 'rect':
            draw.rectangle(ann['coords'], outline=ann['color'], width=2)
        elif ann['type'] == 'line':
            draw.line(ann['coords'], fill=ann['color'], width=2)
        elif ann['type'] == 'text':
            draw.text(ann['pos'], ann['text'], fill=ann['color'])
    annotated.save(os.path.join(OUT_DIR, f"debug_{name}_annotated.webp"))

# Desktop annotations
desk_annotations = [
    {'type': 'rect', 'coords': (186, 20, 606, 440), 'color': 'red'},  # Zone bulle
    {'type': 'rect', 'coords': (172, 20, 172+1120, 20+560), 'color': 'blue'},  # Panel
    {'type': 'line', 'coords': (172+448, 20, 172+448, 20+560), 'color': 'green'},  # Séparation 40/60
    {'type': 'line', 'coords': (172+448+72, 20, 172+448+72, 20+560), 'color': 'yellow'},  # Début texte après gap
]
annotate_layout(real_desk, "desk_layout", desk_annotations)

# Mobile annotations
mob_annotations = [
    {'type': 'rect', 'coords': (122, 20, 418, 316), 'color': 'red'},  # Zone bulle
    {'type': 'rect', 'coords': (40, 20, 40+460, 20+857), 'color': 'blue'},  # Panel
    {'type': 'line', 'coords': (270, 0, 270, h_mob), 'color': 'green'},  # Centre horizontal
]
annotate_layout(real_mob, "mob_layout", mob_annotations)

print("\nImages annotées sauvegardées pour inspection visuelle.")