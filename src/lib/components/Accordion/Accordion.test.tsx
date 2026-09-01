import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

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
});
