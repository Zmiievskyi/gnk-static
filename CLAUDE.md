# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing website for MineGNK - a managed GPU infrastructure service for Gonka blockchain participation. The site is a single-page application built with vanilla HTML, CSS, and JavaScript with no build process or dependencies.

## Architecture

### File Structure
```
├── index.html              # Single-page marketing site (all content sections)
├── css/styles.css          # Complete styling with dark theme design system
├── js/main.js              # Efficiency calculator, pricing cards, scroll animations
├── js/hubspot-modal.js     # HubSpot form integration with modal dialog
├── docker-compose.yml      # Container orchestration (port 3000)
├── nginx.conf              # Web server config with security headers
├── Dockerfile              # nginx:alpine based container image
├── .claude/rules/          # Code style guides (HTML, CSS, JS)
└── CLAUDE.md               # This file
```

### Key Features

1. **GPU Configuration** (`js/main.js`):
   - Single `GPU_CONFIG` object defines all GPU types, prices, and fallback weights
   - Pricing cards generated dynamically from this configuration
   - Efficiency list items also generated from the same config
   - No duplication between HTML and JavaScript

2. **Efficiency Calculator** (`js/main.js`):
   - Fetches real-time GPU weight data from Gonka API endpoint
   - Extracts epoch from `participants[0].seed.epoch_index` (nested path)
   - Calculates efficiency metric: `weight / pricePerGpuHour`
   - Supports optional `?weightsUrl=` query parameter to override weight source
   - Polls every 30 seconds for updates
   - Shows loading spinner and error states
   - Dynamically ranks GPUs and highlights "Best value" badge
   - Falls back to configured weights if API fails

3. **HubSpot Modal** (`js/hubspot-modal.js`):
   - Embeds HubSpot forms in a custom `<dialog>` modal
   - Pre-populates GPU selection via URL parameter injection
   - Three states: loading (spinner), form (iframe), error (fallback email)
   - Uses iframe embed method (not v2 API) for cross-origin compatibility
   - Event delegation handles dynamically generated "Rent Now" buttons

4. **Scroll Reveal Animations** (`js/main.js`):
   - IntersectionObserver triggers fade-in animations on sections
   - 10% threshold, unobserves after first reveal for performance
   - Skips hero section (already visible on load)

### Content Sections

1. **Hero** - Value proposition, "Three pains we remove", two CTAs
2. **Solutions** - Service offerings for operators and pools, managed service add-on
3. **Pricing** - GPU packages (dynamically generated cards with "Rent Now" buttons)
4. **Efficiency** - Real-time GPU efficiency comparison with visual bars
5. **How It Works** - 7-step timeline from request to billing
6. **FAQ** - 7 expandable `<details>` elements
7. **Footer** - Multi-column layout with "MINEGNK" watermark
8. **Modal** - HubSpot form dialog (hidden by default)

## Development Workflow

### Local Development
```bash
# Serve locally (any method works, e.g.):
python3 -m http.server 8000
# or
npx serve
```

No build step required - edit files and refresh browser.

### Docker Deployment
```bash
docker-compose up -d           # Build and run
docker-compose logs -f         # View logs
docker-compose down            # Stop
docker-compose up -d --build   # Rebuild after changes
```

The site will be available at `http://localhost:3000`.

### Testing Efficiency Calculator
```bash
open "http://localhost:8000?weightsUrl=https://example.com/weights.json"
```

Expected JSON format:
```json
{
  "epoch": 123,
  "weights": {
    "A100": 256.498,
    "H100": 606.046,
    "H200": 619.000,
    "B200": 955.921
  }
}
```

## Important Constants

### GPU Configuration (Single Source of Truth)
All GPU pricing and configuration is defined in `GPU_CONFIG` object in `js/main.js`:

| GPU  | $/GPU/hr | GPUs/Server | Fallback Weight |
|------|----------|-------------|-----------------|
| A100 | $0.99    | 8           | 256.498         |
| H100 | $1.80    | 8           | 606.046         |
| H200 | $2.40    | 8           | 619.000         |
| B200 | $3.50    | 8           | 955.921         |

Monthly prices calculated: `pricePerGpuHour × gpusPerServer × 730 hours`

**To update pricing:** Only modify the `GPU_CONFIG` object in `js/main.js`.

### API Configuration
```javascript
API_CONFIG = {
  epochParticipantsUrl: 'https://node4.gonka.ai/v1/epochs/current/participants',
  pollIntervalMs: 30000,  // 30 seconds
  timeoutMs: 8000         // 8 seconds
}
```

### HubSpot Configuration
```javascript
HUBSPOT_CONFIG = {
  portalId: '147554099',
  formId: '78fd550b-eec3-4958-bc4d-52c73924b87b',
  region: 'eu1',
  fieldName: 'form_gonka_preffered_configuration',
  scriptTimeout: 10000
}
```

Pre-population field values: `8 x A100`, `8 x H100`, `8 x H200`, `8 x B200`

## Notes

- The site is intentionally dependency-free for simplicity
- Grid background uses CSS mask for fade effect
- Timeline connector is a CSS pseudo-element gradient
- Footer year updates dynamically via JavaScript
- HubSpot forms use iframe embed (cross-origin safe, not v2 API)
- Modal backdrop click and Escape key both close the dialog

## Style Guides

See `.claude/rules/` for detailed coding conventions:
- `html.md` - Document structure, accessibility, semantic patterns
- `css.md` - Design system, custom properties, component patterns
- `javascript.md` - Module patterns, async handling, event delegation
