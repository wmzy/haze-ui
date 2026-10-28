/**
 * Curated icon re-exports from [lucide-react](https://lucide.dev) — the
 * `haze-ui/icons` subpath.
 *
 * Curation strategy: the ~100 most common UI glyphs (navigation chevrons,
 * form feedback, media, communication, files, commerce), re-exported as
 * individual named exports in alphabetical order. The full lucide catalog
 * (1800+ icons) stays one `lucide-react` import away — import it directly
 * when a rare glyph is needed; this barrel only fixes the common vocabulary
 * and keeps the default choice obvious.
 *
 * Tree-shaking: `lucide-react` is a regular dependency with
 * `sideEffects: false`, and the lib build emits `preserveModules` output
 * with `lucide-react` external — an icon that is never imported costs zero
 * bytes (and consumers who import none of haze-ui's icons never pull the
 * package into their graph at all; it tree-shakes away entirely).
 *
 * Pairing with the `Icon` component:
 *
 * ```tsx
 * import { Icon } from 'haze-ui';
 * import { Check } from 'haze-ui/icons';
 *
 * <Icon icon={Check} />            // 20px (md) by default
 * <Icon icon={Check} size='sm' />  // 16px — see hazeIconSize below
 * ```
 */

export { ArrowDown } from 'lucide-react';
export { ArrowLeft } from 'lucide-react';
export { ArrowRight } from 'lucide-react';
export { ArrowUp } from 'lucide-react';
export { ArrowUpDown } from 'lucide-react';
export { ArrowUpRight } from 'lucide-react';
export { Asterisk } from 'lucide-react';
export { AtSign } from 'lucide-react';
export { Bell } from 'lucide-react';
export { BellOff } from 'lucide-react';
export { Bold } from 'lucide-react';
export { BookOpen } from 'lucide-react';
export { Bookmark } from 'lucide-react';
export { Calendar } from 'lucide-react';
export { ChartColumn } from 'lucide-react';
export { ChartLine } from 'lucide-react';
export { ChartPie } from 'lucide-react';
export { Check } from 'lucide-react';
export { CheckCheck } from 'lucide-react';
export { ChevronDown } from 'lucide-react';
export { ChevronLeft } from 'lucide-react';
export { ChevronRight } from 'lucide-react';
export { ChevronUp } from 'lucide-react';
export { ChevronsUpDown } from 'lucide-react';
export { Circle } from 'lucide-react';
export { CircleQuestionMark } from 'lucide-react';
export { Clipboard } from 'lucide-react';
export { Clock } from 'lucide-react';
export { Cloud } from 'lucide-react';
export { CloudOff } from 'lucide-react';
export { Code } from 'lucide-react';
export { Command } from 'lucide-react';
export { Copy } from 'lucide-react';
export { Download } from 'lucide-react';
export { Ellipsis } from 'lucide-react';
export { EllipsisVertical } from 'lucide-react';
export { ExternalLink } from 'lucide-react';
export { Eye } from 'lucide-react';
export { EyeOff } from 'lucide-react';
export { File } from 'lucide-react';
export { FileText } from 'lucide-react';
export { Flag } from 'lucide-react';
export { Folder } from 'lucide-react';
export { FolderOpen } from 'lucide-react';
export { Funnel } from 'lucide-react';
export { Globe } from 'lucide-react';
export { Hash } from 'lucide-react';
export { Heart } from 'lucide-react';
export { House } from 'lucide-react';
export { Image } from 'lucide-react';
export { Inbox } from 'lucide-react';
export { Info } from 'lucide-react';
export { Italic } from 'lucide-react';
export { LayoutGrid } from 'lucide-react';
export { LayoutList } from 'lucide-react';
export { Link } from 'lucide-react';
export { List } from 'lucide-react';
export { Loader } from 'lucide-react';
export { LoaderCircle } from 'lucide-react';
export { Lock } from 'lucide-react';
export { LockOpen } from 'lucide-react';
export { LogOut } from 'lucide-react';
export { Mail } from 'lucide-react';
export { MapPin } from 'lucide-react';
export { Menu } from 'lucide-react';
export { MessageCircle } from 'lucide-react';
export { MessageSquare } from 'lucide-react';
export { Mic } from 'lucide-react';
export { Minus } from 'lucide-react';
export { Moon } from 'lucide-react';
export { Pencil } from 'lucide-react';
export { Phone } from 'lucide-react';
export { Play } from 'lucide-react';
export { Plus } from 'lucide-react';
export { QrCode } from 'lucide-react';
export { RefreshCw } from 'lucide-react';
export { RotateCw } from 'lucide-react';
export { Save } from 'lucide-react';
export { Search } from 'lucide-react';
export { Send } from 'lucide-react';
export { Settings } from 'lucide-react';
export { Shield } from 'lucide-react';
export { ShieldCheck } from 'lucide-react';
export { ShoppingCart } from 'lucide-react';
export { Sparkles } from 'lucide-react';
export { SquareCheck } from 'lucide-react';
export { Star } from 'lucide-react';
export { Sun } from 'lucide-react';
export { Tag } from 'lucide-react';
export { Trash } from 'lucide-react';
export { Underline } from 'lucide-react';
export { Upload } from 'lucide-react';
export { User } from 'lucide-react';
export { UserPlus } from 'lucide-react';
export { Users } from 'lucide-react';
export { Volume2 } from 'lucide-react';
export { VolumeX } from 'lucide-react';
export { X } from 'lucide-react';
export { Zap } from 'lucide-react';
export { ZoomIn } from 'lucide-react';
export { ZoomOut } from 'lucide-react';

/**
 * Pixel sizes the `Icon` component maps its `size` prop to (`sm`/`md`/`lg`
 * → 16/20/24) — kept in lockstep with `components/Icon/Icon.tsx`. Use it
 * when an icon lands outside `<Icon>` (e.g. a lucide glyph sized directly
 * next to haze-ui components) so both paths agree on the size scale.
 */
export const hazeIconSize = Object.freeze({ sm: 16, md: 20, lg: 24 } as const);
