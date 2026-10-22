'use client';

import { useActionState } from 'react';

import {
  Button,
  Form,
  FormItem,
  Input,
  InputCore,
  Option,
  Rating,
  SelectCore,
  Switch,
  TagInput,
  useForm,
} from 'haze-ui';
import { useFormState } from 'react-f0rm';

import { saveMember, updateProfile } from './actions';
import type { ProfileState } from './actions';

/*
 * React 19 server actions × haze-ui, in the two wirings the docs guide
 * (src/views/Guides/ServerActions) documents:
 *
 *  1. the react-f0rm channel — `<Form action={saveMember}>` with
 *     FormItem-bound cores: the action receives *validated* FormData,
 *     its `{ errors }` rejection lands as per-field server errors on
 *     the FormItems, and `useFormState(form)` drives Button loading +
 *     the success line;
 *  2. the plain channel — `useActionState(updateProfile, …)` with a
 *     native `<form action={formAction}>` where haze-ui's hidden-input
 *     bridges (Switch / Rating / TagInput `name` props) put the values
 *     into FormData.
 *
 * Both actions live in ./actions.ts as real 'use server' functions
 * (with fake latency and deterministic rejection paths), so this page
 * exercises the full server-action round trip, not a client mock.
 */

const stack = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--haze-space-4)',
  maxWidth: '36rem',
  margin: '3rem auto',
  padding: '0 var(--haze-space-4)',
} as const;

const panel = {
  display: 'flex',
  flexDirection: 'column',
  gap: 'var(--haze-space-3)',
  border: '1px solid var(--haze-color-border)',
  borderRadius: 'var(--haze-radius-md)',
  padding: 'var(--haze-space-4)',
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

const subheading = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-lg)',
  fontWeight: 'var(--haze-weight-medium)',
  color: 'var(--haze-color-text)',
  margin: 0,
} as const;

const body = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-base)',
  color: 'var(--haze-color-text-secondary)',
  margin: 0,
} as const;

const note = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-muted)',
  margin: 0,
} as const;

const status = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-text-secondary)',
  margin: 0,
} as const;

const error = {
  fontFamily: 'var(--haze-font-sans)',
  fontSize: 'var(--haze-text-sm)',
  color: 'var(--haze-color-danger)',
  margin: 0,
  fontWeight: 500,
} as const;

type MemberValues = { email: string; role: string };

/**
 * react-f0rm reads an `ActionErrorResult` off the action's resolution,
 * but @types/react's own `action` typing demands a void return — the
 * prop is an intersection of both, so one honest cast sits at the seam
 * (the runtime contract is f0rm's: `{ errors }` rejects, else success).
 */
const saveMemberAction = saveMember as unknown as (
  formData: FormData
) => Promise<void>;

/** Demo 1 — the react-f0rm channel: Form action + FormItem + server errors. */
function MemberFormDemo() {
  const form = useForm<MemberValues>({
    initialValues: { email: '', role: 'admin' },
  });
  const { isSubmitting, isSubmitSuccessful } = useFormState(form);

  return (
    <div style={panel}>
      <h2 style={subheading}>1 · &lt;Form action&gt; channel (react-f0rm)</h2>
      <p style={body}>
        The action receives validated FormData; returning{' '}
        <code>errors</code> hydrates the FormItems like failed validation.
        Try <code>ada@taken.dev</code>.
      </p>
      <Form form={form} action={saveMemberAction}>
        <FormItem
          form={form}
          name='email'
          label='Email'
          rules={{ required: 'Email is required' }}
          mode='onBlur'
          input={InputCore}
          placeholder='ada@haze.dev'
        />
        <FormItem form={form} name='role' label='Role' input={SelectCore}>
          <Option value='admin'>Admin</Option>
          <Option value='editor'>Editor</Option>
        </FormItem>
        <div style={row}>
          <Button
            loading={isSubmitting}
            onClick={(e) => e.currentTarget.form?.requestSubmit()}
          >
            Save member
          </Button>
          {isSubmitSuccessful && (
            <p style={status} role='status'>
              Saved — the server accepted the member.
            </p>
          )}
        </div>
      </Form>
    </div>
  );
}

const INITIAL_PROFILE: ProfileState = { status: 'idle' };

/** Demo 2 — the plain channel: useActionState + native FormData bridges. */
function ProfileFormDemo() {
  const [state, formAction, pending] = useActionState(
    updateProfile,
    INITIAL_PROFILE
  );

  return (
    <div style={panel}>
      <h2 style={subheading}>2 · useActionState channel (native FormData)</h2>
      <p style={body}>
        Switch, Rating and TagInput submit through their hidden-input
        bridges — unchecked Switch and 0-star Rating are absent from the
        payload, tags arrive as repeated fields. Try display name{' '}
        <code>haze</code>.
      </p>
      <form action={formAction} style={panel}>
        <label style={row}>
          Display name
          <Input
            name='displayName'
            required
            placeholder='Ada Lovelace'
          />
        </label>
        <label style={row}>
          <Switch name='beta' />
          Join the beta channel
        </label>
        <div style={row}>
          Priority <Rating name='priority' value={2} />
        </div>
        <TagInput name='tags' value={['nextjs', 'react-19']} placeholder='Add tag…' />
        {state.status === 'rejected' && (
          <p style={error} role='alert'>
            {state.error}
          </p>
        )}
        <div style={row}>
          <Button
            loading={pending}
            onClick={(e) => e.currentTarget.form?.requestSubmit()}
          >
            Save profile
          </Button>
          {state.status === 'saved' && (
            <p style={status} role='status'>
              {state.summary}
            </p>
          )}
        </div>
      </form>
    </div>
  );
}

export default function ActionsDemoPage() {
  return (
    <main style={stack}>
      <h1 style={heading}>Server actions × haze-ui</h1>
      <p style={body}>
        Two real <code>&apos;use server&apos;</code> round trips from{' '}
        <code>app/actions-demo/actions.ts</code>.
      </p>
      <MemberFormDemo />
      <ProfileFormDemo />
      <p style={note}>
        <a href='/'>← back to the example home</a> ·{' '}
        <a href='/per-component-css'>per-component CSS variant</a>
      </p>
    </main>
  );
}
