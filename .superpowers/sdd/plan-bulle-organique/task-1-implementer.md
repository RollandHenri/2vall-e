# Task 1: Implémentation bulle organique "Notre histoire"

## Contexte
Section `#decouvrir` → panneau `[data-panel="histoire"]` : passage d'une image rectangulaire 16/10 (desktop) / 4/3 (mobile) à une **bulle organique 1:1 à gauche, texte à droite** sur desktop ; bulle centrée + texte dessous sur mobile.

Le panneau `[data-panel="domaine"]` (le plan du camping) **ne change pas** : il reste en carte 4:3.

## Fichiers à modifier
1. `index.html` — lignes ~1571-1578 (img histoire)
2. `css/style.css` — section `/* ---------- 18. Histoire ---------- */` (lignes ~2255-2350)

## Modifications index.html
**Avant (l.1571-1578) :**
```html
<img
  class="history__media img img--history reveal"
  src="assets/img/pro.webp"
  width="1200"
  height="1600"
  alt="Le village et la vallée"
  loading="lazy"
  decoding="async"
  data-i18n-attr="alt:hist.aria"
/>
```

**Après :**
```html
<span class="history__bubble reveal">
  <img
    class="history__media img img--history"
    src="assets/img/pro.webp"
    width="1200"
    height="1600"
    alt="Le village et la vallée"
    loading="lazy"
    decoding="async"
    data-i18n-attr="alt:hist.aria"
  />
</span>
```
- Wrapper `<span class="history__bubble">` pour l'anneau décalé via `::before`
- Retrait de `reveal` sur l'img (reste sur le wrapper)
- `loading="lazy"` conservé

## Modifications css/style.css

### A. Remplacer le bloc `.history__inner--swap` et `.swap-panel` (lignes ~2275-2320)

**Nouveau CSS à insérer à la place (repère : commentaire `/* Panels d'alternance... */` jusqu'à avant `@media (prefers-reduced-motion: reduce)` l.2324) :**

```css
/* Panels d'alternance Histoire <-> Domaine : les deux panneaux partagent
   la même cellule de grille ; celui qui n'est pas actif est masqué en
   cross-fade (opacity + visibility, retiré du parcours clavier).
   Sur desktop ≥861px : "Notre histoire" = 2 colonnes (bulle | texte),
   "Le domaine" = 1 colonne (carte 4:3 centrée).
   Sur mobile ≤860px : les deux = 1 colonne, bulle/image centrée, texte dessous. */
.history__inner--swap {
  display: grid;
  grid-template-columns: 1fr;
}
.swap-panel {
  grid-area: 1 / 1;
  display: grid;
  grid-template-columns: 1fr;
  align-items: center;
  gap: clamp(1.5rem, 5vw, 4rem);
  transition:
    opacity 0.35s ease,
    visibility 0.35s ease;
}
.swap-panel:not(.is-active) {
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
}

/* --- Notre histoire : bulle organique --- */
.swap-panel[data-panel="histoire"] {
  /* Mobile : 1 colonne, contenu centré */
  text-align: center;
}
.swap-panel[data-panel="histoire"] .history__body {
  text-align: left;
}
.swap-panel[data-panel="histoire"] .swap-panel__actions {
  justify-content: center;
}

/* Desktop : 2 colonnes, bulle à gauche */
@media (min-width: 861px) {
  .swap-panel[data-panel="histoire"].is-active {
    grid-template-columns: minmax(0, 40%) 1fr;
    grid-template-areas:
      "media body"
      "media actions";
    align-items: start;
    text-align: left;
  }
  .swap-panel[data-panel="histoire"] .history__bubble {
    grid-area: media;
    justify-self: center;
  }
  .swap-panel[data-panel="histoire"] .history__body {
    grid-area: body;
    padding-top: 1.5rem;
  }
  .swap-panel[data-panel="histoire"] .swap-panel__actions {
    grid-area: actions;
    justify-content: flex-start;
  }
  .swap-panel[data-panel="histoire"] .history__body,
  .swap-panel[data-panel="histoire"] .swap-panel__actions {
    text-align: left;
  }
}

/* --- Le domaine : carte 4:3 inchangée --- */
.swap-panel[data-panel="domaine"] .history__media,
.swap-panel[data-panel="domaine"] .img--plan {
  aspect-ratio: 16/10;
}
@media (min-width: 861px) {
  .swap-panel[data-panel="domaine"] .history__media,
  .swap-panel[data-panel="domaine"] .img--plan {
    max-width: 60%;
    margin-inline: auto;
    aspect-ratio: 4/3;
  }
}

.swap-panel__actions {
  display: flex;
  padding-top: 0.75rem;
}
```

### B. Ajouter les styles de la bulle (après `.history__media` existant, avant `.history__body p`)

**Insérer après la règle `.history__media` (l.2261-2265) et avant `.history__body p` (l.2266) :**

```css
/* Bulle organique "Notre histoire" */
.history__bubble {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 420px;
  aspect-ratio: 1;
}
.history__bubble::before {
  content: "";
  position: absolute;
  inset: -14px;
  border: 1px solid var(--line);
  border-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;
  pointer-events: none;
}
.history__bubble .history__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;
  box-shadow: var(--shadow);
}

/* Focus visible pour l'accessibilité (si wrapper devient focusable) */
.history__bubble:focus-within::before {
  border-color: var(--terracotta);
}

/* Reduced motion : pas de transition sur l'anneau */
@media (prefers-reduced-motion: reduce) {
  .history__bubble::before {
    transition: none;
  }
}
```

### C. Supprimer / neutraliser les anciennes règles desktop qui s'appliquaient à `.swap-panel .history__media` sans distinction

Les règles à **supprimer** (lignes ~2345-2357) :
```css
/* Desktop : la photo n'occupe que la moitié de la largeur du bloc,
   centrée au-dessus du texte (ratio 16/10 conservé). */
@media (min-width: 861px) {
  .swap-panel .history__media {
    max-width: 60%;
    margin-inline: auto;
    /* +20 % de hauteur à largeur égale : passage du ratio 16/10 (0,625)
       au ratio 4/3 (0,75) = exactement 1,2 (0,75 / 0,625). */
    aspect-ratio: 4/3;
  }
}
```
→ Elles sont remplacées par la version scopée `[data-panel="domaine"]` ci-dessus.

## Contraintes strictes
- Ne toucher **qu'aux lignes indiquées**. Aucune modification ailleurs.
- Le radius organique `56% 44% 52% 48% / 47% 55% 45% 53%` doit apparaître **exactement** à 2 endroits (anneau + image).
- L'anneau est à `inset: -14px` (14 px hors de la bulle).
- `max-width: 420px` sur la bulle (correspond au `clamp(280px, 32vw, 420px)` des captures).
- `grid-template-columns: minmax(0, 40%) 1fr` évite l'overflow si le texte est long.
- `align-items: start` sur desktop pour que le texte commence au niveau du haut de la bulle.
- `loading="lazy"` conservé sur l'image.

## Rapport attendu
Le sous-agent écrit son rapport dans `C:\Users\rolla\Desktop\Dev_26\_Test_\T_Camp_Craw\.superpowers\sdd\plan-bulle-organique\task-1-report.md` avec :
- Status: DONE / DONE_WITH_CONCERNS / NEEDS_CONTEXT / BLOCKED
- Diff appliqué (git diff --stat)
- Lignes modifiées confirmées
- Préoccupations éventuelles