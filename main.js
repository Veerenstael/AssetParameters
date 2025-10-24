// KPI Tool - Veerenstael
(function() {
  // Constants
  const HOURS_PER_DAY = 24;
  const HOURS_PER_YEAR = 365.25 * 24;

  // KPI Definitions
  const kpiDefinitions = {
    mttf: {
      title: 'MTTF - Mean Time To Failure',
      text: '<strong>Wat het is:</strong> MTTF meet de gemiddelde tijd totdat een niet-repareerbaar component faalt. <strong>Waarom belangrijk:</strong> MTTF helpt bij het inschatten van de levensduur van componenten. <strong>Interpretatie:</strong> Een MTTF van 20.000 uur betekent dat een component gemiddeld 20.000 uur meegaat voordat deze moet worden vervangen.'
    },
    mtbf: {
      title: 'MTBF - Mean Time Between Failures',
      text: '<strong>Wat het is:</strong> MTBF meet de gemiddelde tijd tussen opeenvolgende storingen van een repareerbaar systeem. <strong>Waarom belangrijk:</strong> MTBF is een cruciale maatstaf voor de betrouwbaarheid. <strong>Interpretatie:</strong> Een MTBF van 5.000 uur betekent dat je gemiddeld elke 5.000 draaiuren een storing verwacht.'
    },
    mttr: {
      title: 'MTTR - Mean Time To Repair',
      text: '<strong>Wat het is:</strong> MTTR meet de gemiddelde tijd die nodig is om een storing te herstellen. <strong>Waarom belangrijk:</strong> MTTR is direct gekoppeld aan de productiviteit. <strong>Interpretatie:</strong> Een MTTR van 8 uur betekent dat storingen gemiddeld binnen 8 uur zijn opgelost.'
    },
    availability: {
      title: 'Beschikbaarheid [A] - Availability',
      text: '<strong>Wat het is:</strong> Beschikbaarheid geeft aan welk percentage van de tijd een systeem operationeel is. <strong>Waarom belangrijk:</strong> Beschikbaarheid is een directe maatstaf voor productiecapaciteit. <strong>Interpretatie:</strong> Een beschikbaarheid van 95% betekent dat de installatie 95% van de tijd productieklaar is.'
    },
    lambda: {
      title: 'Failure Rate [λ] - Storingsfrequentie',
      text: '<strong>Wat het is:</strong> De failure rate geeft het aantal storingen per tijdseenheid weer. <strong>Waarom belangrijk:</strong> Lambda wordt gebruikt in betrouwbaarheidsberekeningen. <strong>Interpretatie:</strong> Een λ van 0,0002 per uur betekent 0,02% kans op storing per uur.'
    },
    fit: {
      title: 'FIT - Failures In Time',
      text: '<strong>Wat het is:</strong> FIT is een gestandaardiseerde maat voor betrouwbaarheid die het aantal storingen per miljard bedrijfsuren weergeeft. <strong>Waarom belangrijk:</strong> FIT is vooral nuttig bij elektronische componenten. <strong>Interpretatie:</strong> Een FIT van 200 betekent 200 storingen per miljard uur.'
    },
    mtbm: {
      title: 'MTBM - Mean Time Between Maintenance',
      text: '<strong>Wat het is:</strong> MTBM meet de gemiddelde tijd tussen alle onderhoudsacties. <strong>Waarom belangrijk:</strong> MTBM helpt bij het plannen van onderhoudsresources. <strong>Interpretatie:</strong> Een MTBM van 1.000 uur betekent dat er gemiddeld elke 1.000 uur een onderhoudsactie plaatsvindt.'
    },
    mcmt: {
      title: 'MCMT - Mean Corrective Maintenance Time',
      text: '<strong>Wat het is:</strong> MCMT meet de gemiddelde tijd die nodig is voor correctief onderhoud. <strong>Waarom belangrijk:</strong> MCMT geeft inzicht in de complexiteit van ongeplande storingen. <strong>Interpretatie:</strong> Een MCMT van 6 uur betekent dat ongeplande reparaties gemiddeld 6 uur duren.'
    }
  };

  // Helpers
  const nf = (d = 2) => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pf = (d = 4) => new Intl.NumberFormat('nl-NL', { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtNum = (x, d = 2) => (isFinite(x) ? nf(d).format(x) : '—');
  const fmtPct = (x, d = 4) => (isFinite(x) ? pf(d).format(x) : '—');
  const safeDiv = (num, den) => (den > 0 ? num / den : NaN);

  function toHours(value, unit) {
    if (!isFinite(value)) return NaN;
    switch (unit) {
      case 'hours': return value;
      case 'days': return value * HOURS_PER_DAY;
      case 'years': return value * HOURS_PER_YEAR;
      default: return NaN;
    }
  }

  function fromHours(hours, unit) {
    if (!isFinite(hours)) return NaN;
    switch (unit) {
      case 'hours': return hours;
      case 'days': return hours / HOURS_PER_DAY;
      case 'years': return hours / HOURS_PER_YEAR;
      default: return NaN;
    }
  }

  function getUnitLabel(unit) {
    switch (unit) {
      case 'hours': return 'uur';
      case 'days': return 'dagen';
      case 'years': return 'jaren';
      default: return 'uur';
    }
  }

  // Definition buttons
  document.querySelectorAll('.def-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      const kpi = this.dataset.kpi;
      const explanation = document.getElementById('def-explanation');
      const content = document.querySelector('.def-content');
      
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

  // Read inputs
  function readInputs() {
    const totItemsValue = parseFloat(document.getElementById('totItemsValue').value);
    const totItemsUnit = document.getElementById('totItemsUnit').value;
    const totHoursValue = parseFloat(document.getElementById('totHoursValue').value);
    const totHoursUnit = document.getElementById('totHoursUnit').value;

    return {
      totItemsHours: toHours(totItemsValue, totItemsUnit),
      failedItems: parseFloat(document.getElementById('failedItems').value),
      totHours: toHours(totHoursValue, totHoursUnit),
      failures: parseFloat(document.getElementById('failures').value),
      totRepairHours: parseFloat(document.getElementById('totRepairHours').value),
      pmCount: parseFloat(document.getElementById('pmCount').value),
      cmCount: parseFloat(document.getElementById('cmCount').value)
    };
  }

  // Compute
  function compute(v, isRepairable) {
    const MTTF = safeDiv(v.totItemsHours, v.failedItems);
    
    let MTBF, MTTR, availability, lambda, FIT, MTBM, MCMT;
    
    if (isRepairable) {
      MTBF = safeDiv(v.totHours, v.failures);
      MTTR = safeDiv(v.totRepairHours, v.failures);
      availability = (isFinite(MTBF) && isFinite(MTTR) && MTBF > 0 && MTTR >= 0) 
        ? MTBF / (MTBF + MTTR) 
        : NaN;
      lambda = isFinite(MTBF) && MTBF > 0 ? 1 / MTBF : NaN;
      FIT = isFinite(lambda) ? lambda * 1e9 : NaN;
      const totalMaint = v.pmCount + v.cmCount;
      MTBM = safeDiv(v.totHours, totalMaint);
      MCMT = safeDiv(v.totRepairHours, v.cmCount);
    } else {
      MTBF = MTTF;
      MTTR = NaN;
      availability = NaN;
      lambda = isFinite(MTTF) && MTTF > 0 ? 1 / MTTF : NaN;
      FIT = isFinite(lambda) ? lambda * 1e9 : NaN;
      MTBM = NaN;
      MCMT = NaN;
    }

    return { MTTF, MTBF, MTTR, availability, lambda, FIT, MTBM, MCMT };
  }

  // Update UI
  function updateUI(r, isRepairable) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    document.getElementById('outMTTF').textContent = fmtNum(fromHours(r.MTTF, resultUnit), 2);
    document.getElementById('outMTBF').textContent = fmtNum(fromHours(r.MTBF, resultUnit), 2);
    document.getElementById('outMTTR').textContent = fmtNum(fromHours(r.MTTR, resultUnit), 2);
    document.getElementById('outA').textContent = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 6);
    document.getElementById('outFIT').textContent = fmtNum(r.FIT, 2);
    document.getElementById('outMTBM').textContent = fmtNum(fromHours(r.MTBM, resultUnit), 2);
    document.getElementById('outMCMT').textContent = fmtNum(fromHours(r.MCMT, resultUnit), 2);
    
    document.getElementById('unitMTTF').textContent = unitLabel;
    document.getElementById('unitMTBF').textContent = unitLabel;
    document.getElementById('unitMTTR').textContent = unitLabel;
    document.getElementById('unitMTBM').textContent = unitLabel;
    document.getElementById('unitMCMT').textContent = unitLabel;
    
    // Show/hide MTBF-related fields
    const mtbfRelated = document.querySelectorAll('.mtbf-related');
    mtbfRelated.forEach(el => {
      el.style.display = isRepairable ? '' : 'none';
    });
    
    // Update formula
    document.getElementById('lambdaFormula').textContent = isRepairable ? 'MTBF' : 'MTTF';
  }

  // Toggle analysis type
  document.querySelectorAll('input[name="analysisType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const isRepairable = this.value === 'repairable';
      const mtbfGroup = document.querySelector('.mtbf-group');
      
      mtbfGroup.style.display = isRepairable ? 'block' : 'none';
      
      const inputs = readInputs();
      const results = compute(inputs, isRepairable);
      updateUI(results, isRepairable);
    });
  });

  // Form submit
  document.getElementById('kpi-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    const inputs = readInputs();
    const results = compute(inputs, isRepairable);
    updateUI(results, isRepairable);
  });

  // Unit selector
  document.getElementById('resultUnit').addEventListener('change', () => {
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    const inputs = readInputs();
    const results = compute(inputs, isRepairable);
    updateUI(results, isRepairable);
  });

  // Init
  const initIsRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
  const initInputs = readInputs();
  const initResults = compute(initInputs, initIsRepairable);
  updateUI(initResults, initIsRepairable);

  // PDF Export
  document.getElementById('exportPDF').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    const inputs = readInputs();
    const results = compute(inputs, isRepairable);
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    let yPos = 0;
    const leftMargin = 20;
    
    // Blauwe header met logo
    pdf.setFillColor(34, 48, 64);
    pdf.rect(0, 0, 210, 25, 'F');
    
    // Logo (als beschikbaar)
    const logoImg = document.querySelector('.veerenstael-logo');
    if (logoImg && logoImg.complete) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        ctx.drawImage(logoImg, 0, 0);
        const logoDataUrl = canvas.toDataURL('image/png');
        
        const logoWidth = 60;
        const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
        const logoX = (210 - logoWidth) / 2;
        const logoY = (25 - logoHeight) / 2 + 2;
        
        pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch(e) {
        console.log('Logo niet beschikbaar voor PDF');
      }
    }
    
    yPos = 35;
    
    // Titel
    pdf.setFontSize(12);
    pdf.setTextColor(34, 44, 56);
    pdf.setFont(undefined, 'bold');
    pdf.text('KPI Analyse Rapport', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 7;
    
    // Type analyse
    pdf.setFontSize(10);
    pdf.text(`Type: ${isRepairable ? 'Repareerbaar (systemen/machines)' : 'Niet-repareerbaar (componenten)'}`, leftMargin, yPos);
    yPos += 7;
    
    // Datum
    const dateStr = new Date().toLocaleDateString('nl-NL', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    pdf.setFontSize(9);
    pdf.text(`Gegenereerd op: ${dateStr}`, leftMargin, yPos);
    yPos += 12;
    
    // Invoergegevens
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('Invoergegevens', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.text(`• Totale bedrijfstijd items: ${fmtNum(inputs.totItemsHours, 0)} uur`, leftMargin + 3, yPos);
    yPos += 5;
    pdf.text(`• Aantal falende items: ${fmtNum(inputs.failedItems, 0)}`, leftMargin + 3, yPos);
    yPos += 5;
    
    if (isRepairable) {
      pdf.text(`• Totale bedrijfstijd: ${fmtNum(inputs.totHours, 0)} uur`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`• Aantal storingen: ${fmtNum(inputs.failures, 0)}`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`• Totale hersteltijd: ${fmtNum(inputs.totRepairHours, 2)} uur`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`• Geplande onderhoudsacties: ${fmtNum(inputs.pmCount, 0)}`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`• Ongeplande onderhoudsacties: ${fmtNum(inputs.cmCount, 0)}`, leftMargin + 3, yPos);
      yPos += 5;
    }
    yPos += 8;
    
    // Resultaten
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('Berekende Resultaten', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 7;
    
    pdf.setFontSize(10);
    pdf.text(`MTTF: ${fmtNum(fromHours(results.MTTF, resultUnit), 2)} ${unitLabel}`, leftMargin + 3, yPos);
    yPos += 5;
    
    if (isRepairable) {
      pdf.text(`MTBF: ${fmtNum(fromHours(results.MTBF, resultUnit), 2)} ${unitLabel}`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`MTTR: ${fmtNum(fromHours(results.MTTR, resultUnit), 2)} ${unitLabel}`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`Beschikbaarheid [A]: ${fmtPct(results.availability, 2)}`, leftMargin + 3, yPos);
      yPos += 5;
    }
    
    pdf.text(`Failure Rate [λ]: ${fmtNum(results.lambda, 6)} per uur`, leftMargin + 3, yPos);
    yPos += 5;
    pdf.text(`FIT: ${fmtNum(results.FIT, 2)} per 10^9 uur`, leftMargin + 3, yPos);
    yPos += 5;
    
    if (isRepairable) {
      pdf.text(`MTBM: ${fmtNum(fromHours(results.MTBM, resultUnit), 2)} ${unitLabel}`, leftMargin + 3, yPos);
      yPos += 5;
      pdf.text(`MCMT: ${fmtNum(fromHours(results.MCMT, resultUnit), 2)} ${unitLabel}`, leftMargin + 3, yPos);
      yPos += 5;
    }
    yPos += 8;
    
    // Formules
    pdf.setFontSize(13);
    pdf.setFont(undefined, 'bold');
    pdf.text('Gebruikte Formules', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 7;
    
    pdf.setFontSize(9);
    pdf.text('MTTF = [Totale bedrijfstijd items] / [Aantal falende items]', leftMargin + 3, yPos);
    yPos += 5;
    
    if (isRepairable) {
      pdf.text('MTBF = [Totale bedrijfstijd] / [Aantal storingen]', leftMargin + 3, yPos);
      yPos += 5;
      pdf.text('MTTR = [Totale hersteltijd] / [Aantal storingen]', leftMargin + 3, yPos);
      yPos += 5;
      pdf.text('Beschikbaarheid [A] = MTBF / (MTBF + MTTR)', leftMargin + 3, yPos);
      yPos += 5;
      pdf.text('Failure Rate = 1 / MTBF', leftMargin + 3, yPos);
      yPos += 5;
    } else {
      pdf.text('Failure Rate [λ] = 1 / MTTF', leftMargin + 3, yPos);
      yPos += 5;
    }
    
    pdf.text('FIT = [λ] × 10^9', leftMargin + 3, yPos);
    yPos += 5;
    
    if (isRepairable) {
      pdf.text('MTBM = [Totale bedrijfstijd] / ([Geplande] + [Ongeplande])', leftMargin + 3, yPos);
      yPos += 5;
      pdf.text('MCMT = [Totale hersteltijd] / [Ongeplande acties]', leftMargin + 3, yPos);
    }
    
    // Opslaan
    const fileName = `Veerenstael_KPI_Rapport_${dateStr.replace(/\s/g, '_')}.pdf`;
    pdf.save(fileName);
  });
})();

