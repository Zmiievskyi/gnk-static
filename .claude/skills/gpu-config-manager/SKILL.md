---
name: gpu-config
description: Update GPU pricing, add new GPU types, or modify efficiency calculations. Use when changing GPU_CONFIG in js/main.js, updating prices, or adding new GPU models.
---

# GPU Configuration Manager

All GPU data lives in `GPU_CONFIG` in `js/main.js`. Changes here automatically update pricing cards and efficiency calculations.

## Update GPU Pricing

1. Open `js/main.js`
2. Find `GPU_CONFIG` object (near top)
3. Update `pricePerGpuHour` for target GPU
4. Save - pricing cards update automatically

```javascript
H100: {
  name: 'H100',
  pricePerGpuHour: 2.00,  // Changed from 1.80
  gpusPerServer: 8,
  fallbackWeight: 606.046
},
```

Monthly price = `pricePerGpuHour × gpusPerServer × 730`

## Add New GPU Type

Add entry to `GPU_CONFIG`:

```javascript
B300: {
  name: 'B300',
  pricePerGpuHour: 4.50,
  gpusPerServer: 8,
  fallbackWeight: 1200.0
},
```

No HTML changes needed - card appears automatically.

## Update Fallback Weights

Fallback weights are used when API fails. Update `fallbackWeight` in `GPU_CONFIG` with latest values from Gonka API.

## Test Changes

```bash
python3 -m http.server 8000
open http://localhost:8000
```

Verify:
- Pricing cards show correct monthly prices
- Efficiency list calculates correctly
- "Best value" badge on highest efficiency GPU

## Configuration Reference

| GPU  | $/GPU/hr | GPUs/Server | Monthly Price |
|------|----------|-------------|---------------|
| A100 | $0.99    | 8           | $5,692        |
| H100 | $1.80    | 8           | $10,512       |
| H200 | $2.40    | 8           | $14,016       |
| B200 | $3.50    | 8           | $20,440       |

## Related Files

- `js/main.js` - GPU_CONFIG object
- `CLAUDE.md` - Project documentation
