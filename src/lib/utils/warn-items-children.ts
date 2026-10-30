/*
 * Dev-time guard for the data-driven `items` API vs the compound
 * `children` API. Components offering both shapes (Tabs, TaskList)
 * resolve the conflict by rendering `items` and ignoring `children` —
 * a soft landing for partially-migrated call sites — and name the
 * breach through this helper so the message text lives once and the
 * `[haze-ui]` prefix stays greppable. Unlike warnDeprecated there is
 * no dedup: the conflict is a call-site bug, and one console line per
 * offending render keeps the pointer on the offending mount.
 *
 * Pure TS, no Linaria classes: no scripts/split-css.mjs `sharedLayers`
 * entry, and consumers are client components, so no scripts/rsc-safe.mjs
 * entry either.
 */

/**
 * console.error that `items` and compound `children` are mutually
 * exclusive; `component` names the public surface, e.g. `'Tabs'`.
 */
export function warnItemsChildrenConflict(component: string): void {
  console.error(
    `[haze-ui] ${component}: \`items\` and compound \`children\` are mutually exclusive — rendering \`items\` and ignoring \`children\`.`
  );
}
