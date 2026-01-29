---
name: debug
description: Diagnose and fix common issues. Use when encountering bugs, errors, console messages, or unexpected behavior in the MineGNK site.
---

# Troubleshooting Guide

## Quick Diagnostics

1. Hard refresh: `Cmd+Shift+R` (Mac) / `Ctrl+Shift+R` (Win)
2. Check console: `F12 → Console`
3. Check Network tab for failed requests
4. Test in incognito mode

## Common Issues

### Changes Not Appearing
- Hard refresh browser
- Check CSS file is linked
- Verify no typos in selectors
- Check specificity in DevTools

### Pricing Cards Empty
```javascript
// In console:
console.log(GPU_CONFIG);  // Should show object
document.getElementById('pricing-cards');  // Should exist
```

### Efficiency Calculator Stuck
```javascript
// Test API directly:
fetch('https://node4.gonka.ai/v1/epochs/current/participants')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error);
```

If CORS error: API server issue, not code issue.

### HubSpot Modal Not Opening
```javascript
// Test modal manually:
document.getElementById('hubspot-modal').showModal();

// Check HubSpot loaded:
console.log(window.hbspt);  // Should not be undefined
```

### Form Not Pre-Populating
```javascript
// Check URL param:
new URLSearchParams(location.search).get('gpu');

// Verify field name matches HUBSPOT_CONFIG.fieldName
```

### Layout Broken on Mobile
- Test at 375px, 520px, 768px widths
- Check viewport meta tag exists
- Look for fixed widths (should use max-width)

### Scroll Animations Not Working
- Verify `.reveal` class on section
- Check IntersectionObserver support
- Test manually: `document.querySelector('.reveal').classList.add('visible')`

## Docker Issues

```bash
# Container won't start
docker-compose logs -f

# Port in use
lsof -i :3000

# Rebuild from scratch
docker-compose down && docker-compose build --no-cache && docker-compose up -d
```

## Console Debugging

```javascript
// Check GPU config
console.table(GPU_CONFIG);

// Check API config
console.log(API_CONFIG);

// View CSS variables
getComputedStyle(document.documentElement).getPropertyValue('--brand');

// Test modal
document.getElementById('hubspot-modal').showModal();
```

## Network Testing

```bash
# Test API
curl -i https://node4.gonka.ai/v1/epochs/current/participants

# Test with custom weights
open "http://localhost:8000?weightsUrl=https://example.com/weights.json"
```

## Quick Fixes

| Problem | Fix |
|---------|-----|
| Changes not showing | Hard refresh |
| Pricing empty | Check GPU_CONFIG in console |
| API failing | Check Network tab |
| Modal stuck | Check console for HubSpot errors |
| Colors wrong | Use `var(--brand)` not hardcoded |
| No animations | Add `.reveal` class |
