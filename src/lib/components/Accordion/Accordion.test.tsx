import { render, screen } from '@testing-library/react';

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
});
