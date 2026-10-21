# Plan: Mobile Curtain Animation Fix

## Intent
Sur mobile (≤ 860px), l'animation du rideau (sipario) doit recouvrir le texte comme sur desktop, au lieu d'être confinée à la moitié basse de l'écran.

## Current State
- **Desktop** (`style.css` §12, lignes 1363-1463) : panneaux `.sipario__panel` en pleine hauteur (`top: 0; bottom: 0`) → rideau recouvre tout le contenu, texte inclus.
- **Mobile** (`@media (max-width: 860px)`, lignes 3562-3580) : panneaux passés à `top: 50%` avec `display: block` → rideau confiné à la moitié basse, ne recouvre pas le texte.
- **Pas de build** : `style.css` et `style.min.css` maintenus à la main.
- **Aucun changement JS nécessaire** : le scrub déplace les panneaux horizontalement quelle que soit leur position verticale.

## Tasks

### Task 1: Fix `style.css` mobile curtain
Modify `@media (max-width: 860px)` block for `.sipario__panel`:
- Remove `top: 50%`
- Restore `top: 0; bottom: 0` (full height, like desktop)
- Update the section comment to reflect the change

Files: `css/style.css` (lines ~3562-3580)

### Task 2: Fix `style.min.css` mobile curtain
Apply identical change to the minified version:
- Find the `@media (max-width: 860px)` block for `.sipario__panel`
- Change `top: 50%` to `top: 0; bottom: 0`
- Update the comment

Files: `css/style.min.css` (lines ~2816-2831)

## Global Constraints
- **Desktop must remain unchanged** — only mobile (≤ 860px) is affected
- Both CSS files must stay in sync
- No HTML or JS changes
- Changes are purely CSS positioning

## Success Criteria
- On mobile (≤ 860px), the curtain panels cover the full height of the sticky block
- The text content is revealed when curtains are open, covered when closed — exactly like desktop
- Desktop behavior unchanged
- Both `style.css` and `style.min.css` reflect the fix