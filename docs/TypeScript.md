---
outline: deep
---

# TypeScript

JavaScript, but all grown up with types! TypeScript is a superset of JavaScript developed by Microsoft that adds static typing on top of everything JS can already do.

Anything valid in JavaScript is valid in TypeScript - it just compiles back down to plain old JS so it can run anywhere.

## The Basics

### Set Up

Grab it from the [TypeScript download page](https://www.typescriptlang.org/download).

```bash
npm init -y                          # creates a node project to work in
npm install typescript --save-dev    # installs the TS compiler locally
```

Then create a `tsconfig.json` file to compile TypeScript to JavaScript. To compile, run `npx tsc`.

A few of the common `tsconfig.json` options:

- **`compilerOptions`** - options used by the TypeScript compiler when compiling your code.
- **`outDir`** - output directory for the compiled JavaScript files (e.g. `"builds"`).
- **`target`** - the version of ECMAScript the compiled code should be compatible with (e.g. `"ESNext"` for the latest).
- **`noEmit`** - tells the compiler not to emit output files, since we're using a tool like Webpack or Parcel to bundle.
- **`include`** - which files/directories to include when the compiler runs (e.g. all files in `src` and its subdirectories).

### Running TS quickly

Found a good VS Code extension for running JavaScript in the terminal, rather than having to use an `index.html` file: **Code Runner**. For TypeScript, install `ts-node`:

```bash
npm install -g ts-node    # lets you run node with TypeScript
```

Then either run files with `ts-node <filename>.ts` or hit the play button in VS Code.

::: warning
You can only run the `index.tsx` file this way - other files won't run with either method.
:::

### Basic Types

There's a full list in the [basic types handbook](https://www.typescriptlang.org/docs/handbook/basic-types.html#table-of-contents).

You can use `let` and `const` to declare variables and add types. They look slightly different because `const` needs to be assigned a value (even if it's just empty), whereas `let` can have a value assigned later.

```typescript
let count: number = 0;
const name: string = "hk";
const isReady: boolean = true;
const tags: string[] = ["a", "b"];
```

::: tip
Let TypeScript **infer** where it can. `const name = "hk"` is already typed as `string` - you don't need to annotate everything, only where inference isn't obvious (function params, empty containers, etc.).
:::

## Types vs Interfaces

TypeScript provides two ways to define custom data objects: **types** and **interfaces**. Both describe the shape of data objects - their properties, types, and optional/required status. Types are more of a general-purpose construct; interfaces are often used in object-oriented scenarios. In many cases they're interchangeable, down to personal preference, coding style, and project conventions. The syntax is essentially identical apart from the `=` assignment.

You can add extras to interfaces like `?`, which makes a property optional. We can then use our interface as a blueprint to type variables.

With types you can just declare one variable - you don't always need `type = {}`.

## Arrays and Objects

For arrays you can use `Array<T>` (e.g. `Array<any>`). TypeScript does have an `object` type, but since objects can have varying shapes and structures, you'll usually define your own types or interfaces to represent objects with specific shapes.

::: tip
An object in JS is essentially a dict in Python.
:::

### Type Aliases

We can create our own type aliases, which take an existing type and give it another name. Handy workaround for the object issue: create a type alias to represent an object type, then reference it in your interface.

### Enumerable Types

A great way of defining a list of allowed values for a type. For example, a `status` field with a few allowed values - use an `enum` to set them:

```typescript
enum Status {
  Active,
  Inactive,
  Pending,
}
```

## Function Types

We can apply types to functions much like in Python. Define an interface, set that as the source variable type, and set the return type too.

A slightly more complex variation:

```typescript
function Search({ setResults }: { setResults: (results: User[]) => void }) {
  // ...
}
```

Here `setResults` appears twice in two different contexts:

- The first occurrence, inside the curly braces `{ setResults }`, uses **destructuring syntax** to extract the `setResults` property from an object.
- The second occurrence, after the colon `:`, is the **type annotation** - `(results: User[]) => void` says `setResults` should be a function that takes an array of `User` objects and returns `void` (no return value).

So the first is for destructuring, the second is for type annotation - they serve different purposes in the signature.

## Utility Types

### Partial

Constructs a type with all properties of `Type` set to optional. If you want to reference just a single value from a type you've already declared, `Partial` is useful. For example, you have a `Product` type with a few values but want to use just one (`category`) to reference a prop type.

```typescript
type CategoryProp = Partial<Product>;
```

### Pick

Constructs a type by picking a set of property keys. You can do this inline in the function prop types or declare a separate type.

```typescript
type CategoryOnly = Pick<Product, "category">;
```

## Union and Literal Types

A union type lets a value be one of several types, using the `|` operator. Combined with literal values it's a neat way to lock a variable down to a fixed set of options (without reaching for an `enum`):

```typescript
type Status = "active" | "inactive" | "pending";

let current: Status = "active";   // ok
current = "archived";             // error - not one of the allowed literals
```

## Narrowing

When you have a union type, TypeScript **narrows** it down as you check it, so you get the right type inside each branch:

```typescript
function printId(id: number | string) {
  if (typeof id === "string") {
    console.log(id.toUpperCase()); // id is a string here
  } else {
    console.log(id.toFixed(2));    // id is a number here
  }
}
```

Handy operators for narrowing: `typeof`, `instanceof`, `in`, and truthiness checks.

## Working with Nested Data

Struggling to map an object like `image: { data: [Object] }`? All you need is a type alias to define your own type. So `ImageData` will contain a `data` variable with an `Object[]` type:

```typescript
type ImageData = {
  data: Object[];
};
```

Given the full data object:

```typescript
{
  slug: 'black-mesa',
  title: 'Black Mesa',
  subtitle: 'A Masterful Reimagining of a Gaming Classic',
  publishedAt: '2023-05-26T11:00:00.000Z',
  image: { data: [Object] }
}
```

We can create an interface that uses our `ImageData` type.

Another feature to remember: when using return types for async fetch operations, these usually return a `Promise`, so the function return type will look like `Promise<T>`.

## Generics

Quite interesting - they sort of act like an `any` type, except you're not completely opting out of the type system. You still get strong type safety at the call site of the function.

```typescript
interface Contact {
  id: number;
  name: string;
}

function clone<T>(source: T): T {
  return Object.assign({}, source);
}

const a: Contact = { id: 1, name: "hk" };
const b = clone(a);
console.log(b);
```

We're still passing a `Contact` object and returning one, but the generic infers the type at call time.

## Classes vs Objects

The main benefit is reusability. With plain objects you'd have to update each value if you add new properties.

```typescript
// If we just have objects defined like this it becomes hard to add new properties
const messageOne = { title: undefined, message: undefined };
const messageTwo = { title: undefined, message: undefined };

// But with a class we can instantiate objects and add properties easily
export class Message {
  title: string;
  message: string;
  id: number;
}

const messageThree = new Message();
messageThree.title = "hi";
console.log(messageThree);
```

### Constructor

A constructor is a special method responsible for initializing the object's state when an instance of the class is created (the `__init__` method is the constructor in Python). While you can instantiate an object without a constructor, it's common practice to include one:

- **Initialization with default values** - assign properties default values.
- **Parameterized initialization** - ensures values must be assigned to properties when instantiated.
- **Readability and maintainability** - explicitly defining a constructor with init logic makes code more readable, especially as the class grows.

```typescript
export class Message {
  id: number;
  title: string;
  message: string;
  isSent: boolean;

  constructor(id: number, title: string, message: string) {
    this.id = id;
    this.title = title;
    this.message = message;
    this.isSent = false;
  }
}

const messageThree = new Message(1, "First Message", "Hello");
console.log(messageThree);
```

## Generic Key/Value Type

```typescript
export type GenericKeyValue = {
  [key: string]: any;
};
```

This represents a type with any number of key/value pairs where the key is a string and the value can be anything. Useful for representing something like a form schema where you don't know the exact shape until it's pulled at run time.

## Tips & Tricks

- **`unknown` over `any`** - `any` disables type checking entirely; `unknown` forces you to narrow before using the value, keeping you type-safe.
- **Optional chaining and nullish coalescing** - `user?.address?.city` avoids "cannot read property of undefined", and `value ?? "default"` only falls back on `null`/`undefined` (not on `0` or `""`).
- **`as const`** - freezes an object/array into its most specific literal type, great for config objects and lookup tables.
- **`readonly`** - mark properties that shouldn't change after creation.
- **Strict mode** - turn on `"strict": true` in `tsconfig.json`. It's stricter up front but catches a huge class of bugs.

### Resetting a messed-up node setup

Use this if the packages get really messed up from people installing via different node versions:

```bash
nvm use 20.8.0 && rm -rf node_modules package-lock.json && npm install
```
