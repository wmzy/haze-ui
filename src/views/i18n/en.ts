/*
 * English source dictionary for the docs-site locale layer (./index.tsx).
 *
 * This is the extraction base: every user-visible string that the site
 * chrome (Layout/CommandPalette/SidebarSearch), Home, GettingStarted,
 * ComponentDetail and the sidebar component groups render lives here as
 * flat data, so zh.ts can override any subset (DeepPartial) while missing
 * keys fall back to these values.
 *
 * Conventions:
 *  - Plain strings for simple copy; `{placeholder}` tokens are expanded by
 *    `fill()` from ./index.tsx.
 *  - Paragraphs that mix prose with inline `<code>`/`<strong>` runs use
 *    RichText segments (GettingStarted) so the en rendering stays
 *    byte-identical to the hand-written JSX it replaced.
 *  - `components` is keyed by display name (component-groups.ts) — the
 *    one-line blurbs mirror scripts/generate-llms.mjs DESCRIPTIONS
 *    (backticks stripped for HTML rendering).
 */

/** One run of a rich paragraph: plain text, inline code, bold, italic or a link. */
export type RichSeg =
  | string
  | { code: string }
  | { strong: string }
  | { em: string }
  | { link: string; href: string };

/** A paragraph rendered by `Rich` (./index.tsx). */
export type RichText = readonly RichSeg[];

/* Component one-liners (en source): keyed by display name, mirroring the
 * DESCRIPTIONS table in scripts/generate-llms.mjs (markdown backticks
 * stripped for HTML rendering). An open record — the dictionary parity
 * test pins key coverage against component-groups.ts. */
const COMPONENT_BLURBS = {
  Avatar:
    'User avatar with image, size variants and fallback content when the image is missing.',
  AvatarGroup:
    'Stacks avatars in overlapping rows with a +N overflow chip (max/total).',
  Badge: 'Small inline status label with variant and color options.',
  Button:
    'Action button with variant/size/square options; native <button> under the hood.',
  ButtonGroup:
    'Attached button bar: merged corners and seams, group-wide size/variant/disabled, separator sub-component.',
  CountUp:
    'Animated number ticker: rAF + ease-out interpolation toward the target, honoring prefers-reduced-motion with an instant snap.',
  Countdown:
    'Deadline countdown: boundary-aligned ticks, onFinish fires once, adaptive d/h:mm:ss formatting.',
  Divider: 'Content separator line, horizontal or vertical.',
  Ellipsis:
    'Interactive text truncation: N-line clamp with truncation detection, optional tooltip and expand/collapse.',
  Icon: 'Inline SVG icon wrapper with token-sized sm/md/lg boxes.',
  Tag: 'Compact status label with variant color and an optional close button.',
  TagGroup:
    'Flex-wrap container laying out Tag children with consistent gap; sortable + onReorder for drag reordering.',
  Typography: 'Text primitives: Title, Text, Paragraph on typography tokens.',

  // Layout
  AspectRatio: 'Boxes children to a fixed width/height ratio.',
  AppShell:
    'Application frame with sticky header, collapsible sidebar, content and footer slots; sidebar turns overlay below 768px.',
  Container: 'Centered max-width page container with horizontal padding.',
  Flex: 'Flexbox layout primitive mapping props to flex CSS.',
  Grid: 'CSS grid layout primitive.',
  Masonry:
    'Pinboard layout: JS greedy column distribution balances children across columns (order-first, shortest-column-next).',
  Resizable:
    'Split-pane group with draggable dividers (ResizableGroup, horizontal or vertical); px defaultSize/minSize/maxSize per panel, collapsible panels and onResizeCommit for persistence.',
  ScrollArea:
    'Scrollable region with custom-styled thin scrollbars and maxHeight.',
  Sidebar:
    'App sidebar shell with controllable collapsed state (aside + rail width tokens).',
  Splitter:
    'Splitter: multi-pane split layout with implicit draggable dividers (AntD Splitter semantics); sizes as percentages of the pane area via a single ControlOrValue number[] prop, per-pane min/max percent clamps, opt-in collapsible panes (divider collapse/expand triggers restore the pre-collapse split), keyboard arrows (5% steps) and Home/End, live onSizesChange; for px-sized panes see Resizable.',
  ActivityRail:
    'VSCode-style vertical icon rail (nav): 44px items with icon/label/badge and active indicator, tooltip labels, slot="end" bottom pinning. orientation="horizontal" lays it out as a strip — Workbench does this automatically when the rail is docked inside the sidebar column.',
  StatusBar:
    'VSCode-style status strip (footer): left/right groups, selectable StatusItems, priority items survive the mobile breakpoint.',
  TabBar:
    'Mobile bottom navigation (the ActivityRail viewport peer): 56px safe-area-aware strip, badge, onSelect/onReselect semantics.',
  Workbench:
    'IDE-style application frame (100dvh): activityBar/sidebar/auxiliaryBar/panel/statusBar/tabBar slots with px-resizable collapsible regions and a maximizable bottom panel; the rail docks beside the sidebar or inside it (top/bottom, Cursor-style); below 768px the frame changes shape — the rail becomes a full-width horizontal bar above the editor and the sidebar a separate full-screen layer (closed by default, opened from the tabBar).',

  // Forms
  Cascader:
    'Multi-level drill-down selector committing a path of option values; onSearch filters remotely while loading shows the pending state.',
  Checkbox: 'Checkbox input with controllable checked state.',
  ColorPicker: 'Color selector with controllable value and preset swatches.',
  Combobox:
    'Autocomplete text input with filterable option list; onSearch defers filtering to the host.',
  DateField:
    'Segmented date input (year/month/day spinbuttons) typed directly — no calendar.',
  Datepicker:
    'Date input with popup calendar (YYYY-MM-DD value); showTime adds a time-of-day field.',
  DateTimePicker:
    'Date+time picker (Datepicker with the time row always on); showSeconds opt-in; value serializes YYYY-MM-DD HH:mm[:ss].',
  DateRangePicker:
    'Picks a start/end date range, with built-in or custom presets (Today, Last 7 days, …).',
  Fieldset:
    'Semantic fieldset+legend grouping for form sections; disabled disables every control inside.',
  FileInput: 'Trigger element that opens a hidden native file input.',
  Form: 'react-f0rm field wrapper adding label, error and aria wiring to controlled cores.',
  ImageCrop:
    'Interactive image cropper pairing with Upload: controllable normalized crop rect, aspect lock, circle avatar mask, and full keyboard operation (arrows move, Shift+arrows resize).',
  InlineEdit: 'Click-to-edit text value in place.',
  Input: 'Text input with adornments; sugar over InputCore.',
  InputGroup:
    'Field cluster: prefix/suffix addons (icon, text, button) merged with Input/Select into one attached control.',
  Meter:
    'Read-only semantic gauge with threshold bands that recolor track and bar as the value crosses each bound.',
  CopyButton:
    'One-click copy button with a copied feedback state, plus Snippet: the inline code chip with a docked copy button.',
  Heatmap:
    'GitHub-style activity calendar: intensity-binned day squares over week columns, theme-aware color scale, label props for i18n.',
  TimeGrid:
    'Time slot picker grid generated from a window and step; arrow keys roam and select, controllable value.',
  Mentions:
    'Mentions input with trigger-character suggestions picked from an option list.',
  NumberInput: 'Numeric input with min/max/step.',
  OTPInput: 'One-time-password input of length segmented character boxes.',
  PasswordInput: 'Text input with a visibility reveal toggle.',
  Radio: 'Radio option and group with controllable selection.',
  Rating: 'Star rating with half-step support.',
  RichTextEditor:
    'Tiptap-powered rich text editor with a built-in formatting toolbar and controllable HTML value.',
  Segmented: 'Segmented control selecting one option from a compact set.',
  Select:
    'Dropdown select over SelectCore with <option> children; onSearch enables server-side filtering.',
  Signature:
    'Canvas signature pad committing a PNG data URL on every stroke, with undo, clear and a no-canvas fallback notice.',
  Slider: 'Native range slider with controllable value.',
  Switch: 'Toggle switch (role="switch") with controllable checked.',
  TagInput:
    'Enter-to-commit token input over TagInputCore; sortable enables drag reordering (new order via onChange).',
  Textarea: 'Multiline text input.',
  TimePicker: 'Time-of-day input with controllable value.',
  TimeField:
    'Segmented time input (hour/minute/second spinbuttons, optional 12-hour AM/PM).',
  Toggle:
    'Two-state pressed button (aria-pressed) with sizes and square icon mode; ToolbarToggle variant rides toolbar roving focus.',
  Transfer:
    'Two-column shuttle moving options between source and target lists.',
  TreeSelect:
    'Tree selection in a floating panel: selectable rows commit one key, cascading checkboxes commit string[], with panel search, lazy loadData and chip overflow.',
  Upload:
    'File picker with accumulating File[] value, accept/multiple, directory picking and listType rendering.',

  // Overlays
  BottomSheet: 'Mobile-style sheet sliding from the bottom screen edge.',
  ConfirmDialog:
    'Ready-made confirm dialog with confirm/cancel actions and a danger variant.',
  ContextMenu: 'Floating menu opened on right-click.',
  Dialog: 'Modal dialog with focus trapping.',
  Drawer: 'Edge-anchored sliding panel (placement left/right).',
  DropdownMenu: 'Click-triggered floating menu.',
  HoverCard:
    'Non-modal floating preview (avatar card, link summary) anchored to its trigger.',
  Menu: 'Lightweight toggle menu with a trigger and statically positioned panel (MenuItem, MenuDivider).',
  Popover: 'Floating popover anchored to a trigger element.',
  Tooltip: 'Hover/focus hint bubble.',

  // Data Display
  Accordion: 'Collapsible section list (AccordionItem with title).',
  Calendar: 'Month-grid date surface with min/max, locale and weekStartsOn.',
  Card: 'Content card with elevated/outlined/filled variants.',
  Carousel: 'Slideshow with controllable active index and autoplay.',
  Chart:
    'Line/area/bar/pie charts over recharts, colors and axes on haze tokens; series cycle the semantic palette, renderTooltip customizes the tooltip.',
  Chip: 'Rounded status chip with optional icon and close button.',
  CodeBlock:
    'Monospace code container with a language badge; highlight plugs in an async syntax highlighter.',
  DataTable:
    'Feature table on @tanstack/react-table (sorting, row selection, client or manual pagination); dataTableToCsv exports the rows.',
  Descriptions:
    'Definition-list description groups (dl/dt/dd on CSS Grid): items pairs, columns, bordered, size.',
  Image: 'Image with fallback and aspectRatio/objectFit control.',
  Indicator: 'Corner badge attached to a host element: dot or count label, tone + corner position, showZero.',
  JsonView:
    'Collapsible JSON tree viewer with per-kind leaf colors, depth-based default expansion, truncation hints and an optional copy button.',
  Kbd: 'Keyboard key-cap styling for shortcuts.',
  List: 'Styled ul/ol/plain list variants.',
  Mark: 'Text-level highlight (semantic mark element) in status tones.',
  Highlight: 'Search-result text highlighting across a string; multiple needles, escaped (no innerHTML).',
  NumberFormatter: 'Presentational number formatting on Intl: locale, formatOptions (currency/unit/percent), prefix/suffix.',
  Progress: 'Progress bar or circle driven by a percentage value.',
  QRCode:
    'QR code rendered as one crisp SVG path with value/size/level/bordered options and theme-token module/background colors.',
  Schedule:
    'Calendar surface with day/week/month views, drag-and-keyboard rescheduling and a month grid with overflow chips.',
  Stat: 'Metric display with title, value and trend indicator.',
  Sparkline:
    'Inline SVG mini trend chart: stateless, recharts-free and RSC-safe; line or filled area variants on semantic tone tokens.',
  Table: 'Styled semantic table (striped, bordered).',
  Timeline: 'Vertical timeline container for TimelineItem children.',
  Tree: 'Hierarchical tree with expand, select and check state, async loadData and searchValue filtering.',
  VirtualList:
    'Windowed list rendering only visible rows; fixed or measured dynamic heights.',
  Watermark:
    'Tiled canvas watermark layer over children (or fullscreen); theme-aware color, degrades gracefully without canvas 2d support.',

  // Navigation
  Affix: 'Fixes children to a viewport edge once scrolled past an offset.',
  Anchor:
    'Sticky scroll-spy navigation: items list highlighting the active section (IntersectionObserver, controllable activeId), click scrolls with offsetTop.',
  BackToTop: 'Floating scroll-to-top button appearing past a scroll threshold.',
  Breadcrumb: 'Breadcrumb trail nav with configurable separator.',
  Command:
    'Command palette surface: CommandInput plus filterable CommandItems.',
  FloatButton:
    'Floating action button over the page; FloatButtonGroup stacks actions behind an expand trigger, with back-to-top and help glyphs built in.',
  NavigationBar: 'Top nav bar with brand and end slots.',
  NavigationMenu:
    'Hover mega-menu navigation: triggers open large content panels with intent dwell and pointer grace; controllable activeValue.',
  Pagination: 'Page navigation with controllable page and ellipsis windows.',
  Stepper: 'Step indicator driven by activeStep (Step children).',
  Tabs: 'Tab panel switcher with controllable active tab.',
  Toolbar:
    'Button group with toolbar a11y (roving tabindex; ToolbarButton, ToolbarSeparator).',
  Tour: 'Guided walkthrough spotlighting steps behind a mask, controllable current.',

  // Feedback
  Alert: 'Inline status message box.',
  AsyncSection: 'Declarative loading / error / content states for async data.',
  Banner: 'Dismissible top banner with info/success/warning/danger variants.',
  Empty: 'Empty-state placeholder with image and description.',
  ErrorBoundary:
    'Render-error boundary catching subtree throws: fallback node or render prop with a reset callback; resetKeys shallow-change resets.',
  Result:
    'Result feedback page: status illustration (success/error/info/warning/403/404/500), title, subTitle and an extra action area; icon replaces the default illustration.',
  Skeleton: 'Shimmering loading placeholder (text/circular/rectangular).',
  Spinner: 'Loading spinner.',
  LoadingOverlay: 'Container-level loading state: dims content, centers a spinner (or custom loader), aria-busy mirrors the phase.',
  Spoiler:
    'Collapsed long-content gate (show more/less): height-capped preview with fade edge, controllable expanded.',
  VisuallyHidden:
    'Screen-reader-only content primitive: clipped off the visual canvas, kept in the a11y tree.',
  Toast:
    'Toast notifications via useToast + ToastContainer (imperative toast() helper included).',

  // AI & Chat
  ApprovalCard:
    'Approval gate with approve / deny actions for agent-initiated operations.',
  ChatContainer:
    'Chat transcript scroll container with stick-to-bottom auto-scroll.',
  ChatInput: 'Message composer with a controllable value and onSend callback.',
  ChatMessage:
    'Chat bubble with role-based layout (user / assistant / system), avatar, name, timestamp and delivery status.',
  ConversationList:
    'Selectable list of conversations for a chat-history sidebar.',
  DiffViewer:
    'Renders the line diff between old and new content for agent-proposed edits.',
  FilePreview:
    'Attachment card with image thumbnail or extension badge, upload progress and remove/retry actions.',
  InlineCitation:
    'Inline superscript citation marker that opens a floating source card with title, snippet and optional outbound link.',
  InlineCompletion:
    'Ghost-text completion overlay for input/textarea; Tab accepts the suggestion, Escape dismisses it.',
  LogViewer: 'Scrollable log stream with severity-level filtering.',
  MarkdownRenderer:
    'Renders markdown content (including code blocks) for assistant responses.',
  ModelPicker: 'Controllable dropdown for selecting the active model.',
  Plan:
    'Agent plan and progress display: a titled step list whose per-item statuses drive an auto progress bar and summary.',
  PromptInput:
    'AI prompt composer: auto-growing textarea with inline context tags, @-trigger suggestions and a configurable submit key.',
  Queue:
    'Queue of pending agent actions or messages with queued/sending/failed status and optional per-item removal.',
  Sources:
    'Numbered citation list for RAG answers; excerpts reveal on hover/focus with a controllable expanded set, compact renders inline [1] [2] badges.',
  StepTimeline:
    'Vertical timeline of agent execution steps with per-step status, timing, collapsible detail panels and nested sub-steps.',
  StreamingText:
    'Typewriter effect that reveals streaming text character by character, with an optional cursor.',
  ThinkingIndicator:
    'Animated bouncing-dots indicator that the agent is processing.',
  TokenCounter: 'Context-window token usage counter with budget progress.',
  ToolCallCard:
    'Card presenting an agent tool call — name, input, output and running state.',

  // Utilities
  Collapsible: 'Unstyled open/close container with controllable open state.',
  Disclosure: 'Summary-header disclosure panel (details/summary semantics).',
  Fullscreen:
    'Wrap-mode Fullscreen API binding around a single trigger child with controllable fullscreen state; useFullscreen() hook also exported.',
  LocaleProvider:
    'Supplies UI string packs (built-in English, zh-CN and ja-JP) to locale-aware components; direction (explicit or locale-derived) feeds useDirection(); createStrings(base, overrides) derives packs without forking the table.',
  ConfigProvider:
    'Component prop-default overrides (Button size, Toast duration/placement, Tooltip delay, HoverCard open/close delay) read via useConfigDefaults(); explicit props always win, providers nest with shallow per-section merge.',
  SwipeAction:
    'Swipe-to-reveal row actions on left/right edges with a commit threshold.',
};

export const en = {
  chrome: {
    openNavigation: 'Open navigation',
    light: 'Light',
    dark: 'Dark',
    auto: 'Auto',
    language: 'Language',
    noCustomTheme: 'No custom theme',
    themeEditor: 'Theme Editor',
    viewSourceAt: 'View source at {version} ({commit})',
    viewSource: 'View source on GitHub',
    starOnGitHub: 'Star on GitHub',
    search: 'Search',
    searchComponents: 'Search components',
    searchPlaceholder: 'Search components…',
    clearSearch: 'Clear search',
    noComponentsMatch: 'No components match “{query}”',
    noResultsMatch: 'No results match “{query}”',
    docs: 'Docs',
  },
  nav: {
    home: 'Home',
    gettingStarted: 'Getting Started',
    recipes: 'Recipes',
    blocks: 'Blocks',
    guides: 'Guides',
    tokens: 'Tokens',
    components: 'Components',
    overview: 'Overview',
    aiShowcase: 'AI Showcase',
    themeEditor: 'Theme Editor',
    changelog: 'Changelog',
    help: 'Help',
    about: 'About',
  },
  guides: {
    darkMode: 'Dark mode',
    density: 'Density (compact)',
    a11y: 'Accessibility',
    a11yContracts: 'A11y Contracts',
    migration: 'Migrating from AntD / shadcn',
    streamingA11y: 'Streaming a11y',
    motion: 'Motion presets',
    figmaTokens: 'Tokens in Figma',
    serverActions: 'React 19 Actions',
  },
  /* One-line summaries shown under the guide links (zh mode only for now;
   * the strings exist for both locales so any surface can adopt them). */
  guideSummaries: {
    darkMode:
      'The light/dark token classes, the useDarkMode hook and runtime brand themes.',
    density: 'Compact/comfortable spacing scales via density tokens.',
    a11y: 'Keyboard, screen-reader and WCAG practices baked into every component.',
    a11yContracts:
      'Per-component keyboard and ARIA contracts, extracted from the test suites.',
    migration: 'Porting recipes from AntD or shadcn/ui to haze-ui.',
    streamingA11y:
      'Accessible streamed AI output: live regions, announcements and reduced motion.',
    motion:
      'data-state-driven enter/exit animation presets over the motion tokens.',
    figmaTokens:
      'The W3C DTF token exports into Tokens Studio and Figma Variables — workflow and limits.',
    serverActions:
      'Server actions over native FormData, useActionState and useOptimistic against haze-ui.',
  },
  /* Blocks page (/blocks): full-page compositions gallery. */
  blocks: {
    title: 'Blocks',
    intro:
      'Full-page compositions built entirely from haze-ui components. Preview each block live, read its source, or open it in StackBlitz as a runnable Vite project.',
    dashboard: {
      title: 'Analytics dashboard',
      description:
        'AppShell with Sidebar navigation, a Breadcrumb trail, a Stat metric row and a DataTable with toolbar export, density control and pagination.',
    },
    login: {
      title: 'Sign-in page',
      description:
        'A brand panel beside a centered Card holding a complete Form loop — zod-validated fields with per-field error rendering.',
    },
    settings: {
      title: 'Workspace settings',
      description:
        'Card-variant Tabs with three sections of live Switch, RadioGroup, Select and Combobox controls, all in the controllable-state pattern.',
    },
    chat: {
      title: 'AI chat workspace',
      description:
        'The AI conversation family in one screen — a role="log" ChatContainer of ChatMessages, a scripted ThinkingIndicator → ToolCallCard → StreamingText turn, a ChatInput whose send flips to stop, and a ConversationList rail.',
    },
    crud: {
      title: 'Master–detail CRUD',
      description:
        'A Tree picks the team, a DataTable with toolbar and density lists its pipelines, and Dialog + zod FormItem editing, ConfirmDialog deletes and Toast feedback close the loop.',
    },
    aiWorkbench: {
      title: 'AI review workbench',
      description:
        'The Workbench shell as a double-column AI desk — an activity rail and ConversationList sidebar, a scripted ThinkingIndicator → ToolCallCard → StreamingText review turn in the middle, a docked Sources citations panel, and PromptInput + ModelPicker as the composer.',
    },
    dataTable: {
      title: 'Data table console',
      description:
        'The TanStack-backed DataTable as a full fleet page — sortable and resizable columns, a per-column filter row, pagination, column visibility, density, CSV export, and checkbox batch selection driving a bulk-action bar.',
    },
    kanban: {
      title: 'Sprint kanban board',
      description:
        'Four columns of issue cards with priority badges, labels, assignee avatars and progress bars. Cards move through the ⋯ menu — haze-ui ships single-container sorting, not cross-column drag, so the board is static by design.',
    },
  },
  /* Sidebar component-group display names; keys mirror component-groups.ts. */
  componentGroups: {
    General: 'General',
    Layout: 'Layout',
    Forms: 'Forms',
    Overlays: 'Overlays',
    'Data Display': 'Data Display',
    Navigation: 'Navigation',
    Feedback: 'Feedback',
    'AI & Chat': 'AI & Chat',
    Utilities: 'Utilities',
  },
  /* One-line component blurbs, keyed by display name. Mirrors the
   * DESCRIPTIONS table in scripts/generate-llms.mjs (markdown backticks
   * stripped). Deliberately an open record: new components keep earning
   * entries without touching the dictionary type — the parity test pins
   * coverage against component-groups.ts instead. */
  components: COMPONENT_BLURBS as Record<string, string>,
  home: {
    hero: {
      title: 'Build faster with Haze UI',
      subtitle:
        'A lightweight, accessible React component library with zero-runtime CSS-in-JS, design tokens, and {count} production-ready components.',
      getStarted: 'Get Started',
      components: 'Components',
      copyAria: 'Copy install command',
      copied: 'Copied',
      copy: 'Copy',
    },
    stats: {
      components: 'Components',
      cssLabelFull: 'CSS full bundle · {raw} raw',
      cssLabelFallback: 'CSS — run pnpm build',
      runtimeJs: 'Runtime JS for styles',
      builtInThemes: 'Built-in themes',
    },
    wall: {
      title: 'Real components, not screenshots',
      subtitle:
        'Every control below is live — click, drag, and type your way through the actual library.',
    },
    features: {
      title: 'Why Haze UI?',
      subtitle:
        'Everything you need to build modern React interfaces, nothing you don\u2019t.',
      zeroRuntime: {
        title: 'Zero Runtime Overhead',
        desc: 'Styles are extracted at build time via Linaria. No runtime CSS-in-JS cost.',
      },
      designTokens: {
        title: 'Design Tokens',
        desc: 'Consistent theming through CSS custom properties. Light and dark themes built in.',
      },
      components: {
        title: '{count}+ Components',
        desc: 'From buttons to datepickers, all following Open UI standards for consistency.',
      },
      accessible: {
        title: 'Accessible',
        desc: 'Built on native HTML elements like <dialog> and <details> for built-in a11y.',
      },
      nativeOverlays: {
        title: 'Native Popover Overlays',
        desc: 'Floating layers ride the native popover API + CSS anchor positioning — positioned by the engine, zero JS math.',
      },
      screenReaderCi: {
        title: 'VoiceOver CI Gate',
        desc: 'Real VoiceOver output is asserted on macOS CI — a true screen-reader gate beyond axe and e2e.',
      },
      treeShakeable: {
        title: 'Tree-Shakeable',
        desc: 'ES module output with preserveModules. Import only what you use.',
      },
      controlled: {
        title: 'Controlled & Uncontrolled',
        desc: 'One prop, both modes: stateful components take Control<T> | T — no defaultValue twin API.',
      },
      aiDocs: {
        title: 'AI-Ready Docs',
        desc: 'Built-in MCP server (npx haze-ui-mcp) plus llms.txt — agents read the same docs you do.',
      },
      typescript: {
        title: 'TypeScript First',
        desc: 'Written in TypeScript with exported prop types for every component.',
      },
      lightweight: {
        title: 'Lightweight',
        descFull:
          'Full CSS bundle is {raw} ({gzip} gzipped). Per-component imports ship even less.',
        descFallback:
          'Tiny CSS footprint, no heavy dependencies. Designed for performance.',
      },
      customizable: {
        title: 'Customizable',
        desc: 'Override any design token with CSS variables. className passthrough on all components.',
      },
    },
    compare: {
      title: 'How it compares',
      subtitle:
        'Zero-runtime styling, one-prop state control, and AI components built in.',
      dimension: 'Dimension',
      rows: {
        stylingRuntime: 'Styling runtime',
        stateApi: 'State API',
        formBinding: 'Form binding',
        aiComponents: 'AI components',
        perComponentCss: 'Per-component CSS',
        shippedCss: 'Shipped CSS',
      },
      shippedFull: '~{gzip} gzipped',
      shippedFallback: 'per-component CSS',
    },
    size: {
      title: 'Bundle size',
      subtitle:
        'Per-family CSS, measured from the local library build. Ship tokens.css once, then only the components you render.',
      summary:
        '{families} CSS families \u00b7 full bundle (haze-ui.css): {raw} / {gzip} gzip',
      sortAriaDesc: 'Sort families by gzip size, currently descending',
      sortAriaAsc: 'Sort families by gzip size, currently ascending',
      sortLabel: 'Sort by gzip',
      family: 'Family',
      css: 'CSS',
      cssGzip: 'CSS (gzip)',
      note: 'Measured {date} by scripts/generate-size-report.mjs (gzip level 9) \u00b7 run pnpm build to regenerate.',
      hint: 'No local build output found — run pnpm build to regenerate this report.',
    },
    code: {
      title: 'Simple by design',
      subtitle:
        'Clean APIs that get out of your way. Here\u2019s what it looks like:',
      quickSetup: 'Quick setup',
      description:
        'Import the stylesheet (full bundle or per-component CSS), apply a theme class, and start using components. No providers, no context wrappers, no configuration files.',
    },
    footer: {
      license: 'MIT License',
      builtWith: 'Built with React 19',
    },
  },
  gettingStarted: {
    title: 'Getting Started',
    intro:
      'Get up and running with Haze UI in your React project in just a few minutes.',
    installation: {
      title: 'Installation',
      peers: [
        'Haze UI requires ',
        { code: 'react >= 19' },
        ' and ',
        { code: '@linaria/core >= 7' },
        ' as peer dependencies.',
      ],
      orOtherManagers: 'Or with other package managers:',
    },
    frameworks: {
      title: 'Frameworks',
      switchLabel: 'Framework',
      intro: [
        'The install is the same everywhere — only where the CSS import lives differs. The mode names match the README quickstart: ',
        { strong: 'A' },
        ' is one full stylesheet, ',
        { strong: 'B' },
        ' is per-component CSS.',
      ],
      vite: {
        lead: 'Scaffold a Vite app (React 19, TypeScript) and add the library:',
        modeA: [
          { strong: 'Mode A — one full stylesheet (simplest).' },
          ' A single import in the entry module covers every component:',
        ],
        modeB: [
          { strong: 'Mode B — per-component CSS.' },
          ' The official Vite plugin reads each ',
          { code: "import { … } from 'haze-ui'" },
          ' statement and injects the matching ',
          { code: 'css/*.css' },
          ' files (tokens included; the module graph deduplicates):',
        ],
        pluginNote: [
          { code: 'vite-plugin-haze-ui' },
          ' is on npm — install it with ',
          { code: 'npm i -D vite-plugin-haze-ui' },
          '. Prefer picking files yourself? Import ',
          { code: 'haze-ui/css/tokens.css' },
          ' plus the family files you use and skip the plugin entirely — the Setup section above shows the manual form.',
        ],
      },
      next: {
        lead: 'Scaffold an App Router project (Next.js 15+ ships React 19) and add the library:',
        modeA: [
          { strong: 'Mode A — one full stylesheet (simplest).' },
          ' Global CSS belongs in the root layout:',
        ],
        modeB: [
          { strong: 'Mode B — per-component CSS.' },
          ' No plugin involved — list ',
          { code: 'haze-ui/css/tokens.css' },
          ' plus the family files you actually render, still in the root layout:',
        ],
        note: [
          'Apply the theme classes to ',
          { code: '<body>' },
          ' as shown in the Server rendering section below — every route inherits them.',
        ],
      },
    },
    setup: {
      title: 'Setup',
      steps: [
        {
          lead: [
            { strong: 'Import the stylesheet' },
            ' — load the full bundle, or load tokens plus only the components you use.',
          ],
        },
        {
          lead: [
            { strong: 'Apply the theme' },
            ' — Wrap your app (or any subtree) with the theme class to activate design tokens.',
          ],
        },
        {
          lead: [
            { strong: 'Use components' },
            ' — Import and use any component directly.',
          ],
        },
      ],
    },
    theming: {
      title: 'Theming',
      tokensPara:
        'Haze UI uses CSS custom properties (design tokens) for all visual values. Two built-in themes are available:',
      overridePara:
        'You can override any token by setting the CSS variable on a parent element:',
      prefixNote: [
        'All tokens are prefixed with ',
        { code: '--haze-' },
        ' to avoid conflicts with other libraries. See the full list of tokens in the source code.',
      ],
      dtfPara: [
        'All tokens are also published in the W3C Design Tokens Format (DTF) — every token becomes a ',
        { code: '$value' },
        ' / ',
        { code: '$type' },
        " group entry — so design-tool pipelines can consume them without knowing haze-ui's CSS naming:",
      ],
      dtfNote:
        'The same JSON drops straight into Style Dictionary or Tokens Studio to keep Figma variables and platform token output in sync with the library.',
    },
    tailwind: {
      title: 'Using with Tailwind v4',
      intro: [
        'Haze UI tokens are ordinary CSS custom properties, so Tailwind v4 can consume them through ',
        { code: '@theme' },
        '. Alias the tokens you want as Tailwind color variables, then use the matching utilities:',
      ],
      inlineNote: [
        'Use ',
        { code: '@theme inline' },
        ', not plain ',
        { code: '@theme' },
        '. A plain block emits ',
        { code: ':root { --color-primary: var(--haze-color-primary) }' },
        ' and the var() is resolved once at ',
        { code: ':root' },
        ' — but Haze tokens are defined under the theme class, a descendant of ',
        { code: ':root' },
        ', so every alias collapses to nothing there. With ',
        { code: 'inline' },
        ', ',
        { code: 'bg-primary' },
        ' compiles to ',
        { code: 'background-color: var(--haze-color-primary)' },
        ' and resolves wherever the theme class is active.',
      ],
      cascadePara: [
        { strong: 'Cascade and load order.' },
        ' Haze UI CSS ships unlayered, while Tailwind v4 puts theme, preflight and utilities in ',
        { code: '@layer' },
        '. Unlayered author styles beat any layer regardless of import order or specificity, so when a utility and a Haze component set the same property (say, a Button\u2019s background), the component wins. Append Tailwind v4\u2019s trailing ',
        { code: '!' },
        ' (e.g. ',
        { code: 'w-full!' },
        ') when a utility must override a component. Utilities win normally on properties components do not set. Because of layers, it does not matter whether Haze CSS or Tailwind loads first — just make sure the tokens are loaded once in your app root.',
      ],
      preflightPara: [
        { strong: 'Preflight.' },
        ' Tailwind\u2019s reset lives in ',
        { code: '@layer base' },
        ' and only touches element defaults (borders, margins, button backgrounds). Haze components style themselves completely with unlayered token rules, so they render identically with preflight enabled — keep the default setup.',
      ],
    },
    controlled: {
      title: 'Controlled Components',
      intro: [
        'Form components support both controlled and uncontrolled modes via ',
        { code: 'react-use-control' },
        ':',
      ],
      outro: [
        'You can also pass plain values for simple uncontrolled usage — just omit the ',
        { code: 'value' },
        ' prop and the component manages its own state.',
      ],
    },
    ssr: {
      title: 'Server rendering (Next.js)',
      enforcedPara: [
        'Every Haze UI component renders on the server and hydrates without mismatches — the library contains no ',
        { code: 'window' },
        ' guards. This is enforced in-repo by two suites: ',
        { code: 'src/lib/ssr-render.node.test.tsx' },
        ' (23 cases through ',
        { code: 'renderToString' },
        ' in a real window-less node environment) and ',
        { code: 'src/lib/ssr-hydration.test.tsx' },
        ' (22 cases through ',
        { code: 'hydrateRoot' },
        ', asserting hydration warnings stay silent) — 45 cases total, exemption list empty. A runnable App Router project lives at ',
        { code: 'examples/nextjs' },
        '.',
      ],
      boundaryPara: [
        'Haze UI ships no ',
        { code: "'use client'" },
        ' directives — the boundary is yours to draw. Components own state and effects, so import them from a client component; that is exactly the path the SSR suites exercise (server render first, hydration second).',
      ],
      loadPara: [
        'Load the stylesheet once in the root layout, where global CSS belongs, and apply the theme classes to ',
        { code: '<body>' },
        ':',
      ],
      note: [
        'Haze UI requires ',
        { code: 'react >= 19' },
        ' (Next.js 15 or newer in the App Router) and ships ESM only — ',
        { code: "type: 'module'" },
        ', no CommonJS bundle. Next.js and Vite consume it out of the box; CommonJS servers should reach for ',
        { code: 'import()' },
        '. One deliberate exception to \u201ceverything ships in server HTML\u201d: ',
        { code: 'StreamingText' },
        ' intentionally renders an empty prefix plus cursor on the server and streams the text in on the client.',
      ],
    },
    testing: {
      title: 'Testing with Jest / Vitest',
      jestLead: [
        'haze-ui is ESM-only (',
        { code: "type: 'module'" },
        ') and serves its styles from CSS subpaths, so a Jest consumer needs three adjustments: a jsdom environment from ',
        { code: 'jest-environment-jsdom' },
        ' (unbundled since Jest 28), ',
        { code: 'transformIgnorePatterns' },
        ' that let Babel transpile haze-ui and its ESM-only runtime dependencies, and a ',
        { code: '\\.css$' },
        ' ',
        { code: 'moduleNameMapper' },
        ' stub so stylesheet imports resolve to an empty module. Because Vite scaffolds ship ',
        { code: '"type": "module"' },
        ', the config files below use the ',
        { code: '.cjs' },
        ' extension:',
      ],
      allowNote: [
        'The allow-list is the verified minimum: haze-ui itself, ',
        { code: 'react-use-control' },
        ', and the ',
        { code: '@tanstack' },
        ' scope (react-table pulls in table-core and store, all ESM). Everything else in the dependency graph — react-f0rm, @dnd-kit, recharts, qrcode — ships CommonJS and loads without transformation. The regex covers both layouts: pnpm stores packages at ',
        { code: '.pnpm/<name>@<ver>/node_modules/<name>/' },
        ' with scope slashes encoded as ',
        { code: '+' },
        ', while npm and yarn use ',
        { code: 'node_modules/<name>/' },
        '. Drop the CSS mapper and ',
        { code: "import 'haze-ui/styles.css'" },
        ' fails with a SyntaxError — the stylesheet import above exercises exactly that stub.',
      ],
      vitestPara: [
        'Vitest needs none of this: it consumes ESM natively and leaves CSS processing off by default (',
        { code: 'css: false' },
        '), so plain imports just work. This documentation site tests haze-ui components under Vitest + jsdom with zero transform configuration.',
      ],
    },
    typescript: {
      title: 'TypeScript',
      para: [
        'Haze UI is written in TypeScript and ships type declarations out of the box. All component props are exported as types:',
      ],
    },
    browser: {
      title: 'Browser Support',
      para: [
        'Haze UI targets modern browsers that support CSS custom properties and the ',
        { code: '<dialog>' },
        ' element:',
      ],
      browsers: ['Chrome / Edge 84+', 'Firefox 98+', 'Safari 15.4+'],
    },
    cdn: {
      title: 'Try it from a CDN',
      para: [
        'No install needed for a quick experiment: the stylesheet from unpkg, the components from esm.sh, and a single React copy kept stable through the import map:',
      ],
      note: [
        'Pin a real version — ',
        { code: '1.33.0' },
        ' here; check npm for the latest. The ',
        { code: '?external=react,react-dom' },
        ' flag keeps haze-ui on the import map’s single React copy — two React instances break hooks. CDN mode trades tooling correctness for zero setup; switch to a real install before building an app.',
      ],
    },
  },
  componentDetail: {
    notFoundTitle: 'Component not found: {name}',
    notFoundHintSuggestions: 'No component lives at this URL. Did you mean:',
    notFoundHintPlain: 'No component lives at this URL.',
    backToAllComponents: 'Back to all components',
    copyImport: 'Copy import',
    copied: 'Copied',
  },
};

export type SiteStrings = typeof en;

/**
 * Override shape for locale dictionaries: every level optional, arrays
 * (RichText paragraphs) replaced wholesale, leaves keep their type.
 * A locale dictionary may only use keys that exist in `en` — the parity
 * test in i18n.test.tsx walks the object and rejects unknown keys.
 */
export type DeepPartial<T> = T extends readonly unknown[]
  ? T
  : T extends object
    ? { [K in keyof T]?: DeepPartial<T[K]> }
    : T;
