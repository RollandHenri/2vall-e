# Fix Round 3 — Tâche 1 : Panneau Histoire

## Status
✅ **Terminé** — CSS modifié dans `css/style.css`

## Problème résolu
Le `grid-template-areas: "media body" "media actions"` créait 2 lignes où la bulle ("media") spannait les deux → hauteur = texte + actions = ~560px. L'`aspect-ratio: 1` était ignoré car la grille imposait sa hauteur.

## Solution appliquée
**Grille explicite 2 lignes + bulle uniquement sur ligne 1**

### 1. Desktop (≥861px) — Remplacement complet du bloc `@media (min-width: 861px)` pour `[data-panel="histoire"]`

**AVANT (Fix 2) :**
```css
@media (min-width: 861px) {
  .swap-panel[data-panel="histoire"].is-active {
    grid-template-columns: minmax(0, 40%) 1fr;
    grid-template-areas: "media body" "media actions";
    align-items: start;
    text-align: left;
  }
  .swap-panel[data-panel="histoire"] .history__bubble {
    grid-area: media;
    justify-self: center;
    max-width: 420px;
  }
  ...
}
```

**APRÈS (Fix 3) :**
```css
@media (min-width: 861px) {
  .swap-panel[data-panel="histoire"].is-active {
    grid-template-columns: minmax(0, 40%) 1fr;
    grid-template-rows: auto auto;        /* 2 lignes explicites */
    align-items: start;                   /* empêche stretch vertical */
    text-align: left;
  }
  .swap-panel[data-panel="histoire"] .history__bubble {
    grid-column: 1;
    grid-row: 1;                          /* SEULEMENT ligne 1 */
    justify-self: center;
    align-self: start;                    /* crucial : ne remplit pas la ligne */
    max-width: 420px;                     /* aspect-ratio: 1 fait le reste */
  }
  .swap-panel[data-panel="histoire"] .history__body {
    grid-column: 2;
    grid-row: 1;
    padding-top: 1.5rem;
  }
  .swap-panel[data-panel="histoire"] .swap-panel__actions {
    grid-column: 2;
    grid-row: 2;
    justify-content: flex-start;
  }
  .swap-panel[data-panel="histoire"] .history__body,
  .swap-panel[data-panel="histoire"] .swap-panel__actions {
    text-align: left;
  }
}
```

### 2. Mobile (≤860px) — Correction `max-width` bulle + débordement

Dans `.swap-panel[data-panel="histoire"]` (bloc mobile, hors media query) :
```css
.swap-panel[data-panel="histoire"] {
  text-align: center;
  width: 100%;
  max-width: 100%;               /* contient le panneau dans le viewport */
  box-sizing: border-box;
}
.swap-panel[data-panel="histoire"] .history__bubble {
  max-width: min(76vw, 320px);   /* 76vw @390px = 296px, cap 320px */
  aspect-ratio: 1;               /* redondant mais explicite */
}
```

### 3. Media remplit la bulle (mobile + desktop) — Déjà correct

`.history__bubble .history__media` possède déjà :
```css
.history__bubble .history__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;
  box-shadow: var(--shadow);
}
```
L'image remplit la bulle car celle-ci a maintenant une hauteur définie via `aspect-ratio: 1` + `max-width`.

## Diff complet (`css/style.css`)

```diff
--- a/css/style.css
+++ b/css/style.css
@@ -2333,31 +2333,45 @@
 /* --- Notre histoire : bulle organique --- */
 .swap-panel[data-panel="histoire"] {
   /* Mobile : 1 colonne, contenu centré */
   text-align: center;
   width: 100%;
   max-width: 100%;
+  box-sizing: border-box;
 }
 .swap-panel[data-panel="histoire"] .history__body {
   text-align: left;
 }
 .swap-panel[data-panel="histoire"] .swap-panel__actions {
   justify-content: center;
 }
 .swap-panel[data-panel="histoire"] .history__bubble {
   max-width: min(76vw, 320px);
+  aspect-ratio: 1;
 }
 
 /* Desktop : 2 colonnes, bulle à gauche */
 @media (min-width: 861px) {
   .swap-panel[data-panel="histoire"].is-active {
     grid-template-columns: minmax(0, 40%) 1fr;
-    grid-template-areas:
-      "media body"
-      "media actions";
+    grid-template-rows: auto auto;        /* 2 lignes explicites */
     align-items: start;                   /* empêche stretch vertical */
     text-align: left;
   }
   .swap-panel[data-panel="histoire"] .history__bubble {
-    grid-area: media;
+    grid-column: 1;
+    grid-row: 1;                          /* SEULEMENT ligne 1 */
     justify-self: center;
+    align-self: start;                    /* crucial : ne remplit pas la ligne */
     max-width: 420px;                     /* aspect-ratio: 1 fait le reste */
   }
   .swap-panel[data-panel="histoire"] .history__body {
-    grid-area: body;
+    grid-column: 2;
+    grid-row: 1;
     padding-top: 1.5rem;
   }
   .swap-panel[data-panel="histoire"] .swap-panel__actions {
-    grid-area: actions;
+    grid-column: 2;
+    grid-row: 2;
     justify-content: flex-start;
   }
   .swap-panel[data-panel="histoire"] .history__body,
   .swap-panel[data-panel="histoire"] .swap-panel__actions {
     text-align: left;
   }
 }
```

## Vérification attendue

| Cas | Bulle | Media | Texte | Actions | Débordement |
|-----|-------|-------|-------|---------|-------------|
| **Desktop** | 420×420px | 420×420px | Col 2, ligne 1, top-aligné | Col 2, ligne 2 | ❌ Non |
| **Mobile (390px)** | 296×296px | 296×296px | Centré sous bulle | Centré sous texte | ❌ Non |
| **Domaine** | Inchangé (carte 4:3 centrée) | | | | ✅ OK |

## Points clés techniques

1. **`grid-template-rows: auto auto`** : Définit explicitement 2 lignes au lieu de laisser `grid-template-areas` créer une grille implicite où "media" spanne 2 lignes.

2. **`grid-row: 1` sur `.history__bubble`** : Restreint la bulle à la première ligne seulement. Sa hauteur est désormais pilotée par `max-width: 420px` + `aspect-ratio: 1` = 420×420px.

3. **`align-self: start` sur la bulle** : Empêche le stretch vertical par défaut des items de grille (qui remplirait la hauteur de la ligne = hauteur du texte + actions).

4. **`align-items: start` sur le conteneur** : Assure que le texte (colonne 2, ligne 1) commence en haut, aligné avec le haut de la bulle.

5. **Mobile `max-width: 100%` + `box-sizing: border-box`** : Contient le panneau dans le viewport, évite le débordement horizontal.

6. **`aspect-ratio: 1` explicite sur mobile** : Garantit que la bulle reste carrée même si le parent n'a pas de contrainte de hauteur.

## Panneau Domaine — Inchangé
Le panneau `[data-panel="domaine"]` conserve sa grille 1 colonne avec carte 4:3 centrée, tel que requis.