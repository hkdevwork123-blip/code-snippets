---
outline: deep
---

# Next.js & React

React, but with a server. Next.js is a popular JavaScript framework for building server-rendered and statically generated web applications. It's built on top of React and lets you create apps optimised for performance and scalability.

One of the key features is server-side rendering: it generates the HTML for a page on the server and sends it to the client. This improves performance because it reduces the work the client's browser has to do to render the page.

The main benefits:

- **File-based routing** - define pages and routes with files and folders, rather than wiring up a router in code.
- **Server-side rendering** - render on the server, closer to your data.
- **Full-stack capabilities** - easily add backend (server-side) code.

Useful commands:

```bash
npx create-next-app    # scaffold a project (offers TypeScript)
npm run dev            # start the dev server
```

## React Refresher

A JavaScript library for building user interfaces. Client-side rendered.

### Why use it?

It comes down to doing things in less of an imperative way. React abstracts the manual DOM work away, making it a much cleaner job to write code. Imperative programming is characterised by explicit instructions and detailed control; declarative programming is characterised by describing the desired outcome and abstracting away the implementation details. React is declarative - you describe the outcome you want and React takes care of the details.

React is all about splitting your app into **components** - you basically create your own custom HTML elements.

### Single Page Applications (SPAs)

The server only sends one HTML page. Thereafter React takes over and controls the UI to make it seem like the user is navigating between different pages. That's why the project only has one HTML file.

```bash
npx create-react-app <your project name>
npm start
```

::: tip
For JavaScript import statements you don't need to include the file extension.
:::

### Components

If you have a common component you're reusing across the site (e.g. a button), add it to the `components` folder and drop it in as many times as you want using JSX. This massively reduces code and makes it easier to change things. The same applies to headers, navs, and other elements that should be treated as components.

### Props

Props let you pass dynamic content to components - so a `Button` or `Todo` component can be different for each instance. A prop is just a variable passed to your component as a key/value pair, set in the parent. `props` is the standard naming convention, but you can call it whatever you want.

### Handling Events

In vanilla JS we use an imperative approach to describe an event (an event listener). With React we use the declarative approach and pass a prop to the component.

::: tip
If you return an HTML tag without any text (no children), you don't need to close it - a self-closing tag is fine.
:::

### Event Props

Event props are passed to a component to handle events like clicks or key presses. They often take the form of a **callback function**, executed when the event occurs (e.g. the `onClick` event prop). A callback is a function passed as an argument to another function and executed at a later time.

When we create our own components and use them inside others, they don't automatically have event props - we need to wire this up in the code. If you only want to do one action (e.g. close a modal), you can just pass the same prop to `onClick`. If you want two separate actions, define two separate functions and pass those along.

## State

State is literally the state of the application at any given point. A more formal definition: the data manipulated and reflected by your running program (e.g. a to-do list where items are added and removed).

For this we use the `useState` hook. It returns an array with exactly two elements: the current state and a function to update it. Store the returned array in a `const` using array destructuring.

```jsx
const [modalIsOpen, setModalIsOpen] = useState(false);

function deleteHandler() {
  setModalIsOpen(true);
}
```

Calling the setter (e.g. `setModalIsOpen(true)`) updates the state and triggers a re-render.

### Conditional rendering with &&

The `&&` operator conditionally renders a component based on state. When `modalIsOpen` is `false`, `modalIsOpen && <ModalTwo />` evaluates to `false` and `ModalTwo` isn't rendered. When it flips to `true`, the component renders.

```jsx
{modalIsOpen && <ModalTwo />}
{modalIsOpen && <BackdropTwo />}
```

## Routing (React Router)

```bash
npm i -D react-router-dom@latest
```

Routing gives the illusion of navigating to a new page when in fact you only have one HTML page - React handles the UI navigation, so you don't wait for other pages to load.

Add a `pages` subdirectory to `src`, create your page components, then:

```jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
```

Wrap your content in `<BrowserRouter>`, then define your `<Routes>`. The `path` defines the URL (e.g. `localhost:3000/page-two`) and `element` specifies the component to render.

### Navigation & Links

Create a `layout` folder in `components` for a generic navbar, and use the React `Link` component to define navigation by the routes you've set. Then drop the nav component into `App.js`.

## Scoping Styles with CSS Modules

Create React App gives you scoped styles out of the box. Name the CSS file `MainNav.module.css` and you can reuse class names across components without clashes. If you're not reusing class names, standard CSS files are fine.

::: warning
JSX can't handle style class names with `-`, so use `_` instead.
:::

## Outputting Lists of Data

Use the `map` method, which runs the given function on every item in an array and returns the result of each call. When outputting a list, include a unique `key` prop for each item - React uses this to track items and update the list efficiently.

### Wrapper components

Create components that wrap other components (e.g. a `<main>` tag around the main content). Use props again and pass `props.children` to the wrapper. For example a `<Grid/>` component (a `<main>` tag with scoped grid styling) can wrap a `MeetupList` to give a two-column layout.

## Forms & User Input

To get user input:

- Use a `ref` attribute in the HTML on the input you want to read.
- Assign the variables with the `useRef()` hook. `useRef` persists values between renders and can store a mutable value that does *not* cause a re-render when updated.
- Create a handler (e.g. `onSubmit` on the form, `onClick` on the button).
- Read the entered values with dot notation, e.g. `titleInputRef.current.value`.
- Store the data in an object (key/value pairs) and do something with it.

## Fetching Data with useEffect

`useEffect` is a React hook that runs code after a component has rendered - handy for fetching data or setting up event listeners. It takes a function that runs after the component updates, and an optional dependency array of values to watch, which determines when the function runs again.

::: warning Infinite loop
If you fetch data inside `useEffect` and include the state you set (e.g. `productData`) in the dependency array, you'll create an infinite loop: the effect runs, sets state, the state change re-triggers the effect, and so on. Don't include state in the dependency array unless you *want* the effect to run when it changes.
:::

The key point: when hitting an API in React you can't just call the function like in vanilla JS. React components are reactive - if you put an API call directly in the component body, it runs on every re-render. Use `useEffect` to control when the request fires.

## React Context

React Context lets you share data across multiple components without passing props manually at every level of the tree. Good for "global" state like a theme, user info, or preferred language.

Create a `store` folder (naming convention), import `createContext`, and use it to create a context. The single argument to `createContext` is the default value - it can be any data type (number, string, object, array, even a component).

## Next.js

### File-based Routing

In Next.js, file-based routing lets you define routes by creating files in the `pages`/`app` directory. Each file represents a route, and the file name corresponds to the URL. A file `about.js` is served at `/about`; `blog/post.js` at `/blog/post`.

In the app-router setup you have an `app` folder, and each subdirectory with a `page.js`/`page.tsx` file becomes a route. Whatever you call the folder matches the endpoint of your URL. The more you nest, the longer the path becomes (e.g. `http://localhost:3000/reviews/stardew-valley`). That's the essence of file-based routing.

### App vs Pages Router

`./app` is the new directory for routing pages. The old one was `./pages`.

### The layout file

`layout.tsx` is a wrapper for general page styling and shared chrome (navbar, footer). Content here renders on every page.

### Nested Layouts

Add a `layout` file inside a subfolder (e.g. `reviews`) to give every page in that folder an additional shared section (like a hero) on top of the root layout. Other routes just get the standard view.

## Server-Side vs Client-Side Rendering

**Server-Side Rendering (SSR):** on the initial page load, Next.js runs the component code on the server and generates the HTML, which it sends to the client. That's why you can't see `console.log` output in the browser unless you mark a component client-side - it logs to your terminal instead.

**Client-Side Rendering (CSR):** once the client-side JavaScript bundle takes over, subsequent rendering and updates happen on the client using React.

Prerendering is generally faster and more search-engine friendly.

### Server Components

Let you leverage server infrastructure - move data fetching to the server, closer to your database, and keep large dependencies off the client bundle for better performance.

### Client Components

Enable client-side interactivity. In Next.js they're pre-rendered on the server and hydrated on the client.

### 'use client'

The `'use client'` directive distinguishes a Client component from a Server one. Without it, a `console.log` shows in your local server terminal; with it, the log appears in the browser console.

### Hydration

The process of rendering a component in the browser after it was pre-rendered on the server. The server-side and client-side output get merged together.

::: tip Nested client components
Only add `'use client'` to the *leaf* components in your tree - the end of the component tree - not every parent.
:::

### Next & useEffect

Next provides SSR and static site generation (SSG) out of the box. You can fetch data and run server-side logic directly in the page component without `useState` or `useEffect`. In plain React everything is client-side and you use hooks to manage state and data fetching.

## Dev vs Production Server

```bash
npm run dev     # dev server
npm run build   # optimised production build (static HTML + JS bundles)
npm start       # production-mode server
```

`build` optimises your code and generates static HTML and client-side JS bundles. `npm start` serves that optimised build, simulating production behaviour.

## Link Component, SPAs & MPAs

A plain `<a href="...">` unloads the current page and loads a new one - a **multi-page application** (MPA), how traditional sites work.

With React/Next we want **client-side navigation** (making it an SPA): the browser loads a single page, then JavaScript swaps one component for another in the same page. Next supports this with the `Link` component.

::: tip
Inspect the Network tab - no new requests fire when `Link`s are clicked, which makes navigation quicker for the user. You don't need `Link` for external links.
:::

### Prefetching

With `Link`, Next.js automatically fetches and caches the content of the next page based on your interactions. Prefetching is a **production-only** feature - it doesn't happen in dev mode.

## Images & Static Assets

Anything in the `public` folder can be rendered on the page. Use the Next `Image` component to render images, which gives you built-in optimisations. You can keep images at the root of `public` or in a subfolder:

```
project-root
|-- public
|   |-- images
|   |   |-- image-product-1.jpg
|   |   |-- image-product-1-thumbnail.jpg
```

## Rendering Markdown

Write markdown and render it in your app. Read from a file, then use the `marked` package:

```bash
npm install marked
npm i --save-dev @types/marked
```

For correct markdown styles, add the Tailwind typography plugin and use the `prose` classes:

```bash
npm install -D @tailwindcss/typography
```

You can make markdown rendering more component-like using **front matter** - YAML properties at the top of a markdown file (needs an extra package to parse).

## Dynamic Routes

Rather than a folder per route, use `[slug]` - the square brackets make it act like a wildcard (a slug is a URL-friendly representation of a title or identifier). This lets you reuse the same component to load different content.

When set up as a dynamic route, the page receives props automatically - just add them to the component:

```js
{ params: { slug: 'new-game' }, searchParams: {} }
```

Match your markdown files (or CMS records) with the slug and you can reuse one component for many pages.

### Static Generation for Dynamic Routes

By default a dynamic route is server-side rendered (you'll see a lambda symbol next to it after `npm run build`), losing some of the speed of static generation and requiring a Node.js server.

To statically generate dynamic routes, create a function (`generateStaticParams`) that returns the slugs. Refactor a `getSlugs` helper into your `lib` folder and call it. After rebuilding, everything is statically generated - no lambda symbol, and the server doesn't re-render on request.

## Metadata

Add metadata and tags for SEO. Create a template metadata object in `layout.tsx`; `%s` is a wildcard that other pages fill in (common pattern: `Page Title | Site Name`).

For dynamic routes, Next provides `generateMetadata`, which receives the same props as the page - so you can access the slug and set a per-page title.

::: tip
Change the default Vercel favicon by adding your own `icon.png` and removing theirs.
:::

## Data Fetching, Caching & Revalidating

Next caches HTTP requests and images in a `.next` folder, making repeat fetches faster.

### Dynamic Rendering

To have a page always fetch fresh data (e.g. after moving from markdown files to a headless CMS), force dynamic rendering:

```js
export const dynamic = "force-dynamic";
```

Delete `.next` to clear the cache, then `npm run build` and `npm start`. Pages that fetch data should generally be set to dynamic. The easiest way to check is the lambda symbol next to a page after build.

### Revalidating Data

Dynamic rendering regenerates every page on every request, even when the data rarely changes. **Revalidating** generates static pages but regenerates them at runtime. Set a `revalidate` constant with a time period. The revalidation isn't driven purely by time - it's request-driven: when someone requests the page after the period has elapsed, it regenerates.

## Route Handlers

This is the Express crossover - create API routes inside Next. Convention: an `api` folder with route files inside.

```ts
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  return NextResponse.json({ value: "hello!" });
}
```

### Not Found

```ts
import { notFound } from "next/navigation";
```

Call `notFound()` directly or after a function call. Because of `layout.tsx`, the 404 renders with the header and footer. You can customise it with a `not-found.tsx` file.

## Server Actions

Server Actions let us run DB code directly inside a component - the Prisma client can be called right in the component, which makes things much easier than the old approach (a client form → API route → DB insert).

To set up:

- Set `serverActions: true` in `next.config.js`.
- Add `'use server'` in the component.
- Set IDs on the HTML elements you want to grab data from.
- Use the Next `redirect` feature to reload/redirect (the data won't render immediately).

::: warning
On the first request you may hit `UND_ERR_REQ_CONTENT_LENGTH_MISMATCH` (`failed to get redirect response`). It's a known Next issue that goes away after the first insert + refresh - resolved by updating Next.
:::

### revalidatePath

After a form submission, Next renders the response dynamically for that request only and doesn't cache it - so you can submit, get redirected and see the data, then reload and *not* see it. This is intentional (some responses are user-specific and shouldn't be cached and reused). Use `revalidatePath` to re-render *and* cache the page as static after submission.

### Progressive Enhancement

Server Action forms work even without JavaScript (you can disable JS in the browser and the form still submits).

### Prisma on the dev server

In dev mode Next refreshes on every code change, and each refresh opens a new DB connection with Prisma. The fix: instantiate a single `PrismaClient` and store it on `globalThis`, only creating a new one if it isn't already there. See the `db.ts` file for this pattern.

### Separate Server Action file

You can't define inline `'use server'` actions in a Client Component. Instead, export them from a separate file with `'use server'` at the top, or pass them down via props. Convention: keep the action file in the same route (e.g. the slug folder), commonly named `actions.ts`. Pass the slug along with a hidden input:

```jsx
{/* Hidden form field to capture the slug for use in createComment */}
<input type="hidden" name="slug" value={slug}></input>
```

### Client-side validation & displaying errors

Move the action to its own file, then don't bind it directly to the form - use `onSubmit` instead. A `validateForm` function checks required fields and returns an error object if any are missing. Back in the component, check the returned value and update an `isError` state to show a message.

::: tip Never trust the client
HTML validation attributes (like `required`) can be stripped in the browser dev tools, and the fetch request can be copied from the Network tab and replayed/spammed. Always validate user input on the server too.
:::

### Preventing duplicate submissions

On a slow network a user could keep submitting and create duplicates. Disable the submit button while the request is in flight, then re-enable it on success. Use a single state object holding both `error` and `loading`. Simulate a slow network with dev-tools throttling to test.

### Custom form hook

`useFormStatus` and `useActionState` (formerly `useFormState`) exist but add little over the above, and are only in React's Canary/experimental channels. Instead, extract your `handleSubmit` and state setter into your own `useFormState` hook.

## Suspense

Wrap a component in React's `<Suspense/>` to separate its loading from the rest of the page. Useful when a review page loads the review quickly but also loads comments from a DB - wrapping `<CommentList/>` in `<Suspense/>` means the review loads first and the comments stream in later, rather than blocking the whole page.

## Authentication

### Clerk

Clerk is a more pre-managed auth library (Lucia gives more flexibility but needs more config).

- Sign up, create an app, follow the framework setup instructions.
- The `middleware.ts` file needs to live in the `src` folder, not the project root (otherwise: `Clerk: auth() was called but Clerk can't detect usage of clerkMiddleware()`).
- Create catch-all routes `sign-in/[[...sign-in]]` and `sign-up/[[...sign-up]]` with a `page.tsx`, and use Clerk's `SignIn`/`SignUp` components.
- `currentUser()` gives the current logged-in user - use it for conditional rendering (see `NavBar.tsx`).
- `SignOutButton` / `SignInButton` - conditionally render based on `currentUser()`.

Clerk manages several cookies (visible in the Application tab of dev tools):

- `__clerk_db_jwt` - Clerk-specific JWT cookie.
- `__client_uat` - client-side User Authentication Token; Clerk uses it to manage auth state on the client.
- `__session` - session details (user ID, expiration).

Clear these tokens while logged in and you'll immediately be logged out - there's no user/session/auth info left in the browser.

### Lucia + MongoDB

Lucia needs a few extra pieces that Clerk handles out of the box.

```bash
npm install mongodb
npm install @lucia-auth/adapter-mongodb
```

- Create a `lib` folder with `auth.ts` and `db.ts`.
- `db.ts` - connection to the DB, exports the `UserCollection` and `SessionCollection`.
- `auth.ts` - sets up the Lucia object plus functions to validate whether the user is logged in and to create session/cookie info.
- Create `sign-in` and `sign-up` routes, each with `actions.ts` (server-action sign-in/up logic) and `page.tsx` (the form).

::: tip
Using a client component for the Navbar dropped the auth token on every refresh (related to `validateRequest`), and the logged-in state didn't update until a manual refresh. Switching to a server-side Navbar (`NavBarSS.tsx`) fixed it - it conditionally renders based on `validateRequest`, and a `sign-out/action.ts` exports the `logOutAction` used as the form action.
:::

### JWTs

JSON Web Tokens are a compact, URL-safe way of representing **claims** (statements about an entity, typically the user) transferred between two parties. In authorization (e.g. with Clerk), JWTs securely transmit information about an authenticated user between client and server.

### Session vs Token-based auth

The main difference: session-based auth is usually handled on the **server**, token-based on the **client**.

**Session:**

- User submits login form.
- Server stores a session.
- Browser puts the session ID (generated by the server) in a cookie.
- Browser sends the cookie with future requests.

**Token (JWT):**

- User submits login form.
- Server creates a JWT (signed with a private key on the server).
- Browser puts the JWT in local storage.
- The signed JWT (`Authorization: Bearer <token>`) is validated on future requests - the server only needs to validate the signature, no DB lookup needed.

### Catch-all routes

- **Non-optional `[...name]`** - matches when segments follow the route. `pages/posts/[...slug].js` matches `/posts/a-single-post` and `/posts/2020/10/how-to-cook`, but *not* `/posts` on its own.
- **Optional `[[...name]]`** - also matches `/posts` on its own, as well as deeper segments.

### Cookies

Cookies are small pieces of data stored on the user's device to remember preferences or session info. Next provides built-in cookie handling. This sets a session cookie (expires when the browser closes):

```js
// When login is successful, set a cookie with the user details
cookies().set("user", JSON.stringify(user));
```

Cookies are set in the HTTP response (visible in the Network tab) and sent back on subsequent requests, so you can read them on other pages to check the logged-in user.

::: warning
Storing user info directly in a cookie isn't secure - someone could edit the email to `admin`. Never trust data sent via a form; always validate on the server.
:::

Use the `jose` package to generate a proper JWT, then verify it server-side with your secret key and extract the user from the payload. Because it's signed, tampering with the token in the browser just produces an error in your logs.

Generate a real secret key:

```bash
node --print "require('crypto').randomBytes(32).toString('hex')"
```

Save it to `.env.local` (use a different one in production). Keep the encryption method in mind - HS256 uses 256 bits, equivalent to 32 bytes.

### Session expiration

Expire the JWT so it isn't valid forever (a permanent token lets someone impersonate the user indefinitely). Add expiry params to your `setSessionCookie` function, and set `httpOnly: true` so the cookie can't be read from client-side JavaScript.

::: warning
Without `httpOnly`, you can run `document.cookie` in the browser console and read the cookie. This is why session tokens can be grabbed by scraping some sites.
:::

You may also want `sameSite: "lax"` - see the MDN Web Docs for an overview.

## Dynamic API Routes

Just like `[slug]` in page routing, you can create dynamic API routes.

- Create the folder with a dynamic param: `api/get-service/[id]`.
- Create `route.ts` and import `NextRequest`, `NextResponse`. Even if the first `_request` param isn't used (hence the underscore), you still have to include it.
- The second argument is `context`. Destructure the params in the type signature rather than reaching for `context.params`:

```ts
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id } = params;
  // ...
}
```

The other style uses `searchParams` - the user passes the param in the query string (`http://example.com/api/route?param1=id`) rather than the path. Extract `nextUrl` and read `searchParams` from the request; no dynamic `[]` folder needed.

## Deployment Options

**Static Export:** for static HTML content, add a `next.config.js` setting so `npm run build` outputs to an `out` folder. Upload those files to any web server or host (Netlify). Test locally with a package like `serve`.

**Full Next.js App:** for more functionality.

- Uses a Node.js server to run the code.
- Hosted platform: Vercel, Netlify, AWS Amplify.

Next is developed by Vercel, which offers the simplest deploy - sign up, link your GitHub repo, and it does automatic deployments on every push. It also supports branch deployments to a separate environment for testing.

## Headless CMS (Strapi)

A headless CMS provides a backend: an API to fetch data and an admin UI to manage it. "Headless" means the backend (content management) is separated from the frontend (display), leaving the presentation layer entirely to the developer.

We use **Strapi**, an open-source headless CMS.

```bash
npx create-strapi-app@latest test-strapi
```

Running it shows the admin page immediately. Kill it, open in VS Code, and `npm start` to run.

::: warning
`npm start` wouldn't let me add collection types. Run `npm run develop` instead - you need develop mode to add new collection types.
:::

Key UI concepts:

- **Collection Types** - objects/entities reflecting your content (User, Review, etc.).
- **Content Manager** - add content to your collection types.
- **REST API** - call it to get your content, e.g. `http://localhost:1337/api/reviews`. Create tokens in the admin panel; the API needs a Bearer auth token (set it as an `api_key` var, don't hard-code).

Strapi stores its data in a single `db.sqlite3` file (SQLite v3) - it holds the tables, columns, rows, indexes and relationships.

### Strapi API Parameters

Strapi uses the `qs` library to parse nested objects for complex queries:

```bash
npm install qs
```

- Pass a `fields` array to limit which fields are returned (faster requests). Use an `.mjs` extension to allow `import` statements.
- Use `populate` to return related data (e.g. image data) that isn't returned by default, and to drill into nested objects (e.g. just the `url` from an image).
- The response includes a `meta` object with pagination properties. Default max page size is 25; limit pages with the pagination params.
- Sort with the `sort` property, specifying column and `asc`/`desc`.

## Pagination

Start basic - a link that adds a query string, read from `searchParams` in the page props:

```jsx
<div className="flex gap-3 justify-center mt-5">
  <Link href="">&lt;</Link>
  <span>Page 1</span>
  <Link href="/reviews?page=2">&gt;</Link>
</div>
```

Pass the page value to your fetch function to iterate through the CMS pages:

```ts
export async function getDataDestruct(
  pageSize?: number,
  pageNumber?: number
): Promise<DestructData[]> {
  const { data } = await fetchReviews({
    fields: ["slug", "title", "subtitle", "publishedAt"],
    populate: { image: { fields: ["url"] } },
    pagination: { pageSize: pageSize, page: pageNumber },
    sort: ["publishedAt:desc"],
  });
  console.log(data);
}
```

Stop users navigating past the last page by reading `pageCount` from the meta and using a ternary:

```jsx
<Link href={`/reviews?page=${page == pageCount ? 1 : page + 1}`}>
```

## Working with the Response Data

When you `map` over the Strapi response you loop over the `data` array, but the fields live inside an `attributes` object you can't reach with plain dot notation (it logs `undefined`). Use a `for...of` loop to access `attributes`, and encapsulate that in dedicated helper functions in your `lib` folder rather than writing loops inside components.

## Search & Client-side Fetching

### Detecting the client

The `useEffect` hook in a `useIsClient` custom hook detects whether the component is rendering on the client after the initial SSR/SSG. Since `useEffect` doesn't run during SSR/SSG, a state change from `false` to `true` only happens in the browser - so `isClient` becomes a flag that's `true` only once mounted client-side. Useful for browser-only APIs (`window`, `document`).

### Async IIFE in useEffect

You can keep an async function in your `lib` folder and call it from `useEffect` with an Immediately Invoked Function Expression (async IIFE) - a common workaround since you can't make the `useEffect` callback itself `async`.

::: warning
Importing `node:fs/promises` (or other server-only modules) into client code throws `UnhandledSchemeError: Reading from "node:fs/promises" is not handled by plugins`. This happens even if the importing functions aren't actually run client-side. Fix: remove the offending import.
:::

### Search Route Handler

Fetching directly in the browser exposes the CMS API in the Network tab, which could be abused. To hide it, create a route handler that runs on the Next server, obfuscating the API from the user.

Create `api/search/route.ts`, grab the query string from the URL and pass it to your function. To enforce server-only access, use the `server-only` package:

```bash
npm install server-only
```

Import it at the top of your `lib` functions - importing those into a client component then throws an error, so replace the direct calls with a call to your route handler. Now the Network tab only shows the request to your handler, not the underlying API.

### Cancelling requests (AbortController)

A search box fires a request on every keystroke; you usually only care about the last one. Use `AbortController` and a cleanup function in your effect to cancel earlier requests. It makes no difference locally, but a deployed app has latency. Simulate it with dev-tools throttling to see requests get cancelled.

### Debouncing requests

Better still, don't fire requests while the user is still typing. Debouncing waits a bit before processing each event:

```bash
npm install use-debounce
```

`useDebounce` takes a value to debounce and a delay in milliseconds. Replace your `query` value with `debouncedQuery` - now a request only fires once the user pauses. There's no exact science to the delay; estimate what's reasonable for a typing user.

## Environment Variables

Store env vars and access them in code. With Node they're available via `process.env`. Two ways to add them:

- Export via the terminal: `export CMS_URL='url'`
- Add a `.env.local` file to the project root.

::: warning
Env vars are only available server-side by default (you usually don't want to expose them on the frontend). To make one available client-side, prefix it with `NEXT_PUBLIC_`.
:::

## Prisma ORM

An Object Relational Mapper abstracts away SQL, making database work align with the JS convention of objects.

```bash
npm install prisma --save-dev
npx prisma init --datasource-provider sqlite   # for an SQLite DB
```

This creates a `prisma` folder with `schema.prisma` and a `.env` file with `DATABASE_URL`.

::: warning
Prisma reads from `.env` while Next only reads from `.env.local` - there's some faff reconciling the two.
:::

### Defining a model

A model is essentially a table. Define it in `schema.prisma`, then `npx prisma db push` to create the table (`db push` is intended for development/testing). Prisma also generates all the TypeScript types for your models - cmd+click into `@prisma/client` to find the type file.

::: tip
Use the `sqlite3` CLI to inspect the DB directly - point it at the DB file and run SQL or utility commands like `.schema` (which shows the SQL Prisma generated). The SQLiteViewer extension gives a visual view of the DB file.
:::

Exclude Prisma data from git (keep code in version control, not data):

```
/prisma/*.db
```

### Querying

Run test queries with the Prisma client using `tsx` (a ts-node variant). You can extend the client to log the SQL being run. Prisma's `find` methods represent `SELECT` statements and accept `where` clauses. When passing a param that matches the field name, use shorthand:

```ts
where: { slug }   // not where: { message: "test message" }
```

Create a `db.ts` file with the boilerplate for setting up the Prisma client, then import it into components (e.g. `CommentsList.tsx`), fetch the data passing the slug as a param, and render it.
