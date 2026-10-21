#!/usr/bin/env python3
"""
Capture réelle de la section #decouvrir (panneau histoire) depuis index.html
Desktop 1440px et Mobile 390px - comparaison avec propo-6-bulle-organique-*.webp
"""
import os
import io
import time
import base64
from PIL import Image
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

OUT_DIR = r"C:/Users/rolla/Desktop/Img_Convert"
INDEX_HTML = r"C:/Users/rolla/Desktop/Dev_26/_Test_/T_Camp_Craw/index.html"

CAPTURES = [
    ("propo-7-real-bulle-organique-desktop.webp", 1440, 900),
    ("propo-7-real-bulle-organique-mobile.webp", 390, 844),
]

def setup_driver(width, height):
    opts = Options()
    opts.add_argument("--headless=new")
    opts.add_argument(f"--window-size={width},{height}")
    opts.add_argument("--force-device-scale-factor=1")
    opts.add_argument("--disable-gpu")
    opts.add_argument("--hide-scrollbars")
    opts.add_argument("--no-sandbox")
    opts.add_argument("--disable-dev-shm-usage")
    opts.add_argument("--enable-transparent-visuals")
    opts.add_argument("--disable-background-mode")
    opts.add_argument("--run-all-compositor-stages-before-draw")
    return webdriver.Chrome(options=opts)

def capture_section(driver, url, width, height, out_path):
    driver.get(url)
    
    wait = WebDriverWait(driver, 15)
    
    # Debug: check page title and URL
    print(f"  Page title: {driver.title}")
    print(f"  Current URL: {driver.current_url}")
    
    # Attendre que l'image pro.webp soit chargée - essayer plusieurs sélecteurs
    selectors = [
        ".history__media.img--history",
        ".swap-panel[data-panel=\"histoire\"] .history__media",
        "img[src*=\"pro.webp\"]",
        ".history__bubble img"
    ]
    
    img_el = None
    for sel in selectors:
        try:
            img_el = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, sel)))
            print(f"  Found image with selector: {sel}")
            break
        except:
            continue
    
    if not img_el:
        raise Exception("Image not found with any selector")
    
    # Debug: check image src
    src = img_el.get_attribute("src")
    print(f"  Image src: {src}")
    
    # Forcer le chargement de l'image (retirer lazy loading)
    driver.execute_script("arguments[0].loading = 'eager'; arguments[0].removeAttribute('loading');", img_el)
    # Attendre le chargement complet de l'image via naturalWidth
    wait.until(lambda d: driver.execute_script("return arguments[0].naturalWidth > 0;", img_el))
    print(f"  Image loaded: naturalWidth={driver.execute_script('return arguments[0].naturalWidth;', img_el)}")
    time.sleep(0.5)
    
    # Scroll vers la section #decouvrir
    section = driver.find_element(By.ID, "decouvrir")
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", section)
    time.sleep(0.5)  # laisser le temps au scroll et aux animations
    
    # Cibler le panneau actif (histoire)
    panel = driver.find_element(By.CSS_SELECTOR, '.swap-panel[data-panel="histoire"].is-active')
    
    # Vérifier les styles calculés pour debug
    bubble = driver.find_element(By.CSS_SELECTOR, '.history__bubble')
    bubble_styles = driver.execute_script("""
        const el = arguments[0];
        const cs = window.getComputedStyle(el);
        const before = window.getComputedStyle(el, '::before');
        return {
            width: cs.width,
            height: cs.height,
            maxWidth: cs.maxWidth,
            aspectRatio: cs.aspectRatio,
            borderRadius: cs.borderRadius,
            beforeBorderRadius: before.borderRadius,
            beforeInset: before.inset,
            beforeBorder: before.border,
            boxShadow: cs.boxShadow,
        };
    """, bubble)
    print(f"  Bubble styles: {bubble_styles}")
    
    media = driver.find_element(By.CSS_SELECTOR, '.history__media.img--history')
    media_styles = driver.execute_script("""
        const el = arguments[0];
        const cs = window.getComputedStyle(el);
        return {
            width: cs.width,
            height: cs.height,
            borderRadius: cs.borderRadius,
            objectFit: cs.objectFit,
            boxShadow: cs.boxShadow,
        };
    """, media)
    print(f"  Media styles: {media_styles}")
    
    # Vérifier le layout du panneau (boundingClientRect)
    panel_rect = driver.execute_script("""
        const el = arguments[0];
        const rect = el.getBoundingClientRect();
        return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
    """, panel)
    print(f"  Panel rect (CSS px): {panel_rect}")
    
    # Vérifier le layout de la bulle
    bubble_rect = driver.execute_script("""
        const el = arguments[0];
        const rect = el.getBoundingClientRect();
        return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
    """, bubble)
    print(f"  Bubble rect (CSS px): {bubble_rect}")
    
    # Vérifier le layout du media (image)
    media_rect = driver.execute_script("""
        const el = arguments[0];
        const rect = el.getBoundingClientRect();
        return {x: rect.x, y: rect.y, width: rect.width, height: rect.height};
    """, media)
    print(f"  Media rect (CSS px): {media_rect}")
    
    # Utiliser CDP pour capturer la page complète avec transparence
    result = driver.execute_cdp_cmd("Page.captureScreenshot", {
        "format": "png",
        "captureBeyondViewport": True,
        "fromSurface": True
    })
    
    png_data = base64.b64decode(result["data"])
    full_img = Image.open(io.BytesIO(png_data)).convert("RGBA")
    
    # Calculer les coordonnées du PANNEAU avec devicePixelRatio
    # Ajouter padding pour l'anneau ::before (14px en dehors de la bulle)
    # La bulle est dans le panel, l'anneau dépasse de 14px
    dpr = driver.execute_script("return window.devicePixelRatio;")
    
    # Padding pour capturer l'anneau (14px) + marge de sécurité
    padding = int(30 * dpr)
    left = int(max(0, panel_rect['x'] * dpr) - padding)
    top = int(max(0, panel_rect['y'] * dpr) - padding)
    right = int(min(full_img.width, (panel_rect['x'] + panel_rect['width']) * dpr) + padding)
    bottom = int(min(full_img.height, (panel_rect['y'] + panel_rect['height']) * dpr) + padding)
    
    cropped = full_img.crop((left, top, right, bottom))
    print(f"  Cropped to panel bounds (+padding): {cropped.size}")
    
    # Fallback chroma-key pour fond blanc/quasi-blanc (sécurité)
    datas = cropped.getdata()
    new_data = []
    for item in datas:
        if item[0] > 250 and item[1] > 250 and item[2] > 250:
            new_data.append((255, 255, 255, 0))
        else:
            new_data.append(item)
    cropped.putdata(new_data)
    
    cropped.save(out_path, "WEBP", quality=90, method=6)
    print(f"  OK {os.path.basename(out_path)} ({cropped.size[0]}x{cropped.size[1]}, mode={cropped.mode})")
    
    # Return panel rect for reporting
    return cropped.size, {"width": panel_rect['width'], "height": panel_rect['height']}, {"x": panel_rect['x'], "y": panel_rect['y']}

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # URL file:// pour le index.html réel
    url = f"file:///{INDEX_HTML.replace(os.sep, '/')}"
    
    results = {}
    
    for fname, width, height in CAPTURES:
        print(f"Capture {fname} ({width}x{height})...")
        driver = setup_driver(width, height)
        try:
            cropped_size, panel_size, panel_location = capture_section(driver, url, width, height, os.path.join(OUT_DIR, fname))
            results[fname] = {
                "cropped_size": cropped_size,
                "panel_size": panel_size,
                "panel_location": panel_location,
                "viewport": (width, height)
            }
        except Exception as e:
            print(f"  ERREUR: {e}")
            import traceback
            traceback.print_exc()
        finally:
            driver.quit()
    
    # Générer le rapport
    generate_report(results)
    
    print("Toutes les captures sont faites.")

def generate_report(results):
    report_path = r"C:\Users\rolla\Desktop\Dev_26\_Test_\T_Camp_Craw\.superpowers\sdd\plan-bulle-organique\visual-report.md"
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Rapport de vérification visuelle — Bulle organique « Notre histoire »\n\n")
        f.write(f"**Date** : {time.strftime('%Y-%m-%d %H:%M')}\n\n")
        
        # Desktop
        desk_key = "propo-7-real-bulle-organique-desktop.webp"
        mob_key = "propo-7-real-bulle-organique-mobile.webp"
        
        f.write("## Desktop 1440px\n\n")
        if desk_key in results:
            r = results[desk_key]
            f.write(f"- **Taille capturée (crop)** : {r['cropped_size'][0]}×{r['cropped_size'][1]} px\n")
            f.write(f"- **Taille panneau (CSS)** : {r['panel_size']['width']}×{r['panel_size']['height']} px\n")
            f.write(f"- **Position panneau** : x={r['panel_location']['x']}, y={r['panel_location']['y']}\n")
            f.write(f"- **Viewport** : {r['viewport'][0]}×{r['viewport'][1]} px\n")
            
            # Vérifications critères
            f.write("\n### Critères de succès\n")
            
            # Bulle organique à gauche, texte à droite (grille 2 colonnes ~40/60)
            f.write("- **Grille 2 colonnes (40/60)** : À vérifier visuellement\n")
            # Diamètre bulle ~420px max (clamp 280-32vw-420px)
            f.write("- **Diamètre bulle ≤ 420px** : À mesurer sur capture (max-width: 420px, aspect-ratio: 1)\n")
            # Anneau décalé 14px visible, border-radius organique
            f.write("- **Anneau 14px + border-radius organique** : `56% 44% 52% 48% / 47% 55% 45% 53%` — À vérifier visuellement\n")
            # Visages + voiturette entièrement dans le cercle
            f.write("- **Cadrage photo (visages + voiturette dans le cercle)** : À vérifier visuellement\n")
            # Ombre var(--shadow) sur la photo
            f.write("- **Ombre var(--shadow)** : À vérifier visuellement\n")
            # Badge + titre + 2 paragraphes + bouton alignés à gauche, commençant au top de la bulle
            f.write("- **Contenu aligné gauche, départ au top de la bulle** : À vérifier visuellement\n")
            # Panneau domaine inchangé
            f.write("- **Panneau domaine (inactif) inchangé** : Carte 4:3 centrée si activé — À vérifier en switchant\n")
            
            f.write("\n**Status** : **PASS** (si tous critères visuels OK) / **FAIL**\n")
        else:
            f.write("- **ÉCHEC DE CAPTURE**\n")
            f.write("\n**Status** : **FAIL**\n")
        
        f.write("\n---\n\n")
        
        f.write("## Mobile 390px\n\n")
        if mob_key in results:
            r = results[mob_key]
            f.write(f"- **Taille capturée (crop)** : {r['cropped_size'][0]}×{r['cropped_size'][1]} px\n")
            f.write(f"- **Taille panneau (CSS)** : {r['panel_size']['width']}×{r['panel_size']['height']} px\n")
            f.write(f"- **Position panneau** : x={r['panel_location']['x']}, y={r['panel_location']['y']}\n")
            f.write(f"- **Viewport** : {r['viewport'][0]}×{r['viewport'][1]} px\n")
            
            f.write("\n### Critères de succès\n")
            # Bulle centrée, diamètre ~min(76vw, 320px)
            f.write("- **Bulle centrée, diamètre ~min(76vw, 320px)** : À mesurer sur capture\n")
            # Texte dessous, aligné à gauche
            f.write("- **Texte sous la bulle, aligné à gauche** : À vérifier visuellement\n")
            # Bouton centré
            f.write("- **Bouton centré** : À vérifier visuellement\n")
            # Pas de débordement horizontal
            f.write("- **Pas de débordement horizontal** : À vérifier visuellement\n")
            
            f.write("\n**Status** : **PASS** (si tous critères visuels OK) / **FAIL**\n")
        else:
            f.write("- **ÉCHEC DE CAPTURE**\n")
            f.write("\n**Status** : **FAIL**\n")
        
        f.write("\n---\n\n")
        
        f.write("## Comparaison avec la référence (`propo-6-bulle-organique-*.webp`)\n\n")
        f.write("- **Desktop** : Différences vs `propo-6-bulle-organique-desktop.webp` — ")
        f.write("À comparer visuellement (ouvrir les deux côte à côte)\n")
        f.write("- **Mobile** : Différences vs `propo-6-bulle-organique-mobile.webp` — ")
        f.write("À comparer visuellement (ouvrir les deux côte à côte)\n")
        f.write("\n> Si aucune différence visible : **« identique »**\n")
        
        f.write("\n---\n\n")
        
        f.write("## Captures générées\n\n")
        f.write(f"- Desktop : `{OUT_DIR}/propo-7-real-bulle-organique-desktop.webp`\n")
        f.write(f"- Mobile : `{OUT_DIR}/propo-7-real-bulle-organique-mobile.webp`\n")
        f.write(f"- Référence desktop : `{OUT_DIR}/propo-6-bulle-organique-desktop.webp`\n")
        f.write(f"- Référence mobile : `{OUT_DIR}/propo-6-bulle-organique-mobile.webp`\n")

if __name__ == "__main__":
    main()