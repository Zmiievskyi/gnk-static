---
name: test
description: Manual testing procedures and QA for the MineGNK site. Use before deployments, after feature changes, or during quality assurance.
---

# Testing Guide

## Quick Test Checklist

- [ ] Page loads without errors
- [ ] All sections visible
- [ ] Pricing cards display (4 GPUs)
- [ ] Efficiency calculator shows data
- [ ] "Request GPU" buttons open modal
- [ ] HubSpot form loads and submits
- [ ] Mobile layout works (375px)
- [ ] No console errors

## Browser Testing

Test in: Chrome, Firefox, Safari, Edge, Mobile Safari, Chrome Android

```bash
# Local
open http://localhost:8000

# DevTools
F12 or Cmd+Option+I
```

## Section Tests

### Pricing
- [ ] 4 GPU cards display
- [ ] Prices correct: A100=$5,692, H100=$10,512, H200=$14,016, B200=$20,440
- [ ] "Request GPU" opens modal with GPU pre-selected

### Efficiency
- [ ] List displays all 4 GPUs
- [ ] "Best value" badge on highest efficiency
- [ ] Updates every 30 seconds (check Network tab)
- [ ] Fallback works if API down

### HubSpot Modal
- [ ] Opens from each "Request GPU" button
- [ ] GPU field pre-populated
- [ ] Form submits successfully
- [ ] Close via X, backdrop, or Escape

## Responsive Testing

```bash
# Chrome DevTools → Toggle device (Cmd+Shift+M)
```

Test at: 375px, 520px, 768px, 980px, 1440px

- [ ] No horizontal scroll on mobile
- [ ] Cards stack appropriately
- [ ] Touch targets 44px+ tall
- [ ] Text readable (16px minimum)

## Accessibility

- [ ] Tab through all interactive elements
- [ ] Focus indicators visible
- [ ] Escape closes modal
- [ ] ARIA labels present

## Performance

```bash
# Lighthouse audit
Chrome DevTools → Lighthouse → Analyze

# Targets
Performance: 90+
Accessibility: 95+
Best Practices: 90+
```

## API Testing

```javascript
// Console test
fetch('https://node4.gonka.ai/v1/epochs/current/participants')
  .then(r => r.json())
  .then(console.log);
```

## Pass Criteria

Before deploying:
- ✅ No console errors
- ✅ All sections display
- ✅ Pricing accurate
- ✅ Modal works
- ✅ Mobile responsive
- ✅ Works in Chrome, Firefox, Safari
- ✅ Lighthouse 90+
