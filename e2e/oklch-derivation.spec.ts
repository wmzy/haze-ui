import { expect, test } from '@playwright/test';

/**
 * Runtime derivation acceptance for the OKLCH token system.
 *
 * Semantic interaction states (e.g. `--haze-color-primary-hover`) are CSS
 * relative-color formulas over their base token
 * (`oklch(from var(--haze-color-primary) calc(l - 0.045) c h)` in light
 * mode), so overriding a base color re-derives its states in the browser —
 * no JS shipped.
 *
 * Substitution subtlety this test pins down: Chromium substitutes `var()`
 * inside a custom property's value eagerly, on the element where that
 * custom property is *declared*. A themed element therefore bakes its
 * derived tokens from its own cascaded base colors — which is exactly the
 * documented consumer contract: apply the theme classes (lightTheme …) and
 * the base-color override on the SAME element, and everything inside
 * re-derives. (An override on a bare descendant that does not re-apply the
 * theme classes cannot re-flow, because it inherits the theme root's
 * already-substituted derived values.)
 *
 * Method: clone the harness's theme classes onto a test div appended INSIDE
 * the themed subtree, override `--haze-color-primary` to `#ff0000` on it
 * via `style.setProperty`, and compare the computed background of
 * `var(--haze-color-primary-hover)` against a reference div using the
 * literal light-hover delta `oklch(from #ff0000 calc(l - 0.045) c h)`. The
 * same engine resolves both, so identical derivations must serialize to
 * identical strings. A sibling child of the original themed subtree keeps
 * the default blue-family hover and must differ.
 *
 * Computed styles are the primary assertion path; if a browser ever returned
 * unresolved strings, the fallback compares element screenshots byte-wise
 * (solid-color probes make equal colors byte-identical PNGs, canvas-free).
 */

const PRIMARY_OVERRIDE = '#ff0000';
// Mirrors the light-mode hover delta in src/lib/tokens/palette.ts.
const LIGHT_HOVER_REFERENCE = 'oklch(from #ff0000 calc(l - 0.045) c h)';

/** Computed colors are only usable when fully resolved (no var()/raw syntax). */
const isResolved = (color: string) =>
  color !== '' && !color.includes('var(') && !color.includes('oklch(from');

test('overriding --haze-color-primary re-derives *-hover via CSS relative color', async ({
  page,
}) => {
  await page.goto('/');

  // e2e/app/main.tsx mounts the app as `#root > div` carrying
  // `${shell} ${lightTheme} ${spacing} ${typography}`. lightTheme is a
  // build-hashed Linaria class, so locate the themed root structurally and
  // prove it actually resolves the token before asserting on it.
  const themedRoot = page.locator('#root > div');
  await expect(themedRoot).toHaveCount(1);

  const computed = await themedRoot.evaluate(
    (root, {override, reference}) => {
      if (!getComputedStyle(root).getPropertyValue('--haze-color-primary')) {
        throw new Error(
          'themed root does not define --haze-color-primary; lightTheme not applied'
        );
      }

      const make = (name: string, background: string) => {
        const el = document.createElement('div');
        el.setAttribute('data-oklch-probe', name);
        el.style.width = '40px';
        el.style.height = '40px';
        el.style.background = background;
        return el;
      };

      // Themed override host: the theme classes re-applied so the inline
      // --haze-color-primary participates in the same cascade that bakes
      // the derived tokens (see the substitution note above).
      const overrideHost = document.createElement('div');
      overrideHost.setAttribute('data-oklch-probe', 'host');
      overrideHost.className = root.className;
      overrideHost.style.setProperty('--haze-color-primary', override);
      const overridden = make('overridden', 'var(--haze-color-primary-hover)');
      const referenceEl = make('reference', reference);
      overrideHost.append(overridden, referenceEl);

      // Un-overridden control: plain child of the original themed subtree,
      // keeps the default blue-family hover.
      const defaultHover = make('default', 'var(--haze-color-primary-hover)');
      root.append(overrideHost, defaultHover);

      return {
        overridden: getComputedStyle(overridden).backgroundColor,
        reference: getComputedStyle(referenceEl).backgroundColor,
        defaultHover: getComputedStyle(defaultHover).backgroundColor,
      };
    },
    {override: PRIMARY_OVERRIDE, reference: LIGHT_HOVER_REFERENCE}
  );

  const notePath = (path: string) =>
    console.info(`[oklch-derivation] assertion path: ${path}`);

  try {
    if (
      isResolved(computed.overridden) &&
      isResolved(computed.reference) &&
      isResolved(computed.defaultHover)
    ) {
      notePath('computed-style');
      expect(computed.overridden).toBe(computed.reference);
      expect(computed.overridden).toBeTruthy();
      expect(computed.defaultHover).not.toBe(computed.overridden);
    } else {
      notePath('element-screenshot-bytes');
      const png = (name: string) =>
        page.locator(`[data-oklch-probe="${name}"]`).screenshot();
      const [overridden, reference, defaultHover] = await Promise.all([
        png('overridden'),
        png('reference'),
        png('default'),
      ]);
      expect(overridden.equals(reference)).toBe(true);
      expect(defaultHover.equals(overridden)).toBe(false);
    }
  } finally {
    // Always tear the probes out of the harness page.
    await page.evaluate(() => {
      document
        .querySelectorAll('[data-oklch-probe]')
        .forEach((el) => el.remove());
    });
  }
});
