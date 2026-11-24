import type { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

import { warnDeprecated } from '../../utils/deprecate';
import { useConfigDefaults } from '../ConfigProvider/useConfigDefaults';

import Button from './Button';

/**
 * A real `<a>` with the full Button appearance — for navigation that
 * must look like a button.
 *
 * @deprecated Use `<Button as='a'>` instead — same skin, same anchor
 * semantics, and the wiring is shared with Button (single code path per
 * family). ButtonLink remains as a deprecated alias and will be removed
 * in the next major.
 *
 * Anchors have no `disabled` attribute: report the state with
 * `aria-disabled` (and `tabIndex={-1}` to drop it from the focus
 * order) — the skin styles `aria-disabled` exactly like Button's
 * `:disabled`.
 *
 * Migration note (1.4 minor): since Button learned `as`, ButtonLink
 * delegates rendering to Button. Idle anchors keep the flat DOM (no
 * wrapper); only a busy render wraps the children in
 * `<span data-slot='label'>` and adds
 * `<span data-slot='indicator' aria-hidden>`. Props stay
 * contract-equal: `variant` still defaults to `'solid'` (the Button
 * tier never read config) and `size` still reads the `ButtonLink`
 * config section first.
 *
 * Rendering warns once per page load in dev, through warnDeprecated
 * (`[haze-ui]` prefix, deduped by key, silent in production builds).
 */
type ButtonLinkProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
  /** Busy state — same visual contract as Button's `loading`. */
  loading?: boolean | { icon?: ReactNode; text?: ReactNode };
  /** The rendered anchor (React 19 ref-as-prop — no forwardRef wrapper). */
  ref?: Ref<HTMLAnchorElement>;
} & ComponentPropsWithoutRef<'a'>;

// eslint-disable-next-line @typescript-eslint/no-deprecated -- 声明点本身必须引用自己的类型
export default function ButtonLink({ size: sizeProp, ref, ...props }: ButtonLinkProps) {
  // During render on purpose: "first use" is the first render, on the
  // server as on the client — the dedup Set keeps it to one line either way.
  warnDeprecated(
    'ButtonLink.alias',
    "ButtonLink is deprecated — use <Button as='a'> instead; the alias is removed in the next major."
  );
  // ButtonLink keeps its own ConfigProvider section: before the `as`
  // delegation it read 'ButtonLink', and existing consumers keep that
  // tier — explicit prop > ButtonLink config > Button's resolution.
  const config = useConfigDefaults('ButtonLink');
  const size = sizeProp ?? config.size;
  return <Button as='a' ref={ref} size={size} {...props} />;
}

// eslint-disable-next-line @typescript-eslint/no-deprecated -- 声明模块必须重导出它，供消费方兼容旧签名
export type { ButtonLinkProps };
