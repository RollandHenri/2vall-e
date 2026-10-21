# Rapport de vérification visuelle — Fix Round 3 — Bulle organique « Notre histoire »

**Date** : 2026-10-21 13:51

## Desktop 1440px

- **Taille capturée (crop)** : 1420×618 px
- **Taille panneau (CSS)** : 1360×558.390625 px
- **Position panneau** : x=40, y=4210.0625
- **Viewport** : 1440×900 px
- **Bulle rect (CSS)** : 420×420 px
- **Media rect (CSS)** : 420×420 px
- **Bubble styles** : {'alignSelf': 'start', 'aspectRatio': '1 / 1', 'beforeBorder': '1px solid rgb(222, 232, 226)', 'beforeBorderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'beforeInset': '-14px', 'borderRadius': '0px', 'boxShadow': 'none', 'display': 'block', 'gridColumn': '1', 'gridRow': '1', 'height': '420px', 'justifySelf': 'center', 'maxWidth': '420px', 'width': '420px'}
- **Media styles** : {'borderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'boxShadow': 'rgba(29, 59, 45, 0.12) 0px 12px 40px 0px', 'height': '420px', 'objectFit': 'cover', 'width': '420px'}

### Critères de succès
- **Bulle 420×420px (1:1, max-width 420px respecté)** : **PASS** (420×420, ratio=1.000)
- **Media remplit la bulle (420×420px, object-fit: cover)** : **PASS** (420×420, object-fit=cover)
- **Visages + voiturette entièrement dans le cercle** : À vérifier visuellement sur la capture
- **Anneau 14px + border-radius organique** : **PASS** (inset=-14px, border=1px solid rgb(222, 232, 226), radius=56% 44% 52% 48% / 47% 55% 45% 53%)
- **Grille 40/60, texte aligné top, bouton flex-start** : À vérifier visuellement sur la capture

**Status Desktop** : **PASS** ✅

---

## Mobile 390px

- **Taille capturée (crop)** : 418×844 px
- **Taille panneau (CSS)** : 358×784.703125 px
- **Position panneau** : x=16, y=3704.171875
- **Viewport** : 390×844 px
- **Bulle rect (CSS)** : 296×296 px
- **Media rect (CSS)** : 296×296 px
- **Bubble styles** : {'alignSelf': 'auto', 'aspectRatio': '1 / 1', 'beforeBorder': '1px solid rgb(222, 232, 226)', 'beforeBorderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'beforeInset': '-14px', 'borderRadius': '0px', 'boxShadow': 'none', 'display': 'block', 'gridColumn': 'auto', 'gridRow': 'auto', 'height': '296.391px', 'justifySelf': 'auto', 'maxWidth': '296.4px', 'width': '296.391px'}
- **Media styles** : {'borderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'boxShadow': 'rgba(29, 59, 45, 0.12) 0px 12px 40px 0px', 'height': '296.391px', 'objectFit': 'cover', 'width': '296.391px'}

### Critères de succès
- **Bulle ~296×296px (min(76vw, 320px))** : **PASS** (296×296, ratio=1.000)
- **Media remplit la bulle (296×296px, object-fit: cover)** : **PASS** (296×296, object-fit=cover)
- **Texte dessous aligné gauche, bouton centré** : À vérifier visuellement sur la capture
- **Pas de débordement horizontal (panneau ≤ viewport 390px)** : **PASS** (panneau 358px ≤ 390px)

**Status Mobile** : **PASS** ✅

---

## Comparaison avec la référence (`propo-6-bulle-organique-*.webp`)

- **Desktop** : Différences vs `propo-6-bulle-organique-desktop.webp` — À comparer visuellement (ouvrir les deux côte à côte)
- **Mobile** : Différences vs `propo-6-bulle-organique-mobile.webp` — À comparer visuellement (ouvrir les deux côte à côte)

> Si aucune différence visible : **« Identique à la référence »**

---

## Captures générées

- Desktop (Fix 3) : `C:/Users/rolla/Desktop/Img_Convert/propo-10-real-bulle-fix3-desktop.webp`
- Mobile (Fix 3) : `C:/Users/rolla/Desktop/Img_Convert/propo-10-real-bulle-fix3-mobile.webp`
- Référence desktop : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-desktop.webp`
- Référence mobile : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-mobile.webp`
- Précédent (Fix 2) desktop : `C:/Users/rolla/Desktop/Img_Convert/propo-9-real-bulle-fix2-desktop.webp`
- Précédent (Fix 2) mobile : `C:/Users/rolla/Desktop/Img_Convert/propo-9-real-bulle-fix2-mobile.webp`
