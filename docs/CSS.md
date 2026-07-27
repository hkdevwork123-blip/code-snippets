---
outline: deep
---

# CSS

If HTML is the skeleton, CSS is the outfit, the makeup and the general vibe. CSS (Cascading Style Sheets) is what takes a plain, unstyled wall of text and turns it into something people actually want to look at. Colours, layouts, fonts, animations, responsive design etc.

## The Basics

A rule targets elements with a **selector** and applies **declarations** (`property: value;`):

```css
p {
  color: #333;
  font-size: 16px;
  line-height: 1.5;
}
```

- **Element selector** - `p`, `h1`, `button`
- **Class selector** - `.card` (matches `class="card"`)
- **ID selector** - `#header` (matches `id="header"`, should be unique)

The **cascade** decides which rule wins when several match: later rules and more specific selectors override earlier/less specific ones. Specificity order (low to high): element < class < ID < inline style.

## The Box Model

Every element is a box made of content, padding, border and margin:

```css
.card {
  padding: 16px;      /* space inside the border */
  border: 1px solid #ddd;
  margin: 8px;        /* space outside the border */
}

* {
  box-sizing: border-box; /* width/height include padding + border */
}
```

::: tip
Setting `box-sizing: border-box` globally makes widths behave the way you'd expect - padding and border no longer inflate the element's size.
:::

## Layout with Flexbox

The go-to for arranging items in a row or column:

```css
.row {
  display: flex;
  justify-content: space-between; /* main-axis alignment */
  align-items: center;            /* cross-axis alignment */
  gap: 16px;
}
```

For two-dimensional layouts (rows *and* columns), reach for CSS Grid:

```css
.grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
}
```

## Responsive Design

Use media queries to adapt to screen size:

```css
.container {
  width: 100%;
}

@media (min-width: 768px) {
  .container {
    max-width: 720px;
    margin: 0 auto;
  }
}
```

## Tips & Tricks

- **Custom properties (variables)** - define once, reuse everywhere:

  ```css
  :root {
    --brand: #4f46e5;
  }
  .btn {
    background: var(--brand);
  }
  ```

- **Prefer classes over IDs** for styling - IDs are hard to override due to high specificity.
- **`rem` over `px`** for font sizes - scales with the user's root font size for accessibility.
- **Centre a block** - `margin: 0 auto;` (with a set width) or `display: flex; justify-content: center;` on the parent.
- **Avoid `!important`** - it's a specificity nuke that makes future overrides painful. Fix the selector instead.
