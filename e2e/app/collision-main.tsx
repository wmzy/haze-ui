/**
 * Collision harness for the floating primitives, driven by
 * e2e/floating-collision.spec.ts across three engines: chromium takes the
 * anchored tier (CSS anchor positioning + cross-axis translate nudge),
 * firefox and webkit take whichever tier their engine supports
 * (JS-positioned popover, or the absolute fallback without the popover
 * API) — the spec's assertions are tier-agnostic by design.
 *
 * Fixtures sit at the viewport edges inside a stage taller than the
 * viewport, so scroll re-placement is exercisable. They are absolutely
 * (not fixed) positioned on purpose: fixed elements ignore document
 * scroll, and the scroll test needs the triggers themselves to move.
 */
import { css } from '@linaria/core';
import { createRoot } from 'react-dom/client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../src/lib/components/DropdownMenu';
import { Popover } from '../../src/lib/components/Popover';
import { Tooltip } from '../../src/lib/components/Tooltip';
import { lightTheme } from '../../src/lib/tokens/colors';
import { motion } from '../../src/lib/tokens/motion';
import { spacing } from '../../src/lib/tokens/spacing';
import { typography } from '../../src/lib/tokens/typography';

const stage = css`
  position: relative;
  /* Taller than the viewport: the scroll test needs real scroll range. */
  min-height: 160vh;
  margin: 0;
  background: #ffffff;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
`;

const corner = css`
  position: absolute;
`;

/*
 * Top-right corner: the bottom-span popover opens below the trigger and
 * past the right edge — the cross-axis shift (tier-1 translate nudge /
 * tier-2 computeFloatingPosition clamp) must pull it back inside.
 */
const cornerTopRight = css`
  top: 8px;
  right: 8px;
`;

/*
 * Bottom edge: no room below the trigger (the stage is the only content
 * below it), so the menu must flip above. Document-relative top keeps
 * the fixture at the viewport's bottom edge on load while still moving
 * with document scroll.
 */
const cornerBottom = css`
  top: calc(100vh - 56px);
  left: 8px;
`;

/*
 * Left edge, vertically centered: a position="left" tooltip bubble would
 * overflow the left edge; it must flip to the trigger's right side.
 */
const edgeLeft = css`
  top: 45vh;
  left: 8px;
`;

/*
 * Flush with the top-left corner: the panel's natural position breaks
 * the 16px collision padding on the left edge; the padded shift must
 * restore the margin on every side.
 */
const paddedCorner = css`
  top: 4px;
  left: 4px;
`;

/* Bare menu button gets a hit area. The Popover/Tooltip triggers stay
 * plain text spans: their `className` props style the panel/wrapper. */
const menuTrigger = css`
  padding: 6px 12px;
`;

function App() {
  return (
    <div
      className={`${stage} ${lightTheme} ${spacing} ${typography} ${motion}`}
    >
      <div id="padded-popover" className={`${corner} ${paddedCorner}`}>
        <Popover
          content="Padded popover body keeps a 16px margin from every viewport edge."
          collisionPadding={16}
        >
          Padded popover
        </Popover>
      </div>

      <div id="popover-tr-corner" className={`${corner} ${cornerTopRight}`}>
        <Popover content="Corner popover body would overflow the right viewport edge.">
          Corner popover
        </Popover>
      </div>

      <div id="menu-bottom" className={`${corner} ${cornerBottom}`}>
        <DropdownMenu>
          <DropdownMenuTrigger className={menuTrigger}>
            Bottom menu
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem>Alpha</DropdownMenuItem>
            <DropdownMenuItem>Bravo</DropdownMenuItem>
            <DropdownMenuItem>Charlie</DropdownMenuItem>
            <DropdownMenuItem>Delta</DropdownMenuItem>
            <DropdownMenuItem>Echo</DropdownMenuItem>
            <DropdownMenuItem>Foxtrot</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem disabled>Golf</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div id="tooltip-left-edge" className={`${corner} ${edgeLeft}`}>
        <Tooltip content="Left tip" position="left">
          Left-edge tooltip
        </Tooltip>
      </div>
    </div>
  );
}

createRoot(document.getElementById('root')!).render(<App />);
