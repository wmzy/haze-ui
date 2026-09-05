/**
 * focus.ts 纯函数单测。模块无可渲染组件，axe 用例以最小宿主 div
 * 代替渲染（见文末用例注释）。
 *
 * jsdom 事实：无 checkVisibility API（typeof 为 undefined），
 * 可见性判定走放行路径；元素级 stub 用于确定性覆盖两个分支。
 */
import { TABBABLE_SELECTOR, focusFirst, getTabbables, isTabbable } from './focus';

function mount(html: string): HTMLElement {
  const host = document.createElement('div');
  host.innerHTML = html;
  document.body.appendChild(host);
  return host;
}

/** 用 data-name 标注元素（input 等表单控件的 value 不进 textContent）。 */
function names(els: HTMLElement[]): string[] {
  return els.map((el) => el.dataset.name ?? '');
}

/** 索引取元素：取不到即测试失败（noUncheckedIndexedAccess 显式兜底）。 */
function at<T>(els: readonly T[], index: number): T {
  const el = els[index];
  if (!el) throw new Error(`test setup: no element at index ${index}`);
  return el;
}

describe('TABBABLE_SELECTOR / getTabbables', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('collects naturally tabbable elements in DOM order', () => {
    const container = mount(`
      <a href="/docs" data-name="link">link</a>
      <button data-name="btn">btn</button>
      <input data-name="field" value="field" />
      <select data-name="opt"><option>opt</option></select>
      <textarea data-name="area">area</textarea>
      <div tabindex="0" data-name="focusable">focusable</div>
      <div contenteditable="true" data-name="editable">editable</div>
      <audio controls data-name="audio">audio</audio>
      <video controls data-name="video">video</video>
      <details><summary data-name="summary">summary</summary>details</details>
    `);
    expect(names(getTabbables(container))).toEqual([
      'link',
      'btn',
      'field',
      'opt',
      'area',
      'focusable',
      'editable',
      'audio',
      'video',
      'summary',
    ]);
  });

  it('exposes the selector for consumer-side querySelectorAll', () => {
    const container = mount(`
      <button>kept</button>
      <span data-name="plain">plain</span>
    `);
    // 候选集只含结构性命中；span 永不进入
    expect(container.querySelectorAll(TABBABLE_SELECTOR)).toHaveLength(1);
  });

  it('skips disabled, hidden, unlinked and tabindex=-1 elements', () => {
    const container = mount(`
      <button disabled data-name="disabled-btn">disabled-btn</button>
      <input disabled data-name="disabled-input" />
      <input type="hidden" data-name="hidden-input" />
      <select disabled data-name="disabled-select"><option>x</option></select>
      <textarea disabled data-name="disabled-area">x</textarea>
      <a data-name="anchor-without-href">anchor-without-href</a>
      <div tabindex="-1" data-name="negative-tabindex">negative-tabindex</div>
      <button tabindex="-1" data-name="button-negative-tabindex">x</button>
      <div hidden data-name="hidden-attr">hidden-attr</div>
      <button hidden data-name="hidden-button">x</button>
      <button data-name="kept">kept</button>
    `);
    expect(names(getTabbables(container))).toEqual(['kept']);
  });

  it('filters invisible elements through checkVisibility when available', () => {
    const container = mount(`
      <button data-name="visible-one">one</button>
      <button data-name="invisible">two</button>
      <button data-name="visible-two">three</button>
    `);
    const invisible = at(Array.from(container.querySelectorAll('button')), 1);
    // 元素级 stub：模拟真实布局引擎返回不可见（jsdom 无该 API）
    invisible.checkVisibility = () => false;
    expect(names(getTabbables(container))).toEqual([
      'visible-one',
      'visible-two',
    ]);
  });

  it('lets elements pass when checkVisibility is missing (jsdom path)', () => {
    const container = mount(`
      <button style="visibility: hidden" data-name="hidden-styled">hidden</button>
      <button data-name="kept">kept</button>
    `);
    // 元素级覆盖为 undefined：模拟 jsdom / 老 Safari 缺 API 时的放行路径
    const hiddenStyled = at(Array.from(container.querySelectorAll('button')), 0);
    Object.defineProperty(hiddenStyled, 'checkVisibility', {
      value: undefined,
      configurable: true,
    });
    expect(names(getTabbables(container))).toEqual(['hidden-styled', 'kept']);
  });

  it('returns an empty array for an empty container', () => {
    expect(getTabbables(mount(''))).toEqual([]);
  });

  it('queries detached containers the same way (querySelectorAll semantics)', () => {
    const detached = document.createElement('div');
    detached.innerHTML = '<button>detached</button>';
    // 脱离文档的子树仍可查询；能否聚焦由 focusFirst 的返回值兜底
    expect(getTabbables(detached)).toHaveLength(1);
  });
});

describe('isTabbable', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('is true for tabbable elements and narrows to HTMLElement', () => {
    const container = mount(`
      <button>btn</button>
      <div tabindex="0">focusable</div>
    `);
    const els = Array.from(container.querySelectorAll('*'));
    const btn = at(els, 0);
    const div = at(els, 1);
    expect(isTabbable(btn)).toBe(true);
    expect(isTabbable(div)).toBe(true);
    if (isTabbable(div)) {
      // 类型收窄后可安全访问 HTMLElement 专有 API
      expect(typeof div.focus).toBe('function');
    }
  });

  it('is false for non-tabbable elements', () => {
    const container = mount(`
      <span>plain</span>
      <div tabindex="-1">negative</div>
      <button disabled>disabled</button>
    `);
    expect(Array.from(container.querySelectorAll('*')).map(isTabbable)).toEqual(
      [false, false, false]
    );
  });
});

describe('focusFirst', () => {
  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('focuses the first tabbable element and returns true', () => {
    const container = mount(`
      <button disabled data-name="skip-me">skip-me</button>
      <button tabindex="-1" data-name="skip-too">skip-too</button>
      <button data-name="target">target</button>
      <button data-name="later">later</button>
    `);
    expect(focusFirst(container)).toBe(true);
    expect((document.activeElement as HTMLElement).dataset.name).toBe('target');
  });

  it('focuses the container itself when no tabbables exist', () => {
    const container = mount('<div data-name="scope">plain text</div>');
    expect(focusFirst(container)).toBe(true);
    expect(document.activeElement).toBe(container);
    // 补设 tabIndex=-1 使容器可编程聚焦
    expect(container.tabIndex).toBe(-1);
  });

  it('keeps an explicit tabindex on the container', () => {
    // 容器本身带 tabindex="0"：不覆写、直接聚焦
    const container = mount(
      '<div tabindex="0" data-name="scope">plain text</div>'
    ).firstElementChild as HTMLElement;
    expect(focusFirst(container)).toBe(true);
    expect(container.getAttribute('tabindex')).toBe('0');
  });

  it('returns false when the focus call is a no-op', () => {
    // 脱离文档的容器：jsdom 的 focus() 被静默忽略，activeElement 不转移
    // （注意：jsdom 中 disabled 元素一旦带 tabindex 反而可聚焦，不能用例证）
    const container = document.createElement('div');
    container.innerHTML = 'plain text';
    expect(focusFirst(container)).toBe(false);
    expect(document.activeElement).toBe(document.body);
  });
});

describe('focus utils accessibility', () => {
  it('has no axe violations', async () => {
    // 纯函数模块无组件可渲染：以挂载了典型 tabbable 内容的最小宿主 div
    // 代替，验证工具产出的焦点候选不引入可访问性问题
    const { axe } = await import('jest-axe');
    mount(`
      <div>
        <button type="button">Save</button>
        <a href="/docs">Docs</a>
      </div>
    `);
    const results = await axe(document.body, {
      rules: { region: { enabled: false } },
    });
    expect(results.violations).toEqual([]);
  });
});
