# Task 1 Report: Fix `style.css` mobile curtain

## Status: DONE

## Changes Made

**File:** `css/style.css` (lines 3632-3651 within `@media (max-width: 860px)` block)

### Diff

```diff
  /* Rideau épinglé aussi sur mobile : contenu en haut, décollé du héro
-     par une marge, et rideau animé confiné à la moitié basse — même
+     par une marge, et rideau qui recouvre toute la hauteur (texte inclus)
+     comme en desktop — même scrub que le desktop (cf. §12 et le JS « Rideau sipario »). */
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
-    top: 50%;
+    top: 0;
+    bottom: 0;
   }
```

## Concerns

None. The change is isolated to the `@media (max-width: 860px)` block as required. Desktop CSS (§12, lines 1363-1463) remains untouched. No HTML or JS modifications were made.

## Test Summary

Verified the modified file reads back correctly with updated comment and `.sipario__panel` now using `top: 0; bottom: 0;` for full-height curtain coverage on mobile.