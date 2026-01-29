# HTML Style Guide

Rules for writing HTML in this codebase.

## Design Principles

- **Semantic HTML5** - use appropriate elements (`<dialog>`, `<details>`, `<nav>`, etc.)
- **Accessibility first** - ARIA labels, keyboard navigation, focus indicators
- **Progressive enhancement** - `<noscript>` fallbacks for JS-dependent content
- **No frameworks** - vanilla HTML with minimal JS enhancement

## Document Structure

### Head Organization
Order elements in `<head>` as follows:
1. `<meta charset>` and `<meta viewport>`
2. `<title>`
3. `<meta>` description and keywords
4. Open Graph tags
5. Favicon
6. Font preconnects and stylesheets
7. Local stylesheets

```html
<head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Page Title</title>
    <meta name="description" content="..." />
    <!-- OG tags -->
    <!-- Favicon -->
    <!-- Fonts -->
    <link rel="stylesheet" href="css/styles.css" />
</head>
```

### Body Structure
- Include grid background pattern div first: `<div class="grid-bg"></div>`
- Use semantic elements: `<header>`, `<section>`, `<footer>`, `<nav>`, `<aside>`
- Each section must have an `id` for navigation
- Scripts load at end of body, in dependency order

## Semantic HTML

### Sections
```html
<section id="section-name">
    <div class="container">
        <h2>Section Title</h2>
        <!-- content -->
    </div>
</section>
```

### Navigation
```html
<nav aria-label="Primary">
    <ul>
        <li><a href="#section">Link</a></li>
    </ul>
</nav>
```

### Modals
Use native `<dialog>` element:
```html
<dialog id="modal-name" class="modal-class" aria-labelledby="modal-title" aria-modal="true">
    <div class="modal-content">
        <!-- content -->
    </div>
</dialog>
```

### Accordions
Use native `<details>` element (no JS required):
```html
<details class="faq-item">
    <summary>Question text</summary>
    <div class="faq-answer">Answer text</div>
</details>
```

## Accessibility

### ARIA Labels
- Add `aria-label` to navigation, modal, and key interactive sections
- Use `aria-labelledby` to link modal titles
- Use `aria-modal="true"` on dialogs
- Add `aria-hidden="true"` to decorative elements (icons, markers)

```html
<button aria-label="Close dialog">
    <svg aria-hidden="true">...</svg>
</button>
```

### Focus Indicators
CSS handles focus-visible states. Ensure interactive elements are focusable.

### Heading Hierarchy
- One `<h1>` per page (in hero)
- `<h2>` for section titles
- `<h3>` for card/component titles
- Never skip heading levels

## Class Naming

### Pattern
Use descriptive, hyphenated names. Group by component:
- `.component` - base element
- `.component-inner` - wrapper
- `.component-title` - child element
- `.component--modifier` - variant (BEM-like)

### Common Patterns
```html
<div class="card">                    <!-- Component -->
<div class="pricing-card">            <!-- Specific component -->
<div class="modal-content">           <!-- Component child -->
<span class="eff-badge">              <!-- Prefixed child -->
```

## Data Attributes

Use `data-*` attributes for JavaScript interaction:
```html
<button data-gpu-type="A100">         <!-- JS interaction -->
<li class="eff-item" data-gpu="H100"> <!-- JS data binding -->
<div data-rank="1">                   <!-- Dynamic state -->
```

## Noscript Fallbacks

Provide `<noscript>` content for JS-dependent sections:
```html
<div id="pricing-cards">
    <noscript>
        <p class="note">Enable JavaScript to view pricing.</p>
    </noscript>
</div>
```

## SVG Icons

Inline SVGs for icons with consistent structure:
```html
<span class="step-ico" aria-hidden="true">
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="..." stroke="currentColor" stroke-width="2" stroke-linecap="round" />
    </svg>
</span>
```

- Use `viewBox="0 0 24 24"` (24x24 grid)
- Use `fill="none"` for stroke-based icons
- Use `currentColor` for color inheritance
- Standard stroke-width: 2

## Native HTML Features

Prefer native HTML over JavaScript where possible:

### Native `<dialog>` for Modals
- Handles backdrop, focus trapping, Escape key
- Use `.showModal()` and `.close()` methods
- Style `::backdrop` pseudo-element

### Native `<details>` for Accordions
- No JavaScript required for expand/collapse
- Accessible by default
- Style `[open]` state and `summary::after` for icons

## Formatting

- 4-space indentation
- Self-closing tags use space before slash: `<meta ... />`
- Attributes on new lines for long elements
- Attribute order: id, class, data-*, aria-*, other
