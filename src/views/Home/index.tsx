import {css} from '@linaria/core';
import {Link} from '@native-router/react';

export default function Home() {
  return (
    <section
      className={css`
        text-align: center;
      `}
    >
      <header
        x-class={css`
          display: flex;
          justify-content: space-between;
        `}
      >
        <span>Ripple UI</span>
        <nav>
          <ul>
            <li>
              <Link to='/components'>Components</Link>
            </li>
          </ul>
        </nav>
      </header>
      <h1>Welcome to Ripple UI.</h1>
      <div
        x-class={css`
          display: flex;
        `}
      >
        <div />
      </div>
    </section>
  );
}
