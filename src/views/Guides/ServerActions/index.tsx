import type { SetStateAction } from 'react';

import { startTransition, useActionState, useOptimistic, useState } from 'react';
import { css } from '@linaria/core';
import { useControl, useThru } from 'react-use-control';

import {
  Button,
  Checkbox,
  InlineEdit,
  Input,
  Option,
  Rating,
  Select,
  Switch,
  TagInput,
} from '@/lib';
import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * React 19 Actions guide. Prose, the bridge table and code samples live
 * in guide-content.tsx; this shell owns the three live demos (native
 * FormData bridge, useActionState pending/server-error, useOptimistic
 * rollback) and injects them as slots. Demo copy arrives via doc.ui.
 *
 * The demos use client-side stand-ins for the 'use server' functions —
 * same signatures, fake latency and a deterministic rejection path —
 * since the docs app has no RSC runtime. examples/nextjs/app/actions-demo
 * runs the identical wiring against real server actions.
 */

const demoFrame = css`
  border: 1px solid var(--haze-color-border);
  border-radius: var(--haze-radius-md);
  padding: var(--haze-space-4);
  margin: var(--haze-space-4) 0 var(--haze-space-2);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  font-family: var(--haze-font-sans);
  max-width: 560px;
`;

const demoSplit = css`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--haze-space-4);

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

const demoForm = css`
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-3);
  align-items: flex-start;
`;

const demoBar = css`
  display: flex;
  gap: var(--haze-space-2);
  align-items: center;
  font-size: var(--haze-text-sm);
  font-weight: var(--haze-weight-medium);
  color: var(--haze-color-text-secondary);
`;

const demoRow = css`
  display: flex;
  gap: var(--haze-space-2);
  align-items: center;
  flex-wrap: wrap;
`;

const payloadList = css`
  margin: 0;
  padding: 0;
  font-family: var(--haze-font-mono);
  font-size: var(--haze-text-xs);
  color: var(--haze-color-text);
  line-height: var(--haze-leading-relaxed);
  display: flex;
  flex-direction: column;
  gap: var(--haze-space-1);
  list-style: none;
  word-break: break-all;
`;

const payloadKey = css`
  color: var(--haze-color-primary);
  font-weight: var(--haze-weight-medium);
`;

const statusLine = css`
  margin: 0;
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-text-secondary);
`;

const errorLine = css`
  margin: 0;
  font-size: var(--haze-text-sm);
  font-family: var(--haze-font-sans);
  color: var(--haze-color-danger);
`;

const hint = css`
  margin: 0;
  font-size: var(--haze-text-sm);
  color: var(--haze-color-text-muted);
`;

const wait = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

type NativeUi = {
  titlePlaceholder: string;
  rolePlaceholder: string;
  subscribeLabel: string;
  tagsPlaceholder: string;
  submitLabel: string;
  payloadHeading: string;
  payloadEmpty: string;
};

/**
 * Native-bridge demo: a plain `<form action={fn}>` with one bridged
 * component of every kind. The action is a client stand-in that just
 * echoes the FormData it received — including the absences (unchecked
 * Switch, empty Select, 0-star Rating) the guide's table documents.
 */
function NativeBridgeDemo({
  titlePlaceholder,
  rolePlaceholder,
  subscribeLabel,
  tagsPlaceholder,
  submitLabel,
  payloadHeading,
  payloadEmpty,
}: NativeUi) {
  const [entries, setEntries] = useState<readonly (readonly [string, string])[] | null>(
    null
  );

  return (
    <div className={demoFrame}>
      <div className={demoSplit}>
        <form
          action={(formData) =>
            setEntries(
              [...formData.entries()].map(([key, value]) =>
                [key, typeof value === 'string' ? value : value.name] as const
              )
            )
          }
          className={demoForm}
        >
          <Input name='title' placeholder={titlePlaceholder} aria-label={titlePlaceholder} />
          <Select name='role' value='' aria-label={rolePlaceholder}>
            <Option value=''>{rolePlaceholder}</Option>
            <Option value='admin'>admin</Option>
            <Option value='editor'>editor</Option>
          </Select>
          <label className={demoRow}>
            <Switch name='subscribe' />
            {subscribeLabel}
          </label>
          <Rating name='rating' value={0} />
          <TagInput name='tags' value={[]} placeholder={tagsPlaceholder} />
          <Button onClick={(e) => e.currentTarget.form?.requestSubmit()}>
            {submitLabel}
          </Button>
        </form>
        <div>
          <div className={demoBar}>{payloadHeading}</div>
          {entries === null || entries.length === 0 ? (
            <p className={hint}>{payloadEmpty}</p>
          ) : (
            <ul className={payloadList}>
              {entries.map(([key, value], i) => (
                <li key={`${key}:${i}`}>
                  <span className={payloadKey}>{key}</span>: {value}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

type SettingsResult =
  | { status: 'idle' }
  | { status: 'saved'; email: string }
  | { status: 'rejected' };

/**
 * Client stand-in for the guide's 'use server' saveSettings: fixed
 * latency, deterministic rejection (@taken.dev), otherwise saved.
 */
async function saveSettings(
  _prev: SettingsResult,
  formData: FormData
): Promise<SettingsResult> {
  await wait(600);
  const raw = formData.get('email');
  const email = typeof raw === 'string' ? raw : '';
  if (email.endsWith('@taken.dev')) return { status: 'rejected' };
  return { status: 'saved', email };
}

type ActionUi = {
  emailPlaceholder: string;
  settingsSubmitLabel: string;
  takenError: string;
  tryHint: string;
  savedAs: string;
};

/** useActionState demo: pending flows into Button loading, rejection into role='alert'. */
function ActionStateDemo({
  emailPlaceholder,
  settingsSubmitLabel,
  takenError,
  tryHint,
  savedAs,
}: ActionUi) {
  const [state, formAction, pending] = useActionState(saveSettings, {
    status: 'idle',
  });

  return (
    <div className={demoFrame}>
      <form action={formAction} className={demoForm}>
        <Input
          name='email'
          placeholder={emailPlaceholder}
          aria-label={emailPlaceholder}
        />
        {state.status === 'rejected' && (
          <p className={errorLine} role='alert'>
            {takenError}
          </p>
        )}
        <Button
          loading={pending}
          onClick={(e) => e.currentTarget.form?.requestSubmit()}
        >
          {settingsSubmitLabel}
        </Button>
        {state.status === 'saved' && (
          <p className={statusLine} role='status'>
            {savedAs + state.email}
          </p>
        )}
        <p className={hint}>{tryHint}</p>
      </form>
    </div>
  );
}

type OptimisticUi = {
  nameLabel: string;
  tagsLabel: string;
  tagsPlaceholder: string;
  rejectLabel: string;
  savedNote: string;
  rolledBackNote: string;
};

/**
 * useOptimistic demo: InlineEdit rename + TagInput edits through the
 * control channel the guide teaches (useControl holds the durable state,
 * useThru points the read at the optimistic shadow and the write at the
 * flight). The checkbox makes the next save fail so the rollback — the
 * shadow collapsing back onto the untouched durable state — is visible.
 */
function OptimisticDemo({
  nameLabel,
  tagsLabel,
  tagsPlaceholder,
  rejectLabel,
  savedNote,
  rolledBackNote,
}: OptimisticUi) {
  const [name, setName, nameCtrl] = useControl(undefined, 'Ada Lovelace');
  const [shownName, markRenamed] = useOptimistic(
    name,
    (_committed: string, next: string) => next
  );
  const [tags, setTags, tagsCtrl] = useControl(undefined, ['react', 'css']);
  const [shownTags, markTags] = useOptimistic(
    tags,
    (_committed: string[], next: string[]) => next
  );
  const [rejectNext, setRejectNext] = useState(false);
  const [note, setNote] = useState<string | null>(null);

  function commitRename(next: SetStateAction<string>): void {
    const value = typeof next === 'function' ? next(name) : next;
    startTransition(async () => {
      markRenamed(value);
      await wait(700);
      if (rejectNext) {
        setNote(rolledBackNote);
        return;
      }
      setName(value);
      setNote(savedNote);
    });
  }

  function commitTags(next: SetStateAction<string[]>): void {
    const value = typeof next === 'function' ? next(tags) : next;
    startTransition(async () => {
      markTags(value);
      await wait(700);
      if (rejectNext) {
        setNote(rolledBackNote);
        return;
      }
      setTags(value);
      setNote(savedNote);
    });
  }

  // the controls the components see: optimistic reads, flight-starting writes
  const optimisticNameCtrl = useThru(nameCtrl, () => [shownName, commitRename]);
  const optimisticTagsCtrl = useThru(tagsCtrl, () => [shownTags, commitTags]);

  return (
    <div className={demoFrame}>
      <div className={demoRow}>
        {nameLabel}
        <InlineEdit value={optimisticNameCtrl} />
      </div>
      <div className={demoRow}>
        {tagsLabel}
        <TagInput
          value={optimisticTagsCtrl}
          placeholder={tagsPlaceholder}
        />
      </div>
      <label className={demoRow}>
        <Checkbox
          checked={rejectNext}
          onChange={(e) => setRejectNext(e.target.checked)}
        />
        {rejectLabel}
      </label>
      {note && (
        <p className={statusLine} role='status'>
          {note}
        </p>
      )}
    </div>
  );
}

export default function ServerActionsGuide() {
  const doc = useGuideDoc('serverActions');
  const ui = doc.ui ?? {};

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView
        doc={doc}
        slots={{
          'native-demo': (
            <NativeBridgeDemo
              titlePlaceholder={ui.titlePlaceholder ?? 'Project title'}
              rolePlaceholder={ui.rolePlaceholder ?? 'Pick a role…'}
              subscribeLabel={ui.subscribeLabel ?? 'Email updates'}
              tagsPlaceholder={ui.tagsPlaceholder ?? 'Add tag…'}
              submitLabel={ui.submitLabel ?? 'Submit'}
              payloadHeading={ui.payloadHeading ?? 'What the server receives'}
              payloadEmpty={ui.payloadEmpty ?? 'Nothing yet — submit the form.'}
            />
          ),
          'action-state-demo': (
            <ActionStateDemo
              emailPlaceholder={ui.emailPlaceholder ?? 'you@work.dev'}
              settingsSubmitLabel={ui.settingsSubmitLabel ?? 'Save settings'}
              takenError={ui.takenError ?? 'That address is already registered.'}
              tryHint={ui.tryHint ?? 'End the address with @taken.dev to see the rejection path.'}
              savedAs={ui.savedAs ?? 'Saved '}
            />
          ),
          'optimistic-demo': (
            <OptimisticDemo
              nameLabel={ui.nameLabel ?? 'Display name:'}
              tagsLabel={ui.tagsLabel ?? 'Tags:'}
              tagsPlaceholder={ui.tagsPlaceholder ?? 'Add tag…'}
              rejectLabel={ui.rejectLabel ?? 'Reject the next save'}
              savedNote={ui.savedNote ?? 'Saved.'}
              rolledBackNote={
                ui.rolledBackNote ?? 'Rejected — the optimistic value rolled back.'
              }
            />
          ),
        }}
      />
    </div>
  );
}
