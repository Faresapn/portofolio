'use client';

import { SCENES } from '@/lib/scenes';
import { scrollToTarget } from '@/lib/scroll';
import s from './Scenes.module.css';


const TOOLS = ['Python', 'LLM integration', 'n8n', 'MCP', 'React', 'Next.js', 'TypeScript', 'GSAP', 'Three.js', 'Kotlin', 'React Native', 'Flutter', 'Higgsfield', 'Seedance', 'Kling', 'Veo 3.1', 'Remotion', 'Docker'];

export default function Scenes() {
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(`#${id}`, { offset: -80, duration: 1.4 });
  };

  return (
    <section className={s.section} aria-labelledby="scenes-title">
      <div className="wrap">
        <h2 id="scenes-title" className={s.title}>
          What’s on this page.
        </h2>
        <p className={s.sub}>Jump to a section, or scroll through in order.</p>

        <ol className={s.cards}>
          {SCENES.map((sc, i) => (
            <li key={sc.id} style={{ ['--i' as string]: i }}>
              <a href={`#${sc.id}`} onClick={go(sc.id)} className={`${s.card} ${sc.id === 'contact' ? s.last : ''}`}>
                <span className={s.no}>{sc.no}</span>
                <span className={s.name}>{sc.title}</span>
                <span className={s.hint}>{sc.hint}</span>
              </a>
            </li>
          ))}
        </ol>
      </div>

      <div className={s.marquee} aria-label={`Tools: ${TOOLS.join(', ')}`}>
        <div className={s.track} aria-hidden>
          {[0, 1].map((k) => (
            <ul key={k}>
              {TOOLS.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}
