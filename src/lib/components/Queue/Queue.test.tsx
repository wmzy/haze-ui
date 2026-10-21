import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import Queue, { QueueItem } from './Queue';

describe('Queue', () => {
  it('renders items with title and description', () => {
    render(
      <Queue>
        <QueueItem title='First message' description='queued while offline' />
        <QueueItem title='Second message' />
      </Queue>,
    );
    expect(screen.getByText('First message')).toBeInTheDocument();
    expect(screen.getByText('queued while offline')).toBeInTheDocument();
    expect(screen.getByText('Second message')).toBeInTheDocument();
  });

  it('renders list semantics', () => {
    render(
      <Queue>
        <QueueItem title='A' />
      </Queue>,
    );
    expect(screen.getByRole('list')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toBeInTheDocument();
  });

  it('renders a status announcement for the sending state', () => {
    render(
      <Queue>
        <QueueItem title='A' status='sending' />
      </Queue>,
    );
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders the failed indicator glyph', () => {
    render(
      <Queue>
        <QueueItem title='A' status='failed' />
      </Queue>,
    );
    expect(screen.getByText('!')).toBeInTheDocument();
  });

  it('renders no indicator glyph while queued', () => {
    render(
      <Queue>
        <QueueItem title='A' />
      </Queue>,
    );
    expect(screen.queryByText('!')).not.toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('renders the remove button only when onRemove is provided', () => {
    const { rerender } = render(
      <Queue>
        <QueueItem title='A' />
      </Queue>,
    );
    expect(screen.queryByRole('button')).not.toBeInTheDocument();

    rerender(
      <Queue>
        <QueueItem title='A' />
        <QueueItem title='B' onRemove={() => undefined} />
      </Queue>,
    );
    expect(screen.getAllByRole('button')).toHaveLength(1);
  });

  it('calls onRemove when the remove button is clicked', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();
    render(
      <Queue>
        <QueueItem title='A' onRemove={onRemove} removeLabel='Remove from queue' />
      </Queue>,
    );
    await user.click(screen.getByRole('button', { name: 'Remove from queue' }));
    expect(onRemove).toHaveBeenCalledTimes(1);
  });

  it('falls back to the × glyph as the remove button name', () => {
    render(
      <Queue>
        <QueueItem title='A' onRemove={() => undefined} />
      </Queue>,
    );
    expect(screen.getByRole('button', { name: '×' })).toBeInTheDocument();
  });

  it('applies className to root and item', () => {
    render(
      <Queue className='custom-root'>
        <QueueItem title='A' className='custom-item' />
      </Queue>,
    );
    expect(screen.getByRole('list')).toHaveClass('custom-root');
    expect(screen.getByRole('listitem')).toHaveClass('custom-item');
  });

  it('forwards native props to root and item', () => {
    render(
      <Queue data-testid='queue-root'>
        <QueueItem title='A' id='entry-1' />
      </Queue>,
    );
    expect(screen.getByTestId('queue-root')).toBeInTheDocument();
    expect(screen.getByRole('listitem')).toHaveAttribute('id', 'entry-1');
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <Queue>
        <QueueItem title='Queued message' description='waiting for connection' />
        <QueueItem title='Sending message' status='sending' />
        <QueueItem
          title='Failed message'
          description='retry pending'
          status='failed'
          onRemove={() => undefined}
          removeLabel='Remove from queue'
        />
      </Queue>,
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
