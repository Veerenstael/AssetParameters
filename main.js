// KPI & Betrouwbaarheid Tool (zelfde stijl/aanpak als je SparePart Tool-logica qua structuur):contentReference[oaicite:3]{index=3}
(function () {
  // Helpers voor weergave
  const nf = (d = 2) =>
    new Intl.NumberFormat('nl-NL', {
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });
  const pf = (d = 4) =>
    new Intl.NumberFormat('nl-NL', {
      style: 'percent',
      minimumFractionDigits: d,
      maximumFractionDigits: d,
    });

  const fmtNum = (x, d = 2) => (isFinite(x) ? nf(d).format(x) : '—');
  const fmtPct = (x, d = 4) => (isFinite(x) ? pf(d).format(x) : '—');
  const safeDiv = (num, den) => (den > 0 ? num / den : NaN);

  // Lezen & valideren
  function readInputs() {
    return {
      totItemsHours: parseFloat(document.getElementById('totItemsHours').value),
      failedItems: parseFloat(document.getElementById('failedItems').value),
      totHours: parseFloat(document.getElementById('totHours').value),
      failures: parseFloat(document.getElementById('failures').value),
      totRepairHours: parseFloat(document.getElementById('totRepairHours').value),
      pmCount: parseFloat(document.getElementById('pmCount').value),
      cmCount: parseFloat(document.getElementById('cmCount').value),
    };
  }

  function validate(v) {
    const warn = document.getElementById('warn');
    const messages = [];

    // Logische checks
    if (v.failedItems > v.totItemsHours && v.failedItems > 0) {
      messages.push(
        'Waarschuwing: aantal falende items lijkt hoger dan het aantal uren totale bedrijfstijd van alle items. Controleer je invoer.'
      );
    }
    if (v.failures > (v.pmCount + v.cmCount) && v.failures > 0) {
      messages.push(
        'Let op: aantal storingen is groter dan (geplande + ongeplande) onderhoudsacties. Is je registratie compleet?'
      );
    }
    if (v.totRepairHours > v.totHours && v.totHours > 0) {
      messages.push(
        'Let op: totale hersteltijd is groter dan totale bedrijfstijd. Controleer de meetperiode.'
      );
    }

    if (messages.length) {
      warn.hidden = false;
      warn.innerHTML = messages.join(' ');
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
    const availability = (function () {
      if (isFinite(MTBF) && isFinite(MTTR) && MTBF > 0 && MTTR >= 0) {
        return MTBF / (MTBF + MTTR);
      }
      return NaN;
    })();
    const lambda = safeDiv(v.failures, v.totHours);       // storingen per uur
    const FIT = isFinite(lambda) ? lambda * 1e9 : NaN;    // per miljard uur
    const totalMaint = v.pmCount + v.cmCount;
    const MTBM = safeDiv(v.totHours, totalMaint);         // tijd tussen onderhoud
    const MCMT = safeDiv(v.totRepairHours, v.cmCount);    // gemiddelde duur correctief

    return { MTTF, MTBF, MTTR, availability, lambda, FIT, MTBM, MCMT };
  }

  // UI bijwerken
  function updateUI(r) {
    document.getElementById('outMTTF').textContent = fmtNum(r.MTTF, 2);
    document.getElementById('outMTBF').textContent = fmtNum(r.MTBF, 2);
    document.getElementById('outMTTR').textContent = fmtNum(r.MTTR, 2);
    document.getElementById('outA').textContent = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 6);
    document.getElementById('outFIT').textContent = fmtNum(r.FIT, 2);
    document.getElementById('outMTBM').textContent = fmtNum(r.MTBM, 2);
    document.getElementById('outMCMT').textContent = fmtNum(r.MCMT, 2);
  }

  // Chart.js setup
  let chart;
  function updateChart(r) {
    const ctx = document.getElementById('kpiChart').getContext('2d');

    const dataLabels = ['MTTF', 'MTBF', 'MTTR', 'MTBM', 'MCMT', 'λ', 'A', 'FIT'];
    const hoursSeries = [
      r.MTTF,
      r.MTBF,
      r.MTTR,
      r.MTBM,
      r.MCMT,
      null, // λ niet in uren
      null, // A niet in uren
      null, // FIT niet in uren
    ];
    const rateSeries = [
      null,
      null,
      null,
      null,
      null,
      r.lambda, // per uur
      null,
      null,
    ];
    const availSeries = [
      null,
      null,
      null,
      null,
      null,
      null,
      r.availability, // 0..1
      null,
    ];
    const fitSeries = [
      null,
      null,
      null,
      null,
      null,
      null,
      null,
      r.FIT, // per 10^9 uur
    ];

    const dsHours = {
      type: 'bar',
      label: 'Uren (MTTF, MTBF, MTTR, MTBM, MCMT)',
      data: hoursSeries,
      yAxisID: 'yHours',
      borderWidth: 1,
    };
    const dsRate = {
      type: 'line',
      label: 'λ (per uur)',
      data: rateSeries,
      yAxisID: 'yRate',
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 3,
    };
    const dsAvail = {
      type: 'line',
      label: 'Beschikbaarheid A (0–1)',
      data: availSeries,
      yAxisID: 'yAvail',
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 3,
    };
    const dsFIT = {
      type: 'line',
      label: 'FIT (per 10^9 uur)',
      data: fitSeries,
      yAxisID: 'yFIT',
      borderWidth: 2,
      tension: 0.25,
      pointRadius: 3,
    };

    const config = {
      data: {
        labels: dataLabels,
        datasets: [dsHours, dsRate, dsAvail, dsFIT],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { position: 'top' },
          tooltip: {
            callbacks: {
              // Mooie, consistente weergave per as
              label: function (ctx) {
                const label = ctx.dataset.label || '';
                const val = ctx.parsed.y;
                if (!isFinite(val)) return null;
                if (ctx.dataset.yAxisID === 'yAvail') return `${label}: ${pf(4).format(val)}`;
                if (ctx.dataset.yAxisID === 'yRate') return `${label}: ${nf(6).format(val)} /uur`;
                if (ctx.dataset.yAxisID === 'yFIT') return `${label}: ${nf(2).format(val)} per 10^9 uur`;
                return `${label}: ${nf(2).format(val)} uur`;
              },
            },
          },
        },
        scales: {
          yHours: {
            position: 'left',
            title: { display: true, text: 'Uren' },
            grid: { drawOnChartArea: true },
          },
          yRate: {
            position: 'right',
            title: { display: true, text: 'Per uur (λ)' },
            grid: { drawOnChartArea: false },
            ticks: { callback: (v) => nf(6).format(v) },
          },
          yAvail: {
            position: 'right',
            title: { display: true, text: 'Beschikbaarheid (0–1)' },
            min: 0,
            max: 1,
            grid: { drawOnChartArea: false },
          },
          yFIT: {
            position: 'right',
            title: { display: true, text: 'FIT (per 10^9 uur)' },
            grid: { drawOnChartArea: false },
          },
          x: {
            title: { display: false, text: 'KPI' },
          },
        },
      },
    };

    if (chart) {
      chart.data = config.data;
      chart.options = config.options;
      chart.update();
    } else {
      chart = new Chart(ctx, config);
    }
  }

  // Submit handler
  document.getElementById('kpi-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = readInputs();
    validate(inputs);
    const results = compute(inputs);
    updateUI(results);
    updateChart(results);
  });

  // Init met default waarden
  const initVals = readInputs();
  validate(initVals);
  const initResults = compute(initVals);
  updateUI(initResults);
  updateChart(initResults);
})();
