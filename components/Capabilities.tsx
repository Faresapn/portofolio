import { about } from '@/lib/content';
import SceneHead from './SceneHead';
import s from './Capabilities.module.css';

export default function Capabilities() {
  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <SceneHead id="about" title="What I do.">
        I started as an Android developer in 2020, building Kotlin apps on clean architecture. Today my work covers four
        areas: AI agents and automation, frontend development, mobile apps and AI video. Outside work I hike mountains, ride my
        motorcycle, go fishing and play games.
      </SceneHead>

      <div className={`wrap ${s.grid}`}>
        {about.capabilities.map((c) => (
          <article key={c.title} className={s.card}>
            <p className={s.letter} aria-hidden>
              {c.no}
            </p>
            <h3 className={s.title}>{c.title}</h3>
            <p className={s.body}>{c.body}</p>
            <ul className="chips" aria-label="Main tools">
              {c.tools.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
