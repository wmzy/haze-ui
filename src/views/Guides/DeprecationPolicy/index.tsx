import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Deprecation policy page: the release lifecycle for deprecated props
 * and aliases (dev warning, two-minor grace, major-version removal with
 * codemods, how to silence). Pure prose, tables and code — no
 * interactive pieces, so no slots and no ui strings; the whole body
 * lives in ../guide-content. Sidebar label: t.guides.deprecationPolicy.
 */

export default function DeprecationPolicyGuide() {
  const doc = useGuideDoc('deprecationPolicy');

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView doc={doc} />
    </div>
  );
}
