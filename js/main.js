// Year in footer
document.getElementById('year').textContent = new Date().getFullYear();

// Efficiency calculator
(function () {
  const EPOCH_PARTICIPANTS_URL = 'https://node4.gonka.ai/v1/epochs/current/participants';
  const POLL_MS = 30000;

  const elEffEpoch = document.getElementById('eff-epoch');
  const elEffUpdated = document.getElementById('eff-updated');
  const elEffA100 = document.getElementById('eff-a100');
  const elEffH100 = document.getElementById('eff-h100');
  const elEffH200 = document.getElementById('eff-h200');
  const elEffB200 = document.getElementById('eff-b200');

  const PRICE_PER_GPU_HR = { A100: 0.99, H100: 1.80, H200: 2.40, B200: 3.50 };
  const WEIGHT_PER_GPU_FALLBACK = { A100: 256.498, H100: 606.046, H200: 619.000, B200: 955.921 };
  let weightsPayload = { epoch: null, weights: { ...WEIGHT_PER_GPU_FALLBACK } };
  let weightsLoaded = false;

  function fmtUpdatedUTC(d) {
    const hh = String(d.getUTCHours()).padStart(2, '0');
    const mm = String(d.getUTCMinutes()).padStart(2, '0');
    const ss = String(d.getUTCSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  async function fetchJson(url) {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), 8000);
    try {
      const res = await fetch(url, { signal: ctrl.signal, cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return await res.json();
    } finally {
      clearTimeout(t);
    }
  }

  function extractEpoch(j) {
    const ap = j && j.active_participants;
    return { epochId: ap && ap.epoch_id };
  }

  function parseWeightsPayload(obj) {
    const out = { epoch: null, weights: {} };
    if (!obj || typeof obj !== 'object') return out;
    if (obj.epoch != null) out.epoch = obj.epoch;
    const w = obj.weights;
    if (w && typeof w === 'object') {
      for (const k of Object.keys(w)) {
        const v = Number(w[k]);
        if (Number.isFinite(v)) out.weights[k.toUpperCase()] = v;
      }
    }
    return out;
  }

  async function maybeLoadWeightsFromUrl() {
    if (weightsLoaded) return;
    let wurl = null;
    try {
      const u = new URL(window.location.href);
      wurl = u.searchParams.get('weightsUrl');
    } catch {}
    if (!wurl) return;
    try {
      const j = await fetchJson(wurl);
      const p = parseWeightsPayload(j);
      if (Object.keys(p.weights).length) {
        weightsPayload = p;
        weightsLoaded = true;
      }
    } catch {}
  }

  function setEff(el, v) {
    if (!el) return;
    el.textContent = (v == null || !Number.isFinite(v)) ? '—' : v.toFixed(3);
  }

  function renderEfficiency(epochId, updatedNow) {
    const w = weightsPayload.weights || {};
    const vA100 = (w.A100 && PRICE_PER_GPU_HR.A100) ? (w.A100 / PRICE_PER_GPU_HR.A100) : null;
    const vH100 = (w.H100 && PRICE_PER_GPU_HR.H100) ? (w.H100 / PRICE_PER_GPU_HR.H100) : null;
    const vH200 = (w.H200 && PRICE_PER_GPU_HR.H200) ? (w.H200 / PRICE_PER_GPU_HR.H200) : null;
    const vB200 = (w.B200 && PRICE_PER_GPU_HR.B200) ? (w.B200 / PRICE_PER_GPU_HR.B200) : null;

    setEff(elEffA100, vA100);
    setEff(elEffH100, vH100);
    setEff(elEffH200, vH200);
    setEff(elEffB200, vB200);

    const list = document.querySelector('.eff-list');
    if (list) {
      const byGpu = { A100: vA100, H100: vH100, H200: vH200, B200: vB200 };
      const items = Array.from(list.querySelectorAll('.eff-item'));
      for (const it of items) {
        const g = it.getAttribute('data-gpu');
        const vv = (g && Object.prototype.hasOwnProperty.call(byGpu, g)) ? byGpu[g] : null;
        it.dataset.eff = (vv == null || !Number.isFinite(vv)) ? '' : String(vv);
      }
      items.sort((a, b) => {
        const av = Number(a.dataset.eff);
        const bv = Number(b.dataset.eff);
        const aOk = Number.isFinite(av);
        const bOk = Number.isFinite(bv);
        if (aOk && bOk) return bv - av;
        if (bOk) return 1;
        if (aOk) return -1;
        return 0;
      });
      for (const it of items) list.appendChild(it);

      const maxEff = Math.max(...items.map(it => Number(it.dataset.eff)).filter(n => Number.isFinite(n)), 0);
      items.forEach((it, idx) => {
        it.dataset.rank = String(idx + 1);
        const v = Number(it.dataset.eff);
        const pct = (Number.isFinite(v) && maxEff > 0) ? Math.max(0, Math.min(100, (v / maxEff) * 100)) : 0;
        const bar = it.querySelector('.eff-bar');
        if (bar) bar.style.width = `${pct.toFixed(1)}%`;
      });
    }

    const ep = (weightsPayload.epoch != null) ? weightsPayload.epoch : epochId;
    if (elEffEpoch) elEffEpoch.textContent = (ep != null ? String(ep) : '—');
    if (elEffUpdated) elEffUpdated.textContent = fmtUpdatedUTC(updatedNow);
  }

  async function refresh() {
    const updatedNow = new Date();
    try {
      const epochJ = await fetchJson(EPOCH_PARTICIPANTS_URL);
      const ep = extractEpoch(epochJ);
      await maybeLoadWeightsFromUrl();
      renderEfficiency(ep.epochId, updatedNow);
    } catch {
      await maybeLoadWeightsFromUrl();
      renderEfficiency(null, updatedNow);
    }
  }

  refresh();
  setInterval(refresh, POLL_MS);
})();
