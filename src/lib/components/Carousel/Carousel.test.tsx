import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Carousel from './Carousel';
import CarouselSlide from './CarouselSlide';

beforeEach(() => {
  Element.prototype.scrollIntoView = Element.prototype.scrollIntoView || vi.fn();
});

describe('Carousel', () => {
  it('renders with carousel role', () => {
    render(
      <Carousel>
        <CarouselSlide>Slide 1</CarouselSlide>
        <CarouselSlide>Slide 2</CarouselSlide>
      </Carousel>
    );
    expect(screen.getByRole('region', { name: 'Carousel' })).toBeInTheDocument();
  });

  it('renders slides', () => {
    render(
      <Carousel>
        <CarouselSlide>Slide 1</CarouselSlide>
        <CarouselSlide>Slide 2</CarouselSlide>
      </Carousel>
    );
    expect(screen.getByText('Slide 1')).toBeInTheDocument();
    expect(screen.getByText('Slide 2')).toBeInTheDocument();
  });

  it('renders navigation buttons for multiple slides', () => {
    render(
      <Carousel>
        <CarouselSlide>Slide 1</CarouselSlide>
        <CarouselSlide>Slide 2</CarouselSlide>
      </Carousel>
    );
    expect(screen.getByRole('button', { name: 'Previous slide' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Next slide' })).toBeInTheDocument();
  });

  it('does not render navigation for single slide', () => {
    render(
      <Carousel>
        <CarouselSlide>Only one</CarouselSlide>
      </Carousel>
    );
    expect(screen.queryByRole('button', { name: 'Previous slide' })).not.toBeInTheDocument();
  });

  it('renders dot indicators', () => {
    render(
      <Carousel>
        <CarouselSlide>A</CarouselSlide>
        <CarouselSlide>B</CarouselSlide>
        <CarouselSlide>C</CarouselSlide>
      </Carousel>
    );
    expect(screen.getByRole('button', { name: 'Go to slide 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 2' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Go to slide 3' })).toBeInTheDocument();
  });

  it('navigates with next/prev buttons', async () => {
    const user = userEvent.setup();
    render(
      <Carousel>
        <CarouselSlide>A</CarouselSlide>
        <CarouselSlide>B</CarouselSlide>
      </Carousel>
    );
    await user.click(screen.getByRole('button', { name: 'Next slide' }));
    await user.click(screen.getByRole('button', { name: 'Previous slide' }));
  });

  it('navigates with dot indicators', async () => {
    const user = userEvent.setup();
    render(
      <Carousel>
        <CarouselSlide>A</CarouselSlide>
        <CarouselSlide>B</CarouselSlide>
      </Carousel>
    );
    await user.click(screen.getByRole('button', { name: 'Go to slide 2' }));
  });

  it('applies className', () => {
    render(
      <Carousel className="custom">
        <CarouselSlide>A</CarouselSlide>
      </Carousel>
    );
    expect(screen.getByRole('region')).toHaveClass('custom');
  });

  it('auto-plays when enabled', () => {
    vi.useFakeTimers();
    render(
      <Carousel autoPlay interval={1000}>
        <CarouselSlide>A</CarouselSlide>
        <CarouselSlide>B</CarouselSlide>
      </Carousel>
    );
    vi.advanceTimersByTime(1000);
    vi.useRealTimers();
  });
});

describe('CarouselSlide', () => {
  it('renders children with slide role', () => {
    render(
      <Carousel>
        <CarouselSlide>Content</CarouselSlide>
        <CarouselSlide>Content 2</CarouselSlide>
      </Carousel>
    );
    const slides = screen.getAllByRole('group');
    expect(slides).toHaveLength(2);
  });

  it('applies className', () => {
    render(
      <Carousel>
        <CarouselSlide className="custom">A</CarouselSlide>
        <CarouselSlide>B</CarouselSlide>
      </Carousel>
    );
    expect(screen.getAllByRole('group')[0]).toHaveClass('custom');
  });
});
