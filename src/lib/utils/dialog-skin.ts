import { css } from '@linaria/core';

/**
 * Shared dialog-family motion (utils/dialog-skin.ts): the scrim fades
 * and the modal scale-and-fade every dialog-family overlay animated
 * with its own verbatim @keyframes quartet/octet — Dialog, Drawer,
 * ConfirmDialog and BottomSheet each shipped the same opacity 0↔1
 * backdrop pair (and Dialog/ConfirmDialog additionally the same
 * scale(0.97) panel pair) under per-component keyframe names.
 *
 * What stays local: Drawer's panel slide (the placement-driven
 * translate vars) and BottomSheet's sheet slide keep their families'
 * keyframes in place; the modal's static chrome (padding, radius,
 * focus ring, forced-colors arms) never lived here.
 *
 * Selector shapes follow the owning element: the `dialogBackdrop`
 * pair arms the native `<dialog>` family (the `[open]` attribute guard
 * keeps a fully closed panel from animating once `close()` lands, and
 * the scrim is the native `::backdrop`), while `presenceOverlayFade`
 * arms BottomSheet's Presence-driven div (no open attribute —
 * Presence unmounts the overlay after the exit animation instead).
 *
 * Linaria CSS — every consumer family must be registered under
 * 'utils/dialog-skin' in scripts/split-css.mjs `sharedLayers`.
 */

/**
 * Panel motion for the centered modal pair (Dialog, ConfirmDialog):
 * fade + scale(0.97) in over duration-normal, out over duration-fast,
 * driven by the native-dialog shell's `data-state` on the panel
 * itself.
 */
export const dialogPanelMotion = css`
  &[open][data-state='open'] {
    animation: haze-dialog-panel-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed'] {
    animation: haze-dialog-panel-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  @keyframes haze-dialog-panel-in {
    from {
      opacity: 0;
      transform: scale(0.97);
    }
  }

  @keyframes haze-dialog-panel-out {
    to {
      opacity: 0;
      transform: scale(0.97);
    }
  }
`;

/**
 * Scrim for the native `<dialog>` family (Dialog, Drawer,
 * ConfirmDialog): the `::backdrop` fill plus its fade pair — in over
 * duration-normal, out over duration-fast, `[open]`-guarded so a
 * closed panel never re-runs the exit.
 */
export const dialogBackdrop = css`
  &::backdrop {
    background: var(--haze-color-scrim);
  }

  &[open][data-state='open']::backdrop {
    animation: haze-dialog-backdrop-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[open][data-state='closed']::backdrop {
    animation: haze-dialog-backdrop-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  @keyframes haze-dialog-backdrop-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-dialog-backdrop-out {
    to {
      opacity: 0;
    }
  }
`;

/**
 * Overlay fade for the Presence-driven family (BottomSheet): the
 * scrim div itself fades — in over duration-normal, out over
 * duration-fast, driven by the `data-state` Presence injects.
 */
export const presenceOverlayFade = css`
  &[data-state='open'] {
    animation: haze-overlay-fade-in var(--haze-duration-normal)
      var(--haze-ease);
  }

  &[data-state='closed'] {
    animation: haze-overlay-fade-out var(--haze-duration-fast)
      var(--haze-ease);
  }

  @keyframes haze-overlay-fade-in {
    from {
      opacity: 0;
    }
  }

  @keyframes haze-overlay-fade-out {
    to {
      opacity: 0;
    }
  }
`;
