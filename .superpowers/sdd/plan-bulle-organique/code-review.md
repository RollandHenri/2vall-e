# Code Review — Tâche 1 : Bulle organique "Notre histoire"

**Status: APPROVED** (avec 1 finding *Medium* et 2 suggestions *Low*)

---

## Résumé

L'implémentation de la bulle organique pour le panneau "Notre histoire" est **solide, accessible et performante**. Le code respecte l'architecture existante, ne casse aucune régression, et les patterns CSS/JS sont cohérents avec le reste du projet.

---

## Findings

### 🟡 Medium — Focus visible sur `.history__bubble:focus-within` non fonctionnel par défaut

| Fichier | Ligne | Problème |
|---------|-------|----------|
| `css/style.css` | 2292 | `.history__bubble:focus-within::before` ne s'activera jamais car le wrapper `<span>` n'est pas focusable et son descendant `<img>` ne l'est pas non plus. |

**Analyse** : Le sélecteur `:focus-within` ne déclenche que si un *descendant* reçoit le focus. Or :
- `<span class="history__bubble">` n'est pas focusable (`tabindex` absent, pas d'élément interactif natif)
- `<img class="history__media">` n'est pas focusable (pas `tabindex`, pas `usemap`)

**Fix suggéré** : Soit ajouter `tabindex="0"` sur le `<span>` (et gérer le focus clavier), soit remplacer par `.history__bubble:focus-visible::before` si on veut styler le focus direct sur le wrapper, soit retirer la règle si non nécessaire (l'anneau est décoratif, pas interactif).

> **Recommandation** : Ajouter `tabindex="0"` + `role="img"` + `aria-label` (via i18n) sur le `<span>` pour en faire un élément focusable sémantique, ou simplifier en supprimant cette règle si l'anneau n'a pas vocation à recevoir le focus.

---

### 🔵 Low — Radius organique dupliqué (2 occurrences)

| Fichier | Lignes | Problème |
|---------|--------|----------|
| `css/style.css` | 2280, 2287 | `border-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;` répété sur `::before` (anneau) et `.history__media` (image). |

**Fix suggéré** : Extraire en variable CSS `--bubble-radius` (dans `:root` ou scope `.history__bubble`) pour DRY et maintenance future.

```css
.history__bubble {
  --bubble-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;
}
.history__bubble::before { border-radius: var(--bubble-radius); }
.history__bubble .history__media { border-radius: var(--bubble-radius); }
```

---

### 🔵 Low — Commentaire ligne 2310 : "16/10 mobile" pour le domaine

| Fichier | Ligne | Problème |
|---------|-------|----------|
| `css/style.css` | 2311 | Le commentaire dit "16/10 mobile" mais le code (l. 2376) montre `aspect-ratio: 16/10` pour le domaine *par défaut* (mobile first), ce qui est correct. Le commentaire est juste imprécis : il suggère que 16/10 est *seulement* mobile alors que c'est la valeur de base, overridée en 4/3 desktop. |

**Fix suggéré** : Clarifier le commentaire : « Sur mobile ≤860px : les deux = 1 colonne ; histoire = bulle 1/1, domaine = carte 16/10 centrée. Sur desktop ≥861px : histoire = 2 colonnes, domaine = carte 4/3 centrée à 60%. »

---

## Vérifications par critère

### 1. Spécificité CSS / Conflits ✅
- `.history__bubble .history__media` (l. 2283) vs anciennes règles `.swap-panel .history__media` **supprimées** — aucun conflit résiduel.
- Scoping `[data-panel="histoire"]` / `[data-panel="domaine"]` correct, pas de fuite.
- `grid-template-areas` définie **uniquement** sur `.swap-panel[data-panel="histoire"].is-active` (l. 2347-2351) — correct.

### 2. Breakpoint 860/861px ✅
- Cohérence totale : 13 occurrences dans le fichier, toutes utilisent `min-width: 861px` (desktop) / `max-width: 860px` (mobile).
- **Pas de trou** entre 860px et 861px (frontière nette).

### 3. Accessibilité ✅ (hors focus-within ci-dessus)
- `alt` conservé sur l'image (l. 1632 HTML) — ✅
- `loading="lazy"` préservé (l. 1633) — ✅
- `prefers-reduced-motion` respecté :
  - Anneau : `transition: none` (l. 2297-2301) — ✅
  - Cross-fade panels : `transition: none` (l. 2391-2395) — ✅

### 4. Performance / Bonnes pratiques ✅
- `inline-block` + `width: 100%` + `max-width: 420px` + `aspect-ratio: 1` — pas de reflow layout.
- `object-fit: cover` sur l'image (l. 2286) — ✅
- Aucun `!important`, aucun `z-index` inutile — ✅
- `contain: paint` non utilisé ici mais non nécessaire (pas de layout thrashing détecté).

### 5. Maintenabilité ✅
- Radius organique dupliqué → voir finding *Low* #2.
- Commentaires mis à jour et cohérents — ✅ (hors imprécision *Low* #3).
- Nommage `.history__bubble` explicite vs wrapper générique — ✅.

### 6. Régressions potentielles ✅
- Panneau "domaine" : carte 4:3 centrée desktop (`max-width: 60%`, `margin-inline: auto`, l. 2378-2384), 16/10 mobile (l. 2376) — ✅ vérifié.
- Animation cross-fade `.swap-panel` (opacity/visibility, 0.35s) — intacte (l. 2323-2331).
- Autres sections utilisant `.history__media` :
  - Section histoire non-swap (`.history__inner`, l. 2255-2265) : conserve `aspect-ratio: 3/4` + `border-radius: var(--radius)` — **non impactée**.
  - Mobile ≤860px (l. 3660-3662) : override `aspect-ratio: 16/10` pour la version non-swap — **non impactée** (media query distincte).
  - Features, deck, locations : n'utilisent pas `.history__media` — ✅.

---

## Verdict global

**APPROVED** — L'implémentation est prête pour merge. Le finding *Medium* (focus-within) est une amélioration accessibilité optionnelle (l'anneau est décoratif), les deux *Low* sont de la dette technique mineure (DRY, commentaire).

> **Action recommandée** : Corriger le focus-within (ajouter `tabindex="0"` + rôle accessible sur le `<span>` OU retirer la règle) avant mise en prod si la bulle doit être focusable au clavier. Sinon, merge tel quel.