import type { SVGProps } from 'react';

/**
 * The lucide `copy` glyph in its pre-redesign geometry (rect 9,9 13×13
 * + the two-arc path). Single-sourced here because the installed
 * lucide-react (1.44) ships the redesigned outline (rect 8,8 14×14 +
 * bezier path): adopting it would shift rendered pixels that the
 * copybutton/snippet e2e baselines pin. When those baselines are next
 * regenerated deliberately, delete this module and import `Copy` from
 * `../icons` instead — the check glyph has already made that move.
 *
 * Defaults render at 14px (the ChatMessage/JsonView affordances);
 * CopyButton overrides to 16 at its usage site via props.
 */
export function CopyGlyph(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      width={14}
      height={14}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
