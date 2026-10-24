import type { IconProps, MenuDataItem } from '@/lib';

import { css } from '@linaria/core';
import { PackageOpen, Rocket, Trash2 } from 'lucide-react';
import { MdRocketLaunch } from 'react-icons/md';
import { FiSearch } from 'react-icons/fi';

import { Button, Empty, Icon, Menu, Result } from '@/lib';

/*
 * The live source behind the Recipes "Icon ecosystems" section — the docs
 * show this very file via ?raw, so demo and code never drift. haze-ui
 * ships no icon set on purpose: `Icon` is a thin sizing/coloring wrapper
 * and every icon slot also accepts a raw svg component. The icon libraries
 * are dependencies of your app, never of haze-ui (swap '@/lib' for
 * 'haze-ui' in your own code).
 */

// ─── Approach 2 — a type-safe icon set ─────────────────────────────────
// `IconProps['icon']` is exactly the slot type every haze-ui icon prop
// accepts; `satisfies` pins every entry to it, so a wrong import fails at
// compile time. Named imports are tree-shakeable — only the icons listed
// here reach the bundle.

// eslint-disable-next-line react-refresh/only-export-components -- the set is the recipe: this whole file is shown via ?raw, and the export lets the test assert the glyph mapping directly (TagGroup / Schedule 同款 suppression)
export const APP_ICONS = {
  deploy: Rocket,
  discard: Trash2,
  empty: PackageOpen,
} satisfies Record<string, NonNullable<IconProps['icon']>>;

export type AppIconName = keyof typeof APP_ICONS;

/**
 * The single place that knows about haze-ui sizing. Call sites stay
 * declarative and typo-proof: `name` autocompletes, a typo is a compile
 * error, and swapping an icon library later touches exactly one file.
 */
export function AppIcon({
  name,
  size = 'md',
}: {
  name: AppIconName;
  size?: IconProps['size'];
}) {
  const Glyph = APP_ICONS[name];
  return <Icon icon={Glyph} size={size} />;
}

// ─── The demo ──────────────────────────────────────────────────────────
// Everything below renders with real lucide / react-icons components:
// Button composes icons as children (the skin supplies the gap), Menu's
// data API takes an `icon` per item, Result and Empty expose `icon` /
// `image` slots that replace their default illustrations.

const demoColumn = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-4);
  width: 100%;
`;

const demoRow = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-3);
  flex-wrap: wrap;
`;

const demoMenuItems = [
  {
    type: 'item',
    label: 'Deploy revision',
    icon: <AppIcon name='deploy' size='sm' />,
    kbdLabel: '⇧D',
  },
  {
    type: 'item',
    label: 'Search docs',
    // react-icons stroke sets (fi, lu, tb…) slot in through children —
    // same stroke contract lucide has, so Icon keeps its fill:none mode.
    icon: (
      <Icon size='sm'>
        <FiSearch />
      </Icon>
    ),
    kbdLabel: '/',
  },
  { type: 'divider' },
  {
    type: 'item',
    label: 'Discard draft',
    icon: <AppIcon name='discard' size='sm' />,
    danger: true,
  },
] satisfies MenuDataItem[];

/** Lucide-only column: AppIcon everywhere, one sizing vocabulary. */
function SetDemo() {
  return (
    <div className={demoRow}>
      <Button variant='outline'>
        <AppIcon name='deploy' /> Deploy
      </Button>
      <Button variant='ghost' square aria-label='Discard draft'>
        <AppIcon name='discard' />
      </Button>
      <Menu
        trigger={
          <Button variant='outline'>
            <AppIcon name='deploy' /> Actions
          </Button>
        }
        items={demoMenuItems}
      />
    </div>
  );
}

/**
 * react-icons fill sets (md, fa, hi-solid…) must NOT go through `Icon`:
 * Icon's stroke mode forces `fill: none` on the svg, which blanks
 * fill-based glyphs (verified in Chromium — the svg computes
 * fill:none/stroke-width:0 and paints nothing). Fill icons render bare
 * instead: they size themselves at 1em and inherit currentColor, which is
 * exactly what Button's children layout wants.
 */
function FillSetDemo() {
  return (
    <div className={demoRow}>
      <Button variant='outline'>
        <MdRocketLaunch /> Material, bare
      </Button>
      <Button variant='outline'>
        <Icon size='sm'>
          <FiSearch />
        </Icon>
        Feather via children
      </Button>
    </div>
  );
}

/** Result replaces its status illustration through the `icon` slot. */
function ResultDemo() {
  return (
    <Result
      icon={<AppIcon name='deploy' size='lg' />}
      title='Deployment live'
      subTitle='v2.4.0 — built 42 seconds ago'
      extra={
        <Button size='sm' variant='outline'>
          Open app
        </Button>
      }
    />
  );
}

/** Empty calls the same slot `image` and composes an action under it. */
function EmptyDemo() {
  return (
    <Empty
      image={<AppIcon name='empty' size='lg' />}
      description='No deployments yet'
    >
      <Button size='sm' variant='outline'>
        Create one
      </Button>
    </Empty>
  );
}

/** Live demo for the Recipes page: every pattern above, side by side. */
export function IconEcosystemDemo() {
  return (
    <div className={demoColumn}>
      <SetDemo />
      <FillSetDemo />
      <ResultDemo />
      <EmptyDemo />
    </div>
  );
}
