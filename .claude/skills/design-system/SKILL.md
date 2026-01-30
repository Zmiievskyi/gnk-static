---
name: design
description: Apply brand colors, typography, and consistent styling. Use when styling components, adding animations, or ensuring visual consistency with the MineGNK design system.
---

# Design System

Use CSS custom properties from `:root` in `css/styles.css`. Never hardcode colors.

## Brand Colors

```css
--brand: #FF4C00          /* Primary orange */
--brand2: #e64500         /* Hover state */
--brand-glow: rgba(255, 76, 0, 0.15)
--bg: #0a0a0a             /* Background */
--bg-elevated: rgba(24, 24, 27, 0.6)  /* Cards */
--text: #fafafa           /* Primary text */
--muted: #a1a1aa          /* Secondary text */
--border: #27272a         /* Borders */
```

## Card Pattern

```css
.card {
  background: var(--bg-elevated);
  border: 1px solid var(--border);
  border-radius: var(--r);  /* 14px */
  padding: 22px;
  transition: all 0.18s ease;
}

.card:hover {
  border-color: var(--brand);
  box-shadow: var(--shadow);
}
```

## Button Patterns

Base `.btn` class provides consistent sizing. All buttons use `border: 2px` for equal height.

```css
/* Primary - solid orange */
.btn-primary {
  background: var(--brand);
  color: #fff;
  border: 2px solid var(--brand);
  padding: 14px 24px;
  border-radius: 12px;
}

/* Secondary - outlined */
.btn-secondary {
  background: transparent;
  color: var(--brand);
  border: 2px solid rgba(255, 76, 0, 0.4);
}
```

### Context-Specific Buttons

| Location | Class | Size | Notes |
|----------|-------|------|-------|
| Hero | `.btn` | 14px 24px | Both buttons same height |
| Pricing cards | `.pricing-card .btn-rent` | 10px 20px | Smaller, orange |
| Header nav | `.nav-btn` | 8px 16px | Compact, orange |
| How It Works | `.btn-rent` | 14px 24px | Standard |

## Scroll Animation

Add `.reveal` class to sections:

```html
<section id="new-section" class="reveal">
```

CSS handles the animation automatically via IntersectionObserver.

## Spacing

- Card padding: `22px`
- Gap between items: `14px` or `22px`
- Section padding: `60px 0`
- Container max-width: `1140px`

## Breakpoints

```css
@media (max-width: 980px) { /* Tablet landscape */ }
@media (max-width: 768px) { /* Tablet portrait */ }
@media (max-width: 520px) { /* Mobile */ }
```

## Quick Reference

| Element | Border Radius | Padding |
|---------|---------------|---------|
| Card    | 14px          | 22px    |
| Button  | 14px          | 12px 26px |
| Section | 20px          | 28px    |

See `.claude/rules/css.md` for complete design system reference.
