---
outline: deep
---

# Playwright

Playwright is a browser automation and end-to-end testing framework from Microsoft. It drives real browsers (Chromium, Firefox, WebKit) through a single API, runs your test specs against them, and captures traces, screenshots, and video when things fail. It's the tool most modern web projects reach for when they want to test a feature the way a user actually experiences it - clicking, typing, waiting for network responses - rather than mocking the DOM.

## The Basics

Playwright comes in two pieces that people constantly conflate, and understanding the split is the key to everything else on this page:

1. **The npm package** (`@playwright/test`) - the test runner and the JS/TS API. Installed by `npm install` like any dependency.
2. **The browser binaries** - the actual Chromium/Firefox/WebKit builds Playwright downloads and launches. These are **not** on npm; Playwright fetches them separately from its own CDN into a shared cache on your machine.

Installing the package does **not** install the browsers. That's a deliberate second step:

```bash
npm install -D @playwright/test   # the runner + API
npx playwright install            # the browser binaries (chromium, firefox, webkit)
```

You can install just one browser:

```bash
npx playwright install chromium
```

Check what version of the runner you have:

```bash
npx playwright --version   # e.g. Version 1.58.2
```

::: tip The runner version pins the browser version
Each Playwright release is welded to specific browser builds (a revision number, e.g. `chromium-1208`). Upgrading the `@playwright/test` package means you need to re-run `npx playwright install` to fetch the matching browser build. A mismatch produces the dreaded `Executable doesn't exist at ...` error - the runner is looking for a revision the cache doesn't have.
:::

### Running Tests

```bash
npx playwright test                       # run everything
npx playwright test --project=chromium    # one project only
npx playwright test -g "create estimate"  # filter by test title
npx playwright test --headed              # watch it in a visible browser
npx playwright test --ui                  # interactive UI mode (great for debugging)
npx playwright test --debug               # step through with the inspector
```

### The Config

A `playwright.config.ts` at the project root defines projects (browser + settings combinations), timeouts, reporters, and shared `use` options. The important field for this page is which browser a project launches:

```ts
projects: [
  {
    name: 'chromium',
    use: { ...devices['Desktop Chrome'] },
  },
],
```

`devices['Desktop Chrome']` sets viewport, user agent, and Chromium as the browser - but note it does **not** pin a `channel`, which matters a lot in the deep dive below.

### Where the Browsers Live

Playwright caches browser binaries **outside** your project, in a shared per-user location, so multiple projects reuse the same download:

| OS      | Cache path                                  |
| ------- | ------------------------------------------- |
| macOS   | `~/Library/Caches/ms-playwright`            |
| Linux   | `~/.cache/ms-playwright`                     |
| Windows | `%USERPROFILE%\AppData\Local\ms-playwright` |

Knowing this path is essential for debugging install problems - it's where you go to see what actually got downloaded, spot partial downloads, and clear stale locks.

::: tip Inspect the cache
```bash
ls -la ~/Library/Caches/ms-playwright
```
Each browser is a directory named `<browser>-<revision>` (e.g. `chromium-1208`). A **complete** install has an `INSTALLATION_COMPLETE` marker file inside; if that marker is missing, the download never finished.
:::

## Tips & Tricks

- **`npx playwright install --with-deps`** on Linux/CI also installs the OS-level libraries (fonts, shared libs) the browsers need. On a bare Docker image this is usually what you want.
- **`PLAYWRIGHT_BROWSERS_PATH`** lets you relocate the browser cache (e.g. `PLAYWRIGHT_BROWSERS_PATH=0` installs browsers into `node_modules` instead of the shared cache - handy for hermetic CI).
- **`npx playwright show-trace trace.zip`** opens a recorded trace - a full timeline with DOM snapshots, network, and console. This is the single most useful debugging artifact when a CI test fails and you can't reproduce it locally.
- **`npx playwright codegen <url>`** records your clicks and generates selector code. Great for bootstrapping a new spec.
- **Traces/screenshots/video** are configured in `use` (`trace: 'on-first-retry'`, etc.) - lean on them instead of `console.log` debugging.
- Commit your `playwright.config.ts` but **never** the browser cache - the binaries are large and machine-specific.

# Issues & Debugging

## Deep Dive: `npx playwright install` hangs forever (headless-shell)

This is a real problem hit on a work machine and worth documenting in full, because the symptom ("the install errors") is misleading - it doesn't error, it **hangs silently**, and the root cause is buried two layers down.

### The symptom

Running `npx playwright install` (or `npx playwright install chromium`) appears to start normally:

```
Downloading Chrome Headless Shell 145.0.7632.6 (playwright chromium-headless-shell v1208)
|■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■■| 100% of 91.1 MiB
```

The download bar reaches **100%** - and then nothing. No error, no completion, no shell prompt returning. The process just sits there forever. Kill it and retry and you get the exact same thing. Meanwhile any *other* `playwright install` you start also hangs immediately, before printing anything.

### What Playwright is actually trying to do

When you run `playwright install`, the CLI does more than a simple download. For each required browser it:

1. **Acquires a lock.** Playwright serialises installs using a lock directory (`__dirlock`) inside the browser cache, so two concurrent `install` commands can't corrupt the same files. The second process **blocks** on this lock until the first releases it. This is why a stuck install makes every *subsequent* install hang immediately with no output - they're all queued behind a lock that's never released.
2. **Spawns an out-of-process downloader.** The actual fetch runs in a separate Node process, `oopDownloadBrowserMain.js` (oop = "out of process"). Playwright does this so the download can't take down the main CLI process, and so it can show that progress bar. This process:
   - Downloads the `.zip` from `cdn.playwright.dev` (the part that reaches 100%),
   - **Extracts/unzips** it into the cache directory,
   - Writes an `INSTALLATION_COMPLETE` marker when everything is on disk and validated.
3. **Releases the lock** and exits.

### Where it hangs

The hang is **not** in the download - the bytes arrive fine (100%). It's in the **extract/finalize step inside `oopDownloadBrowserMain.js`**. The downloader process stays alive but goes completely idle (0% CPU), never unzips the binary, and never writes `INSTALLATION_COMPLETE`. Because it never finishes, it never releases the `__dirlock`, so:

- The cache is left with a **partial browser directory** - e.g. a `chromium_headless_shell-1208/` folder containing only `ABOUT` and `LICENSE` files (~1.5 MB) instead of the full ~170 MB unpacked binary, and **no** `INSTALLATION_COMPLETE` marker.
- The stale `__dirlock` directory remains, poisoning every future install attempt.

You can see all of this directly:

```bash
# 1. Are there stuck processes? (the smoking gun)
ps aux | grep -E "playwright install|oopDownloadBrowserMain" | grep -v grep

# 2. Is the lock stuck present?
ls -la ~/Library/Caches/ms-playwright/__dirlock

# 3. Is the browser dir partial? (no INSTALLATION_COMPLETE = never finished)
ls -la ~/Library/Caches/ms-playwright/chromium_headless_shell-*/
```

### Why "headless shell" specifically?

Modern Playwright ships two Chromium artifacts:

| Artifact                   | What it is                                          | When it's used                                    |
| -------------------------- | --------------------------------------------------- | ------------------------------------------------- |
| **`chromium`**             | The full Chromium browser (~170 MB)                 | Headed runs, `channel: 'chromium'`, most flows    |
| **`chromium-headless-shell`** | A stripped-down headless-only binary (smaller/faster) | The **default** for `chromium.launch()` (headless) |

Since Playwright ~1.49, `chromium.launch()` **defaults to the headless shell** as a speed optimisation. So even though the full `chromium-1208` build was already downloaded and complete on this machine, launching a test failed with:

```
browserType.launch: Executable doesn't exist at
  .../chromium_headless_shell-1208/chrome-headless-shell-mac-arm64/chrome-headless-shell
```

The runner defaults to a binary that never finished installing.

### Why does the extract hang in the first place?

The download completing but the **extract** stalling points to something environmental intercepting file writes to the cache, not a Playwright bug (the full Chromium extracted fine at an earlier point; only this artifact stalls, and it stalls *identically* on every retry). The usual suspects, in rough order of likelihood on a managed/corporate machine:

- **Antivirus / endpoint security (e.g. CrowdStrike, SentinelOne, Defender)** scanning newly-written executables as they're unzipped, holding a file handle long enough to deadlock the writer. This is the most common cause on work laptops.
- **VPN / corporate proxy** doing deep inspection or throttling the CDN connection during the finalize handshake.
- **Disk / permissions quirk** on the cache directory (iCloud sync, a full disk, or a restrictive umask).

### The immediate fix (unblock now)

The full Chromium build works and is already installed. Tell Playwright to launch it instead of defaulting to the headless shell, via `channel`:

```ts
// playwright.config.ts
use: {
  ...devices['Desktop Chrome'],
  channel: 'chromium',   // use the full Chromium build, skip the broken headless-shell
},
```

To keep this **local-only** (so CI and teammates - who install fine - are untouched), gate it behind an env var and set that var in a git-ignored `.env.local`:

```ts
// playwright.config.ts - no-op unless the env var is set
use: {
  ...devices['Desktop Chrome'],
  ...(process.env.PLAYWRIGHT_BROWSER_CHANNEL
    ? { channel: process.env.PLAYWRIGHT_BROWSER_CHANNEL }
    : {}),
},
```

```bash
# .env.local (gitignored)
PLAYWRIGHT_BROWSER_CHANNEL=chromium
```

Verify it launches without touching the broken download:

```bash
npx tsx -e "
import { chromium } from '@playwright/test';
(async () => {
  const b = await chromium.launch({ channel: 'chromium' });
  const p = await b.newPage();
  await p.setContent('<h1>ok</h1>');
  console.log('launched:', await p.textContent('h1'));
  await b.close();
})();
"
```

### Recovering a poisoned cache

If installs are hanging because of a stuck attempt, clean up before retrying - otherwise the stale lock guarantees the next attempt hangs too:

```bash
# 1. Kill every stuck install + downloader process
pkill -f "playwright install"
pkill -f "oopDownloadBrowserMain"

# 2. Remove the stale lock
rm -rf ~/Library/Caches/ms-playwright/__dirlock

# 3. Remove the partial (incomplete) browser dir - the one WITHOUT INSTALLATION_COMPLETE
rm -rf ~/Library/Caches/ms-playwright/chromium_headless_shell-1208

# 4. Retry a single, clean install (don't run several at once - they'll queue on the lock)
npx playwright install chromium chromium-headless-shell
```

::: warning Only run one install at a time
Running multiple `playwright install` commands concurrently is what turns a slow install into a deadlock - they contend on the `__dirlock` and, if one stalls, the rest hang behind it silently. If you're debugging, kill everything first, then run exactly one.
:::

### Attempting the real (environmental) fix

If you need the headless-shell to install properly (e.g. you don't want to override the channel forever), work through these:

```bash
# Turn on verbose logging to see exactly where it stalls
DEBUG=pw:install npx playwright install chromium-headless-shell

# Try installing into node_modules instead of the shared cache
PLAYWRIGHT_BROWSERS_PATH=0 npx playwright install chromium-headless-shell

# Force a specific download host / mirror if a proxy is mangling the CDN
PLAYWRIGHT_DOWNLOAD_HOST=https://playwright.azureedge.net npx playwright install
```

- **Temporarily disable/allowlist antivirus** for `~/Library/Caches/ms-playwright` and retry. If it suddenly works, you've found your culprit - ask IT to permanently allowlist that path.
- **Disconnect the VPN** and retry, to rule out proxy interference.
- **Install off a different network** (personal hotspot) to isolate corporate-network causes.

### References

- Browsers & install internals: <https://playwright.dev/docs/browsers>
- The headless-shell change (`chromium` vs `chromium-headless-shell`): <https://playwright.dev/docs/release-notes> (see 1.49 "new headless mode")
- `channel` option: <https://playwright.dev/docs/api/class-testoptions#test-options-channel>
- CI / Docker install (`--with-deps`, `PLAYWRIGHT_BROWSERS_PATH`): <https://playwright.dev/docs/ci>
- Env var reference (`DEBUG=pw:install`, `PLAYWRIGHT_DOWNLOAD_HOST`): <https://playwright.dev/docs/browsers#managing-browser-binaries>

## Other common errors

**`Executable doesn't exist at ...`** - the runner wants a browser revision that isn't in the cache. Run `npx playwright install`. Usually caused by upgrading the package without re-installing browsers, or by the partial-install problem above.

**`browserType.launch: Timeout ... exceeded`** - the browser started but never became ready, often a sandbox issue in Docker. Add `--no-sandbox` via `launchOptions.args` or run the container with the right permissions.

**Tests pass locally, fail in CI** - almost always timing/environment, not your code. Pull the trace artifact (`trace: 'on-first-retry'`) and open it with `npx playwright show-trace` to see exactly what the browser saw.
