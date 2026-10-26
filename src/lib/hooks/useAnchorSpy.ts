import type { Dispatch, SetStateAction } from 'react';
import type { ControlOrValue } from 'react-use-control';

import { useEffect } from 'react';
import { useControl } from 'react-use-control';

type UseAnchorSpyOptions = {
  /** 追踪的区块 id 列表（文档顺序）。 */
  ids: readonly string[];
  /** 滚动容器，默认 `window`。 */
  getContainer?: () => HTMLElement | Window;
  /** 容器顶部与区块顶部保留的距离（吸顶头高度），px。 */
  offsetTop?: number;
  /** 滚动侦测触发线，距容器顶部 px（仅无 IntersectionObserver 的回退引擎）。 */
  bounds?: number;
  /** 高亮区块 id：接受 control（受控）或普通值（非受控初值）。 */
  activeId?: ControlOrValue<string>;
};

type UseAnchorSpyResult = {
  /** 当前高亮区块 id；无匹配时为空串。 */
  activeId: string;
  /** 写入高亮（点击导航、外部跳转），受控时同步到外部状态。 */
  setActiveId: Dispatch<SetStateAction<string>>;
};

/**
 * 滚动侦测（scroll-spy）：追踪一组区块 id，返回当前应高亮的那个。
 *
 * ```tsx
 * function TocNav() {
 *   const { activeId, setActiveId } = useAnchorSpy({ ids: ['basics', 'api'] });
 *   return (
 *     <nav>
 *       {['basics', 'api'].map((id) => (
 *         <a
 *           key={id}
 *           href={`#${id}`}
 *           aria-current={activeId === id ? 'true' : undefined}
 *           onClick={(event) => {
 *             event.preventDefault();
 *             setActiveId(id);
 *           }}
 *         >
 *           {id}
 *         </a>
 *       ))}
 *     </nav>
 *   );
 * }
 * ```
 *
 * - IntersectionObserver 引擎：区块与 `offsetTop` 以下的视口带相交即
 *   「可见」，按 `ids` 顺序取最靠前的可见区块。容器是元素时作为
 *   observer root，否则用视口。
 * - 回退引擎（无 IntersectionObserver 的环境）：监听容器 scroll，激活
 *   最后一个顶部越过 `bounds` 触发线的区块。不做初始运行——初值交给
 *   `activeId`（jsdom 的零矩形会误报）。
 * - `activeId` 走 react-use-control：传 control 受控、传普通值作
 *   非受控初值（默认 `ids[0]`）。
 * - `ids` 身份随父级渲染漂移只会重建订阅——观察者重新上报当前位置，
 *   行为不变。
 *
 * @param options 见 {@link UseAnchorSpyOptions}。
 * @returns `{ activeId, setActiveId }`。
 */
export function useAnchorSpy({
  ids,
  getContainer,
  offsetTop = 0,
  bounds = 5,
  activeId: activeIdControl,
}: UseAnchorSpyOptions): UseAnchorSpyResult {
  const [activeId, setActiveId] = useControl(
    activeIdControl,
    () => ids[0] ?? ''
  );

  // IntersectionObserver tracks which sections intersect the viewport band
  // below `offsetTop`; the topmost visible section in document order wins.
  // Engines without IntersectionObserver get the scroll-listener fallback
  // below instead.
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const visible = new Set<string>();
    const container = getContainer?.() ?? window;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) visible.add(entry.target.id);
          else visible.delete(entry.target.id);
        }
        const next = ids.find((id) => visible.has(id));
        if (next) setActiveId(next);
      },
      {
        root: container instanceof HTMLElement ? container : null,
        rootMargin: `${-offsetTop}px 0px 0px 0px`,
      }
    );
    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
    // `ids` identity may churn with the parent, but re-subscribing only
    // re-seeds the observer — entries re-report current positions.
  }, [ids, offsetTop, getContainer, setActiveId]);

  // Fallback spy for engines without IntersectionObserver: on each scroll
  // event the active section is the last one whose top crossed `bounds`.
  useEffect(() => {
    if (typeof IntersectionObserver !== 'undefined') return;
    const container = getContainer?.() ?? window;
    const scrollBox = container instanceof HTMLElement ? container : window;
    const containerTop =
      container instanceof HTMLElement
        ? container.getBoundingClientRect().top
        : 0;
    const onScroll = () => {
      let next: string | undefined;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top - containerTop <= bounds) {
          next = id;
        }
      }
      if (next) setActiveId(next);
    };
    scrollBox.addEventListener('scroll', onScroll, { passive: true });
    return () => scrollBox.removeEventListener('scroll', onScroll);
  }, [ids, bounds, getContainer, setActiveId]);

  return { activeId, setActiveId };
}

export type { UseAnchorSpyOptions, UseAnchorSpyResult };
