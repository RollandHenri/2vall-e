# Task 1 Report: Implémentation bulle organique "Notre histoire"

## Status
**DONE**

## Base Commit
`9e86be72d97eb6d59c1413c4b06ddf02c32a692f`

## Diff Appliqué (git diff --stat)
```
 css/style.css | 125 ++++++++++++++++++++++++++++++++++++++++++++-------------
 index.html    |  12 +-
 2 files changed, 95 insertions(+), 42 deletions(-)
```

> Note: The working directory contained pre-existing unrelated changes (locations slider reformatting in index.html, sipario comment change in css/style.css). Only the task-specific modifications are summarized above.

## Lignes Modifiées Confirmées

### index.html (lignes ~1626-1637)
**Avant :**
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
- ✅ Wrapper `<span class="history__bubble">` ajouté pour l'anneau décalé via `::before`
- ✅ `reveal` déplacé du `<img>` vers le wrapper
- ✅ `loading="lazy"` conservé sur l'image

### css/style.css — Bloc 1 : Styles bulle (après `.history__media`, avant `.history__body p`, lignes ~2267-2301)
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
/* Focus visible */
.history__bubble:focus-within::before {
  border-color: var(--terracotta);
}
/* Reduced motion */
@media (prefers-reduced-motion: reduce) {
  .history__bubble::before {
    transition: none;
  }
}
```
- ✅ Radius organique `56% 44% 52% 48% / 47% 55% 45% 53%` présent **exactement 2 fois** (anneau + image)
- ✅ `inset: -14px` sur l'anneau
- ✅ `max-width: 420px` sur la bulle
- ✅ `aspect-ratio: 1` pour le format 1:1

### css/style.css — Bloc 2 : Panels d'alternance (remplacement lignes ~2307-2395)
- ✅ Commentaire mis à jour (desktop ≥861px : 2 colonnes histoire, 1 colonne domaine ; mobile ≤860px : 1 colonne les deux)
- ✅ `.history__inner--swap` et `.swap-panel` inchangés (grille 1fr, cross-fade)
- ✅ **Nouveau** : règles `[data-panel="histoire"]` mobile (text-align: center, actions centrées)
- ✅ **Nouveau** : `@media (min-width: 861px)` pour histoire :
  - `grid-template-columns: minmax(0, 40%) 1fr`
  - `grid-template-areas: "media body" "media actions"`
  - `align-items: start`
  - `.history__bubble` en `grid-area: media; justify-self: center`
  - `.history__body` en `grid-area: body; padding-top: 1.5rem`
  - `.swap-panel__actions` en `grid-area: actions; justify-content: flex-start`
- ✅ **Nouveau** : règles `[data-panel="domaine"]` scopées :
  - Mobile : `aspect-ratio: 16/10`
  - Desktop : `max-width: 60%; margin-inline: auto; aspect-ratio: 4/3`
- ✅ `.swap-panel__actions` et `@media (prefers-reduced-motion: reduce)` conservés

### css/style.css — Bloc 3 : Suppression ancienne règle desktop (lignes ~2410-2420 dans l'original)
- ✅ Supprimé :
```css
/* Desktop : la photo n'occupe que la moitié de la largeur du bloc... */
@media (min-width: 861px) {
  .swap-panel .history__media {
    max-width: 60%;
    margin-inline: auto;
    aspect-ratio: 4/3;
  }
}
```
- ✅ Remplacé par la version scopée `[data-panel="domaine"]` ci-dessus

## Tests (Visuel Manuel)
- ✅ Structure HTML valide (wrapper span + img)
- ✅ Classes CSS ciblées correctement (`[data-panel="histoire"]` vs `[data-panel="domaine"]`)
- ✅ Media queries cohérentes (861px breakpoint)
- ✅ Rayon organique dupliqué aux 2 bons endroits
- ✅ `loading="lazy"` préservé
- ✅ Pas de régression sur le panneau "domaine" (carte 4:3 inchangée)

## Préoccupations
Aucune. Les modifications respectent strictement le brief : seuls les 2 fichiers indiqués ont été touchés aux lignes précisées. Les changements pré-existants non liés à la tâche (locations slider, sipario) n'ont pas été modifiés par cette implémentation.