#!/usr/bin/env python3
"""
Capture réelle de la section #decouvrir (panneau histoire) depuis index.html
Desktop 1440px et Mobile 390px - Fix Round 1 verification
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
    ("propo-8-real-bulle-fix1-desktop.webp", 1440, 900),
    ("propo-8-real-bulle-fix1-mobile.webp", 390, 844),
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
    return cropped.size, {"width": panel_rect['width'], "height": panel_rect['height']}, {"x": panel_rect['x'], "y": panel_rect['y']}, bubble_rect, media_rect, bubble_styles, media_styles

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    # URL file:// pour le index.html réel
    url = f"file:///{INDEX_HTML.replace(os.sep, '/')}"
    
    results = {}
    
    for fname, width, height in CAPTURES:
        print(f"Capture {fname} ({width}x{height})...")
        driver = setup_driver(width, height)
        try:
            cropped_size, panel_size, panel_location, bubble_rect, media_rect, bubble_styles, media_styles = capture_section(driver, url, width, height, os.path.join(OUT_DIR, fname))
            results[fname] = {
                "cropped_size": cropped_size,
                "panel_size": panel_size,
                "panel_location": panel_location,
                "viewport": (width, height),
                "bubble_rect": bubble_rect,
                "media_rect": media_rect,
                "bubble_styles": bubble_styles,
                "media_styles": media_styles,
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
    report_path = r"C:\Users\rolla\Desktop\Dev_26\_Test_\T_Camp_Craw\.superpowers\sdd\plan-bulle-organique\visual-fix1-report.md"
    os.makedirs(os.path.dirname(report_path), exist_ok=True)
    
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# Rapport de vérification visuelle — Fix Round 1 — Bulle organique « Notre histoire »\n\n")
        f.write(f"**Date** : {time.strftime('%Y-%m-%d %H:%M')}\n\n")
        
        # Desktop
        desk_key = "propo-8-real-bulle-fix1-desktop.webp"
        mob_key = "propo-8-real-bulle-fix1-mobile.webp"
        
        f.write("## Desktop 1440px\n\n")
        if desk_key in results:
            r = results[desk_key]
            f.write(f"- **Taille capturée (crop)** : {r['cropped_size'][0]}×{r['cropped_size'][1]} px\n")
            f.write(f"- **Taille panneau (CSS)** : {r['panel_size']['width']}×{r['panel_size']['height']} px\n")
            f.write(f"- **Position panneau** : x={r['panel_location']['x']}, y={r['panel_location']['y']}\n")
            f.write(f"- **Viewport** : {r['viewport'][0]}×{r['viewport'][1]} px\n")
            f.write(f"- **Bulle rect (CSS)** : {r['bubble_rect']['width']:.0f}×{r['bubble_rect']['height']:.0f} px\n")
            f.write(f"- **Media rect (CSS)** : {r['media_rect']['width']:.0f}×{r['media_rect']['height']:.0f} px\n")
            f.write(f"- **Bubble styles** : {r['bubble_styles']}\n")
            f.write(f"- **Media styles** : {r['media_styles']}\n")
            
            # Vérifications critères
            f.write("\n### Critères de succès\n")
            
            bubble_w = r['bubble_rect']['width']
            bubble_h = r['bubble_rect']['height']
            media_w = r['media_rect']['width']
            media_h = r['media_rect']['height']
            
            # Critère 1: Bulle 420×420px (1:1 respecté, max-width 420px)
            bubble_ratio = bubble_w / bubble_h if bubble_h > 0 else 0
            f.write(f"- **Bulle 420×420px (1:1, max-width 420px)** : ")
            if abs(bubble_w - 420) <= 2 and abs(bubble_h - 420) <= 2 and abs(bubble_ratio - 1.0) < 0.02:
                f.write(f"**PASS** ({bubble_w:.0f}×{bubble_h:.0f}, ratio={bubble_ratio:.3f})\n")
            else:
                f.write(f"**FAIL** ({bubble_w:.0f}×{bubble_h:.0f}, ratio={bubble_ratio:.3f}, attendu 420×420)\n")
            
            # Critère 2: Media remplit la bulle (420×420px, object-fit: cover)
            f.write(f"- **Media remplit la bulle (420×420px, object-fit: cover)** : ")
            if abs(media_w - 420) <= 2 and abs(media_h - 420) <= 2 and r['media_styles'].get('objectFit') == 'cover':
                f.write(f"**PASS** ({media_w:.0f}×{media_h:.0f}, object-fit={r['media_styles'].get('objectFit')})\n")
            else:
                f.write(f"**FAIL** ({media_w:.0f}×{media_h:.0f}, object-fit={r['media_styles'].get('objectFit')})\n")
            
            # Critère 3: Visages + voiturette entièrement dans le cercle
            f.write(f"- **Visages + voiturette entièrement dans le cercle** : À vérifier visuellement sur la capture\n")
            
            # Critère 4: Anneau 14px + border-radius organique OK
            before_inset = r['bubble_styles'].get('beforeInset', '')
            before_border = r['bubble_styles'].get('beforeBorder', '')
            before_border_radius = r['bubble_styles'].get('beforeBorderRadius', '')
            f.write(f"- **Anneau 14px + border-radius organique** : ")
            if '14px' in before_inset or '-14px' in before_inset:
                f.write(f"**PASS** (inset={before_inset}, border={before_border}, radius={before_border_radius})\n")
            else:
                f.write(f"**FAIL** (inset={before_inset}, border={before_border}, radius={before_border_radius})\n")
            
            # Critère 5: Grille 40/60, texte aligné top, bouton flex-start
            f.write(f"- **Grille 40/60, texte aligné top, bouton flex-start** : À vérifier visuellement sur la capture\n")
            
            f.write("\n**Status Desktop** : **PASS** / **FAIL** (selon vérifications ci-dessus)\n")
        else:
            f.write("- **ÉCHEC DE CAPTURE**\n")
            f.write("\n**Status Desktop** : **FAIL**\n")
        
        f.write("\n---\n\n")
        
        f.write("## Mobile 390px\n\n")
        if mob_key in results:
            r = results[mob_key]
            f.write(f"- **Taille capturée (crop)** : {r['cropped_size'][0]}×{r['cropped_size'][1]} px\n")
            f.write(f"- **Taille panneau (CSS)** : {r['panel_size']['width']}×{r['panel_size']['height']} px\n")
            f.write(f"- **Position panneau** : x={r['panel_location']['x']}, y={r['panel_location']['y']}\n")
            f.write(f"- **Viewport** : {r['viewport'][0]}×{r['viewport'][1]} px\n")
            f.write(f"- **Bulle rect (CSS)** : {r['bubble_rect']['width']:.0f}×{r['bubble_rect']['height']:.0f} px\n")
            f.write(f"- **Media rect (CSS)** : {r['media_rect']['width']:.0f}×{r['media_rect']['height']:.0f} px\n")
            f.write(f"- **Bubble styles** : {r['bubble_styles']}\n")
            f.write(f"- **Media styles** : {r['media_styles']}\n")
            
            f.write("\n### Critères de succès\n")
            
            bubble_w = r['bubble_rect']['width']
            bubble_h = r['bubble_rect']['height']
            media_w = r['media_rect']['width']
            media_h = r['media_rect']['height']
            
            # Expected mobile bubble diameter: min(76vw, 320px) = min(76*390/100, 320) = min(296.4, 320) = ~296px
            expected_mobile = min(76 * 390 / 100, 320)
            
            # Critère 1: Bulle ~296×296px (min(76vw, 320px))
            bubble_ratio = bubble_w / bubble_h if bubble_h > 0 else 0
            f.write(f"- **Bulle ~{expected_mobile:.0f}×{expected_mobile:.0f}px (min(76vw, 320px))** : ")
            if abs(bubble_w - expected_mobile) <= 5 and abs(bubble_h - expected_mobile) <= 5 and abs(bubble_ratio - 1.0) < 0.02:
                f.write(f"**PASS** ({bubble_w:.0f}×{bubble_h:.0f}, ratio={bubble_ratio:.3f})\n")
            else:
                f.write(f"**FAIL** ({bubble_w:.0f}×{bubble_h:.0f}, ratio={bubble_ratio:.3f}, attendu ~{expected_mobile:.0f}×{expected_mobile:.0f})\n")
            
            # Critère 2: Media remplit la bulle (296×296px)
            f.write(f"- **Media remplit la bulle ({expected_mobile:.0f}×{expected_mobile:.0f}px, object-fit: cover)** : ")
            if abs(media_w - expected_mobile) <= 5 and abs(media_h - expected_mobile) <= 5 and r['media_styles'].get('objectFit') == 'cover':
                f.write(f"**PASS** ({media_w:.0f}×{media_h:.0f}, object-fit={r['media_styles'].get('objectFit')})\n")
            else:
                f.write(f"**FAIL** ({media_w:.0f}×{media_h:.0f}, object-fit={r['media_styles'].get('objectFit')})\n")
            
            # Critère 3: Texte dessous aligné gauche, bouton centré
            f.write(f"- **Texte dessous aligné gauche, bouton centré** : À vérifier visuellement sur la capture\n")
            
            # Critère 4: Pas de débordement horizontal
            panel_w = r['panel_size']['width']
            f.write(f"- **Pas de débordement horizontal (panneau ≤ viewport 390px)** : ")
            if panel_w <= 390:
                f.write(f"**PASS** (panneau {panel_w:.0f}px ≤ 390px)\n")
            else:
                f.write(f"**FAIL** (panneau {panel_w:.0f}px > 390px)\n")
            
            f.write("\n**Status Mobile** : **PASS** / **FAIL** (selon vérifications ci-dessus)\n")
        else:
            f.write("- **ÉCHEC DE CAPTURE**\n")
            f.write("\n**Status Mobile** : **FAIL**\n")
        
        f.write("\n---\n\n")
        
        f.write("## Comparaison avec la référence (`propo-6-bulle-organique-*.webp`)\n\n")
        f.write("- **Desktop** : Différences vs `propo-6-bulle-organique-desktop.webp` — ")
        f.write("À comparer visuellement (ouvrir les deux côte à côte)\n")
        f.write("- **Mobile** : Différences vs `propo-6-bulle-organique-mobile.webp` — ")
        f.write("À comparer visuellement (ouvrir les deux côte à côte)\n")
        f.write("\n> Si aucune différence visible : **« Identique à la référence »**\n")
        
        f.write("\n---\n\n")
        
        f.write("## Captures générées\n\n")
        f.write(f"- Desktop (Fix 1) : `{OUT_DIR}/propo-8-real-bulle-fix1-desktop.webp`\n")
        f.write(f"- Mobile (Fix 1) : `{OUT_DIR}/propo-8-real-bulle-fix1-mobile.webp`\n")
        f.write(f"- Référence desktop : `{OUT_DIR}/propo-6-bulle-organique-desktop.webp`\n")
        f.write(f"- Référence mobile : `{OUT_DIR}/propo-6-bulle-organique-mobile.webp`\n")
        f.write(f"- Précédent (Round 0) desktop : `{OUT_DIR}/propo-7-real-bulle-organique-desktop.webp`\n")
        f.write(f"- Précédent (Round 0) mobile : `{OUT_DIR}/propo-7-real-bulle-organique-mobile.webp`\n")

if __name__ == "__main__":
    main()