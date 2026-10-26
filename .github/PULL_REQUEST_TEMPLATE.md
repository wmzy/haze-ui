## Summary

<!-- What changed? One or two sentences per meaningful change; link the
     docs-site page when a demo changed. -->

## Motivation

<!-- Why is this change needed? Link the issue it closes (`Closes #123`)
     when there is one. -->

## Checklist

<!-- Not every box applies to every PR — check what applies and note below
     why the rest do not. -->

- [ ] New or modified components ship with unit tests, **including an axe
      accessibility case** (co-located `ComponentName.test.tsx`)
- [ ] Docs-site content changes are mirrored in all five language packs —
      `src/views/i18n/{en,zh,ja,de,fr}.ts`
- [ ] CSS-affecting changes have the size-limit ratchets recalibrated
      (`pnpm size`, measured numbers noted in this PR)
- [ ] New components are registered in all six places — barrel
      (`src/lib/index.ts`), `scripts/generate-llms.mjs`,
      `scripts/generate-registry.mjs`, `component-groups.ts`, the demos
      map, and the i18n one-line blurbs
- [ ] No new runtime dependencies (if one is genuinely required, justify it
      below — README dependency policy and `vite.config.mts` externals
      included)
- [ ] Visual changes include screenshots (or a link to the running docs
      site), and affected visual baselines were re-recorded
