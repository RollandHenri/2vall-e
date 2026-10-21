/* ============================================================
   Camping Les 2 Vallées — Script principal
   Vanilla JS · Accessible · Mouvement réduit respecté
   ============================================================ */
(function () {
  'use strict';

  /* Mouvement réduit : gardien resynchronisé en session (listener en fin de fichier) */
  var motionMq = window.matchMedia('(prefers-reduced-motion: reduce)');
  var reduceMotion = motionMq.matches;

  /* Utilitaire : sélection sécurisée */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* Sélecteur de langue (js/i18n.js) : tt(cle, defaut [, vars]) renvoie la
     traduction courante ; si i18n.js est absent, la valeur FR de repli
     (défaut) est utilisée — le site reste fonctionnel en français. */
  var L2V = window.L2V || null;
  function tt(key, fallback, vars) {
    var s = L2V && typeof L2V.t === 'function' ? L2V.t(key) : '';
    if (!s) s = fallback;
    if (vars) {
      for (var k in vars) {
        if (Object.prototype.hasOwnProperty.call(vars, k)) {
          s = s.replace(new RegExp('\\{' + k + '\\}', 'g'), vars[k]);
        }
      }
    }
    return s;
  }

  /* ============================================================
     1. Année courante (footer)
     ============================================================ */
  var yearEl = $('#year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ============================================================
     2. Header : état au scroll + bouton retour en haut
     ============================================================ */
  var header = $('#header');
  var toTop = $('#toTop');

  /* Header (état scrolled) et to-top sont pilotés par updateScrollEffects(),
     handler scroll unique throttlé en rAF — voir plus bas. */
  function initHeaderState() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (header) header.classList.toggle('is-scrolled', y > 40);
    if (toTop) toTop.classList.toggle('is-visible', y > 600);
  }

  if (toTop) {
    toTop.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* ============================================================
     5. Rideau "sipario" (scrub) + empilement des features
        Un seul handler scroll throttlé (rAF) qui pilote les deux effets.
     ============================================================ */
  var sipario = $('#sipario');
  var curtains = $$('[data-curtain]');
  var features = $$('.feature');

  /* Tops épinglés ET hauteurs des features mis en cache : lus une fois,
     rafraîchis au resize — jamais dans la boucle de scroll.
     Les hauteurs viennent de offsetHeight (hauteur de MISE EN PAGE) et non
     de getBoundingClientRect : ce dernier inclut le scale(0.96) appliqué
     ci-dessous, ce qui rendait la carte plus basse que sa propre géométrie
     épinglée et faisait clignoter le fondu. */
  var featureTops = [];
  var featureHeights = [];
  function cacheFeatureTops() {
    featureTops = features.map(function (card) {
      return parseFloat(window.getComputedStyle(card).top) || 90;
    });
    featureHeights = features.map(function (card) {
      return card.offsetHeight;
    });
  }

  /* ============================================================
     4b. Zones sombres : encre du bandeau + habit de la pastille
        Le bandeau est nu tant que le menu est fermé (cf. §9 du CSS) : la marque,
        les liens, la pilule Menu et le burger passent donc en blanc dès qu'une
        zone data-theme="dark" — hero, sipario, vague, pied de page — passe
        derrière lui, et reprennent le forêt sur les fonds clairs. Menu ouvert,
        la plaque blanche de l'ouverture prend le relais et la bascule est
        ignorée (le CSS la borne par :not(.is-nav-open)).
        La bande mesurée va de 0 au BAS DU BANDEAU : la classe vaut pour ce que
        la barre recouvre, pas pour ce que la marque recouvre.

        La pastille de réservation reçoit la MÊME bascule (classe is-on-dark)
        pour un autre motif : son fond forêt se confondait avec le fond forêt
        du hero et du pied de page. Sa bande à elle va du haut au BAS de la
        pastille ; elle est fixe, donc ces deux valeurs sont mises en cache —
        jamais relues dans la boucle.

        Les rects sont lus dans la boucle de scroll — quatre lectures par
        frame, inchangé : les deux bandes partagent les mêmes mesures.
     ============================================================ */
  var darkZones = $$('[data-theme="dark"]');
  var bookingCta = $('#bookingCta');
  var bookingCtaBand = null; /* { top, bottom } — pastille fixe, donc constant */

  function cacheBookingCtaBand() {
    if (!bookingCta) return;
    var r = bookingCta.getBoundingClientRect();
    bookingCtaBand = { top: r.top, bottom: r.bottom };
  }

  function updateDarkZone() {
    if ((!header && !bookingCta) || !darkZones.length) return;
    var band = header ? header.getBoundingClientRect().bottom : 0;
    var hit = false;
    var hitCta = false;
    for (var i = 0; i < darkZones.length; i++) {
      var r = darkZones[i].getBoundingClientRect();
      if (!hit && r.top < band && r.bottom > 0) hit = true;
      if (
        !hitCta &&
        bookingCtaBand &&
        r.top < bookingCtaBand.bottom &&
        r.bottom > bookingCtaBand.top
      ) {
        hitCta = true;
      }
    }
    if (header) header.classList.toggle('is-over-dark', hit);
    if (bookingCta) bookingCta.classList.toggle('is-on-dark', hitCta);
  }

  function updateScrollEffects() {
    /* --- Header + bouton retour en haut --- */
    initHeaderState();

    /* --- Bandeau : marque et pilule claires sur les zones sombres --- */
    updateDarkZone();

    /* --- Rideau : les panneaux partent OUVERTS puis se REFERMENT au scroll --- */
    if (sipario && curtains.length && !reduceMotion) {
      var rect = sipario.getBoundingClientRect();
      var vh = window.innerHeight;
      /* La zone utile = la section moins un écran (le sticky reste 100vh) */
      var total = rect.height - vh;
      var scrolled = -rect.top; /* combien on a scrollé dans la section */
      var progress = total > 0 ? scrolled / total : 0;
      progress = Math.max(0, Math.min(1, progress));
      /* Fermé = 1. Le rideau se referme sur les 65% premiers, puis reste fermé. */
      var closed = Math.min(1, progress / 0.65);
      /* On part de 100% (ouvert) et on rejoint 0% (fermé / centré) */
      var offset = (1 - closed) * 100;
      curtains.forEach(function (p) {
        var dir = p.getAttribute('data-curtain') === 'left' ? -1 : 1;
        p.style.transform = 'translate3d(' + (dir * offset) + '%,0,0)';
      });
    }

    /* --- Empilement : la carte recouverte rétrécit puis s'efface
           progressivement à mesure que la suivante la recouvre.
           couvre 0 = le haut de la carte suivante atteint le bas de la carte,
           couvre 1 = la carte suivante est épinglée (recouvrement achevé).
           Seule la géométrie de la carte SUIVANTE est lue : le
           getBoundingClientRect() de la carte courante inclut le scale(0.96)
           posé ici même (rect 90 → 99), ce qui faisait basculer le test
           d'épinglage une frame sur deux et remettait opacity à 1 →
           le fondu « ne se faisait pas ».
           Dernière carte jamais recouverte → jamais atténuée.
       Garde : sous 860px ET en mouvement réduit, le CSS remet les .feature
       en flux normal (pas d'épingle, donc pas de fondu) — voir §25 et §26. --- */
    if (features.length && !reduceMotion && window.innerWidth > 860) {
      features.forEach(function (card, i) {
        var next = features[i + 1];
        if (!next) {
          card.style.transform = '';
          card.style.opacity = '';
          return;
        }
        var start = featureTops[i] + featureHeights[i]; /* bas de la carte épinglée */
        var span = start - featureTops[i + 1]; /* course du recouvrement */
        var couvre = span > 0 ? (start - next.getBoundingClientRect().top) / span : 0;
        couvre = Math.max(0, Math.min(1, couvre));
        card.style.transform = couvre > 0 ? 'scale(0.96)' : '';
        card.style.opacity = couvre > 0 ? String(1 - couvre) : ''; /* 1 → 0 */
      });
    } else {
      features.forEach(function (card) {
        card.style.transform = '';
        card.style.opacity = '';
      });
    }

    deckUpdate();
  }

  /* Handler throttlé via requestAnimationFrame */
  var ticking = false;
  function onScrollEffects() {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        updateScrollEffects();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScrollEffects, { passive: true });
  /* Resize : rafraîchit le cache des tops puis recalcule les effets */
  var resizeT;
  window.addEventListener('resize', function () {
    clearTimeout(resizeT);
    resizeT = setTimeout(function () {
      cacheFeatureTops();
      cacheBookingCtaBand();
      updateScrollEffects();
    }, 120);
  });
  /* Repli mouvement réduit / navigateur ancien : rideau ouvert */
  if (reduceMotion) { if (sipario) sipario.classList.add('no-anim'); }
  cacheFeatureTops();
  cacheBookingCtaBand();
  updateScrollEffects();

  /* ============================================================
     5b. Menu (burger ≤860px / bouton « Menu » ≥861px)
     Un seul état pour les deux mises en page : la classe .is-nav-open sur
     le header — panneau déroulant en mobile, bandeau déployé avec ses deux
     moitiés de nav en desktop (cf. §9c du CSS). Fermeture au clic sur un
     lien (navigation par ancre), à l'Échap (focus rendu au bouton) et au
     clic extérieur.
     Sans JS : la classe .js est absente → bouton masqué, nav visible.
     ============================================================ */
  (function initBurger() {
    var btn = $('.header__burger');
    var nav = $('#primaryNav');
    if (!btn || !nav || !header) return;

    function isOpen() { return header.classList.contains('is-nav-open'); }

    function setOpen(open) {
      header.classList.toggle('is-nav-open', open);
      btn.setAttribute('aria-expanded', String(open));
      btn.setAttribute('aria-label', open ? tt('js.menuClose', 'Fermer le menu') : tt('js.menuOpen', 'Ouvrir le menu'));
    }

    /* Ouverture / fermeture via le bouton */
    btn.addEventListener('click', function () { setOpen(!isOpen()); });

    /* Changement de langue : le libellé accessible suit */
    document.addEventListener('langchange', function () {
      btn.setAttribute('aria-label', isOpen() ? tt('js.menuClose', 'Fermer le menu') : tt('js.menuOpen', 'Ouvrir le menu'));
    });

    /* Ferme au clic sur un lien du header (nav, logo) */
    header.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    /* Échap : ferme et rend le focus au bouton */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); btn.focus(); }
    });

    /* Ferme au clic extérieur au header */
    document.addEventListener('click', function (e) {
      if (isOpen() && !header.contains(e.target)) setOpen(false);
    });

    /* Volontairement pas de fermeture au redimensionnement : le bouton
       ouvre désormais aussi le bandeau desktop, et repasser de part et
       d'autre de 860px doit simplement rejouer l'autre mise en page
       (panneau vertical / moitiés déployées), pas refermer le menu. */
  })();

  /* ============================================================
     6. Animations au scroll (reveal) via IntersectionObserver
     ============================================================ */
  var reveals = $$('.reveal, .deck__card, .deck__caption');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries, obs) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    /* Fallback : tout visible */
    reveals.forEach(function (el) { el.classList.add('is-visible'); });
  }

  /* ============================================================
     Slider centré général — courant commun à deux instances :
     « Nos locations » (cfg locSlider) et le carrousel photos du
     camping (§7b retiré : même composant, cfg campSlider).
     La slide centrée est agrandie (.is-active pilote le CSS) et le
     glissement est une vraie transition CSS (transform .3s ease) :
     goTo() mesure la position finale en FLIP (transitions coupées via
     .is-measuring), restaure l'état de départ, puis lâche le track —
     le CSS fait tout le lissage (courbe ease), plus de rAF.
     cfg = { root, track, slide, prev, next, dots, dotLabel(n) }.
  ============================================================ */
  function initCenterSlider(cfg) {
    var root = $(cfg.root);
    if (!root) return;
    var track = $(cfg.track);
    var viewport = $('.slider__viewport', root) || (track && track.parentElement);
    var slides = $$(cfg.slide, track);
    var prev = $(cfg.prev);
    var next = $(cfg.next);
    var dotsWrap = $(cfg.dots);
    if (!track || !viewport || !slides.length) return;
    var dotLabel = cfg.dotLabel; /* n (1-based) → libellé i18n de la pastille */

    var index = 0;
    var dragging = false;
    var startX = 0;
    var dragBaseX = 0; /* position x du track à la prise en main */

    function maxIndex() { return slides.length - 1; }

    function buildDots() {
      if (!dotsWrap) return;
      dotsWrap.innerHTML = '';
      for (var i = 0; i <= maxIndex(); i++) {
        (function (i) {
          var b = document.createElement('button');
          b.type = 'button';
          b.setAttribute('aria-label', dotLabel(i + 1));
          b.addEventListener('click', function () { goTo(i); });
          dotsWrap.appendChild(b);
        })(i);
      }
    }

    /* Position x qui centre une donnée carte dans le viewport.
       Le track démarre après le padding-inline du viewport : sans retirer
       ce padding gauche, la carte active est décalée vers la droite. */
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

    /* Position x réellement AFFICHÉE par le navigateur. Pendant une
       transition, le style inline porte déjà la valeur engagée (la
       cible) : seule getComputedStyle donne la valeur visible. Utile
       pour enchaîner sans claquage (clic en rafale, drag en plein glide). */
    function visualX() {
      var t = window.getComputedStyle(track).transform;
      var m = t && t !== 'none' ? t.match(/matrix(?:3d)?\(([^)]+)\)/) : null;
      if (m) {
        var n = m[1].split(',').map(parseFloat);
        return n.length === 6 ? n[4] : n[12]; /* matrix(a,b,c,d,x,y) / matrix3d */
      }
      return centeredX(slides[index]);
    }

    /* Centre la carte active dans le viewport */
    function centerActive() {
      track.style.transform = 'translate3d(' + centeredX(slides[index]) + 'px,0,0)';
    }

    function paintArrows() {
      if (prev) prev.disabled = index <= 0;
      if (next) next.disabled = index >= maxIndex();
      if (dotsWrap) {
        $$('button', dotsWrap).forEach(function (d, i) {
          d.classList.toggle('is-active', i === index);
          /* aria-current (et non aria-selected : ce ne sont pas des onglets) */
          if (i === index) d.setAttribute('aria-current', 'true');
          else d.removeAttribute('aria-current');
        });
      }
    }

    /* goTo(i) : la CSS glisse le track en ease .3s jusqu'à la position
       finale mesurée ici sans animer (méthode FLIP) :
       1. transitions coupées (.is-measuring) → nouvel état + lecture de
          la position de repos finale exacte ;
       2. restauration de l'état de départ (+ reflow = point de départ) ;
       3. transitions réactivées → classes + transform : cartes et track
          glissent ensemble, même durée, même courbe ease.
       instant = true : positionnement immédiat (aucun glissement au
       chargement — transform posé pendant .is-measuring). */
    function goTo(i, instant) {
      var j = Math.max(0, Math.min(maxIndex(), i));
      var prevIndex = index;
      var x;

      /* a. Changement de slide avec glissement (cas normal) */
      if (j !== prevIndex && !instant) {
        /* ancre sur la position visuelle courante : l'ajout de
           .is-measuring annulerait la transition en cours et la
           ferait sauter à sa valeur engagée (saut en clic rafale) */
        var anchor = visualX();
        /* 1. Géométrie finale mesurée sans animer */
        track.classList.add('is-measuring');
        slides.forEach(function (s, n) { s.classList.toggle('is-active', n === j); });
        x = centeredX(slides[j]);
        /* 2. Retour à l'état de départ + ancre visuelle, reflow enregistré */
        slides.forEach(function (s, n) { s.classList.toggle('is-active', n === prevIndex); });
        track.style.transform = 'translate3d(' + anchor + 'px,0,0)';
        void track.offsetHeight;
        /* 3. Transitions réactivées : on lâche classes + transform */
        track.classList.remove('is-measuring');
        index = j;
        slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
        paintArrows();
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
        scheduleAuto();
        return;
      }

      /* b. Retour au centre après un drag court : glissement doux */
      if (j === prevIndex && !instant) {
        x = centeredX(slides[index]);
        track.style.transform = 'translate3d(' + x + 'px,0,0)';
        scheduleAuto();
        return;
      }

      /* c. Positionnement instantané : tout est posé avec les
         transitions coupées, puis réactivé — aucun glissement parasite */
      track.classList.add('is-measuring');
      index = j;
      slides.forEach(function (s, n) { s.classList.toggle('is-active', n === index); });
      paintArrows();
      x = centeredX(slides[index]);
      track.style.transform = 'translate3d(' + x + 'px,0,0)';
      void track.offsetHeight;
      track.classList.remove('is-measuring');
      scheduleAuto();
    }

    if (prev) prev.addEventListener('click', function () { goTo(index - 1); });
    if (next) next.addEventListener('click', function () { goTo(index + 1); });

    /* Drag / swipe (souris + doigt) — clearAuto() : pas d'avance auto
       pendant le geste ; .is-measuring coupe la transition du track
       pour suivre le doigt au pixel. On ancre sur la position
       visuelle (visualX) pour enchaîner sans claquage en plein glide. */
    track.addEventListener('pointerdown', function (e) {
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
      track.classList.remove('is-measuring'); /* la transition reprend */
      var dx = (e.clientX || startX) - startX;
      var threshold = 50;
      if (dx < -threshold) goTo(index + 1);
      else if (dx > threshold) goTo(index - 1);
      else goTo(index);
    }
    track.addEventListener('pointerup', endDrag);
    track.addEventListener('pointercancel', endDrag);

    /* Navigation clavier (le conteneur a tabindex=0) */
    root.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(index - 1); }
      else if (e.key === 'ArrowRight') { e.preventDefault(); goTo(index + 1); }
    });

    /* Recalcul au redimensionnement : recentrage instantané (sans glide) */
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        track.classList.add('is-measuring');
        centerActive();
        void track.offsetHeight;
        track.classList.remove('is-measuring');
      }, 120);
    });

    /* ============================================================
       Auto-défilement (ping-pong)
       - Une slide toutes les 6s ; à une extrémité on INVERSE la
         direction (pas de boucle : fin → arrière, début → avant).
       - Pause tant que la section est survolée (hover) ; reprise
         immédiate au départ du curseur.
       - Veille si l'onglet est caché ou si la section est hors écran
         (aucun « rattrapage » brutal au retour).
       - Désactivé sous prefers-reduced-motion et si < 2 slides.
       - Toute action manuelle (goTo) remet le minuteur à 6s.
       Le timer est piloté par scheduleAuto() appelé en fin de goTo(). */
    var AUTO_DELAY = 6000;
    var autoDir = 1; /* direction courante : 1 = avant, -1 = arrière */
    var autoTimer = null;
    var autoHover = false;   /* curseur sur la section */
    var autoTab = true;      /* onglet actif (visibilitychange) */
    var autoInView = true;   /* section à l'écran (IntersectionObserver) */

    function clearAuto() {
      if (autoTimer) { clearTimeout(autoTimer); autoTimer = null; }
    }

    function scheduleAuto() {
      clearAuto();
      /* Appareil sans survol (mobile / tablette tactile) : l'avance
         automatique est désactivée — aucune pause possible au doigt. */
      if (window.matchMedia('(hover: none)').matches) return;
      if (reduceMotion || autoHover || !autoTab || !autoInView) return;
      if (slides.length < 2) return;
      autoTimer = setTimeout(stepAuto, AUTO_DELAY);
    }

    function stepAuto() {
      autoTimer = null;
      /* on n'avance jamais pendant un drag ; le timer sera remis
         à la fin du geste (endDrag → goTo → scheduleAuto) */
      if (dragging) { scheduleAuto(); return; }
      /* ping-pong : rebrousse chemin aux extrémités, jamais de wrap */
      if (index >= maxIndex()) autoDir = -1;
      else if (index <= 0) autoDir = 1;
      goTo(index + autoDir); /* goTo remet le minuteur à zéro via scheduleAuto */
    }

    /* Pause au survol tant que l'élément est survolé */
    root.addEventListener('mouseenter', function () { autoHover = true; clearAuto(); });
    root.addEventListener('mouseleave', function () { autoHover = false; scheduleAuto(); });

    /* En veille si l'onglet est caché (état indépendant de l'écran :
       un retour d'onglet ne doit pas relancer un slider hors écran) */
    document.addEventListener('visibilitychange', function () {
      autoTab = !document.hidden;
      if (autoTab) scheduleAuto(); else clearAuto();
    });

    /* La préférence "mouvement réduit" peut changer en session : le
       gestionnaire global émet "motionchange" → on réévalue la minuterie
       (scheduleAuto lit reduceMotion, mis à jour avant l'évènement). */
    document.addEventListener('motionchange', function () {
      if (reduceMotion) clearAuto(); else scheduleAuto();
    });

    /* En veille si la section est hors écran (pas de défilement fantôme).
       Sans IntersectionObserver, autoInView reste true (défilement actif).
       Note : le seuil ne pilote que le déclenchement du callback — sur
       une section plus haute que l'écran, un ratio strict serait inatteignable. */
    if ('IntersectionObserver' in window) {
      (new IntersectionObserver(function (entries) {
        autoInView = entries[0].isIntersecting;
        if (autoInView) scheduleAuto(); else clearAuto();
      }, { threshold: 0.25 })).observe(root);
    }

    buildDots();
    /* Position de départ : cfg.initial (index) sinon 0. Le carrousel
       « Le camping en images » démarre sur sa 5e photo (initial: 4). */
    goTo(cfg.initial || 0, true); /* positionnement initial instantané */

    /* Changement de langue : les pastilles relisent leur libellé */
    document.addEventListener('langchange', function () {
      if (!dotsWrap) return;
      $$('button', dotsWrap).forEach(function (d, i) {
        d.setAttribute('aria-label', dotLabel(i + 1));
      });
    });
  }

  initCenterSlider({
    root: '#locationsSlider',
    track: '#locationsTrack',
    slide: '.loc-card',
    prev: '#prevLoc',
    next: '#nextLoc',
    dots: '#locDots',
    dotLabel: function (n) {
      return tt('js.locDot', 'Aller à la location {n}', { n: n });
    }
  });

  initCenterSlider({
    root: '#campGallerySlider',
    track: '#campGalleryTrack',
    slide: '.camp-card',
    prev: '#prevCamp',
    next: '#nextCamp',
    dots: '#campDots',
    initial: 4, /* photo active au chargement : la 5e (Nos locations) */
    dotLabel: function (n) {
      return tt('js.campDot', 'Aller à la photo {n}', { n: n });
    }
  });

  /* ============================================================
     7b. Galerie "deck" : photo N et légende N sont épinglées
         ensemble (géométrie miroir) et activées en même temps,
         avec un seuil 1/2 carte sous l'épinglage.
         La géométrie mesurée de la colonne photos est publiée sur
         .deck__layout via les variables --deck-step/last/pad.
     ============================================================ */
  var deckStack = null, deckCards = null, deckCaptions = null, deckLayoutEl = null;
  var deckActive = -2; /* sentinel : -2 = rien appliqué, -1 = toutes actives, 0..n = index */
  var deckStickTop = 130; /* seuil sticky (top de la 1re carte), mis en cache par deckLayout */
  var deckCardH = 400; /* hauteur d'une carte, cachée ici pour le seuil d'activation */

  /* Mesure la colonne photos et publie la géométrie sur .deck__layout (desktop).
     Replis CSS (20vh/60vh) restent actifs sans JS. Mobile : properties retirées. */
  function deckLayout() {
    if (!deckLayoutEl) return;
    if (window.innerWidth <= 860) {
      deckLayoutEl.style.removeProperty('--deck-step');
      deckLayoutEl.style.removeProperty('--deck-last');
      deckLayoutEl.style.removeProperty('--deck-pad');
      return;
    }
    var c0 = deckCards[0];
    var cs = window.getComputedStyle(c0);
    var h = c0.offsetHeight;
    var m = parseFloat(cs.marginBottom) || 0;
    var pad = parseFloat(window.getComputedStyle(deckStack).paddingTop) || 0;
    deckStickTop = parseFloat(cs.top) || 130; /* cache : relu uniquement ici */
    deckCardH = h; /* cache : sert au seuil d'activation de deckUpdate */
    deckLayoutEl.style.setProperty('--deck-step', (h + m) + 'px');
    deckLayoutEl.style.setProperty('--deck-last', h + 'px');
    deckLayoutEl.style.setProperty('--deck-pad', pad + 'px');
  }

  /* idx >= 0 : active l'index idx sur photos+légendes ; idx < 0 : toutes actives */
  function applyDeck(idx) {
    if (idx === deckActive) return;
    deckActive = idx;
    deckCards.forEach(function (c) {
      c.classList.toggle('is-active', idx < 0 || +c.getAttribute('data-index') === idx);
    });
    deckCaptions.forEach(function (c) {
      c.classList.toggle('is-active', idx < 0 || +c.getAttribute('data-index') === idx);
    });
  }

  /* Appelé à chaque scroll/resize (rAF via updateScrollEffects).
     L'index actif = dernière photo dont le haut a franchi le seuil —
     1/2 de hauteur de carte SOUS l'épinglage : photo+légende passent
     à pleine intensité quand la photo est entièrement à l'écran,
     pas quand elle arrive en haut (opacité 1 qui "arrive trop tard"). */
  function deckUpdate() {
    if (!deckStack) return;
    if (window.innerWidth <= 860 || reduceMotion) { applyDeck(-1); return; }
    var threshold = deckStickTop + deckCardH * 0.5; /* caché par deckLayout */
    var idx = 0;
    for (var i = 0; i < deckCards.length; i++) {
      if (deckCards[i].getBoundingClientRect().top <= threshold) idx = i;
    }
    applyDeck(idx);
  }

  (function initDeckSync() {
    var stack = $('.deck__stack');
    var layoutEl = $('.deck__layout');
    var cards = $$('.deck__card');
    var captions = $$('.deck__caption');
    if (!stack || !layoutEl || !cards.length || !captions.length) return;
    deckStack = stack;
    deckLayoutEl = layoutEl;
    deckCards = cards;
    deckCaptions = captions;
    stack.classList.add('has-active');
    deckLayout();
    deckUpdate();
    var dt;
    window.addEventListener('resize', function () {
      clearTimeout(dt);
      dt = setTimeout(function () { deckLayout(); deckUpdate(); }, 120);
    });
  })();

  /* ============================================================
     7b. Rideau : chargement différé de l'image (lazy)
        village_nant.webp (~459 Ko) n'est utile qu'à l'approche du sipario.
        L'URL reste dans la feuille CSS (résolution garantie, y compris
        en file://) ; on ne débloque son affichage qu'en posant la
        classe .is-loaded sur la section, via un IntersectionObserver
        à marge généreuse → aucune requête avant l'approche.
        Repli : sans IO, la classe est posée immédiatement ; si
        l'image échoue, le dégradé du panneau reste visible.
     ============================================================ */
  (function initRideauLazy() {
    var section = $('#sipario');
    if (!section) return;

    function reveal() { section.classList.add('is-loaded'); }

    if (!('IntersectionObserver' in window)) { reveal(); return; }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.disconnect();
        reveal();
      });
    }, { rootMargin: '1200px 0px' }); /* amorcé bien avant l'entrée en scène */
    io.observe(section);
  })();

  /* ============================================================
     3. Fond du hero : vidéo sur le desktop, carrousel sur le téléphone
        Deux fonds pour une seule section. Le seuil (861px) est le même des
        deux côtés — le script et le CSS doivent rester d'accord, car c'est
        lui qui empêche un téléphone de télécharger les ~7 Mo de la vidéo.
        Le <video> n'a aucun src dans le HTML : rien ne part tant que ce
        module ne l'a pas posé (et il le retire si on repasse en dessous).
        Le carrousel : six calques, 4s de visibilité avec une légère dérive,
        puis 1s de fondu croisé — le sortant s'efface pendant que l'entrant
        monte, sans que le fond se vide jamais.
     ============================================================ */
  (function initHero() {
    var SLIDE_MS = 4000; /* visibilité d'un calque */
    var FADE_MS = 1000; /* durée du fondu croisé */
    var desktopMq = window.matchMedia('(min-width: 861px)');

    var video = $('#heroVideo');
    var slidesWrap = $('#heroSlides');
    var slides = slidesWrap ? $$('.hero__slide', slidesWrap) : [];

    /* ---- La vidéo : desktop seulement ---- */
    function syncVideo() {
      if (!video) return;
      var want = desktopMq.matches && !reduceMotion;
      if (want) {
        if (!video.getAttribute('src')) {
          video.muted = true; /* l'attribut suffit à l'autoplay, la propriété le garantit */
          video.setAttribute('src', 'assets/video/hero.mp4');
          video.load();
        }
        var playing = video.play();
        /* Autoplay refusé : on ne force rien, le dégradé reste. */
        if (playing && typeof playing.catch === 'function') playing.catch(function () {});
      } else if (video.getAttribute('src')) {
        /* Repassé en dessous du seuil (ou mouvement réduit) : on coupe et on
           lâche la source, la bande passante déjà engagée est libérée. */
        video.pause();
        video.classList.remove('is-ready');
        video.removeAttribute('src');
        video.load();
      }
    }
    if (video) {
      /* Elle ne monte en fondu qu'une fois qu'elle joue VRAIMENT : si la
         lecture échoue, le dégradé de repli reste, sans clignotement. */
      video.addEventListener('playing', function () { video.classList.add('is-ready'); });
      video.addEventListener('error', function () { video.classList.remove('is-ready'); });
    }

    /* ---- Le carrousel : téléphone et tablette ---- */
    var index = 0;
    var timer = null;
    var outTimer = null;

    function clearTimers() {
      if (timer) { clearTimeout(timer); timer = null; }
      if (outTimer) { clearTimeout(outTimer); outTimer = null; }
    }

    /* Un seul calque allumé : les autres retombent à l'opacité 0 et leur
       animation de dérive s'arrête. Leur transform de repos étant la FIN de
       dérive, ce rangement ne provoque aucun retour en arrière. */
    function show(i) {
      index = i;
      slides.forEach(function (s, n) { s.classList.toggle('is-in', n === i); });
    }

    function step() {
      timer = null;
      var out = slides[index];
      show((index + 1) % slides.length);
      /* Le sortant garde .is-in le temps du fondu croisé, puis on le range. */
      if (outTimer) clearTimeout(outTimer);
      outTimer = setTimeout(function () {
        outTimer = null;
        out.classList.remove('is-in');
      }, FADE_MS);
      timer = setTimeout(step, SLIDE_MS);
    }

    function syncCarousel() {
      clearTimers();
      if (!slides.length) return;
      /* Desktop : c'est la vidéo qui fait le fond.
         Mouvement réduit : une seule image, fixe. */
      if (desktopMq.matches || reduceMotion) { show(0); return; }
      show(index);
      timer = setTimeout(step, SLIDE_MS);
    }

    /* En veille si l'onglet est caché : un onglet d'arrière-plan bride les
       minuteurs, le cycle repartirait de travers au retour. */
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) clearTimers(); else refresh();
    });

    /* La préférence système peut changer en session (§8 émet "motionchange"),
       et une fenêtre peut franchir le seuil dans les deux sens. */
    function refresh() {
      syncVideo();
      syncCarousel();
    }
    if (typeof desktopMq.addEventListener === 'function') {
      desktopMq.addEventListener('change', refresh);
    } else if (typeof desktopMq.addListener === 'function') {
      desktopMq.addListener(refresh); /* Safari ≤13 */
    }
    document.addEventListener('motionchange', refresh);

    syncVideo();
    syncCarousel();
  })();

  /* ============================================================
     8. Mouvement réduit : adaptation en session
        La préférence système peut changer à tout moment. On resynchronise
        le garde reduceMotion, on applique/retire les replis visuels, on
        notifie le slider (événement "motionchange") et on recalcule les
        effets scroll. Le CSS suit tout seul via la media query.
     ============================================================ */
  function applyMotionPref() {
    reduceMotion = motionMq.matches;
    if (reduceMotion) {
      /* Replis : rideau ouvert, tout le contenu visible, effets neutralisés */
      if (sipario) sipario.classList.add('no-anim');
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else if (sipario) {
      /* Le CSS reprend la main ; le scroll recalculera les transforms */
      sipario.classList.remove('no-anim');
    }
    document.dispatchEvent(new Event('motionchange'));
    updateScrollEffects();
  }
  if (typeof motionMq.addEventListener === 'function') {
    motionMq.addEventListener('change', applyMotionPref);
  } else if (typeof motionMq.addListener === 'function') {
    motionMq.addListener(applyMotionPref); /* Safari ≤13 */
  }

  /* ============================================================
     9. Réservation : pastille fixe + calendrier arrivée / départ
        Un état { start, end, type } porte les deux dates et le type
        d'emplacement. start = Arrivée (1ʳᵉ date, à gauche), end =
        Départ (2ᵉ date, à droite). Le rendu (buildCalendar) est le
        MÊME composant appelé une fois par calendrier : deux fois en
        ≥861px, une seule en ≤860px, où la grille unique sert aux deux
        champs. La surbrillance de l'arrivée, de la plage et du départ
        est donc identique des deux côtés — c'est le même rendu, rejoué.
        L'URL externe et les noms de paramètres se règlent dans BOOKING.
     ============================================================ */
  (function initBooking() {
    /* ---- À REMPLACER : adresse du site de réservation externe ---- */
    var BOOKING = {
      url: 'https://exemple-reservation.com/reservation',
      /* Noms des paramètres attendus par le site externe */
      params: { departure: 'depart', arrival: 'arrivee', type: 'type' },
      /* Saison d'ouverture : borne les dates réservables */
      season: { open: '2027-04-10', close: '2027-10-31' },
      newTab: true
    };

    var root = $('#booking');
    if (!root) return;
    var cta = $('#bookingCta');
    var ctaLabel = $('#bookingCtaLabel');
    var panel = $('#bookingPanel');
    var calendarsEl = $('#bookingCalendars');
    var fieldsEl = $('.booking__fields', root);
    var typesEl = $('#bookingTypes');
    var hintEl = $('#bookingHint');
    if (!cta || !panel || !calendarsEl) return;

    /* ---- Dates : tout en ISO AAAA-MM-JJ (comparable tel quel) ---- */
    function pad2(n) { return (n < 10 ? '0' : '') + n; }
    function toISO(y, m, d) { return y + '-' + pad2(m + 1) + '-' + pad2(d); } /* m : 0-11 */
    function toMonthISO(y, m) { return y + '-' + pad2(m + 1) + '-01'; }
    function parseISO(s) { var p = s.split('-'); return new Date(+p[0], +p[1] - 1, +p[2]); }
    function addMonths(monthISO, delta) {
      var d = parseISO(monthISO);
      return toMonthISO(d.getFullYear(), d.getMonth() + delta);
    }
    /* Locale courante pour les dates formatées (mois, dates complètes) :
       pilotée par le sélecteur de langue (js/i18n.js), repli fr-FR. */
    function uiLocale() {
      return (window.L2V && L2V.locale && L2V.locale[window.L2V.lang]) || 'fr-FR';
    }
    function monthLabel(monthISO) {
      var d = parseISO(monthISO);
      try {
        return new Intl.DateTimeFormat(uiLocale(), { month: 'long', year: 'numeric' }).format(d);
      } catch (e) { return monthISO.slice(0, 7); }
    }
    function fullDate(isoStr) {
      try {
        return new Intl.DateTimeFormat(uiLocale(), {
          weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
        }).format(parseISO(isoStr));
      } catch (e) { return isoStr; }
    }
    function shortDate(isoStr) {
      try {
        return new Intl.DateTimeFormat(uiLocale(), {
          day: 'numeric', month: 'short', year: 'numeric'
        }).format(parseISO(isoStr));
      } catch (e) { return isoStr; }
    }

    var now = new Date();
    var TODAY = toISO(now.getFullYear(), now.getMonth(), now.getDate());
    var SEASON_MIN = BOOKING.season.open;
    var SEASON_MAX = BOOKING.season.close;
    /* Borne basse = le plus tardif entre aujourd'hui et l'ouverture de saison.
       Saison entièrement passée : on retombe sur la saison (tout désactivé). */
    var MIN = TODAY > SEASON_MIN ? TODAY : SEASON_MIN;
    if (MIN > SEASON_MAX) MIN = SEASON_MAX;
    var MIN_MONTH = MIN.slice(0, 8) + '01';
    var MAX_MONTH = SEASON_MAX.slice(0, 8) + '01';

    var state = {
      start: null, /* Arrivée : 1ʳᵉ date, calendrier de gauche */
      end: null,   /* Départ : 2ᵉ date, calendrier de droite */
      active: 'start',
      type: 'emplacement',
      month: { start: MIN_MONTH, end: addMonths(MIN_MONTH, 1) }
    };
    /* Bouchon : si la saison tient dans un seul mois, les deux
       calendriers (Arrivée | Départ) retombent sur ce même mois. */
    if (state.month.end > MAX_MONTH) state.month.end = MAX_MONTH;

    function isDesktop() { return window.matchMedia('(min-width: 861px)').matches; }
    function isOpen() { return root.classList.contains('is-open'); }

    /* ---- Rendu d'un mois (une instance par calendrier) ---- */
    function buildCalendar(role, monthISO) {
      var wrap = document.createElement('div');
      wrap.className = 'cal';
      wrap.setAttribute('data-role', role);

      var nav = document.createElement('div');
      nav.className = 'cal__nav';

      var prev = document.createElement('button');
      prev.type = 'button';
      prev.className = 'cal__arrow';
      prev.setAttribute('data-nav', '-1');
      prev.setAttribute('aria-label', tt('js.calPrev', 'Mois précédent'));
      prev.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      prev.disabled = monthISO <= MIN_MONTH;

      var month = document.createElement('p');
      month.className = 'cal__month';
      month.setAttribute('aria-live', 'polite');
      month.textContent = monthLabel(monthISO);

      var next = document.createElement('button');
      next.type = 'button';
      next.className = 'cal__arrow';
      next.setAttribute('data-nav', '1');
      next.setAttribute('aria-label', tt('js.calNext', 'Mois suivant'));
      next.innerHTML = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
      next.disabled = monthISO >= MAX_MONTH;

      nav.appendChild(prev);
      nav.appendChild(month);
      nav.appendChild(next);
      wrap.appendChild(nav);

      var d = parseISO(monthISO);
      var y = d.getFullYear();
      var m = d.getMonth();
      var firstWeekday = (new Date(y, m, 1).getDay() + 6) % 7; /* 0 = lundi */
      var daysInMonth = new Date(y, m + 1, 0).getDate();

      var table = document.createElement('table');
      table.className = 'cal__grid';
      if (state.start && state.end) table.classList.add('has-range');

      var caption = document.createElement('caption');
      caption.className = 'visually-hidden';
      caption.textContent = monthLabel(monthISO);
      table.appendChild(caption);

      var thead = document.createElement('thead');
      var hrow = document.createElement('tr');
      ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'].map(function (_, i) {
        var wd = window.L2V && L2V.weekdays && L2V.weekdays[window.L2V.lang];
        return wd ? wd[i] : ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'][i];
      }).forEach(function (lbl) {
        var th = document.createElement('th');
        th.setAttribute('scope', 'col');
        th.textContent = lbl;
        hrow.appendChild(th);
      });
      thead.appendChild(hrow);
      table.appendChild(thead);

      var tbody = document.createElement('tbody');
      var row = document.createElement('tr');
      var col = 0;
      var i;
      for (i = 0; i < firstWeekday; i++) { row.appendChild(document.createElement('td')); col++; }

      var lo = state.start && state.end ? (state.start < state.end ? state.start : state.end) : null;
      var hi = state.start && state.end ? (state.start < state.end ? state.end : state.start) : null;

      for (var day = 1; day <= daysInMonth; day++) {
        var dateISO = toISO(y, m, day);
        var td = document.createElement('td');
        td.className = 'cal__cell';

        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'cal__day';
        btn.setAttribute('data-date', dateISO);
        btn.setAttribute('data-role', role);
        btn.textContent = String(day);

        var label = fullDate(dateISO);
        if (dateISO < TODAY || dateISO < SEASON_MIN || dateISO > SEASON_MAX) {
          btn.disabled = true;
          td.classList.add('is-disabled');
        }
        if (dateISO === TODAY) td.classList.add('is-today');
        if (dateISO === state.start) {
          td.classList.add('is-start');
          btn.classList.add('is-edge');
          label += tt('js.selIn', " — date d'arrivée sélectionnée");
        } else if (dateISO === state.end) {
          td.classList.add('is-end');
          btn.classList.add('is-edge');
          label += tt('js.selOut', ' — date de départ sélectionnée');
        } else if (lo && dateISO > lo && dateISO < hi) {
          td.classList.add('is-range');
          label += tt('js.selRange', ' — dans la plage sélectionnée');
        }
        btn.setAttribute('aria-label', label);

        td.appendChild(btn);
        row.appendChild(td);
        col++;
        if (col === 7) { tbody.appendChild(row); row = document.createElement('tr'); col = 0; }
      }
      if (col > 0) {
        while (col < 7) { row.appendChild(document.createElement('td')); col++; }
        tbody.appendChild(row);
      }
      table.appendChild(tbody);
      wrap.appendChild(table);
      return wrap;
    }

    function render() {
      var desktop = isDesktop();
      /* Ordre visuel : Arrivée (start) à gauche, Départ (end) à droite,
         aligné sur les champs ; mobile : la grille active. */
      var roles = desktop ? ['start', 'end'] : [state.active];
      calendarsEl.innerHTML = '';
      calendarsEl.classList.toggle('is-duo', desktop);
      roles.forEach(function (role) {
        calendarsEl.appendChild(buildCalendar(role, state.month[role] || MIN_MONTH));
      });
      paintFields();
      paintCta();
      paintHint();
    }

    function paintFields() {
      if (!fieldsEl) return;
      var desktop = isDesktop();
      $$('.booking__field', fieldsEl).forEach(function (f) {
        var role = f.getAttribute('data-field');
        var val = state[role];
        var valEl = $('[data-value="' + role + '"]', f);
        if (valEl) valEl.textContent = val ? shortDate(val) : '—';
        f.classList.toggle('is-filled', !!val);
        f.classList.toggle('is-active', !desktop && state.active === role);
        if (desktop) f.removeAttribute('aria-pressed');
        else f.setAttribute('aria-pressed', String(state.active === role));
      });
    }

    /* Type d'emplacement : un seul bouton coché à la fois */
    function paintTypes() {
      if (!typesEl) return;
      $$('.booking__type', typesEl).forEach(function (b) {
        var sel = String(b.getAttribute('data-type') === state.type);
        b.setAttribute('aria-checked', sel);
        b.classList.toggle('is-selected', sel === 'true');
      });
    }

    function paintCta() {
      var open = isOpen();
      if (ctaLabel) ctaLabel.textContent = open ? tt('js.ctaValidate', 'Valider') : tt('js.ctaOpen', 'Réservez votre séjour');
      cta.classList.toggle('is-valid', open && !!(state.start && state.end));
      cta.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    function paintHint(force) {
      if (!hintEl) return;
      var msg;
      if (state.start && state.end) {
        msg = tt('js.hintBoth', 'Séjour du {a} au {b}.')
          .replace('{a}', shortDate(state.start))
          .replace('{b}', shortDate(state.end));
      } else if (state.start) {
        msg = tt('js.hintOut', 'Choisissez maintenant la date de départ.');
      } else if (force) {
        msg = tt('js.hintForce', 'Choisissez vos deux dates pour continuer.');
      } else {
        msg = tt('js.hintIn', "Choisissez la date d'arrivée.");
      }
      hintEl.textContent = msg;
    }

    /* Pose une date. Sur mobile la grille est unique : c'est le champ actif
       qui décide du rôle ; sur desktop, le rôle vient du calendrier cliqué.
       Assignation STRICTE : chaque calendrier remplit SON champ (gauche →
       Arrivée, droite → Départ). Si le couple devient impossible (Départ ≤
       Arrivée), l'autre date est réinitialisée — branches miroir. */
    function pick(dateISO, role) {
      var desktop = isDesktop();
      if (!desktop) role = state.active;
      if (role === 'start') {
        state.start = dateISO;
        if (state.end && state.end <= state.start) state.end = null;
      } else {
        state.end = dateISO;
        if (state.start && state.end <= state.start) {
          state.start = null;
          state.active = 'start';
        }
      }
      /* Mobile : une seule grille — on reste sur le mois affiché au lieu de
         sauter sur le mémorisé (sinon la vue décroche dès qu'une date tombe
         dans un autre mois). */
      if (!state.end) {
        state.active = 'end';
        if (!desktop) state.month.end = state.month.start;
      } else if (!state.start) {
        state.active = 'start';
        if (!desktop) state.month.start = state.month.end;
      }
      render();
      focusDay(dateISO, role);
    }

    function focusDay(dateISO, role) {
      var btn = panel.querySelector('[data-date="' + dateISO + '"]');
      if (btn) { btn.focus(); return; }
      var f = fieldsEl && $('.booking__field[data-field="' + role + '"]', fieldsEl);
      if (f) f.focus();
    }

    function shiftMonth(role, delta) {
      var nxt = addMonths(state.month[role] || MIN_MONTH, delta);
      if (nxt < MIN_MONTH || nxt > MAX_MONTH) return;
      state.month[role] = nxt;
      render();
    }

    calendarsEl.addEventListener('click', function (e) {
      var t = e.target;
      var day = t.closest ? t.closest('.cal__day') : null;
      if (day && !day.disabled) { pick(day.getAttribute('data-date'), day.getAttribute('data-role')); return; }
      var arrow = t.closest ? t.closest('.cal__arrow') : null;
      if (arrow && !arrow.disabled) {
        shiftMonth(arrow.closest('.cal').getAttribute('data-role'), +arrow.getAttribute('data-nav'));
      }
    });

    if (fieldsEl) {
      fieldsEl.addEventListener('click', function (e) {
        var f = e.target.closest ? e.target.closest('.booking__field') : null;
        if (!f) return;
        state.active = f.getAttribute('data-field');
        render();
      });
    }

    if (typesEl) {
      typesEl.addEventListener('click', function (e) {
        var b = e.target.closest ? e.target.closest('.booking__type') : null;
        if (!b || b.getAttribute('data-type') === state.type) return;
        state.type = b.getAttribute('data-type');
        paintTypes();
      });
    }

    /* ---- Ouverture / fermeture ---- */
    function lockScroll(lock) {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-w', sw + 'px');
      document.documentElement.classList.toggle('is-booking-open', lock);
    }

    function open() {
      render();
      root.classList.add('is-open');
      lockScroll(true);
      paintCta();
      /* Le flux commence par l'Arrivée (1ʳᵉ date, à gauche). */
      var first = fieldsEl && $('.booking__field', fieldsEl);
      if (first) first.focus();
    }

    function close() {
      root.classList.remove('is-open');
      lockScroll(false);
      paintCta();
      cta.focus();
    }

    cta.addEventListener('click', function (e) {
      if (!isOpen()) {
        e.preventDefault();
        open();
        return;
      }
      e.preventDefault();
      if (!state.start || !state.end) { paintHint(true); return; }
      goToBooking();
    });

    /* Valide : construit l'URL externe, ouvre l'onglet, referme le panneau */
    function goToBooking() {
      var sep = BOOKING.url.indexOf('?') === -1 ? '?' : '&';
      var url = BOOKING.url + sep +
        encodeURIComponent(BOOKING.params.departure) + '=' + encodeURIComponent(state.start) +
        '&' + encodeURIComponent(BOOKING.params.arrival) + '=' + encodeURIComponent(state.end);
      if (BOOKING.params.type && state.type) {
        url += '&' + encodeURIComponent(BOOKING.params.type) + '=' + encodeURIComponent(state.type);
      }
      if (BOOKING.newTab) window.open(url, '_blank', 'noopener,noreferrer');
      else window.location.href = url;
      close();
    }

    $$('[data-booking-close]', root).forEach(function (el) {
      el.addEventListener('click', function () { close(); });
    });

    /* Échap ferme et rend le focus à la pastille ; Tab boucle dans le panneau
       (la pastille « Valider » fait partie de la boucle, le voile non). */
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$('a[href], button:not([disabled])', root);
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });

    /* Changement de palier : on repasse de 2 calendriers à 1 (ou l'inverse) */
    var desktopMq = window.matchMedia('(min-width: 861px)');
    function onBreakpoint() { if (isOpen()) render(); }
    if (typeof desktopMq.addEventListener === 'function') desktopMq.addEventListener('change', onBreakpoint);
    else if (typeof desktopMq.addListener === 'function') desktopMq.addListener(onBreakpoint);

    /* État initial : champs et libellé à plat (panneau fermé) */
    paintFields();
    paintTypes();
    paintCta();
    paintHint();

    /* Changement de langue : le panneau ouvert se redessine avec les
       nouveaux libellés ; fermé, seuls champs, pastille et rappel suivent. */
    document.addEventListener('langchange', function () {
      if (isOpen()) render();
      else { paintFields(); paintCta(); paintHint(); }
    });
  })();

  /* ============================================================
     10. Contact : pastille + formulaire par-dessus le site
     Même mécanisme que le calendrier (voile + panneau, focus
     restreint, Échap). Un seul overlay à la fois : ouvrir le
     contact referme le calendrier. L'envoi est un STUB — ni
     endpoint ni adresse de réception : le point de branchement est
     marqué « À REMPLACER » dans le gestionnaire de submit.
     ============================================================ */
  (function initContact() {
    var root = $('#contact');
    var cta = $('#contactCta');
    var panel = $('#contactPanel');
    var form = $('#contactForm');
    var successEl = $('#contactSuccess');
    if (!root || !cta || !panel || !form) return;

    function isOpen() { return root.classList.contains('is-open'); }

    /* Même verrouillage que le calendrier : le fond ne défile plus et la
       largeur de la barre de défilement est compensée (cf. CSS :root). */
    function lockScroll(lock) {
      var sw = window.innerWidth - document.documentElement.clientWidth;
      document.documentElement.style.setProperty('--scrollbar-w', sw + 'px');
      document.documentElement.classList.toggle('is-contact-open', lock);
    }

    function paintCta() {
      cta.setAttribute('aria-expanded', isOpen() ? 'true' : 'false');
    }

    /* Réouverture : on repart d'un formulaire vierge, la confirmation
       précédente est effacée. */
    function resetPanel() {
      if (successEl && !successEl.hidden) {
        successEl.hidden = true;
        form.hidden = false;
        form.reset();
      }
    }

    function open() {
      /* Un seul overlay à la fois : referme le calendrier s'il est ouvert
         (son close() déverrouille le scroll et remet l'état de la pastille). */
      var booking = $('#booking');
      if (booking && booking.classList.contains('is-open')) {
        var closer = $('[data-booking-close]', booking);
        if (closer) closer.click();
      }
      resetPanel();
      root.classList.add('is-open');
      lockScroll(true);
      paintCta();
      var first = $('input, textarea', form);
      if (first) first.focus();
    }

    function close() {
      root.classList.remove('is-open');
      lockScroll(false);
      paintCta();
      cta.focus();
    }

    cta.addEventListener('click', function () {
      if (isOpen()) close();
      else open();
    });

    $$('[data-contact-close]', root).forEach(function (el) {
      el.addEventListener('click', function () { close(); });
    });

    /* Envoi : la validation native (required, type=email) a déjà filtré.
       ---------- À REMPLACER : envoi réel du message ----------
       Récupérer les valeurs (name, email, phone, message) et les envoyer
       — fetch POST vers un endpoint ou un service de formulaire. Ensuite,
       garder l'affichage de la confirmation ci-dessous.
       --------------------------------------------------------- */
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (successEl) {
        form.hidden = true;
        successEl.hidden = false;
        /* Le bouton d'envoi — qui avait le focus — vient de disparaître :
           sans rattrape, le focus retombe sur <body>, hors du dialogue. */
        successEl.focus();
      } else {
        form.reset();
      }
    });

    /* Échap ferme et rend le focus à la pastille contact ; Tab boucle dans le
       panneau (champs + boutons ; le voile et la barre d'actions en sont
       exclus — tout ce qui est sous le voile est hors d'atteinte). Les blocs
       [hidden] sont écartés de la boucle : le `.focus()` dessus serait refusé
       (display:none) et le focus resterait bloqué. */
    document.addEventListener('keydown', function (e) {
      if (!isOpen()) return;
      if (e.key === 'Escape') { e.preventDefault(); close(); return; }
      if (e.key !== 'Tab') return;
      var f = $$(
        'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled])',
        root
      ).filter(function (el) { return !el.closest('[hidden]'); });
      if (!f.length) return;
      var first = f[0];
      var last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    });
  })();

  /* ---------- Alternance Histoire / Domaine ----------
     La section #decouvrir contient deux .swap-panel superposés dans la
     même cellule de grille : un clic sur « Découvrir le domaine » bascule
     le panneau du plan + texte, « Notre histoire » rebascule. Le CSS pose
     le cross-fade ; ici on ne fait qu'échanger l'état. */
  (function initHistorySwap() {
    var root = $('[data-swap-root]');
    if (!root) return;
    var panels = $$('.swap-panel', root);

    function show(name) {
      /* Ordre robuste face à la transition CSS : basculer les classes,
         tenter le focus immédiat, libérer le focus résiduel si Chrome
         l'a refusé, puis seulement poser les aria-hidden. Le focus
         immédiat peut échouer parce que le panneau fraîchement affiché
         vient de quitter visibility:hidden via une transition de
         0,35 s : tant qu'un descendant garde le focus, Chrome bloque
         aria-hidden et signale « Blocked aria-hidden on an element
         because its descendant retained focus » — d'où le blur() de
         secours et la reprise du focus en requestAnimationFrame. */
      var target = null;
      panels.forEach(function (p) {
        var active = p.getAttribute('data-panel') === name;
        p.classList.toggle('is-active', active);
        if (active) target = p;
      });

      var btn = target ? $('[data-swap]', target) : null;

      if (btn) btn.focus();

      /* Si le focus n'a pas bougé et reste dans un panneau qui va être
         masqué : le libérer explicitement. */
      var still = document.activeElement;
      if (
        still &&
        root.contains(still) &&
        !target.contains(still) &&
        still === document.activeElement
      ) {
        still.blur();
      }

      panels.forEach(function (p) {
        var active = p.getAttribute('data-panel') === name;
        p.setAttribute('aria-hidden', active ? 'false' : 'true');
      });

      /* Le focus immédiat a peut-être été refusé : le reprendre sur le
         bouton une fois le panneau réellement rendu. Sans effet s'il a
         déjà été pris (le bouton est l'activeElement). */
      if (btn && typeof requestAnimationFrame === 'function') {
        requestAnimationFrame(function () {
          if (btn !== document.activeElement) btn.focus();
        });
      }
    }

    root.addEventListener('click', function (e) {
      var btn = e.target.closest ? e.target.closest('[data-swap]') : null;
      if (!btn || !root.contains(btn)) return;
      show(btn.getAttribute('data-swap'));
    });
  })();

  /* Changement de langue : les longueurs de texte changent — la géométrie
     des effets de scroll (features épinglées, bande de la pastille, deck)
     doit être remesurée, comme au redimensionnement de la fenêtre.
     L'année du pied de page aussi est réécrite : son instantané FR a été
     capturé avant que ce script ne la remplisse, le retour au français
     restaurerait un <span> vide sinon. */
  /* ---------- Panneau randonnées de la section vague ----------
     Le bouton "Voir les randonnées" ouvre vers le bas le topo des
     boucles au départ de Nant. Chaque boucle porte un bouton "En savoir
     plus" : au clic, sa fiche se déplie DANS le flux entre elle et la
     boucle suivante ; une seule fiche est ouverte à la fois. Échap ou un
     clic à l'extérieur referment l'ensemble. */
  (function () {
    var toggle = document.getElementById('wave-hikes-toggle');
    var panel = document.getElementById('wave-hikes');
    if (!toggle || !panel) return;

    var buttons = Array.prototype.slice.call(
      panel.querySelectorAll('.wave__hike-more')
    );

    function isOpen() { return panel.classList.contains('is-open'); }

    /* Une seule fiche dépliée : referme tout. */
    function collapse() {
      buttons.forEach(function (btn) {
        btn.setAttribute('aria-expanded', 'false');
        var li = btn.closest('.wave__hike');
        if (li) li.classList.remove('is-active');
      });
    }

    function setOpen(open) {
      panel.classList.toggle('is-open', open);
      toggle.classList.toggle('is-open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      /* À la fermeture, le focus est rendu au toggle AVANT de poser
         aria-hidden=true sur le panneau : si le focus est encore dans le
         panneau masqué, Chrome bloque l'attribut et signale
         « Blocked aria-hidden on an element because its descendant
         retained focus ». Idempotent : le toggle.focus() du handler
         Échap reste sans effet supplémentaire. */
      if (!open && panel.contains(document.activeElement)) toggle.focus();
      panel.setAttribute('aria-hidden', open ? 'false' : 'true');
      if (!open) collapse();
    }

    buttons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var open = btn.getAttribute('aria-expanded') === 'true';
        collapse();
        if (!open) {
          btn.setAttribute('aria-expanded', 'true');
          var li = btn.closest('.wave__hike');
          if (li) li.classList.add('is-active');
        }
      });
    });

    toggle.addEventListener('click', function () {
      setOpen(!isOpen());
    });

    panel.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { setOpen(false); toggle.focus(); }
    });

    document.addEventListener('click', function (e) {
      if (!isOpen()) return;
      if (panel === e.target || panel.contains(e.target) || e.target === toggle) return;
      setOpen(false);
    });
  })();

  /* Changement de langue : les longueurs de texte changent, la géométrie
     des effets épinglés est remesurée (voir module au-dessus). */
  document.addEventListener('langchange', function () {
    if (yearEl) yearEl.textContent = new Date().getFullYear();
    cacheFeatureTops();
    cacheBookingCtaBand();
    if (typeof deckLayout === 'function') deckLayout();
    updateScrollEffects();
  });

})();
