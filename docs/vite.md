---
outline: deep
---

# Vite

Build tool that aims to provide a faster and leaner development experience for modern web projects

## The Basics

Set the project up by running the below

```bash
npm create vite@latest
```

### Tailwind Config

For tailwind we need to run a few more things...

```bash
npm install -D tailwindcss postcss autoprefixer vite
```

```bash
npx tailwindcss init -p
```

Formats tailwind classes on save

```bash
npm i -D prettier-plugin-tailwindcss
```

You should get the below files added after this but if not can add them manually

**_index.css_**

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

These ones are specific to TypeSciprt being used in the project, I think it may be different for non-TypeScript projects

**_tailwind.config.js_**

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [],
};
```

**_postcss.config.js_**

```javascript
export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

# Issues & Debugging

Fix for the below listed [here](https://vitejs.dev/guide/troubleshooting.html#this-package-is-esm-only)
Just update your config file to .mjs

```
✘ [ERROR] "vitepress" resolved to an ESM file. ESM file cannot be loaded by `require`
```

Encountered the below error when trying to run some projects after moving some folders around post stopping iCloud sync. To resolve do the following.

1. `npm cache clean --force` - Clear the npm cache
2. After clearing the cache, delete the node_modules folder and the package-lock.json file (if present) to ensure a fresh environment.
3. `npm install` - Reinstall dependencies

```
[vite] Pre-transform error: Cannot find module '../../utils/shallowEqual.js' Require stack:

/Users/Desktop/d3-example/node_modules/@babel/types/lib/validators/generated/index.js
```
