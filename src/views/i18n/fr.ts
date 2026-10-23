/*
 * Dictionnaire français : couche de recouvrement DeepPartial au-dessus de
 * en.ts. Les clés manquantes retombent sur l'anglais au rendu (mergeStrings
 * dans ./index.tsx) ; ce fichier ne contient donc que des clés traduites —
 * toute nouvelle clé doit d'abord exister dans en.ts, la parité est vérifiée
 * par i18n.test.tsx.
 */

import type { DeepPartial, SiteStrings } from './en';

export const fr: DeepPartial<SiteStrings> = {
  chrome: {
    openNavigation: 'Ouvrir la navigation',
    light: 'Clair',
    dark: 'Sombre',
    auto: 'Automatique',
    language: 'Changer de langue',
    noCustomTheme: 'Aucun thème personnalisé',
    themeEditor: 'Éditeur de thème',
    viewSourceAt: 'Voir la source de {version} ({commit})',
    viewSource: 'Voir la source sur GitHub',
    starOnGitHub: 'Étoiler sur GitHub',
    search: 'Rechercher',
    searchComponents: 'Rechercher des composants',
    searchPlaceholder: 'Rechercher des composants…',
    clearSearch: 'Effacer la recherche',
    noComponentsMatch: 'Aucun composant ne correspond à « {query} »',
    noResultsMatch: 'Aucun résultat ne correspond à « {query} »',
    docs: 'Documentation',
  },
  nav: {
    home: 'Accueil',
    gettingStarted: 'Premiers pas',
    recipes: 'Recettes',
    blocks: 'Blocs',
    guides: 'Guides',
    tokens: 'Tokens',
    components: 'Composants',
    overview: 'Vue d’ensemble',
    aiShowcase: 'Vitrine IA',
    themeEditor: 'Éditeur de thème',
    changelog: 'Journal des modifications',
    help: 'Aide',
    about: 'À propos',
  },
  guides: {
    darkMode: 'Mode sombre',
    density: 'Densité (compact)',
    a11y: 'Accessibilité',
    a11yContracts: 'Contrats d’accessibilité',
    migration: 'Migrer depuis AntD / shadcn',
    streamingA11y: 'Accessibilité du streaming',
    motion: 'Préréglages d’animation',
    figmaTokens: 'Tokens dans Figma',
    serverActions: 'React 19 Actions',
  },
  guideSummaries: {
    darkMode:
      'Les classes de tokens clair/sombre, le hook useDarkMode et les thèmes de marque à l’exécution.',
    density: 'Basculer entre espacement compact et confortable via les tokens de densité.',
    a11y: 'Clavier, lecteur d’écran et pratiques WCAG intégrés dans chaque composant.',
    a11yContracts:
      'Contrats clavier et ARIA par composant, extraits des suites de tests.',
    migration: 'Recettes de portage d’AntD ou shadcn/ui vers haze-ui.',
    streamingA11y:
      'Sorties IA en streaming accessibles : live regions, annonces et mouvement réduit.',
    motion:
      'Préréglages d’animation entrée/sortie pilotés par data-state sur les tokens de mouvement.',
    figmaTokens:
      'Les exports de tokens W3C DTF vers Tokens Studio et Figma Variables — flux et limites.',
    serverActions:
      'Server actions sur FormData natif, useActionState et useOptimistic avec haze-ui.',
  },
  blocks: {
    title: 'Blocs',
    intro:
      'Des compositions de page entière construites uniquement avec les composants haze-ui. Chaque bloc se prévisualise en direct, se lit en source, ou s’ouvre dans StackBlitz comme projet Vite exécutable.',
    dashboard: {
      title: 'Tableau de bord analytique',
      description:
        'AppShell avec navigation Sidebar et Breadcrumb, une ligne de cartes Stat et un DataTable avec export en toolbar, densité et pagination.',
    },
    login: {
      title: 'Page de connexion',
      description:
        'Un panneau de marque à côté d’une Card centrée portant la boucle de formulaire complète — validation zod, erreurs rendues par champ.',
    },
    settings: {
      title: 'Paramètres de l’espace',
      description:
        'Des Tabs en variante card pour trois sections de réglages ; Switch, RadioGroup, Select et Combobox suivent tous le pattern d’état contrôlable.',
    },
    chat: {
      title: 'Espace de chat IA',
      description:
        'La famille de conversation IA sur un seul écran — un ChatContainer role="log", un tour scripté ThinkingIndicator → ToolCallCard → StreamingText, un ChatInput dont l’envoi devient arrêt, et un rail ConversationList.',
    },
    crud: {
      title: 'CRUD maître–détail',
      description:
        'Un Tree choisit l’équipe, une DataTable avec toolbar et densité liste les pipelines ; l’édition Dialog + FormItem zod, la suppression ConfirmDialog et le retour Toast bouclent la boucle.',
    },
    aiWorkbench: {
      title: 'Atelier de revue IA',
      description:
        'La coquille Workbench en bureau IA à deux colonnes — rail d’activité et sidebar ConversationList, au centre un tour de revue scripté ThinkingIndicator → ToolCallCard → StreamingText, à droite un panneau de citations Sources ancré, et PromptInput + ModelPicker en compositeur.',
    },
    dataTable: {
      title: 'Console de table de données',
      description:
        'La DataTable fondée sur TanStack en page fleet complète — colonnes triables et redimensionnables, ligne de filtre par colonne, pagination, visibilité des colonnes, densité, export CSV et sélection multiple à cases à cocher avec barre d’actions groupées.',
    },
    kanban: {
      title: 'Kanban de sprint',
      description:
        'Quatre colonnes de cartes d’issues avec badges de priorité, labels, avatars d’assignés et barres de progression. Les cartes bougent via le menu ⋯ — haze-ui n’offre que le tri mono-conteneur, pas le glisser entre colonnes ; le plateau est donc statique par design.',
    },
  },
  componentGroups: {
    General: 'Général',
    Layout: 'Disposition',
    Forms: 'Formulaires',
    Overlays: 'Superpositions',
    'Data Display': 'Affichage des données',
    Navigation: 'Navigation',
    Feedback: 'Feedback',
    'AI & Chat': 'IA et chat',
    Utilities: 'Utilitaires',
  },
  components: {
    // General
    Avatar:
      'Avatar utilisateur avec image, variantes de taille et contenu de repli quand l’image manque.',
    AvatarGroup:
      'Empile des avatars en rangées chevauchantes avec une puce de dépassement +N (max/total).',
    Badge: 'Petit libellé d’état en ligne avec options de variante et de couleur.',
    Button:
      'Bouton d’action avec options variant/size/square ; un <button> natif sous le capot.',
    ButtonGroup:
      'Barre de boutons liés : coins et coutures fusionnés, size/variant/disabled au niveau groupe, sous-composant séparateur.',
    CountUp:
      'Compteur numérique animé : rAF + interpolation ease-out vers la cible, avec bascule instantanée sous prefers-reduced-motion.',
    Countdown:
      'Compte à rebours : chaîne de minuteurs alignée sur les frontières de seconde, onFinish déclenché une seule fois, format adaptatif d/h:mm:ss.',
    Divider: 'Ligne de séparation de contenu, horizontale ou verticale.',
    Ellipsis:
      'Troncature de texte interactive : clamp à N lignes avec détection, info-bulle et déplier/replier optionnels.',
    Icon: 'Enveloppe d’icône SVG en ligne avec boîtes sm/md/lg dimensionnées par tokens.',
    Tag: 'Libellé d’état compact avec couleur de variante et bouton de fermeture optionnel.',
    TagGroup:
      'Conteneur flex-wrap disposant les enfants Tag avec un espacement constant ; sortable + onReorder pour le réordonnancement par glisser-déposer.',
    Typography:
      'Primitives de texte : Title, Text, Paragraph sur les tokens typographiques.',

    // Layout
    AspectRatio: 'Contraind les enfants à un rapport largeur/hauteur fixe.',
    AppShell:
      'Cadre d’application avec en-tête collant, barre latérale repliable, emplacements contenu et pied de page ; sous 768px la barre latérale devient une superposition.',
    Container: 'Conteneur de page centré à largeur maximale, avec padding horizontal.',
    Flex: 'Primitive de mise en page flexbox qui mappe les props vers le CSS flex.',
    Grid: 'Primitive de mise en page CSS Grid.',
    Masonry:
      'Disposition en pinboard : une distribution gloutonne en JS équilibre les enfants entre les colonnes (d’abord dans l’ordre, puis la colonne la plus courte).',
    Resizable:
      'Groupe de panneaux divisés avec séparateurs déplaçables (ResizableGroup, horizontal ou vertical) ; defaultSize/minSize/maxSize en px par panneau, panneaux repliables et onResizeCommit pour la persistance.',
    ScrollArea:
      'Zone défilante à curseurs superposés : sucre maxHeight ou composition Viewport/Scrollbar ; visibilité hover/always/scroll, viewport focalisable au clavier.',
    Sidebar:
      'Coque de barre latérale d’application avec état replié contrôlable (aside + tokens de largeur de rail).',
    Splitter:
      'Splitter : disposition multi-panneaux avec séparateurs déplaçables implicites (sémantique AntD Splitter) ; sizes en pourcentage de la zone des panneaux via une unique prop ControlOrValue number[], contraintes min/max par panneau, panneaux repliables en option (déclencheurs replier/déplier sur le séparateur restaurant la répartition initiale), flèches (pas de 5 %) et Home/End, onSizesChange en direct ; pour des panneaux en px, voir Resizable.',
    ActivityRail:
      'Rail d’icônes vertical façon VSCode (nav) : entrées de 44px avec icon/label/badge et indicateur actif, libellés en info-bulle, slot="end" pour épingler en bas. orientation="horizontal" le dispose en bandeau — Workbench le fait automatiquement quand le rail s’ancre dans la colonne latérale.',
    StatusBar:
      'Bandeau d’état façon VSCode (footer) : groupes left/right, StatusItems sélectionnables, les entrées priority survivent au point de rupture mobile.',
    TabBar:
      'Navigation basse mobile (la contrepartie viewport d’ActivityRail) : bandeau de 56px conscient des zones sûres, badge, sémantique onSelect/onReselect.',
    Workbench:
      'Cadre d’application façon IDE (100dvh) : emplacements activityBar/sidebar/auxiliaryBar/panel/statusBar/tabBar avec régions repliables redimensionnables en px et panneau inférieur maximisable ; le rail s’ancre à côté de la barre latérale ou dedans (haut/bas, style Cursor) ; sous 768px le cadre change de forme — le rail devient un bandeau horizontal pleine largeur au-dessus de l’éditeur et la barre latérale une couche plein écran distincte (fermée par défaut, ouverte depuis la tabBar).',

    // Forms
    Cascader:
      'Sélecteur à descente multi-niveaux validant un chemin de valeurs d’options ; onSearch filtre à distance tandis que loading affiche l’état en attente.',
    Checkbox: 'Case à cocher avec état checked contrôlable.',
    ColorPicker: 'Sélecteur de couleur avec valeur contrôlable et nuanciers prédéfinis.',
    Combobox:
      'Champ de complétion automatique avec liste d’options filtrable ; onSearch délègue le filtrage à l’hôte.',
    DateField:
      'Saisie de date segmentée (année/mois/jour) tapée directement — sans calendrier.',
    Datepicker:
      'Saisie de date avec calendrier popup (valeur YYYY-MM-DD) ; showTime ajoute un champ horaire.',
    DateTimePicker:
      'Sélecteur date+heure (Datepicker avec la ligne horaire toujours affichée) ; showSeconds en option ; la valeur se sérialise en YYYY-MM-DD HH:mm[:ss].',
    DateRangePicker:
      'Choisit une plage de dates début/fin, avec préréglages intégrés ou personnalisés (Aujourd’hui, 7 derniers jours, …).',
    Fieldset:
      'Groupement sémantique fieldset+legend pour les sections de formulaire ; disabled désactive tous les contrôles à l’intérieur.',
    FileInput: 'Élément déclencheur qui ouvre un champ de fichier natif masqué.',
    Form: 'Enveloppe de champ react-f0rm ajoutant label, erreur et câblage aria aux cœurs contrôlés.',
    ImageCrop:
      'Recadreur d’image interactif (compagnon d’Upload) : zone CropRect normalisée contrôlable, verrou de ratio, masque avatar circulaire et pilotage clavier complet (flèches pour déplacer, Maj+flèches pour redimensionner).',
    InlineEdit: 'Valeur textuelle à éditer sur place au clic.',
    Input: 'Champ texte avec ornements ; sucre au-dessus d’InputCore.',
    InputGroup: 'Cluster de champs : add-ons préfixe/suffixe (icône, texte, bouton) fusionnés avec Input/Select en un seul contrôle.',
    Meter: 'Jauge sémantique en lecture seule : track et bar changent de couleur au franchissement de chaque seuil.',
    CopyButton: 'Bouton de copie en un clic avec état « copié » ; inclut la puce Snippet.',
    Heatmap: 'Carte de chaleur d’activité style GitHub : cases teintées par valeur, palette suivant le thème.',
    TimeGrid: 'Grille de créneaux générée d’une fenêtre et d’un pas : les flèches naviguent et sélectionnent.',
    Mentions:
      'Saisie de mentions avec suggestions au caractère déclencheur choisies dans une liste d’options.',
    NumberInput: 'Saisie numérique avec min/max/step.',
    OTPInput: 'Saisie de mot de passe à usage unique en length cases segmentées.',
    PasswordInput: 'Champ texte avec bascule de visibilité.',
    MaskedInput:
      'Saisie texte masquée selon un motif (9 chiffre, a lettre, A majuscule, * alphanumérique, \\ échappement) ; unmask() extrait le contenu brut.',
    PhoneInput:
      'Saisie de téléphone internationale : sélecteur de pays et champ numéro joints, valeur E.164, validation libphonenumber-js.',
    Radio: 'Option radio et groupe avec sélection contrôlable.',
    Rating: 'Notation par étoiles avec prise en charge des demi-étoiles.',
    RichTextEditor: 'Éditeur de texte riche basé sur Tiptap, avec barre de formatage intégrée et valeur HTML contrôlable.',
    Segmented: 'Contrôle segmenté choisissant une option dans un ensemble compact.',
    Select:
      'Sélecteur déroulant sur SelectCore avec enfants <option> ; onSearch active le filtrage côté serveur.',
    Signature:
      'Paddock de signature sur canvas validant une data URL PNG à chaque trait, avec annulation, effacement et un avis de repli sans canvas.',
    Slider: 'Curseur de plage natif avec valeur contrôlable.',
    Switch: 'Interrupteur (role="switch") avec checked contrôlable.',
    TagInput:
      'Saisie de jetons validée par Entrée sur TagInputCore ; sortable active le tri par glisser (nouvel ordre via onChange).',
    Textarea: 'Saisie texte multiligne.',
    TimePicker: 'Saisie d’horaire avec valeur contrôlable.',
    TimeField:
      'Saisie d’horaire segmentée (heure/minute/seconde, format 12 heures AM/PM en option).',
    Toggle:
      'Bouton pressoir à deux états (aria-pressed) avec tailles et mode icône carrée ; la variante ToolbarToggle chevauche le roving focus de la barre d’outils.',
    Transfer:
      'Navette à deux colonnes déplaçant des options entre listes source et cible.',
    TreeSelect:
      'Sélection en arbre dans un panneau flottant : les lignes sélectionnables valident une clé, les cases à cocher en cascade valident string[] ; avec recherche de panneau, loadData paresseux et débordement en puces.',
    Upload:
      'Sélecteur de fichiers avec valeur File[] cumulative, accept/multiple, sélection de répertoire et rendu listType.',

    // Overlays
    BottomSheet: 'Feuillet façon mobile glissant depuis le bord inférieur de l’écran.',
    ConfirmDialog:
      'Dialogue de confirmation prêt à l’emploi avec actions confirmer/annuler et une variante danger.',
    ContextMenu: 'Menu flottant ouvert par clic droit.',
    Dialog: 'Dialogue modal avec piégeage du focus.',
    Drawer: 'Panneau coulissant ancré à un bord (placement gauche/droite).',
    DropdownMenu: 'Menu flottant déclenché au clic.',
    HoverCard:
      'Aperçu flottant non modal (carte d’avatar, résumé de lien) ancré à son déclencheur.',
    Menu: 'Menu à bascule léger avec déclencheur et panneau positionné statiquement (MenuItem, MenuDivider).',
    Popover: 'Popover flottant ancré à un élément déclencheur.',
    Tooltip: 'Bulle d’indice au survol/focus.',

    // Data Display
    Accordion: 'Liste de sections repliables (AccordionItem avec title).',
    Calendar: 'Surface de dates en grille mensuelle avec min/max, locale et weekStartsOn.',
    Card: 'Carte de contenu avec variantes elevated/outlined/filled.',
    Carousel: 'Diaporama avec index actif contrôlable et lecture automatique.',
    Chart:
      'Graphiques ligne/aire/barres/secteurs sur recharts, couleurs et axes sur les tokens haze ; les séries parcourent la palette sémantique, renderTooltip personnalise l’info-bulle.',
    Chip: 'Puce d’état arrondie avec icône et bouton de fermeture optionnels.',
    CodeBlock:
      'Conteneur de code monospace avec badge de langue ; highlight y branche un surligneur de syntaxe asynchrone.',
    DataTable:
      'Tableau riche sur @tanstack/react-table (tri, sélection de lignes, pagination client ou manuelle) ; dataTableToCsv exporte les lignes.',
    Descriptions:
      'Groupes de descriptions en liste de définitions (dl/dt/dd sur CSS Grid) : paires items, columns, bordered, size.',
    Image: 'Image avec repli et contrôle aspectRatio/objectFit.',
    Indicator:
      'Badge d’angle attaché à un élément hôte : point ou libellé de comptage, ton + position d’angle, showZero.',
    JsonView:
      'Arborescence JSON repliable avec couleurs de feuilles par type, expansion par défaut selon la profondeur, indices de troncature et bouton de copie optionnel.',
    Kbd: 'Style de touche clavier pour les raccourcis.',
    List: 'Variantes de listes ul/ol/plain stylées.',
    Mark: 'Surlignage au niveau texte (élément mark sémantique) en tons de statut.',
    Highlight:
      'Surlignage de résultats de recherche sur une chaîne ; plusieurs aiguilles, échappé (sans innerHTML).',
    NumberFormatter:
      'Formatage numérique de présentation sur Intl : locale, formatOptions (devise/unité/pourcent), prefix/suffix.',
    Progress: 'Barre ou anneau de progression pilotés par une valeur en pourcentage.',
    QRCode:
      'Code QR rendu en un seul chemin SVG net avec options value/size/level/bordered et couleurs de modules/fond issues des tokens de thème.',
    Schedule: 'Surface de planification avec vues jour/semaine/mois, replanification au glisser et au clavier, grille mensuelle avec puces de débordement.',
    Stat: 'Affichage de métrique avec titre, valeur et indicateur de tendance.',
    Sparkline:
      'Mini-graphique de tendance SVG en ligne : sans état, sans recharts, compatible RSC ; variantes ligne ou aire sur les tons sémantiques.',
    Table: 'Table sémantique stylée (striped, bordered).',
    Timeline: 'Conteneur de chronologie verticale pour les enfants TimelineItem.',
    Tree: 'Arbre hiérarchique avec états déplié/sélectionné/coché, loadData asynchrone et filtrage searchValue.',
    VirtualList:
      'Liste fenêtrée ne rendant que les lignes visibles ; hauteurs fixes ou dynamiques mesurées.',
    Watermark:
      'Couche de filigrane en canvas en mosaïque sur les enfants (ou plein écran) ; couleur accordée au thème, dégradation propre sans canvas 2d.',

    // Navigation
    Affix:
      'Fixe les enfants à un bord du viewport dès qu’on dépasse un décalage de défilement.',
    Anchor:
      'Navigation scroll-spy collante : la liste items surligne la section active (IntersectionObserver, activeId contrôlable), le clic défile avec offsetTop.',
    BackToTop:
      'Bouton flottant de retour en haut apparaissant au-delà d’un seuil de défilement.',
    Breadcrumb: 'Fil d’Ariane avec séparateur configurable.',
    Command:
      'Surface de palette de commandes : CommandInput plus CommandItems filtrables.',
    FloatButton:
      'Bouton d’action flottant au-dessus de la page ; FloatButtonGroup empile des actions derrière un déclencheur d’expansion, avec glyphes retour-en-haut et aide intégrés.',
    NavigationBar: 'Barre de navigation supérieure avec emplacements brand et end.',
    NavigationMenu: 'Méga-menu au survol : les déclencheurs ouvrent de grands panneaux avec délai d’intention et grâce du pointeur ; activeValue contrôlable.',
    Pagination: 'Navigation par pages avec page contrôlable et fenêtres de points de suspension.',
    Stepper: 'Indicateur d’étapes piloté par activeStep (enfants Step).',
    Tabs: 'Bascule de panneaux à onglets avec onglet actif contrôlable.',
    Toolbar:
      'Groupe de boutons avec a11y de barre d’outils (roving tabindex ; ToolbarButton, ToolbarSeparator).',
    Tour: 'Visite guidée mettant en lumière des étapes derrière un masque, current contrôlable.',

    // Feedback
    Alert: 'Encadré de message d’état en ligne.',
    AsyncSection:
      'États déclaratifs loading / error / contenu pour les données asynchrones.',
    Banner: 'Bandeau supérieur déplaçable avec variantes info/success/warning/danger.',
    Empty: 'Placeholder d’état vide avec image et description.',
    ErrorBoundary:
      'Frontière d’erreur de rendu : intercepte les exceptions du sous-arbre, fallback (nœud ou render prop) avec rappel de réinitialisation ; resetKeys réinitialise sur changement superficiel.',
    Result:
      'Page de retour de résultat : illustration d’état (success/error/info/warning/403/404/500), title, subTitle et zone d’action extra ; icon remplace l’illustration par défaut.',
    Skeleton: 'Placeholder de chargement scintillant (text/circular/rectangular).',
    Spinner: 'Indicateur de chargement rotatif.',
    LoadingOverlay:
      'État de chargement au niveau conteneur : assombrit le contenu, centre un spinner (ou loader personnalisé), aria-busy reflète la phase.',
    Spoiler:
      'Porte sur contenu long (afficher plus/moins) : aperçu à hauteur plafonnée au bord dégradé, expanded contrôlable.',
    VisuallyHidden:
      'Primitive de contenu réservée aux lecteurs d’écran : rognée du rendu visuel, conservée dans l’arbre a11y.',
    Toast:
      'Notifications toast via useToast + ToastContainer (aideur impératif toast() inclus).',

    // AI & Chat
    ApprovalCard:
      'Porte d’approbation avec actions approuver / refuser pour les opérations initiées par l’agent.',
    ChatContainer:
      'Conteneur de défilement de transcription avec défilement automatique collé en bas.',
    ChatInput: 'Composeur de messages avec valeur contrôlable et rappel onSend.',
    ChatMessage:
      'Bulle de chat à disposition selon le rôle (user / assistant / system), avatar, nom, horodatage et statut de remise.',
    ConversationList:
      'Liste sélectionnable de conversations pour une barre latérale d’historique de chat.',
    DiffViewer:
      'Rend le diff ligne à ligne entre ancien et nouveau contenu pour les éditions proposées par l’agent.',
    FilePreview:
      'Carte de pièce jointe avec vignette d’image ou badge d’extension, progression d’envoi et actions retirer/réessayer.',
    InlineCitation: 'Marqueur de citation en exposant ; au clic, ouvre une carte source flottante avec titre, extrait et lien sortant optionnel.',
    InlineCompletion:
      'Suggestion en texte fantôme pour input/textarea ; Tab accepte la suggestion, Escape la rejette.',
    LogViewer: 'Flux de journaux défilant avec filtrage par niveau de sévérité.',
    MarkdownRenderer:
      'Rend du contenu Markdown (blocs de code inclus) pour les réponses de l’assistant.',
    ModelPicker: 'Liste déroulante contrôlable pour choisir le modèle actif.',
    Plan: 'Plan et progression de l’agent : liste d’étapes titrée dont les statuts alimentent automatiquement barre de progression et résumé.',
    PromptInput:
      'Composeur de prompt IA : zone de texte auto-extensible avec tags de contexte en ligne, suggestions au déclencheur @ et touche d’envoi configurable.',
    Queue: 'File d’attente d’actions ou de messages de l’agent, avec statuts queued/sending/failed et suppression par élément.',
    Sources:
      'Liste de citations numérotées pour les réponses RAG ; les extraits se révèlent au survol/focus avec un ensemble expanded contrôlable, compact rend des badges [1] [2] en ligne.',
    StepTimeline: 'Chronologie verticale des étapes de l’agent : statut par étape (dont running), durée, détails repliables et sous-étapes imbriquées.',
    StreamingText:
      'Effet machine à écrire dévoilant le texte en streaming caractère par caractère, curseur optionnel.',
    ThinkingIndicator:
      'Indicateur animé de points rebondissants signalant que l’agent traite.',
    TokenCounter:
      'Compteur d’usage des tokens de la fenêtre de contexte avec progression budgétaire.',
    ToolCallCard:
      'Carte présentant un appel d’outil de l’agent — nom, entrée, sortie et état d’exécution.',

    // Utilities
    Collapsible: 'Conteneur ouvrir/fermer sans style avec état open contrôlable.',
    Disclosure: 'Panneau dépliable à en-tête résumé (sémantique details/summary).',
    Fullscreen:
      'Liaison à l’API Fullscreen en mode enveloppe autour d’un seul enfant déclencheur avec état plein écran contrôlable ; le hook useFullscreen() est aussi exporté.',
    LocaleProvider:
      'Fournit des packs de chaînes UI (anglais, zh-CN et ja-JP intégrés) aux composants sensibles à la locale ; direction (explicite ou dérivée de la locale) alimente useDirection() ; createStrings(base, overrides) dérive des packs sans dupliquer la table.',
    ConfigProvider:
      'Surcharges de props par défaut (taille de Button, duration/placement de Toast, délai de Tooltip, délais d’ouverture/fermeture de HoverCard) lues via useConfigDefaults() ; les props explicites gagnent toujours, les providers s’imbriquent avec une fusion superficielle par section.',
    SwipeAction:
      'Actions de ligne révélées par balayage aux bords gauche/droit, avec seuil de validation.',
  },
  home: {
    hero: {
      title: 'Construisez plus vite avec Haze UI',
      subtitle:
        'Une bibliothèque de composants React légère et accessible : CSS-in-JS sans exécution, design tokens et {count} composants prêts pour la production.',
      getStarted: 'Commencer',
      components: 'Composants',
      copyAria: 'Copier la commande d’installation',
      copied: 'Copié',
      copy: 'Copier',
    },
    stats: {
      components: 'Composants',
      cssLabelFull: 'Bundle CSS complet · {raw} brut',
      cssLabelFallback: 'CSS — lancez pnpm build',
      runtimeJs: 'JS d’exécution pour les styles',
      builtInThemes: 'Thèmes intégrés',
    },
    wall: {
      title: 'De vrais composants, pas des captures',
      subtitle:
        'Chaque contrôle ci-dessous est vivant — cliquez, faites glisser et saisissez pour parcourir la vraie bibliothèque.',
    },
    features: {
      title: 'Pourquoi Haze UI ?',
      subtitle:
        'Tout ce qu’il faut pour construire des interfaces React modernes, rien de plus.',
      zeroRuntime: {
        title: 'Zéro coût à l’exécution',
        desc: 'Les styles sont extraits au build via Linaria. Aucun coût de CSS-in-JS à l’exécution.',
      },
      designTokens: {
        title: 'Design tokens',
        desc: 'Thématisation cohérente par custom properties CSS. Thèmes clair et sombre intégrés.',
      },
      components: {
        title: '{count}+ composants',
        desc: 'Des boutons aux sélecteurs de date, tous suivant les standards Open UI par cohérence.',
      },
      accessible: {
        title: 'Accessible',
        desc: 'Bâti sur des éléments HTML natifs comme <dialog> et <details> pour une a11y intégrée.',
      },
      nativeOverlays: {
        title: 'Overlays popover natifs',
        desc: 'Les couches flottantes s’appuient sur l’API popover native et le CSS anchor positioning — positionnées par le moteur, zéro calcul JS.',
      },
      screenReaderCi: {
        title: 'Gate CI VoiceOver',
        desc: 'La sortie réelle de VoiceOver est vérifiée sur la CI macOS — une véritable porte screen-reader au-delà d’axe et de l’e2e.',
      },
      aiDocs: {
        title: 'Docs prêtes pour l’IA',
        desc: 'Serveur MCP intégré (npx haze-ui-mcp) et llms.txt — les agents lisent la même doc que vous.',
      },
      treeShakeable: {
        title: 'Élagable (tree-shakeable)',
        desc: 'Sortie en modules ES avec preserveModules. N’importez que ce que vous utilisez.',
      },
      controlled: {
        title: 'Contrôlé et non contrôlé',
        desc: 'Les composants de formulaire prennent en charge les deux modes via react-use-control.',
      },
      typescript: {
        title: 'TypeScript d’abord',
        desc: 'Écrit en TypeScript, avec les types de props exportés pour chaque composant.',
      },
      lightweight: {
        title: 'Léger',
        descFull:
          'Le bundle CSS complet fait {raw} ({gzip} gzip). Les imports par composant livrent encore moins.',
        descFallback:
          'Empreinte CSS minuscule, aucune dépendance lourde. Conçu pour la performance.',
      },
      customizable: {
        title: 'Personnalisable',
        desc: 'Surchargez n’importe quel design token avec des variables CSS. className passe-partout sur tous les composants.',
      },
    },
    compare: {
      title: 'En comparaison',
      subtitle:
        'Styles sans exécution, contrôle d’état par une seule prop et composants IA intégrés.',
      dimension: 'Dimension',
      rows: {
        stylingRuntime: 'Exécution des styles',
        stateApi: 'API d’état',
        formBinding: 'Liaison de formulaire',
        aiComponents: 'Composants IA',
        perComponentCss: 'CSS par composant',
        shippedCss: 'CSS livré',
      },
      shippedFull: '~{gzip} gzip',
      shippedFallback: 'CSS par composant',
    },
    size: {
      title: 'Taille du bundle',
      subtitle:
        'CSS par famille, mesuré sur le build local de la bibliothèque. Chargez tokens.css une seule fois, puis seulement les composants que vous rendez.',
      summary:
        '{families} familles CSS · bundle complet (haze-ui.css) : {raw} / {gzip} gzip',
      sortAriaDesc:
        'Trier les familles par taille gzip, actuellement décroissant',
      sortAriaAsc: 'Trier les familles par taille gzip, actuellement croissant',
      sortLabel: 'Trier par gzip',
      family: 'Famille',
      css: 'CSS',
      cssGzip: 'CSS (gzip)',
      note: 'Mesuré le {date} par scripts/generate-size-report.mjs (gzip niveau 9) · relancez pnpm build pour régénérer.',
      hint: 'Aucun artefact de build local trouvé — lancez pnpm build pour régénérer ce rapport.',
    },
    code: {
      title: 'Simple par conception',
      subtitle: 'Des API propres qui ne vous gênent pas. Voici à quoi ça ressemble :',
      quickSetup: 'Mise en route rapide',
      description:
        'Importez la feuille de style (bundle complet ou CSS par composant), appliquez une classe de thème et utilisez les composants. Pas de providers, pas d’enveloppes de context, pas de fichiers de configuration.',
    },
    footer: {
      license: 'Licence MIT',
      builtWith: 'Construit avec React 19',
    },
  },
  gettingStarted: {
    title: 'Premiers pas',
    intro:
      'Lancez-vous avec Haze UI dans votre projet React en quelques minutes.',
    installation: {
      title: 'Installation',
      peers: [
        'Haze UI exige ',
        { code: 'react >= 19' },
        ' et ',
        { code: '@linaria/core >= 7' },
        ' en peer dependencies.',
      ],
      orOtherManagers: 'Ou avec d’autres gestionnaires de paquets :',
    },
    frameworks: {
      title: 'Intégration framework',
      switchLabel: 'Framework',
      intro: [
        'L’installation est la même partout — seul l’emplacement de l’import CSS diffère. Les noms de modes correspondent au quickstart du README : ',
        { strong: 'A' },
        ' est une feuille de style complète unique, ',
        { strong: 'B' },
        ' est le CSS par composant.',
      ],
      vite: {
        lead: 'Créez une application Vite (React 19, TypeScript) et ajoutez la bibliothèque :',
        modeA: [
          { strong: 'Mode A — une feuille de style complète (le plus simple).' },
          ' Un seul import dans le module d’entrée couvre toutes les composantes :',
        ],
        modeB: [
          { strong: 'Mode B — CSS par composante.' },
          ' Le plugin Vite officiel lit chaque instruction ',
          { code: "import { … } from 'haze-ui'" },
          ' et injecte les fichiers ',
          { code: 'css/*.css' },
          ' correspondants (tokens inclus ; le graphe de modules déduplique) :',
        ],
        pluginNote: [
          { code: 'vite-plugin-haze-ui' },
          ' est sur npm — installez-le avec ',
          { code: 'npm i -D vite-plugin-haze-ui' },
          '. Vous préférez choisir les fichiers vous-même ? Importez ',
          { code: 'haze-ui/css/tokens.css' },
          ' plus les fichiers de familles utilisés et passez du plugin — la forme manuelle est dans la section « Configuration » ci-dessus.',
        ],
      },
      next: {
        lead: 'Créez un projet App Router (Next.js 15+ fournit React 19) et ajoutez la bibliothèque :',
        modeA: [
          { strong: 'Mode A — une feuille de style complète (le plus simple).' },
          ' Le CSS global va dans le layout racine :',
        ],
        modeB: [
          { strong: 'Mode B — CSS par composante.' },
          ' Sans plugin — listez ',
          { code: 'haze-ui/css/tokens.css' },
          ' plus les fichiers de familles réellement rendus, toujours dans le layout racine :',
        ],
        note: [
          'Appliquez les classes de thème à ',
          { code: '<body>' },
          ' comme montré dans la section « rendu serveur » ci-dessous — chaque route en hérite.',
        ],
      },
    },
    setup: {
      title: 'Configuration',
      steps: [
        {
          lead: [
            { strong: 'Importez la feuille de style' },
            ' — chargez le bundle complet, ou les tokens plus uniquement les composants utilisés.',
          ],
        },
        {
          lead: [
            { strong: 'Appliquez le thème' },
            ' — Enveloppez votre app (ou un sous-arbre) avec la classe de thème pour activer les design tokens.',
          ],
        },
        {
          lead: [
            { strong: 'Utilisez les composants' },
            ' — Importez et utilisez n’importe quel composant directement.',
          ],
        },
      ],
    },
    theming: {
      title: 'Thématisation',
      tokensPara:
        'Haze UI utilise des custom properties CSS (design tokens) pour toutes les valeurs visuelles. Deux thèmes intégrés sont disponibles :',
      overridePara:
        'Vous pouvez surcharger n’importe quel token en définissant la variable CSS sur un élément parent :',
      prefixNote: [
        'Tous les tokens sont préfixés par ',
        { code: '--haze-' },
        ' pour éviter les conflits avec d’autres bibliothèques. La liste complète des tokens est dans le code source.',
      ],
      dtfPara: [
        'Tous les tokens sont aussi publiés au W3C Design Tokens Format (DTF) — chaque token devient une entrée de groupe ',
        { code: '$value' },
        ' / ',
        { code: '$type' },
        ' — si bien que les chaînes d’outils de design peuvent les consommer sans connaître le nommage CSS de haze-ui :',
      ],
      dtfNote:
        'Ce JSON se dépose tel quel dans Style Dictionary ou Tokens Studio pour garder les variables Figma et les sorties de tokens des plateformes synchronisées avec la bibliothèque.',
    },
    tailwind: {
      title: 'Utilisation avec Tailwind v4',
      intro: [
        'Les tokens de Haze UI sont des custom properties CSS ordinaires, donc Tailwind v4 peut les consommer via ',
        { code: '@theme' },
        '. Aliassez les tokens voulus comme variables de couleur Tailwind, puis utilisez les utilitaires correspondants :',
      ],
      inlineNote: [
        'Utilisez ',
        { code: '@theme inline' },
        ', pas le ',
        { code: '@theme' },
        ' simple. Un bloc simple émet ',
        { code: ':root { --color-primary: var(--haze-color-primary) }' },
        ' et le var() est résolu une seule fois à ',
        { code: ':root' },
        ' — or les tokens Haze sont définis sous la classe de thème, descendante de ',
        { code: ':root' },
        ', donc chaque alias s’y réduit à rien. Avec ',
        { code: 'inline' },
        ', ',
        { code: 'bg-primary' },
        ' se compile en ',
        { code: 'background-color: var(--haze-color-primary)' },
        ' et se résout partout où la classe de thème est active.',
      ],
      cascadePara: [
        { strong: 'Cascade et ordre de chargement.' },
        ' Le CSS de Haze UI arrive sans couche, tandis que Tailwind v4 place thème, preflight et utilitaires dans ',
        { code: '@layer' },
        '. Les styles d’auteur hors couche battent n’importe quelle couche quel que soit l’ordre d’import ou la spécificité : quand un utilitaire et un composant Haze définissent la même propriété (disons le fond d’un Button), le composant gagne. Ajoutez le ',
        { code: '!' },
        ' final de Tailwind v4 (ex. ',
        { code: 'w-full!' },
        ') quand un utilitaire doit passer devant un composant. Sur les propriétés que les composants ne définissent pas, les utilitaires gagnent normalement. Grâce aux couches, peu importe que le CSS Haze ou Tailwind se charge en premier — assurez seulement que les tokens sont chargés une fois à la racine de votre app.',
      ],
      preflightPara: [
        { strong: 'Preflight.' },
        ' Le reset de Tailwind vit dans ',
        { code: '@layer base' },
        ' et ne touche que les valeurs par défaut des éléments (bordures, marges, fonds de boutons). Les composants Haze se stylent intégralement par des règles de tokens hors couche, donc ils se rendent à l’identique avec preflight activé — gardez la configuration par défaut.',
      ],
    },
    controlled: {
      title: 'Composants contrôlés',
      intro: [
        'Les composants de formulaire prennent en charge les modes contrôlé et non contrôlé via ',
        { code: 'react-use-control' },
        ' :',
      ],
      outro: [
        'Vous pouvez aussi passer des valeurs simples pour un usage non contrôlé — omettez la prop ',
        { code: 'value' },
        ' et le composant gère son propre état.',
      ],
    },
    ssr: {
      title: 'Rendu serveur (Next.js)',
      enforcedPara: [
        'Chaque composant Haze UI se rend côté serveur et s’hydrate sans discordance — la bibliothèque ne contient aucune garde ',
        { code: 'window' },
        '. C’est imposé dans le dépôt par deux suites : ',
        { code: 'src/lib/ssr-render.node.test.tsx' },
        ' (23 cas à travers ',
        { code: 'renderToString' },
        ' dans un vrai environnement node sans window) et ',
        { code: 'src/lib/ssr-hydration.test.tsx' },
        ' (22 cas à travers ',
        { code: 'hydrateRoot' },
        ', garantissant que les avertissements d’hydratation restent silencieux) — 45 cas au total, liste d’exemption vide. Un projet App Router exécutable vit dans ',
        { code: 'examples/nextjs' },
        '.',
      ],
      boundaryPara: [
        'Haze UI n’embarque aucune directive ',
        { code: "'use client'" },
        ' — la frontière client vous appartient. Les composants possèdent état et effets : importez-les depuis un composant client ; c’est exactement le chemin qu’exercent les suites SSR (rendu serveur d’abord, hydratation ensuite).',
      ],
      loadPara: [
        'Chargez la feuille de style une seule fois dans le layout racine, là où réside le CSS global, et appliquez les classes de thème à ',
        { code: '<body>' },
        ' :',
      ],
      note: [
        'Haze UI exige ',
        { code: 'react >= 19' },
        ' (Next.js 15 ou plus récent en App Router) et ne livre que de l’ESM — ',
        { code: "type: 'module'" },
        ', pas de bundle CommonJS. Next.js et Vite le consomment tel quel ; les serveurs CommonJS utiliseront ',
        { code: 'import()' },
        '. Une exception délibérée au principe « tout arrive dans le HTML serveur » : ',
        { code: 'StreamingText' },
        ' rend volontairement un préfixe vide plus le curseur côté serveur et streame le texte côté client.',
      ],
    },
    testing: {
      title: 'Tester avec Jest / Vitest',
      jestLead: [
        'haze-ui est ESM-only (',
        { code: "type: 'module'" },
        ') et sert ses styles depuis des sous-chemins CSS : un consommateur Jest a besoin de trois ajustements — un environnement jsdom via ',
        { code: 'jest-environment-jsdom' },
        ' (détaché depuis Jest 28), des ',
        { code: 'transformIgnorePatterns' },
        ' qui laissent Babel transpiler haze-ui et ses dépendances runtime ESM-only, et un stub ',
        { code: '\\.css$' },
        ' en ',
        { code: 'moduleNameMapper' },
        ' pour que les imports de styles résolvent vers un module vide. Les scaffolds Vite embarquant ',
        { code: '"type": "module"' },
        ', les fichiers de configuration ci-dessous utilisent l’extension ',
        { code: '.cjs' },
        ' :',
      ],
      allowNote: [
        'La liste blanche est le minimum vérifié : haze-ui lui-même, ',
        { code: 'react-use-control' },
        ', et le scope ',
        { code: '@tanstack' },
        ' (react-table tire table-core et store, tous ESM). Tout le reste du graphe — react-f0rm, @dnd-kit, recharts, qrcode — est en CommonJS et se charge sans transformation. La regex couvre les deux layouts : pnpm stocke à ',
        { code: '.pnpm/<name>@<ver>/node_modules/<name>/' },
        ' avec les slashes de scope encodés ',
        { code: '+' },
        ', tandis que npm et yarn utilisent ',
        { code: 'node_modules/<name>/' },
        '. Retirez le mapper CSS et ',
        { code: "import 'haze-ui/styles.css'" },
        ' échoue avec une SyntaxError — l’import de stylesheet ci-dessus exerce exactement ce stub.',
      ],
      vitestPara: [
        'Vitest n’a besoin de rien de tout cela : il consomme l’ESM nativement et laisse le traitement CSS désactivé par défaut (',
        { code: 'css: false' },
        '), donc les imports simples fonctionnent. Ce site de documentation teste les composants haze-ui sous Vitest + jsdom sans aucune configuration de transform.',
      ],
    },
    typescript: {
      title: 'TypeScript',
      para: [
        'Haze UI est écrit en TypeScript et livre ses déclarations de types prêtes à l’emploi. Toutes les props des composants sont exportées comme types :',
      ],
    },
    browser: {
      title: 'Prise en charge des navigateurs',
      para: [
        'Haze UI vise les navigateurs modernes qui prennent en charge les custom properties CSS et l’élément ',
        { code: '<dialog>' },
        ' :',
      ],
    },
    cdn: {
      title: 'Essayer via un CDN',
      para: [
        'Aucune installation nécessaire pour une expérience rapide : la feuille de style depuis unpkg, les composantes depuis esm.sh, et une seule copie de React fixée par l’import map :',
      ],
      note: [
        'Épinglez une version réelle — ici ',
        { code: '1.33.0' },
        ' ; la dernière est sur npm. Le paramètre ',
        { code: '?external=react,react-dom' },
        ' garde haze-ui sur l’unique copie de React de l’import map — deux instances de React cassent les hooks. Le mode CDN échange la justesse de l’outillage contre zéro configuration ; passez à une vraie installation avant de construire une application.',
      ],
    },
  },
  componentDetail: {
    notFoundTitle: 'Composant introuvable : {name}',
    notFoundHintSuggestions: 'Aucun composant ne vit à cette URL. Vouliez-vous dire :',
    notFoundHintPlain: 'Aucun composant ne vit à cette URL.',
    backToAllComponents: 'Retour à tous les composants',
    copyImport: 'Copier l’import',
    copied: 'Copié',
  },
};
