import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

import { useEffect, useRef, useState } from 'react';

import { css } from '@linaria/core';
import { ArrowLeftRight, Monitor, Moon, Play, Smartphone, Tablet } from 'lucide-react';

import { Button, Icon, darkTheme } from '@/lib';

import { resolveDemo } from './demo-sources';
import { buildStackblitzProject } from './stackblitz';

/*
 * Per-demo preview sandbox: the box every component demo renders into.
 * The toolbar re-scopes ONLY this box — dark adds the token `darkTheme`
 * class (all `--haze-*` custom properties re-derive on the box itself, so
 * every token-driven demo inside flips without touching the page theme),
 * RTL flips its `dir`, and the viewport presets constrain the demo's
 * content width (Auto leaves it exactly as before). Demo-site-local UI
 * state that is never exposed to library consumers, hence plain useState.
 *
 * The Play toggle swaps the static box for an in-page StackBlitz embed
 * (view: 'preview'); the SDK arrives as a lazily imported chunk on first
 * use, so pages that never toggle stay SDK-free.
 */

type ViewportPreset = {
  id: 'auto' | 'mobile' | 'tablet';
  label: string;
  /** null = Auto — content fills the box as it always did. */
  width: number | null;
  icon: LucideIcon;
};

const VIEWPORTS: readonly ViewportPreset[] = [
  { id: 'auto', label: 'Auto', width: null, icon: Monitor },
  { id: 'mobile', label: '375', width: 375, icon: Smartphone },
  { id: 'tablet', label: '768', width: 768, icon: Tablet },
] as const;

/* In-page embeds never shrink below the StackBlitz SDK's own default
 * frame height, so short demos still get a usable preview pane. */
const EMBED_MIN_HEIGHT = 300;

const shell = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg);
  background: var(--haze-color-bg);
`;

/* Stays visible over long demo pages: pinned to the scrollport top while
 * the box itself is in view, so the controls never scroll out of reach. */
const toolbar = css`
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: var(--haze-space-1);
  padding: var(--haze-space-2) var(--haze-space-3);
  border-bottom: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-lg) var(--haze-radius-lg) 0 0;
  background: var(--haze-color-bg);
`;

const toolbarGroup = css`
  display: flex;
  align-items: center;
  gap: var(--haze-space-1);
`;

/* Readout of the currently selected content width (Auto = unconstrained). */
const widthTag = css`
  padding: var(--haze-space-0) var(--haze-space-2);
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  line-height: var(--haze-leading-tight);
  color: var(--haze-color-text-secondary);
`;

/* Background/color resolve against the box itself: with `darkTheme`
 * applied here the dark token values take over, so the sandbox reads as
 * a dark surface with readable text rather than light page showing dark
 * widgets. (Headings inherit no color anywhere on the site — declare it
 * so the dark scope actually restyles them.) */
const previewArea = css`
  padding: var(--haze-space-4) var(--haze-space-6) var(--haze-space-6);
  background: var(--haze-color-bg);
  color: var(--haze-color-text);
  border-radius: 0 0 var(--haze-radius-lg) var(--haze-radius-lg);
`;

/* Width-constrained demo viewport (375/768 presets): centered with a
 * dashed boundary so the simulated device width is visually traceable.
 * Logical properties keep it correct under the RTL toggle. */
const constrained = css`
  margin-inline: auto;
  padding: var(--haze-space-2) var(--haze-space-4);
  border-inline: 1px dashed var(--haze-color-border);
  border-radius: var(--haze-radius-sm);
`;

/* In-page StackBlitz host: swaps in for the static preview area. The SDK
 * iframe replaces a disposable placeholder inside the mount node and fills
 * it (height pinned at toggle time, see toggleLive). */
const embedArea = css`
  padding: var(--haze-space-2);
  border-radius: 0 0 var(--haze-radius-lg) var(--haze-radius-lg);
  background: var(--haze-color-bg-subtle);
  overflow: hidden;
`;

/* The React-owned mount node the embed lives in; the SDK copies nothing
 * here — sizing comes from the inline height plus `width: 100%`. */
const embedFrame = css`
  display: block;
  width: 100%;
  border: none;
`;

export default function DemoPreview({
  name,
  children,
}: {
  /** route key（如 'button'）；解析得到 demos 源码时才提供页内运行开关。 */
  name?: string;
  children: ReactNode;
}) {
  const [dark, setDark] = useState(false);
  const [rtl, setRtl] = useState(false);
  const [viewportId, setViewportId] = useState<ViewportPreset['id']>('auto');
  const [live, setLive] = useState(false);
  const [embedHeight, setEmbedHeight] = useState<number | null>(null);
  const viewport = VIEWPORTS.find((v) => v.id === viewportId) ?? VIEWPORTS[0]!;
  // resolveDemo hits a module-level Map built once — stable identity per
  // route, so the embed effect below doesn't re-run spuriously.
  const demo = name === undefined ? undefined : resolveDemo(name);
  const previewRef = useRef<HTMLDivElement | null>(null);
  const mountRef = useRef<HTMLDivElement | null>(null);

  /* In-page run: pull the StackBlitz SDK as a lazy chunk on first toggle
   * (docs pages that never toggle never load it) and embed the demo's
   * in-memory project with the preview pane only. The SDK *replaces* the
   * element it is handed with its iframe and exposes no vm.destroy, so it
   * gets a disposable placeholder inside our mount node — React keeps
   * owning that node, and clearing it (toggle-off, re-embed, unmount)
   * tears the iframe down with it. */
  useEffect(() => {
    if (!live || !demo || !name) return;
    const mount = mountRef.current;
    if (!mount) return;
    let cancelled = false;
    const placeholder = document.createElement('div');
    mount.appendChild(placeholder);
    import('@stackblitz/sdk')
      .then(({ default: sdk }) => {
        if (cancelled || !placeholder.isConnected) return null;
        return sdk.embedProject(
          placeholder,
          buildStackblitzProject(name, demo.source),
          {
            view: 'preview',
            theme: dark ? 'dark' : 'light',
            height: '100%',
            hideNavigation: true,
            // WebContainer 需要宿主页跨域隔离（COOP/COEP）；未隔离的宿主
            // 两个取值都只会得到 StackBlitz 的隔离错误页，无害。
            crossOriginIsolated: true,
          }
        );
      })
      .catch(() => {
        // SDK chunk load or embed failure: quietly fall back to the
        // static box rather than leaving an empty frame behind.
        if (!cancelled) setLive(false);
      });
    return () => {
      cancelled = true;
      // Removes the pending placeholder or the live iframe alike.
      mount.replaceChildren();
    };
  }, [live, dark, demo, name]);

  const toggleLive = () => {
    if (!live) {
      // Pin the embed height to the static box's current height so the
      // page does not jump when the iframe takes over (floored at the
      // SDK's own default frame height).
      setEmbedHeight(
        Math.max(previewRef.current?.offsetHeight ?? 0, EMBED_MIN_HEIGHT)
      );
    }
    setLive((v) => !v);
  };

  const embedFrameStyle =
    embedHeight === null ? undefined : { height: embedHeight };

  return (
    <div className={shell}>
      <div className={toolbar}>
        <div className={toolbarGroup} role='group' aria-label='Preview viewport width'>
          {VIEWPORTS.map((preset) => (
            <Button
              key={preset.id}
              size='sm'
              variant={preset.id === viewportId ? 'solid' : 'ghost'}
              aria-pressed={preset.id === viewportId}
              onClick={() => setViewportId(preset.id)}
            >
              <Icon icon={preset.icon} size='sm' />
              {preset.label}
            </Button>
          ))}
          <span className={widthTag} data-slot='width-tag' aria-live='polite'>
            {viewport.width === null ? 'Auto' : `${viewport.width}px`}
          </span>
        </div>
        <div className={toolbarGroup}>
          {demo && (
            <Button
              size='sm'
              square
              variant={live ? 'solid' : 'ghost'}
              aria-pressed={live}
              aria-label='Toggle in-page demo run'
              onClick={toggleLive}
            >
              <Icon icon={Play} size='sm' />
            </Button>
          )}
          <Button
            size='sm'
            square
            variant={dark ? 'solid' : 'ghost'}
            aria-label='Toggle dark preview'
            aria-pressed={dark}
            onClick={() => setDark((v) => !v)}
          >
            <Icon icon={Moon} size='sm' />
          </Button>
          <Button
            size='sm'
            square
            variant={rtl ? 'solid' : 'ghost'}
            aria-pressed={rtl}
            aria-label='Toggle RTL preview'
            onClick={() => setRtl((v) => !v)}
          >
            <Icon icon={ArrowLeftRight} size='sm' />
          </Button>
        </div>
      </div>
      {live && demo ? (
        <div className={embedArea}>
          {viewport.width === null ? (
            <div
              ref={mountRef}
              className={embedFrame}
              data-slot='stackblitz-embed'
              style={embedFrameStyle}
            />
          ) : (
            <div className={constrained} style={{ maxWidth: viewport.width }}>
              <div
                ref={mountRef}
                className={embedFrame}
                data-slot='stackblitz-embed'
                style={embedFrameStyle}
              />
            </div>
          )}
        </div>
      ) : (
        <div
          ref={previewRef}
          className={previewArea}
          x-class={[dark && darkTheme]}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          {viewport.width === null ? (
            children
          ) : (
            <div className={constrained} style={{ maxWidth: viewport.width }}>
              {children}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
