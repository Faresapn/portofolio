'use client';

import { useRef, useState } from 'react';
import { profile } from '@/lib/content';
import { scrollToTarget } from '@/lib/scroll';
import s from './Credits.module.css';

const COLOPHON: [string, string][] = [
  ['Designed & built by', profile.name],
  ['Built with', 'Next.js · GSAP · Lenis'],
  ['Typefaces', 'Schibsted Grotesk · Newsreader · IBM Plex Mono'],
  ['Project previews', 'Screen recordings of the live sites'],
];

export default function Credits() {
  const [copied, setCopied] = useState(false);
  const timer = useRef<number | undefined>(undefined);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(profile.email);
      setCopied(true);
      window.clearTimeout(timer.current);
      timer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      window.location.href = `mailto:${profile.email}`;
    }
  };

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
          <span>06 — Contact</span>
          <span>Jakarta · UTC+7</span>
        </p>
        <h2 id="contact-title" className={s.ask} data-split>
          Have an AI agent, an automation or a website in mind?
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
        <button type="button" className={s.copy} onClick={copy}>
          <span aria-live="polite">{copied ? 'Copied ✓' : 'Copy address'}</span>
        </button>
      </div>

      <ul className={s.links}>
        <li>
          <a className="link-arrow" href={profile.linkedin} target="_blank" rel="noopener">
            LinkedIn <span aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a className="link-arrow" href={profile.github} target="_blank" rel="noopener">
            GitHub <span aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a className="link-arrow" href={profile.cv} target="_blank" rel="noopener">
            Résumé (PDF) <span aria-hidden>↗</span>
          </a>
        </li>
        <li>
          <a className="link-arrow" href={profile.paper} target="_blank" rel="noopener">
            Research paper <span aria-hidden>↗</span>
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
