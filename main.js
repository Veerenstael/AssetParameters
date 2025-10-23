// KPI & Betrouwbaarheid Tool
(function () {
  // Conversieconstanten
  const HOURS_PER_DAY = 24;
  const HOURS_PER_YEAR = 365.25 * 24;

  // KPI Definities - consistent uitgelegd
  const kpiDefinitions = {
    mttf: {
      title: 'MTTF - Mean Time To Failure (Gemiddelde Tijd Tot Falen)',
      text: '<strong>Wat het is:</strong> MTTF meet de gemiddelde tijd totdat een niet-repareerbaar component faalt. Dit is de verwachte levensduur van items die na een storing vervangen worden (zoals lampen, batterijen of wegwerponderdelen). <strong>Waarom belangrijk:</strong> MTTF helpt bij het inschatten van de levensduur van componenten en het plannen van vervangingsmomenten. Een hogere MTTF betekent dat onderdelen langer meegaan. <strong>Interpretatie:</strong> Bij een MTTF van 20.000 uur verwacht je dat een component gemiddeld 20.000 uur meegaat voordat deze moet worden vervangen.'
    },
    mtbf: {
      title: 'MTBF - Mean Time Between Failures (Gemiddelde Tijd Tussen Storingen)',
      text: '<strong>Wat het is:</strong> MTBF meet de gemiddelde tijd tussen opeenvolgende storingen van een repareerbaar systeem. Dit geeft aan hoe vaak een machine of installatie uitvalt tijdens de bedrijfstijd. <strong>Waarom belangrijk:</strong> MTBF is een cruciale maatstaf voor de betrouwbaarheid van productiemiddelen. Een hogere MTBF betekent minder frequente storingen en stabielere productie. <strong>Interpretatie:</strong> Een MTBF van 5.000 uur betekent dat je gemiddeld elke 5.000 draaiuren een storing verwacht. Dit helpt bij het plannen van onderhoud en het optimaliseren van productieprocessen.'
    },
    mttr: {
      title: 'MTTR - Mean Time To Repair (Gemiddelde Hersteltijd)',
      text: '<strong>Wat het is:</strong> MTTR meet de gemiddelde tijd die nodig is om een storing te herstellen, van het moment dat de storing wordt gedetecteerd tot het moment dat het systeem weer operationeel is. <strong>Waarom belangrijk:</strong> MTTR is direct gekoppeld aan de productiviteit: hoe korter de hersteltijd, hoe minder productieverliezen. Dit geeft inzicht in de effectiviteit van uw onderhoudsorganisatie. <strong>Interpretatie:</strong> Een MTTR van 8 uur betekent dat storingen gemiddeld binnen 8 uur zijn opgelost. Verlaging van MTTR kan door betere reserveonderdelenvoorraad, training van technici of verbeterde diagnostiek.'
    },
    availability: {
      title: 'Beschikbaarheid [A] - Availability (Beschikbaarheidsgraad)',
      text: '<strong>Wat het is:</strong> Beschikbaarheid geeft aan welk percentage van de tijd een systeem operationeel en beschikbaar is voor productie. Het is de verhouding tussen de tijd dat het systeem werkt en de totale tijd (inclusief stilstand). <strong>Waarom belangrijk:</strong> Beschikbaarheid is een directe maatstaf voor productiecapaciteit en efficiency. Een hogere beschikbaarheid betekent meer productietijd en hogere output. <strong>Interpretatie:</strong> Een beschikbaarheid van 95% betekent dat de installatie 95% van de tijd productieklaar is en 5% stilstaat voor onderhoud of storing. Voor kritieke processen streeft men vaak naar >99% beschikbaarheid.'
    },
    lambda: {
      title: 'Failure Rate [λ] - Storingsfrequentie (Faalkans)',
      text: '<strong>Wat het is:</strong> De failure rate (λ, lambda) geeft het aantal storingen per tijdseenheid weer. Het is het omgekeerde van MTBF en drukt uit hoe vaak storingen optreden. <strong>Waarom belangrijk:</strong> Lambda wordt gebruikt in betrouwbaarheidsberekeningen en helpt bij het vergelijken van verschillende systemen of componenten. Een lagere lambda betekent een betrouwbaarder systeem. <strong>Interpretatie:</strong> Een λ van 0,0002 per uur betekent 0,02% kans op storing per uur, oftewel gemiddeld één storing per 5.000 uur. Dit wordt vaak gebruikt in probabilistische analyses en veiligheidsberekeningen.'
    },
    fit: {
      title: 'FIT - Failures In Time (Storingen per Miljard Uur)',
      text: '<strong>Wat het is:</strong> FIT is een gestandaardiseerde maat voor betrouwbaarheid die het aantal storingen per miljard (10⁹) bedrijfsuren weergeeft. Het is een praktische manier om zeer betrouwbare systemen te vergelijken. <strong>Waarom belangrijk:</strong> FIT is vooral nuttig bij elektronische componenten en systemen waar storingen zeldzaam zijn. Het maakt vergelijking tussen leveranciers en producten eenvoudiger. <strong>Interpretatie:</strong> Een FIT van 200 betekent 200 storingen per miljard uur, oftewel gemiddeld één storing per 5 miljoen uur. FIT-waarden worden vaak door fabrikanten opgegeven voor kwaliteitsgaranties.'
    },
    mtbm: {
      title: 'MTBM - Mean Time Between Maintenance (Gemiddelde Tijd Tussen Onderhoud)',
      text: '<strong>Wat het is:</strong> MTBM meet de gemiddelde tijd tussen alle onderhoudsacties (zowel gepland preventief onderhoud als ongepland correctief onderhoud). Dit geeft de totale onderhoudsfrequentie weer. <strong>Waarom belangrijk:</strong> MTBM helpt bij het plannen van onderhoudsresources en capaciteit. Het toont de totale onderhoudslast van een systeem en helpt bij het optimaliseren van onderhoudsstrategieën. <strong>Interpretatie:</strong> Een MTBM van 1.000 uur betekent dat er gemiddeld elke 1.000 uur een onderhoudsactie plaatsvindt. Door preventief onderhoud te optimaliseren kan MTBM worden verlengd en ongepland onderhoud verminderd.'
    },
    mcmt: {
      title: 'MCMT - Mean Corrective Maintenance Time (Gemiddelde Correctieve Onderhoudstijd)',
      text: '<strong>Wat het is:</strong> MCMT meet de gemiddelde tijd die nodig is voor correctief (ongepland) onderhoud per storing. Dit is vergelijkbaar met MTTR maar focust specifiek op correctieve acties. <strong>Waarom belangrijk:</strong> MCMT geeft inzicht in de complexiteit en impact van ongeplande storingen. Een hoge MCMT duidt op complexe of moeilijk toegankelijke problemen die veel tijd kosten. <strong>Interpretatie:</strong> Een MCMT van 6 uur betekent dat ongeplande reparaties gemiddeld 6 uur duren. Verlaging kan door betere foutdiagnose, training, of technische verbeteringen aan de installatie.'
    }
  };

  // Helpers voor weergave
  const nf = (d = 2) =>
    new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pf = (d = 4) =>
    new Intl.NumberFormat('nl-NL', { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d });

  const fmtNum = (x, d = 2) => (isFinite(x) ? nf(d).format(x) : '—');
  const fmtPct = (x, d = 4) => (isFinite(x) ? pf(d).format(x) : '—');
  const safeDiv = (num, den) => (den > 0 ? num / den : NaN);

  function toHours(value, unit) {
    if (!isFinite(value)) return NaN;
    switch (unit) {
      case 'hours': return value;
      case 'days':  return value * HOURS_PER_DAY;
      case 'years': return value * HOURS_PER_YEAR;
      default:      return NaN;
    }
  }

  function fromHours(hours, unit) {
    if (!isFinite(hours)) return NaN;
    switch (unit) {
      case 'hours': return hours;
      case 'days':  return hours / HOURS_PER_DAY;
      case 'years': return hours / HOURS_PER_YEAR;
      default:      return NaN;
    }
  }

  function getUnitLabel(unit) {
    switch (unit) {
      case 'hours': return 'uur';
      case 'days':  return 'dagen';
      case 'years': return 'jaren';
      default:      return 'uur';
    }
  }

  // Definitie knoppen - interactieve uitleg
  document.querySelectorAll('.def-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const kpi = this.dataset.kpi;
      const explanation = document.getElementById('def-explanation');
      const content = document.querySelector('.def-content');
      
      // Toggle active state
      const wasActive = this.classList.contains('active');
      document.querySelectorAll('.def-btn').forEach(b => b.classList.remove('active'));
      
      if (wasActive) {
        explanation.hidden = true;
      } else {
        this.classList.add('active');
        content.innerHTML = `<h4>${kpiDefinitions[kpi].title}</h4><p>${kpiDefinitions[kpi].text}</p>`;
        explanation.hidden = false;
      }
    });
  });

  // Lezen & normaliseren naar uren
  function readInputs() {
    const totItemsValue = parseFloat(document.getElementById('totItemsValue').value);
    const totItemsUnit  = document.getElementById('totItemsUnit').value;
    const totHoursValue = parseFloat(document.getElementById('totHoursValue').value);
    const totHoursUnit  = document.getElementById('totHoursUnit').value;

    return {
      totItemsHours: toHours(totItemsValue, totItemsUnit), // uren
      totItemsValue: totItemsValue,
      totItemsUnit: totItemsUnit,
      failedItems: parseFloat(document.getElementById('failedItems').value),
      totHours: toHours(totHoursValue, totHoursUnit),       // uren
      totHoursValue: totHoursValue,
      totHoursUnit: totHoursUnit,
      failures: parseFloat(document.getElementById('failures').value),
      totRepairHours: parseFloat(document.getElementById('totRepairHours').value), // in uren
      pmCount: parseFloat(document.getElementById('pmCount').value),
      cmCount: parseFloat(document.getElementById('cmCount').value),
    };
  }

  function validate(v) {
    const warn = document.getElementById('warn');
    const msgs = [];

    if (v.totItemsHours < 0 || v.totHours < 0 || v.totRepairHours < 0) {
      msgs.push('Waarschuwing: negatieve tijden zijn niet toegestaan.');
    }
    if (v.failedItems < 0 || v.failures < 0 || v.pmCount < 0 || v.cmCount < 0) {
      msgs.push('Waarschuwing: negatieve aantallen zijn niet toegestaan.');
    }
    if (v.totRepairHours > v.totHours && v.totHours > 0) {
      msgs.push('Let op: totale hersteltijd is groter dan totale bedrijfstijd. Controleer de meetperiode.');
    }

    if (msgs.length) {
      warn.hidden = false;
      warn.innerHTML = msgs.join(' ');
    } else {
      warn.hidden = true;
      warn.textContent = '';
    }
  }

  // Kernberekeningen
  function compute(v) {
    const MTTF = safeDiv(v.totItemsHours, v.failedItems); // niet-repareerbaar perspectief
    const MTBF = safeDiv(v.totHours, v.failures);         // repareerbaar perspectief
    const MTTR = safeDiv(v.totRepairHours, v.failures);   // herstel per storing

    const availability = (isFinite(MTBF) && isFinite(MTTR) && MTBF > 0 && MTTR >= 0)
      ? MTBF / (MTBF + MTTR)
      : NaN;

    const lambda = safeDiv(v.failures, v.totHours);       // storingen per uur
    const FIT = isFinite(lambda) ? lambda * 1e9 : NaN;    // per 10^9 uur

    const totalMaint = v.pmCount + v.cmCount;
    const MTBM = safeDiv(v.totHours, totalMaint);         // tijd tussen onderhoud
    const MCMT = safeDiv(v.totRepairHours, v.cmCount);    // gemiddelde duur correctief

    return { MTTF, MTBF, MTTR, availability, lambda, FIT, MTBM, MCMT };
  }

  // UI bijwerken
  function updateUI(r) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    // Converteer waarden naar geselecteerde eenheid
    document.getElementById('outMTTF').textContent = fmtNum(fromHours(r.MTTF, resultUnit), 2);
    document.getElementById('outMTBF').textContent = fmtNum(fromHours(r.MTBF, resultUnit), 2);
    document.getElementById('outMTTR').textContent = fmtNum(fromHours(r.MTTR, resultUnit), 2);
    document.getElementById('outA').textContent    = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 6);
    document.getElementById('outFIT').textContent    = fmtNum(r.FIT, 2);
    document.getElementById('outMTBM').textContent   = fmtNum(fromHours(r.MTBM, resultUnit), 2);
    document.getElementById('outMCMT').textContent   = fmtNum(fromHours(r.MCMT, resultUnit), 2);
    
    // Update eenheidslabels
    document.getElementById('unitMTTF').textContent = unitLabel;
    document.getElementById('unitMTBF').textContent = unitLabel;
    document.getElementById('unitMTTR').textContent = unitLabel;
    document.getElementById('unitMTBM').textContent = unitLabel;
    document.getElementById('unitMCMT').textContent = unitLabel;
  }

  // Grafiek: alleen MTTF, MTTR, MTBM, MTBF (bars, één as in uren)
  let chart;
  function updateChart(r) {
    const ctx = document.getElementById('kpiChart').getContext('2d');
    const labels = ['MTTF', 'MTTR', 'MTBM', 'MTBF'];
    const data = [r.MTTF, r.MTTR, r.MTBM, r.MTBF];

    const config = {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Uren',
          data,
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.dataset.label}: ${nf(2).format(ctx.parsed.y)} uur`,
            }
          }
        },
        scales: {
          y: {
            title: { display: true, text: 'Uren' },
            beginAtZero: true
          }
        }
      }
    };

    if (chart) {
      chart.data = config.data;
      chart.options = config.options;
      chart.update();
    } else {
      chart = new Chart(ctx, config);
    }
  }

  // PDF Export functionaliteit
  async function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const inputs = readInputs();
    const results = compute(inputs);
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    let yPos = 20;
    const leftMargin = 20;
    const pageWidth = 170;
    
    // Logo en header
    pdf.setFontSize(20);
    pdf.setTextColor(34, 44, 56);
    pdf.text('Veerenstael - Tooling', leftMargin, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(100, 100, 100);
    pdf.text('Betrouwbaarheids- en Onderhoudsparameters Analyse', leftMargin, yPos);
    yPos += 10;
    
    // Datum
    const dateStr = new Date().toLocaleDateString('nl-NL', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    pdf.setFontSize(9);
    pdf.text(`Gegenereerd op: ${dateStr}`, leftMargin, yPos);
    yPos += 15;
    
    // Input waarden
    pdf.setFontSize(14);
    pdf.setTextColor(34, 44, 56);
    pdf.text('Invoergegevens', leftMargin, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    
    const unitLabels = {
      hours: 'uren',
      days: 'dagen',
      years: 'jaren'
    };
    
    pdf.text(`• Totale bedrijfstijd van alle items: ${fmtNum(inputs.totItemsValue, 0)} ${unitLabels[inputs.totItemsUnit]}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`• Aantal falende items: ${fmtNum(inputs.failedItems, 0)}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`• Totale bedrijfstijd: ${fmtNum(inputs.totHoursValue, 0)} ${unitLabels[inputs.totHoursUnit]}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`• Aantal storingen: ${fmtNum(inputs.failures, 0)}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`• Totale hersteltijd: ${fmtNum(inputs.totRepairHours, 2)} uren`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`• Aantal geplande onderhoudsacties: ${fmtNum(inputs.pmCount, 0)}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`• Aantal ongeplande onderhoudsacties: ${fmtNum(inputs.cmCount, 0)}`, leftMargin + 5, yPos);
    yPos += 15;
    
    // Resultaten
    pdf.setFontSize(14);
    pdf.setTextColor(34, 44, 56);
    pdf.text('Berekende Resultaten', leftMargin, yPos);
    yPos += 8;
    
    pdf.setFontSize(10);
    pdf.setTextColor(60, 60, 60);
    
    pdf.text(`MTTF: ${fmtNum(fromHours(results.MTTF, resultUnit), 2)} ${unitLabel}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`MTBF: ${fmtNum(fromHours(results.MTBF, resultUnit), 2)} ${unitLabel}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`MTTR: ${fmtNum(fromHours(results.MTTR, resultUnit), 2)} ${unitLabel}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`Beschikbaarheid [A]: ${fmtPct(results.availability, 2)}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`Failure Rate [lambda]: ${fmtNum(results.lambda, 6)} per uur`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`FIT (Failures In Time): ${fmtNum(results.FIT, 2)} per 10^9 uur`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`MTBM: ${fmtNum(fromHours(results.MTBM, resultUnit), 2)} ${unitLabel}`, leftMargin + 5, yPos);
    yPos += 6;
    pdf.text(`MCMT: ${fmtNum(fromHours(results.MCMT, resultUnit), 2)} ${unitLabel}`, leftMargin + 5, yPos);
    yPos += 15;
    
    // Formules
    pdf.setFontSize(14);
    pdf.setTextColor(34, 44, 56);
    pdf.text('Berekeningsformules', leftMargin, yPos);
    yPos += 8;
    
    pdf.setFontSize(9);
    pdf.setTextColor(60, 60, 60);
    
    // MTTF
    pdf.text('MTTF = [Totale bedrijfstijd van alle items] / [Aantal falende items]', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(inputs.totItemsHours, 2)} / ${fmtNum(inputs.failedItems, 0)} = ${fmtNum(results.MTTF, 2)} uur`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('MTBF = [Totale bedrijfstijd] / [Aantal storingen]', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(inputs.totHours, 2)} / ${fmtNum(inputs.failures, 0)} = ${fmtNum(results.MTBF, 2)} uur`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('MTTR = [Totale hersteltijd] / [Aantal storingen]', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(inputs.totRepairHours, 2)} / ${fmtNum(inputs.failures, 0)} = ${fmtNum(results.MTTR, 2)} uur`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('Beschikbaarheid [A] = MTBF / (MTBF + MTTR)', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(results.MTBF, 2)} / (${fmtNum(results.MTBF, 2)} + ${fmtNum(results.MTTR, 2)}) = ${fmtPct(results.availability, 2)}`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('Failure Rate [λ] = [Aantal storingen] / [Totale bedrijfstijd]', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(inputs.failures, 0)} / ${fmtNum(inputs.totHours, 2)} = ${fmtNum(results.lambda, 6)} per uur`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('FIT = [λ] × 10^9', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(results.lambda, 6)} x 1.000.000.000 = ${fmtNum(results.FIT, 2)}`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('MTBM = [Totale bedrijfstijd] / ([Geplande acties] + [Ongeplande acties])', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(inputs.totHours, 2)} / (${fmtNum(inputs.pmCount, 0)} + ${fmtNum(inputs.cmCount, 0)}) = ${fmtNum(results.MTBM, 2)} uur`, leftMargin + 5, yPos);
    yPos += 7;
    
    pdf.setTextColor(60, 60, 60);
    pdf.text('MCMT = [Totale hersteltijd] / [Aantal ongeplande acties]', leftMargin + 5, yPos);
    yPos += 5;
    pdf.setTextColor(100, 100, 100);
    pdf.text(`      = ${fmtNum(inputs.totRepairHours, 2)} / ${fmtNum(inputs.cmCount, 0)} = ${fmtNum(results.MCMT, 2)} uur`, leftMargin + 5, yPos);
    yPos += 15;
    
    // Grafiek toevoegen
    const canvas = document.getElementById('kpiChart');
    const chartImage = canvas.toDataURL('image/png');
    pdf.addPage();
    yPos = 20;
    
    pdf.setFontSize(14);
    pdf.setTextColor(34, 44, 56);
    pdf.text('Grafische Weergave', leftMargin, yPos);
    yPos += 10;
    
    pdf.addImage(chartImage, 'PNG', leftMargin, yPos, 170, 100);
    yPos += 110;
    
    // Footer met logo en links
    pdf.setFontSize(10);
    pdf.setTextColor(34, 44, 56);
    pdf.text('Gegenereerd met Veerenstael - Tooling', leftMargin, yPos);
    yPos += 6;
    
    pdf.setFontSize(9);
    pdf.setTextColor(19, 209, 124);
    pdf.textWithLink('www.veerenstael.nl', leftMargin, yPos, { url: 'https://www.veerenstael.nl' });
    yPos += 5;
    pdf.textWithLink('LinkedIn: Veerenstael', leftMargin, yPos, { url: 'https://www.linkedin.com/company/veerenstael' });
    
    // PDF opslaan
    pdf.save(`Veerenstael_Tooling_Analyse_${dateStr.replace(/\s/g, '_')}.pdf`);
  }

  // Event listeners
  document.getElementById('kpi-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = readInputs();
    validate(inputs);
    const results = compute(inputs);
    updateUI(results);
    updateChart(results);
  });
  
  // Unit selector voor resultaten
  document.getElementById('resultUnit').addEventListener('change', () => {
    const inputs = readInputs();
    const results = compute(inputs);
    updateUI(results);
  });
  
  document.getElementById('exportPDF').addEventListener('click', exportToPDF);

  // Init met default waarden
  const initVals = readInputs();
  validate(initVals);
  const initResults = compute(initVals);
  updateUI(initResults);
  updateChart(initResults);
})();
