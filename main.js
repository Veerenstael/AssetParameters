// KPI & Betrouwbaarheid Tool
// Zelfde aanpak/structuur als je vorige project (formatters, event-handler):contentReference[oaicite:3]{index=3}
(function () {
  // Conversieconstanten
  const HOURS_PER_DAY = 24;
  const HOURS_PER_YEAR = 365.25 * 24;

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

  // Lezen & normaliseren naar uren
  function readInputs() {
    const totItemsValue = parseFloat(document.getElementById('totItemsValue').value);
    const totItemsUnit  = document.getElementById('totItemsUnit').value;
    const totHoursValue = parseFloat(document.getElementById('totHoursValue').value);
    const totHoursUnit  = document.getElementById('totHoursUnit').value;

    return {
      totItemsHours: toHours(totItemsValue, totItemsUnit), // uren
      failedItems: parseFloat(document.getElementById('failedItems').value),
      totHours: toHours(totHoursValue, totHoursUnit),       // uren
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
    document.getElementById('outMTTF').textContent = fmtNum(r.MTTF, 2);
    document.getElementById('outMTBF').textContent = fmtNum(r.MTBF, 2);
    document.getElementById('outMTTR').textContent = fmtNum(r.MTTR, 2);
    document.getElementById('outA').textContent    = fmtPct(r.availability, 4);
    document.getElementById('outLambda').textContent = fmtNum(r.lambda, 6);
    document.getElementById('outFIT').textContent    = fmtNum(r.FIT, 2);
    document.getElementById('outMTBM').textContent   = fmtNum(r.MTBM, 2);
    document.getElementById('outMCMT').textContent   = fmtNum(r.MCMT, 2);
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
