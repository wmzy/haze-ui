'use server';

/**
 * Target of the react-f0rm `<Form action>` channel (see page.tsx).
 *
 * The form layer hands the action *validated* FormData built from the
 * form's values, and understands a rejection: returning `{ errors }`
 * lands the record as per-field `type: 'server'` errors, rendered by
 * the matching `FormItem`'s error span exactly like failed client
 * validation. Return `undefined` (or anything without `errors`) to
 * report success.
 */
export async function saveMember(
  formData: FormData
): Promise<{ errors?: Record<string, string | string[]> } | undefined> {
  const email = String(formData.get('email') ?? '');
  const role = String(formData.get('role') ?? '');

  // Deterministic rejection paths for the demo.
  if (!email.includes('@')) {
    return { errors: { email: 'That does not look like an email address.' } };
  }
  if (email.endsWith('@taken.dev')) {
    return { errors: { email: 'That address is already registered.' } };
  }

  await new Promise((resolve) => setTimeout(resolve, 800)); // fake persistence
  void role; // in a real app: await db.members.save({ email, role })

  return undefined;
}

/** Result shape of the `useActionState` demo below. */
export type ProfileState =
  | { status: 'idle' }
  | { status: 'saved'; summary: string }
  | { status: 'rejected'; error: string };

/**
 * Target of the plain React `useActionState` channel: receives the
 * previous state plus the raw browser FormData — haze-ui's hidden-input
 * bridges included (unchecked `Switch` absent, `Rating` absent at 0
 * stars, one repeated `tags` entry per tag).
 */
export async function updateProfile(
  _prev: ProfileState,
  formData: FormData
): Promise<ProfileState> {
  const displayName = String(formData.get('displayName') ?? '').trim();
  const beta = formData.get('beta') === 'on'; // absent when unchecked
  const priority = Number(formData.get('priority') ?? 0) || 0;
  const tags = formData.getAll('tags').map(String); // repeated field

  await new Promise((resolve) => setTimeout(resolve, 800)); // fake latency

  if (displayName.toLowerCase() === 'haze') {
    return { status: 'rejected', error: 'That display name is reserved.' };
  }

  const summary = [
    displayName || '(unnamed)',
    beta ? 'beta channel' : 'stable channel',
    `${priority} stars`,
    tags.length > 0 ? tags.join(', ') : 'no tags',
  ].join(' · ');
  return { status: 'saved', summary };
}
