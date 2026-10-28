import type { ComponentType, SVGProps } from 'react';

import { createElement } from 'react';

import { render } from '@testing-library/react';
import { expect } from 'vitest';

import * as icons from './index';

// The curation contract: exactly these 100 glyphs, alphabetical. Adding or
// dropping one is a deliberate API change — update this list with intent.
const CURATED_ICONS = [
  'ArrowDown',
  'ArrowLeft',
  'ArrowRight',
  'ArrowUp',
  'ArrowUpDown',
  'ArrowUpRight',
  'Asterisk',
  'AtSign',
  'Bell',
  'BellOff',
  'Bold',
  'BookOpen',
  'Bookmark',
  'Calendar',
  'ChartColumn',
  'ChartLine',
  'ChartPie',
  'Check',
  'CheckCheck',
  'ChevronDown',
  'ChevronLeft',
  'ChevronRight',
  'ChevronUp',
  'ChevronsUpDown',
  'Circle',
  'CircleQuestionMark',
  'Clipboard',
  'Clock',
  'Cloud',
  'CloudOff',
  'Code',
  'Command',
  'Copy',
  'Download',
  'Ellipsis',
  'EllipsisVertical',
  'ExternalLink',
  'Eye',
  'EyeOff',
  'File',
  'FileText',
  'Flag',
  'Folder',
  'FolderOpen',
  'Funnel',
  'Globe',
  'Hash',
  'Heart',
  'House',
  'Image',
  'Inbox',
  'Info',
  'Italic',
  'LayoutGrid',
  'LayoutList',
  'Link',
  'List',
  'Loader',
  'LoaderCircle',
  'Lock',
  'LockOpen',
  'LogOut',
  'Mail',
  'MapPin',
  'Menu',
  'MessageCircle',
  'MessageSquare',
  'Mic',
  'Minus',
  'Moon',
  'Pencil',
  'Phone',
  'Play',
  'Plus',
  'QrCode',
  'RefreshCw',
  'RotateCw',
  'Save',
  'Search',
  'Send',
  'Settings',
  'Shield',
  'ShieldCheck',
  'ShoppingCart',
  'Sparkles',
  'SquareCheck',
  'Star',
  'Sun',
  'Tag',
  'Trash',
  'Underline',
  'Upload',
  'User',
  'UserPlus',
  'Users',
  'Volume2',
  'VolumeX',
  'X',
  'Zap',
  'ZoomIn',
  'ZoomOut',
];

describe('haze-ui/icons', () => {
  it('exports exactly the curated 101 icons, alphabetically', () => {
    const exported = Object.keys(icons).filter((key) => key !== 'hazeIconSize');
    expect(exported).toEqual(CURATED_ICONS);
    expect(CURATED_ICONS).toHaveLength(101);
  });

  it('imports every curated icon from lucide-react as a renderable component', () => {
    // lucide icons are forwardRef exotics (typeof 'object'), so the shape
    // check is the render itself: every glyph must mount an <svg>.
    const barrel = icons as unknown as Record<string, unknown>;
    for (const name of CURATED_ICONS) {
      const IconComponent = barrel[name] as ComponentType<SVGProps<SVGSVGElement>>;
      const { container, unmount } = render(createElement(IconComponent));
      expect(container.querySelector('svg'), name).not.toBeNull();
      unmount();
    }
  });

  it('leaks no default export', () => {
    expect((icons as Record<string, unknown>).default).toBeUndefined();
  });

  it('freezes hazeIconSize at the Icon component size scale', () => {
    expect(Object.isFrozen(icons.hazeIconSize)).toBe(true);
    expect(icons.hazeIconSize).toEqual({ sm: 16, md: 20, lg: 24 });
  });
});
