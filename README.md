# Veerenstael KPI Tool - Wijzigingen Overzicht

## Samenvatting
De KPI Tool is aangepast om correct te werken met twee verschillende analysetypes:
1. **Repareerbaar** (systemen/machines)
2. **Niet-repareerbaar** (componenten)

## Belangrijkste Wijzigingen

### 1. HTML (index.html)
**Wat is aangepast:**
- Dubbele `<div class="input-group mtbf-group">` verwijderd (was een bug)
- CSS klassen toegevoegd voor betere visibility control:
  - `.mtbf-related` - voor MTBF, MTTR, MTBM, MCMT
  - `.availability-related` - voor Beschikbaarheid velden
  - `.lambda-related` - voor Failure Rate en FIT
- Formule velden nu dynamisch met IDs:
  - `id="availFormulaNumerator"` en `id="availFormulaDenominator"`
  - `id="lambdaFormulaNumerator"` en `id="lambdaFormulaDenominator"`

### 2. JavaScript (main.js)
**Kernfunctie `compute(v, isRepairable)` - Volledig herzien:**

#### Voor REPAREERBARE systemen:
```javascript
- MTTF = Totale bedrijfstijd van alle items / Aantal falende items
- MTBF = Totale bedrijfstijd / Aantal storingen
- MTTR = Totale reparatietijd / Aantal reparaties
- Beschikbaarheid [A] = MTBF / (MTBF + MTTR)
- Failure Rate [λ] = 1 / MTBF
- FIT = λ × 10⁹
- MTBM = Totale bedrijfstijd / (Geplande + Ongeplande acties)
- MCMT = Totale hersteltijd / Aantal ongeplande acties
```

#### Voor NIET-REPAREERBARE componenten:
```javascript
- MTTF = Totale bedrijfstijd van alle items / Aantal falende items
- MTBF = MTTF (identiek voor niet-repareerbaar)
- MTTR = NaN (niet van toepassing)
- Beschikbaarheid [A] = NaN (niet van toepassing)
- Failure Rate [λ] = 1 / MTTF
- FIT = λ × 10⁹
- MTBM = NaN (niet van toepassing)
- MCMT = NaN (niet van toepassing)
```

**Functie `updateUI(r, isRepairable)` - Uitgebreid:**
- Voegt nu visibility logica toe
- Toont/verbergt velden op basis van `isRepairable`
- Past formule-teksten dynamisch aan:
  - Repareerbaar: "λ = 1 / MTBF"
  - Niet-repareerbaar: "λ = 1 / MTTF"

**Alle compute() aanroepen aangepast:**
- Submit handler: `compute(inputs, isRepairable)`
- Unit selector: `compute(inputs, isRepairable)`
- Toggle handler: `compute(inputs, isRepairable)`
- PDF export: `compute(inputs, isRepairable)`
- Initialisatie: `compute(initVals, initIsRepairable)`

### 3. CSS (style.css)
**Geen wijzigingen nodig** - Bestaande klassen werken correct met de nieuwe HTML structuur.

## Gedrag van de Tool

### Bij opstarten:
- Standaard geselecteerd: **Repareerbaar**
- Alle velden zichtbaar
- MTBF sectie zichtbaar in formulier

### Bij selectie "Niet-repareerbaar":
- MTBF invoervelden worden verborgen
- In resultaten worden MTBF, MTTR, MTBM, MCMT en Beschikbaarheid verborgen
- Alleen MTTF, Failure Rate en FIT blijven zichtbaar
- Formules passen zich aan
- Visualisatie toont vereenvoudigd diagram

### Bij selectie "Repareerbaar":
- Alle velden worden getoond
- Volledige berekeningen actief
- Uitgebreide visualisatie

## Technische Details

### Formule Correctheid
De implementatie volgt exact de opgegeven wiskundige formules:

**MTTF (beide types):**
```
MTTF = Totale gebruiksduur / Aantal falen
```

**MTBF (repareerbaar):**
```
MTBF = Totale gebruiksduur / Aantal falen (tijdens operationele tijd)
```

**MTBF (niet-repareerbaar):**
```
MTBF = MTTF
```

**Failure Rate:**
- Repareerbaar: `λ = 1 / MTBF`
- Niet-repareerbaar: `λ = 1 / MTTF`

### Deployment
De tool werkt in:
- ✅ Lokale browser (file:// protocol)
- ✅ GitHub Pages
- ✅ Render.com
- ✅ Andere static hosting platforms

Geen server-side dependencies, alles client-side JavaScript.

## Testing Checklist

- [x] Toggle tussen repareerbaar/niet-repareerbaar werkt
- [x] MTBF velden worden correct getoond/verborgen
- [x] Berekeningen zijn correct voor beide types
- [x] Resultaten tonen juiste velden per type
- [x] Formules passen zich aan
- [x] Visualisatie past zich aan
- [x] PDF export werkt voor beide types
- [x] Unit conversie (uren/dagen/jaren) werkt
- [x] Validatie werkt correct

## Belangrijke Notities

1. **Favicon en Logo:** Deze worden NIET nagemaakt door de tool, zoals gevraagd. Upload deze zelf naar GitHub.

2. **Excel export:** Staat in het Engels met puntkomma (;) als separator.

3. **Browser compatibility:** Werkt in moderne browsers (Chrome, Firefox, Safari, Edge).

4. **Responsive:** Tool is volledig responsive en werkt op mobile devices.

## Bestandsoverzicht

- `index.html` - Hoofdbestand met formulier en resultaten
- `main.js` - Alle berekeningslogica en event handlers
- `style.css` - Styling (geen wijzigingen)
- `logo-veerenstael-wit.png` - Te uploaden door gebruiker
- `favicon.png` - Te uploaden door gebruiker
