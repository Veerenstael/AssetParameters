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
    mpmt: {
      title: 'MPMT - Mean Preventive Maintenance Time',
      text: '<strong>Wat het is:</strong> MPMT meet de gemiddelde tijd die nodig is voor gepland preventief onderhoud. <strong>Waarom belangrijk:</strong> Gepland onderhoud verlaagt de uptime maar voorkomt ongeplande storingen. <strong>Interpretatie:</strong> Een MPMT van 3 uur betekent dat geplande onderhoudsactiviteiten gemiddeld 3 uur per cyclus duren.'
    },
    mcmt: {
      title: 'MCMT - Mean Corrective Maintenance Time',
      text: '<strong>Wat het is:</strong> MCMT is de totale gemiddelde tijd voor correctief onderhoud (detectie + reparatie). <strong>Formule:</strong> MCMT = MTTR + MTTD. <strong>Interpretatie:</strong> Een MCMT van 10 uur betekent dat de totale tijd van storing tot herstel gemiddeld 10 uur duurt.'
    },
    mmt: {
      title: 'MMT - Mean Maintenance Time',
      text: '<strong>Wat het is:</strong> MMT is de gemiddelde onderhoudstijd, zowel correctief als preventief. <strong>Formule:</strong> MMT = (Alle onderhoudstijd) / (Aantal keer PM + Faalmomenten). <strong>Interpretatie:</strong> Dit geeft de gemiddelde tijd weer die besteed wordt aan alle onderhoudsactiviteiten per moment.'
    },
    uptime: {
      title: 'Uptime - Beschikbare bedrijfstijd',
      text: '<strong>Wat het is:</strong> Uptime is de tijd dat het systeem daadwerkelijk operationeel is. <strong>Formule:</strong> Uptime = MTBF âˆ’ MCMT âˆ’ MPMT (repareerbaar) of MTTF âˆ’ MPMT (niet-repareerbaar). <strong>Interpretatie:</strong> Dit geeft de netto productieve tijd weer.'
    },
    availability: {
      title: 'Beschikbaarheid [A] - Availability',
      text: '<strong>Wat het is:</strong> Beschikbaarheid geeft aan welk percentage van de tijd een systeem operationeel is. <strong>Formule:</strong> A = Uptime / MTBF. <strong>Interpretatie:</strong> Een beschikbaarheid van 95% betekent dat de installatie 95% van de tijd productieklaar is.'
    },
    lambda: {
      title: 'Failure Rate [Î»] - Storingsfrequentie',
      text: '<strong>Wat het is:</strong> De failure rate geeft het aantal storingen per tijdseenheid weer. <strong>Formule:</strong> Î» = 1 / MTBF (of MTTF). <strong>Interpretatie:</strong> Een Î» van 0,0002 per uur betekent 0,02% kans op storing per uur.'
    },
    fit: {
      title: 'FIT - Failures In Time',
      text: '<strong>Wat het is:</strong> FIT is een gestandaardiseerde maat voor betrouwbaarheid die het aantal storingen per miljard bedrijfsuren weergeeft. <strong>Formule:</strong> FIT = 1.000.000.000 / MTBF (of MTTF). <strong>Interpretatie:</strong> Een FIT van 200 betekent 200 storingen per miljard uur.'
    }
  };

  // Helpers
  const nf = (d = 2) => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pf = (d = 4) => new Intl.NumberFormat('nl-NL', { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtNum = (x, d = 2) => (isFinite(x) ? nf(d).format(x) : 'â€”');
  const fmtPct = (x, d = 4) => (isFinite(x) ? pf(d).format(x) : 'â€”');
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

  // Info icon toggle system
  document.querySelectorAll('.info-icon').forEach(icon => {
    icon.addEventListener('click', function(e) {
      e.preventDefault();
      e.stopPropagation();
      
      const infoId = this.dataset.info;
      const panel = document.getElementById(`info-${infoId}`);
      const wasOpen = panel.classList.contains('open');
      
      // Sluit alle andere panels
      document.querySelectorAll('.info-panel').forEach(p => {
        p.classList.remove('open');
      });
      document.querySelectorAll('.info-icon').forEach(i => {
        i.classList.remove('active');
      });
      
      // Toggle current panel
      if (!wasOpen) {
        panel.classList.add('open');
        this.classList.add('active');
      }
    });
  });

  // Read inputs
  function readInputs() {
    const totItemsValue = parseFloat(document.getElementById('totItemsValue').value);
    const totItemsUnit = document.getElementById('totItemsUnit').value;
    const totPMValue = parseFloat(document.getElementById('totPMValue').value);
    const totPMUnit = document.getElementById('totPMUnit').value;
    const totRepairValue = parseFloat(document.getElementById('totRepairValue').value);
    const totRepairUnit = document.getElementById('totRepairUnit').value;
    const totDetectValue = parseFloat(document.getElementById('totDetectValue').value);
    const totDetectUnit = document.getElementById('totDetectUnit').value;

    return {
      totItemsHours: toHours(totItemsValue, totItemsUnit),
      failures: parseFloat(document.getElementById('failures').value),
      totRepairHours: toHours(totRepairValue, totRepairUnit),
      totDetectHours: toHours(totDetectValue, totDetectUnit),
      totPMHours: toHours(totPMValue, totPMUnit),
      numPM: parseFloat(document.getElementById('numPM').value)
    };
  }

  // Compute - Repareerbaar
  function computeRepairable(v) {
    const MTBF = safeDiv(v.totItemsHours, v.failures);
    const MTTR = safeDiv(v.totRepairHours, v.failures);
    const MTTD = safeDiv(v.totDetectHours, v.failures);
    const MPMT = safeDiv(v.totPMHours, v.numPM);
    const MCMT = (isFinite(MTTR) && isFinite(MTTD)) ? MTTR + MTTD : NaN;
    const MMT = safeDiv(v.totPMHours + v.totDetectHours + v.totRepairHours, v.numPM + v.failures);
    const uptime = (isFinite(MTBF) && isFinite(MCMT) && isFinite(MPMT)) ? MTBF - MCMT - MPMT : NaN;
    const availability = (isFinite(uptime) && isFinite(MTBF) && MTBF > 0) ? uptime / MTBF : NaN;
    const lambda = (isFinite(MTBF) && MTBF > 0) ? 1 / MTBF : NaN;
    const FIT = (isFinite(MTBF) && MTBF > 0) ? 1e9 / MTBF : NaN;

    return { MTBF, MTTR, MTTD, MPMT, MCMT, MMT, uptime, availability, lambda, FIT };
  }

  // Compute - Niet-repareerbaar
  function computeNonRepairable(v) {
    const MTTF = safeDiv(v.totItemsHours, v.failures);
    const MPMT = safeDiv(v.totPMHours, v.numPM);
    const MMT = safeDiv(v.totPMHours, v.numPM);
    const uptime = (isFinite(MTTF) && isFinite(MPMT)) ? MTTF - MPMT : NaN;
    const availability = (isFinite(uptime) && isFinite(MTTF) && MTTF > 0) ? uptime / MTTF : NaN;
    const lambda = (isFinite(MTTF) && MTTF > 0) ? 1 / MTTF : NaN;
    const FIT = (isFinite(MTTF) && MTTF > 0) ? 1e9 / MTTF : NaN;

    return { MTTF, MPMT, MMT, uptime, availability, lambda, FIT };
  }

  // Update interactief diagram (Repareerbaar) - MET MPMT
  function updateInteractiveDiagram(results) {
    const topLineGroup = document.getElementById('mtbfTopLine');
    const segmentsGroup = document.getElementById('mtbfSegments');
    const mcmtGroup = document.getElementById('mcmtBracket');
    const markersGroup = document.getElementById('verticalMarkers');
    const labelsGroup = document.getElementById('bottomLabels');
    const kpiBox = document.getElementById('kpiInfoBox');
    
    // Clear previous content
    topLineGroup.innerHTML = '';
    segmentsGroup.innerHTML = '';
    mcmtGroup.innerHTML = '';
    markersGroup.innerHTML = '';
    labelsGroup.innerHTML = '';
    kpiBox.innerHTML = '';
    
    if (!isFinite(results.MTBF) || !isFinite(results.MCMT) || !isFinite(results.MPMT)) {
      return;
    }
    
    // Get current result unit for display
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    // SVG parameters
    const startX = 50;
    const endX = 950;
    const totalWidth = endX - startX;
    const baseY = 190;
    const segmentY = 165;
    const segmentHeight = 50;
    
    // Bereken verhoudingen
    const mttdRatio = results.MTTD / results.MTBF;
    const mttrRatio = results.MTTR / results.MTBF;
    const mpmtRatio = results.MPMT / results.MTBF;
    
    // Intelligente schaling
    let scaledMTTD = Math.min(Math.max(mttdRatio * 35, 0.12), 0.22);
    let scaledMTTR = Math.min(Math.max(mttrRatio * 35, 0.12), 0.22);
    let scaledMPMT = Math.min(Math.max(mpmtRatio * 35, 0.12), 0.22);
    
    // Zorg dat totale downtime max 65% is
    const totalDowntime = scaledMTTD + scaledMTTR + scaledMPMT;
    if (totalDowntime > 0.65) {
      const scale = 0.65 / totalDowntime;
      scaledMTTD *= scale;
      scaledMTTR *= scale;
      scaledMPMT *= scale;
    }
    
    const scaledUptime = 1 - (scaledMTTD + scaledMTTR + scaledMPMT);
    
    // Pixel breedtes
    const mttdWidth = totalWidth * scaledMTTD;
    const mttrWidth = totalWidth * scaledMTTR;
    const mpmtWidth = totalWidth * scaledMPMT;
    const uptimeWidth = totalWidth * scaledUptime;
    
    // MTBF top line met waarde
    const mtbfValue = fmtNum(fromHours(results.MTBF, resultUnit), 2);
    topLineGroup.innerHTML = `
      <line x1="${startX}" y1="50" x2="${endX}" y2="50" stroke="#2A6085" stroke-width="2" stroke-dasharray="8,4" opacity="0.6"/>
      <line x1="${startX}" y1="45" x2="${startX}" y2="55" stroke="#2A6085" stroke-width="2"/>
      <line x1="${endX}" y1="45" x2="${endX}" y2="55" stroke="#2A6085" stroke-width="2"/>
      <text x="${(startX + endX)/2}" y="32" text-anchor="middle" fill="#FBF5EC" font-size="16" font-weight="bold">MTBF</text>
      <text x="${(startX + endX)/2}" y="47" text-anchor="middle" fill="#FBF5EC" font-size="13">${mtbfValue} ${unitLabel}</text>
    `;
    
    // Timeline basis
    segmentsGroup.innerHTML += `
      <line x1="${startX}" y1="${baseY}" x2="${endX}" y2="${baseY}" stroke="#4a90e2" stroke-width="4" stroke-linecap="round"/>
    `;
    
    let currentX = startX;
    
    // 1. MTTD segment
    const mttdValue = fmtNum(fromHours(results.MTTD, resultUnit), 2);
    segmentsGroup.innerHTML += `
      <rect x="${currentX}" y="${segmentY}" width="${mttdWidth}" height="${segmentHeight}" 
            fill="url(#gradMTTD)" rx="6" filter="url(#shadow)"/>
      <text x="${currentX + mttdWidth/2}" y="${segmentY + segmentHeight/2 - 2}" 
            text-anchor="middle" fill="#1a1a1a" font-size="14" font-weight="bold">MTTD</text>
      <text x="${currentX + mttdWidth/2}" y="${segmentY + segmentHeight/2 + 13}" 
            text-anchor="middle" fill="#1a1a1a" font-size="12">${mttdValue} ${unitLabel}</text>
    `;
    currentX += mttdWidth;
    
    // 2. MTTR segment
    const mttrValue = fmtNum(fromHours(results.MTTR, resultUnit), 2);
    segmentsGroup.innerHTML += `
      <rect x="${currentX}" y="${segmentY}" width="${mttrWidth}" height="${segmentHeight}" 
            fill="url(#gradMTTR)" rx="6" filter="url(#shadow)"/>
      <text x="${currentX + mttrWidth/2}" y="${segmentY + segmentHeight/2 - 2}" 
            text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">MTTR</text>
      <text x="${currentX + mttrWidth/2}" y="${segmentY + segmentHeight/2 + 13}" 
            text-anchor="middle" fill="#ffffff" font-size="12">${mttrValue} ${unitLabel}</text>
    `;
    currentX += mttrWidth;
    
    // 3. MPMT segment (Veerenstael BLAUW)
    const mpmtValue = fmtNum(fromHours(results.MPMT, resultUnit), 2);
    segmentsGroup.innerHTML += `
      <rect x="${currentX}" y="${segmentY}" width="${mpmtWidth}" height="${segmentHeight}" 
            fill="url(#gradMPMT)" rx="6" filter="url(#shadow)"/>
      <text x="${currentX + mpmtWidth/2}" y="${segmentY + segmentHeight/2 - 2}" 
            text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">MPMT</text>
      <text x="${currentX + mpmtWidth/2}" y="${segmentY + segmentHeight/2 + 13}" 
            text-anchor="middle" fill="#ffffff" font-size="12">${mpmtValue} ${unitLabel}</text>
    `;
    currentX += mpmtWidth;
    
    // 4. Uptime segment
    const uptimeValue = fmtNum(fromHours(results.uptime, resultUnit), 2);
    segmentsGroup.innerHTML += `
      <rect x="${currentX}" y="${segmentY}" width="${uptimeWidth}" height="${segmentHeight}" 
            fill="url(#gradUptime)" rx="6" filter="url(#shadow)"/>
      <text x="${currentX + uptimeWidth/2}" y="${segmentY + segmentHeight/2 - 2}" 
            text-anchor="middle" fill="#1a1a1a" font-size="14" font-weight="bold">Uptime</text>
      <text x="${currentX + uptimeWidth/2}" y="${segmentY + segmentHeight/2 + 13}" 
            text-anchor="middle" fill="#1a1a1a" font-size="12">${uptimeValue} ${unitLabel}</text>
    `;
    
    // KPI Info Box
    const mtbfLineY = 50;
    const segmentTopY = segmentY;
    const availableSpace = segmentTopY - mtbfLineY;
    const kpiBoxHeight = 95;
    const kpiBoxMargin = (availableSpace - kpiBoxHeight) / 2;
    const kpiBoxY = mtbfLineY + kpiBoxMargin;
    const kpiBoxMiddleY = kpiBoxY + (kpiBoxHeight / 2);
    const kpiBoxX = 700;
    
    kpiBox.innerHTML = `
      <rect x="${kpiBoxX}" y="${kpiBoxY}" width="220" height="${kpiBoxHeight}" fill="#2a3442" stroke="#3a4858" stroke-width="2" rx="10" filter="url(#shadow)"/>
      <text x="${kpiBoxX + 10}" y="${kpiBoxY + 30}" fill="#FBF5EC" font-size="13">Beschikbaarheid:</text>
      <text x="${kpiBoxX + 210}" y="${kpiBoxY + 30}" text-anchor="end" fill="#FBF5EC" font-size="14" font-weight="bold">${fmtPct(results.availability, 2)}</text>
      <text x="${kpiBoxX + 10}" y="${kpiBoxY + 55}" fill="#FBF5EC" font-size="13">Failure Rate Î»:</text>
      <text x="${kpiBoxX + 210}" y="${kpiBoxY + 55}" text-anchor="end" fill="#FBF5EC" font-size="13" font-weight="bold">${fmtNum(results.lambda, 6)}</text>
      <text x="${kpiBoxX + 10}" y="${kpiBoxY + 80}" fill="#FBF5EC" font-size="13">FIT:</text>
      <text x="${kpiBoxX + 210}" y="${kpiBoxY + 80}" text-anchor="end" fill="#FBF5EC" font-size="13" font-weight="bold">${fmtNum(results.FIT, 0)}</text>
    `;
    
    // MMT bracket (tussen MTBF en MCMT - alle onderhoud) - HOGER GEPLAATST
    const mmtWidth = mttdWidth + mttrWidth + mpmtWidth;
    const mmtValue = fmtNum(fromHours(results.MMT, resultUnit), 2);
    const mmtLineY = mtbfLineY + 35; // 35px onder MTBF lijn (PERFECTE VERSIE!)
    
    mcmtGroup.innerHTML = `
      <line x1="${startX}" y1="${mmtLineY}" x2="${startX + mmtWidth}" y2="${mmtLineY}" stroke="#E0A943" stroke-width="2.5"/>
      <line x1="${startX}" y1="${mmtLineY - 4}" x2="${startX}" y2="${mmtLineY + 4}" stroke="#E0A943" stroke-width="2.5"/>
      <line x1="${startX + mmtWidth}" y1="${mmtLineY - 4}" x2="${startX + mmtWidth}" y2="${mmtLineY + 4}" stroke="#E0A943" stroke-width="2.5"/>
      <text x="${startX + mmtWidth/2}" y="${mmtLineY - 16}" text-anchor="middle" fill="#E0A943" font-size="14" font-weight="bold">MMT</text>
      <text x="${startX + mmtWidth/2}" y="${mmtLineY - 4}" text-anchor="middle" fill="#E0A943" font-size="11">${mmtValue} ${unitLabel}</text>
    `;
    
    // MCMT bracket (correctief onderhoud) - LAGER GEPLAATST
    const mcmtWidth = mttdWidth + mttrWidth;
    const mcmtValue = fmtNum(fromHours(results.MCMT, resultUnit), 2);
    const mcmtLineY = kpiBoxMiddleY + 20; // 20px onder midden KPI box (PERFECTE VERSIE!)
    
    mcmtGroup.innerHTML += `
      <line x1="${startX}" y1="${mcmtLineY}" x2="${startX + mcmtWidth}" y2="${mcmtLineY}" stroke="#ff6b35" stroke-width="3"/>
      <line x1="${startX}" y1="${mcmtLineY - 5}" x2="${startX}" y2="${mcmtLineY + 5}" stroke="#ff6b35" stroke-width="3"/>
      <line x1="${startX + mcmtWidth}" y1="${mcmtLineY - 5}" x2="${startX + mcmtWidth}" y2="${mcmtLineY + 5}" stroke="#ff6b35" stroke-width="3"/>
      <text x="${startX + mcmtWidth/2}" y="${mcmtLineY - 15}" text-anchor="middle" fill="#ff6b35" font-size="15" font-weight="bold">MCMT</text>
      <text x="${startX + mcmtWidth/2}" y="${mcmtLineY - 3}" text-anchor="middle" fill="#ff6b35" font-size="12">${mcmtValue} ${unitLabel}</text>
    `;
    
    // Verticale markers
    currentX = startX;
    markersGroup.innerHTML += `
      <line x1="${currentX}" y1="${segmentY}" x2="${currentX}" y2="${baseY + 40}" stroke="#e0e6f0" stroke-width="3"/>
      <text x="${currentX}" y="${baseY + 60}" text-anchor="middle" fill="#FBF5EC" font-size="13" font-weight="bold">Faalmoment</text>
    `;
    currentX += mttdWidth;
    
    markersGroup.innerHTML += `
      <line x1="${currentX}" y1="${segmentY + 5}" x2="${currentX}" y2="${baseY + 40}" stroke="#b8c7e0" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="${currentX}" y="${baseY + 60}" text-anchor="middle" fill="#FBF5EC" font-size="11">Start reparatie</text>
    `;
    currentX += mttrWidth;
    
    markersGroup.innerHTML += `
      <line x1="${currentX}" y1="${segmentY + 5}" x2="${currentX}" y2="${baseY + 40}" stroke="#b8c7e0" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="${currentX}" y="${baseY + 60}" text-anchor="middle" fill="#FBF5EC" font-size="11">Start PM</text>
    `;
    currentX += mpmtWidth;
    
    markersGroup.innerHTML += `
      <line x1="${currentX}" y1="${segmentY + 5}" x2="${currentX}" y2="${baseY + 40}" stroke="#b8c7e0" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="${currentX}" y="${baseY + 55}" text-anchor="middle" fill="#FBF5EC" font-size="11">Systeem</text>
      <text x="${currentX}" y="${baseY + 68}" text-anchor="middle" fill="#FBF5EC" font-size="11">operationeel</text>
    `;
    
    markersGroup.innerHTML += `
      <line x1="${endX}" y1="${segmentY}" x2="${endX}" y2="${baseY + 40}" stroke="#e0e6f0" stroke-width="3"/>
      <text x="${endX}" y="${baseY + 55}" text-anchor="middle" fill="#FBF5EC" font-size="13" font-weight="bold">Volgende</text>
      <text x="${endX}" y="${baseY + 70}" text-anchor="middle" fill="#FBF5EC" font-size="13" font-weight="bold">Faalmoment</text>
    `;
  }

  // Update diagram voor niet-repareerbaar - MET MPMT
  function updateNonRepairableDiagram(results) {
    const topLineGroup = document.getElementById('mtbfTopLine');
    const segmentsGroup = document.getElementById('mtbfSegments');
    const mcmtGroup = document.getElementById('mcmtBracket');
    const markersGroup = document.getElementById('verticalMarkers');
    const labelsGroup = document.getElementById('bottomLabels');
    const kpiBox = document.getElementById('kpiInfoBox');
    
    topLineGroup.innerHTML = '';
    segmentsGroup.innerHTML = '';
    mcmtGroup.innerHTML = '';
    markersGroup.innerHTML = '';
    labelsGroup.innerHTML = '';
    kpiBox.innerHTML = '';
    
    if (!isFinite(results.MTTF) || !isFinite(results.MPMT)) {
      return;
    }
    
    // Get current result unit for display
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    const startX = 50;
    const endX = 950;
    const totalWidth = endX - startX;
    const baseY = 160;
    const segmentY = 135;
    const segmentHeight = 50;
    
    // Bereken verhoudingen
    const mpmtRatio = results.MPMT / results.MTTF;
    let scaledMPMT = Math.min(Math.max(mpmtRatio * 40, 0.15), 0.35);
    const scaledUptime = 1 - scaledMPMT;
    
    const mpmtWidth = totalWidth * scaledMPMT;
    const uptimeWidth = totalWidth * scaledUptime;
    
    // MTTF top line met waarde
    const mttfValue = fmtNum(fromHours(results.MTTF, resultUnit), 2);
    topLineGroup.innerHTML = `
      <line x1="${startX}" y1="50" x2="${endX}" y2="50" stroke="#2A6085" stroke-width="2" stroke-dasharray="8,4" opacity="0.6"/>
      <text x="${(startX + endX)/2}" y="32" text-anchor="middle" fill="#FBF5EC" font-size="16" font-weight="bold">MTTF (Mean Time To Failure)</text>
      <text x="${(startX + endX)/2}" y="47" text-anchor="middle" fill="#FBF5EC" font-size="13">${mttfValue} ${unitLabel}</text>
    `;
    
    // Timeline basis
    segmentsGroup.innerHTML += `
      <line x1="${startX}" y1="${baseY}" x2="${endX}" y2="${baseY}" stroke="#4a90e2" stroke-width="4" stroke-linecap="round"/>
    `;
    
    let currentX = startX;
    
    // 1. MPMT segment
    const mpmtValue = fmtNum(fromHours(results.MPMT, resultUnit), 2);
    segmentsGroup.innerHTML += `
      <rect x="${currentX}" y="${segmentY}" width="${mpmtWidth}" height="${segmentHeight}" 
            fill="url(#gradMPMT)" rx="6" filter="url(#shadow)"/>
      <text x="${currentX + mpmtWidth/2}" y="${segmentY + segmentHeight/2 - 2}" 
            text-anchor="middle" fill="#ffffff" font-size="14" font-weight="bold">MPMT</text>
      <text x="${currentX + mpmtWidth/2}" y="${segmentY + segmentHeight/2 + 13}" 
            text-anchor="middle" fill="#ffffff" font-size="12">${mpmtValue} ${unitLabel}</text>
    `;
    currentX += mpmtWidth;
    
    // 2. Uptime segment (operationele levensduur)
    const uptimeValue = fmtNum(fromHours(results.uptime, resultUnit), 2);
    segmentsGroup.innerHTML += `
      <rect x="${currentX}" y="${segmentY}" width="${uptimeWidth}" height="${segmentHeight}" 
            fill="url(#gradUptime)" rx="6" filter="url(#shadow)"/>
      <text x="${currentX + uptimeWidth/2}" y="${segmentY + segmentHeight/2 - 2}" 
            text-anchor="middle" fill="#1a1a1a" font-size="14" font-weight="bold">Uptime</text>
      <text x="${currentX + uptimeWidth/2}" y="${segmentY + segmentHeight/2 + 13}" 
            text-anchor="middle" fill="#1a1a1a" font-size="12">${uptimeValue} ${unitLabel}</text>
    `;
    
    // Verticale markers
    markersGroup.innerHTML = `
      <line x1="${startX}" y1="${segmentY}" x2="${startX}" y2="${baseY + 50}" stroke="#e0e6f0" stroke-width="3"/>
      <text x="${startX}" y="${baseY + 70}" text-anchor="middle" fill="#FBF5EC" font-size="14" font-weight="bold">Start</text>
      
      <line x1="${startX + mpmtWidth}" y1="${segmentY + 5}" x2="${startX + mpmtWidth}" y2="${baseY + 50}" stroke="#b8c7e0" stroke-width="2" stroke-dasharray="4,2"/>
      <text x="${startX + mpmtWidth}" y="${baseY + 70}" text-anchor="middle" fill="#FBF5EC" font-size="11">Einde PM</text>
      
      <line x1="${endX}" y1="${segmentY}" x2="${endX}" y2="${baseY + 50}" stroke="#ff4444" stroke-width="3"/>
      <text x="${endX}" y="${baseY + 70}" text-anchor="middle" fill="#ff6b35" font-size="14" font-weight="bold">Falen</text>
    `;
    
    // KPI Info Box
    const kpiBoxHeight = 75;
    const kpiBoxY = 85;
    const kpiBoxX = 700;
    
    kpiBox.innerHTML = `
      <rect x="${kpiBoxX}" y="${kpiBoxY}" width="200" height="${kpiBoxHeight}" fill="#2a3442" stroke="#3a4858" stroke-width="2" rx="10" filter="url(#shadow)"/>
      <text x="${kpiBoxX + 10}" y="${kpiBoxY + 35}" fill="#FBF5EC" font-size="13">Failure Rate Î»:</text>
      <text x="${kpiBoxX + 190}" y="${kpiBoxY + 35}" text-anchor="end" fill="#FBF5EC" font-weight="bold" font-size="13">${fmtNum(results.lambda, 6)}</text>
      <text x="${kpiBoxX + 10}" y="${kpiBoxY + 60}" fill="#FBF5EC" font-size="13">FIT:</text>
      <text x="${kpiBoxX + 190}" y="${kpiBoxY + 60}" text-anchor="end" fill="#FBF5EC" font-weight="bold" font-size="13">${fmtNum(results.FIT, 0)}</text>
    `;
  }

  // Update UI - Repareerbaar
  function updateUIRepairable(r) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    document.getElementById('outMTBF').textContent = fmtNum(fromHours(r.MTBF, resultUnit), 2);
    document.getElementById('outMTTR').textContent = fmtNum(fromHours(r.MTTR, resultUnit), 2);
    document.getElementById('outMTTD').textContent = fmtNum(fromHours(r.MTTD, resultUnit), 2);
    document.getElementById('outMCMT').textContent = fmtNum(fromHours(r.MCMT, resultUnit), 2);
    document.getElementById('outMPMT').textContent = fmtNum(fromHours(r.MPMT, resultUnit), 2);
    document.getElementById('outMMT').textContent = fmtNum(fromHours(r.MMT, resultUnit), 2);
    document.getElementById('outUptime').textContent = fmtNum(fromHours(r.uptime, resultUnit), 2);
    document.getElementById('outA').textContent = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 8);
    document.getElementById('outFIT').textContent = fmtNum(r.FIT, 2);
    
    document.getElementById('unitMTBF').textContent = unitLabel;
    document.getElementById('unitMTTR').textContent = unitLabel;
    document.getElementById('unitMTTD').textContent = unitLabel;
    document.getElementById('unitMCMT').textContent = unitLabel;
    document.getElementById('unitMPMT').textContent = unitLabel;
    document.getElementById('unitMMT').textContent = unitLabel;
    document.getElementById('unitUptime').textContent = unitLabel;
    
    updateInteractiveDiagram(r);
  }

  // Update UI - Niet-repareerbaar
  function updateUINonRepairable(r) {
    const resultUnit = document.getElementById('resultUnit').value;
    const unitLabel = getUnitLabel(resultUnit);
    
    document.getElementById('outMTTF').textContent = fmtNum(fromHours(r.MTTF, resultUnit), 2);
    document.getElementById('outMPMT').textContent = fmtNum(fromHours(r.MPMT, resultUnit), 2);
    document.getElementById('outMMT').textContent = fmtNum(fromHours(r.MMT, resultUnit), 2);
    document.getElementById('outUptime').textContent = fmtNum(fromHours(r.uptime, resultUnit), 2);
    document.getElementById('outA').textContent = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 8);
    document.getElementById('outFIT').textContent = fmtNum(r.FIT, 2);
    
    document.getElementById('unitMTTF').textContent = unitLabel;
    document.getElementById('unitMPMT').textContent = unitLabel;
    document.getElementById('unitMMT').textContent = unitLabel;
    document.getElementById('unitUptime').textContent = unitLabel;
    
    updateNonRepairableDiagram(r);
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
    
    // Auto-scroll naar resultaten sectie
    setTimeout(() => {
      const resultSection = document.querySelector('.result-section');
      if (resultSection) {
        resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
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
    pdf.setFillColor(42, 96, 133); // #2A6085
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
    pdf.setTextColor(29, 29, 27); // #1D1D1B
    pdf.setFont(undefined, 'bold');
    pdf.text('Rapport - Onderhoudsparameters', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 5;
    
    // Type analyse + datum
    pdf.setFontSize(9);
    const dateStr = new Date().toLocaleDateString('nl-NL', { 
      year: 'numeric', month: 'long', day: 'numeric' 
    });
    pdf.text(`Type: ${isRepairable ? 'Repareerbaar (systemen/machines)' : 'Niet-repareerbaar (componenten)'}  |  ${dateStr}`, leftMargin, yPos);
    yPos += 15;
    
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
    pdf.text(`Totale bedrijfstijd: ${fmtNum(inputs.totItemsHours, 0)} uur`, col1X + 2, col1Y);
    col1Y += 4;
    pdf.text(`Aantal faalmomenten: ${fmtNum(inputs.failures, 0)}`, col1X + 2, col1Y);
    col1Y += 4;
    
    if (isRepairable) {
      pdf.text(`Totale reparatietijd: ${fmtNum(inputs.totRepairHours, 2)} uur`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Totale detectietijd: ${fmtNum(inputs.totDetectHours, 2)} uur`, col1X + 2, col1Y);
      col1Y += 4;
    }
    pdf.text(`Totale PM-tijd: ${fmtNum(inputs.totPMHours, 2)} uur`, col1X + 2, col1Y);
    col1Y += 4;
    pdf.text(`Aantal keer PM: ${fmtNum(inputs.numPM, 0)}`, col1X + 2, col1Y);
    col1Y += 4;
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
      pdf.text(`MPMT: ${fmtNum(fromHours(results.MPMT, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`MMT: ${fmtNum(fromHours(results.MMT, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Uptime: ${fmtNum(fromHours(results.uptime, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Beschikbaarheid [A]: ${fmtPct(results.availability, 2)}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Failure Rate: ${fmtNum(results.lambda, 8)} per uur`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`FIT: ${fmtNum(results.FIT, 2)} per 10^9 uur`, col1X + 2, col1Y);
    } else {
      const results = computeNonRepairable(inputs);
      pdf.text(`MTTF: ${fmtNum(fromHours(results.MTTF, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`MPMT: ${fmtNum(fromHours(results.MPMT, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`MMT: ${fmtNum(fromHours(results.MMT, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Uptime: ${fmtNum(fromHours(results.uptime, resultUnit), 2)} ${unitLabel}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Beschikbaarheid [A]: ${fmtPct(results.availability, 2)}`, col1X + 2, col1Y);
      col1Y += 4;
      pdf.text(`Failure Rate: ${fmtNum(results.lambda, 8)} per uur`, col1X + 2, col1Y);
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
      pdf.text('MPMT = [Totale PM-tijd] / [Aantal keer PM]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MCMT = MTTR + MTTD', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MMT = (Totale Onderhoudstijd) / ([Aantal keer PM] + [Aantal faalmomenten])', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Uptime = MTBF - MMT', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Beschikbaarheid [A] = Uptime / MTBF', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Failure Rate = 1 / MTBF', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('FIT = 1.000.000.000 / MTBF', col2X + 2, col2Y);
    } else {
      pdf.text('MTTF = [Totale bedrijfstijd] / [Aantal faalmomenten]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MPMT = [Totale PM-tijd] / [Aantal keer PM]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('MMT = [Totale PM-tijd] / [Aantal keer PM]', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Uptime = MTTF - MPMT', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Beschikbaarheid [A] = Uptime / MTTF', col2X + 2, col2Y);
      col2Y += 4;
      pdf.text('Failure Rate = 1 / MTTF', col2X + 2, col2Y);
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
        const maxImgHeight = 130;
        const aspectRatio = diagramImg.naturalWidth / diagramImg.naturalHeight;
        
        let imgWidth = maxImgWidth;
        let imgHeight = imgWidth / aspectRatio;
        
        if (imgHeight > maxImgHeight) {
          imgHeight = maxImgHeight;
          imgWidth = imgHeight * aspectRatio;
        }
        
        const imgX = (210 - imgWidth) / 2;
        const imgY = Math.max(col1Y, col2Y) + 10;
        
        pdf.addImage(imgDataUrl, 'JPEG', imgX, imgY, imgWidth, imgHeight);
      } catch(e) {
        console.log('Diagram niet beschikbaar voor PDF:', e);
      }
    }
    
    // Contactinfo onderaan (NIEUW!)
    yPos = 265;
    pdf.setFillColor(251, 245, 236); // #FBF5EC (OFF WHITE)
    pdf.rect(0, yPos, 210, 32, 'F');
    
    yPos += 8;
    pdf.setFontSize(9);
    pdf.setTextColor(29, 29, 27); // #1D1D1B
    pdf.setFont(undefined, 'bold');
    pdf.text('Over deze berekeningen', leftMargin, yPos);
    pdf.setFont(undefined, 'normal');
    yPos += 5;
    
    pdf.setFontSize(8);
    pdf.text('Dit is slechts een eenvoudig en enkelvoudig voorbeeld. Voor complexere berekeningen', leftMargin, yPos);
    yPos += 4;
    pdf.text('of analyses kunt u Veerenstael inzetten. Neem contact op met onze Business Development', leftMargin, yPos);
    yPos += 4;
    pdf.text('Manager, of vul het contactformulier in op: https://www.veerenstael.nl/contact/ .', leftMargin, yPos);
    
    // Logo's rechts gecentreerd in OFF WHITE vak, boven elkaar
    const logoSize = 5; // 5mm hoog (was 10mm)
    const logoSpacing = 2; // 2mm tussen logo's (verticaal)
    const logoX = 210 - 25; // 25mm van rechts (gecentreerd in rechterhelft)
    
    // Bereken totale hoogte van beide logo's + spacing
    const totalLogoHeight = logoSize * 2 + logoSpacing;
    const boxStartY = 265; // Start OFF WHITE box
    const boxHeight = 32;
    const logoStartY = boxStartY + (boxHeight - totalLogoHeight) / 2; // Verticaal gecentreerd
    
    // Website logo (bovenaan)
    const websiteLogo = document.querySelector('img[src*="logo-website"]');
    if (websiteLogo && websiteLogo.complete) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = websiteLogo.naturalWidth;
        canvas.height = websiteLogo.naturalHeight;
        ctx.drawImage(websiteLogo, 0, 0);
        const websiteDataUrl = canvas.toDataURL('image/png');
        
        const websiteAspect = websiteLogo.naturalWidth / websiteLogo.naturalHeight;
        const websiteWidth = logoSize * websiteAspect;
        const websiteX = logoX - (websiteWidth / 2); // Horizontaal gecentreerd
        
        pdf.addImage(websiteDataUrl, 'PNG', websiteX, logoStartY, websiteWidth, logoSize);
        pdf.link(websiteX, logoStartY, websiteWidth, logoSize, { url: 'https://www.veerenstael.nl' });
      } catch(e) {
        console.log('Website logo niet beschikbaar voor PDF');
      }
    }
    
    // LinkedIn logo (onderaan)
    const linkedinLogo = document.querySelector('img[src*="logo-linkedin"]');
    if (linkedinLogo && linkedinLogo.complete) {
      try {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = linkedinLogo.naturalWidth;
        canvas.height = linkedinLogo.naturalHeight;
        ctx.drawImage(linkedinLogo, 0, 0);
        const linkedinDataUrl = canvas.toDataURL('image/png');
        
        const linkedinAspect = linkedinLogo.naturalWidth / linkedinLogo.naturalHeight;
        const linkedinWidth = logoSize * linkedinAspect;
        const linkedinX = logoX - (linkedinWidth / 2); // Horizontaal gecentreerd
        const linkedinY = logoStartY + logoSize + logoSpacing; // Onder website logo
        
        pdf.addImage(linkedinDataUrl, 'PNG', linkedinX, linkedinY, linkedinWidth, logoSize);
        pdf.link(linkedinX, linkedinY, linkedinWidth, logoSize, { url: 'https://www.linkedin.com/company/veerenstael/posts/?feedView=all' });
      } catch(e) {
        console.log('LinkedIn logo niet beschikbaar voor PDF');
      }
    }
    
    // Opslaan met timestamp
    const now = new Date();
    const dateStamp = now.getFullYear().toString() + 
                     (now.getMonth() + 1).toString().padStart(2, '0') + 
                     now.getDate().toString().padStart(2, '0');
    const timeStamp = now.getHours().toString().padStart(2, '0') + 
                     now.getMinutes().toString().padStart(2, '0');
    const fileName = `Veerenstael_Betrouwbaarheidsrapport_${dateStamp}_${timeStamp}.pdf`;
    pdf.save(fileName);
  });
})();
