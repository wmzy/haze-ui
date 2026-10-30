import type { AnyExtension, Editor } from '@tiptap/core';
import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';
import type { ControlOrValue } from 'react-use-control';
import type { HazeStrings } from '../LocaleProvider';

import { css } from '@linaria/core';
import Placeholder from '@tiptap/extension-placeholder';
import { EditorContent, useEditor, useEditorState } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Fragment, useEffect, useImperativeHandle, useRef } from 'react';
import { useControl } from 'react-use-control';

import { focusWithinRing } from '../../utils/field-skin';
import { NativeHiddenFields } from '../../utils/native-form';
import { proseContent } from '../../utils/prose-skin';
import { useStrings } from '../LocaleProvider';
import { Toolbar, ToolbarButton, ToolbarSeparator } from '../Toolbar';

/**
 * Imperative surface for power users — everything the editor can do is
 * reachable through the Tiptap instance (`chain()`, `can()`, schema,
 * storage, …). Null before the editor mounts (SSR-safe first paint,
 * `immediatelyRender: false`) and after unmount.
 */
type RichTextEditorHandle = {
  /** The live Tiptap `Editor` instance, or null when not mounted. */
  getEditor: () => Editor | null;
};

type RichTextEditorProps = {
  /**
   * HTML content (`editor.getHTML()` shape). Controlled and uncontrolled
   * modes share the one prop: external changes are pushed into the editor
   * only when they differ from the current document, so an equal value
   * never rebuilds the doc or drops the caret; internal edits publish back
   * through the control.
   */
  value?: ControlOrValue<string>;
  /** Hint shown while the document is empty (extension-placeholder). */
  placeholder?: string;
  /** Whether the document can be edited. Defaults to true. */
  editable?: ControlOrValue<boolean>;
  /**
   * Replaces the built-in formatting toolbar; `false` renders none.
   * Custom toolbars get the same chrome (padding + divider) and can grab
   * the editor through the `ref` handle or `useEditorState`.
   */
  toolbar?: ReactNode | false;
  /**
   * Extra Tiptap extensions appended after the default set
   * (starter-kit + link + placeholder) — tables, task lists, mentions…
   */
  extensions?: AnyExtension[];
  /**
   * Remount escape hatch: changing this destroys and recreates the
   * editor (fresh history, re-read `extensions`/`placeholder`/`value`).
   */
  editorKey?: string;
  /**
   * Form field name: bridges the HTML value into native form submits
   * (`new FormData(form)`, server actions) through a hidden input.
   */
  name?: string;
  /**
   * Imperative handle exposing the Tiptap instance (see
   * RichTextEditorHandle). `aria-label`/`aria-labelledby` props are
   * forwarded to the contenteditable textbox itself, not the root.
   */
  ref?: Ref<RichTextEditorHandle>;
} & Omit<
  ComponentPropsWithoutRef<'div'>,
  'value' | 'placeholder' | 'contentEditable' | 'suppressContentEditableWarning' | 'children'
>;

const root = css`
  display: flex;
  flex-direction: column;
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  overflow: hidden;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
  }

  /* Focus: the ProseMirror contenteditable carries the keyboard focus;
     the chrome wears the shared ring (utils/field-skin's focusWithinRing
     composed below — an outline on the content div itself would fight
     the caret). Forced-colors: CanvasText border stays visible, the
     box-shadow ring is dropped by the UA so focus moves to a Highlight
     outline; no box-shadow: none restatement — the UA drop makes it
     redundant, and re-declaring it would race the composed ring arm on
     injection order. */
  @media (forced-colors: active) {
    border-color: CanvasText;

    &:focus-within {
      outline: 2px solid Highlight;
    }
  }
`;

const toolbarArea = css`
  flex: none;
  flex-wrap: wrap;
  padding: var(--haze-space-1) var(--haze-space-2);
  border-block-end: 1px solid var(--haze-color-border);
  background: var(--haze-color-bg-muted);
`;

const contentArea = css`
  flex: 1;
  min-height: calc(var(--haze-space-16) * 2.5);
  padding: var(--haze-space-3) var(--haze-space-4);
  font-size: var(--haze-text-sm);
  line-height: var(--haze-leading-relaxed);
  overflow-y: auto;

  /* ── ProseMirror root ─────────────────────────────────────── */
  & .tiptap {
    outline: none;
    white-space: pre-wrap;
    word-break: break-word;

    &[contenteditable='false'] {
      cursor: default;
    }
  }

  /* Placeholder (extension-placeholder decoration: the class + the
     data attribute land on the first empty textblock). */
  & p.is-editor-empty:first-child::before {
    content: attr(data-placeholder);
    color: var(--haze-color-text-muted);
    float: left;
    height: 0;
    pointer-events: none;
  }
`;

type ToolbarItem = {
  key: string;
  label: string;
  glyph: string;
  pressed: boolean;
  disabled: boolean;
  run: () => void;
};

type ToolbarState = {
  bold: boolean;
  italic: boolean;
  strike: boolean;
  heading2: boolean;
  heading3: boolean;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
  codeBlock: boolean;
  link: boolean;
  canBold: boolean;
  canItalic: boolean;
  canStrike: boolean;
  canHeading2: boolean;
  canHeading3: boolean;
  canBulletList: boolean;
  canOrderedList: boolean;
  canBlockquote: boolean;
  canCodeBlock: boolean;
  canLink: boolean;
};

/**
 * The built-in toolbar's item groups (marks / headings / lists / blocks /
 * link), each pair separated by a ToolbarSeparator. Built from the live
 * editor + its selection state, so `pressed` reflects `isActive` and
 * `disabled` reflects `can()` (commands go inert inside code blocks etc.)
 * plus read-only mode.
 */
function buildToolbarItems(
  editor: Editor | null,
  state: ToolbarState | null,
  editable: boolean,
  strings: Readonly<HazeStrings['richTextEditor']>
): ToolbarItem[][] {
  const chain = () => editor?.chain().focus();
  const off = !editor || !state || !editable;
  return [
    [
      {
        key: 'bold',
        label: strings.bold,
        glyph: 'B',
        pressed: state?.bold ?? false,
        disabled: off || !state.canBold,
        run: () => chain()?.toggleBold().run(),
      },
      {
        key: 'italic',
        label: strings.italic,
        glyph: 'I',
        pressed: state?.italic ?? false,
        disabled: off || !state.canItalic,
        run: () => chain()?.toggleItalic().run(),
      },
      {
        key: 'strike',
        label: strings.strikethrough,
        glyph: 'S',
        pressed: state?.strike ?? false,
        disabled: off || !state.canStrike,
        run: () => chain()?.toggleStrike().run(),
      },
    ],
    [
      {
        key: 'heading-2',
        label: strings.heading2,
        glyph: 'H2',
        pressed: state?.heading2 ?? false,
        disabled: off || !state.canHeading2,
        run: () => chain()?.toggleHeading({ level: 2 }).run(),
      },
      {
        key: 'heading-3',
        label: strings.heading3,
        glyph: 'H3',
        pressed: state?.heading3 ?? false,
        disabled: off || !state.canHeading3,
        run: () => chain()?.toggleHeading({ level: 3 }).run(),
      },
    ],
    [
      {
        key: 'bullet-list',
        label: strings.bulletList,
        glyph: strings.bulletListGlyph,
        pressed: state?.bulletList ?? false,
        disabled: off || !state.canBulletList,
        run: () => chain()?.toggleBulletList().run(),
      },
      {
        key: 'ordered-list',
        label: strings.orderedList,
        glyph: strings.orderedListGlyph,
        pressed: state?.orderedList ?? false,
        disabled: off || !state.canOrderedList,
        run: () => chain()?.toggleOrderedList().run(),
      },
    ],
    [
      {
        key: 'blockquote',
        label: strings.blockquote,
        glyph: strings.blockquoteGlyph,
        pressed: state?.blockquote ?? false,
        disabled: off || !state.canBlockquote,
        run: () => chain()?.toggleBlockquote().run(),
      },
      {
        key: 'code-block',
        label: strings.codeBlock,
        glyph: strings.codeBlockGlyph,
        pressed: state?.codeBlock ?? false,
        disabled: off || !state.canCodeBlock,
        run: () => chain()?.toggleCodeBlock().run(),
      },
    ],
    [
      {
        key: 'link',
        label: strings.link,
        glyph: strings.linkGlyph,
        pressed: state?.link ?? false,
        disabled: off || !state.canLink,
        run: () => {
          const active = editor?.isActive('link');
          if (!editor) return;
          if (active) {
            editor.chain().focus().unsetLink().run();
            return;
          }
          // Prompt-free v1: reapply the current href when the selection
          // overlaps one, otherwise the neutral placeholder scheme.
          const attrs: Record<string, unknown> = editor.getAttributes('link');
          const current = attrs.href;
          const href = typeof current === 'string' && current ? current : 'https://';
          editor
            .chain()
            .focus()
            .extendMarkRange('link')
            .setLink({ href })
            .run();
        },
      },
    ],
  ];
}

export default function RichTextEditor({
  value: valueControl,
  placeholder,
  editable: editableControl,
  toolbar,
  extensions,
  editorKey,
  name,
  className,
  'aria-label': ariaLabel,
  'aria-labelledby': ariaLabelledBy,
  ref,
  ...rest
}: RichTextEditorProps) {
  const [value, setValue] = useControl(valueControl, '');
  const [editable] = useControl(editableControl, true);
  const strings = useStrings('richTextEditor');
  // Every HTML string handed to setValue but not yet consumed back by a
  // render. React flushes asynchronously, so during fast typing a commit
  // can carry a value the editor has already published PAST — comparing
  // that lagging echo against the live document would misread it as an
  // external change and rebuild the doc mid-word. An incoming value that
  // is still in this list is ours by construction; anything else that
  // differs from the document is external.
  const pendingPublishedRef = useRef<readonly string[]>([]);

  // Tiptap v3's starter-kit already bundles Link (and Underline), so the
  // link mark is configured through it — a second Link extension would
  // collide on the mark name. Placeholder rides along for the empty-doc
  // hint. `deps` pins recreation to editorKey; option identity (fresh
  // arrays each render) must not churn the instance.
  const editor = useEditor(
    {
      immediatelyRender: false,
      content: value,
      editable,
      extensions: [
        StarterKit.configure({
          link: {
            openOnClick: false,
            autolink: true,
          },
        }),
        Placeholder.configure({ placeholder: placeholder ?? '' }),
        ...(extensions ?? []),
      ],
      // The contenteditable is the real textbox; it carries the name.
      editorProps: {
        attributes: {
          'aria-label': ariaLabel ?? strings.label,
          ...(ariaLabelledBy ? { 'aria-labelledby': ariaLabelledBy } : {}),
        },
      },
      onUpdate: ({ editor }) => {
        const html = editor.getHTML();
        pendingPublishedRef.current = [...pendingPublishedRef.current, html];
        setValue(html);
      },
    },
    [editorKey]
  );

  // External value → editor. Our own echo (even a lagging one the
  // document has already moved past) is consumed without touching the
  // editor, so the caret survives every keystroke; genuinely new content
  // replaces the document without re-emitting an update.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    const pending = pendingPublishedRef.current;
    const echoIndex = pending.indexOf(value);
    if (echoIndex !== -1) {
      pendingPublishedRef.current = pending.slice(echoIndex + 1);
      return;
    }
    if (value === editor.getHTML()) return;
    pendingPublishedRef.current = [];
    if (value === '' && editor.isEmpty) return;
    editor.commands.setContent(value, { emitUpdate: false });
  }, [editor, value]);

  // Editability syncs without recreating the editor.
  useEffect(() => {
    if (!editor || editor.isDestroyed) return;
    editor.setEditable(editable);
  }, [editor, editable]);

  useImperativeHandle(
    ref,
    () => ({ getEditor: () => editor }),
    [editor]
  );

  // Toolbar state: `isActive` for the pressed look, `can()` (focus in a
  // can-chain is side-effect free — the command guards on dispatch) for
  // disabled. useEditorState re-renders on selectionUpdate/transaction.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: e }) => {
      if (!e) return null;
      return {
        bold: e.isActive('bold'),
        italic: e.isActive('italic'),
        strike: e.isActive('strike'),
        heading2: e.isActive('heading', { level: 2 }),
        heading3: e.isActive('heading', { level: 3 }),
        bulletList: e.isActive('bulletList'),
        orderedList: e.isActive('orderedList'),
        blockquote: e.isActive('blockquote'),
        codeBlock: e.isActive('codeBlock'),
        link: e.isActive('link'),
        canBold: e.can().chain().focus().toggleBold().run(),
        canItalic: e.can().chain().focus().toggleItalic().run(),
        canStrike: e.can().chain().focus().toggleStrike().run(),
        canHeading2: e.can().chain().focus().toggleHeading({ level: 2 }).run(),
        canHeading3: e.can().chain().focus().toggleHeading({ level: 3 }).run(),
        canBulletList: e.can().chain().focus().toggleBulletList().run(),
        canOrderedList: e.can().chain().focus().toggleOrderedList().run(),
        canBlockquote: e.can().chain().focus().toggleBlockquote().run(),
        canCodeBlock: e.can().chain().focus().toggleCodeBlock().run(),
        canLink: e
          .can()
          .chain()
          .focus()
          .extendMarkRange('link')
          .setLink({ href: 'https://' })
          .run(),
      } satisfies ToolbarState;
    },
  });

  const toolbarGroups = buildToolbarItems(editor, toolbarState, editable, strings);

  return (
    <div data-slot='rich-text-editor' x-class={[root, focusWithinRing, className]} {...rest}>
      {toolbar !== false &&
        (toolbar === undefined ? (
          <Toolbar
            aria-label={strings.toolbarLabel}
            data-slot='rich-text-toolbar'
            className={toolbarArea}
          >
            {toolbarGroups.map((group, groupIndex) => (
              <Fragment key={group[0]?.key ?? `group-${groupIndex}`}>
                {groupIndex > 0 && <ToolbarSeparator />}
                {group.map((item) => (
                  <ToolbarButton
                    key={item.key}
                    size='sm'
                    square
                    aria-label={item.label}
                    aria-pressed={item.pressed}
                    disabled={item.disabled}
                    data-slot='rich-text-toolbar-button'
                    onClick={item.run}
                  >
                    {item.glyph}
                  </ToolbarButton>
                ))}
              </Fragment>
            ))}
          </Toolbar>
        ) : (
          <div data-slot='rich-text-toolbar' x-class={[toolbarArea]}>
            {toolbar}
          </div>
        ))}
      <EditorContent
        editor={editor}
        data-slot='rich-text-content'
        x-class={[contentArea, proseContent]}
      />
      <NativeHiddenFields name={name} values={[value]} />
    </div>
  );
}

export type { RichTextEditorProps, RichTextEditorHandle };
