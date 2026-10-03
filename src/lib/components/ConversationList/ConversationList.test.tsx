import type { MockInstance } from 'vitest';

import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import ConversationList from './ConversationList';
import ConversationItem from './ConversationItem';

describe('ConversationList', () => {
  it('renders children', () => {
    render(
      <ConversationList>
        <ConversationItem title="Chat 1" />
      </ConversationList>,
    );
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
  });

  it('applies className', () => {
    const { container } = render(<ConversationList className="custom"><div /></ConversationList>);
    expect(container.firstChild).toHaveClass('custom');
  });

  it('renders multiple items', () => {
    render(
      <ConversationList>
        <ConversationItem title="Chat 1" />
        <ConversationItem title="Chat 2" />
      </ConversationList>,
    );
    expect(screen.getByText('Chat 1')).toBeInTheDocument();
    expect(screen.getByText('Chat 2')).toBeInTheDocument();
  });

  it('renders subtitle', () => {
    render(<ConversationItem title="Chat" subtitle="Last message" />);
    expect(screen.getByText('Last message')).toBeInTheDocument();
  });

  it('renders active state', () => {
    render(<ConversationItem title="Chat" active />);
    expect(screen.getByText('Chat').closest('[aria-current]')).toBeTruthy();
  });

  it('calls onClick', async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    render(<ConversationItem title="Chat" onClick={onClick} />);
    await user.click(screen.getByText('Chat'));
    expect(onClick).toHaveBeenCalled();
  });

  it('renders end slot', () => {
    render(<ConversationItem title="Chat" end={<span>Delete</span>} />);
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  describe('onLoadMore', () => {
    // The end-reached check reads the list's scroll metrics during the
    // mount effect, before the element is reachable from the test — so
    // they are mocked on the prototype (the VirtualList reverse-suite
    // pattern). jsdom's clientHeight stays 0 without the spy.
    let scrollHeightSpy: MockInstance;
    let clientHeightSpy: MockInstance;

    beforeEach(() => {
      scrollHeightSpy = vi
        .spyOn(Element.prototype, 'scrollHeight', 'get')
        .mockReturnValue(4000);
      clientHeightSpy = vi
        .spyOn(Element.prototype, 'clientHeight', 'get')
        .mockReturnValue(400);
    });

    afterEach(() => {
      scrollHeightSpy.mockRestore();
      clientHeightSpy.mockRestore();
    });

    it('calls onLoadMore when the list scrolls within 200px of its end', () => {
      const onLoadMore = vi.fn();
      const { container } = render(
        <ConversationList onLoadMore={onLoadMore}>
          <ConversationItem title="Chat 1" />
          <ConversationItem title="Chat 2" />
        </ConversationList>,
      );
      const listEl = container.querySelector<HTMLElement>(
        '[data-slot="conversation-list"]',
      )!;
      // 4000 total − 400 port − 200 threshold: offset 3399 is 1px short
      // of the zone, 3400 lands exactly on its boundary.
      listEl.scrollTop = 3399;
      fireEvent.scroll(listEl);
      expect(onLoadMore).not.toHaveBeenCalled();
      listEl.scrollTop = 3400;
      fireEvent.scroll(listEl);
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      // Staying inside the zone does not re-fire; scrolling back out
      // re-arms.
      listEl.scrollTop = 3500;
      fireEvent.scroll(listEl);
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      listEl.scrollTop = 0;
      fireEvent.scroll(listEl);
      listEl.scrollTop = 3400;
      fireEvent.scroll(listEl);
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });

    it('stays silent on mount while the content overflows the port', () => {
      const onLoadMore = vi.fn();
      render(
        <ConversationList onLoadMore={onLoadMore}>
          <ConversationItem title="Chat 1" />
        </ConversationList>,
      );
      expect(onLoadMore).not.toHaveBeenCalled();
    });

    it('re-fires when growth keeps the list inside the zone', () => {
      const onLoadMore = vi.fn();
      scrollHeightSpy.mockReturnValue(300); // short content: fires on mount
      const { rerender } = render(
        <ConversationList onLoadMore={onLoadMore}>
          <ConversationItem title="Chat 1" />
        </ConversationList>,
      );
      expect(onLoadMore).toHaveBeenCalledTimes(1);
      // The next page lands but the list is still short — chain load.
      scrollHeightSpy.mockReturnValue(500);
      rerender(
        <ConversationList onLoadMore={onLoadMore}>
          <ConversationItem title="Chat 1" />
          <ConversationItem title="Chat 2" />
        </ConversationList>,
      );
      expect(onLoadMore).toHaveBeenCalledTimes(2);
    });
  });

  it('has no axe violations', async () => {
    const { axe } = await import('jest-axe');
    render(
      <ConversationList>
        <ConversationItem title="Chat 1" subtitle="Last message" active />
        <ConversationItem title="Chat 2" end={<span>2 unread</span>} />
      </ConversationList>
    );
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
