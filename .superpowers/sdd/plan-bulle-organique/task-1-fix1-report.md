# Fix Round 1 - Task 1 Report

## Status: DONE

## Diff Applied

The following changes were made to `css/style.css`:

### 1. Mobile ≤860px: max-width constraint for history bubble
**Location**: Inside `.swap-panel[data-panel="histoire"]` block (mobile styles, outside media query)

```css
.swap-panel[data-panel="histoire"] .history__bubble {
  max-width: min(76vw, 320px);
}
```

**Fixes**: The desktop `max-width: 420px` from the base `.history__bubble` rule was leaking into mobile. This new rule overrides it with a responsive mobile-appropriate constraint (~296px at 390px viewport, capped at 320px).

### 2. Desktop ≥861px: Prevent vertical stretching of history bubble
**Location**: Inside `@media (min-width: 861px)` → `.swap-panel[data-panel="histoire"] .history__bubble`

```css
.swap-panel[data-panel="histoire"] .history__bubble {
  grid-area: media;
  justify-self: center;
  align-self: start;   /* NEW */
  height: auto;        /* NEW */
}
```

**Fixes**: The shared grid with the "domaine" panel imposed a 560px row height. `align-items: start` on the container wasn't constraining the bubble itself. `align-self: start` + `height: auto` lets the bubble keep its 1:1 aspect-ratio (420×420px) instead of stretching to 560px.

### 3. Base rule: Media fills bubble in both contexts
**Location**: Base `.history__bubble .history__media` rule (line ~2285)

```css
.history__bubble .history__media {
  width: 100%;
  height: 100%;        /* Already present in base commit */
  object-fit: cover;
  border-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;
  box-shadow: var(--shadow);
}
```

**Status**: Already implemented in base commit `9e86be7`. Ensures the image fills the bubble's organic shape on both mobile and desktop.

## Confirmation

All three corrections identified by the visual verifier are now in place:
- ✅ Desktop bubble respects 420×420px (not stretched to 560px)
- ✅ Mobile bubble constrained to ~296px (not 420px desktop leak)
- ✅ Media fills bubble height in both breakpoints

## Concerns

None. Changes are minimal, targeted, and don't affect:
- Border radius / organic ring
- Grid-area assignments
- "Domaine" panel behavior
- Reduced-motion / accessibility rules