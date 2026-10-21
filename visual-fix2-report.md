# Rapport de vérification visuelle — Fix Round 2 — Bulle organique « Notre histoire »

**Date** : 2026-10-21 13:35

## Verdict global : **FAIL** ❌

**Desktop 1440px** : **FAIL** — Bulle 420×560px (pas 1:1), média 420×560px
**Mobile 390px** : **FAIL** — Bulle 320×320px (pas ~296×296), média 320×200px (ne remplit pas), débordement horizontal (panneau 460px > 390px)

---

## Desktop 1440px

- **Taille capturée (crop)** : 1180×620 px
- **Taille panneau (CSS)** : 1120×560 px
- **Position panneau** : x=152, y=3751.953125
- **Viewport** : 1440×900 px
- **Bulle rect (CSS)** : 420×560 px
- **Media rect (CSS)** : 420×560 px
- **Bubble styles** : {'aspectRatio': '1 / 1', 'beforeBorder': '1px solid rgb(222, 232, 226)', 'beforeBorderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'beforeInset': '-14px', 'borderRadius': '0px', 'boxShadow': 'none', 'height': '560px', 'maxWidth': '420px', 'width': '420px'}
- **Media styles** : {'borderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'boxShadow': 'rgba(29, 59, 45, 0.12) 0px 12px 40px 0px', 'height': '560px', 'objectFit': 'cover', 'width': '420px'}

### Critères de succès
- **Bulle 420×420px (1:1, max-width 420px respecté)** : **FAIL** (420×560, ratio=0.750, attendu 420×420)
- **Media remplit la bulle (420×420px, object-fit: cover)** : **FAIL** (420×560, object-fit=cover)
- **Visages + voiturette entièrement dans le cercle** : À vérifier visuellement sur la capture
- **Anneau 14px + border-radius organique** : **PASS** (inset=-14px, border=1px solid rgb(222, 232, 226), radius=56% 44% 52% 48% / 47% 55% 45% 53%)
- **Grille 40/60, texte aligné top, bouton flex-start** : À vérifier visuellement sur la capture

**Status Desktop** : **FAIL** — La bulle fait 420×560px au lieu de 420×420px (ratio 0.75 au lieu de 1:1). L'aspect-ratio: 1 n'est pas respecté car la grille impose une hauteur de 560px (hauteur du contenu texte). Le média remplit la bulle mais celle-ci n'est pas carrée.

---

## Mobile 390px

- **Taille capturée (crop)** : 520×817 px
- **Taille panneau (CSS)** : 460×757.53125 px
- **Position panneau** : x=20, y=3744.03125
- **Viewport** : 390×844 px
- **Bulle rect (CSS)** : 320×320 px
- **Media rect (CSS)** : 320×200 px
- **Bubble styles** : {'aspectRatio': '1 / 1', 'beforeBorder': '1px solid rgb(222, 232, 226)', 'beforeBorderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'beforeInset': '-14px', 'borderRadius': '0px', 'boxShadow': 'none', 'height': '320px', 'maxWidth': '320px', 'width': '320px'}
- **Media styles** : {'borderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'boxShadow': 'rgba(29, 59, 45, 0.12) 0px 12px 40px 0px', 'height': '200px', 'objectFit': 'cover', 'width': '320px'}

### Critères de succès
- **Bulle ~296×296px (min(76vw, 320px))** : **FAIL** (320×320, ratio=1.000, attendu ~296×296)
- **Media remplit la bulle (296×296px, object-fit: cover)** : **FAIL** (320×200, object-fit=cover)
- **Texte dessous aligné gauche, bouton centré** : À vérifier visuellement sur la capture
- **Pas de débordement horizontal (panneau ≤ viewport 390px)** : **FAIL** (panneau 460px > 390px)

**Status Mobile** : **FAIL** — La bulle fait 320×320px au lieu de ~296×296px (max-width: min(76vw, 320px) capte à 320px au lieu de 296px). Le média ne remplit pas la bulle (320×200px au lieu de 320×320px). Le panneau fait 460px > viewport 390px (débordement horizontal).

---

## Comparaison avec la référence (`propo-6-bulle-organique-*.webp`)

- **Desktop** : Différences vs `propo-6-bulle-organique-desktop.webp` — À comparer visuellement (ouvrir les deux côte à côte)
- **Mobile** : Différences vs `propo-6-bulle-organique-mobile.webp` — À comparer visuellement (ouvrir les deux côte à côte)

> Si aucune différence visible : **« Identique à la référence »**

---

## Captures générées

- Desktop (Fix 2) : `C:/Users/rolla/Desktop/Img_Convert/propo-9-real-bulle-fix2-desktop.webp`
- Mobile (Fix 2) : `C:/Users/rolla/Desktop/Img_Convert/propo-9-real-bulle-fix2-mobile.webp`
- Référence desktop : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-desktop.webp`
- Référence mobile : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-mobile.webp`
- Précédent (Fix 1) desktop : `C:/Users/rolla/Desktop/Img_Convert/propo-8-real-bulle-fix1-desktop.webp`
- Précédent (Fix 1) mobile : `C:/Users/rolla/Desktop/Img_Convert/propo-8-real-bulle-fix1-mobile.webp`
