import { about, hue } from '@/lib/content';
import s from './About.module.css';

export default function About() {
  return (
    <section id="about" className={`${s.about} ground-ink`} data-chapter="About" data-tone="dark" aria-labelledby="about-title">
      <header className="sec-head">
        <p className="sec-index label">
          <span>01 — About</span>
          <span>Who I am</span>
        </p>
        <h2 id="about-title" className="sr-only">
          About Faresa
        </h2>
        {/* Faded in rather than line-split: the coloured phrases would break mid-sentence. */}
        <p className={s.intro} data-reveal>
          {about.intro.map((part, i) =>
            part.hue ? (
              <span key={i} className={s.mark} style={hue(part.hue)}>
                {part.text}
              </span>
            ) : (
              part.text
            ),
          )}
        </p>
      </header>

      <div className={`${s.cards} wrap`}>
        {about.capabilities.map((c) => (
          <article key={c.title} className={s.card} style={hue(c.hue)} data-reveal>
            <p className={s.cardNo}>
              <span>{c.no}</span>
              <span>What I do</span>
            </p>
            <h3 className={s.cardTitle}>{c.title}</h3>
            <p className={s.cardBody}>{c.body}</p>
            <ul className={s.tools} aria-label="Main tools">
              {c.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>

      <dl className={`${s.facts} wrap`}>
        {about.facts.map((f) => (
          <div key={f.label} className={s.fact} style={hue(f.hue)} data-reveal>
            <dt className="sr-only">{f.label}</dt>
            <dd>
              <span className={s.value}>{f.value}</span>
              <span className={s.factLabel}>{f.label}</span>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
