'use client';

// Per-component CSS mode: instead of the full `haze-ui/styles.css` bundle
// (imported once in app/layout.tsx), this page imports only the CSS families
// it renders. App Router allows global CSS imports in any page/component
// (Next 13.4+); each import is hoisted into the route's stylesheet.
//
// The family list comes from haze-ui's css-manifest.json:
//   - `tokens` is always required — it defines the `lightTheme`/`spacing`/
//     `typography` classes applied to <body> in the root layout, plus every
//     --haze-* custom property the component classes reference.
//   - Button/ButtonLink -> `button` (+ `spinner`, its flattened closure)
//   - Switch            -> `switch`
//   - Datepicker        -> `datepicker` (+ `calendar` closure)
//   - Toast/useToast    -> `toast`
// `dependencies` in css-manifest.json is the flattened closure per export,
// so the files below are complete — nothing further to chase by hand.
import 'haze-ui/css/tokens.css';
import 'haze-ui/css/button.css';
import 'haze-ui/css/spinner.css';
import 'haze-ui/css/switch.css';
import 'haze-ui/css/datepicker.css';
import 'haze-ui/css/calendar.css';
import 'haze-ui/css/toast.css';

import {
  Button,
  ButtonLink,
  Datepicker,
  Switch,
  ToastContainer,
  useToast,
} from 'haze-ui';

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--haze-space-4)',
  maxWidth: '36rem',
  margin: '3rem auto',
  padding: '0 var(--haze-space-4)',
} as const;

const row = {
  display: 'flex',
  alignItems: 'center',
  gap: 'var(--haze-space-2)',
  flexWrap: 'wrap',
} as const;

const heading = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-3xl)',
  color: 'var(--haze-color-text)',
  margin: 0,
} as const;

const body = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-base)',
  color: 'var(--haze-color-text-secondary)',
  margin: 0,
} as const;

// useToast needs a <ToastContainer> ancestor (see app/page.tsx).
function ToastActions() {
  const toast = useToast();

  return (
    <div style={row}>
      <Button onClick={() => toast('Saved', {variant: 'success'})}>Save</Button>
      <Button
        variant='outline'
        onClick={() => toast('Discarded', {variant: 'warning'})}
      >
        Discard
      </Button>
      <ButtonLink href='https://github.com/wmzy/haze-ui' variant='ghost'>
        GitHub
      </ButtonLink>
    </div>
  );
}

export default function PerComponentCss() {
  return (
    <ToastContainer>
      <main style={stack}>
        <h1 style={heading}>Per-component CSS</h1>
        <p style={body}>
          Same components as the home page, but this route documents the
          per-component subpath imports it would need in an app that does not
          use the full bundle.
        </p>

        <ToastActions />

        <label style={row}>
          <Switch aria-label='Email notifications' />
          Email notifications
        </label>

        <Datepicker locale='en-US' weekStartsOn={0} placeholder='Pick a date' />
      </main>
    </ToastContainer>
  );
}
