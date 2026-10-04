# Sundla – webbshop för kosttillskott

En komplett webbshop för kosttillskott, byggd med ren HTML, CSS och JavaScript. Den behöver inget byggsteg och inga beroenden.

## Kom igång

Öppna `index.html` direkt i webbläsaren, eller starta en lokal server:

```sh
cd kosttillskott
npx serve .        # eller: python3 -m http.server
```

Mappen kan publiceras som den är på valfri statisk host, till exempel Netlify, Vercel, GitHub Pages eller S3.

## Funktioner

**Sortiment och navigering**
- 57 produkter i 12 kategorier (vitaminer, mineraler, omega-3, protein, träning, sömn, mage, hud/hår, leder, superfoods, barn, paket) och 5 varumärken
- Handla efter mål (immunförsvar, energi, sömn, muskler, uthållighet, hjärta, kvinnohälsa …)
- Sök med förslag medan du skriver, tangentbordsnavigering och tolerans för å/ä/ö
- Filter med antal per val: kategori, mål, kost (vegansk, glutenfri, laktosfri, sockerfri, eko, svensktillverkad, dopingtestad), form, märke, pris, betyg, lager och rea
- Sortering: populärast, betyg, pris, **pris per dagsdos**, nyast och namn. Rutnät eller lista, samt "Visa fler"
- Sidor för kampanjer, nyheter och varumärken

**Produktsida**
- Storlekar och smaker, engångsköp eller **prenumeration (−10 %)** med intervall
- Pris per dagsdos, jämförpris (kr/kg, kr/l, kr/st) och "lägsta pris 30 dagar" vid rea (Omnibus-direktivet)
- Näringsdeklaration med automatiskt beräknad %RI, ingredienslista med fetmarkerade allergener, dosering och varningar
- Enbart EU-godkända hälsopåståenden (förordning 1924/2006)
- Lagerstatus, "Få kvar", bevakning när varan är slut och nedräkning till dagens leveransstopp
- "Köps ofta tillsammans", liknande produkter, senast visade och omdömen med betygsfördelning, sortering och möjlighet att skriva eget omdöme

**Varukorg och kassa**
- Varukorg som sidopanel och som egen sida, med "ångra" när en vara tas bort
- Kampanjen 3 för 2 på vitaminer, rabattkoder (`VALKOMMEN10`, `SUNDLA20`, `TRANING15`, `FRIFRAKT`) och mätare för fri frakt
- Kassa i en vy: kontaktuppgifter, adress, fyra leveranssätt med beräknat leveransdatum och fyra betalsätt (kort, Swish, faktura, delbetalning)
- Validering av e-post, svenskt mobilnummer, postnummer och kortnummer (Luhn), med tydliga felmeddelanden
- Orderbekräftelse med orderstatus, moms och leveransinformation

**Övrigt**
- Mina sidor: ordrar (med "Köp igen"), prenumerationer (pausa och återuppta), favoriter, bevakningar och sparade uppgifter
- Jämför upp till 4 produkter sida vid sida
- Tillskottsguide (quiz) som föreslår produkter utifrån mål, kost, form och budget
- Infosidor: om oss, kundservice med vanliga frågor och kontaktformulär, frakt, returer, köpvillkor, integritet och cookies
- Cookie-banner med val, ljust och mörkt tema, responsiv design och tillgänglighet (tangentbord, skärmläsare, `prefers-reduced-motion`)

All data (varukorg, ordrar, favoriter med mera) sparas i webbläsarens `localStorage`.

## Filstruktur

```
index.html          Sidans skal: header, ikoner, lådor och skript
css/styles.css      All styling, inklusive färgtokens för ljust och mörkt läge
js/config.js        Butiksnamn, moms, frakt, betalsätt och rabattkoder
js/products.js      Kategorier, mål, varumärken och alla produkter
js/store.js         Tillstånd, lagring och prisberäkning (3 för 2, koder, frakt, moms)
js/ui.js            Produktbilder (SVG), produktkort och andra komponenter
js/views.js         Alla sidvyer
js/app.js           Router, händelser, sök och kassaflöde
```

## Anpassa

- **Butiksuppgifter, frakt, betalsätt och koder:** ändra i `js/config.js`.
- **Produkter:** lägg till eller ändra i `js/products.js`. Näringsrader anges som `["d", 50]` (nyckel i RI-tabellen och mängd), så räknas %RI ut automatiskt.
- **Färger och typsnitt:** ändra tokens överst i `css/styles.css`.

## Innan butiken går live

Butiken är i demoläge (`demo: true` i `config.js`). Inga betalningar dras och inga beställningar skickas. Det här behövs för att ta den i drift:

1. **Betalning:** ersätt `Payments.authorize` i `js/app.js` med en riktig leverantör (till exempel Stripe, Klarna, Adyen eller Swish Handel) via en egen server. Hantera aldrig kortnummer i egen kod; använd leverantörens betalformulär.
2. **Backend för ordrar och lager:** ordrar, lagersaldo och kundkonton sparas i dag bara i webbläsaren och behöver flyttas till en server eller en e-handelsplattform.
3. **Riktiga produkter:** byt ut exempelprodukterna, varumärkena och omdömena mot riktiga. Byt de genererade SVG-förpackningarna mot produktfoton om du vill.
4. **Juridik:** kontrollera köpvillkor, integritetspolicy och företagsuppgifter. Kontrollera momssatsen mot Skatteverket (livsmedelsmomsen är tillfälligt 6 % från 1 april 2026 till 31 december 2027, annars 12 %). Den som säljer kosttillskott behöver registrera verksamheten som livsmedelsföretag hos kommunen, och märkning och hälsopåståenden ska följa Livsmedelsverkets regler.
5. **E-post:** koppla orderbekräftelser, nyhetsbrev och kontaktformuläret till en e-posttjänst.
6. Sätt `demo: false` i `js/config.js`.
