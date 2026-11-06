import { certificates, hue, profile, toolkit } from '@/lib/content';
import s from './Toolkit.module.css';

export default function Toolkit() {
  return (
    <section
      id="toolkit"
      className={`${s.toolkit} ground-paper`}
      data-chapter="Skills"
      data-tone="light"
      aria-labelledby="toolkit-title"
    >
      <header className="sec-head">
        <p className="sec-index label">
          <span>06 — Skills</span>
          <span>What I work with</span>
        </p>
        <h2 id="toolkit-title" className="sec-title" data-split>
          Skills <em>&amp;</em> tools
        </h2>
        <p className="sec-note" data-reveal>
          The languages, frameworks and tools I use in production, grouped by discipline.
        </p>
      </header>

      <div className="wrap">
        <dl className={s.rows}>
          {toolkit.map((g) => (
            <div key={g.group} className={s.row} style={hue(g.hue)} data-reveal>
              <dt>
                <i className={s.swatch} aria-hidden />
                <span className={s.group}>{g.group}</span>
              </dt>
              <dd>
                {g.items.map((item, k) => (
                  <span key={item}>
                    {k > 0 && (
                      <span className={s.sep} aria-hidden>
                        {' / '}
                      </span>
                    )}
                    <span className={s.item}>{item}</span>
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>

        <div className={s.creds}>
          <article className={s.cred} style={hue('blue')} data-reveal>
            <p className={s.credLabel}>Education</p>
            <h3 className={s.credTitle}>Bachelor of Informatics</h3>
            <p className={s.credSub}>Universitas Teknologi Yogyakarta</p>
            <p className={s.credMeta}>2021 — 2025 · GPA 3.54 / 4.00</p>
          </article>
          <article className={s.cred} style={hue('violet')} data-reveal>
            <p className={s.credLabel}>Certificates · Dicoding Indonesia</p>
            <ul className={s.certs}>
              {certificates.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </article>
          <article className={s.cred} style={hue('amber')} data-reveal>
            <p className={s.credLabel}>Publication</p>
            <h3 className={s.credTitle}>E-Commerce AR</h3>
            <p className={s.credSub}>An augmented-reality shopping app, published in the JINTEKS journal.</p>
            <a className={s.credLink} href={profile.paper} target="_blank" rel="noopener">
              Read the paper <span aria-hidden>↗</span>
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}
