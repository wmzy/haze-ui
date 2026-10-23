/*
 * Deutsches Wörterbuch: DeepPartial-Override-Schicht über en.ts. Fehlende
 * Schlüssel fallen beim Rendern auf Englisch zurück (mergeStrings in
 * ./index.tsx), daher enthält diese Datei nur übersetzte Schlüssel — neue
 * Schlüssel müssen zuerst in en.ts existieren; die Paritätsprüfung liegt in
 * i18n.test.tsx.
 */

import type { DeepPartial, SiteStrings } from './en';

export const de: DeepPartial<SiteStrings> = {
  chrome: {
    openNavigation: 'Navigation öffnen',
    light: 'Hell',
    dark: 'Dunkel',
    auto: 'Automatisch',
    language: 'Sprache wechseln',
    noCustomTheme: 'Kein benutzerdefiniertes Theme',
    themeEditor: 'Theme-Editor',
    viewSourceAt: 'Quelltext von {version} ({commit}) ansehen',
    viewSource: 'Quelltext auf GitHub ansehen',
    starOnGitHub: 'Auf GitHub einen Star geben',
    search: 'Suchen',
    searchComponents: 'Komponenten suchen',
    searchPlaceholder: 'Komponenten suchen…',
    clearSearch: 'Suche löschen',
    noComponentsMatch: 'Keine Komponenten passen zu „{query}“',
    noResultsMatch: 'Keine Ergebnisse passen zu „{query}“',
    docs: 'Dokumentation',
  },
  nav: {
    home: 'Start',
    gettingStarted: 'Erste Schritte',
    recipes: 'Rezepte',
    blocks: 'Blöcke',
    guides: 'Anleitungen',
    tokens: 'Tokens',
    components: 'Komponenten',
    overview: 'Überblick',
    aiShowcase: 'KI-Showcase',
    themeEditor: 'Theme-Editor',
    changelog: 'Changelog',
    help: 'Hilfe',
    about: 'Über',
  },
  guides: {
    darkMode: 'Dunkler Modus',
    density: 'Dichte (kompakt)',
    a11y: 'Barrierefreiheit',
    a11yContracts: 'A11y-Verträge',
    migration: 'Migration von AntD / shadcn',
    streamingA11y: 'Barrierefreiheit beim Streaming',
    motion: 'Motion-Presets',
    figmaTokens: 'Tokens in Figma',
    serverActions: 'React 19 Actions',
  },
  guideSummaries: {
    darkMode:
      'Die Hell-/Dunkel-Token-Klassen, der useDarkMode-Hook und Laufzeit-Brand-Themes.',
    density: 'Kompakte und lockere Abstände über die Density-Tokens umschalten.',
    a11y: 'Tastatur, Screenreader und WCAG-Praktiken fest in jeder Komponente verankert.',
    a11yContracts:
      'Tastatur- und ARIA-Verträge je Komponente, direkt aus den Test-Suiten extrahiert.',
    migration: 'Rezepte für die Portierung von AntD oder shadcn/ui zu haze-ui.',
    streamingA11y:
      'Barrierefreie KI-Ausgaben: Live-Regions, Ansagen und reduzierte Bewegung.',
    motion: 'data-state-gesteuerte Ein-/Aus-Animationspresets auf den Motion-Tokens.',
    figmaTokens:
      'Die W3C-DTF-Token-Exporte in Tokens Studio und Figma Variables — Workflow und Grenzen.',
    serverActions:
      'Server Actions über natives FormData, useActionState und useOptimistic mit haze-ui.',
  },
  blocks: {
    title: 'Blöcke',
    intro:
      'Ganzseitige Kompositionen, ausschließlich aus haze-ui-Komponenten gebaut. Jeden Block live ansehen, den Quelltext lesen oder als lauffähiges Vite-Projekt in StackBlitz öffnen.',
    dashboard: {
      title: 'Analytics-Dashboard',
      description:
        'AppShell mit Sidebar-Navigation und Breadcrumb, eine Zeile Stat-Kennzahlen und ein DataTable mit Toolbar-Export, Dichte-Umschalter und Paginierung.',
    },
    login: {
      title: 'Anmeldeseite',
      description:
        'Ein Brand-Panel neben einer zentrierten Card mit kompletter Form-Schleife — zod-validiert, Fehler je Feld gerendert.',
    },
    settings: {
      title: 'Workspace-Einstellungen',
      description:
        'Tabs in der Card-Variante mit drei Einstellungssektionen; Switch, RadioGroup, Select und Combobox laufen alle im Controlled-State-Muster.',
    },
    chat: {
      title: 'KI-Chat-Arbeitsbereich',
      description:
        'Die KI-Konversationsfamilie auf einem Bildschirm — ein ChatContainer mit role="log", eine gescriptete Runde aus ThinkingIndicator → ToolCallCard → StreamingText, ein ChatInput, dessen Senden zu Stopp wird, plus eine ConversationList-Leiste.',
    },
    crud: {
      title: 'Master–Detail-CRUD',
      description:
        'Ein Tree wählt das Team, eine DataTable mit Toolbar und Dichte listet die Pipelines; Dialog + zod-FormItem-Bearbeitung, ConfirmDialog-Löschen und Toast-Feedback schließen die Schleife.',
    },
    aiWorkbench: {
      title: 'KI-Review-Workbench',
      description:
        'Die Workbench-Shell als zweispaltiger KI-Arbeitsplatz — Activity-Rail und ConversationList-Sidebar, in der Mitte eine gescriptete Review-Runde aus ThinkingIndicator → ToolCallCard → StreamingText, rechts ein angedocktes Sources-Zitierpanel, als Composer PromptInput + ModelPicker.',
    },
    dataTable: {
      title: 'Datentabellen-Konsole',
      description:
        'Die TanStack-basierte DataTable als ganze Fleet-Seite — sortierbare und größenveränderliche Spalten, zeilenweise Spaltenfilter, Paginierung, Spaltensichtbarkeit, Dichte, CSV-Export und Checkbox-Mehrfachauswahl mit Aktionsleiste.',
    },
    kanban: {
      title: 'Sprint-Kanban-Board',
      description:
        'Vier Spalten mit Issue-Karten samt Prioritäts-Badges, Labels, Assignee-Avataren und Fortschrittsbalken. Karten wandern über das ⋯-Menü — haze-ui liefert nur Single-Container-Sorting, kein spaltenübergreifendes Ziehen; das Board ist bewusst statisch.',
    },
  },
  componentGroups: {
    General: 'Allgemein',
    Layout: 'Layout',
    Forms: 'Formulare',
    Overlays: 'Overlays',
    'Data Display': 'Datenanzeige',
    Navigation: 'Navigation',
    Feedback: 'Feedback',
    'AI & Chat': 'KI & Chat',
    Utilities: 'Hilfsprogramme',
  },
  components: {
    // General
    Avatar:
      'Benutzer-Avatar mit Bild, Größenvarianten und Fallback-Inhalt, wenn das Bild fehlt.',
    AvatarGroup:
      'Stapelt Avatares in überlappenden Reihen mit einem +N-Overflow-Chip (max/total).',
    Badge: 'Kleines Inline-Statuslabel mit Varianten- und Farboptionen.',
    Button:
      'Aktionsbutton mit variant/size/square-Optionen; unter der Haube ein natives <button>.',
    ButtonGroup:
      'Verbundene Button-Leiste: Ecken und Nähte verschmolzen, gruppenweite size/variant/disabled, Separator-Subkomponente.',
    CountUp:
      'Animierte Zahlen-Ticker: rAF + Ease-out-Interpolation zum Zielwert; prefers-reduced-motion erzeugt einen sofortigen Sprung.',
    Countdown:
      'Countdown bis zur Frist: an Sekundengrenzen ausgerichtete Timer-Kette, onFinish feuert genau einmal, adaptive d/h:mm:ss-Formatierung.',
    Divider: 'Trennlinie für Inhalte, horizontal oder vertikal.',
    Ellipsis:
      'Interaktive Textabschneidung: N-Zeilen-Clamp mit Truncation-Erkennung, optionalem Tooltip und Aus-/Einklappen.',
    Icon: 'Inline-SVG-Icon-Wrapper mit token-basierten sm/md/lg-Boxen.',
    Tag: 'Kompaktes Statuslabel mit Variantenfarbe und optionalem Schließen-Button.',
    TagGroup:
      'Flex-Wrap-Container, der Tag-Children mit einheitlichem Gap anordnet; sortable + onReorder für Drag-Sortierung.',
    Typography:
      'Text-Primitives: Title, Text, Paragraph auf Basis der Typografie-Tokens.',

    // Layout
    AspectRatio: 'Zwingt Children in ein festes Breite/Höhe-Verhältnis.',
    AppShell:
      'Applikationsrahmen mit Sticky-Header, einklappbarer Sidebar sowie Content- und Footer-Slots; unter 768px wird die Sidebar zum Overlay.',
    Container: 'Zentrierter Seitencontainer mit Maximalbreite und horizontalem Padding.',
    Flex: 'Flexbox-Layout-Primitive, das Props auf Flex-CSS abbildet.',
    Grid: 'CSS-Grid-Layout-Primitive.',
    Masonry:
      'Pinboard-Layout: JS-gierige Spaltenverteilung verteilt Children über die Spalten (erst der Reihe nach, dann immer die kürzeste Spalte).',
    Resizable:
      'Split-Pane-Gruppe mit ziehbaren Trennern (ResizableGroup, horizontal oder vertikal); px defaultSize/minSize/maxSize je Panel, einklappbare Panels und onResizeCommit für die Persistenz.',
    ScrollArea:
      'Scrollbarer Bereich mit Overlay-Scrollbalken: maxHeight-Kurzform oder Viewport/Scrollbar-Komposition; hover/always/scroll-Sichtbarkeit, tastaturfokussierbarer Viewport.',
    Sidebar:
      'App-Sidebar-Hülle mit steuerbarem Einklappzustand (aside + Rail-Breiten-Tokens).',
    Splitter:
      'Splitter: mehrflächiges Split-Layout (AntD-Splitter-Semantik) mit impliziten ziehbaren Trennern; sizes als Prozent des Paneel-Bereichs über eine einzige ControlOrValue-Array-Prop, min/max-Prozent-Begrenzung pro Paneel, optionale einklappbare Paneels (Ein-/Ausklapp-Trigger am Trenner stellen die vorherige Aufteilung wieder her), Pfeiltasten (5%-Schritte) und Home/End, live onSizesChange; für px-große Paneels siehe Resizable.',
    ActivityRail:
      'VSCode-artige vertikale Icon-Leiste (nav): 44px-Einträge mit icon/label/badge und Aktiv-Indikator, Tooltip-Labels, slot="end" pinnt unten. orientation="horizontal" legt sie als Streifen aus — Workbench erledigt das automatisch, wenn die Rail in die Sidebar-Spalte gedockt wird.',
    StatusBar:
      'VSCode-artige Statusleiste (footer): left/right-Gruppen, wählbare StatusItems, Priority-Einträge überleben den Mobile-Breakpoint.',
    TabBar:
      'Mobile Bottom-Navigation (das Viewport-Pendant zur ActivityRail): 56px-Streifen mit Safe-Awareness, badge, onSelect/onReselect-Semantik.',
    Workbench:
      'IDE-artiger Applikationsrahmen (100dvh): Slots für activityBar/sidebar/auxiliaryBar/panel/statusBar/tabBar mit px-resizebaren, einklappbaren Regionen und maximierbarem unterem Panel; die Rail dockt neben die Sidebar oder in sie hinein (oben/unten, Cursor-Stil); unter 768px wechselt der Rahmen die Form — die Rail wird zum vollbreiten horizontalen Balken über dem Editor und die Sidebar zur separaten Vollbild-Ebene (standardmäßig zu, über die tabBar geöffnet).',

    // Forms
    Cascader:
      'Mehrstufiger Drill-Down-Selektor, der einen Pfad aus Optionswerten bestätigt; onSearch filtert remote, loading zeigt den Ladezustand.',
    Checkbox: 'Checkbox mit steuerbarem checked-Zustand.',
    ColorPicker: 'Farbselektor mit steuerbarem Wert und vorgefertigten Swatches.',
    Combobox:
      'Autovervollständigungs-Eingabe mit filterbarer Optionsliste; onSearch überlässt das Filtern dem Host.',
    DateField:
      'Segmentierte Datumseingabe (Jahr/Monat/Tag) zum direkten Eintippen — ohne Kalender.',
    Datepicker:
      'Datumseingabe mit Popup-Kalender (YYYY-MM-DD-Wert); showTime ergänzt ein Uhrzeitfeld.',
    DateTimePicker:
      'Datum+Uhrzeit-Picker (Datepicker mit dauerhaft sichtbarer Uhrzeitleiste); showSeconds optional; der Wert serialisiert als YYYY-MM-DD HH:mm[:ss].',
    DateRangePicker:
      'Wählt ein Start-/Enddatumbereich, mit eingebauten oder eigenen Presets (Heute, Letzte 7 Tage, …).',
    Fieldset:
      'Semantische fieldset+legend-Gruppierung für Formularabschnitte; disabled deaktiviert sämtliche Controls darin.',
    FileInput: 'Trigger-Element, das eine versteckte native Dateieingabe öffnet.',
    Form: 'react-f0rm-Feld-Wrapper: ergänzt Label, Fehler und aria-Verdrahtung um die gesteuerten Kerne.',
    ImageCrop:
      'Interaktiver Bildzuschnitt (Partner von Upload): steuerbare normalisierte CropRect-Fläche, Seitenverhältnis-Sperre, runde Avatar-Maske und vollständige Tastaturbedienung (Pfeiltasten verschieben, Umschalt+Pfeiltasten skalieren).',
    InlineEdit: 'Klick-zum-Bearbeiten von Textwerten an Ort und Stelle.',
    Input: 'Texteingabe mit Adornments; Sugar über InputCore.',
    InputGroup: 'Feld-Cluster: Präfix/Suffix-Addons (Icon, Text, Button) mit Input/Select zu einem Control verbunden.',
    Meter: 'Schreibgeschütztes semantisches Messgerät: Track und Bar wechseln die Farbe, wenn der Wert jede Schwelle überschreitet.',
    CopyButton: 'Ein-Klick-Kopierbutton mit Kopiert-Feedback; inklusive Snippet-Code-Chip.',
    Heatmap: 'Aktivitäts-Heatmap im GitHub-Stil: Quadrate nach Wert eingefärbt, Palette folgt dem Theme.',
    TimeGrid: 'Zeitgitter aus Fenster und Schritt: Pfeiltasten wandern und wählen.',
    Mentions:
      'Erwähnungs-Eingabe mit Vorschlägen zum Trigger-Zeichen aus einer Optionsliste.',
    NumberInput: 'Numerische Eingabe mit min/max/step.',
    OTPInput: 'Einmalpasswort-Eingabe aus length segmentierten Zeichenboxen.',
    PasswordInput: 'Texteingabe mit Sichtbarkeits-Umschalter.',
    MaskedInput:
      'Maskiertes Textfeld nach Muster (9 Ziffer, a Buchstabe, A Großbuchstabe, * alphanumerisch, \\ Escape); unmask() liefert die Rohzeichen.',
    PhoneInput:
      'Internationale Telefonnummerneingabe: Länderauswahl und Nummernfeld verbunden, E.164-Wert, Validierung via libphonenumber-js.',
    Radio: 'Radio-Option und -Gruppe mit steuerbarer Auswahl.',
    Rating: 'Sternebewertung mit Halb-Schritt-Unterstützung.',
    RichTextEditor: 'Rich-Text-Editor auf Tiptap-Basis mit integrierter Formatierungs-Toolbar und steuerbarem HTML-Wert.',
    Segmented: 'Segment-Control, die eine Option aus einer kompakten Menge wählt.',
    Select:
      'Dropdown-Select über SelectCore mit <option>-Children; onSearch aktiviert serverseitiges Filtern.',
    Signature:
      'Canvas-Unterschriftenfeld, das bei jedem Strich eine PNG-Data-URL bestätigt, mit Undo, Leeren und einem Fallback-Hinweis ohne Canvas.',
    Slider: 'Nativer Range-Slider mit steuerbarem Wert.',
    Switch: 'Umschalter (role="switch") mit steuerbarem checked.',
    TagInput:
      'Token-Eingabe mit Enter-zum-Bestätigen über TagInputCore; sortable ermöglicht Drag-Sortierung (neue Reihenfolge via onChange).',
    Textarea: 'Mehrzeilige Texteingabe.',
    TimePicker: 'Uhrzeiteingabe mit steuerbarem Wert.',
    TimeField:
      'Segmentierte Zeiteingabe (Stunde/Minute/Sekunde, optional 12-Stunden-AM/PM).',
    Toggle:
      'Zustands-Drucktaste (aria-pressed) mit Größen und Quadrat-Icon-Modus; die ToolbarToggle-Variante reitet auf dem Roving Focus der Toolbar.',
    Transfer:
      'Zweispaltiger Shuttle, der Optionen zwischen Quell- und Zielliste bewegt.',
    TreeSelect:
      'Baumauswahl in einem schwebenden Panel: wählbare Zeilen bestätigen einen Schlüssel, kaskadierende Checkboxes bestätigen string[]; mit Panel-Suche, lazy loadData und Chip-Overflow.',
    Upload:
      'Dateiauswahl mit akkumulierendem File[]-Wert, accept/multiple, Verzeichnisauswahl und listType-Rendering.',

    // Overlays
    BottomSheet: 'Mobile-artiges Sheet, das vom unteren Bildschirmrand einschiebt.',
    ConfirmDialog:
      'Fertiger Bestätigungsdialog mit Bestätigen/Abbrechen-Aktionen und einer Danger-Variante.',
    ContextMenu: 'Schwebendes Menü, das per Rechtsklick öffnet.',
    Dialog: 'Modaler Dialog mit Focus-Trapping.',
    Drawer: 'Am Rand verankertes Panel (placement links/rechts).',
    DropdownMenu: 'Klick-getriggertes schwebendes Menü.',
    HoverCard:
      'Nicht-modale schwebende Vorschau (Avatar-Karte, Link-Zusammenfassung), verankert am Trigger.',
    Menu: 'Leichtgewichtiges Toggle-Menü mit Trigger und statisch positioniertem Panel (MenuItem, MenuDivider).',
    Popover: 'Schwebendes Popover, verankert an einem Trigger-Element.',
    Tooltip: 'Hover-/Fokus-Hinweisblase.',

    // Data Display
    Accordion: 'Einklappbare Abschnittsliste (AccordionItem mit title).',
    Calendar: 'Monatsraster-Datumsoberfläche mit min/max, locale und weekStartsOn.',
    Card: 'Inhaltskarte mit elevated/outlined/filled-Varianten.',
    Carousel: 'Slideshow mit steuerbarem aktivem Index und Autoplay.',
    Chart:
      'Linien-/Flächen-/Balken-/Kuchendiagramme über recharts, Farben und Achsen auf haze-Tokens; Serien durchlaufen die semantische Palette, renderTooltip passt den Tooltip an.',
    Chip: 'Abgerundetes Status-Chip mit optionalem Icon und Schließen-Button.',
    CodeBlock:
      'Monospace-Code-Container mit Sprach-Badge; highlight bindet einen asynchronen Syntax-Highlighter ein.',
    DataTable:
      'Funktionsreiches Table auf @tanstack/react-table (Sortierung, Zeilenauswahl, Client- oder manuelle Pagination); dataTableToCsv exportiert die Zeilen.',
    Descriptions:
      'Definitionslisten-Beschreibungsgruppen (dl/dt/dd auf CSS Grid): items-Paare, columns, bordered, size.',
    Image: 'Bild mit Fallback und Kontrolle über aspectRatio/objectFit.',
    Indicator:
      'Corner-Badge an einem Host-Element: Punkt oder Zählerlabel, Ton + Eckposition, showZero.',
    JsonView:
      'Einklappbarer JSON-Baum mit farbigen Blättern je Typ, tiefenabhängiger Standard-Expansion, Truncation-Hinweisen und optionalem Copy-Button.',
    Kbd: 'Tastenkappen-Styling für Shortcuts.',
    List: 'Gestylte ul/ol/plain-Listenvarianten.',
    Mark: 'Highlight auf Textebene (semantisches mark-Element) in Status-Tönen.',
    Highlight:
      'Suchergebnis-Hervorhebung über einen String hinweg; mehrere Nadeln, escaped (kein innerHTML).',
    NumberFormatter:
      'Darstellende Zahlenformatierung über Intl: locale, formatOptions (Währung/Einheit/Prozent), prefix/suffix.',
    Progress: 'Fortschrittsbalken oder -ring, angetrieben von einem Prozentwert.',
    QRCode:
      'QR-Code als ein einziger scharfer SVG-Pfad mit value/size/level/bordered-Optionen und Modul-/Hintergrundfarben aus den Theme-Tokens.',
    Schedule: 'Kalender-Oberfläche mit Tages-/Wochen-/Monatsansicht, Umplanen per Zeiger und Tastatur, Monatsraster mit Overflow-Chips.',
    Stat: 'Metrikanzeige mit Titel, Wert und Trend-Indikator.',
    Sparkline:
      'Inline-SVG-Mini-Trendchart: zustandslos, ohne recharts, RSC-tauglich; Linien- oder Flächenvariante auf semantischen Ton-Tokens.',
    Table: 'Gestylte semantische Tabelle (striped, bordered).',
    Timeline: 'Vertikaler Timeline-Container für TimelineItem-Children.',
    Tree: 'Hierarchischer Baum mit Auf-/Ausklappen, Auswahl und Check-Zustand, async loadData und searchValue-Filter.',
    VirtualList:
      'Windowing-Liste, die nur sichtbare Zeilen rendert; feste oder gemessene dynamische Höhen.',
    Watermark:
      'Gekachelte Canvas-Wasserzeichen-Schicht über Children (oder Fullscreen); themenabhängige Farbe, verschlechtert sich sauber ohne Canvas-2d-Support.',

    // Navigation
    Affix:
      'Fixiert Children an einem Viewport-Rand, sobald über einen Offset hinaus gescrollt wurde.',
    Anchor:
      'Sticky-Scroll-Spy-Navigation: die items-Liste hebt den aktiven Abschnitt hervor (IntersectionObserver, steuerbare activeId), Klick scrollt mit offsetTop.',
    BackToTop:
      'Schwebender Nach-oben-Button, der ab einer Scroll-Schwelle erscheint.',
    Breadcrumb: 'Breadcrumb-Navigation mit konfigurierbarem Trennzeichen.',
    Command:
      'Command-Palette-Oberfläche: CommandInput plus filterbare CommandItems.',
    FloatButton:
      'Schwebender Aktionsbutton über der Seite; FloatButtonGroup stapelt Aktionen hinter einem Ausklapp-Trigger, mit eingebauten Nach-oben- und Hilfe-Glyphen.',
    NavigationBar: 'Obere Navigationsleiste mit brand- und end-Slots.',
    NavigationMenu: 'Hover-Mega-Menü: Trigger öffnen große Inhaltspanels mit Intent-Verzögerung und Zeiger-Kulanz; activeValue steuerbar.',
    Pagination: 'Seitennavigation mit steuerbarer page und Ellipsen-Fenstern.',
    Stepper: 'Schrittanzeige, angetrieben von activeStep (Step-Children).',
    Tabs: 'Tab-Panel-Umschalter mit steuerbarem aktivem Tab.',
    Toolbar:
      'Button-Gruppe mit Toolbar-a11y (roving tabindex; ToolbarButton, ToolbarSeparator).',
    Tour: 'Geführte Tour, die Schritte hinter einer Maske im Scheinwerferlicht zeigt, current steuerbar.',

    // Feedback
    Alert: 'Inline-Statusmeldungsbox.',
    AsyncSection:
      'Deklarative loading-/error-/Content-Zustände für asynchrone Daten.',
    Banner:
      'Awayklickbare Top-Banner mit info/success/warning/danger-Varianten.',
    Empty: 'Leerzustands-Platzhalter mit Bild und Beschreibung.',
    ErrorBoundary:
      'Render-Fehlergrenze: fängt Exceptions des Teilbaums ab, Fallback (Node oder Render-Prop) mit Reset-Callback; resetKeys setzt bei flacher Änderung zurück.',
    Result:
      'Ergebnis-Feedbackseite: Status-Illustration (success/error/info/warning/403/404/500), title, subTitle und ein extra-Aktionsbereich; icon ersetzt die Standard-Illustration.',
    Skeleton: 'Schimmernder Lade-Platzhalter (text/circular/rectangular).',
    Spinner: 'Lade-Spinner.',
    LoadingOverlay:
      'Ladezustand auf Container-Ebene: dimmt den Inhalt, zentriert einen Spinner (oder eigenen Loader), aria-busy spiegelt die Phase.',
    Spoiler:
      'Gate für lange Inhalte (mehr/weniger anzeigen): höhenbeschränkte Vorschau mit Fade-Kante, steuerbares expanded.',
    VisuallyHidden:
      'Screenreader-exklusives Inhalts-Primitive: visuell abgeschnitten, im a11y-Baum erhalten.',
    Toast:
      'Toast-Benachrichtigungen über useToast + ToastContainer (imperativer toast()-Helfer inklusive).',

    // AI & Chat
    ApprovalCard:
      'Freigabe-Gate mit Genehmigen-/Ablehnen-Aktionen für agenten-initiierte Operationen.',
    ChatContainer:
      'Scroll-Container für Chat-Protokolle mit automatischem Am-Boden-Bleiben.',
    ChatInput: 'Nachrichten-Composer mit steuerbarem Wert und onSend-Callback.',
    ChatMessage:
      'Chat-Bubble mit rollenbasiertem Layout (user / assistant / system), Avatar, Name, Zeitstempel und Zustellstatus.',
    ConversationList:
      'Wählbare Liste von Konversationen für eine Chat-Verlaufs-Sidebar.',
    DiffViewer:
      'Rendert den Zeilen-Diff zwischen altem und neuem Inhalt für agenten-vorgeschlagene Änderungen.',
    FilePreview:
      'Anhangskarte mit Bild-Thumbnail oder Erweiterungs-Badge, Upload-Fortschritt sowie Entfernen/Erneut-versuchen.',
    InlineCitation: 'Inline-Hochzitationsmarker; öffnet beim Klick eine schwebende Quellenkarte mit Titel, Auszug und optionalem externen Link.',
    InlineCompletion:
      'Ghost-Text-Vervollständigung für input/textarea; Tab übernimmt den Vorschlag, Escape verwirft ihn.',
    LogViewer: 'Scrollbarer Log-Strom mit Filterung nach Schweregrad.',
    MarkdownRenderer:
      'Rendert Markdown-Inhalte (einschließlich Code-Blöcken) für Assistenten-Antworten.',
    ModelPicker: 'Steuerbares Dropdown zur Auswahl des aktiven Modells.',
    Plan: 'Agentenplan und Fortschritt: titelte Schrittliste, deren Statusangaben automatisch Fortschrittsbalken und Zusammenfassung treiben.',
    PromptInput:
      'KI-Prompt-Composer: automatisch wachsende Textarea mit Inline-Kontext-Tags, @-Trigger-Vorschlägen und konfigurierbarer Sende-Taste.',
    Queue: 'Warteschlange ausstehender Agentenaktionen oder -nachrichten mit queued/sending/failed-Status und optionalem Entfernen pro Eintrag.',
    Sources:
      'Nummerierte Zitatsliste für RAG-Antworten; Auszüge erscheinen bei Hover/Fokus mit steuerbarer expanded-Menge, compact rendert inline [1] [2]-Badges.',
    StepTimeline: 'Vertikale Zeitleiste der Agentenschritte: Status pro Schritt (inkl. running), Dauer, einklappbare Details und verschachtelte Teilschritte.',
    StreamingText:
      'Schreibmaschinen-Effekt, der Streaming-Text Zeichen für Zeichen enthüllt, mit optionalem Cursor.',
    ThinkingIndicator:
      'Animierter Hüpf-Punkte-Indikator, dass der Agent arbeitet.',
    TokenCounter:
      'Zähler für die Token-Nutzung im Kontextfenster mit Budget-Fortschritt.',
    ToolCallCard:
      'Karte für einen Agenten-Tool-Aufruf — Name, Input, Output und Laufzustand.',

    // Utilities
    Collapsible: 'Unstyled Auf-/Zuklapp-Container mit steuerbarem open-Zustand.',
    Disclosure: 'Auf-/Zuklapp-Panel mit Summary-Kopf (details/summary-Semantik).',
    Fullscreen:
      'Fullscreen-API-Bindung im Wrap-Modus um ein einzelnes Trigger-Child mit steuerbarem Vollbildzustand; der Hook useFullscreen() wird ebenfalls exportiert.',
    LocaleProvider:
      'Liefert UI-String-Packs (eingebaut Englisch, zh-CN und ja-JP) an locale-fähige Komponenten; direction (explizit oder aus dem locale abgeleitet) speist useDirection(); createStrings(base, overrides) leitet Packs ab, ohne die Tabelle zu forken.',
    ConfigProvider:
      'Überschreibt Komponenten-Prop-Defaults (Button-Größe, Toast duration/placement, Tooltip-Verzögerung, HoverCard-Öffnen-/Schließen-Verzögerung), gelesen über useConfigDefaults(); explizite Props gewinnen immer, Provider schachteln mit flachem Merge je Sektion.',
    SwipeAction:
      'Wischgesten, die Zeilen-Aktionen an linker/rechter Kante freilegen, mit Commit-Schwelle.',
  },
  home: {
    hero: {
      title: 'Schneller bauen mit Haze UI',
      subtitle:
        'Eine leichtgewichtige, barrierefreie React-Komponentenbibliothek mit Zero-Runtime-CSS-in-JS, Design-Tokens und {count} produktionsreifen Komponenten.',
      getStarted: 'Loslegen',
      components: 'Komponenten',
      copyAria: 'Installationsbefehl kopieren',
      copied: 'Kopiert',
      copy: 'Kopieren',
    },
    stats: {
      components: 'Komponenten',
      cssLabelFull: 'CSS-Vollpaket · {raw} roh',
      cssLabelFallback: 'CSS — pnpm build ausführen',
      runtimeJs: 'Runtime-JS für Styles',
      builtInThemes: 'Eingebaute Themes',
    },
    wall: {
      title: 'Echte Komponenten, keine Screenshots',
      subtitle:
        'Jedes Control unten ist live — klicken, ziehen und tippen Sie sich durch die echte Bibliothek.',
    },
    features: {
      title: 'Warum Haze UI?',
      subtitle:
        'Alles, was Sie für moderne React-Oberflächen brauchen — und nichts darüber hinaus.',
      zeroRuntime: {
        title: 'Keine Runtime-Kosten',
        desc: 'Styles werden zur Build-Zeit über Linaria extrahiert. Keine Runtime-CSS-in-JS-Kosten.',
      },
      designTokens: {
        title: 'Design-Tokens',
        desc: 'Konsistente Theming über CSS Custom Properties. Helles und dunkles Theme eingebaut.',
      },
      components: {
        title: '{count}+ Komponenten',
        desc: 'Vom Button bis zum Datepicker, alle folgen Open-UI-Standards für Konsistenz.',
      },
      accessible: {
        title: 'Barrierefrei',
        desc: 'Auf nativen HTML-Elementen wie <dialog> und <details> aufgebaut — a11y inklusive.',
      },
      nativeOverlays: {
        title: 'Native Popover-Overlays',
        desc: 'Floating-Layer nutzen die native popover-API und CSS anchor positioning — vom Browser-Engine positioniert, null JS-Mathematik.',
      },
      screenReaderCi: {
        title: 'VoiceOver-CI-Gate',
        desc: 'Echte VoiceOver-Ausgabe wird in der macOS-CI assertion-geprüft — ein echtes Screen-Reader-Gate jenseits von axe und e2e.',
      },
      aiDocs: {
        title: 'KI-bereite Docs',
        desc: 'Eingebauter MCP-Server (npx haze-ui-mcp) plus llms.txt — Agents lesen dieselbe Doku wie du.',
      },
      treeShakeable: {
        title: 'Tree-Shakeable',
        desc: 'ES-Modul-Output mit preserveModules. Importieren Sie nur, was Sie nutzen.',
      },
      controlled: {
        title: 'Gesteuert & ungesteuert',
        desc: 'Formularkomponenten unterstützen beide Modi über react-use-control.',
      },
      typescript: {
        title: 'TypeScript First',
        desc: 'In TypeScript geschrieben, mit exportierten Prop-Typen für jede Komponente.',
      },
      lightweight: {
        title: 'Leichtgewichtig',
        descFull:
          'Das volle CSS-Paket ist {raw} ({gzip} gzip). Pro-Komponente-Imports liefern noch weniger.',
        descFallback:
          'Winriger CSS-Fußabdruck, keine schweren Abhängigkeiten. Auf Performance ausgelegt.',
      },
      customizable: {
        title: 'Anpassbar',
        desc: 'Überschreiben Sie beliebige Design-Tokens über CSS-Variablen. className-Passthrough auf allen Komponenten.',
      },
    },
    compare: {
      title: 'Im Vergleich',
      subtitle:
        'Zero-Runtime-Styling, Zustandssteuerung über ein einzelnes Prop und KI-Komponenten eingebaut.',
      dimension: 'Dimension',
      rows: {
        stylingRuntime: 'Styling-Runtime',
        stateApi: 'State-API',
        formBinding: 'Formular-Bindung',
        aiComponents: 'KI-Komponenten',
        perComponentCss: 'CSS je Komponente',
        shippedCss: 'Ausgeliefertes CSS',
      },
      shippedFull: '~{gzip} gzip',
      shippedFallback: 'CSS je Komponente',
    },
    size: {
      title: 'Paketgröße',
      subtitle:
        'CSS pro Familie, gemessen am lokalen Bibliotheks-Build. tokens.css einmal laden, danach nur die Komponenten, die Sie rendern.',
      summary:
        '{families} CSS-Familien · Vollpaket (haze-ui.css): {raw} / {gzip} gzip',
      sortAriaDesc:
        'Familien nach gzip-Größe sortieren, derzeit absteigend',
      sortAriaAsc: 'Familien nach gzip-Größe sortieren, derzeit aufsteigend',
      sortLabel: 'Nach gzip sortieren',
      family: 'Familie',
      css: 'CSS',
      cssGzip: 'CSS (gzip)',
      note: 'Gemessen {date} durch scripts/generate-size-report.mjs (gzip Level 9) · mit pnpm build neu generieren.',
      hint: 'Keine lokalen Build-Artefakte gefunden — pnpm build ausführen, um diesen Bericht neu zu erzeugen.',
    },
    code: {
      title: 'Einfach konzipiert',
      subtitle: 'Saubere APIs, die nicht im Weg stehen. So sieht es aus:',
      quickSetup: 'Schnelles Setup',
      description:
        'Stylesheet laden (Vollpaket oder CSS je Komponente), Theme-Klasse anwenden und Komponenten benutzen. Keine Provider, keine Context-Wrapper, keine Konfigurationsdateien.',
    },
    footer: {
      license: 'MIT-Lizenz',
      builtWith: 'Gebaut mit React 19',
    },
  },
  gettingStarted: {
    title: 'Erste Schritte',
    intro:
      'In wenigen Minuten läuft Haze UI in Ihrem React-Projekt.',
    installation: {
      title: 'Installation',
      peers: [
        'Haze UI verlangt ',
        { code: 'react >= 19' },
        ' und ',
        { code: '@linaria/core >= 7' },
        ' als Peer-Dependencies.',
      ],
      orOtherManagers: 'Oder mit anderen Paketmanagern:',
    },
    frameworks: {
      title: 'Framework-Einbindung',
      switchLabel: 'Framework',
      intro: [
        'Die Installation ist überall gleich — nur der Ort des CSS-Imports unterscheidet sich. Die Modusnamen entsprechen dem README-Quickstart: ',
        { strong: 'A' },
        ' ist ein einziges volles Stylesheet, ',
        { strong: 'B' },
        ' ist CSS je Komponente.',
      ],
      vite: {
        lead: 'Eine Vite-App (React 19, TypeScript) anlegen und die Bibliothek installieren:',
        modeA: [
          { strong: 'Modus A — ein volles Stylesheet (am einfachsten).' },
          ' Ein einzelner Import im Entry-Modul deckt jede Komponente ab:',
        ],
        modeB: [
          { strong: 'Modus B — CSS je Komponente.' },
          ' Das offizielle Vite-Plugin liest jede ',
          { code: "import { … } from 'haze-ui'" },
          '-Anweisung und injiziert die passenden ',
          { code: 'css/*.css' },
          '-Dateien (inklusive Tokens; der Modulgraph dedupliziert):',
        ],
        pluginNote: [
          { code: 'vite-plugin-haze-ui' },
          ' ist auf npm — mit ',
          { code: 'npm i -D vite-plugin-haze-ui' },
          ' installieren. Lieber selbst Dateien wählen? ',
          { code: 'haze-ui/css/tokens.css' },
          ' plus die genutzten Familien-Dateien importieren und das Plugin weglassen — die manuelle Form steht im Abschnitt „Einrichtung“ oben.',
        ],
      },
      next: {
        lead: 'Ein App-Router-Projekt anlegen (Next.js 15+ liefert React 19) und die Bibliothek installieren:',
        modeA: [
          { strong: 'Modus A — ein volles Stylesheet (am einfachsten).' },
          ' Globales CSS gehört ins Root-Layout:',
        ],
        modeB: [
          { strong: 'Modus B — CSS je Komponente.' },
          ' Ohne Plugin — ',
          { code: 'haze-ui/css/tokens.css' },
          ' plus die tatsächlich gerenderten Familien-Dateien im Root-Layout auflisten:',
        ],
        note: [
          'Die Theme-Klassen wie unten im Abschnitt „Server-Rendering“ auf ',
          { code: '<body>' },
          ' anwenden — jede Route erbt sie.',
        ],
      },
    },
    setup: {
      title: 'Einrichtung',
      steps: [
        {
          lead: [
            { strong: 'Stylesheet laden' },
            ' — das Vollpaket laden, oder Tokens plus nur die Komponenten, die Sie nutzen.',
          ],
        },
        {
          lead: [
            { strong: 'Theme anwenden' },
            ' — Wickeln Sie Ihre App (oder einen Teilbaum) mit der Theme-Klasse, um die Design-Tokens zu aktivieren.',
          ],
        },
        {
          lead: [
            { strong: 'Komponenten benutzen' },
            ' — jede Komponente direkt importieren und verwenden.',
          ],
        },
      ],
    },
    theming: {
      title: 'Theming',
      tokensPara:
        'Haze UI verwendet CSS Custom Properties (Design-Tokens) für alle visuellen Werte. Zwei eingebaute Themes stehen bereit:',
      overridePara:
        'Jedes Token lässt sich überschreiben, indem Sie die CSS-Variable an einem Elternelement setzen:',
      prefixNote: [
        'Alle Tokens tragen das Präfix ',
        { code: '--haze-' },
        ', um Konflikte mit anderen Bibliotheken zu vermeiden. Die vollständige Token-Liste steht im Quellcode.',
      ],
      dtfPara: [
        'Alle Tokens werden zusätzlich im W3C Design Tokens Format (DTF) veröffentlicht — jedes Token wird zu einem ',
        { code: '$value' },
        ' / ',
        { code: '$type' },
        '-Gruppeneintrag — sodass Design-Tool-Pipelines sie konsumieren können, ohne haze-uis CSS-Namen zu kennen:',
      ],
      dtfNote:
        'Dieses JSON fließt direkt in Style Dictionary oder Tokens Studio, um Figma-Variablen und Plattform-Token-Outputs mit der Bibliothek synchron zu halten.',
    },
    tailwind: {
      title: 'Zusammen mit Tailwind v4',
      intro: [
        'Haze-UI-Tokens sind ganz normale CSS Custom Properties, daher kann Tailwind v4 sie über ',
        { code: '@theme' },
        ' konsumieren. Aliasieren Sie die gewünschten Tokens als Tailwind-Farbvariablen und nutzen Sie die passenden Utilities:',
      ],
      inlineNote: [
        'Verwenden Sie ',
        { code: '@theme inline' },
        ', nicht das plain ',
        { code: '@theme' },
        '. Ein plain Block emittiert ',
        { code: ':root { --color-primary: var(--haze-color-primary) }' },
        ', und das var() wird einmalig an ',
        { code: ':root' },
        ' aufgelöst — Haze-Tokens sind aber unter der Theme-Klasse definiert, einem Nachfahren von ',
        { code: ':root' },
        ', sodass jeder Alias dort zu nichts kollabiert. Mit ',
        { code: 'inline' },
        ' kompiliert ',
        { code: 'bg-primary' },
        ' zu ',
        { code: 'background-color: var(--haze-color-primary)' },
        ' und löst sich überall dort auf, wo die Theme-Klasse aktiv ist.',
      ],
      cascadePara: [
        { strong: 'Kaskade und Ladereihenfolge.' },
        ' Haze-UI-CSS wird unlayered ausgeliefert, während Tailwind v4 Theme, Preflight und Utilities in ',
        { code: '@layer' },
        ' legt. Unlayered Author-Styles schlagen jeden Layer unabhängig von Import-Reihenfolge oder Spezifität — setzt also ein Utility und eine Haze-Komponente dieselbe Eigenschaft (sagen wir, der Hintergrund eines Buttons), gewinnt die Komponente. Hängen Sie Tailwind v4s nachgestelltes ',
        { code: '!' },
        ' an (z. B. ',
        { code: 'w-full!' },
        '), wenn ein Utility eine Komponente überschreiben muss. Auf Eigenschaften, die Komponenten nicht setzen, gewinnen Utilities ganz normal. Dank der Layer ist es egal, ob Haze-CSS oder Tailwind zuerst lädt — achten Sie nur darauf, die Tokens genau einmal im App-Root zu laden.',
      ],
      preflightPara: [
        { strong: 'Preflight.' },
        ' Tailwinds Reset lebt in ',
        { code: '@layer base' },
        ' und fasst nur Element-Defaults an (Borders, Margins, Button-Hintergründe). Haze-Komponenten stylen sich vollständig über unlayered Token-Regeln und rendern deshalb mit aktivem Preflight identisch — behalten Sie das Standard-Setup.',
      ],
    },
    controlled: {
      title: 'Gesteuerte Komponenten',
      intro: [
        'Formularkomponenten unterstützen über ',
        { code: 'react-use-control' },
        ' sowohl den gesteuerten als auch den ungesteuerten Modus:',
      ],
      outro: [
        'Für einfache ungesteuerte Anwendungsfälle können Sie auch plain Werte übergeben — lassen Sie das ',
        { code: 'value' },
        '-Prop weg, und die Komponente verwaltet ihren eigenen Zustand.',
      ],
    },
    ssr: {
      title: 'Server-Rendering (Next.js)',
      enforcedPara: [
        'Jede Haze-UI-Komponente rendert auf dem Server und hydratisiert ohne Mismatches — die Bibliothek enthält keine ',
        { code: 'window' },
        '-Wächter. Erzwungen wird das im Repo durch zwei Suiten: ',
        { code: 'src/lib/ssr-render.node.test.tsx' },
        ' (23 Fälle durch ',
        { code: 'renderToString' },
        ' in einer echten window-losen Node-Umgebung) und ',
        { code: 'src/lib/ssr-hydration.test.tsx' },
        ' (22 Fälle durch ',
        { code: 'hydrateRoot' },
        ', mit der Zusicherung, dass Hydration-Warnungen still bleiben) — insgesamt 45 Fälle, die exemptions-Liste ist leer. Ein lauffähiges App-Router-Projekt liegt unter ',
        { code: 'examples/nextjs' },
        '.',
      ],
      boundaryPara: [
        'Haze UI bringt keine ',
        { code: "'use client'" },
        '-Direktiven mit — die Client-Grenze ziehen Sie. Komponenten halten Zustand und Effekte, importieren Sie sie also aus einer Client-Komponente; exakt diesen Pfad üben die SSR-Suiten (erst Server-Render, dann Hydration).',
      ],
      loadPara: [
        'Laden Sie das Stylesheet einmal im Root-Layout, wo globales CSS hingehört, und bringen Sie die Theme-Klassen an ',
        { code: '<body>' },
        ' an:',
      ],
      note: [
        'Haze UI verlangt ',
        { code: 'react >= 19' },
        ' (im App Router also Next.js 15 oder neuer) und liefert ausschließlich ESM — ',
        { code: "type: 'module'" },
        ', kein CommonJS-Bundle. Next.js und Vite konsumieren es out of the box; CommonJS-Server sollten ',
        { code: 'import()' },
        ' verwenden. Eine bewusste Ausnahme von „alles landet im Server-HTML“: ',
        { code: 'StreamingText' },
        ' rendert auf dem Server absichtlich ein leeres Präfix plus Cursor und streamt den Text erst auf dem Client ein.',
      ],
    },
    testing: {
      title: 'Testen mit Jest / Vitest',
      jestLead: [
        'haze-ui ist ESM-only (',
        { code: "type: 'module'" },
        ') und liefert seine Styles über CSS-Subpaths, daher braucht ein Jest-Konsument drei Anpassungen: eine jsdom-Umgebung über ',
        { code: 'jest-environment-jsdom' },
        ' (seit Jest 28 ausgekoppelt), ',
        { code: 'transformIgnorePatterns' },
        ', die Babel haze-ui und seine ESM-only-Runtime-Abhängigkeiten transpilieren lassen, und ein ',
        { code: '\\.css$' },
        '-',
        { code: 'moduleNameMapper' },
        '-Stub, damit Style-Imports auf ein leeres Modul auflösen. Da Vite-Scaffolds ',
        { code: '"type": "module"' },
        ' mitbringen, nutzen die Konfigurationsdateien unten die Erweiterung ',
        { code: '.cjs' },
        ':',
      ],
      allowNote: [
        'Die Allow-Liste ist das verifizierte Minimum: haze-ui selbst, ',
        { code: 'react-use-control' },
        ', und der ',
        { code: '@tanstack' },
        '-Scope (react-table zieht table-core und store, alle ESM). Alles andere im Dependency-Graph — react-f0rm, @dnd-kit, recharts, qrcode — liefert CommonJS und lädt ohne Transformation. Der Regex deckt beide Layouts ab: pnpm legt Pakete unter ',
        { code: '.pnpm/<name>@<ver>/node_modules/<name>/' },
        ' ab, mit Scope-Slashes als ',
        { code: '+' },
        ' kodiert, während npm und yarn ',
        { code: 'node_modules/<name>/' },
        ' verwenden. Wirf den CSS-Mapper weg und ',
        { code: "import 'haze-ui/styles.css'" },
        ' scheitert mit einem SyntaxError — das Stylesheet-Import oben testet genau diesen Stub.',
      ],
      vitestPara: [
        'Vitest braucht nichts davon: Es konsumiert ESM nativ und lässt CSS-Processing standardmäßig aus (',
        { code: 'css: false' },
        '), einfache Imports funktionieren also direkt. Diese Dokumentationsseite testet haze-ui-Komponenten unter Vitest + jsdom ohne jegliche Transform-Konfiguration.',
      ],
    },
    typescript: {
      title: 'TypeScript',
      para: [
        'Haze UI ist in TypeScript geschrieben und liefert Typdeklarationen out of the box. Alle Komponenten-Props werden als Typen exportiert:',
      ],
    },
    browser: {
      title: 'Browser-Support',
      para: [
        'Haze UI zielt auf moderne Browser, die CSS Custom Properties und das ',
        { code: '<dialog>' },
        '-Element unterstützen:',
      ],
    },
    cdn: {
      title: 'Per CDN ausprobieren',
      para: [
        'Für einen schnellen Versuch ist keine Installation nötig: das Stylesheet von unpkg, die Komponenten von esm.sh und eine einzige React-Kopie, über die Import Map fixiert:',
      ],
      note: [
        'Eine echte Version pinnen — hier ',
        { code: '1.33.0' },
        '; die aktuellste Version steht auf npm. Das Flag ',
        { code: '?external=react,react-dom' },
        ' hält haze-ui auf der einen React-Kopie der Import Map — zwei React-Instanzen brechen Hooks. Der CDN-Modus tauscht Werkzeug-Korrektheit gegen Null Setup; vor dem Bau einer App auf eine echte Installation umsteigen.',
      ],
    },
  },
  componentDetail: {
    notFoundTitle: 'Komponente nicht gefunden: {name}',
    notFoundHintSuggestions: 'Unter dieser URL liegt keine Komponente. Meinten Sie:',
    notFoundHintPlain: 'Unter dieser URL liegt keine Komponente.',
    backToAllComponents: 'Zurück zu allen Komponenten',
    copyImport: 'Import kopieren',
    copied: 'Kopiert',
  },
};
