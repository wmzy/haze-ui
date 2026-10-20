import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Accessibility statement page. The whole body — including every measured
 * constant (re-measure commands in the header comment of guide-content.tsx)
 * and both contract tables — lives in ./guide-content as structured,
 * localizable content; this component is pure layout. Sidebar label:
 * t.guides.a11y.
 */

export default function A11yGuide() {
  const doc = useGuideDoc('a11y');

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView doc={doc} />
    </div>
  );
}
