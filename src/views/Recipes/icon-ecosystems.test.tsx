import { Rocket } from 'lucide-react';

import { render, screen } from '@testing-library/react';
import { expect } from 'vitest';

import {
  APP_ICONS,
  AppIcon,
  IconEcosystemDemo,
} from './icon-ecosystems';

describe('icon-ecosystems recipe', () => {
  it('maps every app icon entry to its lucide glyph', () => {
    expect(APP_ICONS.deploy).toBe(Rocket);
    expect(Object.keys(APP_ICONS)).toEqual(['deploy', 'discard', 'empty']);
  });

  it('AppIcon renders the named glyph inside the Icon slot', () => {
    const { container } = render(<AppIcon name='deploy' size='lg' />);
    const slot = container.querySelector("[data-slot='icon']");
    expect(slot).not.toBeNull();
    expect(slot?.querySelector('svg')).not.toBeNull();
  });

  it('renders the live demo: buttons, menu, Result and Empty slots', () => {
    render(<IconEcosystemDemo />);
    // lucide set through AppIcon (icons are aria-hidden — names are labels)
    expect(screen.getByRole('button', { name: 'Deploy' })).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Discard draft' })
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Actions' })).toBeInTheDocument();
    // react-icons: bare fill-set icon and stroke-set icon via children
    expect(
      screen.getByRole('button', { name: /Material, bare/ })
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: /Feather via children/ })
    ).toBeInTheDocument();
    // icon / image slots replacing the default illustrations
    expect(screen.getByText('Deployment live')).toBeInTheDocument();
    expect(screen.getByText('No deployments yet')).toBeInTheDocument();
    // Menu with data-driven icons mounts (items carry the AppIcon glyphs)
    expect(screen.getByRole('menu')).toBeInTheDocument();
    expect(screen.getByText('Deploy revision')).toBeInTheDocument();
    expect(screen.getByText('Search docs')).toBeInTheDocument();
  });

  it('keeps every rendered svg inside an aria-hidden context', () => {
    const { container } = render(<IconEcosystemDemo />);
    const svgs = container.querySelectorAll('svg');
    expect(svgs.length).toBeGreaterThan(0);
    // Icon slots are aria-hidden; bare react-icons svgs sit inside buttons
    // whose accessible name comes from the text, not the glyph.
    for (const svg of svgs) {
      const hiddenByIcon = svg.closest("[aria-hidden='true']");
      const inNamedButton = svg.closest('button') !== null;
      expect(hiddenByIcon !== null || inNamedButton).toBe(true);
    }
  });
});
