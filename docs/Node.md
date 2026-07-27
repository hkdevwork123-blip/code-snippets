---
outline: deep
---

# Node

Node is the runtime that lets JavaScript run outside the browser - servers, scripts, build tools, CLIs. Around it sits a whole ecosystem of package managers and alternative runtimes, and there are a lot of them. These are notes on what they are, when to reach for each, and how to run TypeScript without much ceremony.

## The Basics

Check what you've got installed:

```bash
node -v    # e.g. v22.6.0
npm -v     # npm ships with Node
```

Node bundles **npm** by default, so if Node is installed you already have a package manager. Everything else below is optional and swappable.

::: tip Manage Node versions with a version manager
Rather than reinstalling Node, use **nvm** (or `fnm`/`volta`) to switch versions per project. `nvm use 20` then `nvm use 22` and you're done. Handy when one project pins an older version.
:::

## Package Managers

They all read `package.json` and install into `node_modules`. The differences are speed, disk usage, and workflow.

| Manager  | Install      | Notes                                                              |
| -------- | ------------ | ------------------------------------------------------------------ |
| **npm**  | `npm install`| Ships with Node. The default, works everywhere.                    |
| **pnpm** | `pnpm install`| Content-addressed store - packages symlinked, not copied. Fast, saves disk, strict about phantom deps. |
| **yarn** | `yarn`       | The original npm alternative. Still around, workspaces are solid.  |
| **bun**  | `bun install`| Part of the Bun runtime (below). Extremely fast installs.          |

**pnpm** is my default for most projects now - it's fast and its strictness catches dependencies you're using without declaring. The lockfiles aren't interchangeable, so pick one per project and stick with it.

```bash
# rough equivalents across managers
npm install        pnpm install       bun install
npm run dev        pnpm dev           bun run dev
npm install react  pnpm add react     bun add react
```

## npx and Running One-Off Tools

`npx` runs a package's binary without installing it globally - it fetches, runs, and cleans up.

```bash
npx create-vite@latest my-app     # scaffold without a global install
npx prettier --write .            # run a tool once
```

pnpm has `pnpm dlx` and bun has `bunx` for the same idea.

## Runtimes Beyond Node

Node isn't the only game anymore. Two alternatives worth knowing:

- **Bun** - a runtime, package manager, bundler, and test runner in one binary. Runs TypeScript and JSX with no config, and it's fast. `bun run index.ts` just works.
- **Deno** - secure by default (explicit permission flags for file/network access), TypeScript support built in, uses web-standard APIs. `deno run main.ts`.

::: tip Which one?
Node is still the safe, universally supported default. Reach for Bun when startup and install speed matter, or Deno when you want built-in TypeScript and a locked-down permission model.
:::

## Running TypeScript

You don't need a heavy setup to run a `.ts` file. A few options, roughly in order of how I'd reach for them:

**`npx tsx`** - runs TypeScript directly, no config, and it's the easy replacement for the older `ts-node`:

```bash
npx tsx script.ts
```

**Node's built-in type stripping** - recent Node can run TypeScript on its own by stripping the types (it doesn't type-check, just ignores the annotations):

```bash
node --experimental-strip-types script.ts
```

::: tip Node is catching up
As of Node 22 the flag is `--experimental-strip-types`; in newer versions type stripping is on by default and the flag disappears. Either way, Node runs `.ts` without a separate tool now - but it strips types rather than type-checking, so keep `tsc --noEmit` in your workflow for actual checking.
:::

**Bun and Deno** run TypeScript natively with no flag at all - `bun run script.ts` or `deno run script.ts`.

## Tips & Tricks

- Commit your lockfile (`package-lock.json`, `pnpm-lock.yaml`, `bun.lockb`) so installs are reproducible.
- Use `npm ci` (or `pnpm install --frozen-lockfile`) in CI - it installs exactly what the lockfile says and fails on drift.
- `.nvmrc` with a version number lets `nvm use` pick the right Node automatically per project.
- Global installs age badly - prefer `npx`/`dlx` for one-offs and project-local dev dependencies for the rest.
