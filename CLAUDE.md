# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static marketing website for MineGNK - a managed GPU infrastructure service for Gonka blockchain participation. The site is a single-page application built with vanilla HTML, CSS, and JavaScript with no build process or dependencies.

## Architecture

### Structure
- `index.html` - Single-page marketing site with all content sections
- `css/styles.css` - Complete styling with dark theme and Angular-inspired design system
- `js/main.js` - Efficiency calculator and dynamic content

### Design System
The site uses a dark theme with brand colors derived from an Angular project:
- Primary brand color: `#FF4C00` (orange)
- Background: `#0a0a0a` (near-black)
- Text hierarchy: `#fafafa` (primary), `#a1a1aa` (muted)
- Grid background pattern for visual interest
- Consistent spacing using CSS custom properties

### Key Features
1. **GPU Configuration** (`js/main.js`):
   - Single `GPU_CONFIG` object defines all GPU types, prices, and fallback weights
   - Pricing cards are generated dynamically from this configuration
   - No duplication between HTML and JavaScript

2. **Efficiency Calculator** (`js/main.js`):
   - Fetches real-time GPU weight data from Gonka API endpoint
   - Calculates efficiency metric: `(weight per GPU) / ($/GPU/hr)`
   - Supports optional `?weightsUrl=` query parameter to override weight source
   - Polls every 30 seconds for updates
   - Shows loading spinner and error states for better UX
   - Dynamically ranks GPUs and highlights "Best value"
   - Falls back to configured weights if API fails
   - Logs warnings to console for debugging

2. **Responsive Design**:
   - Mobile-first with breakpoints at 520px, 768px, 980px
   - Grid layouts collapse to single column on mobile
   - Timeline and pricing cards adapt to smaller screens

3. **Accessibility**:
   - ARIA labels on navigation and key sections
   - Keyboard focus indicators
   - Semantic HTML with proper heading hierarchy

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
# Build and run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Rebuild after changes
docker-compose up -d --build
```

The site will be available at `http://localhost:3000`.

### Testing Efficiency Calculator
```bash
# Test with custom weights URL
open http://localhost:8000?weightsUrl=https://example.com/weights.json
```

Expected JSON format for custom weights:
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

## Content Sections

1. **Hero** - Value proposition and CTAs
2. **Solutions** - Service offerings for operators and pools
3. **Pricing** - GPU package selector with four tiers (A100, H100, H200, B200)
4. **Efficiency** - Real-time GPU efficiency comparison
5. **How It Works** - 7-step timeline from request to billing
6. **FAQ** - Expandable details elements

## Important Constants

### GPU Configuration (Single Source of Truth)
All GPU pricing and configuration is defined in `GPU_CONFIG` object in `js/main.js`:
- A100: $0.99/GPU/hr (8 GPUs per server)
- H100: $1.80/GPU/hr (8 GPUs per server)
- H200: $2.40/GPU/hr (8 GPUs per server)
- B200: $3.50/GPU/hr (8 GPUs per server)

Monthly prices are calculated automatically: `pricePerGpuHour × gpusPerServer × 730 hours`

**To update pricing:** Only modify the `GPU_CONFIG` object in `js/main.js`. The pricing cards are generated dynamically from this configuration.

### API Endpoint
- Current: `https://node4.gonka.ai/v1/epochs/current/participants`
- Poll interval: 30 seconds
- Timeout: 8 seconds

## Styling Conventions

- Use CSS custom properties defined in `:root` for colors
- Border radius: `var(--r)` (14px) for cards, add 6px for larger containers
- Shadows: `var(--shadow-sm)` for cards, `var(--shadow)` for hover states
- Transitions: 0.18s ease for interactive elements
- Letter spacing: Negative values (-0.01em to -0.02em) for headings

## Notes

- The site is intentionally dependency-free for simplicity
- Grid background uses CSS mask for fade effect
- Timeline connector is a CSS pseudo-element gradient
- Footer year updates dynamically via JavaScript
