# Haze UI — Next.js App Router example

A minimal, hand-written Next.js 15 project (no `create-next-app`) exercising
`Button`, `ButtonLink`, `Switch`, `Datepicker`, and `Toast` from haze-ui, in
two CSS-consumption modes (full bundle and per-component subpaths), plus an
`/actions-demo` route running real `'use server'` actions against haze-ui
forms (the react-f0rm `<Form action>` channel with server-error hydration,
and the plain `useActionState` channel over native FormData bridges).

## Run it

```bash
# 1. build the library first — the example consumes dist/, not src/
cd <repo root>
pnpm install
pnpm build

# 2. install and run the example (it is an independent install root)
cd examples/nextjs
pnpm install
pnpm dev                  # webpack dev server      → http://localhost:3000
pnpm dev --turbopack      # Turbopack dev server    → http://localhost:3000

pnpm build                # webpack production build
pnpm build --turbopack    # Turbopack production build (Next 15.5 flag)
pnpm start                # serve either production build
```

## Turbopack status: works (verified), with one required config entry

Both `next dev --turbopack` and `next build --turbopack` (Next 15.5) compile
and serve this example. Verified on this checkout with: `curl` returning 200
for `/` and `/per-component-css`, SSR HTML containing haze-ui's linaria
classes (`haze-styles__base`, `haze-colors__lightTheme`), the route CSS chunk
containing every imported family (`SwitchCore`/`Toast`/`Calendar`/
`DatepickerCore`), and a headless-browser pass toggling the `Switch` and
firing a `Toast` after hydration.

The one thing Turbopack needs that webpack does not: `turbopack.root` (and
the matching `outputFileTracingRoot`) pinned to the haze-ui repository root
in `next.config.ts`. Without it, every `import ... from 'haze-ui'` fails with
`Module not found`: this example is its own install root (own lockfile), so
Turbopack picks `examples/nextjs` as its root and refuses to resolve files
outside it — but `haze-ui` is a `link:../..` symlink whose `dist/` lives in
the repository root. Webpack follows the symlink without complaint.

## How it is wired

- `app/layout.tsx` imports `haze-ui/styles.css` once (global CSS lives in the
  root layout) and applies the same `lightTheme` / `spacing` / `typography`
  class combination the docs app uses to `<body>`.
- `app/page.tsx` is a `'use client'` component — the consumer owns the
  client boundary here. (Every haze-ui dist module also ships its own
  `'use client'` directive, so importing haze-ui from a server component
  resolves cleanly too; the directive is inert outside RSC bundlers.)
- `next.config.ts` needs no `transpilePackages`: the `link:../..` dependency
  is a live symlink to the repository root, exposing haze-ui's prebuilt
  ESM + CSS through its package exports map.
- `app/per-component-css/page.tsx` renders the same component set as the
  home page but documents the per-component CSS imports it needs (see
  below).

## Per-component CSS

haze-ui ships its CSS in two shapes:

- **Full bundle** — `import 'haze-ui/styles.css'` (one file, every
  component). Simplest and the right default for apps that use haze-ui
  broadly; the aggregate is 346 KB raw / 37 KB gzipped across ~135
  families.
- **Per-component subpaths** — `import 'haze-ui/css/button.css'` etc., with
  `haze-ui/css/tokens.css` always required (it defines the
  `lightTheme`/`spacing`/`typography` classes plus every `--haze-*` custom
  property the component classes reference). Use this when a route only
  needs a handful of components and you want its CSS proportional to what
  it renders — the seven files the demo route imports total 80 KB raw /
  7.4 KB gzipped.

To assemble the file list for a route, read `haze-ui/css-manifest.json`:
`families` maps each export to its CSS family, and `dependencies` lists the
flattened closure of additional families (e.g. `Datepicker` needs
`calendar`; `Button` needs `spinner`). The per-component page in this
example imports:

```
haze-ui/css/tokens.css      lightTheme/spacing/typography + all --haze-* values
haze-ui/css/button.css      Button, ButtonLink
haze-ui/css/spinner.css     (Button's loading state)
haze-ui/css/switch.css      Switch
haze-ui/css/datepicker.css  Datepicker
haze-ui/css/calendar.css    (Datepicker's panel)
haze-ui/css/toast.css       ToastContainer + useToast
```

Notes:

- In this example both modes coexist because the root layout's full bundle
  applies to every route — the per-component page's own chunk is additive.
  The duplicated rules are identical and live in the same `@layer haze`, so
  there is no visual conflict; a real app picks one mode per deployment.
- The Vite plugin (`vite-plugin-haze-ui`) that auto-injects per-component
  CSS is Vite-specific — it hooks Vite's module transforms to rewrite
  `haze-ui` imports. Next.js (webpack or Turbopack) has no equivalent hook
  point, so in Next you import the subpaths by hand as shown above.

## Known limitations

- **Datepicker panel fails to open in any real-browser SSR context**
  (verified identical under webpack dev, Turbopack dev, and both production
  builds — bundler-independent). In dev React 19 also logs a hydration
  attribute mismatch for it. Root cause: haze-ui's floating-panel tier
  detection runs during render, returns "no native popover" on the server,
  and React 19 does not patch attribute mismatches after hydration — so the
  panel element never receives its `popover` attribute and
  `showPopover()` throws `Not supported on elements that are not popovers`.
  Server-only rendering, `Switch`, and `Toast` (the non-floating
  components) work fine. Tracked upstream in the haze-ui repository.
- `haze-ui` is linked with `link:../..` — a live symlink. Re-running
  `pnpm build` in the repo root immediately changes what the example
  serves; no reinstall is needed (`dist/` must exist: run the root build
  once after cloning).
- The comment-only `pnpm-workspace.yaml` in this directory makes it an
  isolated install root. Without it, `pnpm install` here walks up to the
  repository root and silently installs the parent project instead
  (verified with pnpm 11).
- `@linaria/core` and `react-f0rm` are declared as direct dependencies:
  they are haze-ui peers, and the `haze-ui` barrel re-exports
  `FormItem`/`Form`/`useForm`, so bundlers must resolve them. The
  `/actions-demo` route also imports `useFormState` from `react-f0rm`
  directly — keep its version in step with the root repo (currently
  `^1.4.0`; 1.1.x predates `useFormState` and the `ActionErrorResult`
  action typing).
- Requires Node >= 18.18 (Next 15). `next-env.d.ts`, `.next/`, and the
  lockfile are generated on first install/dev run; `next-env.d.ts` and
  `.next/` are git-ignored, the lockfile is not — commit it if you want
  reproducible installs.
