# CSS Style Guide

Rules for writing CSS in this codebase.

## Design System Overview

This site uses a dark theme with CSS custom properties. Key characteristics:
- Dark background (`#0a0a0a`) with elevated surfaces for cards
- Brand orange (`#FF4C00`) as primary accent
- Subtle glow effects and shadows for depth
- Smooth animations with custom easing curves

## File Organization

Organize styles in sections with comment headers:
```css
/* ============================================================================
   Section Name
   ============================================================================ */
```

### Section Order
1. Root variables
2. Base & Reset
3. Layout (container, sections)
4. Header
5. Typography
6. Hero Section
7. Components (cards, panels, buttons)
8. Feature sections (pricing, efficiency, timeline, FAQ)
9. Footer
10. Utility classes
11. Animations/Keyframes
12. Responsive breakpoints

## CSS Custom Properties

All design tokens in `:root`:

### Colors
```css
:root {
  --bg: #0a0a0a;              /* Background */
  --bg-elevated: rgba(24, 24, 27, 0.6);  /* Cards/panels */
  --text: #fafafa;            /* Primary text */
  --muted: #a1a1aa;           /* Secondary text */
  --border: #27272a;          /* Borders */
  --brand: #FF4C00;           /* Brand orange */
  --brand2: #e64500;          /* Brand hover */
  --brand-glow: rgba(255, 76, 0, 0.15);  /* Glow effects */
  --ok: #22c55e;              /* Success green */
  --warn: #f59e0b;            /* Warning amber */
}
```

### Shadows
```css
:root {
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.4);      /* Default */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);    /* Small */
  --shadow-glow: 0 0 40px rgba(255, 76, 0, 0.2); /* Brand glow */
}
```

### Typography
```css
:root {
  --font-display: 'Inter', system-ui, sans-serif;  /* Headings */
  --font-body: 'Inter', system-ui, sans-serif;     /* Body */
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
```

### Spacing & Animation
```css
:root {
  --r: 14px;                                    /* Standard border-radius */
  --ease-out: cubic-bezier(0.16, 1, 0.3, 1);   /* Smooth ease-out */
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);  /* Bouncy effect */
}
```

### Z-Index Scale
```css
:root {
  --z-base: 1;           /* Base stacking level */
  --z-grid-bg: 0;        /* Grid background (behind everything) */
  --z-header: 100;       /* Sticky header */
  --z-dropdown: 200;     /* Dropdown menus */
  --z-modal-backdrop: 999;   /* Modal backdrop */
  --z-modal: 1000;       /* Modal content */
  --z-tooltip: 1100;     /* Tooltips (above modals) */
}
```

**Usage Guidelines:**
- Use custom properties for consistency: `z-index: var(--z-modal);`
- Never use arbitrary values like `z-index: 99999;`
- Increment by 100s to allow room for intermediate values
- Document any exceptions in component comments

## Component Patterns

### Cards
```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--r);                /* 14px */
  padding: 22px;
  box-shadow: var(--shadow-sm);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.card:hover {
  border-color: rgba(255, 76, 0, 0.3);
}
```

### Panels (larger containers)
```css
.panel {
  border-radius: calc(var(--r) + 6px);    /* 20px */
  border: 1px solid var(--border);
  background: var(--bg-elevated);
  padding: 20px;
}
```

### Buttons

Base button styles with consistent sizing:
```css
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: fit-content;
  flex: 0 0 auto;
  border: 2px solid transparent;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  line-height: 1.6;
  transition:
    transform 0.2s var(--ease-bounce),
    box-shadow 0.2s ease,
    background-color 0.18s ease;
}

.btn-primary {
  background: var(--brand);
  color: #fff;
  border: 2px solid var(--brand);
}

.btn-primary:hover {
  background: var(--brand2);
  border-color: var(--brand2);
  transform: translateY(-2px);
  box-shadow: var(--shadow), var(--shadow-glow);
}

.btn-secondary {
  background: transparent;
  color: var(--brand);
  border: 2px solid rgba(255, 76, 0, 0.4);
}
```

### Context-Specific Button Styles

**Hero section** - Both buttons same size:
```css
.hero .cta .btn {
  padding: 14px 24px;
  border: 2px solid transparent;
  line-height: 1.6;
}
.hero .cta .btn-primary { border-color: var(--brand); }
.hero .cta .btn-secondary { border-color: rgba(255, 76, 0, 0.4); }
```

**Pricing cards** - Smaller orange buttons:
```css
.pricing-card .btn-rent {
  padding: 10px 20px;
  font-size: 0.9em;
  background: var(--brand);
  color: #fff;
  border: 2px solid var(--brand);
  border-radius: 10px;
  margin-top: 12px;
}
```

**Header nav** - Compact orange button:
```css
.nav-btn {
  display: inline-flex;
  align-items: center;
  background: var(--brand);
  color: #fff;
  font-size: 0.875em;
  padding: 8px 16px;
  border-radius: 8px;
}
```

## Typography

### Headings
```css
h1, h2, h3 {
  font-family: var(--font-display);
  color: var(--text);
  letter-spacing: -0.01em;  /* Range: -0.01em to -0.02em for headings */
}

h2::after {
  /* Underline accent */
  content: "";
  display: block;
  width: 52px;
  height: 4px;
  border-radius: 999px;
  background: linear-gradient(90deg, var(--brand) 0%, #FF7A45 100%);
  margin-top: 10px;
}
```

### Body Text
```css
p {
  font-size: 1.05em;
  line-height: 1.75;
  color: var(--muted);
  margin: 0 0 14px;
}
```

## Transitions

### Standard Timing
- Interactive elements: `0.18s ease`
- Hover effects: `0.2s ease`
- Complex animations: `0.25s var(--ease-bounce)`
- Reveal animations: `0.6s var(--ease-out)`

### Pattern
```css
.element {
  transition: transform 0.2s var(--ease-bounce), opacity 0.2s ease;
}
```

## Responsive Design

### Breakpoints
```css
@media (max-width: 980px) { /* Tablet landscape - hero grid stacks */ }
@media (max-width: 768px) { /* Tablet portrait - CTAs stack, footer collapses */ }
@media (max-width: 520px) { /* Mobile - efficiency items, timeline adjusts */ }
```

### Mobile-First Patterns
- Grid layouts collapse to single column
- Full-width buttons
- Timeline and pricing cards adapt to smaller screens
- Reduce padding/margins
- Adjust typography scale

```css
@media (max-width: 768px) {
  .cta {
    flex-direction: column;
  }
  .btn {
    width: 100%;
  }
  .footer-inner {
    grid-template-columns: 1fr;
  }
}
```

## Animations

### Keyframe Naming
Use descriptive names: `hero-text-in`, `panel-in`, `badge-pop`, `spin`

### Reveal Animation Pattern
```css
.reveal {
  opacity: 0;
  transform: translateY(30px);
  transition: opacity 0.6s var(--ease-out), transform 0.6s var(--ease-out);
}

.reveal.visible {
  opacity: 1;
  transform: translateY(0);
}
```

### Entrance Animation (CSS only)
```css
.element {
  animation: element-in 0.8s var(--ease-out) 0.2s backwards;
}

@keyframes element-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
```

## Utility Classes

Keep minimal, at end of file:
```css
.mono { font-family: var(--font-mono); }
.mt-0 { margin-top: 0; }
.mt-sm { margin-top: 12px; }
.mt-md { margin-top: 18px; }
.mb-0 { margin-bottom: 0; }
.mb-sm { margin-bottom: 12px; }
```

## Selectors

### Specificity
- Avoid `!important` (exception: third-party overrides)
- Prefer single class selectors
- Use data attributes for state: `[data-rank="1"]`

### Hover/Focus
```css
a:focus-visible,
button:focus-visible {
  outline: 3px solid rgba(255, 76, 0, 0.35);
  outline-offset: 3px;
  border-radius: 10px;
}
```

## Common Values

| Property | Value |
|----------|-------|
| Border radius (cards) | `var(--r)` (14px) |
| Border radius (panels) | `calc(var(--r) + 6px)` (20px) |
| Border radius (pills) | `999px` |
| Border radius (buttons) | `12px` |
| Container max-width | `1140px` |
| Section padding | `56px 0` |
| Card padding | `22px` |

## Special Effects

### Grid Background
The grid background uses CSS mask for fade effect:
```css
.grid-bg::before {
  background-image:
    linear-gradient(90deg, rgba(39, 39, 42, 0.5) 1px, transparent 1px),
    linear-gradient(180deg, rgba(39, 39, 42, 0.5) 1px, transparent 1px);
  background-size: 64px 64px;
  mask-image: linear-gradient(to bottom, black 0%, black 400px, transparent 100%);
}
```

### Timeline Connector
The timeline uses a pseudo-element gradient line:
```css
.timeline::before {
  background: linear-gradient(180deg, var(--brand) 0%, rgba(255, 76, 0, 0.1) 100%);
}
```

### Footer Watermark
Large semi-transparent text behind footer content:
```css
footer::before {
  content: "MINEGNK";
  font-size: clamp(120px, 18vw, 280px);
  color: rgba(255, 255, 255, 0.02);
}
