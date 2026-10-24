import{i as e,t}from"./jsx-runtime-Cx0BB4qO.js";import{n}from"./classnames-DwgxuFP5.js";import{t as r}from"./CodeBlock-C2ywdVcy.js";import{i,t as a}from"./index-DTFmVJX0.js";import{r as o,s}from"./styles-DBn9Gwwz.js";var c=e(n(),1),l=t(),u=`haze-guide-content__gParagraph`,d=`haze-guide-content__gInlineCode`,f=`haze-guide-content__gCodeMargin`,p=`haze-guide-content__gNote`,m=`haze-guide-content__gCaption`,h=`haze-guide-content__gList`,g=`haze-guide-content__gTableWrap`,_=`haze-guide-content__gTable`,v=e=>({code:e}),y=e=>({strong:e}),b=e=>({em:e}),x=(e,t)=>({link:e,href:t}),S=e=>typeof e==`string`?[e]:e,C=e=>({type:`p`,text:e}),w=e=>({type:`note`,text:e}),T=(...e)=>({type:`list`,items:e}),E=(e,t)=>({type:`code`,language:e,code:t}),D=e=>({type:`caption`,text:e}),O=(e,t)=>({type:`table`,headers:e.map(S),rows:t.map(e=>e.map(S))}),k=e=>({type:`h3`,text:e}),A=e=>({type:`slot`,name:e}),j=(e,t,...n)=>({id:e,heading:t,blocks:n}),M=122,N=127,P=12,F=101,I=6,L=45,R=53,z=13,B={title:`Accessibility`,intro:[`Accessibility in haze-ui is a set of engineering contracts, not a checklist: every interactive component ships an axe scan in its unit tests, keyboard behavior runs against real browser engines, focus is trapped and restored by shared primitives, and all motion collapses to zero when the user opts out. This page states what the library guarantees and where each guarantee is enforced — every number below is measured from this repository.`],sections:[j(`verification-layers`,`Verification layers`,C([`Four layers, each covering what the previous one cannot. The unit layer vouches for ARIA markup and interaction logic; the e2e layers vouch for behavior on real engines.`]),O([`Layer`,`Tooling`,`Scope and contract`],[[`Unit (jsdom)`,[v(`jest-axe`)],`All ${M} component test files — every component directory ships at least one, and each file renders its component and asserts zero axe violations on the WCAG-tagged rules. The best-practice-only region rule is disabled because a test harness is not a real document. Lib-wide, form, RTL and floating-primitive suites bring the total to ${N} scanning files.`],[`E2E axe`,[v(`@axe-core/playwright`)],`The demo harness scanned with the WCAG tags (wcag2a through wcag22aa) in closed and open states: open Popover and dropdown-menu panels, a shown toast, and FormItem with and without a validation error — 5 scans. Open panels are where the aria wiring lives (aria-controls, aria-activedescendant, panel-internal roles), so panels are scanned, not just triggers.`],[`Real-engine behavior`,[v(`Playwright, 3 engines`)],`${P} spec files, ${F} tests on the chromium projects. The ${I} engine-sensitive specs — floating collision, popover, dialog, dropdown menu, rtl and keyboard-critical — run on chromium, firefox and webkit alike: real focus navigation, top-layer popover behavior and key dispatch are things jsdom cannot vouch for, so the same assertions must pass on every engine. A fourth project pins phone-viewport contracts (412×839, touch).`],[`Visual baselines`,[v(`Playwright screenshots`)],`${L} pixel baselines: 29 static component sections plus 16 interaction frames (open panels, a dark-theme dialog, RTL mirrors). Layout regressions and color/contrast drift move pixels; a 2% diff ratio absorbs only platform rasterization noise.`]])),j(`patterns`,`Component ARIA patterns`,C([`Interactive components map to `,x(`WAI-ARIA APG patterns`,`https://www.w3.org/WAI/ARIA/apg/patterns/`),`. Where the platform already provides the semantics — `,v(`details/summary`),`, `,v(`input[type=range]`),`, the native `,v(`dialog`),` element — the library uses the native element and adds ARIA only where native semantics stop. Fewer overrides means fewer ways to be wrong.`]),O([`Component`,`APG pattern`,`Keyboard behavior`],[[`Switch`,`Switch Pattern`,`Native button with role="switch" and aria-checked; Space/Enter toggle.`],[`Checkbox, Radio`,`Checkbox / Radio (native)`,`Native inputs wrapped in labels — native activation keys and grouping for free.`],[`Accordion, Disclosure`,`Disclosure (native details/summary)`,`Native summary activation; zero ARIA overrides needed — the platform already owns the semantics.`],[`Dialog, Drawer, BottomSheet, Image Preview, Command dialog, Tour`,`Dialog (Modal)`,`Native dialog element in the top layer; Esc cancels, Tab cycles inside the trapped scope, focus returns to the trigger on close, and the title is wired via aria-labelledby.`],[`Popover`,`Non-modal disclosure`,`popover=auto gives Esc and outside-pointer light dismissal; the trigger span carries an honest role="button".`],[`Dropdown Menu, Context Menu, Menu`,`Menu Button / Menu`,`Roving tabindex; arrows wrap skipping disabled items; Home/End jump; Escape and Tab close and return focus to the trigger; printable characters run typeahead (500 ms buffer); submenu arrows mirror under dir="rtl".`],[`Select`,`Listbox (Combobox when filterable)`,`Enter/Space toggle the panel; arrows highlight via aria-activedescendant; Enter picks; Escape closes; Home/End jump; typing filters; Backspace drops the last chip in multiple mode.`],[`Combobox`,`Combobox`,`Typing filters; ArrowDown/ArrowUp open the panel and move the highlight; Enter picks or toggles a chip; Backspace drops the last chip; Escape closes.`],[`Mentions, Prompt Input`,`Combobox (inline popup)`,`The textarea/input owns aria-activedescendant into the open listbox only — a closed listbox never owns it.`],[`Tree, Tree Select`,`Tree View`,`A single roving tab stop (tabindex 0/-1); arrows move, ArrowRight expands or descends, ArrowLeft collapses, Enter commits the selection.`],[`Tabs`,`Tabs Pattern`,`Left/Right arrows with selection following focus; Home/End jump to the ends; keys mirror under dir="rtl".`],[`Calendar`,`Grid (roving tabindex)`,`Arrows rove the day/month grid; PageUp/PageDown hop by month or year; Enter commits.`],[`Slider`,`Slider (native range)`,`Native input[type=range] — arrows, Home/End and page keys come from the platform.`],[`Rating`,`Radio group (roving)`,`Up/Down step the value (half steps with allowHalf); Left/Right mirror under dir="rtl"; Home/End jump; Space/Enter commit.`],[`Toolbar`,`Toolbar`,`Roving tabindex across its buttons and separators.`],[`Progress`,`Progressbar`,`role="progressbar" with aria-valuenow/min/max; non-interactive by design.`],[`Alert, Toast`,`Alert / Status`,`Danger toasts assert via role="alert"; everything else announces politely via role="status".`]])),j(`keyboard-conventions`,`Keyboard conventions`,C([`The contracts below are implemented once, as shared primitives, and consumed by every relevant component — so keyboard behavior cannot drift between components.`]),w([y(`Focus containment.`),` `,v(`useFocusScope`),` traps the Tab cycle inside a scope (document-level Tab interception plus a focusout pull-back), supports initial autofocus and restores focus to the trigger on close. It backs every modal — Dialog, Drawer, BottomSheet, Confirm Dialog, the Command dialog, Image Preview — and the menu family.`]),w([y(`Roving tabindex as machinery.`),` `,v(`useRovingTabindex`),` and `,v(`useMenuKeyboard`),` implement the APG roving contract a single time: one tab stop per container, main-axis arrows wrapping past disabled items, Home/End, typeahead, Escape/Tab-close with focus return, and orientation-aware keys that mirror under `,v(`dir="rtl"`),`. Tree, Tabs, Menu, the context/dropdown menus, Rating, Calendar, Toolbar, Command and Cascader all consume them.`]),w([y(`The keyboard open path.`),` Floating panels never open on pointer-driven focus: focus fires synchronously inside pointerdown, and a panel shown mid-gesture gets light-dismissed by the same click. Triggers toggle with Enter/Space, and panels open from the keyboard via ArrowDown or typing — Combobox enforces this with a regression test.`]),w([y(`Escape is universal.`),` The `,v(`popover=auto`),` attribute gives Esc and outside-click light dismissal to every floating panel, and fourteen components additionally handle Escape explicitly in their own keymaps (BottomSheet, Calendar, Cascader, Combobox, ConfirmDialog, the DataTable cell editor, FloatButton, InlineCompletion, InlineEdit, Mentions, Prompt Input, Select, Tour and Tree Select).`]),w([y(`Focus is visible.`),` ${R} component files style `,v(`:focus-visible`),` through the `,v(`--haze-color-focus-ring`),` token — an outline is never removed without a replacement.`])),j(`reduced-motion`,`Reduced motion`,C([`The `,v(`motion`),` token class declares `,v(`--haze-duration-fast/normal/slow`),` (120/200/300 ms) and the easing curves; every transition and enter/exit animation in the library resolves through them. Inside `,v(`@media (prefers-reduced-motion: reduce)`),` all three durations collapse to 0 ms, so token-driven motion completes within a single frame — easing is left untouched because it is irrelevant at 0 ms. Custom properties inherit, so the media query covers every descendant of the token class and re-evaluates live when the OS preference flips.`]),C([`The opt-in modal View Transitions (Dialog, Drawer, BottomSheet) skip `,v(`startViewTransition`),` entirely when the user prefers reduced motion or the engine lacks the API. `,`${z} e2e tests pin the contract: under `,v(`emulateMedia`),` reduce, every computed duration resolves to 0 s and stays non-zero under no-preference — including after a live preference flip without a reload.`])),j(`unit-limits`,`What unit tests cannot vouch for`,C([`jsdom has no layout engine, no top layer and no real focus navigation — a unit suite can assert that the right attributes exist, not that a Tab keypress actually moves focus or that a popover survives engine-specific light-dismiss quirks. That is precisely the split this repo makes: jsdom vouches for ARIA markup and logic; the ${I} engine-sensitive e2e specs vouch for real focus movement, top-layer behavior, key dispatch and collision containment on chromium, firefox and webkit; pixel baselines (chromium only) vouch for visual regressions.`]),C([`WCAG-tagged axe rules run at both the unit and e2e layers. The guarantee is scoped to what those rules and specs cover: full WCAG conformance of your application also depends on your content, labels and page structure.`]))]},V={title:`无障碍`,intro:[`haze-ui 的无障碍是一组工程契约，而不是一份检查清单：每个交互组件的单测都内置 axe 扫描，键盘行为在真实浏览器引擎上验证，焦点由共享原语负责困住与恢复，用户选择减少动效时所有动画一律归零。本页说明库承诺了什么、每条承诺在哪里被强制执行——下方所有数字均实测自本仓库。`],sections:[j(`verification-layers`,`验证层级`,C([`四层验证，每层覆盖上一层无法覆盖的部分。单测层为 ARIA 标记与交互逻辑背书；e2e 层为真实引擎上的行为背书。`]),O([`层级`,`工具`,`范围与契约`],[[`Unit (jsdom)`,[v(`jest-axe`)],`全部 ${M} 个组件测试文件——每个组件目录至少自带一个，每个文件都会渲染其组件并断言 WCAG 标记规则下 axe 违规为零。仅限 best-practice 的 region 规则被禁用，因为测试画布不是真实文档。全库、表单、RTL 与浮层原语套件使扫描文件总数达到 ${N} 个。`],[`E2E axe`,[v(`@axe-core/playwright`)],`以 WCAG 标签（wcag2a 到 wcag22aa）在关闭与打开两种状态下扫描演示站：打开的 Popover 与 dropdown-menu 面板、一条已显示的 toast、带与不带校验错误的 FormItem——共 5 次扫描。aria 接线（aria-controls、aria-activedescendant、面板内部 role）都在打开的面板里，所以扫描的是面板而不只是触发器。`],[`Real-engine behavior`,[v(`Playwright, 3 engines`)],`${P} 个 spec 文件，chromium 项目上 ${F} 个测试。${I} 个引擎敏感 spec——浮动碰撞、popover、dialog、dropdown menu、rtl 与键盘关键路径——在 chromium、firefox 和 webkit 上一致运行：真实焦点导航、顶层 popover 行为与按键派发是 jsdom 无法背书的，因此同样的断言必须在每个引擎上通过。第四个项目钉住手机视口契约（412×839、触摸）。`],[`Visual baselines`,[v(`Playwright screenshots`)],`${L} 张像素基线：29 个静态组件区块加 16 个交互帧（打开的面板、暗色主题 dialog、RTL 镜像）。布局回归与颜色/对比度漂移都会移动像素；2% 的差异比只吸收平台光栅化噪声。`]])),j(`patterns`,`组件 ARIA 模式`,C([`交互组件映射到 `,x(`WAI-ARIA APG patterns`,`https://www.w3.org/WAI/ARIA/apg/patterns/`),`。凡是平台已提供语义的地方——`,v(`details/summary`),`、`,v(`input[type=range]`),`、原生 `,v(`dialog`),` 元素——库就使用原生元素，只在原生语义止步处补充 ARIA。更少的覆盖意味着更少的出错方式。`]),O([`组件`,`APG 模式`,`键盘行为`],[[`Switch`,`Switch Pattern`,`原生 button，带 role="switch" 与 aria-checked；Space/Enter 切换。`],[`Checkbox, Radio`,`Checkbox / Radio (native)`,`原生 input 包裹在 label 中——原生活化键与分组免费获得。`],[`Accordion, Disclosure`,`Disclosure (native details/summary)`,`原生 summary 活化；零 ARIA 覆盖——平台已经拥有这些语义。`],[`Dialog, Drawer, BottomSheet, Image Preview, Command dialog, Tour`,`Dialog (Modal)`,`顶层中的原生 dialog 元素；Esc 取消，Tab 在被困焦点域内循环，关闭时焦点返回触发器，标题经 aria-labelledby 接线。`],[`Popover`,`Non-modal disclosure`,`popover=auto 提供 Esc 与指针外按的轻量关闭；触发器 span 诚实地携带 role="button"。`],[`Dropdown Menu, Context Menu, Menu`,`Menu Button / Menu`,`Roving tabindex；方向键环绕并跳过禁用项；Home/End 跳转；Escape 与 Tab 关闭并把焦点还给触发器；可打印字符运行 typeahead（500 ms 缓冲）；子菜单方向键在 dir="rtl" 下镜像。`],[`Select`,`Listbox (Combobox when filterable)`,`Enter/Space 开关面板；方向键经 aria-activedescendant 高亮；Enter 选中；Escape 关闭；Home/End 跳转；输入即过滤；多选模式下 Backspace 删除最后一个 chip。`],[`Combobox`,`Combobox`,`输入即过滤；ArrowDown/ArrowUp 打开面板并移动高亮；Enter 选中或切换 chip；Backspace 删除最后一个 chip；Escape 关闭。`],[`Mentions, Prompt Input`,`Combobox (inline popup)`,`textarea/input 只在 listbox 打开时持有 aria-activedescendant——关闭的 listbox 永不持有。`],[`Tree, Tree Select`,`Tree View`,`单一 roving tab 停靠点（tabindex 0/-1）；方向键移动，ArrowRight 展开或下潜，ArrowLeft 折叠，Enter 提交选择。`],[`Tabs`,`Tabs Pattern`,`Left/Right 方向键、选择跟随焦点；Home/End 跳到两端；按键在 dir="rtl" 下镜像。`],[`Calendar`,`Grid (roving tabindex)`,`方向键在日/月网格中漫游；PageUp/PageDown 按月或年跳转；Enter 提交。`],[`Slider`,`Slider (native range)`,`原生 input[type=range]——方向键、Home/End 与 page 键来自平台。`],[`Rating`,`Radio group (roving)`,`Up/Down 步进值（allowHalf 时半步）；Left/Right 在 dir="rtl" 下镜像；Home/End 跳转；Space/Enter 提交。`],[`Toolbar`,`Toolbar`,`在其按钮与分隔符之间使用 roving tabindex。`],[`Progress`,`Progressbar`,`role="progressbar" 配 aria-valuenow/min/max；设计上不可交互。`],[`Alert, Toast`,`Alert / Status`,`危险 toast 经 role="alert" 断言播报；其余经 role="status" 礼貌播报。`]])),j(`keyboard-conventions`,`键盘约定`,C([`下列契约只实现一次——作为共享原语——被所有相关组件消费，因此键盘行为不会在组件之间漂移。`]),w([y(`焦点困限。`),` `,v(`useFocusScope`),` 把 Tab 循环困在作用域内（document 级 Tab 拦截加 focusout 拉回），支持初始 autofocus，关闭时把焦点还给触发器。它支撑每一个模态——Dialog、Drawer、BottomSheet、Confirm Dialog、Command dialog、Image Preview——以及菜单家族。`]),w([y(`Roving tabindex 作为机制。`),` `,v(`useRovingTabindex`),` 与 `,v(`useMenuKeyboard`),` 只实现一次 APG roving 契约：每个容器一个 tab 停靠点、主轴方向键环绕并跳过禁用项、Home/End、typeahead、Escape/Tab 关闭并返还焦点、方向键在 `,v(`dir="rtl"`),` 下镜像。Tree、Tabs、Menu、context/dropdown 菜单、Rating、Calendar、Toolbar、Command 与 Cascader 都在消费它们。`]),w([y(`键盘打开路径。`),` 浮层面板绝不因指针驱动的聚焦而打开：focus 在 pointerdown 内同步触发，手势中途显示的面板会被同一次点击轻量关闭。触发器用 Enter/Space 切换，面板经 ArrowDown 或输入从键盘打开——Combobox 用一条回归测试强制这一点。`]),w([y(`Escape 是通用的。`),` `,v(`popover=auto`),` 属性为每个浮层面板提供 Esc 与外击轻量关闭，另有十四个组件在自己的键位表里显式处理 Escape（BottomSheet、Calendar、Cascader、Combobox、ConfirmDialog、DataTable 单元格编辑器、FloatButton、InlineCompletion、InlineEdit、Mentions、Prompt Input、Select、Tour 与 Tree Select）。`]),w([y(`焦点可见。`),` ${R} 个组件文件通过 `,v(`--haze-color-focus-ring`),` token 为 `,v(`:focus-visible`),` 设定样式——outline 从不会被移除而不提供替代。`])),j(`reduced-motion`,`减少动效`,C([v(`motion`),` token 类声明 `,v(`--haze-duration-fast/normal/slow`),`（120/200/300 ms）与缓动曲线；库中每个过渡与进出场动画都经由它们解析。在 `,v(`@media (prefers-reduced-motion: reduce)`),` 内，三个时长一律塌缩为 0 ms，token 驱动的动效在一帧内完成——缓动保持不动，因为在 0 ms 时无关紧要。自定义属性可继承，因此该媒体查询覆盖 token 类的每个后代，并在系统偏好切换时实时重新求值。`]),C([`可选开启的模态 View Transitions（Dialog、Drawer、BottomSheet）在用户偏好减少动效或引擎缺少该 API 时完全跳过 `,v(`startViewTransition`),`。${z} 条 e2e 测试钉住该契约：在 `,v(`emulateMedia`),` reduce 下，每个计算时长都解析为 0 s，而在无偏好下保持非零——包括不重载的情况下实时切换偏好之后。`])),j(`unit-limits`,`单测无法背书的部分`,C([`jsdom 没有布局引擎、没有顶层、也没有真实焦点导航——单测套件能断言正确的属性存在，却不能断言 Tab 按键真的移动了焦点、或 popover 能在各引擎特有的轻量关闭怪癖下幸存。这正是本仓库的分工：jsdom 为 ARIA 标记与逻辑背书；${I} 条引擎敏感 e2e spec 为 chromium、firefox 与 webkit 上的真实焦点移动、顶层行为、按键派发与碰撞包含背书；像素基线（仅 chromium）为视觉回归背书。`]),C([`带 WCAG 标签的 axe 规则在单测与 e2e 两层都运行。该保证的范围以这些规则与 spec 覆盖的为准：你的应用要完全符合 WCAG，还取决于你的内容、标签与页面结构。`]))]},H={title:`Keyboard & ARIA contracts`,intro:[`Every interactive component in Haze UI pins its accessibility surface in its own test suite: the roles it renders, the `,v(`aria-*`),` attributes it asserts, and the keys it handles. This page is a generated view of those suites — `,v(`scripts/generate-a11y-contracts.mjs`),` extracts each table row from the component’s co-located tests, so the contract shown here can never drift from the contract that is actually enforced. An empty cell (—) means the suite does not pin that facet yet, not that the component lacks it; the tests remain the source of truth.`],sections:[],ui:{filterPlaceholder:`Filter by component, role, aria attribute or key…`,filterLabel:`Filter contracts`,countTemplate:`{matched} / {total} components`,extractedTemplate:`extracted {date} · {tests} tests`,noMatchTemplate:`No components match “{query}”.`,headerComponent:`Component`,headerRoles:`Roles`,headerAria:`ARIA attributes`,headerKeys:`Keys`,headerTests:`Tests`}},U={title:`键盘与 ARIA 契约`,intro:[`Haze UI 的每个交互组件都在自己的测试套件里钉住其无障碍面：渲染的 role、断言的 `,v(`aria-*`),` 属性、处理的按键。本页是这些套件的生成视图——`,v(`scripts/generate-a11y-contracts.mjs`),` 从组件的同址测试中提取每一行，因此这里展示的契约永远不会与实际强制的契约漂移。空单元格（—）表示该套件尚未钉住这一面，而不是组件缺少该行为；测试始终是真值来源。`],sections:[],ui:{filterPlaceholder:`按组件、role、aria 属性或按键过滤…`,filterLabel:`过滤契约`,countTemplate:`{matched} / {total} 个组件`,extractedTemplate:`提取于 {date} · {tests} 条测试`,noMatchTemplate:`没有组件匹配「{query}」。`,headerComponent:`组件`,headerRoles:`Role`,headerAria:`ARIA 属性`,headerKeys:`按键`,headerTests:`测试`}},W={title:`Dark mode`,intro:[`Every haze-ui color is a `,v(`--haze-*`),` custom property defined by one of two theme classes — `,v(`lightTheme`),` / `,v(`darkTheme`),`. Dark mode is therefore just “which class is on the container”: put `,v(`darkTheme`),` on `,v(`<html>`),` for the app, on any subtree for a dark island, or let `,v(`useDarkMode`),` manage it with persistence and system-preference following.`],sections:[j(`theme-classes`,`The theme classes`,C([`The classes are plain strings exported from the package. They work on any element, compose with your own class names, and cascade — a nested `,v(`lightTheme`),` inside a dark page is a light island. Both cards below are rendered by the same components; only the container's class differs:`]),E(`tsx`,`import { lightTheme, darkTheme, spacing, typography } from 'haze-ui';
// app root — one class flips the whole tree
<div className={\`\${darkTheme} \${spacing} \${typography}\`}>
  <App />
</div>
// or a dark island inside a light page — nesting wins by proximity
<div className={darkTheme}>
  <Card>…</Card>
</div>`),A(`theme-islands`),w([`Because theme classes carry `,b(`token definitions`),`, not styles, they never fight your CSS: your rules keep their specificity, they just re-resolve `,v(`var(--haze-*)`),` references inside the subtree. Inheriting custom properties from a dark ancestor is exactly how the islands above work with zero per-component dark-mode code.`])),j(`auto-theme`,`autoTheme — zero-JS system following`,C([`When you do not need a toggle at all, `,v(`autoTheme`),` collapses the two classes into one: it carries the complete light token set and re-declares the complete dark set inside a `,v(`prefers-color-scheme: dark`),` media block, so the container follows the OS appearance with zero JavaScript — no hydration wait, no flash, no storage:`]),E(`tsx`,`import { autoTheme, spacing, typography } from 'haze-ui';
// <html> follows the OS color scheme — resolves before any JS loads
<html className={\`\${autoTheme} \${spacing} \${typography}\`}>
  <body>…</body>
</html>
// scoped works the same way — a system-following island
<div className={autoTheme}>…</div>`),A(`auto-theme`),D([`Flip your OS appearance — this island follows live, with no JS behind it. The two islands above are static; only this one tracks the system.`]),w([`The media block re-declares every custom property on the same class, so the relative-color interaction states re-derive inside it — and the eager-resolution caveat carries over unchanged: override `,v(`--haze-color-primary`),` on the element that carries `,v(`autoTheme`),`, not on a bare descendant. It is still one theme class: when `,v(`useDarkMode`),` or next-themes later takes over the switch, they `,y(`replace`),` it with `,v(`lightTheme`),`/`,v(`darkTheme`),` (a class swap — never stack them on the same element).`])),j(`brand-presets`,`Brand presets`,C([`Five preset brand themes ship alongside the default blue: `,v(`violetTheme`),`, `,v(`tealTheme`),`, `,v(`cyanTheme`),`, `,v(`orangeTheme`),` and `,v(`roseTheme`),`, each exposing a `,v(`light`),` and a `,v(`dark`),` class. A brand class is a `,y(`complete replacement`),` for `,v(`lightTheme`),`/`,v(`darkTheme`),` — never stack the two on the same element. Primary, info and focus-ring re-resolve to the brand's scale; neutrals and success/warning/danger stay put:`]),E(`tsx`,"import { violetTheme, spacing, typography } from 'haze-ui';\n// violetTheme.light REPLACES lightTheme — it carries the full token set\n// (primitive scales + semantic aliases + interaction states)\n<div className={`${violetTheme.light} ${spacing} ${typography}`}>\n  <App />\n</div>\n// dark works the same way against darkTheme\n<div className={`${violetTheme.dark} ${spacing} ${typography}`}>\n  <App />\n</div>"),w([`Why replacement instead of an overlay: a brand class and `,v(`lightTheme`),` would declare the same custom properties at the same specificity, leaving the winner to stylesheet emission order. Custom-property overrides must land on the very element that declares them — so the brand classes restate the entire theme (every token the default themes carry) rather than shipping a diff that only works when stacked.`])),j(`runtime-brand`,`Custom brand themes at runtime`,C([`When none of the presets match, `,v(`createBrandTheme`),` builds the same complete theme from your own seed color — one hex for light mode, an optional second for dark. It runs the preset pipeline (primitive 12-step scales, primary/info/focus-ring rerouting, relative-color interaction states), so the result is indistinguishable from a shipped preset:`]),E(`tsx`,`import { createBrandTheme } from 'haze-ui/tokens';
const brand = createBrandTheme({
  name: 'acme',        // → --haze-acme-1…12 (lowercase kebab)
  light: '#0066ff',    // light-mode primary seed
  // dark: '#0a3d99',  // optional — derived from light (oklch l +0.2) if omitted
  // overrides: {light: {10: '#…'}, dark: {8: '#…'}},  // pin extra anchors
});
// bare declaration blocks — wrap them in classes once:
const style = document.createElement('style');
style.textContent = \`.acme-light { \\\${brand.light} }\\n.acme-dark { \\\${brand.dark} }\`;
document.head.append(style);`),A(`runtime-brand`),D([`Try `,v(`'#0066ff'`),`, `,v(`'#0f766e'`),` or `,v(`'#c2410c'`),` — the hover, active and subtle states re-resolve with it because they are CSS relative-color formulas over the generated primitives.`]),w([`Two rules carry over from the presets: the blocks are `,y(`replacements`),` for `,v(`lightTheme`),`/`,v(`darkTheme`),` (never stack), and you own contrast — pick a light-mode seed dark enough for white text (the presets’ step-9 anchors sit near Tailwind’s 600/700 range for exactly that reason).`]),C([`Outside React, the `,v(`haze-ui-theme`),` CLI emits the identical CSS as a file — handy for design handoff or static sites. Brand presets are also exported as W3C design-token JSON via `,v(`haze-ui/design-tokens/{brand}/{mode}.json`),`.`]),E(`bash`,`npx haze-ui-theme --primary '#0066ff' --name acme --out acme-theme.css
# → .haze-acme-light / .haze-acme-dark classes, complete token set`)),j(`use-dark-mode`,`useDarkMode — persistence & system following`,C([v(`useDarkMode`),` is the stateful half: it persists the chosen mode to `,v(`localStorage`),` (cross-tab synced via the `,v(`storage`),` event), resolves `,v(`mode === 'system'`),` against `,v(`prefers-color-scheme`),` live, and toggles the right theme class on a target element — `,v(`document.documentElement`),` by default, or any element/ref for a scoped container. The card below runs scoped, with its own storage key:`]),A(`scoped-demo`),D([`Flip your OS appearance while `,v(`System`),` is active — the card follows live. Any explicit choice (Light, Dark, or the toggle) pins the card and stops the following until you pick `,v(`System`),` again.`]),C([`The full return value and options:`]),E(`tsx`,`import { useDarkMode } from 'haze-ui';
const [isDark, setIsDark, mode, setMode] = useDarkMode({
  storageKey: 'my-app-color-mode', // default 'haze-ui-color-mode'
  defaultMode: 'system',           // 'light' | 'dark' | 'system' (default 'system')
  target: rootRef,                 // element or ref; default document.documentElement
});
setMode('system');           // follow the OS preference again
setIsDark(true);             // shorthand for setMode('dark')
setIsDark((prev) => !prev);  // functional — flips the current resolution`),C([`Call it once near the root of the app and pass the values down (or through your own context) — the class toggling is idempotent, so a second call site is harmless, but one owner keeps the mode single sourced. Two behaviors are deliberate:`]),T([y(`Unmounting never removes the class.`),` A theme is a page-level fact — stripping `,v(`darkTheme`),` on unmount would flash the page white.`],[y(`SSR-safe by construction.`),` Nothing touches `,v(`document`),` during render and the effect only runs on the client, so server HTML and the first client render agree. The class lands right after hydration; if you need it before first paint in a plain SPA, add a tiny inline script in `,v(`index.html`),` that reads the storage key — the Next.js section below shows the framework-managed equivalent.`]),k(`Mode persistence compared`),O([`mode`,`persisted value`,`resolved isDark`,`follows OS changes`],[[[v(`'light'`)],[v(`'light'`)],[v(`false`),` — always`],[`No`]],[[v(`'dark'`)],[v(`'dark'`)],[v(`true`),` — always`],[`No`]],[[v(`'system'`)],[v(`'system'`),` (the choice, not the resolution)`],[v(`matchMedia('(prefers-color-scheme: dark)')`)],[`Yes — live, via the matchMedia listener (no reload needed)`]]]),C([`Note the third row stores the `,b(`choice`),`, not the resolved value: a user on 'system' whose OS is light now will still get dark automatically when the OS switches. Any explicit `,v(`setIsDark(…)`),` or `,v(`setMode('light' | 'dark')`),` pins the mode and stops the following until `,v(`setMode('system')`),` re-enables it — mirroring the Light/Dark/Auto pattern in this site's own header.`])),j(`next-themes`,`Interoperating with next-themes`,C([`next-themes stays the theme owner; haze only needs the right token class on an ancestor. The classes are build-time strings, so hand them to next-themes directly and it writes exactly these class names on `,v(`<html>`),` — no sync effect, no flash handling of your own:`]),E(`tsx`,`// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      enableSystem
      // maps next-themes' resolved names onto haze's token classes;
      // suppressHydrationWarning on <html> stays recommended by next-themes
      value={{ light: lightTheme, dark: darkTheme }}
    >
      {children}
    </ThemeProvider>
  );
}`),C([`Already locked into a provider config you cannot change? A small sync effect does the same job — it reads `,v(`resolvedTheme`),` (never `,v(`theme`),`, which can be `,v(`'system'`),`) and mirrors it onto the class list:`]),E(`tsx`,`// app/haze-theme-sync.tsx
'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';
export function HazeThemeSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(lightTheme, resolvedTheme !== 'dark');
    root.classList.toggle(darkTheme, resolvedTheme === 'dark');
  }, [resolvedTheme]);
  return null;
}`),w([`Pick `,y(`one`),` writer for the theme classes. When next-themes (or any manager) owns them, do not also mount `,v(`useDarkMode`),` — two writers on the same class list fight, and persistence belongs to whoever owns the switch (next-themes' own `,v(`storageKey`),` in that setup). Tailwind's `,v(`dark:`),` variants coexist fine: next-themes can write both a `,v(`dark`),` utility class and haze's token classes if you list them together in `,v(`value`),`.`]))],ui:{islandLightTitle:`lightTheme (page default)`,islandLightText:`Tokens resolve to the light palette everywhere inside.`,islandDarkTitle:`darkTheme`,islandDarkText:`One class on the container — every descendant re-resolves.`,autoIslandTitle:`autoTheme (follows your OS)`,autoIslandText:`One class, both palettes — the media query picks. No JS.`,runtimeIslandLightText:`Generated at runtime from the seed above.`,runtimeIslandDarkText:`Derived dark: same hue, lifted lightness.`,runtimeValidHint:`dark mode derived automatically (oklch l +0.2)`,runtimeInvalidHint:`enter a #rgb or #rrggbb hex`}},G={title:`深色模式`,intro:[`haze-ui 的每种颜色都是一个 `,v(`--haze-*`),` 自定义属性，由两个主题类之一定义——`,v(`lightTheme`),` / `,v(`darkTheme`),`。因此深色模式只是「容器上挂的是哪个类」：把 `,v(`darkTheme`),` 挂在应用的 `,v(`<html>`),` 上，挂在任意子树上得到一块深色孤岛，或交给 `,v(`useDarkMode`),` 管理——自带持久化与系统偏好跟随。`],sections:[j(`theme-classes`,`两个主题类`,C([`这些类是从包里导出的普通字符串。它们可用于任意元素、与你的类名组合、并参与层叠——深色页面里嵌套的 `,v(`lightTheme`),` 就是一块浅色孤岛。下面两张卡片由相同的组件渲染；只有容器的类不同：`]),E(`tsx`,`import { lightTheme, darkTheme, spacing, typography } from 'haze-ui';
// app root — one class flips the whole tree
<div className={\`\${darkTheme} \${spacing} \${typography}\`}>
  <App />
</div>
// or a dark island inside a light page — nesting wins by proximity
<div className={darkTheme}>
  <Card>…</Card>
</div>`),A(`theme-islands`),w([`由于主题类承载的是`,b(`token 定义`),`而非样式，它们绝不与你的 CSS 打架：你的规则保持其特异性，只是在子树内重新解析 `,v(`var(--haze-*)`),` 引用。从深色祖先继承自定义属性，正是上面的孤岛零逐组件深色模式代码的运作方式。`])),j(`auto-theme`,`autoTheme——零 JS 系统跟随`,C([`当你完全不需要开关时，`,v(`autoTheme`),` 把两个类合而为一：它携带完整的浅色 token 集，并在 `,v(`prefers-color-scheme: dark`),` 媒体块里重新声明完整的深色集，容器因此以零 JavaScript 跟随系统外观——不等 hydration、不闪白、无存储：`]),E(`tsx`,`import { autoTheme, spacing, typography } from 'haze-ui';
// <html> follows the OS color scheme — resolves before any JS loads
<html className={\`\${autoTheme} \${spacing} \${typography}\`}>
  <body>…</body>
</html>
// scoped works the same way — a system-following island
<div className={autoTheme}>…</div>`),A(`auto-theme`),D([`切换你的系统外观——这座孤岛实时跟随，背后没有任何 JS。上面的两座孤岛是静态的，只有这座追踪系统。`]),w([`媒体块在同一个类上重新声明每个自定义属性，相对色交互态随之在块内重新派生——急切解析的注意事项原样沿用：覆盖 `,v(`--haze-color-primary`),` 要落在携带 `,v(`autoTheme`),` 的那个元素上，而不是裸后代。它仍然是一个主题类：当 `,v(`useDarkMode`),` 或 next-themes 之后接管切换时，它们会用 `,v(`lightTheme`),`/`,v(`darkTheme`),` `,y(`替换`),`它（类互换——绝不在同一元素上叠加）。`])),j(`brand-presets`,`品牌预设`,C([`五个预设品牌主题随默认蓝色一同发布：`,v(`violetTheme`),`、`,v(`tealTheme`),`、`,v(`cyanTheme`),`、`,v(`orangeTheme`),` 与 `,v(`roseTheme`),`，各自暴露 `,v(`light`),` 与 `,v(`dark`),` 两个类。品牌类是 `,v(`lightTheme`),`/`,v(`darkTheme`),` 的`,y(`完整替代`),`——绝不在同一元素上叠加两者。Primary、info 与 focus-ring 重新解析到品牌色阶；中性色与 success/warning/danger 保持不变：`]),E(`tsx`,"import { violetTheme, spacing, typography } from 'haze-ui';\n// violetTheme.light REPLACES lightTheme — it carries the full token set\n// (primitive scales + semantic aliases + interaction states)\n<div className={`${violetTheme.light} ${spacing} ${typography}`}>\n  <App />\n</div>\n// dark works the same way against darkTheme\n<div className={`${violetTheme.dark} ${spacing} ${typography}`}>\n  <App />\n</div>"),w([`为什么是整体替代而非叠加：品牌类与 `,v(`lightTheme`),` 会在相同特异性上声明相同的自定义属性，胜负交给样式表发射顺序。自定义属性覆盖必须落在声明它的那个元素上——因此品牌类重述整个主题（默认主题携带的每个 token），而不是发布一份只在叠加时才生效的差量。`])),j(`runtime-brand`,`运行时自定义品牌主题`,C([`当预设都不匹配时，`,v(`createBrandTheme`),` 用你自己的种子色构建同样的完整主题——浅色模式一个 hex，深色可选第二个。它运行与预设相同的流水线（原语 12 档色阶、primary/info/focus-ring 重路由、相对色交互态），因此结果与已发布的预设无从区分：`]),E(`tsx`,`import { createBrandTheme } from 'haze-ui/tokens';
const brand = createBrandTheme({
  name: 'acme',        // → --haze-acme-1…12 (lowercase kebab)
  light: '#0066ff',    // light-mode primary seed
  // dark: '#0a3d99',  // optional — derived from light (oklch l +0.2) if omitted
  // overrides: {light: {10: '#…'}, dark: {8: '#…'}},  // pin extra anchors
});
// bare declaration blocks — wrap them in classes once:
const style = document.createElement('style');
style.textContent = \`.acme-light { \\\${brand.light} }\\n.acme-dark { \\\${brand.dark} }\`;
document.head.append(style);`),A(`runtime-brand`),D([`试试 `,v(`'#0066ff'`),`、`,v(`'#0f766e'`),` 或 `,v(`'#c2410c'`),`——hover、active 与 subtle 状态随之一并重新解析，因为它们是构建在生成原语之上的 CSS 相对色公式。`]),w([`两条规则从预设延续而来：这些声明块是 `,v(`lightTheme`),`/`,v(`darkTheme`),` 的`,y(`替代品`),`（绝不叠加），且对比度由你负责——选一个足够深、能承载白字的浅色模式种子（预设的 step-9 锚点恰因这个原因落在 Tailwind 的 600/700 区间附近）。`]),C([`在 React 之外，`,v(`haze-ui-theme`),` CLI 把相同的 CSS 输出为文件——适合设计交接或静态站点。品牌预设还以 W3C design-token JSON 形式经 `,v(`haze-ui/design-tokens/{brand}/{mode}.json`),` 导出。`]),E(`bash`,`npx haze-ui-theme --primary '#0066ff' --name acme --out acme-theme.css
# → .haze-acme-light / .haze-acme-dark classes, complete token set`)),j(`use-dark-mode`,`useDarkMode——持久化与系统跟随`,C([v(`useDarkMode`),` 是有状态的那一半：它把选择的模式持久化到 `,v(`localStorage`),`（经 `,v(`storage`),` 事件跨标签页同步），把 `,v(`mode === 'system'`),` 对照 `,v(`prefers-color-scheme`),` 实时解析，并在目标元素上切换正确的主题类——默认 `,v(`document.documentElement`),`，或任意元素/ref 作为作用域容器。下面的卡片以作用域模式运行，有自己的存储键：`]),A(`scoped-demo`),D([`在 `,v(`System`),` 激活时切换你的系统外观——卡片会实时跟随。任何显式选择（Light、Dark 或切换按钮）都会钉住卡片并停止跟随，直到你重新选择 `,v(`System`),`。`]),C([`完整的返回值与选项：`]),E(`tsx`,`import { useDarkMode } from 'haze-ui';
const [isDark, setIsDark, mode, setMode] = useDarkMode({
  storageKey: 'my-app-color-mode', // default 'haze-ui-color-mode'
  defaultMode: 'system',           // 'light' | 'dark' | 'system' (default 'system')
  target: rootRef,                 // element or ref; default document.documentElement
});
setMode('system');           // follow the OS preference again
setIsDark(true);             // shorthand for setMode('dark')
setIsDark((prev) => !prev);  // functional — flips the current resolution`),C([`在应用根部附近调用一次并把值向下传递（或经由你自己的 context）——类切换是幂等的，第二个调用点无害，但单一 owner 让模式保持单一来源。有两个行为是刻意的：`]),T([y(`卸载绝不移除类。`),`主题是页面级事实——卸载时剥掉 `,v(`darkTheme`),` 会让页面白闪。`],[y(`构造上 SSR 安全。`),`渲染期间不碰 `,v(`document`),`，effect 只在客户端运行，因此服务端 HTML 与首次客户端渲染一致。类在 hydration 之后立即落位；若在纯 SPA 中需要它在首绘之前，可在 `,v(`index.html`),` 里加一段读取存储键的内联脚本——下文的 Next.js 小节展示框架托管的等价做法。`]),k(`模式持久化对比`),O([`模式`,`持久化值`,`解析出的 isDark`,`跟随系统变化`],[[[v(`'light'`)],[v(`'light'`)],[v(`false`),` —— 恒定`],[`否`]],[[v(`'dark'`)],[v(`'dark'`)],[v(`true`),` —— 恒定`],[`否`]],[[v(`'system'`)],[v(`'system'`),`（存的是选择，不是解析结果）`],[v(`matchMedia('(prefers-color-scheme: dark)')`)],[`是——实时，经 matchMedia 监听器（无需重载）`]]]),C([`注意第三行存的是`,b(`选择`),`而非解析结果：现在系统为浅色的 ‘system’ 用户，在系统切换时仍会自动得到深色。任何显式的 `,v(`setIsDark(…)`),` 或 `,v(`setMode('light' | 'dark')`),` 都会钉住模式并停止跟随，直到 `,v(`setMode('system')`),` 重新启用——与本站页眉的 Light/Dark/Auto 模式如出一辙。`])),j(`next-themes`,`与 next-themes 互操作`,C([`next-themes 仍是主题 owner；haze 只需在某个祖先上挂对 token 类。这些类是构建期字符串，直接交给 next-themes，它就会在 `,v(`<html>`),` 上写入恰好这些类名——不需要同步 effect，也不需要你自己处理闪白：`]),E(`tsx`,`// app/providers.tsx
'use client';
import { ThemeProvider } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute='class'
      enableSystem
      // maps next-themes' resolved names onto haze's token classes;
      // suppressHydrationWarning on <html> stays recommended by next-themes
      value={{ light: lightTheme, dark: darkTheme }}
    >
      {children}
    </ThemeProvider>
  );
}`),C([`已经锁死在无法更改的 provider 配置里？一个小的同步 effect 也能胜任——它读取 `,v(`resolvedTheme`),`（绝不读 `,v(`theme`),`，它可能是 `,v(`'system'`),`）并镜像到类列表：`]),E(`tsx`,`// app/haze-theme-sync.tsx
'use client';
import { useEffect } from 'react';
import { useTheme } from 'next-themes';
import { darkTheme, lightTheme } from 'haze-ui';
export function HazeThemeSync() {
  const { resolvedTheme } = useTheme();
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle(lightTheme, resolvedTheme !== 'dark');
    root.classList.toggle(darkTheme, resolvedTheme === 'dark');
  }, [resolvedTheme]);
  return null;
}`),w([`为主题类选定`,y(`唯一`),`写入者。当 next-themes（或任何管理器）拥有它们时，就不要再挂 `,v(`useDarkMode`),`——同一类列表上的两个写入者会打架，持久化属于开关的 owner（该配置下是 next-themes 自己的 `,v(`storageKey`),`）。Tailwind 的 `,v(`dark:`),` 变体可以共存：只要在 `,v(`value`),` 里把它们列在一起，next-themes 可以同时写入 `,v(`dark`),` 工具类与 haze 的 token 类。`]))],ui:{islandLightTitle:`lightTheme（页面默认）`,islandLightText:`内部所有 token 都解析为浅色色板。`,islandDarkTitle:`darkTheme`,islandDarkText:`容器上一个类——所有后代重新解析。`,autoIslandTitle:`autoTheme（跟随你的系统）`,autoIslandText:`一个类、两套色板——由媒体查询选择。无 JS。`,runtimeIslandLightText:`在运行时由上面的种子生成。`,runtimeIslandDarkText:`派生的深色：同色相、提升亮度。`,runtimeValidHint:`深色模式自动派生（oklch l +0.2）`,runtimeInvalidHint:`请输入 #rgb 或 #rrggbb 十六进制值`}},K={title:`Density (compact)`,intro:[`haze-ui's spacing scale is a set of `,v(`--haze-space-*`),` custom properties declared by the `,v(`spacing`),` class. Density is a second dimension on top: `,v(`compact`),` shrinks the whole scale to 75% — denser paddings, tighter rows, smaller panels — with zero per-component code. Add one class next to your token classes and every component re-resolves.`],sections:[j(`compact-scale`,`The compact scale`,C([`Every step of the default scale is on a 4px grid, so 75% of each step lands on an exact pixel — no fractional values, nothing rounds. The zero step has no compact form: zero is zero at any density. Radius, shadow and typography are deliberately not density-scaled — `,v(`compact`),` answers the spacing indirection only.`]),A(`scale-table`)),j(`using-compact`,`Using compact`,C([`Put `,v(`compact`),` on the same element that carries `,v(`spacing`),` — your app root next to the theme classes, or any subtree for a scoped island. The order of class names in the string does not matter:`]),E(`tsx`,"import { lightTheme, compact, spacing, typography } from 'haze-ui';\n// app root — compact sits next to spacing; any class order works\n<div className={`${lightTheme} ${compact} ${spacing} ${typography}`}>\n  <App />\n</div>\n// a compact island inside a default-density page: re-declare spacing\n// on the subtree so the scale re-resolves there\n<section className={`${spacing} ${compact}`}>\n  <DataTable … />\n</section>"),w([y(`Why order never matters.`),` A density class that re-declared `,v(`--haze-space-3`),` directly would collide with the `,v(`spacing`),` class at the same specificity, leaving the winner to stylesheet emission order — which differs between per-component css bundles and consumer setups. Instead, `,v(`spacing`),` declares `,v(`--haze-space-3: var(--haze-density-space-3, 12px)`),` and `,v(`compact`),` only ever declares `,v(`--haze-density-space-3`),`. The two classes never write the same property name, so there is nothing to win or lose: the var() reference is substituted eagerly on the element that declares it, picking up whatever `,v(`--haze-density-space-3`),` value that same element carries — 12px without `,v(`compact`),`, 9px with it. That is also why compact must land on (or re-declare `,v(`spacing`),` at) the element you want densified: a `,v(`--haze-density-*`),` value on a descendant cannot retroactively change the already substituted value it inherits.`]),w([y(`Composability.`),` `,v(`compact`),` touches only the density indirection, so it stacks freely with `,v(`lightTheme`),`, `,v(`darkTheme`),` and the brand preset themes — dark compact, violet compact, any combination, in any class order.`])),j(`live-comparison`,`Live comparison`,C([`The same Button, Input, Select, Table and List rendered twice — the right column adds `,v(`compact`),`. Flip the switch:`]),A(`density-compare`),D([`Identical components, identical markup — the right column only adds `,v(`compact`),` next to a local `,v(`spacing`),`. Every `,v(`--haze-space-*`),` reference inside (button padding, table cells, list rhythm, the island's own gap) re-resolves to 75%.`]))],ui:{scaleHeaderToken:`token`,scaleHeaderDefault:`default`,scaleHeaderCompact:`compact`,compareStatusOn:`compact: on (right column)`,compareStatusOff:`compact: off`,compareDefaultTitle:`Default`,compareCompactTitle:`Compact (spacing + compact)`,compareSwitchLabel:`Toggle compact density`}},q={title:`密度（紧凑）`,intro:[`haze-ui 的间距标度是一组由 `,v(`spacing`),` 类声明的 `,v(`--haze-space-*`),` 自定义属性。密度是叠加其上的第二个维度：`,v(`compact`),` 把整个标度缩到 75%——更密的内边距、更紧的行、更小的面板——零逐组件代码。在你的 token 类旁边加一个类，每个组件都会重新解析。`],sections:[j(`compact-scale`,`紧凑标度`,C([`默认标度的每一档都在 4px 网格上，因此每档的 75% 都落在精确像素上——没有小数值，无需取整。零档没有紧凑形态：任何密度下零都是零。圆角、阴影与排版刻意不做密度缩放——`,v(`compact`),` 只回应间距间接寻址。`]),A(`scale-table`)),j(`using-compact`,`使用 compact`,C([`把 `,v(`compact`),` 放在承载 `,v(`spacing`),` 的同一元素上——应用根部与主题类并列，或任意子树作为作用域孤岛。字符串里类名的先后顺序无关紧要：`]),E(`tsx`,"import { lightTheme, compact, spacing, typography } from 'haze-ui';\n// app root — compact sits next to spacing; any class order works\n<div className={`${lightTheme} ${compact} ${spacing} ${typography}`}>\n  <App />\n</div>\n// a compact island inside a default-density page: re-declare spacing\n// on the subtree so the scale re-resolves there\n<section className={`${spacing} ${compact}`}>\n  <DataTable … />\n</section>"),w([y(`为什么顺序无关。`),`若密度类直接重新声明 `,v(`--haze-space-3`),`，就会与 `,v(`spacing`),` 类在相同特异性上碰撞，胜负交给样式表发射顺序——而它在组件级 css 包与消费方配置之间并不一致。相反，`,v(`spacing`),` 声明 `,v(`--haze-space-3: var(--haze-density-space-3, 12px)`),`，而 `,v(`compact`),` 只声明 `,v(`--haze-density-space-3`),`。两个类从不写同名属性，因此没有输赢：var() 引用在声明它的元素上被急切替换，取该元素携带的 `,v(`--haze-density-space-3`),` 值——没有 `,v(`compact`),` 是 12px，有则是 9px。这也解释了为什么 compact 必须落在（或在其上重新声明 `,v(`spacing`),`）你要致密化的元素上：后代上的 `,v(`--haze-density-*`),` 值无法追溯改变它已继承的替换结果。`]),w([y(`可组合性。`),v(`compact`),` 只触碰密度间接寻址，因此与 `,v(`lightTheme`),`、`,v(`darkTheme`),` 及品牌预设主题自由叠加——深色紧凑、紫色紧凑，任意组合、任意类顺序。`])),j(`live-comparison`,`实时对比`,C([`同样的 Button、Input、Select、Table 与 List 渲染两次——右列只加了 `,v(`compact`),`。拨动开关：`]),A(`density-compare`),D([`相同组件、相同标记——右列只是在本地的 `,v(`spacing`),` 旁边加了 `,v(`compact`),`。内部每个 `,v(`--haze-space-*`),` 引用（按钮内边距、表格单元格、列表节奏、孤岛自身的 gap）都重新解析为 75%。`]))],ui:{scaleHeaderToken:`token`,scaleHeaderDefault:`默认`,scaleHeaderCompact:`紧凑`,compareStatusOn:`compact：开（右列）`,compareStatusOff:`compact：关`,compareDefaultTitle:`默认`,compareCompactTitle:`Compact（spacing + compact）`,compareSwitchLabel:`切换紧凑密度`}},J={title:`Migrating from AntD / shadcn`,intro:[`haze-ui borrows the best conventions from both worlds — AntD-grade compound components on a token system — but three core mechanisms differ: `,y(`state is ControlOrValue`),` (not controlled/uncontrolled prop pairs), `,y(`sugar `),v(`onChange`),y(` is the native event handler`),` (values flow through Controls or dedicated value callbacks), and `,y(`forms run on react-f0rm with schema validators`),` (not `,v(`rules`),` arrays or react-hook-form). This page maps the concepts and calls out every trap.`],sections:[j(`component-map`,`Component map`,O([`AntD`,`shadcn/ui`,`haze-ui`,`Notes`],[[[v(`Button`)],[v(`Button`)],[v(`Button`)],`solid / outline / ghost variants, token-driven colors`],[[v(`Input, Textarea`)],[v(`Input, Textarea`)],[v(`Input, Textarea`)],`ControlOrValue value; onChange is the native event`],[[v(`Select`)],[v(`Select`)],[v(`Select / Combobox`)],`plain single = Select (add searchable for filtering); type-ahead = Combobox`],[[v(`DatePicker / RangePicker`)],[v(`Calendar + Popover`)],[v(`Datepicker / DateRangePicker`)],`Datepicker has showTime; DateRangePicker has presets`],[[v(`Table`)],[v(`Table`)],[v(`Table / DataTable`)],`static markup → Table; sort / select / paginate / edit → DataTable (TanStack) with a manual server mode`],[[v(`Modal`)],[v(`Dialog`)],[v(`Dialog`)],`native <dialog> + showModal`],[[v(`Drawer`)],[v(`Sheet`)],[v(`Drawer`)],`same placement names — see below`],[[v(`Menu / Dropdown`)],[v(`DropdownMenu`)],[v(`DropdownMenu`)],`compound parts — see below`],[[v(`Popconfirm`)],[v(`AlertDialog`)],[v(`ConfirmDialog`)],`confirmText / cancelText / variant='danger'`],[[v(`message / notification`)],[v(`Toast (sonner)`)],[v(`useToast / toast`)],`fire-and-report inside a ToastContainer`],[[v(`Form / Form.Item`)],[v(`Form (react-hook-form)`)],[v(`Form / FormItem (react-f0rm)`)],`schema validators — see below`],[[v(`Tooltip, Tabs, Tag, Tree, Upload, Switch`)],[v(`same names`)],[v(`same names`)],`1:1 surface, ControlOrValue state`],[[v(`Layout / Sider`)],`—`,[v(`AppShell / Sidebar`)],`composable shells`]])),j(`form-item`,`Form.Item → FormItem`,C([`AntD puts validation `,b(`rules`),` on the item; haze-ui puts a `,v(`validate`),` callback there — `,v(`(value, meta) => error | undefined`),`, sync or async. Schemas slot in through `,v(`zodResolver`),` (shipped with haze-ui): one adapter per schema, declared once at module scope. The rules-to-schema translation is mechanical — `,v(`required`),` becomes `,v(`.min(1, '…')`),`, `,v(`type: 'email'`),` becomes `,v(`z.email('…')`),`, custom validators become plain functions returning a message or `,v(`undefined`),`:`]),A(`form-item-compare`),C([`Prefer one object schema? Declare a `,v(`z.object`),` and derive per-field validators from it: `,v(`zodResolver(schema.shape.email)`),` — the field path stays the source of truth. Non-zod validation works through `,v(`standardSchemaResolver`),` (any Standard Schema v1 implementation) or a hand-written `,v(`(value) => message | undefined`),`. The Recipes page shows all three live, including async availability checks with `,v(`meta.signal`),` cancellation.`]),w([`AntD's `,v(`Form`),` instance maps to react-f0rm's `,v(`useForm`),` (re-exported from `,v(`haze-ui`),`): `,v(`form.setFieldsValue`),` → per-field `,v(`setValue(form, path, value)`),` (or `,v(`reset(form, values)`),` for a full load — the pattern the CRUD recipe uses to open an edit dialog), `,v(`form.resetFields`),` → `,v(`reset(form, initialValues)`),`, `,v(`form.validateFields`),` → the submit flow you already drive via `,v(`onValidSubmit`),` / `,v(`onInvalidSubmit`),`. shadcn's react-hook-form migration is the same shape — `,v(`register`),`/`,v(`Controller`),` collapses into the `,v(`input`),` channel or the `,v(`children`),` render-prop, which hands you `,v(`{value, onChange}`),` plus the id/aria wiring.`])),j(`default-value`,`defaultValue → “the value is the uncontrolled initial”`,C([`The biggest mental-model shift: haze stateful components take `,v(`ControlOrValue<T>`),` — the same prop is the uncontrolled initial value `,b(`or`),` the controlled channel, distinguished by type, not by prop name:`]),A(`default-value-compare`),w([`Migration trap: porting `,v(`value={x}`),` verbatim from a controlled AntD/shadcn component compiles and renders — but a plain value is the uncontrolled `,b(`initial`),` value, so later prop changes are silently ignored. To stay controlled, pass the third element of `,v(`useControl`),`'s return (the Control). There is no `,v(`defaultValue`),` prop to fall back on — `,v(`checked`),`, `,v(`open`),`, `,v(`expanded`),`, `,v(`activeKey`),`… all migrate the same way.`])),j(`open-control`,`open / onOpenChange → open ControlOrValue`,C([`AntD modals and shadcn/Radix dialogs are controlled boolean pairs: `,v(`open`),` + `,v(`onOpenChange`),` / `,v(`onClose`),`. haze keeps `,v(`open`),` but it is ControlOrValue, and there is only one callback — `,v(`onClose`),`, fired once per close from every exit path (ESC, backdrop, your own buttons drive the state themselves):`]),A(`open-compare`),C([`The same trap as values applies: `,v(`open={condition}`),` with a plain boolean is an `,b(`initial`),` value — the dialog opens on the first true and then manages itself. Drive it with a Control from `,v(`useControl`),` and it behaves like the boolean pair you are used to. Drawer, Popover, Tooltip, ConfirmDialog and the rest share the contract.`])),j(`select-onchange`,`Select → Select / Combobox — the onChange trap`,w([y(`Read this before porting any Select.`),` In AntD and shadcn/Radix, `,v(`onChange`),` / `,v(`onValueChange`),` receives the selected `,y(`value`),`. In haze-ui, the sugar `,v(`onChange`),` is forwarded to the underlying native element — it receives the `,y(`DOM event`),` (and only exists where a native element does). The value callback is `,v(`onValuesChange`),`. Porting `,v(`onChange={(value) => …}`),` verbatim compiles in single mode and then breaks: `,v(`value`),` is an event, not a string.`]),A(`select-compare`),C([`Choosing the component: a plain single select (with or without `,v(`searchable`),` filtering) is `,v(`Select`),`; a free-typing input that completes against options — AntD's `,v(`AutoComplete`),` or a searchable multi-select — is `,v(`Combobox`),`, which adds `,v(`creatable`),`, `,v(`onCreate`),`, highlight-as-you-type and the same `,v(`onSearch`),` remote mode. Multiple selection lives on both (`,v(`multiple`),`), renders Chips, and reports through the same `,v(`onValuesChange`),` with `,v(`string[]`),`. One more AntD difference: options are always JSX children (`,v(`Option`),` / `,v(`OptionGroup`),`) or — on Combobox — a plain `,v(`options`),` array; there is no `,v(`labelInValue`),` (compare against your own option source instead).`])),j(`dropdown-menu`,`Menu / Dropdown → DropdownMenu`,C([`AntD's config-driven `,v(`items`),` array becomes the shadcn-style compound tree — the structure you write is the structure you get, and submenus nest arbitrarily:`]),A(`dropdown-compare`),C([`The `,v(`key`),` → handler indirection disappears: each item carries its own `,v(`onClick`),`. Context menus use the same item tree behind `,v(`ContextMenu`),` + `,v(`ContextMenuTrigger`),` wrapping whatever element should react to right-clicks. Keyboard parity (arrows, type-ahead, Esc one level at a time) and RTL mirroring are built in.`])),j(`drawer`,`Drawer / Sheet → Drawer`,C([`AntD's `,v(`Drawer`),` and shadcn's `,v(`Sheet`),` map directly — haze keeps the four edge names AntD uses, and shadcn's `,v(`side`),` values translate mechanically:`]),A(`drawer-compare`),C([`Defaults match AntD (`,v(`right`),`). Sizing is CSS, not props: each placement ships a sensible panel size (320px on the long axis, clamped to the viewport) — pass a `,v(`className`),` with your own `,v(`width`),`/`,v(`height`),` to resize one drawer. Mobile bottom sheets are the sibling `,v(`BottomSheet`),` component.`])),j(`shadcn-specifics`,`shadcn specifics`,C([`Beyond the pieces already covered, three conventions replace the shadcn stack:`]),T([y(`No `),v(`cn()`),y(` / Tailwind glue.`),` Components ship their own token-driven styles; customize with the `,v(`--haze-<component>-*`),` custom properties (see each component page's CSS variables section) instead of utility-class overrides. Your Tailwind utilities still compose around them — the Getting Started page covers the `,v(`@theme inline`),` bridge and layer interactions.`],[y(`No copy-paste ownership.`),` shadcn drops source files into your repo; haze-ui is an installed dependency — updates arrive with the package, and per-component CSS subpaths (`,v(`haze-ui/css/*.css`),`) keep payloads pay-per-use.`],[y(`Copy is localizable.`),` Every built-in literal flows through `,v(`useStrings`),` — mount `,v(`LocaleProvider`),` with a pack (zh-CN and ja-JP ship in the box) or partial overrides, instead of forking components to reword a button.`])),j(`where-next`,`Where to go next`,T([y(`Recipes`),` — the CRUD recipe assembles the exact admin screen most AntD apps start from (server-paginated DataTable + dialog form + confirm + toasts); the zod recipe covers schema validation in depth.`],[y(`Dark mode guide`),` — if you are leaving next-themes's `,v(`class`),` attribute behind, the guide shows the two haze token classes and their interop.`],[y(`Component pages`),` — every component documents its props, CSS variable slots and accessibility notes; DataTable, Select and FormItem have the deepest migration surfaces.`]))]},Y={title:`从 AntD / shadcn 迁移`,intro:[`haze-ui 汲取了两个世界的最佳惯例——token 体系上的 AntD 级复合组件——但有三个核心机制不同：`,y(`状态是 ControlOrValue`),`（而不是 controlled/uncontrolled 的 prop 成对组合）、`,y(`语法糖 `),v(`onChange`),y(` 是原生事件处理器`),`（值经 Control 或专门的值回调流动）、以及 `,y(`表单运行在 react-f0rm 与 schema 校验器上`),`（不是 `,v(`rules`),` 数组，也不是 react-hook-form）。本页给出概念对照，并逐一指出每个陷阱。`],sections:[j(`component-map`,`组件对照表`,O([`AntD`,`shadcn/ui`,`haze-ui`,`说明`],[[[v(`Button`)],[v(`Button`)],[v(`Button`)],`solid / outline / ghost 变体，颜色由 token 驱动`],[[v(`Input, Textarea`)],[v(`Input, Textarea`)],[v(`Input, Textarea`)],`ControlOrValue 值；onChange 是原生事件`],[[v(`Select`)],[v(`Select`)],[v(`Select / Combobox`)],`普通单选 = Select（加 searchable 做过滤）；输入即补全 = Combobox`],[[v(`DatePicker / RangePicker`)],[v(`Calendar + Popover`)],[v(`Datepicker / DateRangePicker`)],`Datepicker 有 showTime；DateRangePicker 有预设`],[[v(`Table`)],[v(`Table`)],[v(`Table / DataTable`)],`静态标记 → Table；排序 / 选择 / 分页 / 编辑 → DataTable（TanStack），另配手动服务端模式`],[[v(`Modal`)],[v(`Dialog`)],[v(`Dialog`)],`原生 <dialog> + showModal`],[[v(`Drawer`)],[v(`Sheet`)],[v(`Drawer`)],`placement 同名——见下文`],[[v(`Menu / Dropdown`)],[v(`DropdownMenu`)],[v(`DropdownMenu`)],`复合部件——见下文`],[[v(`Popconfirm`)],[v(`AlertDialog`)],[v(`ConfirmDialog`)],`confirmText / cancelText / variant='danger'`],[[v(`message / notification`)],[v(`Toast (sonner)`)],[v(`useToast / toast`)],`在 ToastContainer 内即发即报`],[[v(`Form / Form.Item`)],[v(`Form (react-hook-form)`)],[v(`Form / FormItem (react-f0rm)`)],`schema 校验器——见下文`],[[v(`Tooltip, Tabs, Tag, Tree, Upload, Switch`)],[v(`同名`)],[v(`同名`)],`1:1 对应面，ControlOrValue 状态`],[[v(`Layout / Sider`)],`—`,[v(`AppShell / Sidebar`)],`可组合的外壳`]])),j(`form-item`,`从 Form.Item 到 FormItem`,C([`AntD 把校验`,b(`规则`),`放在 item 上；haze-ui 在同一位置放的是一个 `,v(`validate`),` 回调——`,v(`(value, meta) => error | undefined`),`，同步或异步皆可。schema 经 `,v(`zodResolver`),`（随 haze-ui 发布）接入：每个 schema 一个适配器，在模块作用域声明一次。rules 到 schema 的翻译是机械的——`,v(`required`),` 变成 `,v(`.min(1, '…')`),`，`,v(`type: 'email'`),` 变成 `,v(`z.email('…')`),`，自定义校验器变成返回 message 或 `,v(`undefined`),` 的普通函数：`]),A(`form-item-compare`),C([`更想要一个对象 schema？声明一个 `,v(`z.object`),`，再从中派生逐字段校验器：`,v(`zodResolver(schema.shape.email)`),`——字段路径仍是唯一真值来源。非 zod 校验经 `,v(`standardSchemaResolver`),`（任何 Standard Schema v1 实现）或手写的 `,v(`(value) => message | undefined`),` 接入。Recipes 页展示三者的 live 用法，包括用 `,v(`meta.signal`),` 取消的异步可用性检查。`]),w([`AntD 的 `,v(`Form`),` 实例对应 react-f0rm 的 `,v(`useForm`),`（从 `,v(`haze-ui`),` 重新导出）：`,v(`form.setFieldsValue`),` → 逐字段 `,v(`setValue(form, path, value)`),`（或整批 `,v(`reset(form, values)`),`——CRUD recipe 打开编辑对话框用的正是这个模式），`,v(`form.resetFields`),` → `,v(`reset(form, initialValues)`),`，`,v(`form.validateFields`),` → 你已经在经 `,v(`onValidSubmit`),` / `,v(`onInvalidSubmit`),` 驱动的提交流程。shadcn 的 react-hook-form 迁移是同一个形状——`,v(`register`),`/`,v(`Controller`),` 收拢进 `,v(`input`),` 通道或 `,v(`children`),` render-prop，后者把 `,v(`{value, onChange}`),` 连同 id/aria 接线一并交给你。`])),j(`default-value`,`defaultValue →「值即非受控初值」`,C([`最大的心智模型转变：haze 有状态组件接受 `,v(`ControlOrValue<T>`),`——同一个 prop 既是非受控初值`,b(`又`),`是受控通道，靠类型而非 prop 名区分：`]),A(`default-value-compare`),w([`迁移陷阱：把受控 AntD/shadcn 组件的 `,v(`value={x}`),` 原样搬过来能编译也能渲染——但普通值是非受控`,b(`初值`),`，后续 prop 变化会被静默忽略。要保持受控，请传 `,v(`useControl`),` 返回值的第三个元素（Control）。没有 `,v(`defaultValue`),` prop 可以退回——`,v(`checked`),`、`,v(`open`),`、`,v(`expanded`),`、`,v(`activeKey`),`……全都按同样的方式迁移。`])),j(`open-control`,`从 open / onOpenChange 到 open ControlOrValue`,C([`AntD 的 Modal 与 shadcn/Radix 的 Dialog 是受控布尔对：`,v(`open`),` + `,v(`onOpenChange`),` / `,v(`onClose`),`。haze 保留 `,v(`open`),`，但它是 ControlOrValue，且回调只有一个——`,v(`onClose`),`，每条退出路径（ESC、遮罩、你自己的按钮驱动状态）都只触发它一次：`]),A(`open-compare`),C([`与值相同的陷阱在这里同样适用：`,v(`open={condition}`),` 传普通布尔是一个`,b(`初值`),`——对话框在第一次为 true 时打开，此后自管理。用 `,v(`useControl`),` 派生的 Control 驱动它，行为就与你熟悉的布尔对一致。Drawer、Popover、Tooltip、ConfirmDialog 及其余组件共享同一契约。`])),j(`select-onchange`,`Select → Select / Combobox——onChange 陷阱`,w([y(`移植任何 Select 之前先读这段。`),`在 AntD 和 shadcn/Radix 里，`,v(`onChange`),` / `,v(`onValueChange`),` 收到的是选中的`,y(`值`),`。在 haze-ui 里，语法糖 `,v(`onChange`),` 直接透传给底层原生元素——它收到的是`,y(`DOM 事件`),`（且只存在于有原生元素的地方）。值回调是 `,v(`onValuesChange`),`。把 `,v(`onChange={(value) => …}`),` 原样搬来在单选模式下能编译，随后出问题：`,v(`value`),` 是事件，不是字符串。`]),A(`select-compare`),C([`组件选择：普通单选 select（带或不带 `,v(`searchable`),` 过滤）用 `,v(`Select`),`；自由输入并对照选项补全——AntD 的 `,v(`AutoComplete`),` 或可搜索多选——用 `,v(`Combobox`),`，它额外提供 `,v(`creatable`),`、`,v(`onCreate`),`、输入高亮与同样的 `,v(`onSearch`),` 远程模式。多选在两者上都有（`,v(`multiple`),`），渲染 Chips，并经同一个 `,v(`onValuesChange`),` 以 `,v(`string[]`),` 上报。还有一条 AntD 差异：选项永远是 JSX 子元素（`,v(`Option`),` / `,v(`OptionGroup`),`）或——仅 Combobox——一个普通 `,v(`options`),` 数组；没有 `,v(`labelInValue`),`（改为对照你自己的选项源）。`])),j(`dropdown-menu`,`从 Menu / Dropdown 到 DropdownMenu`,C([`AntD 配置驱动的 `,v(`items`),` 数组换成 shadcn 式复合树——你写的结构就是得到的结构，子菜单可以任意嵌套：`]),A(`dropdown-compare`),C([v(`key`),` → 处理器的间层消失了：每个 item 自带 `,v(`onClick`),`。右键菜单用同一套 item 树，挂在 `,v(`ContextMenu`),` + `,v(`ContextMenuTrigger`),` 里包住任何该响应右键的元素。键盘对等（方向键、type-ahead、Esc 逐级退出）与 RTL 镜像都是内建的。`])),j(`drawer`,`从 Drawer / Sheet 到 Drawer`,C([`AntD 的 `,v(`Drawer`),` 与 shadcn 的 `,v(`Sheet`),` 直接对应——haze 保留 AntD 的四个边名，shadcn 的 `,v(`side`),` 值机械翻译即可：`]),A(`drawer-compare`),C([`默认值与 AntD 一致（`,v(`right`),`）。尺寸走 CSS 而非 prop：每个 placement 自带合理的面板尺寸（长轴 320px，钳制在视口内）——传一个带自定义 `,v(`width`),`/`,v(`height`),` 的 `,v(`className`),` 来调整单个 drawer。移动端底部抽屉是兄弟组件 `,v(`BottomSheet`),`。`])),j(`shadcn-specifics`,`shadcn 特有事项`,C([`除已覆盖的部分外，三条约定取代 shadcn 技术栈：`]),T([y(`没有 `),v(`cn()`),y(` / Tailwind 胶水。`),`组件自带 token 驱动的样式；用 `,v(`--haze-<component>-*`),` 自定义属性（见各组件页的 CSS variables 一节）定制，而不是 utility 类覆写。你的 Tailwind utility 仍可在外层组合——Getting Started 页讲了 `,v(`@theme inline`),` 桥接与层交互。`],[y(`没有复制粘贴式所有权。`),`shadcn 把源码文件丢进你的仓库；haze-ui 是一个安装依赖——更新随包到达，按组件拆分的 CSS 子路径（`,v(`haze-ui/css/*.css`),`）让载荷按需付费。`],[y(`文案可本地化。`),`每个内置字面量都流经 `,v(`useStrings`),`——挂一个带 pack 的 `,v(`LocaleProvider`),`（zh-CN 与 ja-JP 内置）或做部分覆写，而不必 fork 组件去改一个按钮的措辞。`])),j(`where-next`,`接下来去哪`,T([y(`Recipes`),`——CRUD recipe 拼装了大多数 AntD 应用起步时的那个管理界面（服务端分页 DataTable + 对话框表单 + confirm + toasts）；zod recipe 深入讲 schema 校验。`],[y(`深色模式指南`),`——如果你正在告别 next-themes 的 `,v(`class`),` 属性，该指南展示 haze 的两个 token 类及互操作。`],[y(`组件页`),`——每个组件都记载 props、CSS variable 槽位与无障碍说明；DataTable、Select 和 FormItem 的迁移面最深。`]))]},X={title:`Motion presets`,intro:[`haze-ui animates mount and unmount with plain CSS: one class from `,v(`motionPresets`),` on the element, and a `,v(`data-state`),` attribute that flips between `,v(`'open'`),` and `,v(`'closed'`),`. The open state plays the enter keyframes, the closed state plays the exit keyframes, and the `,v(`Presence`),` primitive from `,v(`haze-ui/headless`),` keeps the element mounted until the exit finishes. No animation library, no JS touching `,v(`style`),`.`],sections:[j(`pattern`,`The pattern: one class plus data-state`,C([`A preset is a single Linaria class that targets its own host element through the attribute selectors `,v(`&[data-state='open']`),` and `,v(`&[data-state='closed']`),`. Because the selectors match on the element itself, the class works anywhere — your own components, haze-ui components that mirror their open state as `,v(`data-state`),` (animated floating panels do exactly this), or a bare `,v(`<div>`),`:`]),E(`tsx`,`import { motionPresets } from 'haze-ui';
// or: from 'haze-ui/tokens'

// Statically mounted: flips data-state itself
<div className={motionPresets.fadeScale} data-state={open ? 'open' : 'closed'}>
  Card content
</div>`),C([`The exit rule carries `,v(`animation-fill-mode: forwards`),`, so a finished exit holds its end state (opacity 0, offset transform) instead of flashing back to the resting look for the frames between “closed” and the actual unmount.`])),j(`presence`,`Animating the unmount with Presence`,C([`The catch with exit animations is React itself: the moment a conditional render flips, the element is gone — the exit keyframes never get a frame to play. `,v(`Presence`),` bridges that gap. It injects `,v(`data-state`),` (`,v(`'open'`),` when present, `,v(`'closed'`),` the instant `,v(`present`),` turns false) and keeps the child mounted until `,v(`whenExitSettles`),` observes the closing animation finish:`]),E(`tsx`,`import { useControl } from 'react-use-control';
import { Switch } from 'haze-ui';
import { Presence } from 'haze-ui/headless';
import { motionPresets } from 'haze-ui';
function AnimatedCard() {
  // One control, two consumers: the Switch writes it, Presence reads it
  const [shown, , shownControl] = useControl(undefined, true);
  return (
    <>
      <Switch checked={shownControl} aria-label='Toggle the card' />
      <Presence present={shown}>
        <div className={motionPresets.slideUp}>
          Rises in from just below, sinks back out on exit.
        </div>
      </Presence>
    </>
  );
}`),w([`Everything is coordinating through the one boolean: the Switch writes the control, `,v(`Presence`),` reads the resolved value. That is the same ControlOrValue contract every stateful haze-ui component offers — the demo above is your component with different names. Re-presenting mid-exit is handled: Presence flips the attribute back to `,v(`'open'`),` and the abandoned settle cannot unmount a card that is open again.`]),A(`preset-playground`),D([`Flip the switch off and watch the card leave with the preset's exit animation instead of vanishing — then flip it back on mid-exit: Presence cancels the unmount and re-enters from the start. Enable your OS “reduce motion” preference and every preset collapses to an instant swap.`])),j(`preset-gallery`,`The preset gallery`,C([`Slide names describe the direction the element `,b(`travels on enter`),`; the exit reverses it, so the element always leaves toward the side it arrived from. Slides fade as they travel (a pure translate reads as sliding glass over content), and the travel distance is a spacing token — a `,x(`compacted`,`/guides/density`),` subtree slides shorter.`]),O([`Preset`,`Enter`,`Exit`,`Reaches for`],[[[v(`fade`)],`opacity 0 → 1`,`opacity 1 → 0`,`The safe default, and the only transform-free preset — this is what animated floating panels (Popover, DropdownMenu, Select, Tooltip) use.`],[[v(`fadeScale`)],`opacity 0 + scale 0.97 → 1`,`1 → opacity 0 + scale 0.97`,`Centered surfaces that own the viewport focus: dialogs, image previews, cards stepping in.`],[[v(`slideUp`)],[`rises from `,v(`--haze-space-4`),` below`],`sinks back down`,`Bottom-anchored things: bottom sheets, snackbars, menus opening under a trigger.`],[[v(`slideDown`)],[`descends from `,v(`--haze-space-4`),` above`],`rises back up`,`Top-anchored things: banners, dropdown rows opening downward from a header bar.`],[[v(`slideLeft`)],[`arrives from `,v(`--haze-space-4`),` right`],`leaves back right`,`Panels that belong to the right edge, or content moving leftward through a carousel step.`],[[v(`slideRight`)],[`arrives from `,v(`--haze-space-4`),` left`],`leaves back left`,`Panels that belong to the left edge (drawers, sidebars), or content moving rightward.`]]),C([`Enter runs at `,v(`--haze-duration-normal`),` (200ms), exit at `,v(`--haze-duration-fast`),` (120ms) — exits read snappier at the same perceived responsiveness. Both ease with `,v(`--haze-ease`),`.`])),j(`motion-token`,`The motion token class`,C([`Presets read their timing from the motion tokens — duration and easing custom properties declared by the `,v(`motion`),` class, the same way colors come from `,v(`lightTheme`),`/`,v(`darkTheme`),` and spacing from `,v(`spacing`),`. Put it on your theme root next to the other token classes:`]),E(`tsx`,"import { lightTheme, spacing, typography, motion } from 'haze-ui';\n<div className={`${lightTheme} ${spacing} ${typography} ${motion}`}>\n  <App />\n</div>"),C([`The class declares `,v(`--haze-duration-fast/normal/slow`),` and `,v(`--haze-ease`),`/`,v(`--haze-ease-in-out`),` — write your own transitions against them and every duration in the tree moves together when you retune the scale.`])),j(`reduced-motion`,`Reduced motion is built in`,C([`Users who enable “reduce motion” get no enter/exit animation from these presets, on two independent levels. Every preset embeds its own `,v(`prefers-reduced-motion: reduce`),` block that sets `,v(`animation: none`),` — self-sufficient, with no requirement that the `,v(`motion`),` class is on any ancestor. And when it is, that class additionally collapses every `,v(`--haze-duration-*`),` to 0ms, which zeroes any custom token-driven animation you wrote by hand. Both paths agree; neither depends on the other.`]),E(`css`,`/* Inside every preset class: */
@media (prefers-reduced-motion: reduce) {
  &[data-state='open'],
  &[data-state='closed'] {
    animation: none;
  }
}`),w([`The unmount still waits for the settle — with the animation disabled, `,v(`whenExitSettles`),` sees no positive duration and resolves immediately, so `,v(`Presence`),` unmounts on the next frame. Reduced motion degrades to an instant swap, never a hang.`])),j(`rolling-your-own`,`Rolling your own`,C([`One preset per element — `,v(`animation`),` is a single CSS property, so two preset classes on the same element cannot merge their keyframes; the later class in stylesheet order wins outright. For a bespoke motion, follow the preset shape in your own Linaria class: both attribute selectors, forwards on the exit, a `,v(`haze-motion-`),`-prefixed keyframe pair (keyframe names share the global CSS namespace once emitted), tokens for every duration and easing, and the embedded reduced-motion collapse.`]),w([`Keep transform-bearing presets — `,v(`fadeScale`),` and the slides — off JS-positioned floating panels. Both positioning tiers behind Popover/DropdownMenu/Tooltip measure the panel with `,v(`getBoundingClientRect`),`, and that rect includes transforms: an animating panel poisons its own placement math. Floating surfaces fade; that is why `,v(`fade`),` is transform-free.`]))],ui:{switchLabel:`Toggle the animated card`}},Z={title:`动效预设`,intro:[`haze-ui 用纯 CSS 动画挂载与卸载：在元素上放一个来自 `,v(`motionPresets`),` 的类，加一个在 `,v(`'open'`),` 与 `,v(`'closed'`),` 之间翻转的 `,v(`data-state`),` 属性。open 态播放进场关键帧，closed 态播放退场关键帧，来自 `,v(`haze-ui/headless`),` 的 `,v(`Presence`),` 原语让元素保持挂载直到退场结束。没有动画库，没有 JS 去碰 `,v(`style`),`。`],sections:[j(`pattern`,`模式：一个类加 data-state`,C([`预设是一个单独的 Linaria 类，通过属性选择器 `,v(`&[data-state='open']`),` 与 `,v(`&[data-state='closed']`),` 作用于自己的宿主元素。选择器匹配元素本身，因此这个类在任何地方都可用——你自己的组件、把 open 态镜像为 `,v(`data-state`),` 的 haze-ui 组件（带动画的浮层面板正是这么做的）、或一个裸 `,v(`<div>`),`：`]),E(`tsx`,`import { motionPresets } from 'haze-ui';
// or: from 'haze-ui/tokens'

// Statically mounted: flips data-state itself
<div className={motionPresets.fadeScale} data-state={open ? 'open' : 'closed'}>
  Card content
</div>`),C([`退场规则携带 `,v(`animation-fill-mode: forwards`),`，因此已结束的退场保持其终态（opacity 0、位移 transform），而不是在「closed」到真正卸载之间的若干帧里闪回静止外观。`])),j(`presence`,`用 Presence 动画卸载`,C([`退场动画的难点在 React 本身：条件渲染一翻转，元素就没了——退场关键帧一帧都轮不到播。`,v(`Presence`),` 补上这段空隙。它注入 `,v(`data-state`),`（present 时为 `,v(`'open'`),`，`,v(`present`),` 变 false 的瞬间为 `,v(`'closed'`),`），并让子元素保持挂载，直到 `,v(`whenExitSettles`),` 观察到关闭动画完成：`]),E(`tsx`,`import { useControl } from 'react-use-control';
import { Switch } from 'haze-ui';
import { Presence } from 'haze-ui/headless';
import { motionPresets } from 'haze-ui';
function AnimatedCard() {
  // One control, two consumers: the Switch writes it, Presence reads it
  const [shown, , shownControl] = useControl(undefined, true);
  return (
    <>
      <Switch checked={shownControl} aria-label='Toggle the card' />
      <Presence present={shown}>
        <div className={motionPresets.slideUp}>
          Rises in from just below, sinks back out on exit.
        </div>
      </Presence>
    </>
  );
}`),w([`一切都经由同一个布尔值协调：Switch 写入 control，`,v(`Presence`),` 读取解析后的值。这与每个 haze-ui 有状态组件提供的 ControlOrValue 契约相同——上面的演示就是你的组件换个名字。中途重新 present 也有处理：Presence 把属性翻回 `,v(`'open'`),`，被放弃的 settle 无法卸载一张重新打开的卡片。`]),A(`preset-playground`),D([`关掉开关，看卡片带着预设的退场动画离开而不是凭空消失——再在退场中途打开：Presence 取消卸载并从头重新进场。打开系统的「减少动效」偏好，每个预设都塌缩为即时切换。`])),j(`preset-gallery`,`预设一览`,C([`Slide 系名字描述元素`,b(`进场时`),`行进的方向；退场将其反转，元素总是从哪来回哪去。滑动的行程中伴随淡入淡出（纯位移读起来像玻璃滑过内容），行程距离是一个 spacing token——经过 `,x(`紧凑化`,`/guides/density`),`的子树滑得更短。`]),O([`预设`,`进场`,`退场`,`适用场景`],[[[v(`fade`)],`opacity 0 → 1`,`opacity 1 → 0`,`稳妥的默认值，也是唯一不含 transform 的预设——带动画的浮层面板（Popover、DropdownMenu、Select、Tooltip）用的正是它。`],[[v(`fadeScale`)],`opacity 0 + scale 0.97 → 1`,`1 → opacity 0 + scale 0.97`,`独占视焦的居中表面：对话框、图片预览、步入的卡片。`],[[v(`slideUp`)],[`自下方 `,v(`--haze-space-4`),` 升起`],`沉回下方`,`锚在底部的东西：底部抽屉、snackbar、在触发器下方展开的菜单。`],[[v(`slideDown`)],[`自上方 `,v(`--haze-space-4`),` 降落`],`升回上方`,`锚在顶部的东西：横幅、从页头栏向下展开的下拉行。`],[[v(`slideLeft`)],[`自右侧 `,v(`--haze-space-4`),` 抵达`],`向右离开`,`属于右缘的面板，或经轮播步骤向左移动的内容。`],[[v(`slideRight`)],[`自左侧 `,v(`--haze-space-4`),` 抵达`],`向左离开`,`属于左缘的面板（drawer、侧边栏），或向右移动的内容。`]]),C([`进场跑在 `,v(`--haze-duration-normal`),`（200ms），退场跑在 `,v(`--haze-duration-fast`),`（120ms）——同样的感知响应度下，退场读起来更利落。两者都用 `,v(`--haze-ease`),` 缓动。`])),j(`motion-token`,`动效 token 类`,C([`预设的时序读自动效 token——由 `,v(`motion`),` 类声明的时长与缓动自定义属性，正如颜色来自 `,v(`lightTheme`),`/`,v(`darkTheme`),`、间距来自 `,v(`spacing`),`。把它与其他 token 类并排放在主题根上：`]),E(`tsx`,"import { lightTheme, spacing, typography, motion } from 'haze-ui';\n<div className={`${lightTheme} ${spacing} ${typography} ${motion}`}>\n  <App />\n</div>"),C([`这个类声明 `,v(`--haze-duration-fast/normal/slow`),` 与 `,v(`--haze-ease`),`/`,v(`--haze-ease-in-out`),`——照着它们写你自己的过渡，重新调标度时树里每个时长都一起动。`])),j(`reduced-motion`,`减少动效是内建的`,C([`开启「减少动效」的用户从这些预设得不到任何进场/退场动画，且是在两个相互独立的层面上。每个预设内嵌自己的 `,v(`prefers-reduced-motion: reduce`),` 块，置 `,v(`animation: none`),`——自给自足，不要求任何祖先挂 `,v(`motion`),` 类。而一旦挂了，该类还会把每个 `,v(`--haze-duration-*`),` 塌缩为 0ms，把你手写的自定义 token 驱动动画一并归零。两条路径殊途同归；互不依赖。`]),E(`css`,`/* Inside every preset class: */
@media (prefers-reduced-motion: reduce) {
  &[data-state='open'],
  &[data-state='closed'] {
    animation: none;
  }
}`),w([`卸载仍会等 settle——动画被禁用后，`,v(`whenExitSettles`),` 看不到正时长便立即 resolve，于是 `,v(`Presence`),` 下一帧卸载。减少动效退化为即时切换，绝不会卡死。`])),j(`rolling-your-own`,`自己动手写预设`,C([`每个元素一个预设——`,v(`animation`),` 是单个 CSS 属性，同一元素上两个预设类无法合并关键帧；样式表顺序靠后的类整体获胜。要定制动效，请在自己的 Linaria 类里遵循预设形状：两个属性选择器、退场 forwards、一对 `,v(`haze-motion-`),` 前缀的关键帧（关键帧名一旦发射就共享全局 CSS 命名空间）、所有时长与缓动用 token、以及内嵌的减少动效塌缩。`]),w([`让带 transform 的预设——`,v(`fadeScale`),` 与 slide 系——远离 JS 定位的浮层面板。Popover/DropdownMenu/Tooltip 背后的两个定位层都用 `,v(`getBoundingClientRect`),` 测量面板，而那个矩形包含 transform：动画中的面板会毒化自己的定位数学。浮层表面用淡入；这就是 `,v(`fade`),` 不含 transform 的原因。`]))],ui:{switchLabel:`切换动画卡片`}},Q={title:`Screen readers & streaming AI output`,intro:[`Streaming answers arrive token by token: the DOM text grows dozens of times per second. Sighted users perceive that as text being typed. To a screen reader it is `,y(`silence`),` — and this guide is about why, and about the announcement pattern haze-ui ships in `,v(`StreamingText`),` and `,v(`ChatMessage`),` to fix it. The same live-region semantics govern every transient state — toasts, async-loaded option lists, lazily expanding tree nodes — and the later sections collect those patterns too.`],sections:[j(`why-silent`,`Why streaming output is silent`,C([`Screen readers announce what they are made aware of. Editing text inside a normal element is not something they are made aware of: there is no event, no semantic difference between “the author wrote more” and “a script is mutating this node”. Browsers only forward text changes to assistive technology when the element declares itself a `,y(`live region`),` — `,v(`aria-live`),` or a role that implies it, such as `,v(`role="status"`),` (polite) or `,v(`role="alert"`),` (assertive). Three rules matter for streaming:`]),T([y(`Only changes announce.`),` Content that is already inside the region when it appears is treated as page content, not as news. The region must exist `,b(`before`),` the text starts growing — mounting it pre-filled announces nothing reliably.`],[y(`Every mutation is an utterance.`),` Appending one character restarts what the reader is saying. A 300-token answer streamed per-token into a live region is 300 interruptions, each starting the utterance over from wherever the reader's heuristics decide.`],[y(`Politeness queues.`),` `,v(`role="status"`),` waits for the current utterance; `,v(`role="alert"`),` barges in. Generated prose is never urgent enough to barge — assertive live regions are for “your session expired”, not for paragraphs.`]),C([`So the requirements pull in opposite directions: the reader must hear the stream (needs a live region) but must not be interrupted per token (needs restraint in how often the region changes).`])),j(`haze-pattern`,`The haze pattern`,C([v(`StreamingText`),` renders exactly what it always did — memoized chunk spans and a blinking caret — and adds a visually hidden `,v(`role="status"`),` region that mirrors the stream on a `,y(`throttle`),`:`]),E(`tsx`,`<StreamingText
  text={answer}            // the full (still growing) answer
  speed={20}               // ms per visible character — unchanged
  announceInterval={1200}  // live-region cadence (default 1200ms)
/>`),C([`The announcement lifecycle has three stages. On stream start the region receives a `,b(`Generating`),` cue (a real mutation, so it is announced — the region mounts empty). While the text grows, a snapshot of the current text replaces the region's content at most once per `,v(`announceInterval`),` — the reader hears the answer so far, as a whole utterance, about once per second. When the stream completes, the pending snapshot is cancelled and the complete final text is announced once; the region then settles and stays silent. Tune the cadence with `,v(`announceInterval`),`: shorter means fresher progress and more interruptions, longer the reverse. The default of 1200\xA0ms sits where most readers finish a sentence.`]),A(`streaming-demo`),D([`With a screen reader running you hear: the `,b(`Generating`),` cue, a fresh snapshot of the text roughly every 1.2\xA0seconds while it grows, and the complete sentence once when the stream ends. Sighted users see the same text appear character by character — the announcements are a parallel channel, not a replacement.`]),w([y(`aria-busy marks the content, not the root.`),` While streaming, the content area carries `,v(`aria-busy="true"`),` so assistive tech knows the subtree is still mutating. The live region deliberately lives `,b(`outside`),` that subtree: announcements coming from inside an aria-busy element may be deferred until the flag clears, which would silence the very snapshots the region exists to deliver. Busy marks what is changing; the announcer sits beside it.`])),j(`why-not-every-char`,`Why not announce every character`,C([`The naive fix — pouring the stream into a live region as it arrives — is worse than the silence it replaces. Each mutation makes the reader stop and restart; users hear fragments of beginnings (“The an… The ans… The answer is…”), lose their place, and often disable live regions for the site altogether. The strategies compare like this:`]),O([`strategy`,`what the reader hears`,`verdict`],[[`per-token mutation of a live region`,`hundreds of restarted fragments`,`harmful — interruption churn`],[[v(`role="status"`),` + throttled snapshots`],`cue, then the text so far ~once per interval, then the finished answer`,`haze's default`],[`announce only on completion`,`one long utterance at the end`,[`calm, but a 30\xA0s stream is 30\xA0s of silence first — set a large `,v(`announceInterval`),` if your users prefer this`]]]),C([`A detail that makes snapshots usable: the region re-announces the `,b(`whole`),` text so far, not the delta (the `,v(`status`),` role implies `,v(`aria-atomic`),`). The reader never has to reconstruct “what came before the last 30 characters”.`])),j(`chat-message`,`ChatMessage: streaming with your own renderer`,C([v(`StreamingText`),` owns its typewriter effect. When you render the growing content yourself — plain text state, your own markdown pipeline — pass `,v(`streaming`),` to `,v(`ChatMessage`),` and it applies the same pattern to whatever the bubble contains: the bubble is marked `,v(`aria-busy`),`, and a hidden status region snapshots the `,b(`rendered`),` text on the same 1200\xA0ms cadence, announcing the complete message when you flip the flag off. User and system messages never get a region.`]),A(`chat-demo`),D([`The bubble carries `,v(`aria-busy`),` while `,v(`streaming`),` is set; the hidden live region snapshots the rendered markdown text (headers, emphasis and list markers become plain announced text) and speaks the finished message when the flag clears.`]),w([y(`Do not double up.`),` If the bubble's children already announce themselves — `,v(`StreamingText`),` inside a `,v(`ChatMessage`),` — leave `,v(`streaming`),` false. Two live regions saying the same text twice is its own kind of interruption churn. Pick exactly one announcer per message.`]),C([`One contract rides along: the copy action and the snapshots read the bubble's `,b(`visible`),` text. Any descendant marked `,v(`data-slot="live-region"`),` is excluded, so announcements never leak into the clipboard and copied text is never doubled. Mark your own mirrors with the same attribute to opt into the exclusion.`])),j(`markdown`,`Markdown + streaming`,C([v(`MarkdownRenderer`),` is a pure renderer — no timers, no announcement logic of its own; it stays silent and fast (blocks are memoized, so streaming re-parses only the growing tail block). Compose it under an announcer:`]),E(`tsx`,`// streaming markdown: the renderer re-parses only the tail
// block while ChatMessage handles aria-busy + announcements
<ChatMessage role="assistant" streaming={isGenerating}>
  <MarkdownRenderer content={partialMarkdown} />
</ChatMessage>
// typewriter-then-markdown: plain text streams in (announced by
// StreamingText), the formatted view replaces it once complete
{done
  ? <MarkdownRenderer content={answer} />
  : <StreamingText text={answer} speed={20} onComplete={() => setDone(true)} />}`),C([`Either shape works. The first announces snapshots of the rendered text (headers and emphasis flatten to plain speech); the second announces the raw text while streaming and swaps in formatting silently at the end.`])),j(`interruption-tiers`,`Interruption tiers: status vs alert (Toast)`,C([`Streaming prose is never urgent — but not every transient message is so polite, and an error toast may legitimately need to interrupt. The distinction is mechanical, not a matter of taste: `,v(`role="status"`),` is implicitly `,v(`aria-live="polite"`),` (it queues behind whatever is being said), while `,v(`role="alert"`),` is implicitly assertive (it barges in). haze-ui draws that line at exactly one variant: `,v(`Toast`),` maps every variant to `,v(`status`),` except `,v(`danger`),`, which becomes `,v(`alert`),` — the only tier allowed to interrupt the reader.`]),E(`tsx`,`const liveRoles = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',   // the only assertive tier
  loading: 'status',
} as const;
// the toast root carries the role — each toast is its own live region
<div role={liveRoles[variant]} data-slot="toast">…</div>`),C([`Two structural rules keep announcements single. First, each toast element is its own live region, so the fixed stack `,v(`ToastContainer`),` renders must not add `,v(`aria-live`),` or a live role of its own — a region wrapping a region announces the same toast twice, once per mutation. Second, the `,v(`loading`),` variant’s spinner glyph is `,v(`aria-hidden`),` art: the toast root already speaks, so a nested `,v(`role="status"`),` glyph would add a second voice saying “loading” on top of the message. The Accessibility guide’s ARIA pattern table summarizes this family as its Alert / Status row.`])),j(`async-loading`,`Async option loading: busy, never a lie (Select, Combobox, Cascader)`,C([`Remote option lists put a picker panel in the same transient state a stream does: the data is not there yet and what is on screen is stale. The contract haze-ui applies across the three remote-capable pickers: the mutating surface carries `,v(`aria-busy`),`, a `,v(`Spinner`),` (itself `,v(`role="status"`),`) stands in for the list, and local filtering is `,b(`suspended`),` while loading — filtering the stale options against the just-typed query and showing “no results” would be a lie. The honest answer is “not here yet”.`]),E(`tsx`,`<Select loading={isSearching} onSearch={(q) => search(q)}>
  {remoteOptions.map((o) => (
    <Option key={o.value} value={o.value}>{o.label}</Option>
  ))}
</Select>
// while loading: panel is busy, the spinner replaces the list, and the
// list's semantic role is suppressed — a Spinner block inside a
// role="listbox" would be an aria-required-children violation
<FloatingPanel aria-busy={loading || undefined}>
  {hasVisibleOptions ? optionsList : <Spinner size="sm" />}
</FloatingPanel>`),C([`Where `,v(`aria-busy`),` lands is per-component honesty: `,v(`Combobox`),` puts it on the combobox input itself (the input’s list is what is pending); `,v(`Select`),` and `,v(`Cascader`),` put it on the floating panel, and while it is set the list’s semantic role is suppressed so the panel says “busy”, not “here is a list of one spinner”. Keyboard navigation stays inert until loading clears — there is nothing to navigate yet, and arrow keys waking a half-populated list read as a bug, not progress.`])),j(`lazy-tree`,`Lazy tree nodes: busy at the node (Tree)`,C([`A lazily loaded tree node is the same pattern at its smallest unit. When `,v(`loadData`),` is fetching a node’s children, the `,v(`aria-busy`),` flag goes on that node’s `,v(`treeitem`),` — not on the tree — so the rest of the tree stays readable and navigable while the one expanding node waits. `,v(`aria-expanded`),` already reports the requested state; `,v(`aria-busy`),` adds “and the children are not there yet”.`]),E(`tsx`,`<Tree
  loadData={(node) => fetchChildren(node.key)}
  treeData={lazyRoot}
/>
// the expanding treeitem while its children are in flight
<div
  role="treeitem"
  aria-expanded={expanded}
  aria-busy={loading || undefined}
/>`),w([y(`Busy marks the smallest mutating scope.`),` That is the shared shape of all five patterns: aria-busy on the thing that is actually changing (the content area, the toast, the panel, the node), never on a container large enough to silence siblings that are already fine.`])),j(`rolling-your-own`,`Rolling your own`,C([`The pattern is four moves and works in any stack — a hidden status region mounted empty before the stream starts, a throttled mirror of the visible text, aria-busy on the changing content only, and a final full announcement:`]),E(`tsx`,`const srOnly = \`position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); clip-path: inset(50%);
  white-space: nowrap; border: 0;\`;
function StreamedAnswer({ text, done }: { text: string; done: boolean }) {
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    if (done) {
      // final utterance: the complete text, exactly once
      setAnnounced(text);
      return;
    }
    setAnnounced('Generating');               // cue = a real mutation
    const id = setInterval(                   // trailing-edge throttle
      () => setAnnounced(text),
      1200,
    );
    return () => clearInterval(id);
  }, [done, text]);
  return (
    <>
      <span role="status" data-slot="live-region" style={srOnly}>
        {announced}
      </span>
      <div aria-busy={done ? undefined : true}>{text}</div>
    </>
  );
}`),C([`The details that separate a working version from a broken one: the region exists before the first token (never mounted pre-filled), its mutations happen `,b(`outside`),` the `,v(`aria-busy`),` subtree, the cue and the snapshots are separate mutations so both are spoken, and the completion write cancels any pending snapshot so nothing is said twice. Mirror the `,v(`data-slot="live-region"`),` attribute so text-extraction helpers can skip your announcer.`])),j(`edge-notes`,`Edge notes`,T([y(`Reduced motion does not apply — but check it anyway.`),` `,v(`prefers-reduced-motion`),` governs animation; speech cadence is not motion, and StreamingText announces identically with it set (the blinking caret itself already collapses under reduced motion). What reduced-motion users may still want is a `,b(`calmer`),` cadence — expose your `,v(`announceInterval`),` and let app code widen it from a `,v(`matchMedia`),` check if you like.`],[y(`Spoilers.`),` A live region reads text the moment it arrives — glanceable UIs (quiz answers, surprise reveals, spoiler-tagged chat) should not stream into announcements at all. Announce a neutral summary on completion instead, and keep the revealing text out of live regions entirely.`],[y(`The cue is localized.`),` The `,b(`Generating`),` hint comes from the `,v(`streamingText`),` section of the locale packs — override or translate it like any other copy:`]),E(`tsx`,`<LocaleProvider
  locale="fr-FR"
  strings={{ streamingText: { generating: 'Réponse en préparation' } }}
/>`))],ui:{replayLabel:`Replay stream`,generateLabel:`Generate reply`,waitingHint:`waiting…`,streamText:`A live region is a plain element you promise to update. Screen readers do not watch DOM text by default, so a growing answer is just pixels moving — unless the element says otherwise.`,markdownSource:[`### Markdown while streaming`,``,`Blocks finalize at **blank lines**, so only the tail block re-renders as tokens arrive.`,``,`- the parser is memoized per block`,`- code and lists stream in like any other block`].join(`
`)}},$={title:`屏幕阅读器与流式 AI 输出`,intro:[`流式回答逐 token 到达：DOM 文本每秒增长几十次。明眼用户感知为文字正在被打出来。对屏幕阅读器而言这是`,y(`沉默`),`——本指南讲清原委，也讲 haze-ui 在 `,v(`StreamingText`),` 与 `,v(`ChatMessage`),` 里内置的播报模式如何修复它。同一套 live-region 语义管辖一切瞬态——toast、异步加载的选项列表、懒展开的树节点——后面的小节也收录这些模式。`],sections:[j(`why-silent`,`为什么流式输出是沉默的`,C([`屏幕阅读器只播报它被告知的东西。在普通元素里编辑文本不在被告知之列：没有事件，「作者又写了」与「脚本正在改这个节点」之间没有语义差别。浏览器只在元素声明自己是`,y(`live region`),`时才把文本变化转发给辅助技术——`,v(`aria-live`),`，或一个隐含它的 role，比如 `,v(`role="status"`),`（polite）或 `,v(`role="alert"`),`（assertive）。对流式而言有三条规则要紧：`]),T([y(`只有变化会被播报。`),`区域出现时就已在其中的内容被当作页面内容而非新闻。区域必须在文本开始增长`,b(`之前`),`存在——预填充地挂载它什么也可靠地播报不了。`],[y(`每次变更都是一次话语。`),`追加一个字符都会打断阅读器正在说的话。300 token 的回答按 token 流进 live region 是 300 次打断，每次都从阅读器启发式决定的任意位置重新开始这句话。`],[y(`礼貌级别排队。`),v(`role="status"`),` 等当前话语说完；`,v(`role="alert"`),` 插队打断。生成的散文永远没有急到要插队——assertive live region 是给「你的会话已过期」用的，不是给段落用的。`]),C([`于是需求互相拉扯：阅读器必须听得到流（需要 live region），又不能逐 token 被打断（需要克制区域变化的频率）。`])),j(`haze-pattern`,`haze 的模式`,C([v(`StreamingText`),` 的渲染一如既往——记忆化的分块 span 与闪烁光标——并追加一个视觉隐藏的 `,v(`role="status"`),` 区域，以`,y(`节流`),`方式镜像流：`]),E(`tsx`,`<StreamingText
  text={answer}            // the full (still growing) answer
  speed={20}               // ms per visible character — unchanged
  announceInterval={1200}  // live-region cadence (default 1200ms)
/>`),C([`播报生命周期分三阶段。流开始时区域收到 `,b(`Generating`),` 提示（一次真实变更，所以会被播报——区域挂载时为空）。文本增长期间，当前文本的快照至多每 `,v(`announceInterval`),` 一次替换区域内容——阅读器大约每秒一次、以完整话语听到目前为止的回答。流完成时，待发快照被取消，完整终文被播报一次；区域随即安定并保持沉默。用 `,v(`announceInterval`),` 调节节奏：更短意味着更新的进度与更多的打断，更长则相反。默认的 1200ms 落在多数阅读器读完一句话的位置。`]),A(`streaming-demo`),D([`开着屏幕阅读器时你会听到：`,b(`Generating`),` 提示、流增长期间大约每 1.2 秒一次的最新文本快照、以及流结束时完整句子的一次播报。明眼用户看到的是同样的文本逐字出现——播报是一条并行通道，不是替代。`]),w([y(`aria-busy 标在内容上，不标在根上。`),`流式进行中，内容区域携带 `,v(`aria-busy="true"`),`，辅助技术由此知道子树仍在变化。live region 刻意住在该子树`,b(`之外`),`：来自 aria-busy 元素内部的播报可能被推迟到标志清除，那会恰恰噤声区域存在的意义所在的那些快照。busy 标记正在变化的东西；播报器坐在它旁边。`])),j(`why-not-every-char`,`为什么不能逐字符播报`,C([`天真的修法——把流原样倒进 live region——比它取代的沉默更糟。每次变更都让阅读器停下重来；用户听到支离的开头（“The an… The ans… The answer is…”），找不到自己的位置，还常常干脆为整站关掉 live region。各策略对比如下：`]),O([`策略`,`读者听到`,`结论`],[[`逐 token 变更 live region`,`几百次从头再来的碎片`,`有害——打断扰动`],[[v(`role="status"`),` + 节流快照`],`提示，随后约每间隔一次的当前文本，最后是完整回答`,`haze 的默认值`],[`仅在完成时播报`,`结尾一次长话语`,[`平静，但 30 秒的流先要 30 秒的沉默——若你的用户偏好如此，设一个大的 `,v(`announceInterval`)]]]),C([`一个让快照可用的细节：区域重新播报到目前为止的`,b(`全部`),`文本而非增量（`,v(`status`),` role 隐含 `,v(`aria-atomic`),`）。阅读器永远不必重建「最后 30 个字符之前是什么」。`])),j(`chat-message`,`ChatMessage：用你自己的渲染器流式`,C([v(`StreamingText`),` 自带打字机效果。当你自己渲染增长的内容——纯文本 state、你自己的 markdown 管线——把 `,v(`streaming`),` 传给 `,v(`ChatMessage`),`，它对气泡里的任何内容套用同一模式：气泡标上 `,v(`aria-busy`),`，一个隐藏的 status 区域按同样的 1200ms 节奏快照`,b(`渲染后`),`的文本，并在你翻转标志关闭时播报完整消息。用户与系统消息永远没有区域。`]),A(`chat-demo`),D([`设置 `,v(`streaming`),` 期间气泡携带 `,v(`aria-busy`),`；隐藏的 live region 对渲染后的 markdown 文本做快照（标题、强调与列表标记变成普通的播报文本），并在标志清除时说出完成的消息。`]),w([y(`不要叠加。`),`若气泡的 children 已能自行播报——`,v(`ChatMessage`),` 里的 `,v(`StreamingText`),`——就让 `,v(`streaming`),` 保持 false。两个 live region 把同一段文本说两遍是另一种打断扰动。每条消息只选一个播报器。`]),C([`还有一条契约随行：复制动作与快照读取的是气泡的`,b(`可见`),`文本。任何标了 `,v(`data-slot="live-region"`),` 的后代都被排除，播报不泄漏进剪贴板，复制文本不加倍。给你自己的镜像标同一属性即可加入排除。`])),j(`markdown`,`Markdown + 流式`,C([v(`MarkdownRenderer`),` 是纯渲染器——没有计时器、没有自己的播报逻辑；它保持沉默与快速（分块记忆化，流式只重解析增长中的尾部块）。把它组合在播报器之下：`]),E(`tsx`,`// streaming markdown: the renderer re-parses only the tail
// block while ChatMessage handles aria-busy + announcements
<ChatMessage role="assistant" streaming={isGenerating}>
  <MarkdownRenderer content={partialMarkdown} />
</ChatMessage>
// typewriter-then-markdown: plain text streams in (announced by
// StreamingText), the formatted view replaces it once complete
{done
  ? <MarkdownRenderer content={answer} />
  : <StreamingText text={answer} speed={20} onComplete={() => setDone(true)} />}`),C([`两种形状都可行。第一种播报渲染后文本的快照（标题与强调摊平为普通语音）；第二种在流式期间播报原始文本，结尾静默换上排版。`])),j(`interruption-tiers`,`打断分级：status 对 alert（Toast）`,C([`流式散文永远不急——但并非所有瞬态消息都这么客气，错误 toast 可能正当需要打断。这个区分是机械的而非品味问题：`,v(`role="status"`),` 隐含 `,v(`aria-live="polite"`),`（排在正被说的话后面），而 `,v(`role="alert"`),` 隐含 assertive（插队）。haze-ui 恰好在一个变体上划这条线：`,v(`Toast`),` 把每个变体映射到 `,v(`status`),`，唯独 `,v(`danger`),` 成为 `,v(`alert`),`——唯一被允许打断阅读器的层级。`]),E(`tsx`,`const liveRoles = {
  info: 'status',
  success: 'status',
  warning: 'status',
  danger: 'alert',   // the only assertive tier
  loading: 'status',
} as const;
// the toast root carries the role — each toast is its own live region
<div role={liveRoles[variant]} data-slot="toast">…</div>`),C([`两条结构规则保证播报单一。其一，每个 toast 元素自己是 live region，因此固定的 `,v(`ToastContainer`),` 渲染的堆栈绝不能再加自己的 `,v(`aria-live`),` 或 live role——区域包区域会把同一个 toast 播报两遍，每次变更一遍。其二，`,v(`loading`),` 变体的 spinner 字形是 `,v(`aria-hidden`),` 的装饰：toast 根自己会说话，嵌套的 `,v(`role="status"`),` 字形会在消息之上加第二嗓子说「loading」。无障碍指南的 ARIA 模式表以 Alert / Status 行归纳这一族。`])),j(`async-loading`,`异步选项加载：busy，绝不撒谎（Select、Combobox、Cascader）`,C([`远程选项列表把选择面板放进与流相同的瞬态：数据未到，屏幕上是陈旧的。haze-ui 对三个可远程选择器统一契约：变化中的表面携带 `,v(`aria-busy`),`，一个 `,v(`Spinner`),`（本身是 `,v(`role="status"`),`）顶替列表，且加载期间本地过滤被`,b(`挂起`),`——拿刚输入的查询过滤陈旧选项再显示「无结果」是在撒谎。诚实的答案是「还没到」。`]),E(`tsx`,`<Select loading={isSearching} onSearch={(q) => search(q)}>
  {remoteOptions.map((o) => (
    <Option key={o.value} value={o.value}>{o.label}</Option>
  ))}
</Select>
// while loading: panel is busy, the spinner replaces the list, and the
// list's semantic role is suppressed — a Spinner block inside a
// role="listbox" would be an aria-required-children violation
<FloatingPanel aria-busy={loading || undefined}>
  {hasVisibleOptions ? optionsList : <Spinner size="sm" />}
</FloatingPanel>`),C([v(`aria-busy`),` 落在哪里是逐组件的诚实：`,v(`Combobox`),` 放在 combobox 输入框本身（输入框的列表才是待定的东西）；`,v(`Select`),` 与 `,v(`Cascader`),` 放在浮层面板上，且在其置位期间列表的语义 role 被抑制，让面板说「忙」而不是「这是一列只有一个 spinner」。键盘导航在加载清除前保持惰性——还没什么可导航的，方向键唤醒半满列表读起来像 bug 而非进展。`])),j(`lazy-tree`,`懒加载树节点：忙在节点上（Tree）`,C([`懒加载的树节点是同一模式的最小单元。当 `,v(`loadData`),` 拉取某节点的子级时，`,v(`aria-busy`),` 标志落在那个节点的 `,v(`treeitem`),` 上——而不是树上——于是其余部分保持可读可导航，只有一个展开中的节点在等。`,v(`aria-expanded`),` 已报告请求的状态；`,v(`aria-busy`),` 补上「子级还没到」。`]),E(`tsx`,`<Tree
  loadData={(node) => fetchChildren(node.key)}
  treeData={lazyRoot}
/>
// the expanding treeitem while its children are in flight
<div
  role="treeitem"
  aria-expanded={expanded}
  aria-busy={loading || undefined}
/>`),w([y(`busy 标记最小的变化范围。`),`这是全部五个模式的共同形状：aria-busy 标在真正变化的东西上（内容区、toast、面板、节点），绝不标在大到会噤声本已无恙的兄弟节点的容器上。`])),j(`rolling-your-own`,`自己动手写`,C([`这个模式是四个动作，适用于任何技术栈——流开始前挂载一个空的隐藏 status 区域、可见文本的节流镜像、只在变化的内容上标 aria-busy、以及一次完整的终局播报：`]),E(`tsx`,`const srOnly = \`position: absolute; width: 1px; height: 1px;
  padding: 0; margin: -1px; overflow: hidden;
  clip: rect(0, 0, 0, 0); clip-path: inset(50%);
  white-space: nowrap; border: 0;\`;
function StreamedAnswer({ text, done }: { text: string; done: boolean }) {
  const [announced, setAnnounced] = useState('');
  useEffect(() => {
    if (done) {
      // final utterance: the complete text, exactly once
      setAnnounced(text);
      return;
    }
    setAnnounced('Generating');               // cue = a real mutation
    const id = setInterval(                   // trailing-edge throttle
      () => setAnnounced(text),
      1200,
    );
    return () => clearInterval(id);
  }, [done, text]);
  return (
    <>
      <span role="status" data-slot="live-region" style={srOnly}>
        {announced}
      </span>
      <div aria-busy={done ? undefined : true}>{text}</div>
    </>
  );
}`),C([`区分可用与破损版本的细节：区域在第一个 token 之前就存在（绝不预填充挂载）、它的变更发生在 `,v(`aria-busy`),` 子树`,b(`之外`),`、提示与快照是分开的变更所以都会被说出、完成时的写入取消一切待发快照所以没有话被说两遍。镜像 `,v(`data-slot="live-region"`),` 属性，文本提取助手就能跳过你的播报器。`])),j(`edge-notes`,`边角备注`,T([y(`减少动效不适用——但还是检查一下。`),v(`prefers-reduced-motion`),` 管动画；语音节奏不是动效，StreamingText 在其置位时播报完全相同（闪烁光标本身已在减少动效下塌缩）。减少动效用户可能仍想要更平静的节奏——暴露你的 `,v(`announceInterval`),`，让应用代码酌情从 `,v(`matchMedia`),` 检查放宽它。`],[y(`剧透。`),`live region 在文本到达的瞬间就读出来——可扫读的 UI（测验答案、惊喜揭晓、剧透标记的聊天）根本不该流进播报。改为完成时播报一段中性摘要，并把揭示性文本完全排除在 live region 之外。`],[y(`提示是本地化的。`),b(`Generating`),` 提示来自 locale pack 的 `,v(`streamingText`),` 一节——像任何其他文案一样覆写或翻译它：`]),E(`tsx`,`<LocaleProvider
  locale="fr-FR"
  strings={{ streamingText: { generating: 'Réponse en préparation' } }}
/>`))],ui:{replayLabel:`重放流`,generateLabel:`生成回复`,waitingHint:`等待中…`,streamText:`实时区域是一个你承诺会更新的普通元素。屏幕阅读器默认不监视 DOM 文本，所以一个不断变长的回答只是像素在动——除非元素自己另有声明。`,markdownSource:[`### 流式中的 Markdown`,``,`分块在**空行**处定稿，因此 token 到达时只有尾部块在重渲染。`,``,`- 解析器按块记忆化`,`- 代码与列表像其他块一样流入`].join(`
`)}},ee={title:`React 19 Actions × haze-ui`,intro:[`React 19 turns the `,v(`<form>`),` element into an async state machine: `,v(`action`),` props accept server functions, `,v(`useActionState`),` wraps them with pending and error state, and `,v(`useOptimistic`),` paints the next value before the round trip lands. haze-ui is built to sit inside that machine: every value-holding component ships a native FormData bridge, the form layer speaks server-action results natively, and the controllable-state pattern gives optimistic UI a single write channel. The three sections below wire it all together — the `,x(`examples/nextjs actions-demo route`,`https://github.com/wmzy/haze-ui/tree/main/examples/nextjs/app/actions-demo`),` runs the same code against a real `,v(`'use server'`),` module.`],sections:[j(`native-form-actions`,`Server actions over native FormData`,C([`A React 19 form action is the most vanilla thing in the world: `,v(`<form action={createProfile}>`),` where `,v(`createProfile`),` is a `,v(`'use server'`),` function receiving the `,v(`FormData`),` the browser built from the form’s successful controls. No serialization layer, no client state mirror — and since the form still works as a plain POST, it submits even before hydration.`]),C([`That contract is native, and haze-ui meets it natively. Components that already render a real field element — `,v(`Input`),`, `,v(`Checkbox`),`, `,v(`Radio`),`, `,v(`Slider`),`’s `,v(`input[type='range']`),`, `,v(`FileInput`),` — submit through it directly: give them a `,v(`name`),` and they are done. Components whose visual control is not a field (`,v(`Switch`),` renders a `,v(`<button>`),`, `,v(`Rating`),` renders stars, `,v(`Select`),` floats its options) cannot rely on that — so when given a `,v(`name`),` they render a bridge: a hidden or clipped native input carrying the same name, kept in sync with the component value (`,v(`src/lib/utils/native-form.tsx`),`).`]),O([`Component`,`What FormData sees`],[[[v(`Input`),`, `,v(`Checkbox`),`, `,v(`Radio`),`, `,v(`Slider`),`, `,v(`FileInput`)],[`A real field element carries `,v(`name`),` — nothing extra to wire.`]],[[v(`Switch`)],[`Clipped checkbox bridge: submits `,v(`on`),` while checked, nothing while unchecked (the native successful-control rule).`]],[[v(`Rating`)],[`Hidden field with `,v(`String(value)`),`; the `,v(`0`),`-star sentinel submits nothing.`]],[[v(`Select`),` (single)`],[`Hidden field with the value; the `,v(`''`),` no-selection sentinel submits nothing.`]],[[v(`Select`),` (multiple / tags), `,v(`TagInput`)],[`One hidden input per value under the same name — read with `,v(`formData.getAll(name)`),`.`]],[[v(`Segmented`),`, `,v(`ColorPicker`),`, `,v(`OTPInput`),`, `,v(`RichTextEditor`)],[`The same hidden-field bridge — every value component without a native field.`]]]),E(`tsx`,`// app/actions.ts
'use server';
export async function createProfile(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  const role = String(formData.get('role') ?? '');         // '' — nothing picked
  const subscribe = formData.get('subscribe') === 'on';    // absent when off
  const rating = Number(formData.get('rating') ?? 0) || 0; // absent at 0 stars
  const tags = formData.getAll('tags').map(String);        // repeated field
  await saveProfile({ title, role, subscribe, rating, tags });
}`),E(`tsx`,`import { Button, Input, Option, Rating, Select, Switch, TagInput } from 'haze-ui';
export function ProfileForm({
  createProfile,
}: {
  createProfile: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={createProfile}>
      <Input name='title' required placeholder='Project title' />
      <Select name='role' value=''>
        <Option value=''>Pick a role…</Option>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </Select>
      <label>
        <Switch name='subscribe' /> Email updates
      </label>
      <Rating name='rating' value={0} />
      <TagInput name='tags' value={[]} placeholder='Add tag…' />
      <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
        Create profile
      </Button>
    </form>
  );
}`),D([v(`value={…}`),` with a plain value is the uncontrolled `,b(`initial`),` — the ControlOrValue convention. That is exactly what a form-action form wants: the DOM owns the field state, the action reads it once, on submit. (haze `,v(`Button`),` always renders `,v(`type='button'`),` — drive the form with `,v(`onClick={(e) => e.currentTarget.form?.requestSubmit()}`),`: `,v(`requestSubmit()`),` runs native constraint validation and the action pipeline, unlike `,v(`form.submit()`),`.)`]),A(`native-demo`),w([y(`The bridge is invisible and non-interactive.`),` Bridge inputs are `,v(`readOnly`),` + `,v(`tabIndex={-1}`),` + `,v(`aria-hidden`),` — they never join the tab order or the accessibility tree; only FormData sees them. Read the absences, not just the values: an unchecked `,v(`Switch`),` is `,b(`missing`),` from the payload (never `,v(`'off'`),`), and so are an empty `,v(`Select`),`, a 0-star `,v(`Rating`),` and an empty `,v(`TagInput`),`.`])),j(`use-action-state`,`useActionState: pending and server errors`,C([v(`useActionState`),` wraps a form action with the previous result, a dispatch function and a pending flag: `,v(`const [state, formAction, pending] = useActionState(action, initialState)`),`. Point it at a server action that returns a result object and the whole submit lifecycle — dispatch, awaited flight, state commit — is React’s. Because `,v(`formAction`),` is passed straight to `,v(`action`),`, a `,v(`'use server'`),` action keeps submitting before hydration here too.`]),E(`tsx`,`import { useActionState } from 'react';
import { Button, Input } from 'haze-ui';
type State = { error?: string; saved?: string };
export function SettingsForm() {
  const [state, formAction, pending] = useActionState(saveSettings, {});
  return (
    <form action={formAction}>
      <Input name='email' required placeholder='you@work.dev' />
      {state.error && (
        <p role='alert' aria-live='polite'>
          {state.error}
        </p>
      )}
      <Button
        loading={pending}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save settings
      </Button>
      {state.saved && <p>{state.saved}</p>}
    </form>
  );
}
// app/actions.ts
'use server';
export async function saveSettings(
  _prev: State,
  formData: FormData
): Promise<State> {
  const email = String(formData.get('email') ?? '');
  await new Promise((resolve) => setTimeout(resolve, 600)); // fake latency
  if (email.endsWith('@taken.dev')) {
    return { error: 'That address is already registered.' };
  }
  return { saved: 'Saved ' + email };
}`),C([v(`Button`),`’s `,v(`loading`),` prop is the pending surface: pass the flag straight through and the control disables itself, sets `,v(`aria-busy`),` and swaps in a spinner. Errors ride the state object — render them with `,v(`role='alert'`),` so assistive tech hears the rejection.`]),k(`The react-f0rm channel`),C([`When a form outgrows a handful of fields, haze-ui’s form layer takes the plumbing: `,v(`Form`),` and `,v(`FormItem`),`, re-exported from `,v(`'haze-ui'`),`. `,v(`Form`),` has its own `,v(`action`),` prop that speaks server actions natively — it hands the action `,b(`validated`),` FormData built from the form’s values (files, arrays and nested objects included), and it understands rejection: return `,v(`{ errors: { email: "…" } }`),` from the action and the record lands as per-field `,v(`type: 'server'`),` errors, rendered by the matching `,v(`FormItem`),`’s error span exactly like failed client validation.`]),E(`tsx`,`import {
  Button,
  Form,
  FormItem,
  InputCore,
  Option,
  SelectCore,
  useForm,
} from 'haze-ui';
import { useIsSubmitting } from 'react-f0rm';
type MemberValues = { email: string; role: string };
// app/actions.ts
// 'use server';
// export async function saveMember(formData: FormData) {
//   const email = String(formData.get('email') ?? '');
//   if (email.endsWith('@taken.dev')) {
//     return { errors: { email: 'That address is already registered.' } };
//   }
//   await db.members.save({
//     email,
//     role: String(formData.get('role') ?? ''),
//   });
// }

export function MemberForm({
  saveMember,
}: {
  saveMember: (
    formData: FormData
  ) => Promise<{ errors?: Record<string, string | string[]> } | void>;
}) {
  const form = useForm<MemberValues>({
    initialValues: { email: '', role: 'admin' },
  });
  const submitting = useIsSubmitting(form);
  // @types/react's own 'action' typing demands a void return; f0rm reads
  // the '{ errors }' rejection off the resolved value - one cast at the seam
  const memberAction = saveMember as unknown as (
    formData: FormData
  ) => Promise<void>;
  return (
    <Form form={form} action={memberAction}>
      <FormItem
        form={form}
        name='email'
        label='Email'
        rules={{ required: 'Email is required' }}
        mode='onBlur'
        input={InputCore}
      />
      <FormItem form={form} name='role' label='Role' input={SelectCore}>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </FormItem>
      <Button
        loading={submitting}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save member
      </Button>
    </Form>
  );
}`),w([v(`setServerErrors`),` (re-exported from `,v(`'haze-ui'`),`) lands plain REST responses the same way — `,v(`setServerErrors(form, { email: ["already taken"] })`),` — and a retry clears the previous round automatically, so each attempt is judged fresh. `,v(`useIsSubmitting`),` is the subscription hook behind `,v(`form.isSubmitting`),`; it comes from `,v(`react-f0rm`),`, haze-ui’s form engine, which form users already depend on.`]),A(`action-state-demo`)),j(`use-optimistic`,`useOptimistic: optimistic edits with rollback`,C([v(`useOptimistic`),` holds a shadow of the server’s state. While no transition is in flight the shadow `,b(`is`),` the state you passed (React returns your own argument); inside one, calling the optimistic setter swaps in whatever your reducer computed, until the transition settles — then React discards the shadow and re-renders from the source. Rollback is not code you write: it is what happens when the action ends without updating the source.`]),C([`The haze-ui side is the controllable-state pattern. The component must `,b(`track`),` the shadow, and a plain value cannot — plain values are uncontrolled `,b(`initials`),`, later prop changes are ignored. So hold the durable state with `,v(`useControl`),` (the control it returns is identity-stable), then point its read at the shadow and its write at the flight with `,v(`useThru`),`: the component now reads optimistic values, and its own edits start the transition — without knowing anything is optimistic.`]),k(`InlineEdit`),E(`tsx`,`import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { InlineEdit } from 'haze-ui';
export function DisplayName({ initial }: { initial: string }) {
  const [name, setName, nameCtrl] = useControl(undefined, initial);
  const [shown, markRenamed] = useOptimistic(
    name,
    (_committed, next: string) => next
  );
  function commitRename(next: SetStateAction<string>) {
    const value = typeof next === 'function' ? next(name) : next;
    startTransition(async () => {
      markRenamed(value);                    // optimistic paint
      const error = await renameAction(value); // 'use server'
      if (error) return;  // settle without writing -> automatic rollback
      setName(value);     // durable — the shadow collapses onto it
    });
  }
  // what InlineEdit sees: the shadow on read, the flight on write
  const optimisticCtrl = useThru(
    nameCtrl,
    () => [shown, commitRename]
  );
  return <InlineEdit value={optimisticCtrl} />;
}`),k(`TagInput`),E(`tsx`,`import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { TagInput } from 'haze-ui';
export function TagEditor({ initial }: { initial: string[] }) {
  const [tags, setTags, tagsCtrl] = useControl(undefined, initial);
  const [shown, markTags] = useOptimistic(
    tags,
    (_committed, next: string[]) => next
  );
  // TagInput's onChange emits the whole next list, so the reducer just
  // forwards it — adds, removals and reorderings all roll through
  function commitTags(next: SetStateAction<string[]>) {
    const value = typeof next === 'function' ? next(tags) : next;
    startTransition(async () => {
      markTags(value);
      const ok = await saveTagsAction(value); // 'use server'
      if (!ok) return;    // settle without writing -> automatic rollback
      setTags(value);
    });
  }
  const optimisticCtrl = useThru(tagsCtrl, () => [shown, commitTags]);
  // name='tags' keeps the FormData bridge alive too
  return <TagInput name='tags' value={optimisticCtrl} />;
}`),A(`optimistic-demo`),T([y(`Optimistic writes live inside transitions.`),` `,v(`markRenamed`),` called outside an action or transition has no flight to outlive — React refuses with `,b(`“An optimistic state update occurred outside a transition or action.”`)],[y(`End the flight with the truth.`),` Success writes durable state — `,v(`setName`),` / `,v(`setTags`),`, or a `,v(`router.refresh()`),` revalidation; failure writes nothing, and the automatic revert `,b(`is`),` the rollback. An action that settles without writing leaves the UI exactly where the server left it.`],[y(`Make the rollback audible.`),` A silent revert looks like the app ignoring the user. Fire a `,v(`useToast`),` on failure so the conversation continues.`]))],ui:{payloadHeading:`What the server receives`,payloadEmpty:`Nothing yet — submit the form.`,titlePlaceholder:`Project title`,rolePlaceholder:`Pick a role…`,subscribeLabel:`Email updates`,tagsPlaceholder:`Add tag…`,submitLabel:`Submit`,emailPlaceholder:`you@work.dev`,takenError:`That address is already registered.`,tryHint:`End the address with @taken.dev to see the rejection path.`,settingsSubmitLabel:`Save settings`,savedAs:`Saved `,nameLabel:`Display name`,tagsLabel:`Tags`,rejectLabel:`Reject the next save`,savedNote:`Saved.`,rolledBackNote:`Rejected — the optimistic value rolled back.`}},te={title:`React 19 Actions × haze-ui 实战`,intro:[`React 19 把 `,v(`<form>`),` 变成了一台异步状态机：`,v(`action`),` prop 接受服务端函数，`,v(`useActionState`),` 为它包上 pending 与错误态，`,v(`useOptimistic`),` 则在往返落地之前先画出下一个值。haze-ui 生来就坐在这台机器里：每个持有值的组件都内置原生 FormData 桥，表单层原生理解 server action 的返回，controllable-state 模式给乐观 UI 一条单一写入通道。下面三节把它们全部接起来——`,x(`examples/nextjs 的 actions-demo 路由`,`https://github.com/wmzy/haze-ui/tree/main/examples/nextjs/app/actions-demo`),`用真实的 `,v(`'use server'`),` 模块运行同样的代码。`],sections:[j(`native-form-actions`,`Server action 走原生 FormData`,C([`React 19 的表单 action 是世上最朴素的东西：`,v(`<form action={createProfile}>`),`，其中 `,v(`createProfile`),` 是一个 `,v(`'use server'`),` 函数，接收浏览器从表单成功控件构建出的 `,v(`FormData`),`。没有序列化层，也没有客户端状态镜像——而且表单仍是一个真实的 POST，水合之前也能提交。`]),C([`这个契约是原生的，haze-ui 也以原生方式接住。本身就渲染真实字段元素的组件——`,v(`Input`),`、`,v(`Checkbox`),`、`,v(`Radio`),`、`,v(`Slider`),` 的 `,v(`input[type='range']`),`、`,v(`FileInput`),`——直接走原生提交：给它们一个 `,v(`name`),` 就完事了。视觉控件不是字段的组件（`,v(`Switch`),` 渲染 `,v(`<button>`),`，`,v(`Rating`),` 渲染星星，`,v(`Select`),` 的选项是浮层）没法指望原生——所以一旦给了 `,v(`name`),`，它们会渲染一座桥：一个携带同名 `,v(`name`),` 的隐藏（或裁剪）原生 input，与组件值保持同步（`,v(`src/lib/utils/native-form.tsx`),`）。`]),O([`组件`,`FormData 里是什么`],[[[v(`Input`),`、`,v(`Checkbox`),`、`,v(`Radio`),`、`,v(`Slider`),`、`,v(`FileInput`)],[`真实字段元素自带 `,v(`name`),`——无需任何额外接线。`]],[[v(`Switch`)],[`裁剪 checkbox 桥：勾选时提交 `,v(`on`),`，未勾选什么都不提交（原生成功控件规则）。`]],[[v(`Rating`)],[`隐藏字段携带 `,v(`String(value)`),`；`,v(`0`),` 星哨兵不提交。`]],[[v(`Select`),`（单选）`],[`隐藏字段携带当前值；`,v(`''`),` 未选哨兵不提交。`]],[[v(`Select`),`（多选 / tags）、`,v(`TagInput`)],[`同名下每个值一个隐藏 input——用 `,v(`formData.getAll(name)`),` 读取。`]],[[v(`Segmented`),`、`,v(`ColorPicker`),`、`,v(`OTPInput`),`、`,v(`RichTextEditor`)],[`同样的隐藏字段桥——所有没有原生字段的值组件都走这条路。`]]]),E(`tsx`,`// app/actions.ts
'use server';
export async function createProfile(formData: FormData) {
  const title = String(formData.get('title') ?? '');
  const role = String(formData.get('role') ?? '');         // '' — nothing picked
  const subscribe = formData.get('subscribe') === 'on';    // absent when off
  const rating = Number(formData.get('rating') ?? 0) || 0; // absent at 0 stars
  const tags = formData.getAll('tags').map(String);        // repeated field
  await saveProfile({ title, role, subscribe, rating, tags });
}`),E(`tsx`,`import { Button, Input, Option, Rating, Select, Switch, TagInput } from 'haze-ui';
export function ProfileForm({
  createProfile,
}: {
  createProfile: (formData: FormData) => Promise<void>;
}) {
  return (
    <form action={createProfile}>
      <Input name='title' required placeholder='Project title' />
      <Select name='role' value=''>
        <Option value=''>Pick a role…</Option>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </Select>
      <label>
        <Switch name='subscribe' /> Email updates
      </label>
      <Rating name='rating' value={0} />
      <TagInput name='tags' value={[]} placeholder='Add tag…' />
      <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
        Create profile
      </Button>
    </form>
  );
}`),D([`ControlOrValue 约定下，传普通值的 `,v(`value={…}`),` 是非受控的`,b(`初始值`),`。这正是表单 action 表单想要的：DOM 持有字段状态，action 在提交时一次性读取。（haze `,v(`Button`),` 恒渲染 `,v(`type='button'`),`——用 `,v(`onClick={(e) => e.currentTarget.form?.requestSubmit()}`),` 驱动表单：`,v(`requestSubmit()`),` 会跑原生约束校验与 action 管线，`,v(`form.submit()`),` 不会。）`]),A(`native-demo`),w([y(`桥是不可见且不可交互的。`),`桥 input 都是 `,v(`readOnly`),` + `,v(`tabIndex={-1}`),` + `,v(`aria-hidden`),`——它们从不进入 Tab 焦点序或可访问树，只有 FormData 看得见它们。读缺失和读值同样重要：未勾选的 `,v(`Switch`),` 在载荷里是`,b(`缺失`),`的（绝不是 `,v(`'off'`),`），空 `,v(`Select`),`、0 星 `,v(`Rating`),`、空 `,v(`TagInput`),` 同理。`])),j(`use-action-state`,`useActionState：pending 与服务端错误`,C([v(`useActionState`),` 为表单 action 包上「上一次结果、dispatch 函数、pending 标志」三件套：`,v(`const [state, formAction, pending] = useActionState(action, initialState)`),`。把它指向一个返回结果对象的服务端 action，整个提交生命周期——派发、等待往返、状态提交——都归 React。由于 `,v(`formAction`),` 直接传给 `,v(`action`),`，`,v(`'use server'`),` 的 action 在这里同样保持水合前可提交。`]),E(`tsx`,`import { useActionState } from 'react';
import { Button, Input } from 'haze-ui';
type State = { error?: string; saved?: string };
export function SettingsForm() {
  const [state, formAction, pending] = useActionState(saveSettings, {});
  return (
    <form action={formAction}>
      <Input name='email' required placeholder='you@work.dev' />
      {state.error && (
        <p role='alert' aria-live='polite'>
          {state.error}
        </p>
      )}
      <Button
        loading={pending}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save settings
      </Button>
      {state.saved && <p>{state.saved}</p>}
    </form>
  );
}
// app/actions.ts
'use server';
export async function saveSettings(
  _prev: State,
  formData: FormData
): Promise<State> {
  const email = String(formData.get('email') ?? '');
  await new Promise((resolve) => setTimeout(resolve, 600)); // fake latency
  if (email.endsWith('@taken.dev')) {
    return { error: 'That address is already registered.' };
  }
  return { saved: 'Saved ' + email };
}`),C([v(`Button`),` 的 `,v(`loading`),` prop 就是 pending 的呈现面：把标志原样传进去，控件会自行禁用、置 `,v(`aria-busy`),` 并换入加载指示。错误随状态对象返回——用 `,v(`role='alert'`),` 渲染，让辅助技术听到拒绝。`]),k(`react-f0rm 通道`),C([`当表单长过寥寥几个字段，haze-ui 的表单层接管这些管线：从 `,v(`'haze-ui'`),` 导入的 `,v(`Form`),` 与 `,v(`FormItem`),`。`,v(`Form`),` 自己的 `,v(`action`),` prop 原生理解 server action——它交给 action 的是由表单值构建的`,b(`已校验`),` FormData（含文件、数组与嵌套对象），而且它理解拒绝：action 返回 `,v(`{ errors: { email: "…" } }`),`，这份记录会以 `,v(`type: 'server'`),` 的字段错误落地，由对应的 `,v(`FormItem`),` 错误 span 渲染——与客户端校验失败完全同构。`]),E(`tsx`,`import {
  Button,
  Form,
  FormItem,
  InputCore,
  Option,
  SelectCore,
  useForm,
} from 'haze-ui';
import { useIsSubmitting } from 'react-f0rm';
type MemberValues = { email: string; role: string };
// app/actions.ts
// 'use server';
// export async function saveMember(formData: FormData) {
//   const email = String(formData.get('email') ?? '');
//   if (email.endsWith('@taken.dev')) {
//     return { errors: { email: 'That address is already registered.' } };
//   }
//   await db.members.save({
//     email,
//     role: String(formData.get('role') ?? ''),
//   });
// }

export function MemberForm({
  saveMember,
}: {
  saveMember: (
    formData: FormData
  ) => Promise<{ errors?: Record<string, string | string[]> } | void>;
}) {
  const form = useForm<MemberValues>({
    initialValues: { email: '', role: 'admin' },
  });
  const submitting = useIsSubmitting(form);
  // @types/react's own 'action' typing demands a void return; f0rm reads
  // the '{ errors }' rejection off the resolved value - one cast at the seam
  const memberAction = saveMember as unknown as (
    formData: FormData
  ) => Promise<void>;
  return (
    <Form form={form} action={memberAction}>
      <FormItem
        form={form}
        name='email'
        label='Email'
        rules={{ required: 'Email is required' }}
        mode='onBlur'
        input={InputCore}
      />
      <FormItem form={form} name='role' label='Role' input={SelectCore}>
        <Option value='admin'>Admin</Option>
        <Option value='editor'>Editor</Option>
      </FormItem>
      <Button
        loading={submitting}
        onClick={(e) => e.currentTarget.form?.requestSubmit()}
      >
        Save member
      </Button>
    </Form>
  );
}`),w([v(`setServerErrors`),`（同样从 `,v(`'haze-ui'`),` 再导出）以相同方式落地普通 REST 响应——`,v(`setServerErrors(form, { email: ["already taken"] })`),`——而重试会自动先清掉上一轮，每次提交都按新尝试裁决。`,v(`useIsSubmitting`),` 是 `,v(`form.isSubmitting`),` 背后的订阅 hook，来自 `,v(`react-f0rm`),`（haze-ui 的表单引擎，表单用户本来就依赖它）。`]),A(`action-state-demo`)),j(`use-optimistic`,`useOptimistic：乐观更新与回滚`,C([v(`useOptimistic`),` 持有服务端状态的一道影子。没有 transition 在飞时，影子`,b(`就是`),`你传入的状态（React 原样返回你的参数）；transition 进行中，乐观 setter 一调用就换成 reducer 算出的值，直到 transition 收尾——React 随即丢弃影子、按源状态重渲染。回滚不是你写的代码：action 结束时没有更新源状态，回滚就发生了。`]),C([`haze-ui 这一侧靠的是 controllable-state 模式。组件必须`,b(`跟随`),`影子，而普通值做不到——普通值是非受控`,b(`初始值`),`，后续 prop 变化会被忽略。所以用 `,v(`useControl`),` 持有持久状态（它返回的 control 身份稳定），再用 `,v(`useThru`),` 把读指向影子、把写指向这次飞行：组件读到的就是乐观值，用户编辑直接开启 transition——组件自己对「乐观」一无所知。`]),k(`InlineEdit`),E(`tsx`,`import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { InlineEdit } from 'haze-ui';
export function DisplayName({ initial }: { initial: string }) {
  const [name, setName, nameCtrl] = useControl(undefined, initial);
  const [shown, markRenamed] = useOptimistic(
    name,
    (_committed, next: string) => next
  );
  function commitRename(next: SetStateAction<string>) {
    const value = typeof next === 'function' ? next(name) : next;
    startTransition(async () => {
      markRenamed(value);                    // optimistic paint
      const error = await renameAction(value); // 'use server'
      if (error) return;  // settle without writing -> automatic rollback
      setName(value);     // durable — the shadow collapses onto it
    });
  }
  // what InlineEdit sees: the shadow on read, the flight on write
  const optimisticCtrl = useThru(
    nameCtrl,
    () => [shown, commitRename]
  );
  return <InlineEdit value={optimisticCtrl} />;
}`),k(`TagInput`),E(`tsx`,`import { startTransition, useOptimistic } from 'react';
import type { SetStateAction } from 'react';
import { useControl, useThru } from 'react-use-control';
import { TagInput } from 'haze-ui';
export function TagEditor({ initial }: { initial: string[] }) {
  const [tags, setTags, tagsCtrl] = useControl(undefined, initial);
  const [shown, markTags] = useOptimistic(
    tags,
    (_committed, next: string[]) => next
  );
  // TagInput's onChange emits the whole next list, so the reducer just
  // forwards it — adds, removals and reorderings all roll through
  function commitTags(next: SetStateAction<string[]>) {
    const value = typeof next === 'function' ? next(tags) : next;
    startTransition(async () => {
      markTags(value);
      const ok = await saveTagsAction(value); // 'use server'
      if (!ok) return;    // settle without writing -> automatic rollback
      setTags(value);
    });
  }
  const optimisticCtrl = useThru(tagsCtrl, () => [shown, commitTags]);
  // name='tags' keeps the FormData bridge alive too
  return <TagInput name='tags' value={optimisticCtrl} />;
}`),A(`optimistic-demo`),T([y(`乐观写入只活在 transition 里。`),`在 action 或 transition 之外调用 `,v(`markRenamed`),` 没有可依附的飞行——React 会直接拒绝：`,b(`“An optimistic state update occurred outside a transition or action.”`)],[y(`用真相结束飞行。`),`成功就写持久状态——`,v(`setName`),` / `,v(`setTags`),`，或 `,v(`router.refresh()`),` 重新验证；失败什么都不写，自动回退`,b(`就是`),`回滚。settled 时没有写入的 action 会把 UI 精确留在服务端认可的位置。`],[y(`让回滚被听见。`),`无声的回退看起来像应用无视了用户。失败时发一个 `,v(`useToast`),`，让对话继续下去。`]))],ui:{payloadHeading:`服务端将收到`,payloadEmpty:`还没有数据——提交表单试试。`,titlePlaceholder:`项目名称`,rolePlaceholder:`选择角色…`,subscribeLabel:`邮件通知`,tagsPlaceholder:`添加标签…`,submitLabel:`提交`,emailPlaceholder:`you@work.dev`,takenError:`该邮箱已被注册。`,tryHint:`邮箱以 @taken.dev 结尾可触发拒绝路径。`,settingsSubmitLabel:`保存设置`,savedAs:`已保存 `,nameLabel:`显示名称`,tagsLabel:`标签`,rejectLabel:`让下一次保存失败`,savedNote:`已保存。`,rolledBackNote:`被拒绝——乐观值已回滚。`}},ne={a11y:{en:B,zh:V},a11yContracts:{en:H,zh:U},darkMode:{en:W,zh:G},density:{en:K,zh:q},migration:{en:J,zh:Y},motion:{en:X,zh:Z},serverActions:{en:ee,zh:te},streamingA11y:{en:Q,zh:$}};function re(e,t){let n=ne[e];return n[t]??n.en}function ie(e){let{locale:t}=i();return re(e,t)}function ae({blocks:e,slots:t}){return(0,l.jsx)(l.Fragment,{children:e.map((e,n)=>{switch(e.type){case`p`:return(0,l.jsx)(`p`,{className:u,children:(0,l.jsx)(a,{text:e.text,codeClass:d})},n);case`note`:return(0,l.jsx)(`div`,{className:p,children:(0,l.jsx)(a,{text:e.text,codeClass:d})},n);case`list`:return(0,l.jsx)(`ul`,{className:h,children:e.items.map((e,t)=>(0,l.jsx)(`li`,{children:(0,l.jsx)(a,{text:e,codeClass:d})},t))},n);case`code`:return(0,l.jsx)(r,{language:e.language,className:f,children:e.code},n);case`caption`:return(0,l.jsx)(`p`,{className:m,children:(0,l.jsx)(a,{text:e.text,codeClass:d})},n);case`table`:return(0,l.jsx)(`div`,{className:g,children:(0,l.jsxs)(`table`,{className:_,children:[(0,l.jsx)(`thead`,{children:(0,l.jsx)(`tr`,{children:e.headers.map((e,t)=>(0,l.jsx)(`th`,{children:(0,l.jsx)(a,{text:e})},t))})}),(0,l.jsx)(`tbody`,{children:e.rows.map((e,t)=>(0,l.jsx)(`tr`,{children:e.map((e,t)=>(0,l.jsx)(`td`,{children:(0,l.jsx)(a,{text:e})},t))},t))})]})},n);case`h3`:return(0,l.jsx)(`h3`,{children:e.text},n);case`slot`:return(0,l.jsx)(c.Fragment,{children:t?.[e.name]??null},n)}})})}function oe({doc:e,slots:t}){return(0,l.jsxs)(l.Fragment,{children:[(0,l.jsx)(`p`,{className:o,children:(0,l.jsx)(a,{text:e.intro,codeClass:d})}),e.sections.map(e=>(0,l.jsxs)(`div`,{className:s,children:[(0,l.jsx)(`h2`,{children:e.heading}),(0,l.jsx)(ae,{blocks:e.blocks,slots:t})]},e.id))]})}export{ie as n,oe as t};