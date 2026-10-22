import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useControl } from 'react-use-control';

import Accordion from './Accordion';
import AccordionItem from './AccordionItem';

describe('Accordion', () => {
  it('renders accordion items', () => {
    render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
        <AccordionItem title="Section 2">Content 2</AccordionItem>
      </Accordion>
    );
    expect(screen.getByText('Section 1')).toBeInTheDocument();
    expect(screen.getByText('Section 2')).toBeInTheDocument();
  });

  it('renders content inside details elements', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('details')).toBeInTheDocument();
    expect(container.querySelector('summary')).toHaveTextContent('Section 1');
  });

  it('applies className to Accordion root', () => {
    const { container } = render(
      <Accordion className="custom">
        <AccordionItem title="S">C</AccordionItem>
      </Accordion>
    );
    expect(container.firstChild).toHaveClass('custom');
  });

  it('applies className to AccordionItem', () => {
    const { container } = render(
      <Accordion>
        <AccordionItem title="S" className="item-custom">C</AccordionItem>
      </Accordion>
    );
    expect(container.querySelector('details')).toHaveClass('item-custom');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
        <AccordionItem title="Section 2">Content 2</AccordionItem>
      </Accordion>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when an item is expanded', async () => {
    const { axe } = await import('jest-axe');
    const user = userEvent.setup();
    const { container } = render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
      </Accordion>
    );
    await user.click(screen.getByText('Section 1'));
    expect(container.querySelector('details')).toHaveAttribute('open');
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  // ── controllable open state ──────────────────────────────────────

  it('uncontrolled: clicking a summary toggles the item open then closed', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
      </Accordion>
    );
    const details = container.querySelector('details')!;
    expect(details).not.toHaveAttribute('open');
    await user.click(screen.getByText('Section 1'));
    expect(details).toHaveAttribute('open');
    await user.click(screen.getByText('Section 1'));
    expect(details).not.toHaveAttribute('open');
  });

  it('uncontrolled: a plain open value seeds the initial keys', () => {
    const { container } = render(
      <Accordion open={['1']}>
        <AccordionItem title="S0">C0</AccordionItem>
        <AccordionItem title="S1">C1</AccordionItem>
      </Accordion>
    );
    const details = container.querySelectorAll('details');
    expect(details[0]).not.toHaveAttribute('open');
    expect(details[1]).toHaveAttribute('open');
  });

  it('uncontrolled: onOpenChange reports the next key array', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Accordion onOpenChange={onOpenChange}>
        <AccordionItem title="S0">C0</AccordionItem>
        <AccordionItem title="S1">C1</AccordionItem>
      </Accordion>
    );
    await user.click(screen.getByText('S0'));
    expect(onOpenChange).toHaveBeenCalledWith(['0']);
    await user.click(screen.getByText('S1'));
    expect(onOpenChange).toHaveBeenLastCalledWith(['0', '1']);
  });

  it('controlled: a Control drives the open attribute both ways', async () => {
    const user = userEvent.setup();
    function Controlled() {
      const [, setOpen, openCtrl] = useControl<string[]>(undefined, []);
      return (
        <>
          <button
            onClick={() => setOpen((prev) => (prev.includes('a') ? [] : ['a']))}
          >
            flip
          </button>
          <Accordion open={openCtrl} onOpenChange={setOpen}>
            <AccordionItem itemKey="a" title="A">CA</AccordionItem>
          </Accordion>
        </>
      );
    }
    const { container } = render(<Controlled />);
    const details = container.querySelector('details')!;
    expect(details).not.toHaveAttribute('open');
    // parent-driven open…
    await user.click(screen.getByText('flip'));
    expect(details).toHaveAttribute('open');
    // …and parent-driven close
    await user.click(screen.getByText('flip'));
    expect(details).not.toHaveAttribute('open');
    // user activation rides the same control
    await user.click(screen.getByText('A'));
    expect(details).toHaveAttribute('open');
  });

  it('itemKey addresses items in the open state', () => {
    const { container } = render(
      <Accordion open={['settings']}>
        <AccordionItem itemKey="settings" title="Settings">C0</AccordionItem>
        <AccordionItem title="Other">C1</AccordionItem>
      </Accordion>
    );
    const details = container.querySelectorAll('details');
    expect(details[0]).toHaveAttribute('open');
    expect(details[1]).not.toHaveAttribute('open');
  });

  it('assigns positional keys through array/Fragment children', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Accordion onOpenChange={onOpenChange}>
        <AccordionItem title="S0">C0</AccordionItem>
        <>
          <AccordionItem title="S1">C1</AccordionItem>
        </>
        <AccordionItem title="S2">C2</AccordionItem>
      </Accordion>
    );
    await user.click(screen.getByText('S2'));
    expect(onOpenChange).toHaveBeenCalledWith(['2']);
  });

  // ── exclusive ────────────────────────────────────────────────────

  it('exclusive: opening one item closes the others', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Accordion exclusive>
        <AccordionItem title="S0">C0</AccordionItem>
        <AccordionItem title="S1">C1</AccordionItem>
      </Accordion>
    );
    const [d0, d1] = container.querySelectorAll('details');
    await user.click(screen.getByText('S0'));
    expect(d0).toHaveAttribute('open');
    await user.click(screen.getByText('S1'));
    expect(d0).not.toHaveAttribute('open');
    expect(d1).toHaveAttribute('open');
    // closing the open item empties the array (length ≤ 1 invariant)
    await user.click(screen.getByText('S1'));
    expect(d0).not.toHaveAttribute('open');
    expect(d1).not.toHaveAttribute('open');
  });

  it('exclusive: onOpenChange receives the replacement array', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    render(
      <Accordion exclusive onOpenChange={onOpenChange}>
        <AccordionItem title="S0">C0</AccordionItem>
        <AccordionItem title="S1">C1</AccordionItem>
      </Accordion>
    );
    await user.click(screen.getByText('S0'));
    expect(onOpenChange).toHaveBeenLastCalledWith(['0']);
    await user.click(screen.getByText('S1'));
    expect(onOpenChange).toHaveBeenLastCalledWith(['1']);
  });

  it('non-exclusive (default): items open independently', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Accordion>
        <AccordionItem title="S0">C0</AccordionItem>
        <AccordionItem title="S1">C1</AccordionItem>
      </Accordion>
    );
    const [d0, d1] = container.querySelectorAll('details');
    await user.click(screen.getByText('S0'));
    await user.click(screen.getByText('S1'));
    expect(d0).toHaveAttribute('open');
    expect(d1).toHaveAttribute('open');
  });

  // ── disabled ─────────────────────────────────────────────────────

  it('disabled item cannot be opened and reports aria-disabled', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    const { container } = render(
      <Accordion onOpenChange={onOpenChange}>
        <AccordionItem title="S0" disabled>C0</AccordionItem>
      </Accordion>
    );
    const details = container.querySelector('details')!;
    const summary = container.querySelector('summary')!;
    expect(summary).toHaveAttribute('aria-disabled', 'true');
    await user.click(summary);
    expect(details).not.toHaveAttribute('open');
    expect(onOpenChange).not.toHaveBeenCalled();
  });

  it('disabled standalone item still blocks the native toggle', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <AccordionItem title="S" disabled>C</AccordionItem>
    );
    await user.click(container.querySelector('summary')!);
    expect(container.querySelector('details')).not.toHaveAttribute('open');
  });

  it('standalone item outside <Accordion> keeps native toggling', async () => {
    const user = userEvent.setup();
    const { container } = render(<AccordionItem title="S">C</AccordionItem>);
    await user.click(container.querySelector('summary')!);
    expect(container.querySelector('details')).toHaveAttribute('open');
  });

  it('has no axe violations with a disabled item', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Accordion>
        <AccordionItem title="Section 1" disabled>Content 1</AccordionItem>
        <AccordionItem title="Section 2">Content 2</AccordionItem>
      </Accordion>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });

  // ── classNames slots ─────────────────────────────────────────────

  it('classNames slots land on every part (data-slot aligned)', () => {
    const { container } = render(
      <Accordion
        classNames={{
          accordion: 'c-acc',
          item: 'c-item',
          summary: 'c-sum',
          content: 'c-content',
        }}
      >
        <AccordionItem title="S">C</AccordionItem>
      </Accordion>
    );
    expect(container.firstChild).toHaveClass('c-acc');
    expect(container.querySelector('details')).toHaveClass('c-item');
    expect(container.querySelector('summary')).toHaveClass('c-sum');
    expect(container.querySelector("[data-slot='content']")).toHaveClass('c-content');
  });

  // ── keyboard ─────────────────────────────────────────────────────

  it('keyboard: the summary is a tab stop and activation toggles the item', async () => {
    const user = userEvent.setup();
    const { container } = render(
      <Accordion>
        <AccordionItem title="Section 1">Content 1</AccordionItem>
      </Accordion>
    );
    const details = container.querySelector('details')!;
    const summary = container.querySelector('summary')!;
    await user.tab();
    expect(summary).toHaveFocus();
    // Browsers synthesize a click for Enter/Space on the focused
    // summary; jsdom/user-event do not implement that default action,
    // so dispatch the synthesized activation itself — the library owns
    // the click → state path only.
    fireEvent.click(summary);
    expect(details).toHaveAttribute('open');
    fireEvent.click(summary);
    expect(details).not.toHaveAttribute('open');
  });
});
