# Veerenstael KPI Tool - Wijzigingen Overzicht

## Laatste Update (December 2024)

### Samenvatting wijzigingen:
1. ✓ Emojis verwijderd (📚, 🔧, 💡)
2. ✓ Font aangepast naar Roboto
3. ✓ Tekst kleuren aangepast naar gebroken wit (#FBF5EC)
4. ✓ MMT formule tekst aangepast naar "Totale Onderhoudstijd"
5. ✓ Volgorde PM invoervelden omgedraaid
6. ✓ Standaard bedrijfstijd aangepast naar 20.000 uur

---

## Belangrijkste Wijzigingen

### 1. HTML (index.html)
**Wat is aangepast:**
- Emojis verwijderd:
  - "📚 Definities" → "Definities"
  - "🔧 Repareerbaar" → "Repareerbaar"
  - "💡 Niet-repareerbaar" → "Niet-repareerbaar"
- Standaardwaarde aangepast:
  - Totale bedrijfstijd: 200.000 → 20.000 uur
- Volgorde invoervelden aangepast:
  - "Aantal keer PM uitgevoerd" staat nu VOOR "Totale geplande onderhoudstijd"
- MMT formule tekst:
  - "[PM + Detect + Repair tijd]" → "[Totale Onderhoudstijd]"
- Google Fonts link toegevoegd voor Roboto font

### 2. CSS (style.css)
**Wat is aangepast:**
- Font-family aangepast naar Roboto:
  - `font-family: 'Roboto', 'Inter', Arial, sans-serif;`
- Tekst kleuren aangepast naar gebroken wit (#FBF5EC):
  - Alle #e0e6f0 → #FBF5EC
  - Alle #d0dae8 → #FBF5EC
  - Alle #b8c7e0 → #FBF5EC

### 3. JavaScript (main.js)
**Wat is aangepast:**
- SVG fill colors aangepast naar gebroken wit (#FBF5EC):
  - In interactieve diagram voor MTBF/MTTF labels
  - In KPI info box teksten
  - In timeline markers en labels

---

## Visuele Veranderingen

### Voor:
- Emojis bij labels (📚, 🔧, 💡)
- Inter font
- Blauwachtige witte tekst kleuren
- Totale bedrijfstijd standaard: 200.000 uur

### Na:
- Geen emojis, alleen tekst
- Roboto font (met Inter als fallback)
- Gebroken wit (#FBF5EC) voor alle teksten
- Totale bedrijfstijd standaard: 20.000 uur
- PM velden logische volgorde (aantal eerst, dan tijd)

---

## Veerenstael Huisstijl Kleuren

**Hoofdkleuren:**
- ZWART: #1D1D1B
- WIT: #FFFFFF
- Veerenstael BLAUW: #2A6085
- OFF WHITE: #FBF5EC ✓ (gebruikt voor alle teksten)

**Secundaire kleuren:**
- TERRACOTTA: #B0543B (knoppen)
- OFF BLUE: #BFD4DA
- OFF YELLOW: #E0A943 (MMT bracket)

---

## Technische Details

### Formulevereenvoudiging
De MMT formule is nu duidelijker:
```
Oud: MMT = [PM + Detect + Repair tijd] / ([Aantal keer PM] + [Aantal falen])
Nieuw: MMT = [Totale Onderhoudstijd] / ([Aantal keer PM] + [Aantal falen])
```

### Deployment
De tool werkt in:
- ✅ Lokale browser (file:// protocol)
- ✅ GitHub Pages
- ✅ Render.com
- ✅ Andere static hosting platforms

Geen server-side dependencies, alles client-side JavaScript.

---

## Bestandsoverzicht

- `index.html` - Hoofdbestand met formulier en resultaten (✓ aangepast)
- `main.js` - Berekeningslogica en SVG diagram (✓ aangepast)
- `style.css` - Styling met Roboto en gebroken wit (✓ aangepast)
- `logo-veerenstael-wit.png` - Logo (niet aangepast, door gebruiker beheerd)
- `favicon.png` - Favicon (niet aangepast, door gebruiker beheerd)
- `repareerbaar.jpg` - Diagram repareerbaar (niet aangepast)
- `nietrepareerbaar.jpg` - Diagram niet-repareerbaar (niet aangepast)
- `logowebsite.png` - Website logo voor PDF (niet aangepast)
- `logolinkedin.png` - LinkedIn logo voor PDF (niet aangepast)

---

## Aanpassingen voor GitHub

Upload de volgende bestanden naar je GitHub repository:
1. index.html (aangepast)
2. style.css (aangepast)
3. main.js (aangepast)
4. README.md (nieuw)

De logo's en afbeeldingen blijven ongewijzigd.
