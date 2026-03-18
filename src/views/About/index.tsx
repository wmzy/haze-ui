import {page, intro} from '@/views/ComponentDetail/styles';

export default function About() {
  return (
    <div className={page}>
      <h1>About</h1>
      <p className={intro}>
        Haze UI is a lightweight React component library built with Linaria and design tokens,
        following Open UI standards for accessibility and consistency.
      </p>
    </div>
  );
}
