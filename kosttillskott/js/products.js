/* Sortiment. Näringsrader: [nyckel i RI-tabellen | etikett, mängd, enhet?, visningsnamn?].
   %RI räknas ut automatiskt från referensintagen (förordning (EU) nr 1169/2011, bilaga XIII). */
(function () {
  const RI = {
    a: { name: "Vitamin A", unit: "µg", ri: 800 },
    d: { name: "Vitamin D", unit: "µg", ri: 5 },
    e: { name: "Vitamin E", unit: "mg", ri: 12 },
    k: { name: "Vitamin K", unit: "µg", ri: 75 },
    c: { name: "Vitamin C", unit: "mg", ri: 80 },
    b1: { name: "Tiamin (B1)", unit: "mg", ri: 1.1 },
    b2: { name: "Riboflavin (B2)", unit: "mg", ri: 1.4 },
    b3: { name: "Niacin (B3)", unit: "mg", ri: 16 },
    b5: { name: "Pantotensyra (B5)", unit: "mg", ri: 6 },
    b6: { name: "Vitamin B6", unit: "mg", ri: 1.4 },
    b7: { name: "Biotin", unit: "µg", ri: 50 },
    b9: { name: "Folsyra", unit: "µg", ri: 200 },
    b12: { name: "Vitamin B12", unit: "µg", ri: 2.5 },
    ca: { name: "Kalcium", unit: "mg", ri: 800 },
    mg: { name: "Magnesium", unit: "mg", ri: 375 },
    fe: { name: "Järn", unit: "mg", ri: 14 },
    zn: { name: "Zink", unit: "mg", ri: 10 },
    se: { name: "Selen", unit: "µg", ri: 55 },
    i: { name: "Jod", unit: "µg", ri: 150 },
    cu: { name: "Koppar", unit: "mg", ri: 1 },
    mn: { name: "Mangan", unit: "mg", ri: 2 },
    cr: { name: "Krom", unit: "µg", ri: 40 },
    kal: { name: "Kalium", unit: "mg", ri: 2000 }
  };

  const categories = [
    { id: "vitaminer", name: "Vitaminer", color: "#f2b33d", desc: "Enskilda vitaminer och multivitaminer. Just nu 3 för 2 på hela kategorin." },
    { id: "mineraler", name: "Mineraler", color: "#7e93ae", desc: "Magnesium, zink, järn, kalcium och andra mineraler i former som kroppen tar upp väl." },
    { id: "omega-3", name: "Omega-3", color: "#2f80b8", desc: "Fiskolja, krillolja och vegansk algolja med tydligt angiven mängd EPA och DHA." },
    { id: "protein", name: "Protein", color: "#8b5e3c", desc: "Vassle, isolat, kasein, växtprotein och bars – med jämförpris per kilo." },
    { id: "traning", name: "Träning", color: "#c7343f", desc: "Kreatin, pre-workout, aminosyror och sportdryck för styrka och uthållighet." },
    { id: "somn-stress", name: "Sömn & avslappning", color: "#5d5fae", desc: "Kvällsrutiner med magnesium, L-teanin och örter." },
    { id: "mage-tarm", name: "Mage & tarm", color: "#7faa6e", desc: "Mjölksyrabakterier, fibrer och matsmältningsenzymer." },
    { id: "hud-har", name: "Hud, hår & naglar", color: "#d8899e", desc: "Kollagen, biotin och hyaluronsyra – inifrån och ut." },
    { id: "leder", name: "Leder & rörlighet", color: "#3a9a96", desc: "Kollagen typ II, gurkmeja och näringsämnen för brosk och skelett." },
    { id: "superfoods", name: "Superfoods & örter", color: "#4f9a3a", desc: "Spirulina, gröna pulver, Q10 och växtextrakt." },
    { id: "barn", name: "Barn & familj", color: "#f07f5b", desc: "Droppar, tuggtabletter och omega-3 anpassade för barn." },
    { id: "paket", name: "Paket & kurer", color: "#1c4a3e", desc: "Färdiga kombinationer till ett lägre pris än styckvis." }
  ];

  const goals = [
    { id: "immunforsvar", name: "Immunförsvar", color: "#f2b33d" },
    { id: "energi", name: "Energi & ork", color: "#e8893a" },
    { id: "somn", name: "Sömn & återhämtning", color: "#5d5fae" },
    { id: "muskler", name: "Muskler & styrka", color: "#c7343f" },
    { id: "uthallighet", name: "Uthållighet", color: "#2f80b8" },
    { id: "hjarta-hjarna", name: "Hjärta & hjärna", color: "#b9303b" },
    { id: "skonhet", name: "Hud, hår & naglar", color: "#d8899e" },
    { id: "mage", name: "Mage & matsmältning", color: "#7faa6e" },
    { id: "leder", name: "Leder & skelett", color: "#3a9a96" },
    { id: "vikt", name: "Viktkontroll", color: "#4f9a3a" },
    { id: "kvinna", name: "Kvinnohälsa", color: "#c0548a" }
  ];

  const brands = [
    { id: "norrvital", name: "Norrvital", desc: "Basvitaminer och mineraler tillverkade i Sverige sedan 1998." },
    { id: "polarlin", name: "Polarlin", desc: "Omega-3 från småfisk och krill, oxidationstestad batch för batch." },
    { id: "styrka", name: "Styrka Sport", desc: "Dopingtestade sporttillskott för styrka och uthållighet." },
    { id: "vildgron", name: "Vildgrön", desc: "Växtbaserat och ekologiskt – veganskt i hela sortimentet." },
    { id: "karna", name: "Kärna Lab", desc: "Specialformuleringar med väldokumenterade råvaruformer." }
  ];

  const diets = [
    { id: "vegan", name: "Vegansk" },
    { id: "glutenfri", name: "Glutenfri" },
    { id: "laktosfri", name: "Laktosfri" },
    { id: "sockerfri", name: "Sockerfri" },
    { id: "eko", name: "Ekologisk" },
    { id: "svensk", name: "Svensktillverkad" },
    { id: "dopingtestad", name: "Dopingtestad" }
  ];

  const forms = {
    kapslar: { name: "Kapslar", shape: "bottle", unit: "kapsel" },
    tabletter: { name: "Tabletter", shape: "bottle", unit: "tablett" },
    sugtabletter: { name: "Sugtabletter", shape: "bottle", unit: "sugtablett" },
    tuggtabletter: { name: "Tuggtabletter", shape: "bottle", unit: "tuggtablett" },
    gummies: { name: "Gummies", shape: "bottle", unit: "gummy" },
    pulver: { name: "Pulver", shape: "tub", unit: "g" },
    flytande: { name: "Flytande", shape: "liquid", unit: "ml" },
    droppar: { name: "Droppar & spray", shape: "dropper", unit: "ml" },
    brus: { name: "Brustabletter", shape: "tube", unit: "brustablett" },
    bar: { name: "Bars", shape: "bar", unit: "bar" },
    paket: { name: "Paket", shape: "bundle", unit: "paket" }
  };

  const C = {
    d: ["D-vitamin bidrar till att immunsystemet fungerar normalt.", "D-vitamin bidrar till att bibehålla normal benstomme.", "D-vitamin bidrar till att bibehålla normal muskelfunktion."],
    c: ["C-vitamin bidrar till att immunsystemet fungerar normalt.", "C-vitamin bidrar till att minska trötthet och utmattning.", "C-vitamin ökar järnupptaget."],
    cSkin: "C-vitamin bidrar till normal kollagenbildning för normal funktion hos huden.",
    cCart: "C-vitamin bidrar till normal kollagenbildning för normal funktion hos brosket.",
    b12: ["Vitamin B12 bidrar till normal bildning av röda blodkroppar.", "Vitamin B12 bidrar till att minska trötthet och utmattning.", "Vitamin B12 bidrar till nervsystemets normala funktion."],
    mg: ["Magnesium bidrar till att minska trötthet och utmattning.", "Magnesium bidrar till musklernas normala funktion.", "Magnesium bidrar till nervsystemets normala funktion.", "Magnesium bidrar till normal psykologisk funktion."],
    zn: ["Zink bidrar till att immunsystemet fungerar normalt.", "Zink bidrar till att bibehålla normalt hår, naglar och hud."],
    fe: ["Järn bidrar till normal bildning av röda blodkroppar och hemoglobin.", "Järn bidrar till att minska trötthet och utmattning.", "Järn bidrar till normal kognitiv funktion."],
    se: ["Selen bidrar till att immunsystemet fungerar normalt.", "Selen bidrar till att bibehålla normalt hår och normala naglar.", "Selen bidrar till att skydda cellerna mot oxidativ stress."],
    epa: "EPA och DHA bidrar till hjärtats normala funktion. Den gynnsamma effekten uppnås vid ett dagligt intag av 250 mg EPA och DHA.",
    dha: "DHA bidrar till att bibehålla normal hjärnfunktion och normal syn. Den gynnsamma effekten uppnås vid ett dagligt intag av 250 mg DHA.",
    protein: ["Protein bidrar till ökning av muskelmassan.", "Protein bidrar till att bibehålla muskelmassan.", "Protein bidrar till att bibehålla normal benstomme."],
    kreatin: "Kreatin ökar den fysiska prestationsförmågan vid upprepade, kortvariga och högintensiva träningspass. Den gynnsamma effekten uppnås vid ett dagligt intag av 3 g kreatin.",
    b6psy: "Vitamin B6 bidrar till normal psykologisk funktion.",
    b6horm: "Vitamin B6 bidrar till att reglera hormonell aktivitet.",
    folat: "Folat bidrar till tillväxt av moderns vävnader under graviditeten.",
    biotin: ["Biotin bidrar till att bibehålla normalt hår.", "Biotin bidrar till att bibehålla normal hud."],
    jod: ["Jod bidrar till normal produktion av sköldkörtelhormoner och normal sköldkörtelfunktion.", "Jod bidrar till normal energiomsättning."],
    ca: "Kalcium behövs för att bibehålla normal benstomme.",
    k: "Vitamin K bidrar till att bibehålla normal benstomme.",
    kal: "Kalium bidrar till musklernas normala funktion.",
    cho: ["Kolhydrat-elektrolytlösningar bidrar till att bibehålla uthållighetsprestationen vid långvarig uthållighetsträning.", "Kolhydrat-elektrolytlösningar förbättrar vattenupptaget vid fysisk träning."],
    beta: "Betaglukaner från havre bidrar till att bibehålla normala kolesterolnivåer i blodet. Den gynnsamma effekten uppnås vid ett dagligt intag av 3 g betaglukaner från havre.",
    meal: "Att ersätta två av dagens huvudmåltider med en måltidsersättning som en del av en energisnål kost bidrar till viktminskning.",
    mn: "Mangan bidrar till normal bindvävsbildning.",
    kidsD: "D-vitamin behövs för normal tillväxt och utveckling av skelettet hos barn.",
    energy: "Bidrar till normal energiomsättning (tiamin, riboflavin, niacin, B6, B12, biotin, pantotensyra)."
  };

  const W = {
    iron: "Innehåller järn. Förvaras oåtkomligt för barn – järn kan vara skadligt för små barn.",
    caffeine: (mg) => `Hög koffeinhalt (${mg} mg per portion). Rekommenderas inte för barn eller gravida eller ammande kvinnor.`,
    fish: "Innehåller fisk.",
    shellfish: "Innehåller kräftdjur (krill).",
    milk: "Innehåller mjölk.",
    nuts: "Kan innehålla spår av jordnötter och nötter.",
    pregnant: "Gravida och ammande bör rådgöra med barnmorska eller läkare före användning.",
    meds: "Rådgör med läkare om du tar läkemedel.",
    kids: "Ej lämplig för barn under 3 år. Ska ges under uppsikt av vuxen."
  };

  const P = [];
  const add = (p) => P.push(p);

  /* ---------- Vitaminer ---------- */
  add({
    id: "p01", slug: "d3-vitamin-2000-ie", name: "D3-vitamin 2000 IE", brand: "norrvital", cat: "vitaminer",
    goals: ["immunforsvar", "leder", "muskler"], form: "kapslar", label: "D3", sub: "2000 IE", dose: "1 kapsel",
    diets: ["glutenfri", "laktosfri", "svensk"], badges: ["bastsaljare"], campaign: "3for2", rating: 4.8, reviews: 1243, sold: 9800, stock: 240, added: "2025-11-02",
    variants: [{ id: "90", label: "90 kapslar", price: 99, servings: 90, count: 90 }, { id: "180", label: "180 kapslar", price: 169, servings: 180, count: 180 }],
    short: "Högdoserad D3 löst i olivolja – en kapsel om dagen under den mörka halvan av året.",
    desc: "Från oktober till mars står solen för lågt i Sverige för att huden ska bilda D-vitamin. Kapslarna innehåller kolekalciferol (D3) löst i extra jungfru olivolja, eftersom D-vitamin är fettlösligt och tas upp bäst tillsammans med fett.",
    claims: C.d, keywords: "solvitamin vitamin d d-vitamin vinter",
    ingredients: "Extra jungfru olivolja, kapselhölje (gelatin från nötkreatur, fuktighetsbevarande medel: glycerol), kolekalciferol (vitamin D3).",
    nutrition: { per: "1 kapsel", rows: [["d", 50, null, "Vitamin D3 (2000 IE)"]] },
    usage: "1 kapsel per dag i samband med måltid.", warn: ""
  });
  add({
    id: "p02", slug: "vegansk-d3-k2", name: "Vegansk D3 + K2", brand: "vildgron", cat: "vitaminer",
    goals: ["immunforsvar", "leder"], form: "kapslar", label: "D3+K2", sub: "Vegansk", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], campaign: "3for2", rating: 4.7, reviews: 418, sold: 3100, stock: 96, added: "2026-02-14",
    variants: [{ id: "60", label: "60 kapslar", price: 149, servings: 60, count: 60 }],
    short: "D3 från lav och K2 som MK-7 i en vegansk kapsel med kokosolja.",
    desc: "Det mesta D3 i handeln kommer från lanolin (ullfett). Här kommer D3 från lav, vilket gör produkten helt vegansk. K2 i formen MK-7 har lång halveringstid i blodet.",
    claims: [C.d[0], C.d[1], C.k], keywords: "lav mk-7 menakinon vitamin k",
    ingredients: "Kokosolja (MCT), kapselhölje (hydroxipropylmetylcellulosa), kolekalciferol från lav (D3), menakinon-7 (K2).",
    nutrition: { per: "1 kapsel", rows: [["d", 25, null, "Vitamin D3 (1000 IE)"], ["k", 75, null, "Vitamin K2 (MK-7)"]] },
    usage: "1 kapsel per dag i samband med måltid.", warn: "Personer som behandlas med blodförtunnande läkemedel (t.ex. warfarin) ska rådgöra med läkare före användning."
  });
  add({
    id: "p03", slug: "c-vitamin-1000-mg-depot", name: "C-vitamin 1000 mg Depot", brand: "norrvital", cat: "vitaminer",
    goals: ["immunforsvar", "energi", "skonhet"], form: "tabletter", label: "C 1000", sub: "Depot", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "svensk"], badges: [], campaign: "3for2", rating: 4.6, reviews: 702, sold: 5200, stock: 180, added: "2025-08-20",
    variants: [{ id: "100", label: "100 tabletter", price: 119, was: 139, servings: 100, count: 100 }],
    short: "Långtidsverkande tablett som frisätter C-vitaminet under flera timmar.",
    desc: "Depottabletten frisätter askorbinsyra gradvis i stället för på en gång. Tabletten har brytskåra och kan delas om du vill ta en halv dos morgon och kväll.",
    claims: [...C.c, C.cSkin], keywords: "askorbinsyra förkylning vitamin c",
    ingredients: "L-askorbinsyra, fyllnadsmedel (mikrokristallin cellulosa), hydroxipropylmetylcellulosa, klumpförhindrande medel (magnesiumsalter av fettsyror, kiseldioxid).",
    nutrition: { per: "1 tablett", rows: [["c", 1000]] },
    usage: "1 tablett per dag med vatten.", warn: ""
  });
  add({
    id: "p04", slug: "b12-metylkobalamin-1000", name: "B12 Metylkobalamin 1000 µg", brand: "norrvital", cat: "vitaminer",
    goals: ["energi", "hjarta-hjarna"], form: "sugtabletter", label: "B12", sub: "1000 µg", dose: "1 sugtablett",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "svensk"], badges: ["bastsaljare"], campaign: "3for2", rating: 4.8, reviews: 655, sold: 4700, stock: 210, added: "2025-06-11",
    variants: [{ id: "90", label: "90 sugtabletter", price: 109, servings: 90, count: 90 }],
    short: "Aktiv form av B12 som sugtablett med smak av mint – ett måste för dig som äter veganskt.",
    desc: "B12 finns naturligt nästan bara i animaliska livsmedel, så den som äter veganskt behöver ett tillskott. Sugtabletten löses långsamt i munnen och innehåller metylkobalamin, en av vitaminets aktiva former.",
    claims: C.b12, keywords: "kobalamin vegan vegetarian trött",
    ingredients: "Sötningsmedel (xylitol), fyllnadsmedel (mikrokristallin cellulosa), arom (mint), klumpförhindrande medel (magnesiumsalter av fettsyror), metylkobalamin.",
    nutrition: { per: "1 sugtablett", rows: [["b12", 1000]] },
    usage: "Låt 1 sugtablett smälta i munnen en gång per dag.", warn: "Överdriven konsumtion kan ha laxerande effekt."
  });
  add({
    id: "p05", slug: "b-komplex-aktiv", name: "B-komplex Aktiv", brand: "karna", cat: "vitaminer",
    goals: ["energi", "hjarta-hjarna"], form: "kapslar", label: "B-KOMPLEX", sub: "Aktiva former", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], campaign: "3for2", rating: 4.5, reviews: 287, sold: 1900, stock: 75, added: "2025-10-01",
    variants: [{ id: "60", label: "60 kapslar", price: 159, servings: 60, count: 60 }],
    short: "Alla åtta B-vitaminer i aktiva former, bland annat metylfolat och P-5-P.",
    desc: "B-vitaminerna samarbetar i kroppens energiomsättning. Formuleringen använder metylfolat i stället för folsyra och pyridoxal-5-fosfat som B6, former som kroppen inte behöver omvandla.",
    claims: [C.energy, C.b12[1], C.b6psy], keywords: "b1 b2 b3 b5 b6 b7 b9 b12 folat stress",
    ingredients: "Kapselhölje (hydroxipropylmetylcellulosa), nikotinamid, kalcium-D-pantotenat, tiaminhydroklorid, riboflavin-5-fosfat, pyridoxal-5-fosfat, kalcium-L-metylfolat, D-biotin, metylkobalamin, risextrakt.",
    nutrition: { per: "1 kapsel", rows: [["b1", 11], ["b2", 14], ["b3", 32], ["b5", 18], ["b6", 7], ["b7", 150], ["b9", 400, null, "Folat (metylfolat)"], ["b12", 50]] },
    usage: "1 kapsel per dag i samband med frukost.", warn: "Urinen kan få en intensivt gul färg av riboflavin. Det är ofarligt."
  });
  add({
    id: "p06", slug: "multivitamin-dag", name: "Multivitamin Dag", brand: "norrvital", cat: "vitaminer",
    goals: ["immunforsvar", "energi"], form: "tabletter", label: "MULTI", sub: "22 vitaminer & mineraler", dose: "1 tablett",
    diets: ["glutenfri", "laktosfri", "svensk"], badges: ["bastsaljare"], campaign: "3for2", rating: 4.7, reviews: 1580, sold: 8900, stock: 320, added: "2025-03-01",
    variants: [{ id: "100", label: "100 tabletter", price: 149, servings: 100, count: 100 }, { id: "200", label: "200 tabletter", price: 259, servings: 200, count: 200 }],
    short: "Bred bas med 22 vitaminer och mineraler – 100 % av referensintaget för de flesta.",
    desc: "En enkel försäkring när kosten inte alltid räcker till. Doserna ligger nära referensintaget i stället för att vara megadoser, och D-vitaminet är förhöjt till 10 µg för svenska förhållanden.",
    claims: [C.d[0], C.c[1], C.zn[0], C.energy], keywords: "multi allround vitaminer mineraler bas",
    ingredients: "Kalciumkarbonat, magnesiumoxid, L-askorbinsyra, fyllnadsmedel (mikrokristallin cellulosa), järnfumarat, zinkoxid, DL-alfa-tokoferylacetat, nikotinamid, mangansulfat, kalcium-D-pantotenat, kopparglukonat, retinylacetat, pyridoxinhydroklorid, riboflavin, tiaminmononitrat, kromklorid, pteroylmonoglutaminsyra, kaliumjodid, natriumselenit, fyllokinon, D-biotin, kolekalciferol, cyanokobalamin.",
    nutrition: { per: "1 tablett", rows: [["a", 800], ["d", 10], ["e", 12], ["k", 75], ["c", 80], ["b1", 1.1], ["b2", 1.4], ["b3", 16], ["b6", 1.4], ["b9", 200], ["b12", 2.5], ["b7", 50], ["b5", 6], ["ca", 120], ["mg", 56], ["fe", 7], ["zn", 10], ["cu", 1], ["mn", 2], ["se", 55], ["cr", 40], ["i", 150]] },
    usage: "1 tablett per dag i samband med frukost.", warn: W.iron
  });
  add({
    id: "p07", slug: "multi-kvinna", name: "Multi Kvinna", brand: "karna", cat: "vitaminer",
    goals: ["kvinna", "energi", "immunforsvar"], form: "tabletter", label: "MULTI ♀", sub: "Järn & folat", dose: "1 tablett",
    diets: ["glutenfri", "laktosfri"], badges: [], campaign: "3for2", rating: 4.6, reviews: 394, sold: 2600, stock: 88, added: "2025-09-15",
    variants: [{ id: "60", label: "60 tabletter", price: 179, servings: 60, count: 60 }],
    short: "Multivitamin med extra järn, folat och B6 – anpassad efter kvinnors behov.",
    desc: "Kvinnor i fertil ålder har högre behov av järn och folat. Tabletten innehåller skonsamt järnbisglycinat, metylfolat och vitamin B6, som bidrar till att reglera hormonell aktivitet.",
    claims: [C.fe[1], C.folat, C.b6horm, C.d[0]], keywords: "kvinna järn folat graviditet mens",
    ingredients: "Fyllnadsmedel (mikrokristallin cellulosa), magnesiumoxid, L-askorbinsyra, järnbisglycinat, zinkcitrat, pyridoxinhydroklorid, kalcium-L-metylfolat, kaliumjodid, L-selenometionin, D-biotin, kolekalciferol, metylkobalamin.",
    nutrition: { per: "1 tablett", rows: [["d", 20], ["c", 80], ["b6", 2.8], ["b9", 400, null, "Folat (metylfolat)"], ["b12", 5], ["b7", 50], ["mg", 100], ["fe", 14], ["zn", 10], ["se", 55], ["i", 150]] },
    usage: "1 tablett per dag i samband med måltid.", warn: W.iron
  });
  add({
    id: "p08", slug: "multi-man", name: "Multi Man", brand: "karna", cat: "vitaminer",
    goals: ["energi", "muskler", "immunforsvar"], form: "tabletter", label: "MULTI ♂", sub: "Zink & selen", dose: "1 tablett",
    diets: ["glutenfri", "laktosfri"], badges: [], campaign: "3for2", rating: 4.5, reviews: 251, sold: 1700, stock: 64, added: "2025-09-15",
    variants: [{ id: "60", label: "60 tabletter", price: 179, servings: 60, count: 60 }],
    short: "Järnfri multivitamin med extra zink, selen och magnesium.",
    desc: "Män får i regel i sig tillräckligt med järn via kosten, så formuleringen är järnfri. Extra zink och selen kompletterar en vanlig blandkost.",
    claims: ["Zink bidrar till att bibehålla normala testosteronnivåer i blodet.", C.se[0], C.mg[0]], keywords: "man järnfri zink selen",
    ingredients: "Fyllnadsmedel (mikrokristallin cellulosa), magnesiumoxid, L-askorbinsyra, zinkcitrat, pyridoxinhydroklorid, kromklorid, pteroylmonoglutaminsyra, L-selenometionin, kolekalciferol, metylkobalamin.",
    nutrition: { per: "1 tablett", rows: [["d", 20], ["c", 120], ["b6", 1.4], ["b9", 200], ["b12", 5], ["mg", 150], ["zn", 15], ["se", 100], ["cr", 40]] },
    usage: "1 tablett per dag i samband med måltid.", warn: ""
  });
  add({
    id: "p09", slug: "folsyra-400", name: "Folsyra 400 µg", brand: "norrvital", cat: "vitaminer",
    goals: ["kvinna"], form: "tabletter", label: "FOLSYRA", sub: "400 µg", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "svensk"], badges: [], campaign: "3for2", rating: 4.8, reviews: 512, sold: 2900, stock: 150, added: "2025-01-20",
    variants: [{ id: "90", label: "90 tabletter", price: 69, servings: 90, count: 90 }],
    short: "Den dos Livsmedelsverket rekommenderar till dig som planerar graviditet.",
    desc: "Livsmedelsverket rekommenderar att den som kan bli gravid tar 400 µg folsyra per dag, från minst en månad före befruktning till och med graviditetsvecka 12.",
    claims: [C.folat, "Folat bidrar till att minska trötthet och utmattning.", "Ett kompletterande intag av folsyra ökar folatnivån hos modern. Låg folatnivå hos modern är en riskfaktor för utveckling av neuralrörsdefekter hos det växande fostret. Den gynnsamma effekten uppnås vid ett dagligt kompletterande intag av 400 µg folsyra under minst en månad före och upp till tre månader efter befruktningen."],
    keywords: "graviditet gravid folat b9",
    ingredients: "Fyllnadsmedel (mikrokristallin cellulosa, dikalciumfosfat), klumpförhindrande medel (magnesiumsalter av fettsyror), pteroylmonoglutaminsyra.",
    nutrition: { per: "1 tablett", rows: [["b9", 400]] },
    usage: "1 tablett per dag.", warn: ""
  });
  add({
    id: "p10", slug: "d3-munspray", name: "D3 Munspray", brand: "vildgron", cat: "vitaminer",
    goals: ["immunforsvar", "leder"], form: "droppar", label: "D3", sub: "Spray", dose: "2 sprayningar",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri"], badges: [], campaign: "3for2", rating: 4.4, reviews: 176, sold: 1200, stock: 70, added: "2026-09-08",
    variants: [{ id: "30ml", label: "30 ml", price: 129, servings: 150, ml: 30 }],
    short: "Vegansk D3 som spray med pepparmyntssmak – för dig som inte vill svälja kapslar.",
    desc: "Två sprayningar på insidan av kinden ger 25 µg D3 från lav. Passar både vuxna och tonåringar som har svårt för kapslar.",
    claims: C.d, keywords: "spray d-vitamin vegan",
    ingredients: "MCT-olja (från kokos), arom (pepparmynta), kolekalciferol från lav (D3), antioxidationsmedel (tokoferolrikt extrakt).",
    nutrition: { per: "2 sprayningar", rows: [["d", 25, null, "Vitamin D3 (1000 IE)"]] },
    usage: "Skaka flaskan. Spraya 2 gånger på insidan av kinden en gång per dag.", warn: ""
  });

  /* ---------- Mineraler ---------- */
  add({
    id: "p11", slug: "magnesium-bisglycinat", name: "Magnesium Bisglycinat", brand: "karna", cat: "mineraler",
    goals: ["somn", "muskler", "energi"], form: "kapslar", label: "MAGNESIUM", sub: "Bisglycinat 300 mg", dose: "2 kapslar",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: ["bastsaljare"], rating: 4.8, reviews: 2140, sold: 11200, stock: 300, added: "2025-02-10",
    variants: [{ id: "90", label: "90 kapslar", price: 179, servings: 45, count: 90 }, { id: "180", label: "180 kapslar", price: 299, servings: 90, count: 180 }],
    short: "Magnesium bundet till glycin – skonsamt för magen och populärt som kvällstillskott.",
    desc: "Magnesiumbisglycinat är en kelaterad form där magnesium är bundet till aminosyran glycin. Formen ger sällan magbesvär, vilket är en vanlig nackdel med magnesiumoxid.",
    claims: C.mg, keywords: "mg kramp sömn kelat glycinat",
    ingredients: "Magnesiumbisglycinat, kapselhölje (hydroxipropylmetylcellulosa), klumpförhindrande medel (magnesiumsalter av fettsyror).",
    nutrition: { per: "2 kapslar", rows: [["mg", 300]] },
    usage: "2 kapslar per dag, gärna på kvällen.", warn: ""
  });
  add({
    id: "p12", slug: "magnesium-brustablett", name: "Magnesium Brustablett", brand: "norrvital", cat: "mineraler",
    goals: ["muskler", "energi"], form: "brus", label: "MAGNESIUM", sub: "375 mg", dose: "1 brustablett",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "svensk"], badges: [], rating: 4.4, reviews: 389, sold: 2400, stock: 140, added: "2025-05-05",
    variants: [{ id: "20", label: "20 brustabletter", price: 49, servings: 20, count: 20 }, { id: "3x20", label: "3 × 20 brustabletter", price: 129, servings: 60, count: 60 }],
    flavors: ["Citron", "Apelsin"],
    short: "Magnesiumcitrat som löses i ett glas vatten. Sockerfri.",
    desc: "En brustablett ger 100 % av referensintaget för magnesium. Magnesiumcitrat tas upp väl, och tabletten är sötad med sukralos.",
    claims: C.mg.slice(0, 2), keywords: "brus vattenlöslig citrat",
    ingredients: "Surhetsreglerande medel (citronsyra, natriumvätekarbonat), magnesiumkarbonat, magnesiumoxid, arom, sötningsmedel (sukralos), färgämne (betakaroten).",
    nutrition: { per: "1 brustablett", rows: [["mg", 375]] },
    usage: "Lös 1 brustablett i 2 dl vatten en gång per dag.", warn: "Natriumhalt: 290 mg per tablett."
  });
  add({
    id: "p13", slug: "zink-25-mg", name: "Zink 25 mg Pikolinat", brand: "norrvital", cat: "mineraler",
    goals: ["immunforsvar", "skonhet"], form: "tabletter", label: "ZINK", sub: "25 mg", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "svensk"], badges: [], rating: 4.6, reviews: 433, sold: 2700, stock: 160, added: "2025-04-18",
    variants: [{ id: "100", label: "100 tabletter", price: 89, servings: 100, count: 100 }],
    short: "Zinkpikolinat i liten tablett. Bra komplement vid vegetarisk kost.",
    desc: "Fytinsyra i fullkorn och baljväxter hämmar upptaget av zink, därför kan vegetarianer behöva mer. Pikolinat är en välupptagen form.",
    claims: C.zn, keywords: "zn hy förkylning",
    ingredients: "Fyllnadsmedel (mikrokristallin cellulosa), zinkpikolinat, klumpförhindrande medel (magnesiumsalter av fettsyror).",
    nutrition: { per: "1 tablett", rows: [["zn", 25]] },
    usage: "1 tablett per dag i samband med måltid.", warn: "Långvarigt intag av mer än 25 mg zink per dag rekommenderas inte."
  });
  add({
    id: "p14", slug: "jarn-skonsam-25-mg", name: "Järn Skonsam 25 mg + C", brand: "karna", cat: "mineraler",
    goals: ["kvinna", "energi"], form: "kapslar", label: "JÄRN", sub: "25 mg + C", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.6, reviews: 611, sold: 3300, stock: 7, added: "2025-07-07",
    variants: [{ id: "60", label: "60 kapslar", price: 129, servings: 60, count: 60 }],
    short: "Järnbisglycinat med C-vitamin – mild mot magen och utan förstoppande effekt för de flesta.",
    desc: "Järnbisglycinat ger mindre magbesvär än järnsulfat. C-vitamin ökar järnupptaget, och kapseln innehåller 40 mg.",
    claims: [...C.fe, C.c[2]], keywords: "fe blodvärde hemoglobin trött mens",
    ingredients: "Järnbisglycinat, kapselhölje (hydroxipropylmetylcellulosa), L-askorbinsyra, fyllnadsmedel (risextrakt).",
    nutrition: { per: "1 kapsel", rows: [["fe", 25], ["c", 40]] },
    usage: "1 kapsel per dag, gärna på fastande mage med ett glas juice.", warn: `${W.iron} Ta inte järn samtidigt som kaffe, te eller mjölkprodukter.`
  });
  add({
    id: "p15", slug: "kalcium-d3-k2", name: "Kalcium + D3 + K2", brand: "norrvital", cat: "mineraler",
    goals: ["leder", "kvinna"], form: "tabletter", label: "KALCIUM", sub: "+ D3 + K2", dose: "2 tabletter",
    diets: ["glutenfri", "laktosfri", "svensk"], badges: [], rating: 4.5, reviews: 298, sold: 1600, stock: 110, added: "2025-03-12",
    variants: [{ id: "120", label: "120 tabletter", price: 129, servings: 60, count: 120 }],
    short: "Komplett skelettformel för dig som äter lite mejeriprodukter.",
    desc: "Kalcium, D-vitamin och K-vitamin samverkar för skelettet. Dagsdosen motsvarar referensintaget för kalcium och är fördelad på två mindre tabletter.",
    claims: [C.ca, C.d[1], C.k], keywords: "skelett benskörhet osteoporos ca",
    ingredients: "Kalciumkarbonat, fyllnadsmedel (mikrokristallin cellulosa), menakinon-7, kolekalciferol.",
    nutrition: { per: "2 tabletter", rows: [["ca", 800], ["d", 20], ["k", 75, null, "Vitamin K2 (MK-7)"]] },
    usage: "1 tablett morgon och 1 tablett kväll.", warn: "Personer som behandlas med blodförtunnande läkemedel ska rådgöra med läkare före användning."
  });
  add({
    id: "p16", slug: "selen-100", name: "Selen 100 µg", brand: "norrvital", cat: "mineraler",
    goals: ["immunforsvar", "skonhet"], form: "tabletter", label: "SELEN", sub: "100 µg", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "svensk"], badges: [], rating: 4.6, reviews: 205, sold: 1300, stock: 95, added: "2025-01-05",
    variants: [{ id: "90", label: "90 tabletter", price: 79, servings: 90, count: 90 }],
    short: "Organiskt bundet selen. Svenska jordar är naturligt selenfattiga.",
    desc: "L-selenometionin är en organisk form av selen som kroppen tar upp väl. Svensk åkermark innehåller lite selen, och därmed också växter som odlas här.",
    claims: C.se, keywords: "se antioxidant",
    ingredients: "Fyllnadsmedel (dikalciumfosfat, mikrokristallin cellulosa), L-selenometionin.",
    nutrition: { per: "1 tablett", rows: [["se", 100]] },
    usage: "1 tablett per dag.", warn: ""
  });
  add({
    id: "p17", slug: "jod-150-kelp", name: "Jod 150 µg från kelp", brand: "vildgron", cat: "mineraler",
    goals: ["energi"], form: "tabletter", label: "JOD", sub: "Kelp", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "eko"], badges: [], rating: 4.5, reviews: 132, sold: 800, stock: 60, added: "2026-08-28",
    variants: [{ id: "120", label: "120 tabletter", price: 89, servings: 120, count: 120 }],
    short: "Jod från ekologisk brunalg. Relevant för dig som använder salt utan jod.",
    desc: "Flingsalt, havssalt och många färdigrätter saknar jod. Tabletten ger referensintaget från ekologisk kelp med jämn jodhalt.",
    claims: C.jod, keywords: "sköldkörtel tång alg",
    ingredients: "Ekologisk kelp (Ascophyllum nodosum), fyllnadsmedel (cellulosa).",
    nutrition: { per: "1 tablett", rows: [["i", 150]] },
    usage: "1 tablett per dag.", warn: "Personer med sköldkörtelsjukdom ska rådgöra med läkare före användning."
  });

  /* ---------- Omega-3 ---------- */
  add({
    id: "p18", slug: "omega-3-fiskolja", name: "Omega-3 Ren Fiskolja", brand: "polarlin", cat: "omega-3",
    goals: ["hjarta-hjarna"], form: "kapslar", label: "OMEGA-3", sub: "EPA 660 · DHA 440", dose: "2 kapslar",
    diets: ["glutenfri", "laktosfri"], badges: ["bastsaljare"], rating: 4.7, reviews: 1820, sold: 9300, stock: 260, added: "2025-02-02",
    variants: [{ id: "120", label: "120 kapslar", price: 149, servings: 60, count: 120 }, { id: "240", label: "240 kapslar", price: 259, servings: 120, count: 240 }],
    short: "Koncentrerad fiskolja från ansjovis och sardin. TOTOX under 10 i varje batch.",
    desc: "Oljan molekylärdestilleras för att ta bort tungmetaller och miljögifter, och varje batch testas för oxidation. Kapslarna har citronarom för att undvika fisksmak.",
    claims: [C.epa, C.dha], keywords: "fiskolja epa dha hjärta hjärna",
    ingredients: "Fiskolja (från ansjovis och sardin), kapselhölje (gelatin från fisk, fuktighetsbevarande medel: glycerol), antioxidationsmedel (tokoferolrikt extrakt), citronolja.",
    nutrition: { per: "2 kapslar", rows: [["Fiskolja", 2000, "mg"], ["EPA", 660, "mg"], ["DHA", 440, "mg"], ["e", 6]] },
    usage: "2 kapslar per dag i samband med måltid.", warn: W.fish
  });
  add({
    id: "p19", slug: "omega-3-flytande-citron", name: "Omega-3 Flytande Citron", brand: "polarlin", cat: "omega-3",
    goals: ["hjarta-hjarna", "immunforsvar"], form: "flytande", label: "OMEGA-3", sub: "Flytande + D3", dose: "5 ml",
    diets: ["glutenfri", "laktosfri"], badges: [], rating: 4.6, reviews: 742, sold: 3800, stock: 85, added: "2025-10-10",
    variants: [{ id: "250", label: "250 ml", price: 189, servings: 50, ml: 250 }, { id: "500", label: "500 ml", price: 329, servings: 100, ml: 500 }],
    short: "Hög dos omega-3 per sked – med tillsatt D-vitamin. Ingen fiskig eftersmak.",
    desc: "En tesked ger 1,3 g EPA och DHA, vilket motsvarar ungefär sex vanliga kapslar. Oljan har naturlig citronsmak och tappas på flaska under kvävgas.",
    claims: [C.epa, C.dha, C.d[0]], keywords: "fiskolja tran sked flytande",
    ingredients: "Fiskolja, naturlig citronarom, antioxidationsmedel (tokoferolrikt extrakt, rosmarinextrakt), kolekalciferol.",
    nutrition: { per: "5 ml", rows: [["EPA", 800, "mg"], ["DHA", 500, "mg"], ["d", 10], ["e", 3]] },
    usage: "5 ml (1 tesked) per dag. Förvaras i kylskåp efter öppning och används inom 3 månader.", warn: W.fish
  });
  add({
    id: "p20", slug: "vegansk-omega-3-algolja", name: "Vegansk Omega-3 Algolja", brand: "vildgron", cat: "omega-3",
    goals: ["hjarta-hjarna"], form: "kapslar", label: "ALG-OMEGA", sub: "DHA 500", dose: "2 kapslar",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.6, reviews: 312, sold: 1900, stock: 80, added: "2026-09-12",
    variants: [{ id: "60", label: "60 kapslar", price: 219, servings: 30, count: 60 }],
    short: "Omega-3 direkt från mikroalger – samma källa som fisken får sin DHA från.",
    desc: "Fisk bildar inte själv EPA och DHA utan får dem via alger. Den här oljan odlas i slutna tankar, vilket ger en ren produkt utan påverkan på fiskbestånden.",
    claims: [C.epa, C.dha], keywords: "alg vegan dha epa växtbaserad",
    ingredients: "Algolja (Schizochytrium sp.), kapselhölje (modifierad stärkelse, carragenan, glycerol), antioxidationsmedel (tokoferolrikt extrakt, askorbylpalmitat).",
    nutrition: { per: "2 kapslar", rows: [["Algolja", 1500, "mg"], ["DHA", 500, "mg"], ["EPA", 250, "mg"]] },
    usage: "2 kapslar per dag i samband med måltid.", warn: ""
  });
  add({
    id: "p21", slug: "krillolja-antarktis", name: "Krillolja Antarktis", brand: "polarlin", cat: "omega-3",
    goals: ["hjarta-hjarna", "leder"], form: "kapslar", label: "KRILL", sub: "Fosfolipider", dose: "2 kapslar",
    diets: ["glutenfri", "laktosfri"], badges: [], rating: 4.4, reviews: 228, sold: 1100, stock: 45, added: "2025-06-30",
    variants: [{ id: "60", label: "60 kapslar", price: 249, was: 299, servings: 30, count: 60 }],
    short: "Omega-3 bundet till fosfolipider, med naturligt astaxantin som ger den röda färgen.",
    desc: "Krillolja innehåller lägre halt EPA och DHA än fiskolja men i fosfolipidform. Krillen fångas enligt MSC-certifierat fiske i Antarktis.",
    claims: [C.epa], keywords: "krill astaxantin fosfolipid",
    ingredients: "Krillolja (Euphausia superba), kapselhölje (gelatin från fisk, glycerol, vatten).",
    nutrition: { per: "2 kapslar", rows: [["Krillolja", 1000, "mg"], ["Fosfolipider", 400, "mg"], ["EPA", 150, "mg"], ["DHA", 100, "mg"], ["Astaxantin", 0.2, "mg"]] },
    usage: "2 kapslar per dag i samband med måltid.", warn: `${W.shellfish} ${W.fish}`
  });

  /* ---------- Protein ---------- */
  const wheyMacro = { cols: ["100 g", "30 g"], rows: [["Energi", "1 600 kJ / 382 kcal", "480 kJ / 115 kcal"], ["Fett", "6,5 g", "2,0 g"], ["varav mättat fett", "4,2 g", "1,3 g", 1], ["Kolhydrat", "6,0 g", "1,8 g"], ["varav sockerarter", "5,0 g", "1,5 g", 1], ["Protein", "75 g", "22,5 g"], ["Salt", "0,40 g", "0,12 g"]] };
  add({
    id: "p22", slug: "whey-80-vassleprotein", name: "Whey 80 Vassleprotein", brand: "styrka", cat: "protein",
    goals: ["muskler", "vikt"], form: "pulver", label: "WHEY 80", sub: "22 g protein", dose: "30 g",
    diets: ["glutenfri", "dopingtestad"], badges: ["bastsaljare"], rating: 4.7, reviews: 3105, sold: 14200, stock: 400, added: "2024-11-01",
    variants: [{ id: "1kg", label: "1 kg", price: 299, servings: 33, g: 1000 }, { id: "2kg", label: "2 kg", price: 549, was: 599, servings: 66, g: 2000 }, { id: "4kg", label: "4 kg", price: 999, servings: 133, g: 4000 }],
    flavors: ["Choklad", "Vanilj", "Jordgubb", "Kakao & hasselnöt", "Neutral"],
    short: "Klassiskt vassleprotein från svensk mjölk som löser sig utan klumpar i shakern.",
    desc: "Vasslen kommer från mjölk från svenska gårdar och filtreras skonsamt för att bevara proteinstrukturen. Varje portion ger 22,5 g protein och 2,5 g leucin.",
    claims: C.protein, keywords: "whey vassle proteinpulver shake muskler",
    ingredients: "Vassleproteinkoncentrat (mjölk) 94 %, arom, förtjockningsmedel (xantangummi), emulgeringsmedel (solroslecitin), sötningsmedel (sukralos). Choklad innehåller även fettreducerat kakaopulver.",
    nutrition: { macro: wheyMacro },
    usage: "Blanda 30 g (1 skopa) med 3 dl vatten eller mjölk. 1–3 portioner per dag.", warn: `${W.milk} ${W.nuts}`
  });
  add({
    id: "p23", slug: "whey-isolat-90", name: "Whey Isolat 90", brand: "styrka", cat: "protein",
    goals: ["muskler", "vikt"], form: "pulver", label: "ISOLAT 90", sub: "Laktosreducerad", dose: "25 g",
    diets: ["glutenfri", "dopingtestad"], badges: [], rating: 4.8, reviews: 1240, sold: 6100, stock: 140, added: "2025-04-04",
    variants: [{ id: "750g", label: "750 g", price: 349, servings: 30, g: 750 }, { id: "2kg", label: "2 kg", price: 799, servings: 80, g: 2000 }],
    flavors: ["Choklad", "Vanilj", "Salt karamell"],
    short: "Mikrofiltrerat isolat med 88 % protein och under 1 g fett per 100 g.",
    desc: "Isolat filtreras längre än koncentrat, vilket tar bort det mesta av fettet och laktosen. Ett bra val för dig som är känslig för laktos eller räknar makron noga.",
    claims: C.protein, keywords: "isolat laktos whey wpi",
    ingredients: "Vassleproteinisolat (mjölk) 96 %, arom, förtjockningsmedel (xantangummi), sötningsmedel (sukralos).",
    nutrition: { macro: { cols: ["100 g", "25 g"], rows: [["Energi", "1 560 kJ / 367 kcal", "390 kJ / 92 kcal"], ["Fett", "0,8 g", "0,2 g"], ["varav mättat fett", "0,5 g", "0,1 g", 1], ["Kolhydrat", "2,0 g", "0,5 g"], ["varav sockerarter", "1,5 g", "0,4 g", 1], ["Protein", "88 g", "22 g"], ["Salt", "0,50 g", "0,13 g"]] } },
    usage: "Blanda 25 g med 2,5 dl vatten.", warn: W.milk
  });
  add({
    id: "p24", slug: "kasein-natt", name: "Kasein Natt", brand: "styrka", cat: "protein",
    goals: ["muskler", "somn"], form: "pulver", label: "KASEIN", sub: "Långsamt protein", dose: "30 g",
    diets: ["glutenfri", "dopingtestad"], badges: [], rating: 4.5, reviews: 466, sold: 2100, stock: 70, added: "2025-08-01",
    variants: [{ id: "900g", label: "900 g", price: 329, servings: 30, g: 900 }],
    flavors: ["Choklad", "Vanilj"],
    short: "Micellärt kasein som bildar en tjock pudding – perfekt som kvällsmål.",
    desc: "Kasein tas upp långsammare än vassle och ger en jämn tillförsel av aminosyror under flera timmar. Blanda med mindre vätska för en sked-pudding.",
    claims: C.protein, keywords: "kasein kvällsprotein casein pudding",
    ingredients: "Micellärt kasein (mjölk) 95 %, fettreducerat kakaopulver (choklad), arom, sötningsmedel (sukralos).",
    nutrition: { macro: { cols: ["100 g", "30 g"], rows: [["Energi", "1 550 kJ / 366 kcal", "465 kJ / 110 kcal"], ["Fett", "1,5 g", "0,5 g"], ["varav mättat fett", "1,0 g", "0,3 g", 1], ["Kolhydrat", "6,0 g", "1,8 g"], ["varav sockerarter", "4,0 g", "1,2 g", 1], ["Protein", "82 g", "24,6 g"], ["Salt", "0,60 g", "0,18 g"]] } },
    usage: "Blanda 30 g med 2–3 dl mjölk eller vatten före sänggåendet.", warn: W.milk
  });
  add({
    id: "p25", slug: "veganprotein-art-ris", name: "Veganprotein Ärt & Ris", brand: "vildgron", cat: "protein",
    goals: ["muskler", "vikt"], form: "pulver", label: "VEGAN", sub: "Ärt & ris", dose: "30 g",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.4, reviews: 688, sold: 3400, stock: 120, added: "2025-05-20",
    variants: [{ id: "1kg", label: "1 kg", price: 349, servings: 33, g: 1000 }],
    flavors: ["Kakao", "Vanilj", "Neutral"],
    short: "Ärt- och risprotein i kombination för en komplett aminosyraprofil.",
    desc: "Ärtprotein är rikt på lysin men har lite metionin, ris är tvärtom. Tillsammans ger de en profil som liknar vassle. Sötad med stevia.",
    claims: C.protein, keywords: "veganskt växtprotein ärtprotein risprotein mjölkfri",
    ingredients: "Ärtproteinisolat 60 %, brunt risprotein 30 %, kakao (kakao), arom, förtjockningsmedel (guarkärnmjöl), sötningsmedel (steviolglykosider), salt.",
    nutrition: { macro: { cols: ["100 g", "30 g"], rows: [["Energi", "1 600 kJ / 382 kcal", "480 kJ / 115 kcal"], ["Fett", "7,0 g", "2,1 g"], ["varav mättat fett", "1,5 g", "0,5 g", 1], ["Kolhydrat", "5,0 g", "1,5 g"], ["varav sockerarter", "1,0 g", "0,3 g", 1], ["Fiber", "3,0 g", "0,9 g"], ["Protein", "72 g", "21,6 g"], ["Salt", "1,8 g", "0,54 g"]] } },
    usage: "Blanda 30 g med 3 dl vatten eller havredryck.", warn: ""
  });
  add({
    id: "p26", slug: "proteinbar-crunch", name: "Proteinbar Crunch", brand: "styrka", cat: "protein",
    goals: ["muskler"], form: "bar", label: "CRUNCH", sub: "20 g protein", dose: "1 bar",
    diets: ["glutenfri"], badges: ["bastsaljare"], rating: 4.6, reviews: 1870, sold: 12500, stock: 500, added: "2025-09-01",
    variants: [{ id: "12", label: "12 st", price: 239, servings: 12, count: 12 }, { id: "24", label: "24 st", price: 449, servings: 24, count: 24 }],
    flavors: ["Chokladkaramell", "Jordnöt", "Kokos"],
    short: "Krispig bar med 20 g protein och bara 1,8 g socker.",
    desc: "Lager av mjölkchokladöverdrag, proteinkrisp och mjuk kärna. Sötad med maltitol i stället för socker.",
    claims: C.protein.slice(0, 2), keywords: "bar mellanmål snack",
    ingredients: "Mjölkprotein, sötningsmedel (maltitol), mjölkchokladöverdrag 20 % (sötningsmedel: maltitol, kakaosmör, helmjölkspulver, kakaomassa, emulgeringsmedel: solroslecitin), sojaproteinkrisp, kakaopulver, palmfett, fuktighetsbevarande medel (glycerol), arom, salt.",
    nutrition: { macro: { cols: ["100 g", "1 bar (60 g)"], rows: [["Energi", "1 475 kJ / 352 kcal", "885 kJ / 211 kcal"], ["Fett", "13 g", "7,8 g"], ["varav mättat fett", "6,0 g", "3,6 g", 1], ["Kolhydrat", "30 g", "18 g"], ["varav sockerarter", "3,0 g", "1,8 g", 1], ["varav polyoler", "18 g", "10,8 g", 1], ["Fiber", "6,0 g", "3,6 g"], ["Protein", "33 g", "19,8 g"], ["Salt", "0,60 g", "0,36 g"]] } },
    usage: "Ät som mellanmål eller efter träning.", warn: `${W.milk} Innehåller soja. ${W.nuts} Överdriven konsumtion kan ha laxerande effekt.`
  });
  add({
    id: "p27", slug: "maltidsersattning-shake", name: "Måltidsersättning Shake", brand: "karna", cat: "protein",
    goals: ["vikt"], form: "pulver", label: "MÅLTID", sub: "Komplett shake", dose: "55 g",
    diets: ["glutenfri"], badges: [], rating: 4.3, reviews: 344, sold: 1500, stock: 55, added: "2026-03-15",
    variants: [{ id: "850g", label: "850 g", price: 279, servings: 15, g: 850 }],
    flavors: ["Choklad", "Jordgubb"],
    short: "Näringsriktig måltid i shakerform med 18 g protein och 23 vitaminer och mineraler.",
    desc: "Ersätter en lunch eller middag när tiden inte räcker till. Varje portion innehåller protein, fibrer och en tredjedel av dagsbehovet av vitaminer och mineraler.",
    claims: [C.meal], keywords: "viktnedgång diet shake måltid",
    ingredients: "Mjölkprotein, havremjöl, maltodextrin, rapsolja, inulin, kakao, vitamin- och mineralblandning, arom, förtjockningsmedel (guarkärnmjöl), sötningsmedel (sukralos).",
    nutrition: { macro: { cols: ["100 g", "55 g"], rows: [["Energi", "1 590 kJ / 380 kcal", "875 kJ / 209 kcal"], ["Fett", "8,0 g", "4,4 g"], ["varav mättat fett", "2,0 g", "1,1 g", 1], ["Kolhydrat", "40 g", "22 g"], ["varav sockerarter", "18 g", "9,9 g", 1], ["Fiber", "8,0 g", "4,4 g"], ["Protein", "33 g", "18,2 g"], ["Salt", "1,2 g", "0,66 g"]] } },
    usage: "Blanda 55 g med 2,5 dl vatten. Ersätt 1–2 måltider per dag. Drick minst 2 liter vätska per dag.", warn: `${W.milk} Innehåller havre (gluten under 20 ppm). Ska inte användas som enda näringskälla.`
  });

  /* ---------- Träning ---------- */
  add({
    id: "p28", slug: "kreatin-monohydrat", name: "Kreatin Monohydrat", brand: "styrka", cat: "traning",
    goals: ["muskler"], form: "pulver", label: "KREATIN", sub: "100 % monohydrat", dose: "5 g",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "dopingtestad"], badges: ["bastsaljare"], rating: 4.9, reviews: 2860, sold: 13100, stock: 380, added: "2024-10-10",
    variants: [{ id: "300g", label: "300 g", price: 179, servings: 60, g: 300 }, { id: "500g", label: "500 g", price: 249, servings: 100, g: 500 }, { id: "1kg", label: "1 kg", price: 399, servings: 200, g: 1000 }],
    short: "Det mest studerade sporttillskottet. Rent, mikroniserat och smaklöst.",
    desc: "Mikroniserat kreatinmonohydrat som löser sig lätt i vatten, juice eller proteinshake. Ingen laddningsfas behövs – 3–5 g per dag fyller upp musklernas förråd på 3–4 veckor.",
    claims: [C.kreatin], keywords: "creatine kreatin styrka gym",
    ingredients: "Kreatinmonohydrat (mikroniserat).",
    nutrition: { per: "5 g", rows: [["Kreatinmonohydrat", 5, "g"]] },
    usage: "Blanda 5 g (1 skopa) med vatten eller annan dryck en gång per dag, även vilodagar.", warn: "Ej lämplig för barn, gravida eller ammande."
  });
  add({
    id: "p29", slug: "pre-workout-laddning", name: "Pre-Workout Laddning", brand: "styrka", cat: "traning",
    goals: ["muskler", "energi"], form: "pulver", label: "PRE", sub: "200 mg koffein", dose: "10 g",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "dopingtestad"], badges: [], rating: 4.5, reviews: 932, sold: 4800, stock: 110, added: "2025-12-01",
    variants: [{ id: "300g", label: "300 g", price: 299, was: 349, servings: 30, g: 300 }],
    flavors: ["Tropisk", "Cola", "Hallon"],
    short: "Citrullin, beta-alanin och koffein i kliniska doser – utan proprietära blandningar.",
    desc: "Varje ingrediens anges med exakt mängd per portion. Beta-alanin kan ge en ofarlig stickande känsla i huden.",
    claims: ["Vitamin B6 bidrar till att minska trötthet och utmattning."], keywords: "preworkout pwo koffein pump energi",
    ingredients: "L-citrullin-DL-malat, beta-alanin, taurin, surhetsreglerande medel (citronsyra), arom, koffein, sötningsmedel (sukralos, acesulfam K), färgämne (rödbetsjuice), pyridoxinhydroklorid.",
    nutrition: { per: "10 g", rows: [["Citrullinmalat", 6000, "mg"], ["Beta-alanin", 3200, "mg"], ["Taurin", 1000, "mg"], ["Koffein", 200, "mg"], ["b6", 1.4]] },
    usage: "Blanda 10 g med 3 dl vatten 20–30 minuter före träning. Max 1 portion per dag.", warn: `${W.caffeine(200)} Inta inte samtidigt med andra koffeinhaltiga produkter. Undvik sent på kvällen.`
  });
  add({
    id: "p30", slug: "eaa-aminosyror", name: "EAA Aminosyror", brand: "styrka", cat: "traning",
    goals: ["muskler", "uthallighet"], form: "pulver", label: "EAA", sub: "8 g per portion", dose: "10 g",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "dopingtestad"], badges: [], rating: 4.4, reviews: 410, sold: 1900, stock: 66, added: "2026-09-20",
    variants: [{ id: "400g", label: "400 g", price: 279, servings: 40, g: 400 }],
    flavors: ["Persika iste", "Citron & lime"],
    short: "Alla nio essentiella aminosyror – en läskande dryck under långa pass.",
    desc: "Fermenterade, veganska aminosyror med 3 g leucin per portion. Fungerar som träningsdryck eller mellan måltider.",
    claims: [], keywords: "eaa bcaa leucin aminosyror",
    ingredients: "L-leucin, L-lysin, L-valin, L-isoleucin, L-treonin, L-fenylalanin, L-metionin, L-histidin, L-tryptofan, surhetsreglerande medel (citronsyra), arom, sötningsmedel (sukralos).",
    nutrition: { per: "10 g", rows: [["Essentiella aminosyror", 8000, "mg"], ["varav L-leucin", 3000, "mg"], ["varav L-isoleucin", 1000, "mg"], ["varav L-valin", 1000, "mg"]] },
    usage: "Blanda 10 g med 4–5 dl vatten och drick under träningen.", warn: ""
  });
  add({
    id: "p31", slug: "beta-alanin", name: "Beta-alanin", brand: "styrka", cat: "traning",
    goals: ["uthallighet", "muskler"], form: "pulver", label: "BETA-ALANIN", sub: "Rent pulver", dose: "3,2 g",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "dopingtestad"], badges: [], rating: 4.3, reviews: 188, sold: 900, stock: 44, added: "2025-07-15",
    variants: [{ id: "300g", label: "300 g", price: 199, servings: 93, g: 300 }],
    short: "Rent beta-alanin utan smak att blanda i valfri dryck.",
    desc: "Beta-alanin är en aminosyra som tas dagligen under flera veckor. Dela gärna upp dosen för att minska den stickande känslan i huden.",
    claims: [], keywords: "beta alanin karnosin",
    ingredients: "Beta-alanin.",
    nutrition: { per: "3,2 g", rows: [["Beta-alanin", 3200, "mg"]] },
    usage: "Blanda 3,2 g med vatten en gång per dag, eller dela upp på två doser.", warn: "Ej lämplig för barn, gravida eller ammande."
  });
  add({
    id: "p32", slug: "sportdryck-uthallighet", name: "Sportdryck Uthållighet", brand: "styrka", cat: "traning",
    goals: ["uthallighet"], form: "pulver", label: "SPORTDRYCK", sub: "Kolhydrat + salt", dose: "60 g",
    diets: ["vegan", "glutenfri", "laktosfri", "dopingtestad"], badges: [], rating: 4.6, reviews: 276, sold: 1400, stock: 90, added: "2026-04-01",
    variants: [{ id: "1kg", label: "1 kg", price: 229, servings: 16, g: 1000 }],
    flavors: ["Citrus", "Skogsbär"],
    short: "Kolhydrat-elektrolytdryck för lopp, långpass och cykelturer över 90 minuter.",
    desc: "Blandning av maltodextrin och fruktos i förhållandet 2:1, vilket gör att mer kolhydrat kan tas upp per timme. Natriumhalten ersätter det du förlorar i svett.",
    claims: C.cho, keywords: "sportdryck kolhydrater löpning cykel maraton",
    ingredients: "Maltodextrin, fruktos, surhetsreglerande medel (citronsyra), natriumcitrat, natriumklorid, kaliumcitrat, arom.",
    nutrition: { macro: { cols: ["100 g", "60 g"], rows: [["Energi", "1 600 kJ / 376 kcal", "960 kJ / 226 kcal"], ["Fett", "0 g", "0 g"], ["Kolhydrat", "94 g", "56 g"], ["varav sockerarter", "40 g", "24 g", 1], ["Protein", "0 g", "0 g"], ["Salt", "2,0 g", "1,2 g"]] } },
    usage: "Blanda 60 g med 7,5 dl vatten. Drick under aktivitet som varar längre än 1 timme.", warn: ""
  });
  add({
    id: "p33", slug: "koffeintabletter-100", name: "Koffeintabletter 100 mg", brand: "styrka", cat: "traning",
    goals: ["energi", "uthallighet"], form: "tabletter", label: "KOFFEIN", sub: "100 mg", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "dopingtestad"], badges: [], rating: 4.5, reviews: 349, sold: 2200, stock: 130, added: "2025-03-30",
    variants: [{ id: "100", label: "100 tabletter", price: 79, servings: 100, count: 100 }],
    short: "Exakt dos koffein utan socker eller kalorier – ungefär som en kopp bryggkaffe.",
    desc: "Bra när du vill veta exakt hur mycket koffein du får i dig. Tabletten har brytskåra för 50 mg-doser.",
    claims: [], keywords: "koffein kaffe pigg fokus",
    ingredients: "Fyllnadsmedel (mikrokristallin cellulosa, dikalciumfosfat), koffein, klumpförhindrande medel (magnesiumsalter av fettsyror).",
    nutrition: { per: "1 tablett", rows: [["Koffein", 100, "mg"]] },
    usage: "1 tablett vid behov. Max 4 tabletter per dag.", warn: `${W.caffeine(100)} Inta inte samtidigt med andra koffeinhaltiga produkter.`
  });
  add({
    id: "p34", slug: "elektrolyter-zero", name: "Elektrolyter Zero", brand: "styrka", cat: "traning",
    goals: ["uthallighet"], form: "brus", label: "ELEKTROLYT", sub: "Sockerfri", dose: "1 brustablett",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "dopingtestad"], badges: [], rating: 4.5, reviews: 512, sold: 3600, stock: 210, added: "2026-06-01",
    variants: [{ id: "20", label: "20 brustabletter", price: 59, servings: 20, count: 20 }, { id: "4x20", label: "4 × 20 brustabletter", price: 199, servings: 80, count: 80 }],
    flavors: ["Citron", "Hallon", "Apelsin"],
    short: "Natrium, kalium och magnesium utan socker – för varma pass och långa dagar.",
    desc: "Lös en tablett i en vattenflaska för att ersätta salter du förlorar i svett. Utan socker och med bara 4 kcal per tablett.",
    claims: [C.kal, C.mg[1]], keywords: "salt vätska elektrolyter svett hydrering",
    ingredients: "Surhetsreglerande medel (citronsyra, natriumvätekarbonat), sorbitol, kaliumbikarbonat, magnesiumkarbonat, natriumklorid, arom, sötningsmedel (sukralos), L-askorbinsyra.",
    nutrition: { per: "1 brustablett", rows: [["Natrium", 250, "mg"], ["kal", 200], ["mg", 56], ["c", 80]] },
    usage: "Lös 1 brustablett i 5 dl vatten. Upp till 3 per dag.", warn: ""
  });

  /* ---------- Sömn & avslappning ---------- */
  add({
    id: "p35", slug: "kvallsro", name: "Kvällsro", brand: "karna", cat: "somn-stress",
    goals: ["somn"], form: "kapslar", label: "KVÄLLSRO", sub: "Mg + L-teanin", dose: "2 kapslar",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: ["bastsaljare"], rating: 4.6, reviews: 1012, sold: 5600, stock: 150, added: "2025-10-20",
    variants: [{ id: "60", label: "60 kapslar", price: 199, servings: 30, count: 60 }],
    short: "Magnesium, L-teanin och citronmeliss – en lugn avslutning på dagen.",
    desc: "L-teanin är en aminosyra från te och citronmeliss en ört i myntafamiljen. Formuleringen kompletteras med magnesium och B6 för nervsystemet.",
    claims: [C.mg[2], C.mg[3], C.b6psy], keywords: "sömn sova stress avslappning teanin melissa kväll",
    ingredients: "Citronmelissextrakt (Melissa officinalis), L-teanin, magnesiumbisglycinat, kapselhölje (hydroxipropylmetylcellulosa), pyridoxal-5-fosfat.",
    nutrition: { per: "2 kapslar", rows: [["mg", 200], ["L-teanin", 200, "mg"], ["Citronmelissextrakt", 300, "mg"], ["b6", 1.4]] },
    usage: "2 kapslar ca 1 timme före sänggåendet.", warn: W.pregnant
  });
  add({
    id: "p36", slug: "l-teanin-200", name: "L-teanin 200 mg", brand: "vildgron", cat: "somn-stress",
    goals: ["somn", "energi"], form: "kapslar", label: "L-TEANIN", sub: "200 mg", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.4, reviews: 267, sold: 1300, stock: 72, added: "2026-01-10",
    variants: [{ id: "60", label: "60 kapslar", price: 169, servings: 60, count: 60 }],
    short: "Ren aminosyra från grönt te. Kombineras ofta med morgonkaffet.",
    desc: "L-teanin finns naturligt i teblad. En kapsel motsvarar mängden i ungefär åtta koppar grönt te.",
    claims: [], keywords: "teanin grönt te lugn fokus",
    ingredients: "L-teanin, kapselhölje (hydroxipropylmetylcellulosa).",
    nutrition: { per: "1 kapsel", rows: [["L-teanin", 200, "mg"]] },
    usage: "1 kapsel per dag.", warn: W.pregnant
  });
  add({
    id: "p37", slug: "magnesium-kvallsdryck", name: "Magnesium Kvällsdryck", brand: "karna", cat: "somn-stress",
    goals: ["somn", "muskler"], form: "pulver", label: "KVÄLLSDRYCK", sub: "Magnesium", dose: "5 g",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri"], badges: [], rating: 4.5, reviews: 198, sold: 900, stock: 4, added: "2026-09-25",
    variants: [{ id: "150g", label: "150 g", price: 149, servings: 30, g: 150 }],
    flavors: ["Hallon", "Kamomill & citron"],
    short: "Varm eller kall kvällsdryck med magnesiumcitrat och B6.",
    desc: "Rör ut pulvret i varmt vatten för en kvällsrutin utan koffein. Sötad med stevia.",
    claims: [C.mg[0], C.mg[3], C.b6psy], keywords: "kvällsdryck magnesium sömn te",
    ingredients: "Magnesiumcitrat, surhetsreglerande medel (citronsyra), arom, rödbetspulver, sötningsmedel (steviolglykosider), pyridoxinhydroklorid.",
    nutrition: { per: "5 g", rows: [["mg", 250], ["b6", 1.4]] },
    usage: "Rör ut 5 g i 2 dl varmt eller kallt vatten på kvällen.", warn: ""
  });

  /* ---------- Mage & tarm ---------- */
  add({
    id: "p38", slug: "mjolksyrabakterier-20-miljarder", name: "Mjölksyrabakterier 20 miljarder", brand: "karna", cat: "mage-tarm",
    goals: ["mage", "immunforsvar"], form: "kapslar", label: "BAKTERIER", sub: "20 mdr · 8 stammar", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: ["bastsaljare"], rating: 4.6, reviews: 978, sold: 5900, stock: 140, added: "2025-05-12",
    variants: [{ id: "30", label: "30 kapslar", price: 199, servings: 30, count: 30 }, { id: "60", label: "60 kapslar", price: 349, servings: 60, count: 60 }],
    short: "Åtta bakteriestammar i syraresistent kapsel. Tål rumstemperatur.",
    desc: "Kapseln är syraresistent och skyddar bakterierna genom magsäcken. Frystorkad i blister, så den behöver inte förvaras i kylskåp.",
    claims: [], keywords: "probiotika laktobaciller bifido mage tarmflora antibiotika",
    ingredients: "Bakteriekulturer (Lactobacillus acidophilus, L. rhamnosus, L. plantarum, L. casei, Bifidobacterium lactis, B. longum, B. bifidum, Streptococcus thermophilus), fyllnadsmedel (potatisstärkelse), kapselhölje (hydroxipropylmetylcellulosa, gellangummi).",
    nutrition: { per: "1 kapsel", rows: [["Bakteriekulturer", "20 miljarder CFU", null]] },
    usage: "1 kapsel per dag i samband med frukost.", warn: ""
  });
  add({
    id: "p39", slug: "psylliumfroskal", name: "Psylliumfröskal Ekologisk", brand: "vildgron", cat: "mage-tarm",
    goals: ["mage", "vikt"], form: "pulver", label: "PSYLLIUM", sub: "Ekologisk", dose: "5 g",
    diets: ["vegan", "glutenfri", "laktosfri", "sockerfri", "eko"], badges: [], rating: 4.5, reviews: 455, sold: 2600, stock: 160, added: "2025-02-25",
    variants: [{ id: "400g", label: "400 g", price: 99, servings: 80, g: 400 }],
    short: "Finmalet skal från loppfrö – ett enkelt sätt att få mer fiber.",
    desc: "Psylliumfröskal binder vatten och bildar en gel. Används också i glutenfri bakning för att ge degen spänst.",
    claims: [], keywords: "fiber loppfrö psyllium husk mage",
    ingredients: "Ekologiskt psylliumfröskal (Plantago ovata), finmalet.",
    nutrition: { per: "5 g", rows: [["Psylliumfröskal", 5, "g"], ["varav kostfiber", 4.3, "g"]] },
    usage: "Rör ut 5 g i minst 2 dl vatten och drick direkt. Drick ytterligare ett glas vatten efteråt.", warn: "Intas med riklig mängd vätska. Personer med sväljsvårigheter ska inte använda produkten."
  });
  add({
    id: "p40", slug: "matsmaltningsenzymer", name: "Matsmältningsenzymer", brand: "karna", cat: "mage-tarm",
    goals: ["mage"], form: "kapslar", label: "ENZYMER", sub: "Bred blandning", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.3, reviews: 143, sold: 700, stock: 52, added: "2026-09-02",
    variants: [{ id: "90", label: "90 kapslar", price: 229, servings: 90, count: 90 }],
    short: "Växtbaserade enzymer som bryter ner kolhydrater, protein, fett och laktos.",
    desc: "Kapseln innehåller enzymer av mikrobiellt ursprung, bland annat laktas för dig som har svårt för mjölkprodukter.",
    claims: [], keywords: "enzym laktas gaser uppblåst",
    ingredients: "Enzymblandning (amylas, proteas, lipas, laktas, cellulas), kapselhölje (hydroxipropylmetylcellulosa), fyllnadsmedel (risextrakt).",
    nutrition: { per: "1 kapsel", rows: [["Amylas", "10 000 DU", null], ["Proteas", "30 000 HUT", null], ["Lipas", "2 000 FIP", null], ["Laktas", "1 500 ALU", null], ["Cellulas", "800 CU", null]] },
    usage: "1 kapsel i början av en måltid.", warn: ""
  });
  add({
    id: "p41", slug: "havrefiber-betaglukan", name: "Havrefiber Betaglukan", brand: "vildgron", cat: "mage-tarm",
    goals: ["mage", "hjarta-hjarna"], form: "pulver", label: "HAVREFIBER", sub: "3 g betaglukan", dose: "10 g",
    diets: ["vegan", "laktosfri", "svensk"], badges: [], rating: 4.4, reviews: 122, sold: 650, stock: 80, added: "2026-09-15",
    variants: [{ id: "300g", label: "300 g", price: 139, servings: 30, g: 300 }],
    short: "Koncentrerad betaglukan från svensk havre att röra ner i gröt eller yoghurt.",
    desc: "Betaglukan är den lösliga fibern som gör havregrynsgröt krämig. En portion ger 3 g, mängden som krävs för den godkända effekten på kolesterolet.",
    claims: [C.beta], keywords: "havre betaglukan kolesterol fiber",
    ingredients: "Havrekli från svensk havre (koncentrerad betaglukan).",
    nutrition: { per: "10 g", rows: [["Havrebetaglukan", 3, "g"], ["Kostfiber totalt", 5.5, "g"], ["Protein", 1.8, "g"]] },
    usage: "Rör ner 10 g i gröt, yoghurt eller smoothie. Fördela gärna över dagens måltider.", warn: "Innehåller gluten (havre)."
  });

  /* ---------- Hud, hår & naglar ---------- */
  add({
    id: "p42", slug: "marint-kollagen-c", name: "Marint Kollagen + C", brand: "karna", cat: "hud-har",
    goals: ["skonhet", "leder"], form: "pulver", label: "KOLLAGEN", sub: "10 g peptider", dose: "10 g",
    diets: ["glutenfri", "laktosfri", "sockerfri"], badges: ["bastsaljare"], rating: 4.7, reviews: 1460, sold: 7400, stock: 190, added: "2025-04-25",
    variants: [{ id: "300g", label: "300 g", price: 349, was: 399, servings: 30, g: 300 }],
    short: "Hydrolyserade kollagenpeptider från vildfångad fisk, med C-vitamin.",
    desc: "Smaklöst pulver som löser sig i både varm och kall dryck. C-vitamin är tillsatt eftersom det behövs för kroppens egen kollagenbildning.",
    claims: [C.cSkin], keywords: "kollagen collagen hud rynkor peptider",
    ingredients: "Hydrolyserade kollagenpeptider (från fisk) 99 %, L-askorbinsyra.",
    nutrition: { per: "10 g", rows: [["Kollagenpeptider", 10, "g"], ["c", 80]] },
    usage: "Rör ut 10 g i kaffe, smoothie eller vatten en gång per dag.", warn: W.fish
  });
  add({
    id: "p43", slug: "har-naglar-biotin", name: "Hår & Naglar Biotin", brand: "norrvital", cat: "hud-har",
    goals: ["skonhet"], form: "tabletter", label: "HÅR & NAGLAR", sub: "Biotin + zink", dose: "1 tablett",
    diets: ["vegan", "glutenfri", "laktosfri", "svensk"], badges: [], rating: 4.5, reviews: 576, sold: 3100, stock: 120, added: "2025-06-05",
    variants: [{ id: "90", label: "90 tabletter", price: 149, servings: 90, count: 90 }],
    short: "Biotin, zink och selen – tre näringsämnen med godkända påståenden för hår och naglar.",
    desc: "En liten tablett om dagen. Kombinationen innehåller också kiselsyra från bambu.",
    claims: [C.biotin[0], C.zn[1], C.se[1]], keywords: "biotin hår naglar håravfall",
    ingredients: "Fyllnadsmedel (mikrokristallin cellulosa), bambuextrakt (kiselsyra), zinkcitrat, L-selenometionin, D-biotin.",
    nutrition: { per: "1 tablett", rows: [["b7", 2500], ["zn", 10], ["se", 55], ["Kiselsyra", 40, "mg"]] },
    usage: "1 tablett per dag.", warn: "Höga doser biotin kan påverka vissa blodprover. Berätta för vårdpersonal att du tar biotin."
  });
  add({
    id: "p44", slug: "hyaluronsyra-200", name: "Hyaluronsyra 200 mg", brand: "karna", cat: "hud-har",
    goals: ["skonhet", "leder"], form: "kapslar", label: "HYALURON", sub: "200 mg + C", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.3, reviews: 233, sold: 1100, stock: 4, added: "2025-11-11",
    variants: [{ id: "60", label: "60 kapslar", price: 229, servings: 60, count: 60 }],
    short: "Hyaluronsyra med låg molekylvikt, framställd genom fermentering.",
    desc: "Hyaluronsyra finns naturligt i hud och ledvätska. Den här är veganskt framställd genom fermentering i stället för från tuppkam.",
    claims: [C.cSkin], keywords: "hyaluronsyra hud fukt",
    ingredients: "Natriumhyaluronat, kapselhölje (hydroxipropylmetylcellulosa), L-askorbinsyra.",
    nutrition: { per: "1 kapsel", rows: [["Hyaluronsyra", 200, "mg"], ["c", 40]] },
    usage: "1 kapsel per dag med ett stort glas vatten.", warn: ""
  });
  add({
    id: "p45", slug: "kollagen-gummies", name: "Kollagen Gummies", brand: "karna", cat: "hud-har",
    goals: ["skonhet"], form: "gummies", label: "GUMMIES", sub: "Kollagen + biotin", dose: "2 gummies",
    diets: ["glutenfri", "laktosfri"], badges: [], rating: 4.2, reviews: 301, sold: 1600, stock: 100, added: "2026-09-18",
    variants: [{ id: "60", label: "60 gummies", price: 189, servings: 30, count: 60 }],
    flavors: ["Jordgubb"],
    short: "Tuggbara kollagengummies med jordgubbssmak – för dig som ogillar pulver.",
    desc: "Två gummies ger 2,5 g kollagenpeptider tillsammans med C-vitamin, biotin och zink.",
    claims: [C.cSkin, C.biotin[0], C.zn[1]], keywords: "gummies godis kollagen",
    ingredients: "Glukossirap, socker, kollagenpeptider (nötkreatur), gelatin, surhetsreglerande medel (citronsyra), arom, L-askorbinsyra, färgämne (rödbetsjuice), zinkcitrat, D-biotin, ytbehandlingsmedel (karnaubavax).",
    nutrition: { per: "2 gummies", rows: [["Kollagenpeptider", 2500, "mg"], ["c", 40], ["b7", 50], ["zn", 5], ["Sockerarter", 3.2, "g"]] },
    usage: "Tugga 2 gummies per dag.", warn: "Förvaras oåtkomligt för barn – kan förväxlas med godis."
  });

  /* ---------- Leder & rörlighet ---------- */
  add({
    id: "p46", slug: "gurkmeja-curcumin-95", name: "Gurkmeja Curcumin 95 %", brand: "vildgron", cat: "leder",
    goals: ["leder"], form: "kapslar", label: "GURKMEJA", sub: "95 % curcuminoider", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.6, reviews: 839, sold: 4100, stock: 130, added: "2025-03-08",
    variants: [{ id: "60", label: "60 kapslar", price: 199, servings: 60, count: 60 }, { id: "120", label: "120 kapslar", price: 349, servings: 120, count: 120 }],
    short: "Standardiserat extrakt med svartpeppar (piperin) för bättre upptag.",
    desc: "Gurkmejapulver innehåller bara 2–5 % curcumin. Extraktet här är standardiserat till 95 % curcuminoider och kompletterat med piperin.",
    claims: [], keywords: "gurkmeja curcumin turmeric piperin",
    ingredients: "Gurkmejaextrakt (Curcuma longa, 95 % curcuminoider), kapselhölje (hydroxipropylmetylcellulosa), svartpepparextrakt (Piper nigrum, 95 % piperin).",
    nutrition: { per: "1 kapsel", rows: [["Gurkmejaextrakt", 500, "mg"], ["varav curcuminoider", 475, "mg"], ["Svartpepparextrakt", 5, "mg"]] },
    usage: "1 kapsel per dag i samband med måltid.", warn: `${W.pregnant} ${W.meds}`
  });
  add({
    id: "p47", slug: "ledkollagen-typ-ii", name: "Ledkollagen Typ II", brand: "karna", cat: "leder",
    goals: ["leder"], form: "kapslar", label: "TYP II", sub: "Kollagen + C + Mn", dose: "1 kapsel",
    diets: ["glutenfri", "laktosfri"], badges: [], rating: 4.4, reviews: 214, sold: 1000, stock: 58, added: "2026-02-01",
    variants: [{ id: "60", label: "60 kapslar", price: 279, servings: 60, count: 60 }],
    short: "Odenaturerat kollagen typ II i låg dos, med C-vitamin och mangan.",
    desc: "Typ II är den kollagentyp som dominerar i brosk. Kapseln innehåller dessutom C-vitamin och mangan, som har godkända påståenden om brosk och bindväv.",
    claims: [C.cCart, C.mn], keywords: "leder brosk kollagen typ 2 knä",
    ingredients: "L-askorbinsyra, odenaturerat kollagen typ II (från kyckling), kapselhölje (hydroxipropylmetylcellulosa), manganglukonat.",
    nutrition: { per: "1 kapsel", rows: [["Kollagen typ II", 40, "mg"], ["c", 80], ["mn", 2]] },
    usage: "1 kapsel per dag, gärna till frukost.", warn: ""
  });

  /* ---------- Superfoods & örter ---------- */
  add({
    id: "p48", slug: "spirulina-ekologisk", name: "Spirulina Ekologisk", brand: "vildgron", cat: "superfoods",
    goals: ["energi"], form: "tabletter", label: "SPIRULINA", sub: "Ekologisk", dose: "6 tabletter",
    diets: ["vegan", "glutenfri", "laktosfri", "eko"], badges: [], rating: 4.4, reviews: 367, sold: 1800, stock: 110, added: "2025-07-01",
    variants: [{ id: "250", label: "250 tabletter", price: 149, servings: 41, count: 250 }, { id: "500", label: "500 tabletter", price: 249, was: 279, servings: 83, count: 500 }],
    short: "Blågrön mikroalg pressad till tabletter. 60 % protein och naturligt järn.",
    desc: "Odlad i slutna dammar och kontrollerad för tungmetaller och mikrocystiner i varje batch.",
    claims: [], keywords: "spirulina alg grönt superfood",
    ingredients: "Ekologisk spirulina (Arthrospira platensis) 100 %.",
    nutrition: { per: "6 tabletter (3 g)", rows: [["Spirulina", 3, "g"], ["Protein", 1.8, "g"], ["fe", 0.8]] },
    usage: "6 tabletter per dag, gärna fördelat på två tillfällen.", warn: W.meds
  });
  add({
    id: "p49", slug: "grona-dagen-superpulver", name: "Gröna Dagen Superpulver", brand: "vildgron", cat: "superfoods",
    goals: ["energi", "mage"], form: "pulver", label: "GRÖNA", sub: "28 råvaror", dose: "10 g",
    diets: ["vegan", "glutenfri", "laktosfri", "eko"], badges: [], rating: 4.2, reviews: 289, sold: 1300, stock: 75, added: "2026-08-20",
    variants: [{ id: "300g", label: "300 g", price: 299, servings: 30, g: 300 }],
    flavors: ["Mynta & lime", "Neutral"],
    short: "Gröna blad, alger, bär och fibrer i ett pulver – en skopa i morgonsmoothien.",
    desc: "Vetegräs, korngräs, spenat, grönkål, spirulina, chlorella, blåbär och inulin. Alla råvaror är ekologiska.",
    claims: [], keywords: "greens grönt pulver smoothie",
    ingredients: "Ekologiskt: korngräspulver, vetegräspulver (glutenfritt), spenatpulver, grönkålspulver, inulin, spirulina, chlorella, blåbärspulver, äppelpulver, broccolipulver, citronmeliss, mynta, ingefära med flera.",
    nutrition: { macro: { cols: ["100 g", "10 g"], rows: [["Energi", "1 340 kJ / 322 kcal", "134 kJ / 32 kcal"], ["Fett", "4,0 g", "0,4 g"], ["varav mättat fett", "0,8 g", "0,1 g", 1], ["Kolhydrat", "36 g", "3,6 g"], ["varav sockerarter", "12 g", "1,2 g", 1], ["Fiber", "28 g", "2,8 g"], ["Protein", "22 g", "2,2 g"], ["Salt", "0,6 g", "0,06 g"]] } },
    usage: "Blanda 10 g i vatten, juice eller smoothie.", warn: ""
  });
  add({
    id: "p50", slug: "q10-100", name: "Q10 100 mg", brand: "karna", cat: "superfoods",
    goals: ["energi", "hjarta-hjarna"], form: "kapslar", label: "Q10", sub: "100 mg", dose: "1 kapsel",
    diets: ["glutenfri", "laktosfri"], badges: [], rating: 4.5, reviews: 402, sold: 2000, stock: 90, added: "2025-01-15",
    variants: [{ id: "60", label: "60 kapslar", price: 229, servings: 60, count: 60 }],
    short: "Koenzym Q10 löst i olja i mjuk gelkapsel.",
    desc: "Q10 är fettlösligt och därför löst i olja. Kroppen bildar själv Q10, men produktionen minskar med åldern.",
    claims: [], keywords: "q10 koenzym ubikinon",
    ingredients: "Solrosolja, kapselhölje (gelatin från nötkreatur, glycerol), koenzym Q10 (ubikinon), emulgeringsmedel (solroslecitin).",
    nutrition: { per: "1 kapsel", rows: [["Koenzym Q10", 100, "mg"]] },
    usage: "1 kapsel per dag i samband med måltid.", warn: "Personer som behandlas med blodförtunnande läkemedel ska rådgöra med läkare före användning."
  });
  add({
    id: "p51", slug: "rosenrot-200", name: "Rosenrot 200 mg", brand: "vildgron", cat: "superfoods",
    goals: ["energi"], form: "kapslar", label: "ROSENROT", sub: "Rhodiola", dose: "1 kapsel",
    diets: ["vegan", "glutenfri", "laktosfri"], badges: [], rating: 4.3, reviews: 180, sold: 800, stock: 0, added: "2025-09-09",
    variants: [{ id: "60", label: "60 kapslar", price: 179, servings: 60, count: 60 }],
    short: "Extrakt av rosenrot, en växt som traditionellt använts i Norden och Sibirien.",
    desc: "Extraktet är standardiserat till 3 % rosaviner och 1 % salidrosid.",
    claims: [], keywords: "rhodiola rosenrot adaptogen ört",
    ingredients: "Rosenrotsextrakt (Rhodiola rosea), kapselhölje (hydroxipropylmetylcellulosa).",
    nutrition: { per: "1 kapsel", rows: [["Rosenrotsextrakt", 200, "mg"], ["varav rosaviner", 6, "mg"], ["varav salidrosid", 2, "mg"]] },
    usage: "1 kapsel per dag på morgonen.", warn: `${W.pregnant} ${W.meds}`
  });

  /* ---------- Barn ---------- */
  add({
    id: "p52", slug: "d-vitamin-droppar-barn", name: "D-vitamin Droppar Barn", brand: "norrvital", cat: "barn",
    goals: ["immunforsvar", "leder"], form: "droppar", label: "D-DROPPAR", sub: "Barn 0–2 år", dose: "5 droppar",
    diets: ["glutenfri", "laktosfri", "sockerfri", "svensk"], badges: ["bastsaljare"], campaign: "3for2", rating: 4.9, reviews: 880, sold: 5100, stock: 230, added: "2024-12-01",
    variants: [{ id: "10ml", label: "10 ml", price: 89, servings: 60, ml: 10 }],
    short: "D-vitamindroppar enligt Livsmedelsverkets råd för barn upp till två år.",
    desc: "Livsmedelsverket rekommenderar att alla barn får 10 µg D-vitamin per dag från en veckas ålder till två år. Dropparna är smaklösa och kan ges direkt i munnen eller på en sked.",
    claims: [C.kidsD], keywords: "bebis spädbarn d-droppar barn",
    ingredients: "MCT-olja (från kokos), kolekalciferol (vitamin D3), antioxidationsmedel (tokoferolrikt extrakt).",
    nutrition: { per: "5 droppar", rows: [["d", 10]] },
    usage: "5 droppar per dag direkt i munnen eller på en sked.", warn: W.kids.replace("Ej lämplig för barn under 3 år. ", "")
  });
  add({
    id: "p53", slug: "multivitamin-barn-tugg", name: "Multivitamin Barn Tugg", brand: "norrvital", cat: "barn",
    goals: ["immunforsvar"], form: "tuggtabletter", label: "MULTI BARN", sub: "Från 4 år", dose: "1 tuggtablett",
    diets: ["glutenfri", "laktosfri", "svensk"], badges: [], campaign: "3for2", rating: 4.7, reviews: 433, sold: 2500, stock: 120, added: "2025-08-15",
    variants: [{ id: "60", label: "60 tuggtabletter", price: 119, servings: 60, count: 60 }],
    flavors: ["Hallon", "Päron"],
    short: "Tuggtablett med 13 vitaminer och mineraler i barnanpassade doser.",
    desc: "Formade som små djur och sötade med xylitol. Doserna motsvarar ungefär halva referensintaget för vuxna.",
    claims: [C.d[0], "Vitamin D behövs för normal tillväxt och utveckling av skelettet hos barn."], keywords: "barn multivitamin tuggtablett",
    ingredients: "Sötningsmedel (xylitol, sorbitol), L-askorbinsyra, arom, surhetsreglerande medel (citronsyra), zinkcitrat, DL-alfa-tokoferylacetat, nikotinamid, retinylacetat, pyridoxinhydroklorid, riboflavin, tiaminmononitrat, pteroylmonoglutaminsyra, kaliumjodid, D-biotin, kolekalciferol, cyanokobalamin.",
    nutrition: { per: "1 tuggtablett", rows: [["a", 400], ["d", 10], ["e", 6], ["c", 40], ["b1", 0.55], ["b2", 0.7], ["b3", 8], ["b6", 0.7], ["b9", 100], ["b12", 1.25], ["b7", 25], ["zn", 5], ["i", 75]] },
    usage: "Barn från 4 år: 1 tuggtablett per dag.", warn: `${W.kids} Överdriven konsumtion kan ha laxerande effekt.`
  });
  add({
    id: "p54", slug: "omega-3-barn-flytande", name: "Omega-3 Barn Flytande", brand: "polarlin", cat: "barn",
    goals: ["hjarta-hjarna"], form: "flytande", label: "OMEGA BARN", sub: "Apelsin", dose: "5 ml",
    diets: ["glutenfri", "laktosfri"], badges: [], rating: 4.6, reviews: 267, sold: 1400, stock: 60, added: "2026-01-20",
    variants: [{ id: "150", label: "150 ml", price: 159, servings: 30, ml: 150 }],
    flavors: ["Apelsin"],
    short: "Fiskolja med apelsinsmak som barn faktiskt vill ta.",
    desc: "En tesked ger 250 mg DHA och 5 µg D-vitamin. Kan blandas i yoghurt eller smoothie.",
    claims: [C.dha, C.kidsD], keywords: "barn fiskolja omega dha",
    ingredients: "Fiskolja, naturlig apelsinarom, antioxidationsmedel (tokoferolrikt extrakt), kolekalciferol.",
    nutrition: { per: "5 ml", rows: [["DHA", 250, "mg"], ["EPA", 150, "mg"], ["d", 5]] },
    usage: "Barn från 3 år: 5 ml per dag. Förvaras i kylskåp efter öppning.", warn: `${W.fish} ${W.kids}`
  });

  /* ---------- Paket ---------- */
  add({
    id: "p55", slug: "immunpaketet", name: "Immunpaketet", brand: "norrvital", cat: "paket",
    goals: ["immunforsvar"], form: "paket", label: "IMMUN", sub: "D3 · C · Zink", dose: "Se respektive produkt",
    diets: ["glutenfri", "laktosfri", "svensk"], badges: [], rating: 4.8, reviews: 318, sold: 2300, stock: 80, added: "2026-09-28",
    variants: [{ id: "1", label: "3 produkter", price: 249, was: 307, servings: 90, count: 1 }],
    bundle: [["p01", "90"], ["p03", "100"], ["p13", "100"]],
    short: "D3-vitamin, C-vitamin och zink – höstens trio till paketpris.",
    desc: "Tre basprodukter med godkända påståenden om immunsystemets normala funktion. Räcker i ungefär tre månader.",
    claims: [C.d[0], C.c[0], C.zn[0]], keywords: "paket förkylning höst vinter immun",
    ingredients: "Se respektive produkt i paketet.", nutrition: null,
    usage: "Se respektive produkt.", warn: ""
  });
  add({
    id: "p56", slug: "traningspaketet", name: "Träningspaketet", brand: "styrka", cat: "paket",
    goals: ["muskler"], form: "paket", label: "TRÄNING", sub: "Whey + Kreatin", dose: "Se respektive produkt",
    diets: ["glutenfri", "dopingtestad"], badges: [], rating: 4.8, reviews: 540, sold: 3900, stock: 70, added: "2025-10-05",
    variants: [{ id: "1", label: "2 produkter", price: 499, was: 548, servings: 33, count: 1 }],
    bundle: [["p22", "1kg"], ["p28", "500g"]],
    flavors: ["Choklad", "Vanilj", "Jordgubb"],
    short: "Whey 80 (1 kg) och Kreatin Monohydrat (500 g) – grunden för styrketräning.",
    desc: "Det enklaste och bäst dokumenterade upplägget för dig som tränar styrka. Välj smak på proteinet.",
    claims: [C.protein[0], C.kreatin], keywords: "paket gym protein kreatin start",
    ingredients: "Se respektive produkt i paketet.", nutrition: null,
    usage: "Se respektive produkt.", warn: W.milk
  });
  add({
    id: "p57", slug: "baspaketet", name: "Baspaketet", brand: "norrvital", cat: "paket",
    goals: ["immunforsvar", "hjarta-hjarna", "energi"], form: "paket", label: "BAS", sub: "Multi · Omega · D3", dose: "Se respektive produkt",
    diets: ["glutenfri", "laktosfri"], badges: ["bastsaljare"], rating: 4.7, reviews: 690, sold: 4600, stock: 95, added: "2025-09-20",
    variants: [{ id: "1", label: "3 produkter", price: 349, was: 397, servings: 60, count: 1 }],
    bundle: [["p06", "100"], ["p18", "120"], ["p01", "90"]],
    short: "Multivitamin, omega-3 och D3 – den vanligaste kombinationen bland våra kunder.",
    desc: "En bred bas för vardagen. Paketet räcker i två till tre månader beroende på produkt.",
    claims: [C.d[0], C.epa], keywords: "paket bas start grund",
    ingredients: "Se respektive produkt i paketet.", nutrition: null,
    usage: "Se respektive produkt.", warn: `${W.iron} ${W.fish}`
  });

  window.CATALOG = { RI, categories, goals, brands, diets, forms, products: P };
})();
