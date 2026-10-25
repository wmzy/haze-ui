/*
 * 日本語辞書：en.ts の DeepPartial オーバーライド層。未翻訳キーはレンダ
 * 時に英語へフォールバックする（./index.tsx の mergeStrings）。そのため
 * 本ファイルには翻訳済みのキーのみを記述する——追加するキーは必ず
 * en.ts に存在していなければならず、整合性は i18n.test.tsx が検証する。
 */

import type { DeepPartial, SiteStrings } from './en';

export const ja: DeepPartial<SiteStrings> = {
  chrome: {
    openNavigation: 'ナビゲーションを開く',
    light: 'ライト',
    dark: 'ダーク',
    auto: '自動',
    language: '言語を切り替える',
    noCustomTheme: 'カスタムテーマなし',
    themeEditor: 'テーマエディター',
    viewSourceAt: '{version}（{commit}）のソースを見る',
    viewSource: 'GitHub でソースを見る',
    devDocsBanner: '開発ブランチのドキュメントを表示しています（未リリース）。',
    devDocsBannerStableLink: '最新の安定版ドキュメントを見る。',
    starOnGitHub: 'GitHub にスター',
    search: '検索',
    searchComponents: 'コンポーネントを検索',
    searchPlaceholder: 'コンポーネントを検索…',
    clearSearch: '検索をクリア',
    noComponentsMatch: '「{query}」に一致するコンポーネントはありません',
    noResultsMatch: '「{query}」に一致する結果はありません',
    docs: 'ドキュメント',
  },
  nav: {
    home: 'ホーム',
    gettingStarted: 'はじめに',
    recipes: 'レシピ',
    aiElements: 'AI 要素',
    blocks: 'ブロック',
    guides: 'ガイド',
    tokens: 'デザインイントークン',
    components: 'コンポーネント',
    overview: '概要',
    aiShowcase: 'AI ショーケース',
    themeEditor: 'テーマエディター',
    changelog: '変更履歴',
    help: 'ヘルプ',
    about: 'このサイトについて',
  },
  guides: {
    darkMode: 'ダークモード',
    density: '密度（コンパクト）',
    a11y: 'アクセシビリティ',
    a11yContracts: 'アクセシビリティ契約',
    a11yStatement: 'WCAG 2.2 適合性',
    migration: 'AntD / shadcn からの移行',
    streamingA11y: 'ストリーミングのアクセシビリティ',
    motion: 'モーションプリセット',
    figmaTokens: 'Figma のデザイントークン',
    serverActions: 'React 19 Actions',
    composition: 'コンポジションとカスタマイズ',
  },
  guideSummaries: {
    darkMode: '明暗両方のトークンクラス、useDarkMode フック、実行時ブランドテーマ。',
    density: '密度トークンによるコンパクト/ゆとりある余白の切り替え。',
    a11y: 'キーボード、スクリーンリーダー、WCAG の実践を全コンポーネントに内蔵。',
    a11yContracts: 'テストスイートから抽出したコンポーネント別のキーボード・ARIA 契約。',
    a11yStatement: 'アクセシビリティ適合性レポート：WCAG 2.2 A/AA を条項ごとに、テストマトリクスを根拠に判定。',
    migration: 'AntD や shadcn/ui から haze-ui への移行手順。',
    streamingA11y:
      'ストリーミング AI 出力のアクセシビリティ：ライブリージョン、アナウンス、モーションの抑制。',
    motion: 'モーショントークンの上に築いた data-state 駆動の登場/退場アニメーションプリセット。',
    figmaTokens:
      'W3C DTF トークンエクスポートを Tokens Studio と Figma Variables に接続する：手順と限界。',
    serverActions:
      'ネイティブ FormData・useActionState・useOptimistic で haze-ui を Server Actions に接続。',
    composition:
      '5つのエスケープハッチ：Core バリアント、as ポリモーフィズム、headless エントリ、classNames スロット、デザイントークン。',
  },
  blocks: {
    title: 'ブロック',
    intro:
      'haze-ui コンポーネントだけ組み合わせたページ単位の構成。各ブロックはその場でプレビューし、ソースを読み、StackBlitz の実行可能な Vite プロジェクトとして開けます。',
    dashboard: {
      title: '分析ダッシュボード',
      description:
        'AppShell に Sidebar ナビゲーションと Breadcrumb、Stat 指標カードの行、ツールバーのエクスポート・密度切替・ページング付き DataTable。',
    },
    login: {
      title: 'サインインページ',
      description:
        'ブランドパネルの隣に中央揃えの Card でフォーム一式 —— zod 検証、フィールドごとのエラー表示。',
    },
    settings: {
      title: 'ワークスペース設定',
      description:
        'card バリアントの Tabs で 3 つの設定セクション。Switch・RadioGroup・Select・Combobox すべて制御可能状態パターン。',
    },
    chat: {
      title: 'AI チャットワークスペース',
      description:
        'AI 会話ファミリーを 1 画面に —— role="log" の ChatContainer、思考 → ツール呼び出し → ストリーミング回答のスクリプト化ターン、送信ボタンが停止に切り替わる ChatInput、右側に ConversationList。',
    },
    crud: {
      title: 'マスター–詳細 CRUD',
      description:
        '左の Tree でチームを選び、ツールバーと密度切替付き DataTable がパイプラインを一覧。Dialog + zod フォーム編集、ConfirmDialog による削除確認、Toast フィードバックで一連の流れを完成。',
    },
    aiWorkbench: {
      title: 'AI レビューワークベンチ',
      description:
        'Workbench シェルを 2 段組の AI デスクに —— アクティビティレールと ConversationList サイドバー、中央に思考 → ツール呼び出し → ストリーミング回答のスクリプト化レビュー、右にドッキングした Sources 引用パネル、入力は PromptInput + ModelPicker。',
    },
    dataTable: {
      title: 'データテーブルコンソール',
      description:
        'TanStack ベースの DataTable でフル fleet ページ —— ソート・リサイズ可能な列、列ごとのフィルター行、ページング、列表示、密度、CSV エクスポート、チェックボックスの一括選択とバルクアクションバー。',
    },
    kanban: {
      title: 'スプリントかんばん',
      description:
        '優先度バッジ・ラベル・担当者アバター・進捗バー付きの issue カード 4 列。カードは ⋯ メニューで移動 —— haze-ui は単一コンテナのソートのみで列間ドラッグはないため、ボードは意図的に静的。',
    },
    formWizard: {
      title: 'マルチステップ・セットアップ',
      description:
        '1 枚の zod バリデーション Form を Stepper が案内 —— 値はステップ間で保持され、Next は trigger() で現在ステップが合格した時だけ進み、最終送信は Alert レシートになる。',
    },
    filterList: {
      title: '絞り込み可能なテンプレート一覧',
      description:
        '検索 Input・カテゴリ Checkbox・地域と並び替えの Select からなるフィルターレールが、Avatar・Badge・Rating 入りのカード一覧を駆動。有効な条件は閉じられる Chip、無一致は Empty、下部は Pagination。',
    },
    profile: {
      title: 'メンバープロフィール',
      description:
        '大きな Avatar と状態 Badge、制御可能なフォロートグルを備えたヘッダーの下に、Descriptions のプロフィール表、TagGroup のスキル、AvatarGroup のチームメイト、Timeline のアクティビティを配置。',
    },
  },
  componentGroups: {
    General: '全般',
    Layout: 'レイアウト',
    Forms: 'フォーム',
    Overlays: 'オーバーレイ',
    'Data Display': 'データ表示',
    Navigation: 'ナビゲーション',
    Feedback: 'フィードバック',
    'AI & Chat': 'AI とチャット',
    Utilities: 'ユーティリティ',
  },
  components: {
    // General
    Avatar:
      'ユーザーアバター：画像、複数のサイズ、画像が無い場合のフォールバック内容に対応。',
    AvatarGroup:
      'アバターを重ねて並べるグループ。溢れた分は +N チップで表示（max/total）。',
    Badge: 'バリアントと色を選べる小さなインライン状態ラベル。',
    Button:
      'アクションボタン：variant/size/square オプションを備え、内部はネイティブ <button>。',
    ButtonGroup:
      '連結ボタンバー：角と継ぎ目を統合し、グループ単位の size/variant/disabled を配布。セパレーターサブコンポーネント付き。',
    CountUp:
      '数値ティッカーアニメーション：rAF + ease-out 補間で目標値へ到達。prefers-reduced-motion 時は瞬時に確定。',
    Countdown:
      '期限カウントダウン：秒境界に揃えたタイマー連鎖、onFinish は一度だけ発火、適応的な d/h:mm:ss フォーマット。',
    Divider: 'コンテンツの区切り線。水平または垂直。',
    Ellipsis:
      'インタラクティブなテキスト省略：N 行クランプと切り詰め検出、任意の tooltip と展開/折りたたみ。',
    Icon: 'インライン SVG アイコンラッパー。トークンサイズの sm/md/lg ボックス。',
    Tag: 'バリアント配色と任意の閉じるボタンを備えたコンパクトな状態ラベル。',
    TagGroup:
      'Tag 子要素を一定の gap で並べる flex-wrap コンテナ。sortable + onReorder でドラッグ並べ替え。',
    Typography:
      'テキストプリミティブ：タイポグラフィトークン上の Title、Text、Paragraph。',

    // Layout
    AspectRatio: '子要素を固定の幅/高さ比にボックス化。',
    AppShell:
      'アプリケーションフレーム：吸着ヘッダー、折りたたみ可能なサイドバー、コンテンツとフッターのスロット。768px 未満ではサイドバーがオーバーレイに切り替わります。',
    Container: '水平パディング付きの中央寄せ最大幅ページコンテナ。',
    Flex: 'props を flex CSS へ対応付ける Flexbox レイアウトプリミティブ。',
    Grid: 'CSS Grid レイアウトプリミティブ。',
    Masonry:
      'ピンボードレイアウト：JS の貪欲分配で子要素を列間でバランス（順序優先、次に最短列へ）。',
    Resizable:
      'ドラッグ可能な仕切りを持つ分割ペイングループ（ResizableGroup、水平/垂直）。パネルごとの px defaultSize/minSize/maxSize、折りたたみ可能パネル、永続化用 onResizeCommit。',
    ScrollArea: 'オーバーレイのスクロールバーサムを備えたスクロール領域。maxHeight のショートハンドまたは Viewport/Scrollbar の合成、hover/always/scroll 表示モード、キーボードフォーカス可能なビューポート。',
    Sidebar:
      '折りたたみ状態を制御可能なアプリサイドバーのシェル（aside とレール幅トークン）。',
    Splitter:
      'Splitter：マルチペイン分割レイアウト（antd Splitter 準拠）：ペイン間に暗黙のドラッグ可能な仕切りを挿入。sizes はペイン領域の割合を ControlOrValue 配列で一元制御、ペインごとの min/max パーセント制約、任意の collapsible ペイン（仕切りの折りたたみ/展開トリガーで折りたたみ前の比率を復元）、矢印キー 5% ステップと Home/End、onSizesChange のライブコールバック。px 単位のペインには Resizable を使用。',
    ActivityRail:
      'VSCode 風の縦型アイコンレール（nav）：44px 項目に icon/label/badge とアクティブインジケーター、ツールチップラベル、slot="end" で下部に固定。orientation="horizontal" で横帯として配置——レールをサイドバー列にドッキングすると Workbench が自動的に切り替えます。',
    StatusBar:
      'VSCode 風ステータス帯（footer）：left/right グループ、選択可能な StatusItem、priority 項目はモバイルブレークポイントでも維持されます。',
    TabBar:
      'モバイル底部ナビゲーション（ActivityRail のビューポート対応）：56px のセーフエリア対応帯、badge、onSelect/onReselect セマンティクス。',
    Workbench:
      'IDE 風アプリケーションフレーム（100dvh）：activityBar/sidebar/auxiliaryBar/panel/statusBar/tabBar スロット、px リサイズ可能な折りたたみ領域、最大化可能な下部パネル。レールはサイドバーの脇または内部（上/下、Cursor 式）にドッキング可能。768px 未満ではフレームが形を変えます——レールはエディター上方の全幅横帯になり、サイドバーは独立した全画面レイヤーになります（デフォルト閉、tabBar から開く）。',

    // Forms
    Cascader:
      '複数階層のドリルダウンセレクター：オプション値のパスを確定。onSearch でリモート絞り込み、loading で待機状態を表示。',
    Checkbox: 'checked 状態を制御可能なチェックボックス。',
    ColorPicker: '色セレクター：value を制御可能、プリセットスウォッチ付き。',
    Combobox:
      'オートコンプリート入力：絞り込み可能なオプションリスト。onSearch で絞り込みをホストに委譲。',
    DateField: 'セグメント型の日付入力（年/月/日の各セグメントを直接入力）。カレンダーなし。',
    Datepicker:
      'ポップアップカレンダー付きの日付入力（YYYY-MM-DD 値）。showTime で時刻フィールドを追加。',
    DateTimePicker:
      '日付+時刻ピッカー（時刻行を常に表示した Datepicker）。showSeconds はオプトイン。値は YYYY-MM-DD HH:mm[:ss] にシリアライズ。',
    DateRangePicker:
      '開始/終了の日付範囲を選択。組込みまたはカスタムのプリセット付き（今日、過去 7 日間…）。',
    Fieldset:
      'フォームセクション用のセマンティックな fieldset+legend グルーピング。disabled で内部の全コントロールを無効化。',
    FileInput: '隠されたネイティブファイル入力を開くトリガー要素。',
    Form: 'react-f0rm フィールドラッパー：制御型コアに label、エラー、aria 配線を追加。',
    ImageCrop:
      '画像クロップ（Upload と併用）：正規化 CropRect を制御可能。アスペクト比ロック、円形アバターマスク、キーボード完全操作（矢印キーで移動、Shift+矢印キーでリサイズ）に対応。',
    InlineEdit: 'クリックでその場から編集できるテキスト値。',
    Input: 'テキスト入力：装飾（アダーンメント）付き。InputCore のシュガー。',
    InputGroup: 'フィールドクラスタ：前後のアドオン（アイコン・テキスト・ボタン）と Input/Select を一体化。',
    Meter: '読み取り専用セマンティックゲージ：値がしきい値を越えると track と bar が変色。',
    CopyButton: 'ワンクリックコピーボタン、「コピー済み」フィードバック付き。Snippet コードチップ同梱。',
    Heatmap: 'GitHub 風アクティビティヒートマップ：値に応じてマスを色分け、配色はテーマに追従。',
    TimeGrid: '時間帯ウィンドウとステップから生成される時間グリッド：矢印キーで移動・選択。',
    Mentions: 'メンション入力：トリガー文字でオプションリストから候補を提示。',
    NumberInput: '数値入力。min/max/step に対応。',
    OTPInput: 'length 個の分かれた文字枠によるワンタイムパスワード入力。',
    PasswordInput: '可視性の切替表示付きテキスト入力。',
    MaskedInput:
      'パターン（9 数字、a 英字、A 大文字、* 英数字、\\ エスケープ）で入力を制限するマスク入力。unmask() で生の値を取り出せます。',
    PhoneInput:
      '国際電話番号入力：国セレクトと番号フィールドを連結、E.164 形式の値、libphonenumber-js による検証。',
    Radio: 'ラジオオプションとグループ。選択を制御可能。',
    Rating: 'スターレーティング。ハーフステップに対応。',
    RichTextEditor: 'Tiptap ベースのリッチテキストエディター。書式設定ツールバー内蔵、HTML 値は制御可能。',
    Segmented: 'セグメントコントロール：コンパクトな選択肢群から 1 つを選択。',
    Select:
      'ドロップダウンセレクト：SelectCore をベースに <option> 子要素を取る。onSearch でサーバー側絞り込み。',
    Signature:
      'キャンバス署名パッド：ストロークごとに PNG data URL を確定。undo、clear、canvas 非対応時のフォールバック通知付き。',
    Slider: 'ネイティブレンジスライダー。value を制御可能。',
    Switch: 'トグルスイッチ（role="switch"）。checked を制御可能。',
    TagInput:
      'Enter で確定するトークン入力。TagInputCore ベース。sortable でドラッグ並べ替え（新しい順序は onChange で通知）。',
    Textarea: '複数行テキスト入力。',
    TimePicker: '時刻入力。value を制御可能。',
    TimeField: 'セグメント型の時刻入力（時/分/秒、任意の 12 時間制 AM/PM）。',
    Toggle:
      '二状態の押下ボタン（aria-pressed）：サイズとスクエアアイコンモード。ToolbarToggle バリアントはツールバーの roving focus に連動。',
    Transfer: '二列シャトル：元リストと対象リストの間でオプションを移動。',
    TreeSelect:
      'フローティングパネル内のツリー選択：行選択は単一キーを、カスケードチェックボックスは string[] を確定。パネル内検索、遅延 loadData、チップの溢れ表示に対応。',
    Upload:
      'ファイルピッカー：File[] を蓄積する値、accept/multiple、ディレクトリ選択、listType 表示に対応。',

    // Overlays
    BottomSheet: 'モバイル風シート。画面下端からスライドイン。',
    ConfirmDialog:
      '完成品の確認ダイアログ：確認/キャンセル操作と danger バリアント付き。',
    ContextMenu: '右クリックで開くフローティングメニュー。',
    Dialog: 'モーダルダイアログ。フォーカストラップ付き。',
    Drawer: '端にアンカーされたスライドパネル（placement 左/右）。',
    DropdownMenu: 'クリックで開くフローティングメニュー。',
    HoverCard:
      'トリガーにアンカーされた非モーダルのフローティングプレビュー（アバターカード、リンク要約）。',
    Menu: '軽量トグルメニュー：トリガーと静的配置パネル（MenuItem、MenuDivider）。',
    NotificationCenter: 'ベルトリガーで開く常設通知センター：未読バッジ、重大度/種別行、すべて既読・すべて消去。',
    Popconfirm: 'トリガー要素にアンカーされた確認バブル（確認/キャンセル操作付き）。',
    Popover: 'トリガー要素にアンカーされたフローティングポップオーバー。',
    Tooltip: 'ホバー/フォーカス時のヒントバブル。',

    // Data Display
    Accordion: '折りたたみ可能なセクションリスト（title を持つ AccordionItem）。',
    Calendar: '月グリッドの日付サーフェス。min/max、locale、weekStartsOn に対応。',
    Card: 'コンテンツカード。elevated/outlined/filled バリアント。',
    Carousel: 'スライドショー：アクティブインデックスを制御可能、自動再生に対応。',
    Chart:
      'recharts 上の折れ線/面/棒/円グラフ：色と軸は haze トークン、系列はセマンティックパレットを巡回、renderTooltip でツールチップをカスタマイズ。',
    Chip: '丸みを帯びたステータスチップ。任意のアイコンと閉じるボタン付き。',
    CodeBlock:
      '等幅コードコンテナ：言語バッジ付き。highlight で非同期シンタックスハイライターを接続。',
    DataTable:
      '@tanstack/react-table 上の高機能テーブル（並べ替え、行選択、クライアントまたは手動ページネーション）。dataTableToCsv で行をエクスポート。',
    Descriptions:
      '定義リスト形式の説明グループ（CSS Grid 上の dl/dt/dd）：items のペア、columns、bordered、size。',
    Image: '画像：フォールバック付き、aspectRatio/objectFit を制御可能。',
    Indicator:
      'ホスト要素に付く角バッジ：ドットまたはカウントラベル、トーンと角の位置、showZero。',
    JsonView:
      '折りたたみ可能な JSON ツリー：種類別の葉の色、深さに応じた既定展開、切り詰めヒント、任意のコピー ボタン。',
    Kbd: 'ショートカット用のキーキャップスタイル。',
    List: 'スタイル付きリスト。ul/ol/plain バリアント。',
    Mark: 'ステータストーンのテキストレベルハイライト（セマンティック mark 要素）。',
    Highlight:
      '検索結果のテキストハイライト：文字列にまたがる強調表示。複数 needle 対応、エスケープ済み（innerHTML 不使用）。',
    NumberFormatter:
      'Intl 上の表示用数値フォーマット：locale、formatOptions（通貨/単位/パーセント）、prefix/suffix。',
    Progress: '進捗バーまたは進捗リング。パーセント値で駆動。',
    QRCode:
      'QR コード：単一の鮮明な SVG パスとして描画。value/size/level/bordered オプション、モジュールと背景色はテーマトークンに従う。',
    Schedule: '日／週／月ビューのカレンダースケジュール面。ドラッグとキーボードでの再スケジュール、月グリッドのオーバーフローチップ付き。',
    Stat: '指標表示：タイトル、値、トレンドインジケーター。',
    Sparkline:
      'インライン SVG ミニトレンドチャート：ステートレス、recharts 不使用、RSC 安全。ラインまたは塗り面バリアントをセマンティックトーントークンで。',
    Table: 'スタイル付きセマンティックテーブル（striped、bordered）。',
    Timeline: '縦タイムラインコンテナ。TimelineItem 子要素を載せる。',
    Tree: '階層ツリー：展開/選択/チェック状態、非同期 loadData と searchValue 絞り込み。',
    VirtualList:
      'ウィンドウ化リスト：可視行のみを描画。固定または実測の動的高さに対応。',
    Watermark:
      'タイル状のキャンバスウォーターマーク層（子要素または全面）。テーマ追従色、canvas 2d 非対応でも優雅に劣化。',

    // Navigation
    Affix: 'オフセットを超えてスクロールすると子要素をビューポート端に固定。',
    Anchor:
      '吸着スクロール追従ナビゲーション：items リストがアクティブセクションをハイライト（IntersectionObserver、activeId は制御可能）、クリックで offsetTop 付きスクロール。',
    BackToTop: '上部へ戻るフローティングボタン。スクロールしきい値を超えると出現。',
    Breadcrumb: 'パンくずナビ。区切り文字を設定可能。',
    Command: 'コマンドパレットサーフェス：CommandInput と絞り込み可能な CommandItem。',
    FloatButton:
      'ページ上のフローティングアクションボタン。FloatButtonGroup はアクションを展開トリガーの背後に束ね、トップへ戻る・ヘルプのグリフを内蔵。',
    NavigationBar: '上部ナビゲーションバー：brand と end スロット。',
    NavigationMenu: 'ホバー式メガメニュー：トリガーが意図遅延で大きなコンテンツパネルを開き、ポインタ離脱には猶予期間。activeValue は制御可能。',
    Pagination: 'ページナビゲーション：page を制御可能、省略記号ウィンドウ付き。',
    Stepper: 'ステップインジケーター。activeStep で駆動（Step 子要素）。',
    Tabs: 'タブパネル切替。アクティブタブを制御可能。',
    Toolbar:
      'ツールバー a11y 付きボタングループ（roving tabindex。ToolbarButton、ToolbarSeparator）。',
    Tour: 'ガイド巡回：マスクの下でステップをスポットライト。current を制御可能。',

    // Feedback
    Alert: 'インライン状態メッセージボックス。',
    AsyncSection: '非同期データのための宣言的な loading / error / コンテンツ状態。',
    Banner: '閉じられるトップバナー。info/success/warning/danger バリアント。',
    Empty: '空状態プレースホルダー：画像と説明。',
    ErrorBoundary:
      'レンダーエラー境界：サブツリーの例外を捕捉し、フォールバック（ノードまたは描画関数）にリセットコールバックを提供。resetKeys の浅い比較変化でリセット。',
    Result:
      '結果フィードバックページ：状態イラスト（success/error/info/warning/403/404/500）、title、subTitle、extra 操作エリア。icon で既定イラストを置き換え可能。',
    Skeleton: 'きらめくローディングプレースホルダー（text/circular/rectangular）。',
    Spinner: 'ローディングスピナー。',
    LoadingOverlay:
      'コンテナレベルのローディング状態：内容を暗くし、スピナー（またはカスタム loader）を中央に配置、aria-busy が状態を反映。',
    Spoiler:
      '長い内容を畳むゲート（もっと見る/閉じる）：高さを抑えたプレビューにフェード縁、expanded は制御可能。',
    VisuallyHidden:
      'スクリーンリーダー専用コンテンツプリミティブ：視覚的には切り取られ、a11y ツリーには残る。',
    Toast: 'トースト通知：useToast + ToastContainer（命令型 toast() ヘルパーも同梱）。',

    // AI & Chat
    ApprovalCard: '承認ゲート：エージェントが開始した操作を承認 / 拒否。',
    ChatContainer: 'チャット履歴のスクロールコンテナ：最下部追従の自動スクロール。',
    ChatInput: 'メッセージ入力欄：value を制御可能、onSend コールバック。',
    ChatMessage:
      'チャットバブル：役割別レイアウト（user / assistant / system）、アバター、名前、タイムスタンプ、配信状態。',
    ConversationList: '会話リスト：チャット履歴サイドバー用の選択可能なリスト。',
    DiffViewer:
      'エージェントが提案する編集に向け、新旧コンテンツの行差分を描画。',
    FollowUpSuggestions: 'AI チャットの回答の下に表示される、クリック可能なフォローアップ候補チップ。',
    FilePreview:
      '添付カード：画像サムネイルまたは拡張子バッジ、アップロード進捗、削除/再試行。',
    InlineCitation: '行内上付き引用マーカー：クリックでタイトル・抜粋・外部リンク付きのフローティング出典カードを開く。',
    InlineCompletion:
      'input/textarea 向けゴーストテキスト補完：Tab で候補を確定、Escape で閉じる。',
    LogViewer: 'スクロール可能なログストリーム。重大度レベルでフィルタ。',
    MarkdownRenderer: 'Markdown コンテンツ（コードブロック含む）を描画。アシスタント応答用。',
    ModelPicker: 'アクティブなモデルを選ぶドロップダウン。制御可能。',
    Plan: 'エージェントの計画と進捗：タイトル付きステップリストで、各ステップの状態が進捗バーと要約を自動駆動。',
    PromptInput:
      'AI プロンプト入力：自動伸長テキストエリア、インラインのコンテキストタグ、@ トリガー候補、設定可能な送信キー。',
    Queue: '送信待ちのエージェント操作／メッセージキュー。queued/sending/failed 状態と項目ごとの削除に対応。',
    Sources:
      'RAG 回答の番号付き引用リスト：hover/focus で抜粋を展開（expanded 集合は制御可能）、compact はインライン [1] [2] バッジを描画。',
    StepTimeline: 'エージェント実行ステップの縦タイムライン：ステップ状態（running 含む）、所要時間、折りたたみ可能な詳細とネストされたサブステップ。',
    TaskList: 'エージェントのタスクチェックリスト：チェックボックス行は完了するとタイトルに取り消し線とグレーアウト。複合子要素か items データ駆動の両形式。',
    StreamingText:
      'タイプライター効果：ストリーミングテキストを一文字ずつ明かす。任意のカーソル付き。',
    ThinkingIndicator:
      '弾むドットのアニメーションインジケーター：エージェントが処理中であることを示す。',
    TokenCounter: 'コンテキストウィンドウの token 使用量カウンター。予算の進捗付き。',
    ToolCallCard:
      'エージェントのツール呼び出しを示すカード——名前、入力、出力、実行状態。',
    Trace:
      'エージェントの推論ステップを1行ずつ示すトレース。行ごとのステータス（待機/実行中/完了/エラー）、カスタムアイコン、展開可能な詳細、スクリーンリーダー向けステータス読み上げに対応。',

    // Utilities
    Collapsible: 'スタイルなしの開閉コンテナ。open 状態を制御可能。',
    Disclosure: '概要ヘッダー型の開閉パネル（details/summary セマンティクス）。',
    Fullscreen:
      'ラップモードの Fullscreen API バインディング：単一トリガー子要素を包み、fullscreen 状態を制御可能。useFullscreen() フックもエクスポート。',
    LocaleProvider:
      'ロケール対応コンポーネントへ UI 文字列パックを供給（組込みは英語、zh-CN、ja-JP）。direction（明示指定または locale から導出）は useDirection() に渡る。createStrings(base, overrides) でテーブルを複製せずパックを派生。',
    ConfigProvider:
      'コンポーネント prop のデフォルト上書き（Button サイズ、Toast の duration/placement、Tooltip 遅延、HoverCard 開閉遅延）。useConfigDefaults() 経由で読み取る。明示的な props が常に優先され、Provider はセクションごとの浅いマージでネスト可能。',
    SwipeAction: 'スワイプ操作：左右端のスワイプで行アクションを露出。コミットしきい値付き。',
    PullToRefresh:
      'モバイルのプル・トゥ・リフレッシュ：スクロールコンテンツを包み、減衰付きのプルで発火。promise の解決までスピナーを保持、インジケーターは render prop。',
  },
  home: {
    hero: {
      title: 'Haze UI で、より速く構築',
      subtitle:
        '軽量でアクセシブルな React コンポーネントライブラリ。ゼロランタイム CSS-in-JS、デザインイントークン、{count} 個の実運用可能なコンポーネントを備えます。',
      getStarted: 'はじめる',
      components: 'コンポーネント',
      copyAria: 'インストールコマンドをコピー',
      copied: 'コピーしました',
      copy: 'コピー',
    },
    stats: {
      components: 'コンポーネント',
      cssLabelFull: 'CSS フルバンドル · {raw} 生サイズ',
      cssLabelFallback: 'CSS — pnpm build を実行してください',
      runtimeJs: 'スタイル用ランタイム JS',
      builtInThemes: '内蔵テーマ',
    },
    wall: {
      title: 'スクリーンショットではなく、本物のコンポーネント',
      subtitle:
        '以下のコントロールはすべて動作します——クリック、ドラッグ、入力して、実際のライブラリを体験してください。',
    },
    features: {
      title: 'なぜ Haze UI なのか？',
      subtitle: 'モダンな React インターフェースに必要なものを、過不足なく。',
      zeroRuntime: {
        title: 'ゼロランタイムオーバーヘッド',
        desc: 'スタイルは Linaria によりビルド時に抽出されます。ランタイム CSS-in-JS のコストはありません。',
      },
      designTokens: {
        title: 'デザインイントークン',
        desc: 'CSS カスタムプロパティによる一貫したテーミング。ライト/ダーク両テーマを内蔵。',
      },
      components: {
        title: '{count}+ コンポーネント',
        desc: 'ボタンから datepicker まで、Open UI 標準に従い一貫性を保ちます。',
      },
      accessible: {
        title: 'アクセシブル',
        desc: '<dialog> や <details> などのネイティブ要素の上に構築され、a11y を標準装備します。',
      },
      nativeOverlays: {
        title: 'ネイティブ popover オーバーレイ',
        desc: 'フローティングレイヤーはネイティブ popover API と CSS anchor positioning の上に載る——エンジンが配置を計算し、JS の算出はゼロ。',
      },
      screenReaderCi: {
        title: 'VoiceOver CI ゲート',
        desc: 'macOS CI で実際の VoiceOver 出力をアサート——axe と e2e を超える本物のスクリーンリーダーゲート。',
      },
      aiDocs: {
        title: 'AI 対応ドキュメント',
        desc: 'MCP サーバー（npx haze-ui-mcp）と llms.txt を同梱——エージェントもあなたと同じドキュメントを読む。',
      },
      treeShakeable: {
        title: 'ツリーシェイカブル',
        desc: 'preserveModules 付きの ES モジュール出力。使う分だけ import できます。',
      },
      controlled: {
        title: '制御・非制御両対応',
        desc: 'フォームコンポーネントは react-use-control により両モードをサポートします。',
      },
      typescript: {
        title: 'TypeScript ファースト',
        desc: 'TypeScript で書かれ、全コンポーネントの props 型をエクスポートします。',
      },
      lightweight: {
        title: '軽量',
        descFull:
          'CSS フルバンドルは {raw}（gzip 圧縮で {gzip}）。コンポーネント単位の import ならさらに小さくなります。',
        descFallback:
          '小さな CSS フットプリント、重い依存なし。パフォーマンスのために設計されています。',
      },
      customizable: {
        title: 'カスタマイズ可能',
        desc: 'CSS 変数で任意のデザインイントークンを上書きできます。全コンポーネントが className を透過します。',
      },
    },
    compare: {
      title: '比較',
      subtitle:
        'ゼロランタイムスタイリング、単一 prop での状態制御、内蔵 AI コンポーネント。',
      dimension: '項目',
      rows: {
        stylingRuntime: 'スタイリングのランタイム',
        stateApi: '状態 API',
        formBinding: 'フォームバインディング',
        aiComponents: 'AI コンポーネント',
        perComponentCss: 'コンポーネント単位の CSS',
        shippedCss: '出力 CSS',
      },
      shippedFull: '約 {gzip} gzip',
      shippedFallback: 'コンポーネント単位の CSS',
    },
    size: {
      title: 'バンドルサイズ',
      subtitle:
        'ローカルのライブラリビルドから計測したファミリー別 CSS。tokens.css は一度だけ読み込み、あとは描画するコンポーネントだけです。',
      summary:
        '{families} 個の CSS ファミリー · フルバンドル（haze-ui.css）：{raw} / {gzip} gzip',
      sortAriaDesc: 'ファミリーを gzip サイズで並べ替え。現在は降順です',
      sortAriaAsc: 'ファミリーを gzip サイズで並べ替え。現在は昇順です',
      sortLabel: 'gzip で並べ替え',
      family: 'ファミリー',
      css: 'CSS',
      cssGzip: 'CSS (gzip)',
      note: '{date} 時点で scripts/generate-size-report.mjs が計測（gzip level 9）· 再生成は pnpm build を実行。',
      hint: 'ローカルのビルド成果物が見つかりません——pnpm build でこのレポートを再生成してください。',
    },
    code: {
      title: 'シンプルな設計',
      subtitle: '邪魔にならないクリーンな API。実際のコードはこちら：',
      quickSetup: 'クイックセットアップ',
      description:
        'スタイルシートを取り込み（フルバンドルまたはコンポーネント単位の CSS）、テーマクラスを適用し、コンポーネントを使い始めるだけ。Provider も context ラッパーも設定ファイルも不要です。',
    },
    footer: {
      license: 'MIT ライセンス',
      builtWith: 'React 19 で構築',
    },
  },
  gettingStarted: {
    title: 'はじめに',
    intro: 'React プロジェクトで Haze UI を数分で使い始められます。',
    installation: {
      title: 'インストール',
      peers: [
        'Haze UI は ',
        { code: 'react >= 19' },
        ' と ',
        { code: '@linaria/core >= 7' },
        ' を peer 依存として要求します。',
      ],
      orOtherManagers: '他のパッケージマネージャーを使う場合：',
    },
    frameworks: {
      title: 'フレームワーク連携',
      switchLabel: 'フレームワーク',
      intro: [
        'インストール方法はどこでも同じで、違うのは CSS の読み込み位置だけです。モード名は README のクイックスタートと対応します：',
        { strong: 'A' },
        ' は単一の完全スタイルシート、',
        { strong: 'B' },
        ' はコンポーネント単位の CSS です。',
      ],
      vite: {
        lead: 'Vite アプリ（React 19・TypeScript）を作成してライブラリを追加します：',
        modeA: [
          { strong: 'モード A —— 単一の完全スタイルシート（最もシンプル）。' },
          ' エントリモジュールで 1 回 import するだけで全コンポーネントをカバーします：',
        ],
        modeB: [
          { strong: 'モード B —— コポーネント単位の CSS。' },
          '公式 Vite プラグインが各 ',
          { code: "import { … } from 'haze-ui'" },
          ' 文を読み、対応する ',
          { code: 'css/*.css' },
          ' ファイルを自動注入します（tokens を含む。モジュールグラフが重複を排除）：',
        ],
        pluginNote: [
          { code: 'vite-plugin-haze-ui' },
          ' は npm で公開済みです。',
          { code: 'npm i -D vite-plugin-haze-ui' },
          ' でインストールしてください。自分でファイルを選びたい場合は、',
          { code: 'haze-ui/css/tokens.css' },
          ' と使用するファミリーのファイルを import してプラグインを省略できます——手動の書式は上の「セットアップ」節にあります。',
        ],
      },
      next: {
        lead: 'App Router プロジェクト（Next.js 15+ は React 19 同梱）を作成してライブラリを追加します：',
        modeA: [
          { strong: 'モード A —— 単一の完全スタイルシート（最もシンプル）。' },
          ' グローバル CSS はルートレイアウトに置きます：',
        ],
        modeB: [
          { strong: 'モード B —— コンポーネント単位の CSS。' },
          'プラグインは不要——',
          { code: 'haze-ui/css/tokens.css' },
          ' と実際に描画するファミリーのファイルをルートレイアウトで列挙します：',
        ],
        note: [
          '下の「サーバーサイドレンダリング」節の通り、テーマクラスを ',
          { code: '<body>' },
          ' に適用すると全ルートに継承されます。',
        ],
      },
    },
    otherBundlers: {
      title: 'その他のバンドラー（webpack / Rspack）',
      lead: [
        'Vite 以外ではプラグイン不要です。haze-ui は事前抽出済みのプレーンな CSS ファイルとして公開されます。エントリーモジュールで ',
        { code: 'haze-ui/styles.css' },
        '（またはコンポーネント単位の ',
        { code: 'haze-ui/css/*' },
        '）をインポートし、標準の css ローダーチェーンに渡すだけです：',
      ],
      configLead: [
        { strong: '最小限の webpack 5 設定' },
        ' —— ',
        { code: 'css-loader' },
        ' とスタイル注入器（開発では ',
        { code: 'style-loader' },
        '、独立スタイルシートには ',
        { code: 'mini-css-extract-plugin' },
        '）：',
      ],
      sideEffectsNote: [
        'パッケージは ',
        { code: '*.css' },
        ' を ',
        { code: 'sideEffects' },
        ' としてマークしているため、CSS インポートは tree-shaking で失われず、未使用の JS は通常どおり除去されます。',
        { code: '@linaria/core' },
        ' は自分でマッチスタイルを書くときにだけ必要です。ライブラリのスタイルはビルド時に抽出済みで、Linaria のコードはバンドルに入りません。',
      ],
      rspackNote: [
        { strong: 'Rspack はそのまま動作します：' },
        '同じ webpack 設定を ',
        { code: 'rspack build' },
        ' で実行するだけで、上の css ルールは変更不要です。',
      ],
    },
    setup: {
      title: 'セットアップ',
      steps: [
        {
          lead: [
            { strong: 'スタイルシートを取り込む' },
            ' —— フルバンドルを読み込むか、tokens と使うコンポーネントの CSS だけを読み込みます。',
          ],
        },
        {
          lead: [
            { strong: 'テーマを適用する' },
            ' —— アプリ（または任意のサブツリー）をテーマクラスで包み、デザインイントークンを有効化します。',
          ],
        },
        {
          lead: [
            { strong: 'コンポーネントを使う' },
            ' —— 任意のコンポーネントを import して直接使えます。',
          ],
        },
      ],
    },
    theming: {
      title: 'テーマ',
      tokensPara:
        'Haze UI のすべての視覚的な値は CSS カスタムプロパティ（デザインイントークン）から供給されます。内蔵テーマは 2 つです：',
      overridePara:
        '親要素に CSS 変数を設定すれば、任意のトークンを上書きできます：',
      prefixNote: [
        'すべてのトークンは ',
        { code: '--haze-' },
        ' プレフィックスを持ち、他のライブラリとの競合を避けています。完全なトークン一覧はソースコードを参照してください。',
      ],
      dtfPara: [
        'すべてのトークンは W3C Design Tokens Format（DTF）でも公開されています——各トークンは ',
        { code: '$value' },
        ' / ',
        { code: '$type' },
        ' グループエントリとして発行されるため、デザインツールのパイプラインは haze-ui の CSS 命名を知らなくても利用できます：',
      ],
      dtfNote:
        'この JSON はそのまま Style Dictionary や Tokens Studio に投入でき、Figma 変数と各プラットフォームのトークン出力をライブラリと同期させられます。',
    },
    tailwind: {
      title: 'Tailwind v4 との併用',
      intro: [
        'Haze UI のトークンは通常の CSS カスタムプロパティなので、Tailwind v4 は ',
        { code: '@theme' },
        ' 経由で利用できます。必要なトークンを Tailwind の色変数としてエイリアスし、対応するユーティリティを使います：',
      ],
      inlineNote: [
        'plain な ',
        { code: '@theme' },
        ' ではなく ',
        { code: '@theme inline' },
        ' を使ってください。plain ブロックは ',
        { code: ':root { --color-primary: var(--haze-color-primary) }' },
        ' を出力し、var() は ',
        { code: ':root' },
        ' で一度だけ解決されます——ところが Haze のトークンはテーマクラス（',
        { code: ':root' },
        ' の子孫）配下で定義されるため、すべてのエイリアスがそこでは空に潰れてしまいます。',
        { code: 'inline' },
        ' を使えば ',
        { code: 'bg-primary' },
        ' は ',
        { code: 'background-color: var(--haze-color-primary)' },
        ' にコンパイルされ、テーマクラスが有効などこでも正しく解決されます。',
      ],
      cascadePara: [
        { strong: 'カスケードと読み込み順。' },
        ' Haze UI の CSS はどのレイヤーにも入らず、Tailwind v4 はテーマ・preflight・ユーティリティを ',
        { code: '@layer' },
        ' に入れます。レイヤー外の作者スタイルは読み込み順や詳細度にかかわらずあらゆるレイヤーに勝つため、ユーティリティと Haze コンポーネントが同じプロパティを設定すると（例：Button の背景）コンポーネントが勝ちます。ユーティリティでコンポーネントを上書きしたい場合は、Tailwind v4 の末尾 ',
        { code: '!' },
        '（例：',
        { code: 'w-full!' },
        '）を付けてください。コンポーネントが設定しないプロパティでは、ユーティリティが通常どおり勝ちます。レイヤーのおかげで Haze CSS と Tailwind のどちらが先に読み込まれても問題ありません——アプリのルートでトークンを一度だけ読み込むようにだけしてください。',
      ],
      preflightPara: [
        { strong: 'Preflight。' },
        ' Tailwind のリセットは ',
        { code: '@layer base' },
        ' にあり、要素のデフォルト（ボーダー、マージン、ボタンの背景）にのみ触れます。Haze コンポーネントはレイヤー外のトークンルールで完全にスタイリングされるため、preflight 有効時もまったく同じように描画されます——デフォルト設定のままで構いません。',
      ],
    },
    controlled: {
      title: '制御コンポーネント',
      intro: [
        'フォームコンポーネントは ',
        { code: 'react-use-control' },
        ' 経由で制御・非制御の両モードをサポートします：',
      ],
      outro: [
        '単純な非制御用途ではプレーンな値をそのまま渡せます——',
        { code: 'value' },
        ' prop を省略すると、コンポーネントが自身の状態を管理します。',
      ],
    },
    ssr: {
      title: 'サーバーレンダリング（Next.js）',
      enforcedPara: [
        'すべての Haze UI コンポーネントはサーバーで描画され、ミスマッチなくハイドレートされます——ライブラリには ',
        { code: 'window' },
        ' ガードが一切ありません。これはリポジトリ内の 2 つのスイートで強制されています：',
        { code: 'src/lib/ssr-render.node.test.tsx' },
        '（window のない実際の node 環境で ',
        { code: 'renderToString' },
        ' を通す 23 ケース）と ',
        { code: 'src/lib/ssr-hydration.test.tsx' },
        '（',
        { code: 'hydrateRoot' },
        ' を通り、ハイドレーション警告が静かなままであることを検証する 22 ケース）——合計 45 ケース、免除リストは空です。実行可能な App Router プロジェクトは ',
        { code: 'examples/nextjs' },
        ' にあります。',
      ],
      boundaryPara: [
        'Haze UI は ',
        { code: "'use client'" },
        ' ディレクティブを同梱しません——クライアント境界はあなたが引くものです。コンポーネントは状態とエフェクトを保持するため、クライアントコンポーネントから import してください。それこそが SSR スイートが検証する経路です（先にサーバー描画、次にハイドレーション）。',
      ],
      loadPara: [
        'グローバル CSS のあるべき場所であるルートレイアウトでスタイルシートを一度だけ読み込み、テーマクラスを ',
        { code: '<body>' },
        ' に適用します：',
      ],
      note: [
        'Haze UI は ',
        { code: 'react >= 19' },
        ' を要求し（App Router では Next.js 15 以降）、ESM のみを配布します——',
        { code: "type: 'module'" },
        ' で、CommonJS バンドルはありません。Next.js と Vite はそのまま利用でき、CommonJS サーバーは ',
        { code: 'import()' },
        ' を使ってください。「すべてがサーバー HTML に含まれる」という原則への意図的な例外が 1 つあります：',
        { code: 'StreamingText' },
        ' はサーバーでは空のプレフィックスとカーソルのみを描画し、本文はクライアントでストリーミングされます。',
      ],
    },
    testing: {
      title: 'Jest / Vitest でテストする',
      jestLead: [
        'haze-ui は ESM-only（',
        { code: "type: 'module'" },
        '）で、スタイルは CSS サブパスから提供されます。Jest 利用者には 3 つの調整が必要です：',
        { code: 'jest-environment-jsdom' },
        ' による jsdom 環境（Jest 28 以降は同梱されません）、haze-ui と ESM-only のランタイム依存を Babel がトランスパイルできるようにする ',
        { code: 'transformIgnorePatterns' },
        '、そしてスタイルのインポートを空モジュールに解決させる ',
        { code: '\\.css$' },
        ' の ',
        { code: 'moduleNameMapper' },
        ' スタブ。Vite スキャフォールドは ',
        { code: '"type": "module"' },
        ' を持つため、以下の設定ファイルは ',
        { code: '.cjs' },
        ' 拡張子を使います：',
      ],
      allowNote: [
        '許可リストは検証済みの最小セットです：haze-ui 本体、',
        { code: 'react-use-control' },
        '、そして ',
        { code: '@tanstack' },
        ' スコープ（react-table は table-core と store を引き込み、いずれも ESM）。依存グラフの残り——react-f0rm、@dnd-kit、recharts、qrcode——は CommonJS で、変換なしで読み込まれます。正規表現は両方のレイアウトをカバーします：pnpm は ',
        { code: '.pnpm/<name>@<ver>/node_modules/<name>/' },
        ' にスコープのスラッシュを ',
        { code: '+' },
        ' にエンコードして格納し、npm と yarn は ',
        { code: 'node_modules/<name>/' },
        ' を使います。CSS マッパーを外すと ',
        { code: "import 'haze-ui/styles.css'" },
        ' は SyntaxError で失敗します——上のスタイルシートインポートはまさにそのスタブを検証しています。',
      ],
      vitestPara: [
        'Vitest にはこれらは不要です：ESM をネイティブに消費し、CSS 処理はデフォルトでオフ（',
        { code: 'css: false' },
        '）なので、プレーンなインポートはそのまま動きます。このドキュメントサイトは haze-ui コンポーネントをトランスフォーム設定ゼロの Vitest + jsdom でテストしています。',
      ],
    },
    typescript: {
      title: 'TypeScript',
      para: [
        'Haze UI は TypeScript で書かれ、型宣言を同梱します。すべてのコンポーネント props が型としてエクスポートされます：',
      ],
    },
    browser: {
      title: 'ブラウザサポート',
      para: [
        'Haze UI は CSS カスタムプロパティと ',
        { code: '<dialog>' },
        ' 要素をサポートするモダンブラウザを対象としています：',
      ],
    },
    cdn: {
      title: 'CDN から試す',
      para: [
        'ちょっとした実験ならインストール不要です：スタイルシートは unpkg、コンポーネントは esm.sh から読み込み、import map で React を 1 つに固定します：',
      ],
      note: [
        '実際のバージョンを固定してください——ここでは ',
        { code: '1.33.0' },
        '。最新は npm で確認します。',
        { code: '?external=react,react-dom' },
        ' フラグにより haze-ui は import map の 1 つの React を再利用します——React が 2 つあると hooks が壊れます。CDN モードはツールチェーンの保証と引き換えにゼロ設定を得るものです。アプリを本格的に構築する前に通常のインストールへ切り替えてください。',
      ],
    },
  },
  componentDetail: {
    notFoundTitle: 'コンポーネントが見つかりません：{name}',
    notFoundHintSuggestions: 'この URL にコンポーネントはありません。もしかして：',
    notFoundHintPlain: 'この URL にコンポーネントはありません。',
    backToAllComponents: 'すべてのコンポーネントに戻る',
    copyImport: 'import 文をコピー',
    copied: 'コピーしました',
  },
};
