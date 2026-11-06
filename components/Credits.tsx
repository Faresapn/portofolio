'use client';

import { profile } from '@/lib/content';
import { scrollToTarget } from '@/lib/scroll';
import s from './Credits.module.css';

const COLOPHON: [string, string][] = [
  ['Designed & built by', profile.name],
  ['Built with', 'Next.js · GSAP · Lenis'],
  ['Typefaces', 'Schibsted Grotesk · Newsreader · IBM Plex Mono'],
  ['Project previews', 'Screen recordings of the live sites and dashboards'],
  ['AI videos', 'Generated and directed by me'],
];

export default function Credits() {

  return (
    <section
      id="contact"
      className={`${s.credits} ground-signal`}
      data-chapter="Contact"
      data-tone="light"
      aria-labelledby="contact-title"
    >
      <div className={s.top}>
        <p className="sec-index label">
          <span>07 — Contact</span>
          <span>Jakarta · UTC+7</span>
        </p>
        <h2 id="contact-title" className={s.ask} data-split>
          Have an AI agent, an AI video or a website in mind?
        </h2>
        <p className={s.sub} data-reveal>
          Tell me what you’re building. Email is the fastest way to reach me.
        </p>
      </div>

      <div className={s.mailRow}>
        <a className={s.mail} href={`mailto:${profile.email}`}>
          {profile.email.split('@')[0]}@
          <wbr />
          {profile.email.split('@')[1]}
        </a>
        <a className={s.sendBtn} href={`mailto:${profile.email}`}>
          <span>Send Email</span>
          <span aria-hidden>→</span>
        </a>
      </div>

      <ul className={s.links}>
        <li>
          <a className={s.linkCard} href={profile.linkedin} target="_blank" rel="noopener">
            <span className={s.linkName}>LinkedIn</span>
            <span className={s.linkArrow} aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a className={s.linkCard} href={profile.github} target="_blank" rel="noopener">
            <span className={s.linkName}>GitHub</span>
            <span className={s.linkArrow} aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a className={s.linkCard} href={profile.cv} target="_blank" rel="noopener">
            <span className={s.linkName}>Resume</span>
            <span className={s.linkArrow} aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a className={s.linkCard} href={profile.paper} target="_blank" rel="noopener">
            <span className={s.linkName}>Research paper</span>
            <span className={s.linkArrow} aria-hidden>↗</span>
          </a>
        </li>
      </ul>

      <div className={s.colophon} data-reveal>
        <p className="label">Colophon</p>
        <dl className={s.roll}>
          {COLOPHON.map(([role, who]) => (
            <div key={role}>
              <dt>{role}</dt>
              <dd>{who}</dd>
            </div>
          ))}
        </dl>
      </div>

      <footer className={s.end}>
        <span className="label">© 2026 {profile.name}</span>
        <button type="button" className={s.rewind} onClick={() => scrollToTarget(0, { duration: 2.4 })}>
          Back to top <span aria-hidden>↑</span>
        </button>
        <span className={`label ${s.keys}`}>
          Tip: press <kbd>J</kbd> <kbd>K</kbd> <kbd>L</kbd> to auto-scroll
        </span>
      </footer>
    </section>
  );
}
