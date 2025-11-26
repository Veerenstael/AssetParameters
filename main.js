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
      text: '<strong>Wat het is:</strong> MTTR meet de gemiddelde tijd die nodig is om een storing te herstellen (reparatietijd). <strong>Waarom belangrijk:</strong> MTTR is direct gekoppeld aan de productiviteit. <strong>Interpretatie:</strong> Een MTTR van 8 uur betekent dat reparaties gemiddeld 8 uur duren.'
    },
    mttd: {
      title: 'MTTD - Mean Time To Detect',
      text: '<strong>Wat het is:</strong> MTTD meet de gemiddelde tijd die nodig is om een storing te detecteren. <strong>Waarom belangrijk:</strong> Snelle detectie vermindert de totale downtime. <strong>Interpretatie:</strong> Een MTTD van 2 uur betekent dat storingen gemiddeld binnen 2 uur worden opgemerkt.'
    },
    mcmt: {
      title: 'MCMT - Mean Corrective Maintenance Time',
      text: '<strong>Wat het is:</strong> MCMT is de totale gemiddelde tijd voor correctief onderhoud (detectie + reparatie). <strong>Formule:</strong> MCMT = MTTR + MTTD. <strong>Interpretatie:</strong> Een MCMT van 10 uur betekent dat de totale tijd van storing tot herstel gemiddeld 10 uur duurt.'
    },
    uptime: {
      title: 'Uptime - Beschikbare bedrijfstijd',
      text: '<strong>Wat het is:</strong> Uptime is de tijd dat het systeem daadwerkelijk operationeel is tussen storingen. <strong>Formule:</strong> Uptime = MTBF − MCMT. <strong>Interpretatie:</strong> Dit geeft de netto productieve tijd weer binnen elke storingscyclus.'
    },
    availability: {
      title: 'Beschikbaarheid [A] - Availability',
      text: '<strong>Wat het is:</strong> Beschikbaarheid geeft aan welk percentage van de tijd een systeem operationeel is. <strong>Formule:</strong> A = Uptime / MTBF. <strong>Interpretatie:</strong> Een beschikbaarheid van 95% betekent dat de installatie 95% van de tijd productieklaar is.'
    },
    lambda: {
      title: 'Failure Rate [λ] - Storingsfrequentie',
      text: '<strong>Wat het is:</strong> De failure rate geeft het aantal storingen per tijdseenheid weer. <strong>Formule:</strong> λ = 1 / MTBF (of MTTF). <strong>Interpretatie:</strong> Een λ van 0,0002 per uur betekent 0,02% kans op storing per uur.'
    },
    fit: {
      title: 'FIT - Failures In Time',
      text: '<strong>Wat het is:</strong> FIT is een gestandaardiseerde maat voor betrouwbaarheid die het aantal storingen per miljard bedrijfsuren weergeeft. <strong>Formule:</strong> FIT = 1.000.000.000 / MTBF (of MTTF). <strong>Interpretatie:</strong> Een FIT van 200 betekent 200 storingen per miljard uur.'
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

    return {
      totItemsHours: toHours(totItemsValue, totItemsUnit),
      failures: parseFloat(document.getElementById('failures').value),
      totRepairHours: parseFloat(document.getElementById('totRepairHours').value),
      totDetectHours: parseFloat(document.getElementById('totDetectHours').value)
    };
  }

  // Compute - Repareerbaar
  function computeRepairable(v) {
    const MTBF = safeDiv(v.totItemsHours, v.failures);
    const MTTR = safeDiv(v.totRepairHours, v.failures);
    const MTTD = safeDiv(v.totDetectHours, v.failures);
    const MCMT = (isFinite(MTTR) && isFinite(MTTD)) ? MTTR + MTTD : NaN;
    const uptime = (isFinite(MTBF) && isFinite(MCMT)) ? MTBF - MCMT : NaN;
    const availability = (isFinite(uptime) && isFinite(MTBF) && MTBF > 0) ? uptime / MTBF : NaN;
    const lambda = (isFinite(MTBF) && MTBF > 0) ? 1 / MTBF : NaN;
    const FIT = (isFinite(MTBF) && MTBF > 0) ? 1e9 / MTBF : NaN;

    return { MTBF, MTTR, MTTD, MCMT, uptime, availability, lambda, FIT };
  }

  // Compute - Niet-repareerbaar
  function computeNonRepairable(v) {
    const MTTF = safeDiv(v.totItemsHours, v.failures);
    const lambda = (isFinite(MTTF) && MTTF > 0) ? 1 / MTTF : NaN;
    const FIT = (isFinite(MTTF) && MTTF > 0) ? 1e9 / MTTF : NaN;

    return { MTTF, lambda, FIT };
  }

  // Update UI - Repareerbaar
  function updateUIRepairable(r) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    document.getElementById('outMTBF').textContent = fmtNum(fromHours(r.MTBF, resultUnit), 2);
    document.getElementById('outMTTR').textContent = fmtNum(fromHours(r.MTTR, resultUnit), 2);
    document.getElementById('outMTTD').textContent = fmtNum(fromHours(r.MTTD, resultUnit), 2);
    document.getElementById('outMCMT').textContent = fmtNum(fromHours(r.MCMT, resultUnit), 2);
    document.getElementById('outUptime').textContent = fmtNum(fromHours(r.uptime, resultUnit), 2);
    document.getElementById('outA').textContent = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 8);
    document.getElementById('outFIT').textContent = fmtNum(r.FIT, 2);
    
    document.getElementById('unitMTBF').textContent = unitLabel;
    document.getElementById('unitMTTR').textContent = unitLabel;
    document.getElementById('unitMTTD').textContent = unitLabel;
    document.getElementById('unitMCMT').textContent = unitLabel;
    document.getElementById('unitUptime').textContent = unitLabel;
  }

  // Update UI - Niet-repareerbaar
  function updateUINonRepairable(r) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    document.getElementById('outMTTF').textContent = fmtNum(fromHours(r.MTTF, resultUnit), 2);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 8);
    document.getElementById('outFIT').textContent = fmtNum(r.FIT, 2);
    
    document.getElementById('unitMTTF').textContent = unitLabel;
  }

  // Toggle visibility based on analysis type
  function toggleAnalysisType(isRepairable) {
    document.querySelectorAll('.repairable-only').forEach(el => {
      el.style.display = isRepairable ? '' : 'none';
    });
    
    document.querySelectorAll('.result-row.repairable-only').forEach(el => {
      el.style.display = isRepairable ? '' : 'none';
    });
    document.querySelectorAll('.result-row.non-repairable-only').forEach(el => {
      el.style.display = isRepairable ? 'none' : '';
    });
    
    document.getElementById('formulasRepairable').style.display = isRepairable ? '' : 'none';
    document.getElementById('formulasNonRepairable').style.display = isRepairable ? 'none' : '';
    
    document.getElementById('diagramRepairable').style.display = isRepairable ? '' : 'none';
    document.getElementById('diagramNonRepairable').style.display = isRepairable ? 'none' : '';
  }

  // Form submit
  document.getElementById('kpi-form').addEventListener('submit', function(e) {
    e.preventDefault();
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    const inputs = readInputs();
    
    if (isRepairable) {
      const results = computeRepairable(inputs);
      updateUIRepairable(results);
    } else {
      const results = computeNonRepairable(inputs);
      updateUINonRepairable(results);
    }
  });

  // Toggle analysis type
  document.querySelectorAll('input[name="analysisType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const isRepairable = this.value === 'repairable';
      toggleAnalysisType(isRepairable);
    });
  });

  // Unit selector
  document.getElementById('resultUnit').addEventListener('change', function() {
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    const inputs = readInputs();
    
    if (isRepairable) {
      const results = computeRepairable(inputs);
      updateUIRepairable(results);
    } else {
      const results = computeNonRepairable(inputs);
      updateUINonRepairable(results);
    }
  });

  // Init
  const initIsRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
  toggleAnalysisType(initIsRepairable);
  const initInputs = readInputs();
  if (initIsRepairable) {
    const initResults = computeRepairable(initInputs);
    updateUIRepairable(initResults);
  } else {
    const initResults = computeNonRepairable(initInputs);
    updateUINonRepairable(initResults);
  }

  // PDF Export
  document.getElementById('exportPDF').addEventListener('click', function() {
    const { jsPDF } = window.jspdf;
    const pdf = new jsPDF('p', 'mm', 'a4');
    
    const isRepairable = document.querySelector('input[name="analysisType"]:checked').value === 'repairable';
    const inputs = readInputs();
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    let yPos = 0;
    const leftMargin = 15;
    
    // Blauwe header
    pdf.setFillColor(34, 48, 64);
    pdf.rect(0, 0, 210, 22, 'F');
    
    // Logo
    const logoImg = document.querySelector('.veerenstael-logo');
    if (logoImg && logoImg.complete) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = logoImg.naturalWidth;
        canvas.height = logoImg.naturalHeight;
        ctx.drawImage(logoImg, 0, 0);
        const logoDataUrl = canvas.toDataURL('image/png');
        
        const logoWidth = 50;
        const logoHeight = (logoImg.naturalHeight / logoImg.naturalWidth) * logoWidth;
        const logoX = (210 - logoWidth) / 2;
        const logoY = (22 - logoHeight) / 2 + 1;
        
        pdf.addImage(logoDataUrl, 'PNG', logoX, logoY, logoWidth, logoHeight);
      } catch(e) {
        console.log('Logo niet beschikbaar voor PDF');
      }
    }
    
    yPos = 28;
    
    // Titel
    pdf.setFontSize(11);
    pdf.setTextColor(34, 44, 56);
    pdf.setFont(undefined, 'bold');
    pdf.text('Rapport - Onderhoudsparameters', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 5;
    
    // Type analyse + datum op één regel
    pdf.setFontSize(9);
    const dateStr = new Date().toLocaleDateString('nl-NL', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    pdf.text(`Type: ${isRepairable ? 'Repareerbaar (systemen/machines)' : 'Niet-repareerbaar (componenten)'}  |  ${dateStr}`, leftMargin, yPos);
    yPos += 8;
    
    // Twee kolommen layout
    const colWidth = 88;
    const col1X = leftMargin;
    const col2X = leftMargin + colWidth + 5;
    let col1Y = yPos;
    let col2Y = yPos;
    
    // KOLOM 1: Invoergegevens
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Invoergegevens', col1X, col1Y);
    pdf.setFont(undefined, 'normal');
    col1Y += 6;
    
    pdf.setFontSize(9);
    pdf.text(`• Totale bedrijfstijd: ${fmtNum(inputs.totItemsHours, 0)} uur`, col1X + 2, col1Y);
    col1Y += 4;
    pdf.text(`• Aantal faalmomenten: ${fmtNum(inputs.failures, 0)}`, col1X + 2, col1Y);
    col1Y += 4;
    
    if (isRepairable) {
      pdf.text(`• Totale reparatietijd: ${fmtNum(inputs.totRepairHours, 2)} uur`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`• Totale detectietijd: ${fmtNum(inputs.totDetectHours, 2)} uur`, col1X + 2, col1Y);
      col1Y += 4;
    }
    col1Y += 4;
    
    // KOLOM 1: Resultaten
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Berekende Resultaten', col1X, col1Y);
    pdf.setFont(undefined, 'normal');
    col1Y += 6;
    
    pdf.setFontSize(9);
    
    if (isRepairable) {
      const results = computeRepairable(inputs);
      pdf.text(`MTBF: ${fmtNum(fromHours(results.MTBF, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`MTTR: ${fmtNum(fromHours(results.MTTR, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`MTTD: ${fmtNum(fromHours(results.MTTD, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`MCMT: ${fmtNum(fromHours(results.MCMT, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Uptime: ${fmtNum(fromHours(results.uptime, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Beschikbaarheid [A]: ${fmtPct(results.availability, 2)}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Failure Rate [λ]: ${fmtNum(results.lambda, 8)} per uur`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`FIT: ${fmtNum(results.FIT, 2)} per 10^9 uur`, col1X + 2, col1Y);
    } else {
      const results = computeNonRepairable(inputs);
      pdf.text(`MTTF: ${fmtNum(fromHours(results.MTTF, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Failure Rate [λ]: ${fmtNum(results.lambda, 8)} per uur`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`FIT: ${fmtNum(results.FIT, 2)} per 10^9 uur`, col1X + 2, col1Y);
    }
    
    // KOLOM 2: Formules
    pdf.setFontSize(11);
    pdf.setFont(undefined, 'bold');
    pdf.text('Gebruikte Formules', col2X, col2Y);
    pdf.setFont(undefined, 'normal');
    col2Y += 6;
    
    pdf.setFontSize(8);
    
    if (isRepairable) {
      pdf.text('MTBF = [Totale bedrijfstijd] / [Aantal faalmomenten]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MTTR = [Totale reparatietijd] / [Aantal faalmomenten]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MTTD = [Totale detectietijd] / [Aantal faalmomenten]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MCMT = MTTR + MTTD', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Uptime = MTBF - MCMT', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Beschikbaarheid [A] = Uptime / MTBF', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Failure Rate [λ] = 1 / MTBF', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('FIT = 1.000.000.000 / MTBF', col2X + 2, col2Y);
    } else {
      pdf.text('MTTF = [Totale bedrijfstijd] / [Aantal faalmomenten]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Failure Rate [λ] = 1 / MTTF', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('FIT = 1.000.000.000 / MTTF', col2X + 2, col2Y);
    }
    
    // Plaatje onderaan
    const diagramId = isRepairable ? 'diagramRepairable' : 'diagramNonRepairable';
    const diagramImg = document.querySelector(`#${diagramId} img`);
    
    if (diagramImg && diagramImg.complete && diagramImg.naturalWidth > 0) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = diagramImg.naturalWidth;
        canvas.height = diagramImg.naturalHeight;
        ctx.drawImage(diagramImg, 0, 0);
        const imgDataUrl = canvas.toDataURL('image/jpeg', 0.9);
        
        const maxImgWidth = 180;
        const maxImgHeight = 160;
        const aspectRatio = diagramImg.naturalWidth / diagramImg.naturalHeight;
        
        let imgWidth = maxImgWidth;
        let imgHeight = imgWidth / aspectRatio;
        
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = imgHeight * aspectRatio;
        }
        
        const imgX = (210 - imgWidth) / 2;
        const imgY = 297 - imgHeight - 10;
        
        pdf.addImage(imgDataUrl, 'JPEG', imgX, imgY, imgWidth, imgHeight);
      } catch(e) {
        console.log('Diagram niet beschikbaar voor PDF:', e);
      }
    }
    
    // Opslaan
    const fileName = `Veerenstael_Rapport_${dateStr.replace(/\s/g, '_')}.pdf`;
    pdf.save(fileName);
  });
})();

