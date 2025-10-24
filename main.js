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

  // SVG Timeline Diagram
  function drawTimeline(results, isRepairable) {
    const svg = document.getElementById('timelineSvg');
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    // Convert values
    const mttf = fromHours(results.MTTF, resultUnit);
    const mttr = fromHours(results.MTTR, resultUnit);
    const mtbf = fromHours(results.MTBF, resultUnit);
    
    // Clear existing content
    svg.innerHTML = '';
    
    if (!isRepairable) {
      // Niet-repareerbaar: Simpel MTTF diagram
      drawNonRepairableTimeline(svg, mttf, unitLabel);
    } else {
      // Repareerbaar: Volledig diagram met MTTF + MTBF
      drawRepairableTimeline(svg, mttf, mttr, mtbf, unitLabel);
    }
  }
  
  // Niet-repareerbaar diagram (simpel)
  function drawNonRepairableTimeline(svg, mttf, unitLabel) {
    const startX = 100;
    const y = 140;
    const spacing = 150;
    
    // Define arrowhead marker
    addArrowMarker(svg);
    
    // Icon 1: Start
    svg.appendChild(createIcon(startX, y, 'success', 'Start'));
    
    // Icon 2: Werkt
    svg.appendChild(createIcon(startX + spacing, y, 'success', 'Operationeel'));
    
    // Icon 3: Werkt
    svg.appendChild(createIcon(startX + spacing * 2, y, 'success', 'Operationeel'));
    
    // Icon 4: Fout
    svg.appendChild(createIcon(startX + spacing * 3, y, 'failure-end', 'Defect'));
    
    // MTTF arrow over alles
    svg.appendChild(createArrow(startX + 25, startX + spacing * 3 - 25, y - 60, 'MTTF', `${fmtNum(mttf, 1)} ${unitLabel}`));
    
    // Tekst onder diagram
    const infoText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    infoText.setAttribute('x', 400);
    infoText.setAttribute('y', y + 80);
    infoText.setAttribute('text-anchor', 'middle');
    infoText.setAttribute('fill', '#b8c7e0');
    infoText.setAttribute('font-size', '13');
    infoText.textContent = 'Component levensduur tot defect (niet-repareerbaar)';
    svg.appendChild(infoText);
  }
  
  // Repareerbaar diagram (volledig)
  function drawRepairableTimeline(svg, mttf, mttr, mtbf, unitLabel) {
    
  // Repareerbaar diagram (volledig)
  function drawRepairableTimeline(svg, mttf, mttr, mtbf, unitLabel) {
    // Clear existing content
    svg.innerHTML = '';
    
    // Timeline parameters
    const startX = 50;
    const y = 140;
    const totalWidth = 700;
    
    // Calculate proportions
    const mttfWidth = 200;
    const mttrWidth = 100;
    const mttf2Width = 200;
    
    // Define arrowhead marker
    addArrowMarker(svg);
    
    // Create timeline
    let currentX = startX;
    
  }
  
  // Helper: Arrow marker voor SVG
  function addArrowMarker(svg) {
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#ffaa33');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
  }
  
  // Helper function to create icon circle
  function createIcon(x, y, type, label) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 25);
      
      if (type === 'success') {
        circle.setAttribute('fill', '#13d17c');
        circle.setAttribute('stroke', '#0ea863');
      } else if (type === 'failure') {
        circle.setAttribute('fill', '#ffaa33');
        circle.setAttribute('stroke', '#e59420');
      } else if (type === 'repair') {
        circle.setAttribute('fill', '#3e70ff');
        circle.setAttribute('stroke', '#2a5ad9');
      } else if (type === 'failure-end') {
        circle.setAttribute('fill', '#ff4444');
        circle.setAttribute('stroke', '#cc0000');
      }
      circle.setAttribute('stroke-width', '3');
      
      g.appendChild(circle);
      
      // Add symbol
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y + 6);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#fff');
      text.setAttribute('font-size', '20');
      text.setAttribute('font-weight', 'bold');
      
      if (type === 'success') text.textContent = '✓';
      else if (type === 'failure' || type === 'failure-end') text.textContent = '✗';
      else if (type === 'repair') text.textContent = '🔧';
      
      g.appendChild(text);
      
      // Add label below
      if (label) {
        const labelText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        labelText.setAttribute('x', x);
        labelText.setAttribute('y', y + 55);
        labelText.setAttribute('text-anchor', 'middle');
        labelText.setAttribute('fill', '#93a4c9');
        labelText.setAttribute('font-size', '11');
        labelText.textContent = label;
        g.appendChild(labelText);
      }
      
      return g;
    }
    
    // Helper function to create arrow
    function createArrow(x1, x2, y, label, value) {
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      
      // Arrow line
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y);
      line.setAttribute('stroke', '#ffaa33');
      line.setAttribute('stroke-width', '3');
      line.setAttribute('marker-end', 'url(#arrowhead)');
      g.appendChild(line);
      
      // Background rectangle for label (to prevent overlap)
      const textWidth = label.length * 8 + value.length * 7;
      const rectX = (x1 + x2) / 2 - textWidth / 2;
      const rectY = y - 35;
      
      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', rectX - 5);
      bgRect.setAttribute('y', rectY);
      bgRect.setAttribute('width', textWidth + 10);
      bgRect.setAttribute('height', 28);
      bgRect.setAttribute('fill', '#232b3a');
      bgRect.setAttribute('rx', '4');
      g.appendChild(bgRect);
      
      // Label above arrow
      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', (x1 + x2) / 2);
      text.setAttribute('y', y - 20);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('fill', '#e0e6f0');
      text.setAttribute('font-size', '14');
      text.setAttribute('font-weight', '600');
      text.textContent = label;
      g.appendChild(text);
      
      // Value below label
      const valueText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      valueText.setAttribute('x', (x1 + x2) / 2);
      valueText.setAttribute('y', y - 7);
      valueText.setAttribute('text-anchor', 'middle');
      valueText.setAttribute('fill', '#b8c7e0');
      valueText.setAttribute('font-size', '12');
      valueText.textContent = value;
      g.appendChild(valueText);
      
      return g;
    }
    
    // Define arrowhead marker
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    marker.setAttribute('id', 'arrowhead');
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '10');
    marker.setAttribute('refX', '9');
    marker.setAttribute('refY', '3');
    marker.setAttribute('orient', 'auto');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', '0 0, 10 3, 0 6');
    polygon.setAttribute('fill', '#ffaa33');
    marker.appendChild(polygon);
    defs.appendChild(marker);
    svg.appendChild(defs);
    
    // Draw timeline
    // Icon 1: Correct Behavior (start)
    svg.appendChild(createIcon(currentX, y, 'success', 'Correct Behavior'));
    
    // MTTF arrow
    const mttfStart = currentX + 25;
    currentX += mttfWidth;
    svg.appendChild(createArrow(mttfStart, currentX - 25, y - 50, 'MTTF', `${fmtNum(mttf, 1)} ${unitLabel}`));
    
    // Icon 2: First Failure
    svg.appendChild(createIcon(currentX, y, 'failure', 'First Failure'));
    
    // Vertical line to repair
    const vLine1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine1.setAttribute('x1', currentX);
    vLine1.setAttribute('y1', y + 25);
    vLine1.setAttribute('x2', currentX + mttrWidth/2);
    vLine1.setAttribute('y2', y + 60);
    vLine1.setAttribute('stroke', '#3e70ff');
    vLine1.setAttribute('stroke-width', '2');
    vLine1.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(vLine1);
    
    // Icon 3: Repair
    svg.appendChild(createIcon(currentX + mttrWidth/2, y + 60, 'repair', 'Begin Repair'));
    
    // MTTR arrow (at repair level)
    const mttrStart = currentX + 25;
    currentX += mttrWidth;
    svg.appendChild(createArrow(mttrStart, currentX - 25, y, 'MTTR', `${fmtNum(mttr, 1)} ${unitLabel}`));
    
    // Vertical line from repair
    const vLine2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    vLine2.setAttribute('x1', currentX - mttrWidth/2);
    vLine2.setAttribute('y1', y + 60);
    vLine2.setAttribute('x2', currentX);
    vLine2.setAttribute('y2', y + 25);
    vLine2.setAttribute('stroke', '#13d17c');
    vLine2.setAttribute('stroke-width', '2');
    vLine2.setAttribute('stroke-dasharray', '5,5');
    svg.appendChild(vLine2);
    
    const repairLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    repairLabel.setAttribute('x', currentX - mttrWidth/2);
    repairLabel.setAttribute('y', y + 95);
    repairLabel.setAttribute('text-anchor', 'middle');
    repairLabel.setAttribute('fill', '#93a4c9');
    repairLabel.setAttribute('font-size', '11');
    repairLabel.textContent = 'End Repair';
    svg.appendChild(repairLabel);
    
    // Icon 4: Correct Behavior (after repair)
    svg.appendChild(createIcon(currentX, y, 'success', 'Correct Behavior'));
    
    // MTTF arrow (second)
    const mttf2Start = currentX + 25;
    currentX += mttf2Width;
    svg.appendChild(createArrow(mttf2Start, currentX - 25, y - 50, 'MTTF', `${fmtNum(mttf, 1)} ${unitLabel}`));
    
    // Icon 5: Second Failure
    svg.appendChild(createIcon(currentX, y, 'failure-end', 'Second Failure'));
    
    // MTBF arrow (over entire cycle)
    const mtbfStart = startX + 25;
    const mtbfEnd = currentX - 25;
    svg.appendChild(createArrow(mtbfStart, mtbfEnd, 30, 'MTBF', `${fmtNum(mtbf, 1)} ${unitLabel}`));
  }
  
  // SVG Speedometer Gauge for Availability
  function drawAvailabilityGauge(availability) {
    const svg = document.getElementById('availabilityGauge');
    svg.innerHTML = '';
    
    const centerX = 120;
    const centerY = 120;
    const radius = 80;
    const percentage = isFinite(availability) ? availability * 100 : 0;
    
    // Background arc (semi-circle)
    const bgArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const startAngle = Math.PI; // Start at left (180 degrees)
    const endAngle = 2 * Math.PI; // End at right (360/0 degrees)
    
    // Create gradient for gauge
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'gaugeGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('x2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#ff4444');
    gradient.appendChild(stop1);
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '50%');
    stop2.setAttribute('stop-color', '#ffaa33');
    gradient.appendChild(stop2);
    
    const stop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop3.setAttribute('offset', '100%');
    stop3.setAttribute('stop-color', '#13d17c');
    gradient.appendChild(stop3);
    
    defs.appendChild(gradient);
    svg.appendChild(defs);
    
    // Background arc path
    const bgPath = describeArc(centerX, centerY, radius, startAngle, endAngle);
    bgArc.setAttribute('d', bgPath);
    bgArc.setAttribute('fill', 'none');
    bgArc.setAttribute('stroke', '#2a3442');
    bgArc.setAttribute('stroke-width', '16');
    bgArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(bgArc);
    
    // Colored arc based on percentage
    const coloredArc = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    const valueAngle = startAngle + (endAngle - startAngle) * (percentage / 100);
    const colorPath = describeArc(centerX, centerY, radius, startAngle, valueAngle);
    coloredArc.setAttribute('d', colorPath);
    coloredArc.setAttribute('fill', 'none');
    coloredArc.setAttribute('stroke', 'url(#gaugeGradient)');
    coloredArc.setAttribute('stroke-width', '16');
    coloredArc.setAttribute('stroke-linecap', 'round');
    svg.appendChild(coloredArc);
    
    // Needle/pointer
    const needleAngle = startAngle + (endAngle - startAngle) * (percentage / 100);
    const needleLength = radius - 20;
    const needleX = centerX + needleLength * Math.cos(needleAngle);
    const needleY = centerY + needleLength * Math.sin(needleAngle);
    
    const needle = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    needle.setAttribute('x1', centerX);
    needle.setAttribute('y1', centerY);
    needle.setAttribute('x2', needleX);
    needle.setAttribute('y2', needleY);
    needle.setAttribute('stroke', '#e5ecff');
    needle.setAttribute('stroke-width', '3');
    needle.setAttribute('stroke-linecap', 'round');
    svg.appendChild(needle);
    
    // Center circle
    const centerCircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    centerCircle.setAttribute('cx', centerX);
    centerCircle.setAttribute('cy', centerY);
    centerCircle.setAttribute('r', '8');
    centerCircle.setAttribute('fill', '#e5ecff');
    svg.appendChild(centerCircle);
    
    // Labels (0%, 50%, 100%) - positioned outside the arc
    addGaugeLabel(svg, centerX - radius - 20, centerY + 5, '0%');
    addGaugeLabel(svg, centerX, centerY - radius - 15, '50%');
    addGaugeLabel(svg, centerX + radius + 20, centerY + 5, '100%');
    
    // Update gauge value display
    document.getElementById('gaugeValue').textContent = fmtPct(availability, 2);
  }
  
  // Helper function to describe an arc path
  function describeArc(x, y, radius, startAngle, endAngle) {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= Math.PI ? '0' : '1';
    return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
  }
  
  function polarToCartesian(centerX, centerY, radius, angleInRadians) {
    return {
      x: centerX + radius * Math.cos(angleInRadians),
      y: centerY + radius * Math.sin(angleInRadians)
    };
  }
  
  function addGaugeLabel(svg, x, y, text) {
    const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    label.setAttribute('x', x);
    label.setAttribute('y', y);
    label.setAttribute('text-anchor', 'middle');
    label.setAttribute('fill', '#93a4c9');
    label.setAttribute('font-size', '11');
    label.textContent = text;
    svg.appendChild(label);
  }
  
  // Update visualization
  function updateVisualization(r) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    // Draw timeline and gauge
    drawTimeline(r);
    drawAvailabilityGauge(r.availability);
    
    // Update info boxes
    document.getElementById('visMTBM').textContent = `${fmtNum(fromHours(r.MTBM, resultUnit), 1)} ${unitLabel}`;
    document.getElementById('visMCMT').textContent = `${fmtNum(fromHours(r.MCMT, resultUnit), 1)} ${unitLabel}`;
    
    // Update failure rate
    document.getElementById('visLambda').textContent = fmtNum(r.lambda, 6);
    
    // Add interpretation
    if (isFinite(r.lambda) && r.lambda > 0) {
      const hoursPerFailure = 1 / r.lambda;
      const interpretation = ` | Verwachting: 1 storing per ${fmtNum(hoursPerFailure, 0)} uur`;
      document.getElementById('visLambdaInterpretation').textContent = interpretation;
    } else {
      document.getElementById('visLambdaInterpretation').textContent = '';
    }
  }

  // PDF Export functionaliteit
  function exportToPDF() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const inputs = readInputs();
    const results = compute(inputs);
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    let yPos = 0;
    const leftMargin = 20;
    const pageWidth = 170;
    
    // Blauwe header balk bovenaan (zoals Veerenstael stijl)
    pdf.setFillColor(34, 48, 64); // Donkerblauw (#223040)
    pdf.rect(0, 0, 210, 25, 'F'); // Volle breedte, 25mm hoog
    
    // Logo in het midden van de blauwe balk
    const logoImg = document.querySelector('.veerenstael-logo');
    if (logoImg && logoImg.complete) {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = logoImg.naturalWidth;
      canvas.height = logoImg.naturalHeight;
      ctx.drawImage(logoImg, 0, 0);
      const logoDataUrl = canvas.toDataURL('image/png');
      
      // Logo gecentreerd in de blauwe balk
      const logoWidth = 60;
      const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
      const logoX = (210 - logoWidth) / 2; // Gecentreerd op A4 breedte (210mm)
      const logoY = (25 - logoHeight) / 2 + 2; // Gecentreerd verticaal in de balk
      
      pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
    }
    
    yPos = 35; // Start content onder de blauwe balk
    
    // Subtitle
    pdf.setFontSize(11);
    pdf.setTextColor(34, 44, 56);
    pdf.setFont(undefined, 'bold');
    pdf.text('Betrouwbaarheids- en Onderhoudsparameters Analyse', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
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
    pdf.text(`Failure Rate: ${fmtNum(results.lambda, 6)} per uur`, leftMargin + 5, yPos);
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
    yPos += 12;
    
    // PDF opslaan
    pdf.save(`Veerenstael_Tooling_Analyse_${dateStr.replace(/\s/g, '_')}.pdf`);
  }

  // Event listeners
  document.getElementById('kpi-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = readInputs();
    validate(inputs);
    const results = compute(inputs);
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    updateUI(results);
    updateVisualization(results, isRepairable);
  });
  
  // Unit selector voor resultaten
  document.getElementById('resultUnit').addEventListener('change', () => {
    const inputs = readInputs();
    const results = compute(inputs);
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    updateUI(results);
    updateVisualization(results, isRepairable);
  });
  
  document.getElementById('exportPDF').addEventListener('click', exportToPDF);
  
  // Analysis Type Toggle Handler
  document.querySelectorAll('input[name="analysisType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const isRepairable = this.value === 'repairable';
      const mtbfGroup = document.querySelector('.mtbf-group');
      
      if (isRepairable) {
        mtbfGroup.style.display = 'block';
      } else {
        mtbfGroup.style.display = 'none';
      }
      
      // Herbereken en update visualisatie
      const inputs = readInputs();
      validate(inputs);
      const results = compute(inputs);
      updateUI(results);
      updateVisualization(results, isRepairable);
    });
  });

  // Init met default waarden
  const initVals = readInputs();
  validate(initVals);
  const initResults = compute(initVals);
  updateUI(initResults);
  updateVisualization(initResults, true); // Default: repairable
})();
