# Rapport de vérification visuelle — Bulle organique « Notre histoire »

**Date** : 2026-10-21 13:35

## Résumé exécutif

| Critère | Desktop 1440px | Mobile 390px |
|---------|----------------|--------------|
| **Grille 2 colonnes (40/60)** | ⚠️ Partiel | N/A (1 colonne) |
| **Bulle 1:1 (diamètre ≤ 420px)** | ❌ **FAIL** — 420×560px (étirée) | ✅ **PASS** — 420×420px |
| **Bulle centrée mobile (~296px)** | N/A | ⚠️ 420px (max-width clamp, pas 76vw) |
| **Anneau 14px + border-radius organique** | ✅ CSS correct | ✅ CSS correct |
| **Media remplit bulle (object-fit:cover)** | ❌ **FAIL** — 420×560px | ❌ **FAIL** — 420×262.5px |
| **Ombre var(--shadow) sur photo** | ✅ CSS présent | ✅ CSS présent |
| **Texte aligné gauche, top = bulle top** | ⚠️ À vérifier | ✅ PASS |
| **Bouton centré mobile** | N/A | ✅ PASS |
| **Pas de débordement horizontal** | ✅ PASS | ✅ PASS |

**Status global** : **FAIL** — 2 régressions CSS critiques sur le dimensionnement bulle/media

---

## Desktop 1440px — Mesures détaillées

- **Taille capturée (crop panel + padding)** : 1180×620 px
- **Taille panneau (CSS, `.swap-panel[data-panel="histoire"].is-active`)** : 1120×560 px
- **Position panneau (viewport)** : x=152, y=3988 px
- **Viewport** : 1440×900 px

### Layout grille (CSS)
```css
/* Actuel dans style.css */
.swap-panel[data-panel="histoire"].is-active {
  grid-template-columns: minmax(0, 40%) 1fr;  /* 448px / 672px */
  grid-template-areas: "media body" "media actions";
  align-items: start;
}
.history__bubble { grid-area: media; justify-self: center; }
```

### Bulle `.history__bubble` (span)
| Propriété | Valeur attendue | Valeur réelle (computed) | Statut |
|-----------|-----------------|--------------------------|--------|
| `width` | 420px (max-width clamp) | **420px** | ✅ |
| `height` | 420px (aspect-ratio: 1) | **560px** ❌ | **FAIL** |
| `aspect-ratio` | 1 / 1 | 1 / 1 (déclaré) | ⚠️ Non respecté |
| `border-radius` | 0 (c'est le media qui l'a) | 0px | ✅ |

**Problème** : La bulle s'étire verticalement à la hauteur du panneau (560px) au lieu de respecter `aspect-ratio: 1`. Cause probable : la grille impose une hauteur de rangée dictée par le panneau « domaine » inactif (même `grid-area: 1/1`), ou `align-items: start` ne suffit pas sans `align-self: start` sur la bulle.

### Media `.history__media.img--history` (img)
| Propriété | Valeur attendue | Valeur réelle (computed) | Statut |
|-----------|-----------------|--------------------------|--------|
| `width` | 420px | **420px** | ✅ |
| `height` | 420px (100% de la bulle) | **560px** ❌ | **FAIL** |
| `border-radius` | Organique `56% 44% 52% 48% / 47% 55% 45% 53%` | Correct | ✅ |
| `object-fit` | cover | cover | ✅ |
| `box-shadow` | `var(--shadow)` = `rgba(29,59,45,0.12) 0 12px 40px` | Correct | ✅ |

**Problème** : L'image suit la hauteur étirée de la bulle (560px) au lieu de rester 420×420. Le `border-radius` organique s'applique sur un rectangle 420×560, déformant la forme organique.

### Anneau `::before` sur `.history__bubble`
| Propriété | Valeur | Statut |
|-----------|--------|--------|
| `inset` | -14px | ✅ |
| `border` | 1px solid `var(--line)` | ✅ |
| `border-radius` | Organique identique au media | ✅ |

### Colonne texte (`.history__body` + `.swap-panel__actions`)
- **Position** : Colonne droite (grid-area: body/actions), début à x ≈ 520px dans le panneau (448px col gauche + 72px gap)
- **Alignement** : `text-align: left` (desktop), `padding-top: 1.5rem` sur `.history__body`
- **Contenu** : Badge « Notre histoire » → Titre « En nature depuis 1969 » → 2 paragraphes → Bouton « Découvrir le domaine »
- **Alignement vertical** : `align-items: start` sur le panneau → body et actions commencent au top de la bulle (théoriquement)

### Panneau « Domaine » (inactif)
- **État** : `opacity: 0; visibility: hidden; pointer-events: none`
- **Layout desktop** : Carte 4:3 centrée (`max-width: 60%; margin-inline: auto; aspect-ratio: 4/3`)
- **Vérification** : Non testé (nécessite interaction JS pour basculer)

---

## Mobile 390px — Mesures détaillées

- **Taille capturée (crop panel + padding)** : 520×917 px
- **Taille panneau (CSS)** : 460×857.5 px
- **Position panneau (viewport)** : x=20, y=3478 px
- **Viewport** : 390×844 px

### Bulle `.history__bubble`
| Propriété | Valeur attendue | Valeur réelle (computed) | Statut |
|-----------|-----------------|--------------------------|--------|
| `width` | min(76vw, 320px) = **296px** | **420px** ⚠️ | **Partiel** |
| `height` | = width (aspect-ratio: 1) | **420px** | ✅ (carré) |
| `max-width` | 420px | 420px | ✅ |

**Note** : Sur mobile (≤860px), la bulle n'est pas contrainte par la grille 2 colonnes. Elle devrait faire `min(76vw, 320px)` ≈ 296px, mais le `max-width: 420px` du CSS desktop s'applique aussi en mobile. Le CSS mobile devrait limiter à 320px max.

### Media `.history__media.img--history`
| Propriété | Valeur attendue | Valeur réelle (computed) | Statut |
|-----------|-----------------|--------------------------|--------|
| `width` | 420px (100% bulle) | **420px** | ✅ |
| `height` | 420px (100% bulle) | **262.5px** ❌ | **FAIL** |
| `border-radius` | Organique | Correct | ✅ |
| `box-shadow` | `var(--shadow)` | Correct | ✅ |

**Problème** : L'image ne remplit pas la bulle (hauteur 262.5px au lieu de 420px). Cause probable : l'image a un ratio naturel (1200×1600 = 3:4) et `object-fit: cover` ne suffit pas si la hauteur du conteneur n'est pas contrainte. La bulle fait 420×420 mais le media n'hérite pas de la hauteur.

### Texte et bouton (mobile)
- **Bulle** : Centrée horizontalement (`text-align: center` sur le panneau, `justify-self: center` implicite)
- **Texte** : Sous la bulle, `text-align: left` sur `.history__body` ✅
- **Bouton** : Centré (`justify-content: center` sur `.swap-panel__actions`) ✅
- **Débordement horizontal** : Largeur contenu 460px < viewport 390px + padding, OK ✅

---

## Comparaison avec la référence (`propo-6-bulle-organique-*.webp`)

| Aspect | Desktop | Mobile |
|--------|---------|--------|
| **Source référence** | `preview_bulle.html` (isolé) | `preview_bulle.html` (isolé) |
| **Source réelle** | `index.html` (page complète) | `index.html` (page complète) |
| **Différences structurelles** | Grille imposée par panneau « domaine » voisin | Pas de grille, mais max-width desktop qui fuit |
| **Visuel bulle** | Référence : 448×456px (avec anneau) / Réelle : 420×560px (étirée) | Référence : 357×335px (avec anneau) / Réelle : 420×420px |
| **Conclusion** | **Différent** — étirement vertical + forme organique déformée | **Différent** — bulle trop grande (420 vs 296px), media incomplet |

> **Note** : Les captures de référence (`propo-6`) ont été générées depuis `preview_bulle.html` qui ne contient que le panneau « histoire » sans le panneau « domaine » concurrent. Cela explique pourquoi la bulle y respectait le 1:1.

---

## Captures générées

- **Desktop réel** : `C:/Users/rolla/Desktop/Img_Convert/propo-7-real-bulle-organique-desktop.webp` (1180×620)
- **Mobile réel** : `C:/Users/rolla/Desktop/Img_Convert/propo-7-real-bulle-organique-mobile.webp` (520×917)
- **Référence desktop** : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-desktop.webp` (1184×768)
- **Référence mobile** : `C:/Users/rolla/Desktop/Img_Convert/propo-6-bulle-organique-mobile.webp` (452×825)
- **Crops debug bulle** : `debug_real_desk_bubble.webp`, `debug_real_mob_bubble.webp`

---

## Actions correctives requises (CSS)

### 1. Corriger l'étirement desktop (bulle + media)
```css
/* Dans @media (min-width: 861px) */
.swap-panel[data-panel="histoire"] .history__bubble {
  align-self: start;        /* Empêche l'étirement vertical par la grille */
  height: auto;             /* Laisse aspect-ratio gérer la hauteur */
}
.history__bubble .history__media {
  height: 100%;             /* Remplit la bulle corrigée */
}
```

### 2. Corriger la hauteur media mobile
```css
/* Mobile (≤860px) - déjà dans le bloc de base */
.history__bubble .history__media {
  height: 100%;             /* Force le remplissage vertical */
}
```

### 3. Limiter la bulle mobile à 320px max
```css
@media (max-width: 860px) {
  .history__bubble {
    max-width: min(76vw, 320px);  /* Au lieu de 420px desktop */
  }
}
```

### 4. S'assurer que le panneau « domaine » n'impose pas sa hauteur
Option A : Séparer les panneaux en DOM (pas même grid-area)  
Option B : `grid-template-rows: auto` sur `.history__inner--swap` + `align-self: start` sur les deux panneaux

---

## Vérifications visuelles manuelles recommandées

Ouvrir les captures côte à côte :
1. `propo-7-real-bulle-organique-desktop.webp` vs `propo-6-bulle-organique-desktop.webp`
2. `propo-7-real-bulle-organique-mobile.webp` vs `propo-6-bulle-organique-mobile.webp`

Points d'attention visuelle :
- [ ] Forme organique de la bulle (pas ovale déformée)
- [ ] Anneau 14px visible tout autour
- [ ] Photo bien cadrée (visages + voiturette dans le cercle)
- [ ] Ombre portée sous la bulle
- [ ] Alignement badge/titre/paragraphes/bouton au top de la bulle (desktop)
- [ ] Centrage bulle + texte gauche + bouton centré (mobile)