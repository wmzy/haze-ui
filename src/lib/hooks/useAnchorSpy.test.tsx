import { act, fireEvent, render, screen } from '@testing-library/react';
import { useControl } from 'react-use-control';

import { useAnchorSpy } from './useAnchorSpy';

// jsdom 30 没有 IntersectionObserver——IO 路径按真实回调形态自 stub
// （与 useInView.test 同法）；不 stub 时走的正是回退引擎路径。

type SpyOptions = Parameters<typeof useAnchorSpy>[0];

function Probe(props: SpyOptions) {
  const { activeId } = useAnchorSpy(props);
  return <output data-testid='spy'>{activeId}</output>;
}

/** hook + 它追踪的区块，渲染在同一棵树里。 */
function renderSpy(props: Omit<SpyOptions, 'ids'> & { ids: string[] }) {
  const { ids, ...rest } = props;
  return render(
    <main>
      <Probe ids={ids} {...rest} />
      {ids.map((id) => (
        <section key={id} id={id}>
          {id} body
        </section>
      ))}
    </main>
  );
}

class MockIntersectionObserver {
  static instances: MockIntersectionObserver[] = [];
  callback: (
    entries: IntersectionObserverEntry[],
    observer: IntersectionObserver
  ) => void;
  options: IntersectionObserverInit | undefined;
  observe = vi.fn((el: Element) => {
    this.observed.push(el);
  });
  unobserve = vi.fn();
  disconnect = vi.fn();
  observed: Element[] = [];

  constructor(
    callback: (
      entries: IntersectionObserverEntry[],
      observer: IntersectionObserver
    ) => void,
    options?: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.options = options;
    MockIntersectionObserver.instances.push(this);
  }
}

/** 安装 IO mock 并清理（默认 jsdom 无 IO，无需反装回退路径）。 */
function useMockIO() {
  vi.stubGlobal(
    'IntersectionObserver',
    MockIntersectionObserver
  );
  return () => {
    vi.unstubAllGlobals();
    MockIntersectionObserver.instances = [];
  };
}

const entry = (id: string, isIntersecting: boolean) =>
  ({
    target: document.getElementById(id) as Element,
    isIntersecting,
  }) as unknown as IntersectionObserverEntry;

describe('useAnchorSpy', () => {
  it('defaults the highlight to the first id', () => {
    renderSpy({ ids: ['basics', 'usage', 'api'] });
    expect(screen.getByTestId('spy')).toHaveTextContent('basics');
  });

  it('returns an empty activeId without ids', () => {
    renderSpy({ ids: [] });
    expect(screen.getByTestId('spy')).toHaveTextContent('');
  });

  it('tracks the topmost visible section with IntersectionObserver', () => {
    const restore = useMockIO();
    try {
      const { unmount } = renderSpy({
        ids: ['basics', 'usage', 'api'],
        offsetTop: 24,
      });
      const observer = MockIntersectionObserver.instances.at(-1);
      expect(observer).toBeDefined();
      // window 容器 → 视口 root；offsetTop 下移激活线
      expect(observer?.options?.root).toBeNull();
      expect(observer?.options?.rootMargin).toBe('-24px 0px 0px 0px');
      expect(observer?.observed).toEqual([
        document.getElementById('basics'),
        document.getElementById('usage'),
        document.getElementById('api'),
      ]);

      // 'api' 进入、其余离开 → 只剩 'api' 可见
      act(() => {
        observer?.callback(
          [
            entry('api', true),
            entry('usage', false),
            entry('basics', false),
          ],
          observer as unknown as IntersectionObserver
        );
      });
      expect(screen.getByTestId('spy')).toHaveTextContent('api');

      // 往回滚：'usage' 重新进入 → 按文档顺序它胜出
      act(() => {
        observer?.callback(
          [entry('usage', true)],
          observer as unknown as IntersectionObserver
        );
      });
      expect(screen.getByTestId('spy')).toHaveTextContent('usage');

      const disconnect = observer?.disconnect;
      unmount();
      expect(disconnect).toHaveBeenCalled();
    } finally {
      restore();
    }
  });

  it('observes a custom container as the IntersectionObserver root', () => {
    const restore = useMockIO();
    try {
      const containerRef: { current: HTMLDivElement | null } = {
        current: null,
      };
      render(
        <main>
          <Probe
            ids={['basics']}
            getContainer={() => containerRef.current!}
          />
          <div
            ref={(el) => {
              containerRef.current = el;
            }}
          >
            <section id='basics'>Basics body</section>
          </div>
        </main>
      );
      const observer = MockIntersectionObserver.instances.at(-1);
      expect(observer?.options?.root).toBe(containerRef.current);
    } finally {
      restore();
    }
  });

  it('falls back to scroll-position tracking on the window', () => {
    renderSpy({ ids: ['basics', 'usage', 'api'], bounds: 10 });
    const tops: Record<string, number> = { basics: 0, usage: -20, api: 400 };
    const spies = Object.entries(tops).map(([id, top]) =>
      vi
        .spyOn(document.getElementById(id) as Element, 'getBoundingClientRect')
        .mockReturnValue({ top } as DOMRect)
    );
    try {
      fireEvent.scroll(window);
      // 触发线内最后一个区块胜出
      expect(screen.getByTestId('spy')).toHaveTextContent('usage');
    } finally {
      spies.forEach((spy) => spy.mockRestore());
    }
  });

  it('falls back relative to a custom scroll container', () => {
    const containerRef: { current: HTMLDivElement | null } = {
      current: null,
    };
    render(
      <main>
        <Probe
          ids={['basics', 'usage']}
          bounds={0}
          getContainer={() => containerRef.current!}
        />
        <div
          ref={(el) => {
            containerRef.current = el;
          }}
        >
          <section id='basics'>Basics body</section>
          <section id='usage'>Usage body</section>
        </div>
      </main>
    );
    const scrollBox = containerRef.current!;
    vi.spyOn(scrollBox, 'getBoundingClientRect').mockReturnValue({
      top: 100,
    } as DOMRect);
    // basics 顶部 90（相对容器 -10）越过 0 触发线；usage 顶部 300 未过线
    vi.spyOn(
      document.getElementById('basics') as Element,
      'getBoundingClientRect'
    ).mockReturnValue({ top: 90 } as DOMRect);
    vi.spyOn(
      document.getElementById('usage') as Element,
      'getBoundingClientRect'
    ).mockReturnValue({ top: 300 } as DOMRect);

    // scroll 监听挂在容器上而非 window
    fireEvent.scroll(window);
    expect(screen.getByTestId('spy')).toHaveTextContent('basics');
    fireEvent.scroll(scrollBox);
    expect(screen.getByTestId('spy')).toHaveTextContent('basics');
  });

  it('shares the highlight with a parent through a control', () => {
    const restore = useMockIO();
    try {
      function Controlled() {
        const [activeId, , control] = useControl(undefined, 'alpha');
        const { activeId: spyId, setActiveId } = useAnchorSpy({
          ids: ['alpha', 'beta'],
          activeId: control,
        });
        return (
          <div>
            <output data-testid='mirror'>[{activeId}]</output>
            <output data-testid='spy'>{spyId}</output>
            <button onClick={() => setActiveId('beta')}>jump</button>
            <section id='alpha'>Alpha body</section>
            <section id='beta'>Beta body</section>
          </div>
        );
      }
      render(<Controlled />);
      expect(screen.getByTestId('mirror')).toHaveTextContent('[alpha]');

      // 引擎写入流向父级 control
      const observer = MockIntersectionObserver.instances.at(-1);
      act(() => {
        observer?.callback(
          [entry('beta', true), entry('alpha', false)],
          observer as unknown as IntersectionObserver
        );
      });
      expect(screen.getByTestId('mirror')).toHaveTextContent('[beta]');
      expect(screen.getByTestId('spy')).toHaveTextContent('beta');

      // 父级外部写入同样反映在 activeId 上
      fireEvent.click(screen.getByText('jump'));
      expect(screen.getByTestId('mirror')).toHaveTextContent('[beta]');
    } finally {
      restore();
    }
  });
});
