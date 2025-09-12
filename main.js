// SparePart Tool berekeningen
(function () {
  const HOURS_PER_YEAR = 365.25 * 24;

  const nf = (d = 2) => new Intl.NumberFormat('nl-NL', { minimumFractionDigits: d, maximumFractionDigits: d });
  const pf = (d = 4) => new Intl.NumberFormat('nl-NL', { style: 'percent', minimumFractionDigits: d, maximumFractionDigits: d });
  const fmtNum = (x, d = 6) => isFinite(x) ? nf(d).format(x) : '—';
  const fmtPct = (x, d = 4) => isFinite(x) ? pf(d).format(x) : '—';

  function poissonCDF(K, mu) {
    if (K < 0) return 0;
    if (mu === 0) return 1;
    let term = Math.exp(-mu), sum = term;
    for (let k = 1; k <= K; k++) {
      term *= mu / k;
      sum += term;
      if (term < 1e-16) break;
    }
    return sum;
  }
  function runoutProbability(n, mu) {
    if (n <= 0) return 1;
    return 1 - poissonCDF(n - 1, mu);
  }
  function compute({ m, lambda, n, TstM, TstZ }) {
    const Ta = Math.max(0, (TstZ - TstM) / HOURS_PER_YEAR);
    const mu = m * lambda * Ta;
    const P = runoutProbability(n, mu);
    const downtime = (P * (TstZ - TstM) + TstM) * lambda * m;
    const unavailability = downtime / HOURS_PER_YEAR;
    return { Ta, mu, P, downtime, unavailability, availability: 1 - unavailability, cdfToNminus1: 1 - P };
  }

  function readInputs() {
    return {
      m: parseFloat(document.getElementById('m').value),
      lambda: parseFloat(document.getElementById('lambda').value),
      n: parseFloat(document.getElementById('n').value),
      TstM: parseFloat(document.getElementById('tstm').value),
      TstZ: parseFloat(document.getElementById('tstz').value),
    };
  }
  function validate({ TstM, TstZ }) {
    const warn = document.getElementById('warn');
    if (TstZ < TstM) {
      warn.hidden = false;
      warn.textContent = "Let op: TstZ (zonder voorraad) is kleiner dan TstM (met voorraad). Tₐ wordt op 0 gezet.";
    } else {
      warn.hidden = true;
    }
  }
  function updateUI(r) {
    document.getElementById('outP').textContent  = fmtPct(r.P, 4);
    document.getElementById('outDT').textContent = nf(2).format(r.downtime);
    document.getElementById('outUA').textContent = fmtPct(r.unavailability, 6);
    document.getElementById('outAV').textContent = fmtPct(r.availability, 6);
    document.getElementById('outTa').textContent = fmtNum(r.Ta, 6);
    document.getElementById('outMu').textContent = fmtNum(r.mu, 6);
    document.getElementById('outCDF').textContent = fmtNum(r.cdfToNminus1, 6);
  }

  document.getElementById('spares-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const inputs = readInputs();
    validate(inputs);
    updateUI(compute(inputs));
  });
})();
