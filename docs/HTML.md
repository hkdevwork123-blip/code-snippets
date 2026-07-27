---
outline: deep
---

# HTML

The skeleton that holds up every website you've ever visited. HTML (HyperText Markup Language) It's a markup language used to structure content on the web. Headings, paragraphs, links, images, forms... it's all HTML under the hood. It won't make things pretty (that's CSS's job) or interactive (JavaScript), but nothing makes it onto the page without it.

## The Basics

A page is a tree of nested elements. Most elements have an opening and closing tag with content in between:

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>My Page</title>
  </head>
  <body>
    <h1>Hello</h1>
    <p>A paragraph with a <a href="https://example.com">link</a>.</p>
  </body>
</html>
```

- **`<head>`** - metadata, title, links to CSS, that don't render in the page body.
- **`<body>`** - everything the user actually sees.
- **Attributes** - extra info on a tag, e.g. `href`, `src`, `alt`, `class`, `id`.

## Common Elements

| Element                     | Use for                                  |
| --------------------------- | ---------------------------------------- |
| `<h1>` - `<h6>`             | Headings (one `<h1>` per page)           |
| `<p>`                       | Paragraphs                               |
| `<a href="">`               | Links                                    |
| `<img src="" alt="">`       | Images (`alt` is not optional)           |
| `<ul>` / `<ol>` / `<li>`    | Unordered / ordered lists                |
| `<div>` / `<span>`          | Generic block / inline containers        |
| `<button>`, `<input>`       | Interactive form controls                |

## Semantic HTML

Prefer tags that describe their meaning over a wall of `<div>`s. It helps accessibility, SEO and readability:

```html
<header>...</header>
<nav>...</nav>
<main>
  <article>...</article>
  <aside>...</aside>
</main>
<footer>...</footer>
```

## Forms

```html
<form action="/submit" method="post">
  <label for="email">Email</label>
  <input type="email" id="email" name="email" required />
  <button type="submit">Send</button>
</form>
```

::: tip
Always pair an `<input>` with a `<label>` (via `for`/`id`). Screen readers rely on it, and clicking the label focuses the input.
:::

## Tips & Tricks

- **`alt` text on every image** - describes the image for screen readers and shows if the image fails to load.
- **Block vs inline** - `<div>`, `<p>`, `<h1>` stack vertically; `<span>`, `<a>`, `<strong>` sit inline in a line of text.
- **`&amp;` `&lt;` `&gt;`** - use HTML entities for characters that would otherwise be parsed as markup.
- **Validate** - run pages through the [W3C validator](https://validator.w3.org/) to catch unclosed tags and nesting mistakes.
