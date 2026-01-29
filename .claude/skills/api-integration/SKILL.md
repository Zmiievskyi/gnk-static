---
name: api
description: Work with external APIs, data fetching, and polling. Use when adding API endpoints, modifying polling intervals, handling responses, or implementing real-time updates.
---

# API Integration

## Current API Configuration

```javascript
const API_CONFIG = {
  epochParticipantsUrl: 'https://node4.gonka.ai/v1/epochs/current/participants',
  pollIntervalMs: 30000,  // 30 seconds
  timeoutMs: 8000,        // 8 seconds
};
```

## Fetch Pattern with Timeout

```javascript
async function fetchWithTimeout(url, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') throw new Error('Request timeout');
    throw error;
  }
}
```

## Polling Pattern

```javascript
let pollId = null;

function startPolling() {
  fetchData();  // Initial fetch
  pollId = setInterval(fetchData, API_CONFIG.pollIntervalMs);
}

function stopPolling() {
  if (pollId) clearInterval(pollId);
}
```

## Error Handling

```javascript
try {
  const data = await fetchWithTimeout(url, timeout);
  renderData(data);
} catch (error) {
  console.warn('[API] Fetch failed:', error.message);
  renderData(FALLBACK_DATA);  // Graceful degradation
}
```

## Add New API Endpoint

1. Add config:
```javascript
const NEW_API_CONFIG = {
  url: 'https://api.example.com/data',
  pollIntervalMs: 60000,
  timeoutMs: 10000,
};
```

2. Create IIFE module in `js/main.js`:
```javascript
(function initNewDataModule() {
  async function fetchData() { /* ... */ }
  function render(data) { /* ... */ }
  fetchData();
  setInterval(fetchData, NEW_API_CONFIG.pollIntervalMs);
})();
```

## Test Custom Weights

Override API endpoint via URL parameter:

```bash
open "http://localhost:8000?weightsUrl=https://example.com/weights.json"
```

## Console Logging

```javascript
console.info('[ModuleName] Success message');
console.warn('[ModuleName] Warning:', error.message);
console.error('[ModuleName] Error:', error);
```

## Related Files

- `js/main.js` - API_CONFIG, efficiency calculator
- `CLAUDE.md` - API endpoint documentation
