import { render, screen, fireEvent } from '@testing-library/react';
import { createRef } from 'react';

import { focusRingVisible } from '../../utils/focus-ring';
import { fab, shapes, variants, anchored } from '../FloatButton/float-button-styles';

import BackToTop from './BackToTop';

describe('BackToTop', () => {
  it('renders a button', () => {
    render(<BackToTop />);
    expect(screen.getByRole('button', { name: 'Back to top' })).toBeInTheDocument();
  });

  it('wears the shared FloatButton skin and the keyboard focus ring', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    // the composed face: FloatButton fab + circle + solid + anchored,
    // plus the shared :focus-visible ring the hand-rolled skin lacked.
    for (const skin of [fab, focusRingVisible, shapes.circle, variants.solid, anchored]) {
      expect(button).toHaveClass(skin);
    }
  });

  it('applies className', () => {
    render(<BackToTop className="custom" />);
    expect(screen.getByRole('button')).toHaveClass('custom');
  });

  it('renders custom children', () => {
    render(<BackToTop>Top</BackToTop>);
    expect(screen.getByText('Top')).toBeInTheDocument();
  });

  it('scrolls to top on click', () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    render(<BackToTop />);
    fireEvent.click(screen.getByRole('button'));
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(<BackToTop />);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});

describe('BackToTop as polymorphism', () => {
  it("as='a' renders a real anchor: href/rest land on <a>, no type attr, scroll wiring kept", () => {
    const scrollTo = vi.fn();
    Object.defineProperty(window, 'scrollTo', { value: scrollTo, writable: true });
    render(<BackToTop as="a" href="#top" data-track="btt" />);
    const link = screen.getByRole('link', { name: 'Back to top' });
    expect(link.tagName).toBe('A');
    expect(link).toHaveAttribute('href', '#top');
    expect(link).toHaveAttribute('data-track', 'btt');
    // the button-only default is gated — anchors don't carry it
    expect(link).not.toHaveAttribute('type');
    // clicking still scrolls (the wiring wins on any element)
    fireEvent.click(link);
    expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' });
  });

  it("as='a' forwards ref to the anchor element", () => {
    const ref = createRef<HTMLAnchorElement>();
    render(<BackToTop as="a" href="#top" ref={ref} />);
    expect(ref.current).toBeInstanceOf(HTMLAnchorElement);
  });

  it('default shape unchanged: native button with type="button"', () => {
    render(<BackToTop />);
    const button = screen.getByRole('button', { name: 'Back to top' });
    expect(button.tagName).toBe('BUTTON');
    expect(button).toHaveAttribute('type', 'button');
  });
});
