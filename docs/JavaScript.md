---
outline: deep
---

# JavaScript

The language of the web. JavaScript doesn't run in the code editor - it runs in the browser. These are working notes on the fundamentals: the DOM, objects, classes, functions, scope, and events.

## Tooling

A couple of VS Code extensions worth having: **ESLint** and **Prettier** for formatting and error-checking. Beyond installing the extensions, run `npm install` in the VS Code terminal to pull the dependencies those packages need. This also requires Node.js on the machine.

```bash
node -v    # prints a version number if Node is installed, e.g. v12.17.0
```

Open the VS Code terminal with `ctrl+`` (backtick) or via the Terminal menu.

::: tip Format on save
Enable it in Preferences - search "formatonsave" and tick the box.
:::

## The Browser Console

Since JavaScript runs in the browser, you need a way to interact with it there - that's the console, appended to the developer tools. Open dev tools and you get the console too.

A few useful things:

- `window.document` condenses the HTML into a viewable object (much like the Elements tab).
- **Enter Responsive Design Mode** (in the develop menu) previews the site across browser/device configurations.
- You can reference objects declared in the code by name, and even amend the logic live (e.g. flip a `lidStatus` boolean from `false` to `true` and watch the HTML change).

## Modern Script Loading

The browser reads an HTML document top-down, fetching and executing elements as it encounters them. Script tags in the header (e.g. external stylesheets and JS files) can cause rendering problems.

The traditional hack is to put the `<script>` at the bottom of the body, but that breaks JS that needs to run early or during page load. Modern approach: use `async` and `defer` on the script tag.

::: tip
When you set `type="module"` on a script, it's automatically deferred - modules only run once everything else is available, so the browser has all modules before rendering.
:::

## JavaScript Modules

Modules let you break pieces out of a file into a separate file and import them back in - this keeps code manageable. It also works for CSS (e.g. importing a CSS file into a React file).

Define an object, mark it `export default`, then import it elsewhere. To use modules in an HTML file, reference the script with `type="module"`. All imports happen at the top of the file, which guarantees things like classes are declared before use.

## Objects

To create an object you need a variable to hold it - the modern convention is a `const`.

```js
const backpack = {
  name: "Everyday Backpack",
  volume: 30,
  lidOpen: false,
};
```

**Object containers:** `const` means constant. You can change the *properties* of the object inside the container, but you can't remove or replace the object itself.

**Object properties:** defined as colon-separated name/value pairs. The name is any string; the value can be a string, integer, float, boolean, array, or another object. A property name can only contain letters, digits, dollar signs, and underscores - use **camelCase** to be safe. Hyphens or other symbols will break the object.

### Accessing objects

```js
console.log(backpack);
console.log("This is the backpack object:", backpack);
```

### Dot notation

```js
console.log("This is the volume:", backpack.volume);
```

You can dig into nested properties too (e.g. `backpack.strap.left`).

### Bracket notation

Use bracket notation when you need more control - a variable as the property name, or a non-standard property name (e.g. one with a hyphen). Otherwise prefer dot notation for readability.

```js
var query = "pocketNum";
console.log("Using bracket notation:", backpack[query]);
```

### Object methods

Methods are functions sitting inside objects. You can log the object, change a status property, and run a method to return a before/after value.

::: tip Method vs Function
A method and a function are both sets of instructions that perform a task. The difference: a method is associated with an object, a function is not.
:::

## The DOM

The Document Object Model is the browser's internal programmatic representation of the web page - a tree of objects for HTML (also XML, SVG). It's technically an API: you can query objects and classes and get information back.

In the DOM, all HTML elements are objects. The interface is each object's properties and methods:

- **Property** - a value you can get or set (e.g. `innerHTML` to change an element's content).
- **Method** - an action you can perform (e.g. add or delete an element).

The most common way to access an element is by its `id`; the easiest way to get its content is `innerHTML`.

### Query selector methods

`querySelector()` returns the first matching element; `querySelectorAll()` returns all matches. Query for classes with a leading dot (like CSS). Increase specificity with combined selectors (e.g. `"main li"` for all `li` inside `main`).

```js
document.querySelectorAll("main li").forEach((li) => {
  li.style.backgroundColor = "yellow";
});
```

You can also target with the CSS `:last-child` selector.

### Older access methods

`getElementsByClassName` and `getElementById` still work but predate the query selectors. The class method returns an HTML collection you then have to work through, which is why older code is full of `id`s used purely for targeting. Prefer `querySelector`/`querySelectorAll`.

### Modifying element classes

Two specialised properties for class manipulation:

- `Element.className`
- `Element.classList` - preferred, since it can target multiple classes.

### Attributes

Access an element's attributes, read a specific one, or modify them:

```js
img.getAttribute("alt");
img.setAttribute("alt", "A backpack");
img.removeAttribute("alt");
```

### Inline styles

Access and change styles set via the `style` attribute:

```js
el.style.backgroundColor = "blue";
```

::: warning cssText
The `style` object has a `cssText` property holding all styles. You *can* dump multiple declarations into it, but it's advised to set individual properties instead. Note CSS property names here are camelCased, not hyphenated - `backgroundColor`, not `background-color`.
:::

## Template Literals

Bridge the gap between logging JS and rendering it in the browser:

- Define a `const` to hold the HTML markup.
- Wrap the HTML in backticks `` `` ``.
- Use `${}` to inject JavaScript variables, which render in the browser.

```js
document.body.innerHTML = `Your text ${variable}`;
```

## Adding DOM Elements

Inject HTML via JavaScript without removing existing content - append or add it in:

```js
const content = `<h2>${backpack.name}</h2>`;
const target = document.querySelector(".maincontent");

const newArticle = document.createElement("article");
newArticle.classList.add("backpack");
newArticle.setAttribute("id", backpack.id);
newArticle.innerHTML = content;

target.append(newArticle);   // or prepend() to add above
```

Use `createElement` to make a wrapper (e.g. an `<article>` or `<nav>`), add a class/id, set its `innerHTML`, then `append` (below) or `prepend` (above) it to the parent node.

## Classes: Object Blueprints

Classes are templates for an object type. Declaring each object verbosely produces a lot of repetition; a class defines the property/method structure once. Change the class and every object created from it updates automatically.

```js
export class Backpack {
  constructor(name, volume) {
    this.name = name;
    this.volume = volume;
    this.lidOpen = false;
  }

  toggleLid(lidStatus) {
    this.lidOpen = lidStatus;
  }
}
```

Declare (or import) the class before you use it. A good pattern is to put classes in their own file and import them at the top of the main file - that guarantees the class exists before use.

### Object constructors

An older, less advanced way of doing the same thing with a basic function - the **object constructor function**. Here the methods live inside the main constructor function, alongside the properties. Rule of thumb: use a class unless you're forced to use a constructor function (old code/infrastructure).

## Global Objects

Beyond objects you build, the browser provides a long list of [built-in global objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects). A common one is `Date` - e.g. add a `dateAcquired` property and a `backpackAge()` method that works out the days since acquisition.

## Variables & Scope

A variable is a container for a piece of data. JavaScript reads top-down.

### var

`var` is **globally scoped**. If you assign a `var` a value, then reassign it inside a function, the new value takes effect everywhere after that point - even outside the function. This causes **scope issues**: unintended behaviour that's frustrating to debug.

### let

`let` defines a **block-scoped** local variable - only defined within its enclosing block. This safely avoids the `var` scope problem, letting you use two same-named variables without clashing.

### const

Use `let` for any changeable/mutable variable, and `const` for anything that shouldn't be overwritten (objects, arrays, functions).

## Data Types & Comparison

JavaScript is a weakly typed language - you don't specify data types. `typeof` shows a value's data type.

- `=` assignment
- `==` comparison (loose - JS coerces types, so `"5" == 5` is true)
- `===` strict equivalence (no coercion, so `"5" === 5` is false)
- `!==` strict inequality

## Arrays

An array is a single variable storing a list of elements, accessed by index.

```js
const items = ["a", "b", "c"];
items.forEach((item) => {
  // add an <li> per item, etc.
});
```

The `find` method locates a specific element in an array. For nested array objects you need recursion to reach the data.

### Objects vs Arrays

Objects represent "things" with characteristics (properties); arrays store lists of data. Dot and bracket notation access/add/change/remove object items; zero-based indexing and built-in methods do the same for arrays. Iterate both with `for`, `for...in`, `for...of`, and `forEach()`.

## Functions

A **function** stands on its own; a **method** sits inside an object and acts on it. They're effectively the same, just in different contexts.

Several ways to declare a function - the preferred is the **function expression**, storing it in a `const`:

```js
const greet = function (name) {
  return `Hello ${name}`;
};
```

### Arrow functions

A more concise syntax, though limited in some situations (notably around `this`):

```js
const greet = (name) => `Hello ${name}`;
```

If you only need to set one element you can return an expression directly.

### Parameters & return values

Pass values to a function via parameters. Use helper (smaller) functions to complete sub-tasks and pass their return values into a main function.

::: warning
`window.prompt` returns a string. Chaining `.toFixed` on it fails - remove `.toFixed` and it works (though then you need to handle the numeric conversion yourself).
:::

### Callback functions

A callback is a function passed as an argument to another function, then invoked inside the outer function to complete some routine. It can run after the outer function has finished.

## Control Flow

### if / else and the ternary

```js
const status = lidOpen ? "Open" : "Closed";
```

The ternary condenses an if/else to one line - handy in `console.log` or template literals.

### Logical operators

- `&&` - AND
- `||` - OR

### Switch statement

Essentially `CASE WHEN` - branch on the value of an expression.

## Looping

Four looping methods: `for`, `for...of`, `forEach`, `for...in`.

### map()

`map()` also "loops" through content, but it returns a **new array**. Use `forEach` when you just need to iterate; use `map` when you want to build a new array, transforming each item.

## DOM Events

Everything that happens in the browser is an **event** (clicks, mouse moves, key presses). With JavaScript we listen for events, capture them, and act when they fire.

An **EventListener** is a method added to a target (usually an element) that listens for a specific event and calls back a function when it's detected.

Typical pattern - toggling a class on click:

```js
// 1. a CSS class to toggle
// 2. grab the element whose class we'll change
const body = document.querySelector("body");
// 3. grab the trigger element
const button = document.querySelector(".toggle-btn");
// 4. add the listener
button.addEventListener("click", () => {
  body.classList.toggle("dark");
});
```

### innerText & mouse events

`innerText` represents the text content of a node. Combined with a `mousemove`-style listener you can update on-page text with the live mouse x/y coordinates as the user moves around.

### Arrow vs callback listeners

You can pass an inline arrow function to `addEventListener`, or a named callback function (e.g. toggling a mobile menu).

### `this` in listeners

Use a **function declaration** (not an arrow function) when you need `this` - it refers to the object you're inside, and resolves differently depending on how it's called. Example: a `lidToggle` function that reads the clicked button's parent article `id`, then uses `find` on the backpack array to locate the matching object.

### Passing arguments through listeners

To access the event object inside a callback, add it as a parameter:

```js
button.addEventListener("click", (event) => {
  // event.target, etc.
});
```
