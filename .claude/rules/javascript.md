# JavaScript Style Guide

Rules for writing JavaScript in this codebase.

## Design Principles

- **No dependencies** - vanilla JavaScript only
- **Single source of truth** - configuration objects define data once
- **Graceful degradation** - fallback weights, error UI, `<noscript>` warnings
- **Progressive enhancement** - core content works without JS

## File Structure

### Header Comment
```javascript
/**
 * ModuleName - Brief Description
 * Additional context about what this module handles
 */
```

### Section Comments
```javascript
// ============================================================================
// Section Name
// ============================================================================
```

### Organization Order
1. Configuration constants
2. Utility functions
3. IIFE modules (each self-contained feature)
4. Initialization code

## Configuration

### Constants at Top
Define all configuration in constant objects at the file top:

```javascript
const GPU_CONFIG = {
  A100: {
    name: 'A100',
    pricePerGpuHour: 0.99,
    gpusPerServer: 8,
    fallbackWeight: 256.498,
  },
  // ...
};

const API_CONFIG = {
  url: 'https://api.example.com/data',
  pollIntervalMs: 30000,
  timeoutMs: 8000,
};
```

### Naming
- `SCREAMING_SNAKE_CASE` for configuration objects
- Descriptive keys with units: `pollIntervalMs`, `timeoutMs`

## Module Pattern

### IIFE Encapsulation
Wrap features in Immediately Invoked Function Expressions:

```javascript
(function initFeatureName() {
  'use strict';  // Optional but recommended for standalone files

  // Private state
  let state = { /* ... */ };

  // Private functions
  function helperFunction() { /* ... */ }

  // Initialize
  init();
})();
```

### State Management
Use object literals for state:

```javascript
let state = {
  scriptLoaded: false,
  scriptLoading: false,
  formLoaded: false,
  currentGpuType: null,
};
```

### DOM References
Cache DOM elements in an object:

```javascript
const elements = {
  list: document.getElementById('eff-list'),
  epoch: document.getElementById('eff-epoch'),
  status: document.getElementById('eff-status'),
};
```

## Functions

### JSDoc Comments
Document all functions:

```javascript
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
```

### Naming Conventions
- `camelCase` for functions and variables
- Verb prefixes: `calculate`, `format`, `render`, `fetch`, `handle`, `init`, `set`, `get`
- Boolean getters: `is`, `has`, `can`

### Single Responsibility
Each function should do one thing:

```javascript
// Good: Separate concerns
function fetchJson(url) { /* fetch logic */ }
function parseWeightsPayload(payload) { /* parsing logic */ }
function renderEfficiency(epochId, updateTime) { /* rendering logic */ }

// Bad: Mixed concerns
function fetchAndRenderData() { /* fetch + parse + render */ }
```

## Async Patterns

### Fetch with Timeout
Use AbortController for fetch timeouts:

```javascript
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
```

### Error Handling
Log warnings, provide fallbacks:

```javascript
try {
  const data = await fetchJson(API_CONFIG.url);
  renderData(data);
  setStatus('success');
} catch (error) {
  console.warn('[ModuleName] API fetch failed:', error.message);
  renderData(fallbackData);
  setStatus('error', 'Using fallback data');
}
```

## Event Handling

### Event Delegation
Use delegation for dynamically generated elements:

```javascript
// Good: Single listener, works with dynamic content
document.addEventListener('click', (event) => {
  const button = event.target.closest('.btn-rent');
  if (!button) return;

  event.preventDefault();
  const gpuType = button.getAttribute('data-gpu-type');
  openModal(gpuType);
});
```

### Handler Naming
Prefix with `handle`:

```javascript
function handleRentButtonClick(event) { /* ... */ }
function handleModalBackdropClick(event) { /* ... */ }
function handleEscapeKey() { /* ... */ }
```

## DOM Manipulation

### Template Literals for HTML
```javascript
container.innerHTML = gpuTypes.map(gpuType => {
  const config = GPU_CONFIG[gpuType];
  return `
    <div class="pricing-card" data-gpu-type="${gpuType}">
      <h3>${config.gpusPerServer}x ${config.name} Server</h3>
      <div class="price">$${formatCurrency(monthlyPrice)}</div>
    </div>
  `;
}).join('');
```

### Guard Clauses
Check element existence early:

```javascript
function renderEfficiency(epochId, updateTime) {
  if (!elements.list) return;
  // ...
}
```

### Data Attributes
Use `dataset` for reading, `setAttribute` for setting:

```javascript
// Reading
const gpuType = item.dataset.gpu;

// Setting (for consistency with HTML generation)
item.setAttribute('data-rank', String(index + 1));
```

## Logging

### Console Prefixes
Use module prefixes in square brackets:

```javascript
console.info('[HubSpot Modal] Initialized');
console.warn('[Efficiency] API fetch failed:', error.message);
console.error('[HubSpot Modal] Form container not found');
```

### Log Levels
- `console.info()` - Success, initialization, key events
- `console.warn()` - Recoverable errors, fallbacks
- `console.error()` - Unrecoverable errors

## URL/State Management

### URL Parameters
Use URL API for manipulation:

```javascript
function addUrlParams(values) {
  try {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(values)) {
      url.searchParams.set(key, value);
    }
    window.history.replaceState({}, '', url.toString());
  } catch (error) {
    console.warn('[Module] Failed to add URL params:', error.message);
  }
}
```

## Initialization

### DOM Ready Check
```javascript
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
```

### Polling/Intervals
```javascript
// Initialize immediately, then poll
refresh();
setInterval(refresh, API_CONFIG.pollIntervalMs);
```

## Code Quality

### Null Checks
Use optional chaining and nullish coalescing:

```javascript
const epoch = participants[0]?.seed?.epoch_index ?? null;
const displayName = GPU_DISPLAY_NAMES[gpuType] || gpuType;
```

### Number Validation
```javascript
if (Number.isFinite(efficiency)) {
  // Use the number
}
```

### Array Methods
Prefer functional methods:

```javascript
// Good
const validEfficiencies = items
  .map(item => Number(item.dataset.eff))
  .filter(eff => Number.isFinite(eff));

// Avoid when possible
for (let i = 0; i < items.length; i++) { /* ... */ }
```

## Implementation Patterns

### IIFE Modules
Four separate IIFEs in `main.js` for encapsulation:
- Footer year update
- Pricing cards generator
- Efficiency list generator
- Efficiency calculator with polling

### Event Delegation
"Rent Now" buttons use document-level listener since they're dynamically generated:
```javascript
document.addEventListener('click', (event) => {
  const button = event.target.closest('.btn-rent');
  if (!button) return;
  // handle click
});
```

### Promise Chaining
HubSpot modal uses async script loading → form loading:
```javascript
loadHubSpotScript()
  .then(() => loadForm())
  .catch((error) => showState('error'));
```

### URL State Management
Use `history.replaceState()` for form pre-population without navigation:
```javascript
window.history.replaceState({}, '', url.toString());
```

### Graceful Degradation
- Fallback weights when API fails
- Error UI with fallback email contact
- `<noscript>` warnings in HTML

## Formatting

- 2-space indentation
- Single quotes for strings
- Semicolons required
- Trailing commas in multi-line arrays/objects
- Max line length: ~100 characters
