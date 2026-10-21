# Rapport de vérification visuelle — Fix Round 1 — Bulle organique « Notre histoire »

**Date** : 2026-10-21 13:30

## Desktop 1440px

- **Taille capturée (crop)** : 1180×537 px
- **Taille panneau (CSS)** : 1120×477.3125 px
- **Position panneau** : x=152, y=4029.296875
- **Viewport** : 1440×900 px
- **Bulle rect (CSS)** : 320×427 px
- **Media rect (CSS)** : 320×427 px
- **Bubble styles** : {'aspectRatio': '1 / 1', 'beforeBorder': '1px solid rgb(222, 232, 226)', 'beforeBorderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'beforeInset': '-14px', 'borderRadius': '0px', 'boxShadow': 'none', 'height': '426.656px', 'maxWidth': '320px', 'width': '320px'}
- **Media styles** : {'borderRadius': '56% 44% 52% 48% / 47% 55% 45% 53%', 'boxShadow': 'rgba(29, 59, 45, 0.12) 0px 12px 40px 0px', 'height': '426.656px', 'objectFit': 'cover', 'width': '320px'}

### Critères de succès
- **Bulle 420×420px (1:1, max-width 420px)** : **FAIL** (320×427, ratio=0.750, attendu 420×420)
- **Media remplit la bulle (420×420px, object-fit: cover)** : **FAIL** (320×427, object-fit=cover)
- **Visages + voiturette entièrement dans le cercle** : À vérifier visuellement sur la capture
- **Anneau 14px + border-radius organique** : **PASS** (inset=-14px, border=1px solid rgb(222, 232, 226), radius=56% 44% 52% 48% / 47% 55% 45% 53%)
- **Grille 40/60, texte aligné top, bouton flex-start** : À vérifier visuellement sur la capture

**Status Desktop** : **FAIL** ❌

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

**Status Mobile** : **FAIL** ❌

---

## Comparaison avec la référence (`propo-6-bulle-organique-*.webp`)

- **Desktop** : Différences vs `propo-6-bulle-organique-desktop.webp` — À comparer visuellement (ouvrir les deux côte à côte)
- **Mobile** : Différences vs `propo-6-bulle-organique-mobile.webp` — À comparer visuellement (ouvrir les deux côte à côte)

> Si aucune différence visible : **« Identique à la référence »**

---

## Captures générées

- Desktop (Fix 1) : `C:/Users/rolla/Desktop/Img_Convert/propo-8-real-bulle-fix1-desktop.webp`
- Mobile (Fix 1) : `C:/Users/rolla/Desktop/Img_Convert/propo-8-real-bulle-fix1-mobile.webp`
- Référence desktop : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-desktop.webp`
- Référence mobile : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-mobile.webp`
- Précédent (Round 0) desktop : `C:/Users/rolla/Desktop/Img_Convert/propo-7-real-bulle-organique-desktop.webp`
- Précédent (Round 0) mobile : `C:/Users/rolla/Desktop/Img_Convert/propo-7-real-bulle-organique-mobile.webp`

---

## Conclusion — Fix Round 1 : **FAIL** ❌

### Les 2 régressions ne sont **PAS corrigées** :

| Régression | Attendu | Réel (Fix 1) | Statut |
|------------|---------|--------------|--------|
| **Desktop** : Bulle 420×420px (1:1, max-width 420px) | 420×420px | 320×427px (ratio 0.75, max-width 320px) | ❌ FAIL |
| **Mobile** : Media remplit la bulle (~296×296px) | ~296×296px | 320×200px (media ne remplit PAS la bulle 320×320px) | ❌ FAIL |

### Problèmes additionnels détectés :
- **Desktop** : `height: auto` dans le media query `@media (min-width: 861px)` casse l'`aspect-ratio: 1` → hauteur 427px au lieu de 320px (contrainte par max-width)
- **Mobile** : `max-width: min(76vw, 320px)` s'applique aussi sur desktop (pas dans media query mobile) → limite à 320px au lieu de 420px
- **Mobile** : Media height 200px au lieu de 320px — l'image ne remplit pas la bulle malgré `height: 100%; object-fit: cover`
- **Mobile** : Panneau 460px > viewport 390px → débordement horizontal

### Actions requises (CSS) :
1. Déplacer `.swap-panel[data-panel="histoire"] .history__bubble { max-width: min(76vw, 320px); }` **dans** `@media (max-width: 860px)`
2. Dans `@media (min-width: 861px)` : ajouter `max-width: 420px; height: auto;` (ou retirer `height: auto` pour laisser `aspect-ratio` faire son travail)
3. Vérifier pourquoi le media (img) ne remplit pas la bulle sur mobile (hauteur 200px vs 320px) — possible problème de timing de chargement ou CSS conflict
4. Corriger le débordement horizontal mobile (panneau trop large)

### Comparaison avec Round 0 (`propo-7-real-bulle-organique-*.webp`) :
- Les captures Fix 1 semblent **identiques** au Round 0 — le fix n'a pas été appliqué ou n'a pas d'effet
- Référence (`propo-6-bulle-organique-*.webp`) : non atteinte
