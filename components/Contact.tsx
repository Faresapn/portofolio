'use client';

import { profile } from '@/lib/content';
import { scrollToTarget } from '@/lib/scroll';
import s from './Contact.module.css';

const LINKS = [
  { label: 'LinkedIn', href: profile.linkedin },
  { label: 'GitHub', href: profile.github },
  { label: 'Resume (PDF)', href: profile.cv },
  { label: 'Research paper', href: profile.paper },
];

export default function Contact() {
  return (
    <section id="contact" className="section" aria-labelledby="contact-title">
      <div className="wrap">
        <div className={s.card}>
          <p className={`scene-chip ${s.chip}`}>
            <b>07</b>
            Contact
          </p>
          <h2 id="contact-title" className={s.title}>
            Have an AI agent, an AI video or a website in mind?
          </h2>
          <p className={s.sub}>
            Tell me about your project or the role you’re hiring for. Email is the fastest way to reach me. I’m based in
            Jakarta (UTC+7).
          </p>

          <div className={s.mailRow}>
            <a className={s.mail} href={`mailto:${profile.email}`}>
              {profile.email}
            </a>
            <a className={`btn ${s.send}`} href={`mailto:${profile.email}`}>
              Send an email
            </a>
          </div>

          <ul className={s.links}>
            {LINKS.map((l) => (
              <li key={l.label}>
                <a href={l.href} target="_blank" rel="noopener">
                  {l.label} <span aria-hidden>↗</span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <footer className={s.footer}>
          <span>
            © 2026 {profile.name}. Designed and built by me with Next.js. AI videos generated and directed by me.
          </span>
          <button type="button" onClick={() => scrollToTarget(0, { duration: 1.6 })}>
            Back to top ↑
          </button>
        </footer>
      </div>
    </section>
  );
}
