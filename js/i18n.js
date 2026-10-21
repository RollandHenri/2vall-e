/* ============================================================
   Camping Les 2 Vallées — Sélecteur de langue & i18n
   Vanilla JS · FR par défaut · EN (GB) · NL
   Principe :
   - Les textes français VIVENT dans le HTML (aucune clé FR à écrire) ;
     chaque élément traduisible porte data-i18n="cle" (contenu) ou
     data-i18n-attr="attribut:cle" (aria-label, title…).
   - Le dictionnaire ci-dessous porte les traductions EN et NL de ces clés
     (plus les quelques chaînes fabriquées par le script, sous le
     préfixe "js." — celles-là ont aussi leur valeur FR, car le script les
     recrée à chaud : aria du burger, pastilles du carrousel, calendrier…).
   - Clé absente d'une langue → texte courant conservé tel quel
     (utile quand la valeur FR est déjà la bonne, ex. « Dive into the blue »).
   - Le choix est mémorisé (localStorage « l2v-lang »), défaut FR.
   - Événement « langchange » diffusé après chaque application : le script
     principal remesure la géométrie (features épinglées, deck, pastille).
   ============================================================ */
(function () {
  'use strict';

  var KEY = 'l2v-lang';
  var LANGS = ['fr', 'en', 'nl'];

  /* Clés dont la traduction porte réellement du HTML (balises star, mark,
     strong, placeholder, span#year) : seule l'injection HTML est permise.
     Tout le reste passe par textContent — une clé qui deviendrait un jour
     dynamique (paramètre d'URL, contenu distant, localStorage) ne peut plus
     injecter de balise. Fermeture de la seule surface innerHTML du site. */
  var HTML_KEYS = [
    'foot.rights',
    'intro.c1.p',
    'intro.c2.p',
    'intro.c3.p',
    'l1.meta',
    'l2.meta',
    'l3.meta',
    'l4.meta',
    'l5.meta',
    'm.s1.form',
    'm.s1.vat',
    'm.s3.addr',
    'm.s3.den',
    'm.s3.mail',
    'm.s3.tel',
    'm.s3.web'
  ];

  /* ------------------------------------------------------------
     Dictionnaire — clés "js.*" : recyclées par le script principal.
     ------------------------------------------------------------ */
  var MSG = {};

  /* FR : uniquement les chaînes fabriquées par le script (le reste du texte
     FR vit déjà dans les pages). */
  MSG.fr = {
    'js.menuOpen': 'Ouvrir le menu',
    'js.menuClose': 'Fermer le menu',
    'js.locDot': 'Aller à la location {n}',
    'js.calPrev': 'Mois précédent',
    'js.calNext': 'Mois suivant',
    'js.selIn': " — date d'arrivée sélectionnée",
    'js.selOut': ' — date de départ sélectionnée',
    'js.selRange': ' — dans la plage sélectionnée',
    'js.hintBoth': 'Séjour du {a} au {b}.',
    'js.hintOut': 'Choisissez maintenant la date de départ.',
    'js.hintForce': 'Choisissez vos deux dates pour continuer.',
    'js.hintIn': "Choisissez la date d'arrivée.",
    'js.ctaOpen': 'Réservez votre séjour',
    'js.ctaValidate': 'Valider',
    'js.campPrev': 'Photo précédente',
    'js.campNext': 'Photo suivante',
    'js.campDot': 'Aller à la photo {n}',
    'js.role': 'carrousel',
    /* Pastille de langue : langue courante dans l'aria + libellé de base */
    'js.langChange': 'Changer de langue',
    'js.langCurrent': 'Français',
    'js.langDefault': 'défaut'
  };

  /* EN — pages + chaînes du script */
  MSG.en = {
    /* Chaînes du script */
    'js.menuOpen': 'Open menu',
    'js.menuClose': 'Close menu',
    'js.locDot': 'Go to rental {n}',
    'js.calPrev': 'Previous month',
    'js.calNext': 'Next month',
    'js.selIn': ' — selected arrival date',
    'js.selOut': ' — selected departure date',
    'js.selRange': ' — within the selected range',
    'js.hintBoth': 'Stay from {a} to {b}.',
    'js.hintOut': 'Now choose your departure date.',
    'js.hintForce': 'Choose both dates to continue.',
    'js.hintIn': 'Choose your arrival date.',
    'js.ctaOpen': 'Book your stay',
    'js.ctaValidate': 'Confirm',
    'js.role': 'carousel',
    'js.campPrev': 'Previous photo',
    'js.campNext': 'Next photo',
    'js.campDot': 'Go to photo {n}',
    'js.langChange': 'Change language',
    'js.langCurrent': 'English',
    'js.langDefault': 'default',
    'campGallery.sliderAria': 'Campsite photo carousel',
    'campGallery.dotsAria': 'Photo navigation',
    /* Meta (accueil) */
    'home.meta.desc':
      'Camping Les 2 Vallées: nature, glamping, pools and outdoor activities. Book your stay.',
    /* Header */
    'header.navAria': 'Main navigation',
    'header.langAria': 'Change language',
    /* Nav */
    'nav.accueil': 'Home',
    'nav.camping': 'The campsite',
    'nav.prestations': 'Services',
    'nav.region': 'Region',
    'nav.locations': 'Rentals',
    'nav.infos': 'Info',
    /* Infos pratiques (documents à télécharger) */
    'infos.badge': 'Practical info',
    'infos.title': 'Documents & information',
    'infos.lead': 'Download everything you need to know before your stay.',
    'docs.contract': 'Booking contract',
    'docs.plan': 'Campsite map',
    'docs.rules': 'House rules',
    'docs.cg': 'Terms & conditions',
    /* Hero */
    'hero.eyebrow': 'Nature & fresh air',
    /* Hero — texte pur : la structure (br + étoiles) vit dans le HTML,
       jamais dans les traductions. */
    'hero.title': 'Camping Les 2 Vallées',
    'hero.slogan': 'Where happiness is born',
    'hero.cta': 'Discover',
    'lang.open': 'Change language',
    /* Sipario */
    'sipario.p':
      'Your next place to stay. We welcome you for rentals and camping pitches in a region rich in discoveries and stories.',
    'sipario.cta': 'Explore the rentals',
    /* Intro */
    'intro.badge': 'Since 1969',
    'intro.title': 'Camping in Nant, Aveyron',
    'intro.lead':
      'Camping Les 2 Vallées in Aveyron will be your next place to stay. We welcome you from 10 April to 31 October 2027 for rentals and camping pitches!',
    'intro.c1.title': 'Pitches',
    'intro.c1.p':
      '<span class="mark">80 pitches in total</span>: 62 camping pitches (for your tent, caravan or motorhome) and 18 rentals (1 cabin without bathrooms, 16 mobile homes and 1 chalet).',
    'intro.c2.title': 'A journey into nature',
    'intro.c2.p':
      '<span class="mark">Just 800 m from the medieval village of Nant</span>, with all amenities, it is the perfect place to discover Millau, the Roquefort cellars, the Gorges du Tarn, Rodez and the many must-see sights of the Aveyron.',
    'intro.c3.title': 'Comfort & amenities',
    'intro.c3.p':
      '<span class="mark">The perfect combination</span>: many camping pitches are accessible, flat and spacious, welcoming guests with reduced mobility (PRM). In addition, a private washroom block with fully adapted facilities is available.',
    /* Features */
    'feat.badge': 'Our services',
    'f1.badge': 'Pool',
    'f1.badge2': 'Pools',
    'f1.title': 'Dive into the blue',
    'f1.p':
      'From May to September, the campsite pool is open from 9:30 am to 8:30 pm. Sun loungers are at your disposal to make the most of the sun and of relaxing moments by the water.',
    'f1.media': 'Pools in the heart of nature',
    'f2.badge': 'Pitches',
    'f2.title': 'In the open air',
    'f2.p':
      'We offer pitches (bring your own tent), tented lodgings, mobile homes and a chalet.',
    'f3.badge': 'Pet friendly',
    'f3.title': 'We love animals!',
    'f3.p':
      'Your four-legged friends can share the magic of nature with you, safely.',
    'f3.media': 'Dog sitting in the grass next to a green tent',
    'f4.badge': 'Food & drinks',
    'f4.title': 'The gourmet corner',
    'f4.p':
      'Snacks, ice creams and local produce: plenty to feast on without leaving the campsite. Indoor or terrace service, in the shade of the valleys.',
    'f4.media': 'Snack bar terrace and local farm produce',
    'f5.badge': 'Games',
    'f5.title': 'Outdoor play area',
    'f5.p':
      'Slide, swings, ping-pong table and pétanque court: children have a blast while the grown-ups unwind.',
    'f5.media': 'Outdoor play area',
    'f6.badge': 'Motorhomes',
    'f6.title': 'Motorhome service area',
    'f6.p':
      'Service point, waste disposal, water and electricity: everything is laid on for motorhomes. Flat, spacious and accessible pitches.',
    'f6.media': 'Service area for motorhomes',
    /* Région */
    'region.badge': 'Region',
    'region.title': 'The great sights around Nant',
    'region.lead':
      'Less than an hour from the campsite, the Aveyron unfolds its finest sights. Scroll on: the photos stack up, the captions follow.',
    'r1.aria': 'The Millau viaduct towering over the Tarn valley',
    'r1.title': 'The Millau viaduct',
    'r1.p':
      'Standing 343 m above the Tarn, the Millau viaduct is the most spectacular structure in the Aveyron. Admire it from the free viewing area and its belvedere, open all year round.',
    'r1.time': '≈ 35 min from Nant',
    'r2.aria': 'The village of Castelbouc clinging to the cliff of the Gorges du Tarn',
    'r2.title': 'The Gorges du Tarn',
    'r2.p':
      'The Tarn has carved one of the longest canyons in Europe here. Cliff roads, dizzying belvederes and villages clinging to the rock face: the grand theatre of the Causse.',
    'r2.time': '≈ 55 min from Nant',
    'r3.aria': 'The ramparts and castle of La Couvertoirade',
    'r3.title': 'La Couvertoirade',
    'r3.p':
      'A 12th-century Templar town set on the Larzac cause, it has kept its ramparts, castle and cobbled streets. One of the Most Beautiful Villages of France, listed by UNESCO.',
    'r3.time': '≈ 30 min from Nant',
    'r4.aria': 'The Gate of Mycenae, in the rock chaos of Montpellier-le-Vieux',
    'r4.title': 'La Cité de Pierres',
    'r4.p':
      'On the Causse Noir, erosion has sculpted a city of stone: arches, ramparts and giant figures. Explore it on foot, or on the little tourist train.',
    'r4.time': '≈ 50 min from Nant',
    'r5.aria': 'Ripening gallery in the Roquefort cellars',
    'r5.title': 'The Roquefort cellars',
    'r5.p':
      'Deep inside the Combalou, at 10 °C all year round, the famous cheeses slowly mature. The guided tour of the Société cellars ends with a tasting.',
    'r5.time': '≈ 30 min from Nant',
    /* Vague */
    'wave.title': 'The village where the trails begin',
    'wave.text':
      'From the village itself: 8 waymarked loops in the Grands Causses, from an easy family stroll along the Dourbie to a full day out on the Larzac plateau.',
    'wave.cta': 'View the hikes',
    'wave.hikesLabel': 'Hikes starting from the village of Nant',
    'wave.hikesTitle': 'Hikes starting from the village of Nant',
    'wave.hikesIntro': '8 waymarked loops starting from Nant.',
    'wave.more': 'Learn more',
    'wave.lvl1': 'Easy',
    'wave.lvl2': 'Medium',
    'wave.lvl3': 'Sporty',
    'wave.lvl4': 'Expert',
    'wave.d1':
      'A gentle walk along the Dourbie, well suited to families. The trail follows the river and returns through the village lanes.',
    'wave.t1': 'Shade in the afternoon — start by the covered market.',
    'wave.d2':
      'A first look at the gorges downstream of the village: the trail drops to the river, then climbs back to the causse on a shaded track.',
    'wave.t2': 'A good swimming spot, depending on the season.',
    'wave.d3':
      'The Nant classic. Across the medieval Pont de la Prade, up to the Roc Nantais viewpoint for a sweeping view over the Dourbie valley.',
    'wave.t3': 'Start early: the plateau is fully exposed after noon.',
    'wave.d4':
      'Trails suspended above the Cernon gorges, between limestone meadows and cliffs. Return across the plateau.',
    'wave.t4': 'Mind the wind on the ridges.',
    'wave.d5':
      'Across the Larzac causse through juniper and box scrubland, out to the hamlet of Egalières and its state forest.',
    'wave.t5': 'Carry water: there is none on the causse.',
    'wave.d6':
      'A loop to the Tournemire cirque: Templar houses, springs and potholes on the Larzac plateau, with wide views along the crests.',
    'wave.t6': 'A short variant makes the cirque visit possible.',
    'wave.d7':
      'A stage of the Path of the Templars and Hospitallers, white-and-red GR waymarks, chooseable from 8 to 22 km to suit the day and the group.',
    'wave.t7': 'Topo-guide on sale at the Nant tourist office.',
    'wave.d8':
      'The big day out: the Roc Nantais viewpoint, the Dourbie valley and arrival in Saint-Jean-du-Bruel, cafés and fountains at the finish.',
    'wave.t8': 'Picnic in your pack; set off at first light.',
    /* Locations */
    'loc.badge': 'Our rentals',
    'loc.title': 'Choose the option that suits you',
    'loc.lead':
      'Scroll through: the centred photo grows in width and height.',
    'loc.sliderAria': 'Rentals carousel',
    'loc.dotsAria': 'Rentals navigation',
    'loc.prev': 'Previous rental',
    'loc.next': 'Next rental',
    'loc.book': 'Book',
    'l1.aria': 'Chalet Sélection',
    'l1.title': 'Chalet Sélection',
    'l1.meta': '4 people · 2 bedrooms · from <strong>€46</strong> / night',
    'l2.aria': 'Cosy 2-bedroom mobile home',
    'l2.title': 'Cosy 2-bedroom mobile home',
    'l2.meta': '5 people · from <strong>€37</strong> / night',
    'l3.aria': 'Camping pitch with a campervan and its awning',
    'l3.title': 'Camping pitch',
    'l3.meta': 'Tent, caravan or campervan · from <strong>€13.30</strong> / night',
    'l4.aria': 'Wooden chalet',
    'l4.title': 'Wooden chalet',
    'l4.meta': '4 to 6 people · from <strong>€95</strong> / night',
    'l5.aria': 'Safari tent',
    'l5.title': 'Safari tent',
    'l5.meta': '5 people · from <strong>€74</strong> / night',
    /* Histoire */
    'hist.aria': 'The village and the valley',
    'hist.badge': 'Our story',
    'hist.title': 'In nature since 1969',
    'hist.p1':
      "Camping Les 2 Vallées was born of a family's love for the outdoors. Over the decades it has grown in harmony with the land, keeping that spirit of openness and respect for living things.",
    'hist.p2':
      'Today, backed by many innovations in accommodation, the campsite is a fixed stop for anyone who wants to recharge body and mind.',
    'hist.cta': 'Explore the campsite',
    /* Domaine (plan + texte) */
    'dom.aria': 'Map of Camping Les 2 Vallées',
    'dom.badge': 'The grounds',
    'dom.title': 'A grounds shaped by nature',
    'dom.p1':
      'Straddling the valleys of the Tarn and the Dourbie, the grounds spread its shaded pitches, chalets and Safari tents over a hillside site where every pitch keeps its shade and quiet.',
    'dom.p2':
      'Heated pool, snack bar and homemade breakfasts, play area, laundry and Wi-Fi welcome: all the services of a campsite open all year round, a stone’s throw from the cliffs of the Roque Sainte Victoire. The map helps you find your way as soon as you arrive.',
    /* Moyens de paiement */
    'pay.badge': 'Payment',
    'pay.title': 'Accepted payment methods',
    'pay.lead': 'Settle your stay with complete peace of mind.',
    'pay.cb': 'Credit / debit card',
    'pay.cheque': 'Bank cheque',
    'pay.vacances': 'Holiday vouchers',
    'pay.virement': 'Bank transfer',
    /* Pied de page */
    'foot.tag': 'Nature, glamping & relaxation in the heart of the valleys.',
    'foot.hours': 'Reception hours',
    'foot.nav': 'Navigation',
    'foot.find': 'Where to find us',
    'foot.mapAria': 'Map of the campsite',
    'foot.partnersAria': 'Partners',
    'foot.rights':
      '© <span id="year"></span> Camping Les 2 Vallées — All rights reserved.',
    'foot.legal': 'Legal notice',
    'foot.privacy': 'Privacy policy',
    /* Réservation */
    'book.title': 'Choose your dates',
    'book.closeAria': 'Close the calendar',
    'book.datesAria': 'Stay dates',
    'book.fStart': 'Arrival',
    'book.fEnd': 'Departure',
    'book.typeAria': 'Accommodation type',
    'book.typeEmpl': 'Pitch',
    'book.typeMh': 'Mobil-home',
    'book.typeCh': 'Chalet',
    /* Contact */
    'contact.cta': 'Contact us',
    'contact.title': 'Contact us',
    'contact.closeAria': 'Close the contact form',
    'contact.formAria': 'Contact form',
    'contact.name': 'Name',
    'contact.phName': 'Your name',
    'contact.email': 'E-mail',
    'contact.phEmail': 'you@example.com',
    'contact.phone': 'Phone (optional)',
    'contact.phPhone': '06 12 34 56 78',
    'contact.message': 'Message',
    'contact.phMessage': 'Your message…',
    'contact.send': 'Send',
    'contact.success': 'Thank you! Your message has been sent. We will get back to you shortly.',
    /* Pages légales */
    'leg.navAria': 'Page navigation',
    'leg.back': 'Back to the site',
    'mentions.meta.title': 'Legal notice — Camping Les 2 Vallées',
    'mentions.meta.desc':
      'Legal information about the Camping Les 2 Vallées website (Nant, Aveyron): publisher, host and intellectual property, in accordance with French law.',
    'm.h1': 'Legal notice',
    'm.lead':
      'In accordance with Article 6-III of French Law No. 2004-575 of 21 June 2004 on confidence in the digital economy (LCEN), you will find below the identity of the various parties involved in this website.',
    'm.s1': 'Website publisher',
    'm.s1.name': 'Company name: Camping Les 2 Vallées',
    'm.s1.form': 'Legal form: <span class="placeholder">[To be completed]</span>',
    'm.s1.siret': 'SIRET number: 499 159 820 00012',
    'm.s1.vat': 'Intra-Community VAT number: <span class="placeholder">[To be completed]</span>',
    'm.s1.addr': "Establishment address: Route de l'Estrade basse, 12230 Nant (Aveyron)",
    'm.s1.tel': 'Phone: ',
    'm.s1.mail': 'Contact e-mail: ',
    'm.s1.pub': 'Publishing directors: Cécile and Pascal',
    'm.s2': 'Design & development',
    'm.s2.by': 'Website designed by',
    'm.s3': 'Website host',
    'm.s3.den': 'Name: <span class="placeholder">[To be completed]</span>',
    'm.s3.addr': 'Address: <span class="placeholder">[To be completed]</span>',
    'm.s3.tel': 'Phone: <span class="placeholder">[To be completed]</span>',
    'm.s3.mail': 'Technical support e-mail: <span class="placeholder">[To be completed]</span>',
    'm.s3.web': 'Website: <span class="placeholder">[To be completed]</span>',
    'm.s4': 'Intellectual property',
    'm.s4.p1':
      'All elements of the website (texts, trademarks, logo, graphic charter, photographs, videos and structure) are protected by intellectual property law. Unless stated otherwise, they belong to the website publisher (Camping Les 2 Vallées), and any total or partial reproduction, adaptation or use without prior written authorisation is prohibited.',
    'm.s4.p2':
      'Some photographs are third-party works released under free licences; their credits appear near the visuals on the home page (for example, the photo of the "Sipario" curtain or the regional sites — Wikimedia Commons). Each image remains subject to the licence stated by its author.',
    'm.s5': 'Applicable law',
    'm.s5.p1':
      'This website is subject to French law and its use is governed by that law. For any dispute, only the French courts have jurisdiction.',
    'm.s5.p2':
      'The publisher accepts no liability for the content of websites to which this website links via hyperlinks, nor for websites linking to this website without its knowledge: the information presented on those other websites is the sole responsibility of their publishers.',
    'm.s5.note':
      'The "Website host" box (and, where applicable, the legal form and the VAT number) still needs to be completed before the final go-live.',
    'privacy.meta.title': 'Privacy policy — Camping Les 2 Vallées',
    'privacy.meta.desc':
      'Privacy policy of Camping Les 2 Vallées: personal data collected, purposes, retention periods and your rights (GDPR).',
    'p.badge': 'Your data, made clear',
    'p.h1': 'Privacy policy',
    'p.lead':
      'In accordance with the General Data Protection Regulation (GDPR, EU Regulation 2016/679) and the French Data Protection Act, this page describes the data processed by the campsite and the rights you have.',
    'p.s1': 'Who are we?',
    'p.s1.p':
      "Camping Les 2 Vallées — route de l'Estrade basse, 12230 Nant (Aveyron). All our details are on the ",
    'p.s2': 'Use of the personal data collected',
    'p.s2.p':
      'We do not automatically collect or generate any data about you. The only personal data we process is what you choose to share with us:',
    'p.s2.l1':
      'when getting in touch (form, telephone, e-mail): first and last name, e-mail address and/or phone number, and the details of your message (desired dates of stay, number of guests, type of accommodation);',
    'p.s2.l2a':
      'when booking, entered directly on the booking platform ',
    'p.s2.l2b':
      ', which processes the stay and payment data itself: its own privacy policy applies, and the campsite is not a recipient of the payment data.',
    'p.s2.f': 'Purposes and legal bases',
    'p.s2.l21':
      'Answering your requests for information and availability — legal basis: legitimate interest (managing the customer relationship).',
    'p.s2.l22':
      'Managing bookings concluded (stay follow-up, regulatory reporting) — legal basis: performance of the contract.',
    'p.s2.l23':
      'Publishing your photos if you have consented',
    'p.s2.l23b': ' — legal basis: consent, which can be withdrawn at any time.',
    'p.s2.p2':
      'No personal data is sold, rented or exchanged with third parties for commercial purposes.',
    'p.s3': 'Contact forms',
    'p.s3.p':
      'The information you choose to share with us via a form is sent to us by e-mail and kept nowhere other than in our mail service. It is used solely to answer your request. If any information could be used for commercial purposes, a notice would say so at the end of the form: we always ask for your consent when collection takes place via a form.',
    'p.s4': 'Use of cookies',
    'p.s4.q': 'What is a cookie?',
    'p.s4.qp':
      'A cookie is a small data file transferred to and stored on your device. It can, for example, recognise your browser or your language, or keep your preferences. More information at ',
    'p.s4.o': 'Our cookies',
    'p.s4.op1':
      'This site does not set any cookie: no analytics cookie, no embedded content (videos, articles, images from other sites), no social plugin, no advertising tracker. The only exposure to cookies occurs when you click the link ',
    'p.s4.op2':
      ', which takes you to the booking platform ',
    'p.s4.op3':
      ': once on its site, its own privacy policy applies ',
    'p.s4.op4': '.',
    'p.s5': 'Statistics and audience measurement',
    'p.s5.p':
      'This site uses neither Google Analytics nor any other audience measurement tool: no statistics on your browsing are collected.',
    'p.s6': 'How long we keep your data',
    'p.s6.l1': 'Enquiries without follow-up: ',
    'p.s6.l2': 'Documents relating to bookings and stays: ',
    'p.s7': 'Your rights over your data',
    'p.s7.l1': 'access: obtain a copy of your data,',
    'p.s7.l2': 'rectification: correct an item of information,',
    'p.s7.l3': 'erasure: request the deletion,',
    'p.s7.l4': 'restriction and objection: suspend or refuse a processing,',
    'p.s7.l5': 'portability: receive your data in a structured format,',
    'p.s7.l6': 'withdrawal of consent, at any time and without justification.',
    'p.s7.p2a': 'You can exercise these rights by e-mail at ',
    'p.s7.p2b':
      ' or by post to the address of the publisher (see the legal notice). We may ask you to verify your identity before taking measures regarding your request, and we answer within one month. If you believe your rights are being infringed, you can lodge a complaint with the CNIL (',
    'p.s7.p2c': ').',
    'p.s8': 'Sharing of your personal data',
    'p.s8.p':
      'The personal data we process is not resold. It is intended for the staff of the campsite and, as the case may be, its technical providers: the website host (see the legal notice) and the booking platform mentioned above. All the personal data we process is processed within the European Union ',
    'p.s9': 'How we protect your data',
    'p.s9.p':
      "We constantly implement and update the security of the site to protect your information against unauthorised access, loss, destruction or alteration. The site is served over HTTPS and access is limited to the authorised persons only. As the internet is not a 100% secure environment, we cannot fully guarantee the security of the transmission or storage of your information.",
    'p.s10': 'Contact information',
    'p.s10.p1': 'For any request or question concerning your personal data, contact us at ',
    'p.s10.p2': '; the other contact details appear in our ',
    'p.s10.note': 'Last updated: ',
    'p.s2.ph': '[To be completed]',
    'p.s2.ph2': '[To be completed if applicable]',
    'p.s2.ph3': '[To be completed — platform link]',
    'p.s2.ph4': '[To be completed — e.g. 3 years from the last contact]',
    'p.s2.ph5': '[To be completed — e.g. 3 years, or the legal accounting period]',
    'p.s2.ph6': '[to be confirmed with the host]',
    'p.s2.ph7': '[To be completed — date]',
    'p.s4.cta': '“Book your stay”'
  };

  /* NL — pages + chaînes du script */
  MSG.nl = {
    /* Chaînes du script */
    'js.menuOpen': 'Menu openen',
    'js.menuClose': 'Menu sluiten',
    'js.locDot': 'Ga naar verblijf {n}',
    'js.calPrev': 'Vorige maand',
    'js.calNext': 'Volgende maand',
    'js.selIn': ' — geselecteerde aankomstdatum',
    'js.selOut': ' — geselecteerde vertrekdatum',
    'js.selRange': ' — binnen de geselecteerde periode',
    'js.hintBoth': 'Verblijf van {a} tot {b}.',
    'js.hintOut': 'Kies nu de vertrekdatum.',
    'js.hintForce': 'Kies beide data om verder te gaan.',
    'js.hintIn': 'Kies de aankomstdatum.',
    'js.ctaOpen': 'Boek uw verblijf',
    'js.ctaValidate': 'Bevestigen',
    'js.campPrev': 'Vorige foto',
    'js.campNext': 'Volgende foto',
    'js.campDot': 'Ga naar foto {n}',
    'campGallery.sliderAria': 'Fotocarrousel van de camping',
    'campGallery.dotsAria': 'Fotonavigatie',
    'js.role': 'carrousel',
    'js.langChange': 'Taal wijzigen',
    'js.langCurrent': 'Nederlands',
    'js.langDefault': 'standaard',
    /* Meta (accueil) */
    'home.meta.desc':
      'Camping Les 2 Vallées: natuur, glamping, zwembaden en buitenactiviteiten. Boek uw verblijf.',
    /* Header */
    'header.navAria': 'Hoofdnavigatie',
    'header.langAria': 'Taal wijzigen',
    /* Nav */
    'nav.accueil': 'Home',
    'nav.camping': 'De camping',
    'nav.prestations': 'Diensten',
    'nav.region': 'Regio',
    'nav.locations': 'Verhuur',
    'nav.infos': 'Info',
    /* Infos pratiques (documents à télécharger) */
    'infos.badge': 'Practische info',
    'infos.title': 'Documenten & informatie',
    'infos.lead': 'Download alles wat u nodig heeft voor uw verblijf.',
    'docs.contract': 'Reserveringscontract',
    'docs.plan': 'Plattegrond van de camping',
    'docs.rules': 'Huisreglement',
    'docs.cg': 'Algemene voorwaarden',
    /* Hero */
    'hero.eyebrow': 'Natuur & frisse lucht',
    'hero.title': 'Camping Les 2 Vallées',
    'hero.slogan': 'Waar geluk geboren wordt',
    'hero.cta': 'Ontdekken',
    'lang.open': 'Taal wijzigen',
    /* Sipario */
    'sipario.p':
      'Uw volgende verblijfplaats. Wij verwelkomen u voor verhuur en kampeerplaatsen in een regio vol ontdekkingen en verhalen.',
    'sipario.cta': 'Ontdek de accommodaties',
    /* Intro */
    'intro.badge': 'Sinds 1969',
    'intro.title': 'Kamperen in Nant, Aveyron',
    'intro.lead':
      'Camping Les 2 Vallées in de Aveyron wordt uw volgende verblijfplaats. Wij ontvangen u van 10 april tot 31 oktober 2027 voor verhuur en kampeerplaatsen!',
    'intro.c1.title': 'Staanplaatsen',
    'intro.c1.p':
      '<span class="mark">80 staanplaatsen in totaal</span>: 62 kampeerplaatsen (voor uw tent, caravan of camper) en 18 verblijven (1 cabine zonder sanitair, 16 mobilhomes en 1 chalet).',
    'intro.c2.title': 'Een reis door de natuur',
    'intro.c2.p':
      '<span class="mark">Op 800 m van het middeleeuwse dorp Nant</span>, met alle voorzieningen, is dit de perfecte basis om Millau, de kelders van Roquefort, de Gorges du Tarn, Rodez en de vele hoogtepunten van de Aveyron te ontdekken.',
    'intro.c3.title': 'Comfort & voorzieningen',
    'intro.c3.p':
      '<span class="mark">De perfecte combinatie</span>: vele kampeerplaatsen zijn toegankelijk, vlak en ruim, geschikt voor gasten met beperkte mobiliteit. Bovendien staat een privé-sanitairgedeelte met volledig aangepaste voorzieningen ter beschikking.',
    /* Features */
    'feat.badge': 'Onze diensten',
    'f1.badge': 'Zwembad',
    'f1.badge2': 'Zwembaden',
    'f1.title': 'Duik in het blauw',
    'f1.p':
      'Van mei tot september is het zwembad van de camping open van 9.30 tot 20.30 uur. Ligstoelen staan tot uw beschikking om volop te genieten van de zon en ontspannende momenten aan het water.',
    'f1.media': 'Zwembaden midden in de natuur',
    'f2.badge': 'Staanplaatsen',
    'f2.title': 'In de buitenlucht',
    'f2.p':
      'Wij bieden staanplaatsen (eigen tent mee), tentverblijven, mobilhomes en een chalet aan.',
    'f3.badge': 'Pet friendly',
    'f3.title': 'Wij houden van dieren!',
    'f3.p':
      'Uw viervoetige vrienden mogen veilig met u meegenieten van de magie van de natuur.',
    'f3.media': 'Hond zittend in het gras naast een groene tent',
    'f4.badge': 'Eten & drinken',
    'f4.title': 'De lekkerste hoek',
    'f4.p':
      'Snacks, ijs en streekproducten: heerlijk tafelen zonder de camping te verlaten. Bediening binnen of op het terras, in de schaduw van de valleien.',
    'f4.media': 'Terras van de snack en streekproducten',
    'f5.badge': 'Spelen',
    'f5.title': 'Buitenspeelruimte',
    'f5.p':
      'Glijbaan, schommels, ping-pongtafel en petanqueterrein: kinderen beleven er plezier waar de volwassenen even bijkomen.',
    'f5.media': 'Buitenspeelplek',
    'f6.badge': 'Campers',
    'f6.title': 'Serviceplaats voor campers',
    'f6.p':
      'Servicepunt, afvalwater, water en elektriciteit: alles is geregeld voor campers. Vlakke, ruime en toegankelijke staanplaatsen.',
    'f6.media': 'Serviceplaats voor campers',
    /* Région */
    'region.badge': 'Regio',
    'region.title': 'De grote bezienswaardigheden rond Nant',
    'region.lead':
      'Op minder dan een uur van de camping ontplooit de Aveyron zijn mooiste sites. Scroll verder: de foto’s stapelen zich op, de bijschriften volgen.',
    'r1.aria': 'Het viaduct van Millau boven de vallei van de Tarn',
    'r1.title': 'Het viaduct van Millau',
    'r1.p':
      'Op 343 m boven de Tarn is het viaduct van Millau het meest spectaculaire bouwwerk van de Aveyron. Bewonder het vanuit de gratis kijkzone en het belvédère, het hele jaar door geopend.',
    'r1.time': '≈ 35 min vanaf Nant',
    'r2.aria': 'Het dorp Castelbouc tegen de rotswand van de Gorges du Tarn',
    'r2.title': 'De Gorges du Tarn',
    'r2.p':
      'De Tarn groef hier een van de langste canyons van Europa uit. Corniche-wegen, duizelingwekkende uitkijkpunten en dorpen tegen de rots: het grote schouwspel van de Causse.',
    'r2.time': '≈ 55 min vanaf Nant',
    'r3.aria': 'De wallen en het kasteel van La Couvertoirade',
    'r3.title': 'La Couvertoirade',
    'r3.p':
      'Tempeliersstad uit de 12e eeuw op de Larzac-plateau, met zijn wallen, kasteel en gekasseide straatjes bewaard. Een van de Mooiste Dorpen van Frankrijk, opgenomen op de UNESCO-lijst.',
    'r3.time': '≈ 30 min vanaf Nant',
    'r4.aria': 'De Poort van Mycene, in de rotswoestijn van Montpellier-le-Vieux',
    'r4.title': 'La Cité de Pierres',
    'r4.p':
      'Op de Causse Noir heeft erosie een stad van steen getimmerd: bogen, wallen en reusachtige gestalten. Te voet te verkennen, of met het kleine toeristische treintje.',
    'r4.time': '≈ 50 min vanaf Nant',
    'r5.aria': 'Rijpgalerij in de kelders van Roquefort',
    'r5.title': 'De kelders van Roquefort',
    'r5.p':
      'In de ingewanden van de Combalou, het hele jaar door 10 °C, rijpen de beroemde kazen. De rondleiding door de kelders van Société eindigt met een proeverij.',
    'r5.time': '≈ 30 min vanaf Nant',
    /* Vague */
    'wave.title': 'Het dorp waar de paden beginnen',
    'wave.text':
      'Recht vanuit het dorp: 8 gemarkeerde lussen in de Grands Causses, van een rustige familiewandeling langs de Dourbie tot een hele dag op het Larzac-plateau.',
    'wave.cta': 'Bekijk de wandelingen',
    'wave.hikesLabel': 'Wandelingen vanaf het dorp Nant',
    'wave.hikesTitle': 'Wandelingen vanaf het dorp Nant',
    'wave.hikesIntro': '8 gemarkeerde lussen vanaf Nant.',
    'wave.more': 'Meer weten',
    'wave.lvl1': 'Makkelijk',
    'wave.lvl2': 'Gemiddeld',
    'wave.lvl3': 'Sportief',
    'wave.lvl4': 'Expert',
    'wave.d1':
      'Een zachte wandeling langs de Dourbie, geschikt voor families. Het pad volgt de rivier en keert terug via de straatjes van het dorp.',
    'wave.t1': 'Schaduw in de namiddag — start aan de overdekte markt.',
    'wave.d2':
      'Eerste zichten op de kloven stroomafwaarts van het dorp: het pad daalt naar de rivier en klimt via een beschutte baan terug naar de causses.',
    'wave.t2': 'Een mooie plek om te zwemmen, afhankelijk van het seizoen.',
    'wave.d3':
      'De grote klassieker van Nant. Over de middeleeuwse brug van la Prade, omhoog naar de uitkijk van de Roc Nantais, met wijd zicht op de vallei.',
    'wave.t3': 'Vroeg starten: het plateau ligt na 12 uur volop in de zon.',
    'wave.d4':
      'Paden hoog boven de kloven van de Cernon, tussen kalkweiden en rotsen. Terugkeer over het plateau.',
    'wave.t4': 'Pas op voor de wind op de bergkammen.',
    'wave.d5':
      'Overdwars door de Larzac-causses langs heide en buxus, tot aan het gehucht Egalières en zijn staatsbos.',
    'wave.t5': 'Nemend water mee: er is geen punt op de causse.',
    'wave.d6':
      'Lus naar het cirkeltoren-dal van Tournemire: tempeliershuizen, bronnen en avennen op het plateau, met ruime zichten langs de ruggen.',
    'wave.t6': 'Een korte variant maakt het bezoek aan het dal mogelijk.',
    'wave.d7':
      'Een etappe van het Chemin des Templiers et Hospitaliers, witrode GR-markering, te kiezen van 8 tot 22 km naargelang de dag en de groep.',
    'wave.t7': 'Topo-gids te koop bij het toerismekantoor van Nant.',
    'wave.d8':
      'De grote dag: de uitkijk van de Roc Nantais, de vallei van de Dourbie en aankomst in Saint-Jean-du-Bruel, cafés en fonteinen op de aankomst.',
    'wave.t8': 'Picknick in de rugzak; start bij het eerste licht.',
    /* Locations */
    'loc.badge': 'Onze verhuur',
    'loc.title': 'Kies de oplossing die bij u past',
    'loc.lead':
      'Scroll verder: de foto in het midden wordt groter in breedte en hoogte.',
    'loc.sliderAria': 'Carrousel van de verhuur',
    'loc.dotsAria': 'Navigatie van de verhuur',
    'loc.prev': 'Vorige accommodatie',
    'loc.next': 'Volgende accommodatie',
    'loc.book': 'Boeken',
    'l1.aria': 'Chalet Sélection',
    'l1.title': 'Chalet Sélection',
    'l1.meta': '4 personen · 2 slaapkamers · vanaf <strong>€ 46</strong> / nacht',
    'l2.aria': 'Cosy mobilhome 2 slaapkamers',
    'l2.title': 'Cosy mobilhome 2 slaapkamers',
    'l2.meta': '5 personen · vanaf <strong>€ 37</strong> / nacht',
    'l3.aria': 'Kampeerplaats met een camper en luifel',
    'l3.title': 'Kampeerplaats',
    'l3.meta': 'Tent, caravan of camper · vanaf <strong>€ 13,30</strong> / nacht',
    'l4.aria': 'Houten chalet',
    'l4.title': 'Houten chalet',
    'l4.meta': '4 tot 6 personen · vanaf <strong>€ 95</strong> / nacht',
    'l5.aria': 'Safaritent',
    'l5.title': 'Safaritent',
    'l5.meta': '5 personen · vanaf <strong>€ 74</strong> / nacht',
    /* Histoire */
    'hist.aria': 'Het dorp en de vallei',
    'hist.badge': 'Ons verhaal',
    'hist.title': 'Midden in de natuur sinds 1969',
    'hist.p1':
      'Camping Les 2 Vallées ontstond uit de liefde van een familie voor de natuur. Door de decennia heen groeide de camping mee met het gebied, dat open karakter en respect voor het levende behoudend.',
    'hist.p2':
      'Nog steeds, gedragen door vele vernieuwingen op het gebied van accommodatie, is de camping een vaste halte voor wie lichaam en geest wil opladen.',
    'hist.cta': 'Ontdek het domein',
    /* Domaine (plan + texte) */
    'dom.aria': 'Plattegrond van Camping Les 2 Vallées',
    'dom.badge': 'Het domein',
    'dom.title': 'Een domein gevormd door de natuur',
    'dom.p1':
      'Tussen de valleien van de Tarn en de Dourbie spreidt het domein zijn beschaduwde staanplaatsen, chalets en Safaritenten uit over een glooiend terrein waar elke staanplaats zijn schaduw en rust bewaart.',
    'dom.p2':
      'Verwarmd zwembad, snackbar en huisgemaakte ontbijtjes, speeltuin, wasruimte en wifi: alle services van een hele jaar geopende camping, op een steenworp van de rotsen van de Roque Sainte Victoire. De plattegrond helpt u bij aankomst met oriënteren.',
    /* Moyens de paiement */
    'pay.badge': 'Betaling',
    'pay.title': 'Geaccepteerde betaalmethoden',
    'pay.lead': 'Betaal uw verblijf met een gerust hart.',
    'pay.cb': 'Betaalkaart',
    'pay.cheque': 'Bankcheque',
    'pay.vacances': 'Vakantiecheques',
    'pay.virement': 'Overschrijving',
    /* Pied de page */
    'foot.tag': 'Natuur, glamping & ontspanning in het hart van de valleien.',
    'foot.hours': 'Receptie-uren',
    'foot.nav': 'Navigatie',
    'foot.find': 'Zo vindt u ons',
    'foot.mapAria': 'Plattegrond van het domein',
    'foot.partnersAria': 'Partners',
    'foot.rights':
      '© <span id="year"></span> Camping Les 2 Vallées — Alle rechten voorbehouden.',
    'foot.legal': 'Juridische informatie',
    'foot.privacy': 'Privacybeleid',
    /* Réservation */
    'book.title': 'Kies uw data',
    'book.closeAria': 'Sluit de kalender',
    'book.datesAria': 'Verblijfsdata',
    'book.fStart': 'Aankomst',
    'book.fEnd': 'Vertrek',
    'book.typeAria': 'Type verblijf',
    'book.typeEmpl': 'Kampeerplaats',
    'book.typeMh': 'Mobil-home',
    'book.typeCh': 'Chalet',
    /* Contact */
    'contact.cta': 'Neem contact op',
    'contact.title': 'Neem contact op',
    'contact.closeAria': 'Sluit het contactformulier',
    'contact.formAria': 'Contactformulier',
    'contact.name': 'Naam',
    'contact.phName': 'Uw naam',
    'contact.email': 'E-mail',
    'contact.phEmail': 'u@voorbeeld.nl',
    'contact.phone': 'Telefoon (optioneel)',
    'contact.phPhone': '06 12 34 56 78',
    'contact.message': 'Bericht',
    'contact.phMessage': 'Uw bericht…',
    'contact.send': 'Versturen',
    'contact.success': 'Bedankt! Uw bericht is verzonden. Wij nemen snel contact met u op.',
    /* Pages légales */
    'leg.navAria': 'Paginanavigatie',
    'leg.back': 'Terug naar de site',
    'mentions.meta.title': 'Juridische informatie — Camping Les 2 Vallées',
    'mentions.meta.desc':
      'Juridische informatie over de website van Camping Les 2 Vallées (Nant, Aveyron): uitgever, hoster en intellectuele eigendom, conform de Franse wetgeving.',
    'm.h1': 'Juridische informatie',
    'm.lead':
      'Overeenkomstig artikel 6-III van de Franse wet nr. 2004-575 van 21 juni 2004 betreffende het vertrouwen in de digitale economie (LCEN), vindt u hieronder de identiteit van de verschillende bij de website betrokken partijen.',
    'm.s1': 'Uitgever van de website',
    'm.s1.name': 'Bedrijfsnaam: Camping Les 2 Vallées',
    'm.s1.form': 'Rechtsvorm: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s1.siret': 'SIRET-nummer: 499 159 820 00012',
    'm.s1.vat': 'Intra-communautair BTW-nummer: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s1.addr': 'Adres van het bedrijf: Route de l\u2019Estrade basse, 12230 Nant (Aveyron)',
    'm.s1.tel': 'Telefoon: ',
    'm.s1.mail': 'Contact-e-mailadres: ',
    'm.s1.pub': 'Verantwoordelijken voor de publicatie: Cécile en Pascal',
    'm.s2': 'Realisatie',
    'm.s2.by': 'Website gemaakt door',
    'm.s3': 'Hoster van de website',
    'm.s3.den': 'Naam: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s3.addr': 'Adres: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s3.tel': 'Telefoon: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s3.mail': 'E-mailadres technische ondersteuning: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s3.web': 'Website: <span class="placeholder">[Nog in te vullen]</span>',
    'm.s4': 'Intellectuele eigendom',
    'm.s4.p1':
      'Alle elementen van de website (teksten, merknamen, logo, huisstijl, foto\u2019s, video\u2019s en structuur) worden beschermd door het intellectuele-eigendomsrecht. Tenzij anders vermeld, behoren ze toe aan de uitgever van de website (Camping Les 2 Vallées), en elke reproductie, bewerking of exploitatie, al dan niet gedeeltelijk, zonder voorafgaande schriftelijke toestemming is verboden.',
    'm.s4.p2':
      'Sommige foto\u2019s zijn werken van derden uitgegeven onder een vrije licentie; de credits staan bij de beelden op de homepagina (onder ander de foto van het gordijn \u201eSipario\u201f of de regiobestemmingen — Wikimedia Commons). Elke afbeelding blijft onderwerp van de licentie aangegeven door de maker.',
    'm.s5': 'Toepasselijk recht',
    'm.s5.p1':
      'Deze website valt onder het Franse recht en het gebruik ervan wordt door dat recht beheerst. Bij geschillen zijn uitsluitend de Franse rechtbanken bevoegd.',
    'm.s5.p2':
      'De uitgever aanvaardt geen enkele aansprakelijkheid voor de inhoud van de websites waarnaar deze website via hyperlinks verwijst, evenmin als voor websites die ongeweten naar deze website verwijzen: de informatie op die andere websites valt onder de enige verantwoordelijkheid van hun uitgevers.',
    'm.s5.note':
      'Het kader \u201eHoster van de website\u201f (en eventueel de rechtsvorm en het BTW-nummer) moet nog worden ingevuld vóór de definitieve publicatie.',
    'privacy.meta.title': 'Privacybeleid — Camping Les 2 Vallées',
    'privacy.meta.desc':
      'Privacybeleid van Camping Les 2 Vallées: verzamelde persoonsgegevens, doeleinden, bewaartermijnen en uw rechten (GDPR/AVG).',
    'p.badge': 'Uw gegevens, helder uitgelegd',
    'p.h1': 'Privacybeleid',
    'p.lead':
      'Overeenkomstig de Algemene Verordening Gegevensbescherming (AVG, EU-verordening 2016/679) en de Franse wet Informatique et Libertés beschrijft deze pagina de gegevens die de camping verwerkt en de rechten waarover u beschikt.',
    'p.s1': 'Wie zijn wij?',
    'p.s1.p':
      'Camping Les 2 Vallées — route de l\u2019Estrade basse, 12230 Nant (Aveyron). Al onze informatie vindt u op de pagina ',
    'p.s2': 'Gebruik van de verzamelde persoonsgegevens',
    'p.s2.p':
      'We verzamelen niet automatisch en genereren geen gegevens over u. De enige persoonsgegevens die wij verwerken zijn die welke u er zelf voor kiest aan ons te verstrekken:',
    'p.s2.l1':
      'bij een contactname (formulier, telefoon, e-mail): naam en voornaam, e-mailadres en/of telefoonnummer, en de informatie van uw bericht (gewenste verblijfsdata, aantal personen, type accommodatie);',
    'p.s2.l2a': 'bij een boeking, rechtstreeks ingevoerd op het boekingsplatform ',
    'p.s2.l2b':
      ', dat zelf de gegevens van het verblijf en de betaling verwerkt: haar eigen privacybeleid is dan van toepassing, de camping is geen ontvanger van de betaalgegevens.',
    'p.s2.f': 'Doeleinden en wettelijke grondslagen',
    'p.s2.l21':
      'Antwoorden op uw vragen om informatie en beschikbaarheid — wettelijke grondslag: gerechtvaardigd belang (beheren van de relatie met de klanten).',
    'p.s2.l22':
      'Beheren van de afgesloten boekingen (opvolging van het verblijf, reglementair verslag) — wettelijke grondslag: uitvoering van de overeenkomst.',
    'p.s2.l23': 'Publiceren van uw foto\u2019s als u ons daartoe toestemming heeft gegeven',
    'p.s2.l23b': ' — wettelijke grondslag: toestemming, op elk moment in te trekken.',
    'p.s2.p2':
      'Er worden geen enkele persoonsgegevens verkocht, verhuurd of met derden geruild voor commerciële doeleinden.',
    'p.s3': 'Contactformulieren',
    'p.s3.p':
      'De informatie die u er zelf voor kiest om ons via een formulier mee te delen, wordt ons per e-mail doorgestuurd en wordt nergens anders bewaard dan op onze e-maildienst. Ze wordt uitsluitend gebruikt om uw vraag te beantwoorden. Mocht bepaalde informatie bruikbaar zijn voor commerciële doeleinden, dan zou een vermelding dit aan het einde van het formulier aangeven: wij vragen altijd uw toestemming wanneer een gegevensverzameling via een formulier gebeurt.',
    'p.s4': 'Gebruik van cookies',
    'p.s4.q': 'Wat is een cookie?',
    'p.s4.qp':
      'Een cookie is een klein gegevensbestand dat naar uw apparaat wordt overgedragen en daar wordt opgeslagen. Het kan bijvoorbeeld uw browser of taal herkennen, of uw voorkeuren bewaren. Meer informatie op ',
    'p.s4.o': 'Onze cookies',
    'p.s4.op1':
      'Deze site plaatst geen enkele cookie: geen analyse-cookie, geen ingebedde inhoud (video\u2019s, artikelen, afbeeldingen van andere sites), geen sociale plugin, geen advertentie-tracer. De enige blootstelling aan cookies gebeurt wanneer u klikt op de link ',
    'p.s4.op2': ', die u naar het boekingsplatform brengt ',
    'p.s4.op3': ': eenmaal op zijn site is het zijn eigen privacybeleid dat geldt ',
    'p.s4.op4': '.',
    'p.s5': 'Statistieken en publieksmeting',
    'p.s5.p':
      'Deze site gebruikt geen Google Analytics of een ander tool voor publieksmeting: er worden geen statistieken over uw navigatie verzameld.',
    'p.s6': 'Bewaartermijnen van uw gegevens',
    'p.s6.l1': 'Aanvragen zonder gevolg: ',
    'p.s6.l2': 'Documenten gelinkt aan boekingen en verblijven: ',
    'p.s7': 'De rechten die u heeft op uw gegevens',
    'p.s7.l1': 'inzage: een kopie van uw gegevens ontvangen,',
    'p.s7.l2': 'rectificatie: een informatie laten corrigeren,',
    'p.s7.l3': 'wissen: de verwijdering vragen,',
    'p.s7.l4': 'beperking en verzet: een verwerking opschorten of tracer weigeren,',
    'p.s7.l5': 'overdraagbaarheid: uw gegevens in een gestructureerd formaat ontvangen,',
    'p.s7.l6': 'intrekking van de toestemming, op elk moment en zonder verantwoording.',
    'p.s7.p2a': 'U kunt deze rechten uitoefenen per e-mail naar ',
    'p.s7.p2b':
      ' of per post naar het adres van de uitgever (zie de juridische informatie). Wij kunnen u vragen uw identiteit te verifiëren vóórdat we maatregelen nemen met betrekking tot uw vraag, en wij antwoorden binnen een maand. Als u meent dat uw rechten worden geschonden, kunt u een klacht indienen bij de CNIL (',
    'p.s7.p2c': ').',
    'p.s8': 'Doorgifte van uw persoonsgegevens',
    'p.s8.p':
      'De persoonsgegevens die wij verwerken worden niet doorverkocht. Ze zijn bestemd voor het personeel van de camping en, naargelang het geval, voor zijn technische dienstverleners: de hoster van de website (zie de juridische informatie) en het hierboven genoemde boekingsplatform. Alle persoonsgegevens die wij verwerken worden verwerkt in het hart van de Europese Unie ',
    'p.s9': 'Hoe wij uw gegevens beschermen',
    'p.s9.p':
      'Wij zetten de beveiliging van de site permanent op en actualiseren deze om uw informatie te beschermen tegen ongeautoriseerde toegang, verlies, vernietiging of niet-toegestane wijziging. De site wordt geleverd in HTTPS en de toegang is beperkt tot de enige bevoegde personen. Aangezien het internet geen 100% veilige omgeving is, kunnen wij de beveiliging van de overdracht of opslag van uw informatie niet volledig garanderen.',
    'p.s10': 'Contactinformatie',
    'p.s10.p1': 'Voor elke vraag over uw persoonsgegevens kunt u ons contacteren op ',
    'p.s10.p2': '; de andere contactinformatie staat in onze ',
    'p.s10.note': 'Laatste update: ',
    'p.s2.ph': '[Nog in te vullen]',
    'p.s2.ph2': '[Nog in te vullen indien van toepassing]',
    'p.s2.ph3': '[Nog in te vullen — link van het platform]',
    'p.s2.ph4': '[Nog in te vullen — bijv. 3 jaar na het laatste contact]',
    'p.s2.ph5': '[Nog in te vullen — bijv. 3 jaar, of de wettelijke boekhoudtermijn]',
    'p.s2.ph6': '[te bevestigen met de hoster]',
    'p.s2.ph7': '[Nog in te vullen — datum]',
    'p.s4.cta': '“Boek uw verblijf”'
  };

  /* ------------------------------------------------------------
     Moteur
     ------------------------------------------------------------ */
  var cur = 'fr';
  try {
    var saved = localStorage.getItem(KEY);
    if (LANGS.indexOf(saved) !== -1) cur = saved;
  } catch (e) { /* stockage indisponible : on reste en FR */ }

  /* t(cle) : traduction de la langue courante, repli FR, '' final */
  function t(key) {
    if (MSG[cur] && typeof MSG[cur][key] === 'string') return MSG[cur][key];
    if (MSG.fr && typeof MSG.fr[key] === 'string') return MSG.fr[key];
    return '';
  }

  function page() {
    return document.body.getAttribute('data-i18n-page') || '';
  }

  function apply(lang) {
    if (LANGS.indexOf(lang) === -1) lang = 'fr';
    var dict = MSG[lang] || {};
    var root = document.documentElement;
    root.setAttribute('lang', lang === 'en' ? 'en' : lang);

    /* --- Contenus (data-i18n) --- */
    var els = document.querySelectorAll('[data-i18n]');
    for (var i = 0; i < els.length; i++) {
      var el = els[i];
      var k = el.getAttribute('data-i18n');
      if (lang === 'fr' && el.__l2vFr === undefined) {
        /* FR initial : le DOM est déjà celui de la langue par défaut —
           aucune mutation (réécrire innerHTML identique repousserait le
           LCP du hero en relançant son candidat de peinture). */
        continue;
      }
      if (lang === 'fr') {
        /* Retour au FR après une bascule : restituer l'instantané pris
           avant la première modification (contenu d'origine du DOM). */
        el.innerHTML = el.__l2vFr;
        continue;
      }
      /* Instantané FR de départs : créé juste avant la première bascule. */
      if (el.__l2vFr === undefined) el.__l2vFr = el.innerHTML;
      var v = dict[k];
      if (typeof v !== 'string') continue; /* clé absente : conservé tel quel */
      if (HTML_KEYS.indexOf(k) !== -1) {
        /* Les rares clés riches : le HTML fait partie de la traduction. */
        el.innerHTML = v;
      } else {
        /* Texte pur : textContent (aucune injection de balise possible). */
        el.textContent = v;
      }
    }

    /* --- Attributs (data-i18n-attr="attr:cle,attr:cle") --- */
    var aels = document.querySelectorAll('[data-i18n-attr]');
    for (i = 0; i < aels.length; i++) {
      var el2 = aels[i];
      var specs = (el2.getAttribute('data-i18n-attr') || '').split(',');
      if (el2.__l2vAttr === undefined) el2.__l2vAttr = {};
      for (var j = 0; j < specs.length; j++) {
        var pair = specs[j].split(':');
        var attr = (pair[0] || '').trim();
        var key = (pair[1] || '').trim();
        if (!attr || !key) continue;
        if (!(attr in el2.__l2vAttr)) el2.__l2vAttr[attr] = el2.getAttribute(attr);
        if (lang === 'fr') {
          var old = el2.__l2vAttr[attr];
          if (typeof old === 'string') el2.setAttribute(attr, old);
          continue;
        }
        if (typeof dict[key] === 'string') el2.setAttribute(attr, dict[key]);
      }
    }

    /* --- <title> et meta description (clé dépendante de la page) --- */
    var p = page();
    if (p) {
      var tit = dict[p + '.meta.title'];
      if (typeof tit === 'string') document.title = tit;
      var md = document.querySelector('meta[name="description"]');
      var desc = dict[p + '.meta.desc'];
      if (md && typeof desc === 'string') {
        if (md.__l2vFr === undefined) md.__l2vFr = md.getAttribute('content');
        md.setAttribute('content', lang === 'fr' ? md.__l2vFr : desc);
      }
    }

    /* --- Bouton + options du menu --- */
    var btn = document.querySelector('.lang__btn');
    if (btn) {
      btn.classList.remove('lang__btn--fr', 'lang__btn--en', 'lang__btn--nl');
      btn.classList.add('lang__btn--' + lang);
      /* La pastille annonce la langue courante : « Changer de langue —
         Français ». Composé après la boucle data-i18n-attr (qui a remis
         header.langAria sur les deux attributs) pour ne pas être écrasé.
         FR inclus : la valeur FR du libellé de base vit dans le HTML, pas
         dans le dictionnaire → clé dédiée js.langChange. On ne touche pas
         à btn.__l2vAttr : il garde l'état d'origine du HTML. */
      var curLabel = t('js.langChange');
      var curName = t('js.langCurrent');
      if (curLabel && curName) {
        var curFull = curLabel + ' — ' + curName;
        btn.setAttribute('aria-label', curFull);
        btn.setAttribute('title', curFull);
      }
    }
    var opts = document.querySelectorAll('.lang__opt');
    for (var q = 0; q < opts.length; q++) {
      var opt = opts[q];
      if (opt.getAttribute('data-lang') === lang) opt.setAttribute('aria-pressed', 'true');
      else opt.removeAttribute('aria-pressed');
    }

    cur = lang;
    try { localStorage.setItem(KEY, lang); } catch (e) { /* rien */ }
  }
  apply(cur);

  /* PAS de diffusion « langchange » au chargement : le script principal court
     APRÈS ce fichier (defer) et mesure une géométrie déjà bonne. Seuls les
     changements utilisateur sont diffusés — listeners alors en place. */

  /* ------------------------------------------------------------
     Public : le script principal lit lang / locale / weekdays / t()
     ------------------------------------------------------------ */
  window.L2V = {
    get lang() { return cur; },
    locale: { fr: 'fr-FR', en: 'en-GB', nl: 'nl-NL' },
    weekdays: {
      fr: ['lun', 'mar', 'mer', 'jeu', 'ven', 'sam', 'dim'],
      en: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      nl: ['ma', 'di', 'wo', 'do', 'vr', 'za', 'zo']
    },
    t: t
  };

  /* ------------------------------------------------------------
     Le bouton drapeau + son menu déroulant
     ------------------------------------------------------------ */
  function initSwitch() {
    var wrap = document.getElementById('langSwitch');
    if (!wrap) return;
    var btn = wrap.querySelector('.lang__btn');
    var menu = wrap.querySelector('.lang__menu');
    if (!btn || !menu) return;

    function isOpen() { return !menu.hidden; }

    /* Ouvrir le sélecteur referme le panneau du burger : un seul menu
       blanc à la fois sur le bandeau. */
    function slamNav() {
      var header = document.getElementById('header');
      if (header && header.classList.contains('is-nav-open')) {
        header.classList.remove('is-nav-open');
        var b = header.querySelector('.header__burger');
        if (b) b.setAttribute('aria-expanded', 'false');
      }
    }

    function open() {
      slamNav();
      menu.hidden = false;
      wrap.classList.add('is-open');
      btn.setAttribute('aria-expanded', 'true');
    }
    function close() {
      menu.hidden = true;
      wrap.classList.remove('is-open');
      btn.setAttribute('aria-expanded', 'false');
    }

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      if (isOpen()) close(); else open();
    });

    /* Choix d'une langue → applique, diffuse, referme. */
    wrap.addEventListener('click', function (e) {
      var opt = e.target.closest ? e.target.closest('.lang__opt') : null;
      if (!opt) return;
      var lang = opt.getAttribute('data-lang');
      if (!lang || lang === cur) { close(); return; }
      apply(lang);
      document.dispatchEvent(new CustomEvent('langchange', { detail: { lang: cur } }));
      close();
      btn.focus();
    });

    /* Fermetures : clic extérieur, Échap (focus rendu au bouton),
       et ouverture du burger (le burger referme le sélecteur). */
    document.addEventListener('click', function (e) {
      if (isOpen() && !wrap.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen()) { close(); btn.focus(); }
    });
    var burger = document.querySelector('.header__burger');
    if (burger) burger.addEventListener('click', close);
  }
  initSwitch();
})();
