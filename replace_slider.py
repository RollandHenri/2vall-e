import re

with open('C:/Users/rolla/Desktop/Dev_26/_Test_/T_Camp_Craw/js/script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Find the initCenterSlider function
start = content.find('function initCenterSlider(cfg)')
if start == -1:
    print('Function not found')
    exit(1)

# Find the end of the function by counting braces
brace_count = 0
in_function = False
end = start
for i, ch in enumerate(content[start:], start):
    if ch == '{':
        brace_count += 1
        in_function = True
    elif ch == '}':
        brace_count -= 1
        if in_function and brace_count == 0:
            end = i + 1
            break

new_func = '''/* ============================================================
   Carrousel "centres élargis" (locations + galerie camping)
   Principe : une seule fonction pour les deux carrousels.
   La slide centrée est agrandie (.is-active pilote le CSS) et le
   glissement est une vraie transition CSS (transform .3s ease) :
   goTo() mesure la position finale en FLIP (transitions coupées via
   .is-measuring), restaure l'état de départ, puis lâche le track —
   le CSS fait tout le lissage (courbe ease), plus de rAF.
   cfg = { root, track, slide, prev, next, dots, dotLabel(n),
            loop, autoplay }.
   ============================================================ */
  function initCenterSlider(cfg) {
    var root = $(cfg.root);
    if (!root) return;
    var track = $(cfg.track);
    var viewport = $('.slider__viewport', root) || (track && track.parentElement);
    var originals = $$(cfg.slide, track);
    var prev = $(cfg.prev);
    var next = $(cfg.next);
    var dotsWrap = $(cfg.dots);
    if (!track || !viewport || !originals.length) return;
    var dotLabel = cfg.dotLabel; /* n (1-based) -> libelle i18n de la pastille */
    var loop = !!cfg.loop;
    var autoplay = cfg.autoplay !== false;

    /* --- Loop : cloner k slides en tete et en queue --- */
    var CLONES_PER_SIDE = 2;
    var slides = originals;
    if (loop) {
      var fragBefore = document.createDocumentFragment();
      var fragAfter = document.createDocumentFragment();
      for (var k = 0; k < CLONES_PER_SIDE; k++) {
        var before = originals[originals.length - 1 - k].cloneNode(true);
        var after = originals[k].cloneNode(true);
        before.setAttribute('aria-hidden', 'true');
        before.setAttribute('inert', '');
        after.setAttribute('aria-hidden', 'true');
        after.setAttribute('inert', '');
        before.querySelectorAll('a,button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
        after.querySelectorAll('a,button').forEach(function (el) { el.setAttribute('tabindex', '-1'); });
        fragBefore.appendChild(before);
        fragAfter.appendChild(after);
      }
      track.insertBefore(fragBefore, track.firstChild);
      track.appendChild(fragAfter);
      slides = $$(cfg.slide, track);
    }

    var index = 0; /* index LOGIQUE 0..originals.length-1 */
    var dragging = false;
    var startX = 0;
    var dragBaseX = 0;
    var wrapPending = false;
    var wrapDir = 0; /* -1 = wrap vers la fin, +1 = wrap vers le debut */

    function originalCount() { return originals.length; }
    function maxLogicalIndex() { return originalCount() - 1; }
    function logicalToPhysical(i) { return loop ? CLONES_PER_SIDE + i : i; }
    function physicalToLogical(i) { return loop ? i - CLONES_PER_SIDE : i; }
    function wrapLogical(i) {
      var n = originalCount();
      return ((i % n) + n) % n;
    }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= maxLogicalIndex(); i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', dotLabel(i + 1));
          b.addEventListener('click', function () { goTo(i); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }

    function centeredX(card) {
      var padLeft =
        (parseFloat(window.getComputedStyle(viewport).paddingLeft) || 0) +
        viewport.clientLeft;
      return (
        viewport.clientWidth / 2 -
        padLeft -
        (card.offsetLeft + card.offsetWidth / 2)
      );
    }

    function visualX() {
      var t = window.getComputedStyle(track).transform;
      var m = t && t !== 'none' ? t.match(/matrix(?:3d)?\(([^)]+)\)/) : null;
      if (m) {
        var n = m[1].split(',').map(parseFloat);
        return n.length === 6 ? n[4] : n[12];
      }
      return centeredX(slides[logicalToPhysical(index)]);
    }

    function centerActive() {
      track.style.transform = 'translate3d(' + centeredX(slides[logicalToPhysical(index)]) + 'px,0,0)';
    }

    function paintArrows() {
      if (!loop) {
        if (prev) prev.disabled = index <= 0;
        if (next) next.disabled = index >= maxLogicalIndex();
      }
      if (dotsWrap) {
        $$('button', dotsWrap).forEach(function (d, i) {
          d.classList.toggle('is-active', i === index);
          if (i === index) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }
      /* Region live pour l'annonce "n sur N" */
      if (root && root.dataset.ariaLive) {
        root.dataset.ariaLive = (index + 1) + ' sur ' + originalCount();
      }
    }

    function flushWrap() {
      if (!wrapPending) return;
      wrapPending = false;
      var targetPhys = logicalToPhysical(index);
      track.classList.add('is-measuring');
      track.style.transform = 'translate3d(' + centeredX(slides[targetPhys]) + 'px,0,0)';
      void track.offsetHeight;
      track.classList.remove('is-measuring');
    }

    function goTo(i, instant) {
      var n = originalCount();
      var j = wrapLogical(i);
      var prevIndex = index;
      var prevPhys = logicalToPhysical(prevIndex);
      var targetPhys = logicalToPhysical(j);

      /* Si on demande un wrap immediat (clic fleche depuis les extremites) */
      if (loop && ((j === 0 && prevIndex === maxLogicalIndex()) || (j === maxLogicalIndex() && prevIndex === 0))) {
        wrapDir = (j === 0) ? -1 : 1;
        wrapPending = true;
      }

      /* a. Changement de slide avec glissement (cas normal) */
      if (j !== prevIndex && !instant) {
        var anchor = visualX();
        track.classList.add('is-measuring');
        slides.forEach(function (s, n) { s.classList.toggle('is-active', n === targetPhys); });
        var x = centeredX(slides[targetPhys]);
        slides.forEach(function (s, n) { s.classList.toggle('is-active', n === prevPhys); });
        track.style.transform = 'translate3d(' + anchor + 'px,0,0)';
        void track.offsetHeight;
        track.classList.remove('is-measuring');
        index = j;
        slides.forEach(function (s, n) { s.classList.toggle('is-active', n === targetPhys); });
        paintArrows();
        /* Gestion focus/tabindex : seul le lien de la slide active reste tabulable */
        updateTabIndex();
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
        scheduleAuto();
        return;
      }

      /* b. Retour au centre apres un drag court : glissement doux */
      if (j === prevIndex && !instant) {
        var x2 = centeredX(slides[index]);
        track.style.transform = 'translate3d(' + x2 + 'px,0,0)';
        scheduleAuto();
        return;
      }

      /* c. Positionnement instantane */
      track.classList.add('is-measuring');
      index = j;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === targetPhys); });
      paintArrows();
      updateTabIndex();
      var x3 = centeredX(slides[targetPhys]);
      track.style.transform = 'translate3d(' + x3 + 'px,0,0)';
      void track.offsetHeight;
      track.classList.remove('is-measuring');
      scheduleAuto();
    }

    function updateTabIndex() {
      /* Seul le CTA de la slide active est tabulable */
      originals.forEach(function (card, i) {
        var link = card.querySelector('a[href="#locations"]');
        if (link) link.setAttribute('tabindex', i === index ? '0' : '-1');
      });
    }

    if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
    if (next) next.addEventListener('click', function () { goTo(index + 1); });

    /* Drag / swipe */
    track.addEventListener('pointerdown', function (e) {
      flushWrap(); /* executer le wrap en attente avant de demarrer le drag */
      dragging = true; startX = e.clientX;
      clearAuto();
      dragBaseX = visualX();
      track.style.transform = 'translate3d(' + dragBaseX + 'px,0,0)';
      track.classList.add('is-measuring');
      if (track.setPointerCapture) track.setPointerCapture(e.pointerId);
    });
    track.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      track.style.transform = 'translate3d(' + (dragBaseX + (e.clientX - startX)) + 'px,0,0)';
    });
    function endDrag(e) {
      if (!dragging) return;
      dragging = false;
      track.classList.remove('is-measuring');
      var dx = (e.clientX || startX) - startX;
      var threshold = 50;
      var wasClick = Math.abs(dx) < 5; /* clic sans glisser */
      if (dx < -threshold) goTo(index + 1);
      else if (dx > threshold) goTo(index - 1);
      else goTo(index);
      if (wasClick) {
        /* Clic sur un lien dans la slide : laisser le navigateur suivre le href */
        var link = e.target.closest('a');
        if (link && link.href && link.href !== location.href + '#locations') return;
        /* Sinon on empeche le clic fantome apres drag */
        e.preventDefault();
      }
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    /* Navigation clavier */
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
      else if (e.key === 'Home') { e.preventDefault(); goTo(0); }
      else if (e.key === 'End') { e.preventDefault(); goTo(maxLogicalIndex()); }
    });

    /* ResizeObserver + window.resize fallback */
    var ro = 'ResizeObserver' in window ? new ResizeObserver(function () {
      if (dragging) return;
      track.classList.add('is-measuring');
      centerActive();
      void track.offsetHeight;
      track.classList.remove('is-measuring');
      updateTabIndex();
    }) : null;
    if (ro) ro.observe(viewport);
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        if (dragging) return;
        track.classList.add('is-measuring');
        centerActive();
        void track.offsetHeight;
        track.classList.remove('is-measuring');
        updateTabIndex();
      }, 120);
    });

    /* ============================================================
       Auto-defilement (optionnel, ping-pong pour camping, desactive pour locations) */
    var AUTO_DELAY = 6000;
    var autoDir = 1;
    var autoTimer = null;
    var autoHover = false;
    var autoTab = true;
    var autoInView = true;

    function clearAuto() {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    }

    function scheduleAuto() {
      clearAuto();
      if (!autoplay) return;
      if (window.matchMedia('(hover: none)').matches) return;
      if (reduceMotion || autoHover || !autoTab || !autoInView) return;
      if (slides.length < 2) return;
      autoTimer = setTimeout(stepAuto, AUTO_DELAY);
    }

    function stepAuto() {
      autoTimer = null;
      if (dragging) { scheduleAuto(); return; }
      if (loop) {
        goTo(index + 1);
      } else {
        if (index >= maxLogicalIndex()) autoDir = -1;
        else if (index <= 0) autoDir = 1;
        goTo(index + autoDir);
      }
    }

    /* Pause au survol */
    root.addEventListener('mouseenter', function () { autoHover = true; clearAuto(); });
    root.addEventListener('mouseleave', function () { autoHover = false; scheduleAuto(); });

    /* Pause au focus clavier (accessibilite) */
    root.addEventListener('focusin', function () { autoHover = true; clearAuto(); });
    root.addEventListener('focusout', function () { autoHover = false; scheduleAuto(); });

    document.addEventListener('visibilitychange', function () {
      autoTab = !document.hidden;
      if (autoTab) scheduleAuto(); else clearAuto();
    });

    document.addEventListener('motionchange', function () {
      if (reduceMotion) clearAuto(); else scheduleAuto();
    });

    if ('IntersectionObserver' in window) {
      (new IntersectionObserver(function (entries) {
        autoInView = entries[0].isIntersecting;
        if (autoInView) scheduleAuto(); else clearAuto();
      }, { threshold: 0.25 })).observe(root);
    }

    buildDots();
    goTo(cfg.initial || 0, true);
    updateTabIndex();

    /* Changement de langue : relire les labels des pastilles ET reformater les prix */
    document.addEventListener('langchange', function () {
      if (!dotsWrap) return;
      $$('button', dotsWrap).forEach(function (d, i) {
        d.setAttribute('aria-label', dotLabel(i + 1));
      });
      formatLocPrices();
    });

    /* Exposer pour le formatage des prix */
    root.formatLocPrices = formatLocPrices;

    return { formatLocPrices: formatLocPrices };
  }'''

new_content = content[:start] + new_func + content[end:]
with open('C:/Users/rolla/Desktop/Dev_26/_Test_/T_Camp_Craw/js/script.js', 'w', encoding='utf-8') as f:
    f.write(new_content)
print('Done!')