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

import { fieldChrome, focusWithinRing } from '../../utils/field-skin';
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

/* The surface chrome (border/radius/fill) and the :focus-within ring —
 * its forced-colors Highlight fallback included — are the shared
 * fieldChrome + focusWithinRing pair (utils/field-skin) composed below.
 * Local: the column flex shell, the field ink/sans, the overflow clip
 * and the hover arm. */
const root = css`
  display: flex;
  flex-direction: column;
  color: var(--haze-color-text);
  font-family: var(--haze-font-sans);
  overflow: hidden;
  transition:
    border-color var(--haze-duration-fast),
    box-shadow var(--haze-duration-fast);

  &:hover {
    border-color: var(--haze-color-border-hover);
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
  key: ToolbarCommandName;
  label: string;
  glyph: string;
  pressed: boolean;
  disabled: boolean;
  run: () => void;
};

type RichTextEditorStrings = Readonly<HazeStrings['richTextEditor']>;

/** The built-in toolbar's item groups, in toolbar order. */
type ToolbarGroup = 'marks' | 'headings' | 'lists' | 'blocks' | 'link';

/** A toolbar glyph: a fixed literal, or one read off the live strings. */
type ToolbarGlyph = string | ((strings: RichTextEditorStrings) => string);

/** One built-in toolbar command: how it is presented and what it does. */
type ToolbarCommand = {
  /** Item group; a ToolbarSeparator sits between consecutive groups. */
  group: ToolbarGroup;
  /** Accessible name — a key into the `richTextEditor` strings. */
  label: keyof HazeStrings['richTextEditor'];
  /** What the button shows. */
  glyph: ToolbarGlyph;
  /** `isActive`: the pressed look (`aria-pressed`). */
  isActive: (editor: Editor) => boolean;
  /** `can()`: whether the command would dispatch (commands go inert
   * inside code blocks etc.) — the disabled source. */
  can: (editor: Editor) => boolean;
  /** Dispatches the command. */
  run: (editor: Editor) => void;
};

/**
 * Every command on the built-in toolbar, declared once: toolbar order
 * and grouping, labels, glyphs, pressed/disabled state and dispatch all
 * derive from this table (TOOLBAR_GROUPS, buildToolbarItems,
 * selectToolbarState). Labels are string keys and glyphs literals or
 * string thunks: the table holds no translated text, because the locale
 * is only known inside the component (useStrings), never at module load.
 */
const TOOLBAR_COMMANDS = {
  bold: {
    group: 'marks',
    label: 'bold',
    glyph: 'B',
    isActive: (editor) => editor.isActive('bold'),
    can: (editor) => editor.can().chain().focus().toggleBold().run(),
    run: (editor) => {
      editor.chain().focus().toggleBold().run();
    },
  },
  italic: {
    group: 'marks',
    label: 'italic',
    glyph: 'I',
    isActive: (editor) => editor.isActive('italic'),
    can: (editor) => editor.can().chain().focus().toggleItalic().run(),
    run: (editor) => {
      editor.chain().focus().toggleItalic().run();
    },
  },
  strike: {
    group: 'marks',
    label: 'strikethrough',
    glyph: 'S',
    isActive: (editor) => editor.isActive('strike'),
    can: (editor) => editor.can().chain().focus().toggleStrike().run(),
    run: (editor) => {
      editor.chain().focus().toggleStrike().run();
    },
  },
  heading2: {
    group: 'headings',
    label: 'heading2',
    glyph: 'H2',
    isActive: (editor) => editor.isActive('heading', { level: 2 }),
    can: (editor) =>
      editor.can().chain().focus().toggleHeading({ level: 2 }).run(),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 2 }).run();
    },
  },
  heading3: {
    group: 'headings',
    label: 'heading3',
    glyph: 'H3',
    isActive: (editor) => editor.isActive('heading', { level: 3 }),
    can: (editor) =>
      editor.can().chain().focus().toggleHeading({ level: 3 }).run(),
    run: (editor) => {
      editor.chain().focus().toggleHeading({ level: 3 }).run();
    },
  },
  bulletList: {
    group: 'lists',
    label: 'bulletList',
    glyph: (strings) => strings.bulletListGlyph,
    isActive: (editor) => editor.isActive('bulletList'),
    can: (editor) => editor.can().chain().focus().toggleBulletList().run(),
    run: (editor) => {
      editor.chain().focus().toggleBulletList().run();
    },
  },
  orderedList: {
    group: 'lists',
    label: 'orderedList',
    glyph: (strings) => strings.orderedListGlyph,
    isActive: (editor) => editor.isActive('orderedList'),
    can: (editor) => editor.can().chain().focus().toggleOrderedList().run(),
    run: (editor) => {
      editor.chain().focus().toggleOrderedList().run();
    },
  },
  blockquote: {
    group: 'blocks',
    label: 'blockquote',
    glyph: (strings) => strings.blockquoteGlyph,
    isActive: (editor) => editor.isActive('blockquote'),
    can: (editor) => editor.can().chain().focus().toggleBlockquote().run(),
    run: (editor) => {
      editor.chain().focus().toggleBlockquote().run();
    },
  },
  codeBlock: {
    group: 'blocks',
    label: 'codeBlock',
    glyph: (strings) => strings.codeBlockGlyph,
    isActive: (editor) => editor.isActive('codeBlock'),
    can: (editor) => editor.can().chain().focus().toggleCodeBlock().run(),
    run: (editor) => {
      editor.chain().focus().toggleCodeBlock().run();
    },
  },
  link: {
    group: 'link',
    label: 'link',
    glyph: (strings) => strings.linkGlyph,
    isActive: (editor) => editor.isActive('link'),
    can: (editor) =>
      editor
        .can()
        .chain()
        .focus()
        .extendMarkRange('link')
        .setLink({ href: 'https://' })
        .run(),
    run: (editor) => {
      if (editor.isActive('link')) {
        editor.chain().focus().unsetLink().run();
        return;
      }
      // Prompt-free v1: reapply the current href when the selection
      // overlaps one, otherwise the neutral placeholder scheme.
      const attrs: Record<string, unknown> = editor.getAttributes('link');
      const current = attrs.href;
      const href = typeof current === 'string' && current ? current : 'https://';
      editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
    },
  },
} as const satisfies Record<string, ToolbarCommand>;

type ToolbarCommandName = keyof typeof TOOLBAR_COMMANDS;

/** The commands in toolbar order (object key order = declaration order). */
const COMMAND_NAMES = Object.keys(TOOLBAR_COMMANDS) as ToolbarCommandName[];

/** The commands per group, groups in toolbar order — one array per
 * ToolbarSeparator-delimited group. */
const TOOLBAR_GROUPS = [
  ...new Set(COMMAND_NAMES.map((name) => TOOLBAR_COMMANDS[name].group)),
].map((group) =>
  COMMAND_NAMES.filter((name) => TOOLBAR_COMMANDS[name].group === group)
);

/** What the editor says about one command right now. */
type ToolbarCommandState = {
  active: boolean;
  enabled: boolean;
};

type ToolbarState = Record<ToolbarCommandName, ToolbarCommandState>;

/**
 * `isActive` (pressed look) and `can()` (focus in a can-chain is side-
 * effect free — the command guards on dispatch) for every command, read
 * off the editor on each transaction (useEditorState re-renders on
 * selectionUpdate/transaction).
 */
function selectToolbarState(editor: Editor): ToolbarState {
  // Every COMMAND_NAMES entry gets a value, so the cast only restores
  // the literal keys fromEntries' index signature loses.
  return Object.fromEntries(
    COMMAND_NAMES.map((name) => {
      const { isActive, can } = TOOLBAR_COMMANDS[name];
      return [name, { active: isActive(editor), enabled: can(editor) }] as const;
    })
  ) as ToolbarState;
}

/**
 * The built-in toolbar's item groups (marks / headings / lists / blocks /
 * link), each pair separated by a ToolbarSeparator. Built from
 * TOOLBAR_COMMANDS plus the live editor and its selection state, so
 * `pressed` reflects `isActive` and `disabled` reflects `can()` plus
 * read-only mode.
 */
function buildToolbarItems(
  editor: Editor | null,
  state: ToolbarState | null,
  editable: boolean,
  strings: RichTextEditorStrings
): ToolbarItem[][] {
  const off = !editor || !state || !editable;
  const toItem = (name: ToolbarCommandName): ToolbarItem => {
    const command = TOOLBAR_COMMANDS[name];
    return {
      key: name,
      label: strings[command.label],
      glyph:
        typeof command.glyph === 'function'
          ? command.glyph(strings)
          : command.glyph,
      pressed: state?.[name].active ?? false,
      disabled: off || !state[name].enabled,
      run: () => {
        if (editor) command.run(editor);
      },
    };
  };
  return TOOLBAR_GROUPS.map((names) => names.map(toItem));
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

  // Toolbar state: `isActive` for the pressed look, `can()` for disabled
  // (see selectToolbarState). useEditorState re-renders on
  // selectionUpdate/transaction.
  const toolbarState = useEditorState({
    editor,
    selector: ({ editor: e }) => (e ? selectToolbarState(e) : null),
  });

  const toolbarGroups = buildToolbarItems(editor, toolbarState, editable, strings);

  return (
    <div data-slot='rich-text-editor' x-class={[fieldChrome, focusWithinRing, root, className]} {...rest}>
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
