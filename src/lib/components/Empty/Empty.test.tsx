import { render, screen } from '@testing-library/react';

import Empty from './Empty';

describe('Empty', () => {
  it('renders default "No data" text', () => {
    render(<Empty />);
    expect(screen.getByText('No data')).toBeInTheDocument();
  });

  it('renders custom description', () => {
    render(<Empty description="Nothing here" />);
    expect(screen.getByText('Nothing here')).toBeInTheDocument();
  });

  it('renders custom image', () => {
    render(<Empty image={<span>custom image</span>} />);
    expect(screen.getByText('custom image')).toBeInTheDocument();
  });

  it('renders children as action area', () => {
    render(<Empty><button>Retry</button></Empty>);
    expect(screen.getByRole('button', { name: 'Retry' })).toBeInTheDocument();
  });

  it('applies className', () => {
    render(<Empty className="custom" />);
    expect(screen.getByText('No data').parentElement).toHaveClass('custom');
  });
});
