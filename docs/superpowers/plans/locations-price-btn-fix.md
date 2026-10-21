# Plan : Corrections prix locations & bouton Réserver

## Contexte
Le carrousel "Nos locations" (5 cartes `.loc-card`) a deux problèmes :
1. **Prix qui disparaissent en EN/NL** : le `<p class="loc-card__price" data-i18n="loc.perNight">` englobe le `<span data-price>` ; au changement de langue, `textContent = "/ night"` écrase le span montant. Le suffixe "/ nuit" est déjà traduit dans i18n.js (FR/EN/NL). Solution : extraire le suffixe dans son propre `<span data-i18n="loc.perNight">` pour que le `<span data-price>` survive.
2. **Bouton "Réserver" trop large** : classe `.btn--sm` (padding 0.6rem 1.2rem, font 0.85rem). Réduire la largeur de ~50 % sur ces cartes uniquement.

## Contraintes globales
- Ne toucher qu'aux 5 cartes dans `#locationsTrack` (index.html lignes ~1373, 1414, 1455, 1496, 1537)
- CSS scoped à `.loc-card` pour ne pas affecter d'autres boutons
- Régénérer `css/style.min.css` après modification (la page charge le minifié)
- Les traductions i18n "loc.perNight" (FR/EN/NL) et "loc.book" (FR/EN/NL) existent déjà

# Task 1 : Restructure HTML prix + CSS centrage + bouton compact + build minifié

### Spécifications exactes

**A. index.html — 5 occurrences (une par carte `.loc-card`)**
Remplacer ce bloc (lignes 1373-1376, 1414-1417, 1455-1458, 1496-1499, 1537-1540) :
```html
<p class="loc-card__price" data-i18n="loc.perNight">
  <span class="loc-card__price-value" data-price></span> /
  nuit
</p>
```
Par :
```html
<p class="loc-card__price">
  <span class="loc-card__price-value" data-price></span>&nbsp;<span data-i18n="loc.perNight">/ nuit</span>
</p>
```
Note : le `data-i18n` ne porte plus sur le `<p>` parent mais sur un `<span>` enfant dédié au suffixe.

**B. css/style.css — deux ajouts après la règle `.loc-card__price-value` (vers ligne 2178)**
```css
/* Centrage de la ligne prix (montant + suffixe) */
.loc-card__price {
  display: flex;
  justify-content: center;
  align-items: baseline;
  gap: 0.25rem;
}

/* Bouton Réserver compact (~ -50 % largeur) — scoped aux locations */
.loc-card .btn--outline {
  padding: 0.42rem 0.5rem;
  font-size: 0.72rem;
  margin-top: 0.9rem;
  min-width: 0;
}
```

**C. Régénération artefact minifié**
Exécuter : `npx cssnano css/style.css css/style.min.css` (ou équivalent terser/cssnano dispo)

### Critères d'acceptation (spec compliance)
1. Dans les 5 cartes : le HTML contient bien `<span class="loc-card__price-value" data-price></span>&nbsp;<span data-i18n="loc.perNight">/ nuit</span>` sans `data-i18n` sur le `<p>` parent.
2. CSS : `.loc-card__price` a `display:flex; justify-content:center; align-items:baseline; gap:0.25rem;`
3. CSS : `.loc-card .btn--outline` a `padding:0.42rem 0.5rem; font-size:0.72rem; margin-top:0.9rem; min-width:0;`
4. `css/style.min.css` régénéré et plus récent que `css/style.css`
5. Test manuel : bascule FR → EN → NL → FR, les 5 prix affichent montant formaté + suffixe traduit, bouton "Réserver" visiblement plus étroit.