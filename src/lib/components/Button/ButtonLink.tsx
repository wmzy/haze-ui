import type { ComponentPropsWithoutRef, ReactNode } from 'react';

import { forwardRef } from 'react';

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
 * delegates rendering to Button — the children are now wrapped in
 * `<span data-slot='label'>` and the busy spinner in
 * `<span data-slot='indicator' aria-hidden>`; DOM selectors written
 * against the old flat label break. Props stay contract-equal:
 * `variant` still defaults to `'solid'` (the Button tier never read
 * config) and `size` still reads the `ButtonLink` config section first.
 */
type ButtonLinkProps = {
  variant?: 'solid' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  square?: boolean;
  /** Busy state — same visual contract as Button's `loading`. */
  loading?: boolean | { icon?: ReactNode; text?: ReactNode };
} & ComponentPropsWithoutRef<'a'>;

// eslint-disable-next-line @typescript-eslint/no-deprecated -- 声明点本身必须引用自己的类型
const ButtonLink = forwardRef<HTMLAnchorElement, ButtonLinkProps>(
  function ButtonLink({ size: sizeProp, ...props }, ref) {
    // ButtonLink keeps its own ConfigProvider section: before the `as`
    // delegation it read 'ButtonLink', and existing consumers keep that
    // tier — explicit prop > ButtonLink config > Button's resolution.
    const config = useConfigDefaults('ButtonLink');
    const size = sizeProp ?? config.size;
    return <Button as='a' ref={ref} size={size} {...props} />;
  }
);

export default ButtonLink;

// eslint-disable-next-line @typescript-eslint/no-deprecated -- 声明模块必须重导出它，供消费方兼容旧签名
export type { ButtonLinkProps };
