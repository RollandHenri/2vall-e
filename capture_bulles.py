#!/usr/bin/env python3
"""
Capture des 4 variantes bulle (cercle/organique x desktop/mobile) en WebP avec transparence
Utilise CDP Page.captureScreenshot pour avoir l'alpha
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
PREVIEW_BASE = r"C:/Users/rolla/Desktop/Dev_26/_Test_/T_Camp_Craw/preview_bulle.html"

CAPTURES = [
    ("propo-5-bulle-cercle-desktop.webp", "cercle", "cercle", 1440, 900),
    ("propo-6-bulle-organique-desktop.webp", "organique", "organique", 1440, 900),
    ("propo-5-bulle-cercle-mobile.webp", "cercle", "cercle", 390, 844),
    ("propo-6-bulle-organique-mobile.webp", "organique", "organique", 390, 844),
]

def build_html(style_class, wrapper_class):
    with open(PREVIEW_BASE, "r", encoding="utf-8") as f:
        html = f.read()
    html = html.replace("history__media--STYLE", f"history__media--{style_class}")
    html = html.replace("bubble-wrapper--STYLE", f"bubble-wrapper--{wrapper_class}")
    return html

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

def capture_with_cdp(driver, html, width, height, out_path):
    import tempfile
    with tempfile.NamedTemporaryFile(mode="w", suffix=".html", delete=False, encoding="utf-8") as f:
        f.write(html)
        temp_path = f.name
    
    try:
        driver.get(f"file:///{temp_path.replace(os.sep, '/')}")
        
        wait = WebDriverWait(driver, 10)
        img_el = wait.until(EC.presence_of_element_located((By.CSS_SELECTOR, ".history__media")))
        wait.until(lambda d: img_el.get_attribute("complete") == "true")
        
        time.sleep(0.5)
        
        # Get section location and size for cropping
        section = driver.find_element(By.ID, "decouvrir")
        location = section.location
        size = section.size
        
        # Use CDP to capture full page with transparency
        # First, ensure we capture the full page
        result = driver.execute_cdp_cmd("Page.captureScreenshot", {
            "format": "png",
            "captureBeyondViewport": True,
            "fromSurface": True
        })
        
        png_data = base64.b64decode(result["data"])
        full_img = Image.open(io.BytesIO(png_data)).convert("RGBA")
        
        # Crop to section
        # Note: location/size might be affected by device pixel ratio
        dpr = driver.execute_script("return window.devicePixelRatio;")
        left = int(location['x'] * dpr)
        top = int(location['y'] * dpr)
        right = int((location['x'] + size['width']) * dpr)
        bottom = int((location['y'] + size['height']) * dpr)
        
        # Clamp to image bounds
        left = max(0, left)
        top = max(0, top)
        right = min(full_img.width, right)
        bottom = min(full_img.height, bottom)
        
        cropped = full_img.crop((left, top, right, bottom))
        
        # Make white/near-white background transparent (chroma key for safety)
        # Since we set body background: transparent, this shouldn't be needed,
        # but let's do it as fallback
        datas = cropped.getdata()
        new_data = []
        for item in datas:
            # If pixel is very close to white, make transparent
            if item[0] > 250 and item[1] > 250 and item[2] > 250:
                new_data.append((255, 255, 255, 0))
            else:
                new_data.append(item)
        cropped.putdata(new_data)
        
        cropped.save(out_path, "WEBP", quality=90, method=6)
        print(f"  OK {os.path.basename(out_path)} ({cropped.size[0]}x{cropped.size[1]}, mode={cropped.mode})")
        
    finally:
        try:
            os.unlink(temp_path)
        except:
            pass

def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    
    for fname, style_class, wrapper_class, width, height in CAPTURES:
        print(f"Capture {fname} ({width}x{height})...")
        html = build_html(style_class, wrapper_class)
        driver = setup_driver(width, height)
        try:
            capture_with_cdp(driver, html, width, height, os.path.join(OUT_DIR, fname))
        except Exception as e:
            print(f"  ERREUR: {e}")
        finally:
            driver.quit()
    
    print("Toutes les captures sont faites.")

if __name__ == "__main__":
    main()