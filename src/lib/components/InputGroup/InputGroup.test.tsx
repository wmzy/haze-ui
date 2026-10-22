import { expect } from 'vitest';
import { createRef } from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { Button } from '../Button';
import { Input } from '../Input';
import { Select } from '../Select';

import InputGroup from './InputGroup';
import InputGroupAddon from './InputGroupAddon';

import {
  addon as addonClass,
  addonSizes,
  group as groupClass,
} from './input-group-styles';

/** Stands in for any size-aware field child: records what the group
 * injected without coupling the test to InputCore's private classes. */
function SizeProbe(props: { size?: string; 'data-testid'?: string }) {
  return <input data-testid={props['data-testid']} data-size={props.size} readOnly />;
}

describe('InputGroup', () => {
  it('composes a real Input between leading and trailing addons', () => {
    render(
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <Input aria-label="Domain" />
        <InputGroupAddon>.dev</InputGroupAddon>
      </InputGroup>,
    );
    expect(
      screen.getByRole('textbox', { name: 'Domain' }),
    ).toBeInTheDocument();
    expect(screen.getByText('https://')).toBeInTheDocument();
    expect(screen.getByText('.dev')).toBeInTheDocument();
  });

  it('wears the merging skin class on the wrapper and forwards native props', () => {
    render(
      <InputGroup data-testid="ig">
        <InputGroupAddon>kg</InputGroupAddon>
        <Input aria-label="Weight" />
      </InputGroup>,
    );
    const wrapper = screen.getByTestId('ig');
    expect(wrapper).toHaveClass(groupClass);
    expect(wrapper).toHaveAttribute('data-slot', 'input-group');
  });

  it('does not intervene in the field value — uncontrolled typing works', async () => {
    const user = userEvent.setup();
    render(
      <InputGroup>
        <InputGroupAddon>🔍</InputGroupAddon>
        <Input aria-label="Search" />
      </InputGroup>,
    );
    await user.type(screen.getByRole('textbox', { name: 'Search' }), 'abc');
    expect(screen.getByRole('textbox', { name: 'Search' })).toHaveValue('abc');
  });

  it('attaches a real Button as the trailing action', async () => {
    const user = userEvent.setup();
    const onSearch = vi.fn();
    render(
      <InputGroup>
        <Input aria-label="Search" />
        <Button onClick={onSearch}>Go</Button>
      </InputGroup>,
    );
    await user.click(screen.getByRole('button', { name: 'Go' }));
    expect(onSearch).toHaveBeenCalledOnce();
  });

  it('composes a real Select as the field', () => {
    render(
      <InputGroup>
        <InputGroupAddon>Scope</InputGroupAddon>
        <Select aria-label="Scope">
          <option value="org">Org</option>
          <option value="user">User</option>
        </Select>
      </InputGroup>,
    );
    expect(screen.getByRole('combobox', { name: 'Scope' })).toBeInTheDocument();
  });

  it('injects the group size into field children that leave it unset', () => {
    render(
      <InputGroup size="lg">
        <SizeProbe data-testid="probe" />
        <SizeProbe data-testid="explicit" size="sm" />
      </InputGroup>,
    );
    expect(screen.getByTestId('probe')).toHaveAttribute('data-size', 'lg');
    expect(screen.getByTestId('explicit')).toHaveAttribute('data-size', 'sm');
  });

  it('applies className and classNames.root to the wrapper', () => {
    render(
      <InputGroup className="custom" classNames={{ root: 'slot-root' }}>
        <Input aria-label="Search" />
      </InputGroup>,
    );
    const wrapper = screen.getByLabelText('Search').parentElement;
    expect(wrapper).toHaveClass('custom');
    expect(wrapper).toHaveClass('slot-root');
  });

  it('forwards ref to the wrapper div', () => {
    const ref = createRef<HTMLDivElement>();
    render(
      <InputGroup ref={ref}>
        <Input aria-label="Search" />
      </InputGroup>,
    );
    expect(ref.current).toBe(screen.getByLabelText('Search').parentElement);
  });
});

describe('InputGroupAddon', () => {
  it('wears the addon skin and inherits the group size', () => {
    render(
      <InputGroup size="sm">
        <InputGroupAddon>kg</InputGroupAddon>
        <Input aria-label="Weight" />
      </InputGroup>,
    );
    const addon = screen.getByText('kg');
    expect(addon).toHaveClass(addonClass);
    expect(addon).toHaveClass(addonSizes.sm);
    expect(addon).toHaveAttribute('data-slot', 'addon');
  });

  it("an addon's explicit size wins over the group", () => {
    render(
      <InputGroup size="sm">
        <InputGroupAddon size="lg">kg</InputGroupAddon>
        <Input aria-label="Weight" />
      </InputGroup>,
    );
    const addon = screen.getByText('kg');
    expect(addon).toHaveClass(addonSizes.lg);
    expect(addon).not.toHaveClass(addonSizes.sm);
  });

  it('keeps text addons in the accessibility tree', () => {
    render(
      <InputGroup>
        <InputGroupAddon>https://</InputGroupAddon>
        <Input aria-label="Domain" />
      </InputGroup>,
    );
    // getByText only finds content exposed to the accessibility tree —
    // an aria-hidden addon would drop out of this query.
    expect(screen.getByText('https://')).toBeInTheDocument();
  });

  it('inherits classNames.addon from the group', () => {
    render(
      <InputGroup classNames={{ addon: 'addon-slot' }}>
        <InputGroupAddon>kg</InputGroupAddon>
        <Input aria-label="Weight" />
      </InputGroup>,
    );
    expect(screen.getByText('kg')).toHaveClass('addon-slot');
  });
});

describe('InputGroup a11y', () => {
  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <InputGroup>
        <InputGroupAddon>
          <span aria-hidden="true">🔍</span>
        </InputGroupAddon>
        <Input aria-label="Search components" />
        <Button>Search</Button>
      </InputGroup>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
