---
name: add-section
description: Add new content sections to the page. Use when creating feature grids, timelines, FAQ sections, testimonials, or any new page section.
---

# Section Builder

## Basic Section Structure

```html
<section id="section-id" class="reveal">
  <div class="container">
    <h2>Section Title</h2>
    <!-- Content -->
  </div>
</section>
```

Required:
- `id` for navigation anchors
- `class="reveal"` for scroll animation
- `.container` wrapper for centering

## Card Grid

```html
<div class="card-grid">
  <div class="card">
    <h3>Title</h3>
    <p class="muted">Description</p>
  </div>
  <!-- More cards -->
</div>
```

Auto-fits cards at 260px minimum width.

## Two-Column Layout

```html
<div class="two-col">
  <div class="card">Left content</div>
  <div class="card">Right content</div>
</div>
```

Stacks to single column on mobile.

## Timeline

```html
<div class="timeline">
  <div class="timeline-item">
    <div class="timeline-marker">1</div>
    <div class="timeline-content">
      <h3>Step Title</h3>
      <p class="muted">Description</p>
    </div>
  </div>
</div>
```

## FAQ Accordion

```html
<details class="faq-item">
  <summary>
    Question text?
    <span class="toggle"></span>
  </summary>
  <div class="faq-content">
    <p>Answer text</p>
  </div>
</details>
```

Uses native `<details>` - no JS required.

## Stats Grid

```html
<div class="stats-grid">
  <div class="stat-card">
    <div class="stat-number">99.9%</div>
    <div class="stat-label">Uptime</div>
  </div>
</div>
```

## Add to Navigation

Update `<nav>` in `index.html`:

```html
<a href="#new-section">New Section</a>
```

## Checklist

- [ ] Add `<section>` with `id` and `class="reveal"`
- [ ] Wrap in `.container`
- [ ] Add H2 title
- [ ] Add to nav if needed
- [ ] Test scroll animation
- [ ] Test responsive at 520px, 768px, 980px

See `/design` skill for styling patterns.
