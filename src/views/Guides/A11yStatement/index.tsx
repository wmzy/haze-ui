import { page } from '@/views/ComponentDetail/styles';
import { GuideDocView, useGuideDoc } from '@/views/Guides/guide-content';

/*
 * Accessibility conformance report (ACR) page: the WCAG 2.2 A/AA
 * criterion tables, the assistive-technology matrix and the known
 * limitations all live in ./guide-content as structured, localizable
 * content — including every measured constant (re-measure commands in
 * the header comment of guide-content.tsx). This component is pure
 * layout. Sidebar label: t.guides.a11yStatement.
 */

export default function A11yStatementGuide() {
  const doc = useGuideDoc('a11yStatement');

  return (
    <div className={page}>
      <h1>{doc.title}</h1>
      <GuideDocView doc={doc} />
    </div>
  );
}
