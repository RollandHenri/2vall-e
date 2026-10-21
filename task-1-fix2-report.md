# Task 1 — Fix Round 2 Report

**Status: DONE**

## Summary
Applied targeted CSS fixes to resolve 4 residual issues from Fix Round 1 in `css/style.css` only.

---

## Changes Applied

### A. Base `.history__bubble` Rule (lines 2268–2273) — **Unchanged**
```css
.history__bubble {
  position: relative;
  display: inline-block;
  width: 100%;
  max-width: 420px;        /* ← Desktop default preserved */
  aspect-ratio: 1;
}
```
- `max-width: 420px` remains as the desktop baseline value.

---

### B. Mobile ≤860px — Inside `.swap-panel[data-panel="histoire"]` Block (lines 2334–2348)
**Added:**
```css
.swap-panel[data-panel="histoire"] {
  text-align: center;
  width: 100%;              /* ← NEW: forces container within viewport */
  max-width: 100%;          /* ← NEW: prevents horizontal overflow */
}
.swap-panel[data-panel="histoire"] .history__bubble {
  max-width: min(76vw, 320px);   /* ← MOVED HERE ONLY (was outside media query) */
}
```
**Fixes:**
1. ✅ `max-width: min(76vw, 320px)` now scoped **only** to mobile (was leaking to desktop)
2. ✅ `width: 100%; max-width: 100%` on panel eliminates horizontal overflow (panel was 460px > 390px viewport)

---

### C. Desktop ≥861px — Inside `@media (min-width: 861px)` for Histoire (lines 2351–2377)
**Changed:**
```css
.swap-panel[data-panel="histoire"] .history__bubble {
  grid-area: media;
  justify-self: center;
  max-width: 420px;        /* ← REAFFIRMED desktop value */
  /* REMOVED: height: auto        (broke aspect-ratio: 1 → 320×427px) */
  /* REMOVED: align-self: start   (redundant; align-items: start on parent suffices) */
}
```
**Fixes:**
3. ✅ `height: auto` removed → `aspect-ratio: 1` honored → bubble stays 420×420px
4. ✅ `align-self: start` removed (parent `align-items: start` handles it)
5. ✅ `max-width: 420px` explicitly reaffirmed for clarity

---

### D. Media Fill (Unchanged — Already Correct)
```css
.history__bubble .history__media {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 56% 44% 52% 48% / 47% 55% 45% 53%;
  box-shadow: var(--shadow);
}
```
- `height: 100%` + `object-fit: cover` now fills the square bubble correctly on both breakpoints.

---

## Verification Checklist

| Checkpoint | Expected | Status |
|------------|----------|--------|
| Desktop bubble size | 420×420px | ✅ |
| Desktop media fill | 420×420px (cover) | ✅ |
| Mobile bubble size | ~296×296px (76vw, capped 320px) | ✅ |
| Mobile media fill | ~296×296px (cover) | ✅ |
| Horizontal overflow mobile | None (panel ≤ viewport) | ✅ |
| Domaine panel unchanged | 4:3 card, centered | ✅ |
| `max-width: min(76vw,320px)` scoped to mobile only | Yes | ✅ |
| `max-width: 420px` scoped to desktop only | Yes | ✅ |
| No `height: auto` on desktop bubble | Removed | ✅ |

---

## Concerns / Follow-up

1. **`gap: clamp(1.5rem, 5vw, 4rem)` on `.swap-panel`** — Acceptable for mobile; keeps inner spacing fluid without exceeding viewport.

2. **`.history__media` base rule (line 2262) has `aspect-ratio: 3/4`** — This applies to the *standalone* usage (non-bubble). The bubble override at line 2283–2288 correctly uses `width: 100%; height: 100%; object-fit: cover` with the organic border-radius, so no conflict.

3. **Reduced motion** — Existing `@media (prefers-reduced-motion: reduce)` rules preserved for `.swap-panel` transitions and `.history__bubble::before`.

4. **No changes to HTML/JS** — Pure CSS fix as required.

---

## Diff Summary (Key Hunks)

```diff
@@ .swap-panel[data-panel="histoire"] {
+  width: 100%;
+  max-width: 100%;
 }
 .swap-panel[data-panel="histoire"] .history__bubble {
   max-width: min(76vw, 320px);   /* mobile-only */
 }
@@ @media (min-width: 861px) {
 .swap-panel[data-panel="histoire"] .history__bubble {
   grid-area: media;
   justify-self: center;
-  align-self: start;
-  height: auto;
+  max-width: 420px;              /* desktop reaffirmed */
 }
```