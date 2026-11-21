'use client';

import dynamic from 'next/dynamic';
import { profile } from '@/lib/content';
import { scrollToTarget } from '@/lib/scroll';
import s from './Intro.module.css';

// three.js only loads in the browser, after the page itself.
const DeskScene = dynamic(() => import('./DeskScene'), { ssr: false });

export default function Intro() {
  return (
    <section id="top" className={s.intro} aria-labelledby="intro-title">
      <div className={`wrap ${s.grid}`}>
        <div className={s.copy}>
          <p className={s.status}>
            <span className={s.dot} aria-hidden />
            Currently {profile.current}
          </p>

          <h1 id="intro-title" className={s.title}>
            AI engineer & AI video creator.
          </h1>

          <p className={s.name}>{profile.name}</p>
          <p className={s.lede}>I build AI agents, AI videos and websites. Based in Jakarta.</p>

          <div className={s.actions}>
            <a
              className="btn btn-primary"
              href="#work"
              onClick={(e) => (e.preventDefault(), scrollToTarget('#work', { offset: -80 }))}
            >
              See my work
            </a>
            <a className="btn btn-ghost" href={profile.cv} target="_blank" rel="noopener">
              Download resume (PDF)
            </a>
          </div>

          <p className={s.links}>
            <a href={`mailto:${profile.email}`}>{profile.email}</a>
            <a href={profile.linkedin} target="_blank" rel="noopener">
              LinkedIn
            </a>
            <a href={profile.github} target="_blank" rel="noopener">
              GitHub
            </a>
          </p>
        </div>

        <div className={s.sceneWrap}>
          <DeskScene className={s.scene} />
          <p className={s.hint} aria-hidden>
            ↔ Drag to turn
          </p>
        </div>
      </div>
    </section>
  );
}
