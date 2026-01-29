/**
 * MineGNK - Main JavaScript
 * Handles footer year, pricing cards, and efficiency calculator
 */

// ============================================================================
// Configuration - Single source of truth for GPU data
// ============================================================================

const GPU_CONFIG = {
  A100: {
    name: 'A100',
    pricePerGpuHour: 0.99,
    gpusPerServer: 8,
    fallbackWeight: 256.498,
  },
  H100: {
    name: 'H100',
    pricePerGpuHour: 1.80,
    gpusPerServer: 8,
    fallbackWeight: 606.046,
  },
  H200: {
    name: 'H200',
    pricePerGpuHour: 2.40,
    gpusPerServer: 8,
    fallbackWeight: 619.000,
  },
  B200: {
    name: 'B200',
    pricePerGpuHour: 3.50,
    gpusPerServer: 8,
    fallbackWeight: 955.921,
  },
};

const API_CONFIG = {
  epochParticipantsUrl: 'https://node4.gonka.ai/v1/epochs/current/participants',
  pollIntervalMs: 30000,
  timeoutMs: 8000,
};

// ============================================================================
// Utilities
// ============================================================================

/**
 * Calculates monthly price from hourly GPU rate
 * @param {number} pricePerGpuHour - Price per GPU per hour
 * @param {number} gpusPerServer - Number of GPUs per server
 * @returns {number} Monthly price (assuming 730 hours/month)
 */
function calculateMonthlyPrice(pricePerGpuHour, gpusPerServer) {
  const hoursPerMonth = 730;
  return pricePerGpuHour * gpusPerServer * hoursPerMonth;
}

/**
 * Formats a number as currency
 * @param {number} value - The value to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
  return value.toLocaleString('en-US', { maximumFractionDigits: 0 });
}

/**
 * Formats a Date as UTC time string (HH:MM:SS)
 * @param {Date} date - The date to format
 * @returns {string} Formatted time string
 */
function formatTimeUTC(date) {
  const hours = String(date.getUTCHours()).padStart(2, '0');
  const minutes = String(date.getUTCMinutes()).padStart(2, '0');
  const seconds = String(date.getUTCSeconds()).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
}

// ============================================================================
// Footer Year
// ============================================================================

document.getElementById('year').textContent = new Date().getFullYear();

// ============================================================================
// Pricing Cards Generator
// ============================================================================

(function initPricingCards() {
  const container = document.getElementById('pricing-cards');
  if (!container) return;

  const gpuTypes = Object.keys(GPU_CONFIG);

  container.innerHTML = gpuTypes.map(gpuType => {
    const config = GPU_CONFIG[gpuType];
    const monthlyPrice = calculateMonthlyPrice(config.pricePerGpuHour, config.gpusPerServer);

    return `
      <div class="pricing-card" id="pkg-${gpuType.toLowerCase()}" data-gpu-type="${gpuType}">
        <h3>${config.gpusPerServer}x ${config.name} Server</h3>
        <div class="price">$${formatCurrency(monthlyPrice)}<span class="price-unit">/month</span></div>
        <p class="price-sub"><strong>$${config.pricePerGpuHour.toFixed(2)}</strong> per GPU/hour</p>
        <p>Month-to-month contract</p>
        <button class="btn btn-rent" data-gpu-type="${gpuType}" aria-label="Rent ${config.gpusPerServer}x ${config.name} Server">
          Rent Now
        </button>
      </div>
    `;
  }).join('');
})();

// ============================================================================
// Efficiency List Generator
// ============================================================================

(function initEfficiencyList() {
  const container = document.getElementById('eff-list');
  if (!container) return;

  const gpuTypes = Object.keys(GPU_CONFIG);

  container.innerHTML = gpuTypes.map(gpuType => {
    const config = GPU_CONFIG[gpuType];
    return `
      <li class="eff-item" data-gpu="${gpuType}">
        <div class="eff-left">
          <span class="eff-gpu">${config.name}</span>
          <span class="eff-badge">Best value</span>
        </div>
        <span class="eff-val" id="eff-${gpuType.toLowerCase()}">—</span>
        <div class="eff-bar-wrap" aria-hidden="true"><div class="eff-bar"></div></div>
      </li>
    `;
  }).join('');
})();

// ============================================================================
// Efficiency Calculator
// ============================================================================

(function initEfficiencyCalculator() {
  // DOM elements
  const elements = {
    list: document.getElementById('eff-list'),
    epoch: document.getElementById('eff-epoch'),
    updated: document.getElementById('eff-updated'),
    status: document.getElementById('eff-status'),
  };

  // State
  let weightsData = {
    epoch: null,
    weights: Object.fromEntries(
      Object.entries(GPU_CONFIG).map(([gpu, config]) => [gpu, config.fallbackWeight])
    ),
  };
  let customWeightsLoaded = false;

  // -------------------------------------------------------------------------
  // UI State Management
  // -------------------------------------------------------------------------

  /**
   * Updates the status indicator
   * @param {'loading'|'success'|'error'} state - Current state
   * @param {string} [message] - Optional error message
   */
  function setStatus(state, message = '') {
    if (!elements.status) return;

    elements.status.className = `eff-status eff-status--${state}`;

    switch (state) {
      case 'loading':
        elements.status.innerHTML = '<span class="eff-spinner"></span> Loading...';
        break;
      case 'success':
        elements.status.textContent = '';
        break;
      case 'error':
        elements.status.textContent = message || 'Using cached data';
        break;
    }
  }

  // -------------------------------------------------------------------------
  // Data Fetching
  // -------------------------------------------------------------------------

  /**
   * Fetches JSON from a URL with timeout
   * @param {string} url - URL to fetch
   * @returns {Promise<object>} Parsed JSON response
   * @throws {Error} On network or parse error
   */
  async function fetchJson(url) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_CONFIG.timeoutMs);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        cache: 'no-store'
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Extracts epoch index from API response
   * @param {object} apiResponse - Raw API response
   * @returns {number|null} Epoch index or null
   */
  function extractEpochId(apiResponse) {
    // Try to get epoch_index from the first participant's seed
    const participants = apiResponse?.active_participants?.participants;
    if (Array.isArray(participants) && participants.length > 0) {
      return participants[0]?.seed?.epoch_index ?? null;
    }
    return null;
  }

  /**
   * Parses custom weights payload from URL parameter
   * @param {object} payload - Raw weights payload
   * @returns {{epoch: number|null, weights: object}} Parsed weights
   */
  function parseWeightsPayload(payload) {
    const result = { epoch: null, weights: {} };

    if (!payload || typeof payload !== 'object') {
      return result;
    }

    if (payload.epoch != null) {
      result.epoch = payload.epoch;
    }

    if (payload.weights && typeof payload.weights === 'object') {
      for (const [gpuType, weight] of Object.entries(payload.weights)) {
        const numericWeight = Number(weight);
        if (Number.isFinite(numericWeight)) {
          result.weights[gpuType.toUpperCase()] = numericWeight;
        }
      }
    }

    return result;
  }

  /**
   * Attempts to load custom weights from URL parameter
   */
  async function loadCustomWeightsIfPresent() {
    if (customWeightsLoaded) return;

    let weightsUrl = null;
    try {
      const currentUrl = new URL(window.location.href);
      weightsUrl = currentUrl.searchParams.get('weightsUrl');
    } catch (error) {
      console.warn('[Efficiency] Failed to parse URL:', error.message);
      return;
    }

    if (!weightsUrl) return;

    try {
      const rawPayload = await fetchJson(weightsUrl);
      const parsedWeights = parseWeightsPayload(rawPayload);

      if (Object.keys(parsedWeights.weights).length > 0) {
        weightsData = parsedWeights;
        customWeightsLoaded = true;
        console.info('[Efficiency] Loaded custom weights from URL');
      }
    } catch (error) {
      console.warn('[Efficiency] Failed to load custom weights:', error.message);
    }
  }

  // -------------------------------------------------------------------------
  // Efficiency Calculation & Rendering
  // -------------------------------------------------------------------------

  /**
   * Calculates efficiency for a GPU type
   * @param {string} gpuType - GPU type (e.g., 'A100')
   * @returns {number|null} Efficiency value or null if unavailable
   */
  function calculateEfficiency(gpuType) {
    const weight = weightsData.weights[gpuType];
    const price = GPU_CONFIG[gpuType]?.pricePerGpuHour;

    if (!weight || !price) return null;
    return weight / price;
  }

  /**
   * Renders efficiency data to the DOM
   * @param {number|null} epochId - Current epoch ID
   * @param {Date} updateTime - Time of update
   */
  function renderEfficiency(epochId, updateTime) {
    if (!elements.list) return;

    // Calculate efficiency for each GPU
    const efficiencyByGpu = {};
    for (const gpuType of Object.keys(GPU_CONFIG)) {
      efficiencyByGpu[gpuType] = calculateEfficiency(gpuType);
    }

    // Update each list item
    const items = Array.from(elements.list.querySelectorAll('.eff-item'));

    for (const item of items) {
      const gpuType = item.getAttribute('data-gpu');
      const efficiency = efficiencyByGpu[gpuType];
      const valueElement = item.querySelector('.eff-val');

      // Update displayed value
      if (valueElement) {
        valueElement.textContent = Number.isFinite(efficiency)
          ? efficiency.toFixed(3)
          : '—';
      }

      // Store efficiency for sorting
      item.dataset.eff = Number.isFinite(efficiency) ? String(efficiency) : '';
    }

    // Sort items by efficiency (highest first)
    items.sort((itemA, itemB) => {
      const effA = Number(itemA.dataset.eff);
      const effB = Number(itemB.dataset.eff);
      const hasEffA = Number.isFinite(effA);
      const hasEffB = Number.isFinite(effB);

      if (hasEffA && hasEffB) return effB - effA;
      if (hasEffB) return 1;
      if (hasEffA) return -1;
      return 0;
    });

    // Re-append items in sorted order and update visual bars
    const validEfficiencies = items
      .map(item => Number(item.dataset.eff))
      .filter(eff => Number.isFinite(eff));
    const maxEfficiency = Math.max(...validEfficiencies, 0);

    items.forEach((item, index) => {
      elements.list.appendChild(item);
      item.dataset.rank = String(index + 1);

      const efficiency = Number(item.dataset.eff);
      const barElement = item.querySelector('.eff-bar');

      if (barElement) {
        const percentage = (Number.isFinite(efficiency) && maxEfficiency > 0)
          ? Math.max(0, Math.min(100, (efficiency / maxEfficiency) * 100))
          : 0;
        barElement.style.width = `${percentage.toFixed(1)}%`;
      }
    });

    // Update epoch and timestamp
    const displayEpoch = weightsData.epoch ?? epochId;

    if (elements.epoch) {
      elements.epoch.textContent = displayEpoch != null ? String(displayEpoch) : '—';
    }

    if (elements.updated) {
      elements.updated.textContent = formatTimeUTC(updateTime);
    }
  }

  // -------------------------------------------------------------------------
  // Main Refresh Loop
  // -------------------------------------------------------------------------

  /**
   * Fetches latest data and updates the UI
   */
  async function refresh() {
    const updateTime = new Date();
    setStatus('loading');

    try {
      const apiResponse = await fetchJson(API_CONFIG.epochParticipantsUrl);
      const epochId = extractEpochId(apiResponse);

      await loadCustomWeightsIfPresent();
      renderEfficiency(epochId, updateTime);
      setStatus('success');

    } catch (error) {
      console.warn('[Efficiency] API fetch failed:', error.message);

      await loadCustomWeightsIfPresent();
      renderEfficiency(null, updateTime);
      setStatus('error', 'API unavailable — using fallback data');
    }
  }

  // Initialize
  refresh();
  setInterval(refresh, API_CONFIG.pollIntervalMs);
})();

// ============================================================================
// Scroll Reveal Animation
// ============================================================================

(function initScrollReveal() {
  // Add reveal class to sections (except hero which has its own animations)
  const sections = document.querySelectorAll('section:not(.hero)');
  sections.forEach(section => {
    section.classList.add('reveal');
  });

  // Create Intersection Observer
  const observerOptions = {
    root: null,
    rootMargin: '0px 0px -10% 0px',
    threshold: 0.1
  };

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        // Optionally stop observing after reveal
        revealObserver.unobserve(entry.target);
      }
    });
  }, observerOptions);

  // Observe all reveal elements
  document.querySelectorAll('.reveal').forEach(el => {
    revealObserver.observe(el);
  });
})();

