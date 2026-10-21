# Task 1: Fix `style.css` mobile curtain

## Context
This is Task 1 of the mobile curtain fix plan. The goal is to make the mobile curtain animation cover the text content (like desktop) instead of being confined to the bottom half.

## Requirements (verbatim from plan)
Modify `@media (max-width: 860px)` block for `.sipario__panel` in `css/style.css`:
- Remove `top: 50%`
- Restore `top: 0; bottom: 0` (full height, like desktop)
- Update the section comment to reflect the change

## Current Code (lines ~3562-3580 in style.css)
```css
  /* Rideau épinglé aussi sur mobile : contenu en haut, décollé du héro
     par une marge, et rideau animé confiné à la moitié basse — même
     scrub que le desktop (cf. §12 et le JS « Rideau sipario »). */
  .sipario {
    height: 200vh; /* zone de scroll pour le scrub (desktop : 220vh) */
  }
  .sipario__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
  }
  .sipario__content {
    align-self: start; /* colle le contenu en haut du bloc épinglé */
    margin-top: calc(var(--header-h) + 3rem); /* décolle du héro */
  }
  .sipario__panel {
    display: block; /* réactivé : le rideau anime la moitié basse */
    top: 50%;
  }
```

## Expected Result
```css
  /* Rideau épinglé aussi sur mobile : contenu en haut, décollé du héro
     par une marge, et rideau qui recouvre toute la hauteur (texte inclus)
     comme en desktop — même scrub que le desktop (cf. §12 et le JS « Rideau sipario »). */
  .sipario {
    height: 200vh; /* zone de scroll pour le scrub (desktop : 220vh) */
  }
  .sipario__sticky {
    position: sticky;
    top: 0;
    height: 100vh;
  }
  .sipario__content {
    align-self: start; /* colle le contenu en haut du bloc épinglé */
    margin-top: calc(var(--header-h) + 3rem); /* décolle du héro */
  }
  .sipario__panel {
    display: block;
    top: 0;
    bottom: 0;
  }
```

## Files to Modify
- `css/style.css` (lines ~3562-3580)

## Report File
Write full report to: `.superpowers/sdd/mobile-curtain-fix-plan/task-1-report.md`

## Constraints
- Desktop CSS (§12, lines 1363-1463) must remain UNCHANGED
- Only the `@media (max-width: 860px)` block is affected
- No HTML or JS changes