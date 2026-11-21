import { clips, type Clip } from '@/lib/content';
import SceneHead from './SceneHead';
import s from './Experience.module.css';

const GROUPS: { title: string; tracks: Clip['track'][] }[] = [
  { title: 'Work experience', tracks: ['work'] },
  { title: 'Education & research', tracks: ['study', 'research'] },
];
// Side projects (the 'lab' track) are shown as projects in Scene 3, AI systems.

// Newest first, the way a resume reads.
const byNewest = (a: Clip, b: Clip) => (b.to ?? '9999').localeCompare(a.to ?? '9999') || b.from.localeCompare(a.from);

export default function Experience() {
  return (
    <section id="experience" className="section" aria-labelledby="experience-title">
      <SceneHead id="experience" title="Where I’ve worked and studied.">
        Android developer from 2020, AI & Frontend Engineer in 2026, with a degree and a published paper along the way.
      </SceneHead>

      <div className={`wrap ${s.groups}`}>
        {GROUPS.map((g) => (
          <div key={g.title} className={s.group}>
            <h3 className={s.groupTitle}>{g.title}</h3>
            <ol className={s.list}>
              {clips
                .filter((c) => g.tracks.includes(c.track))
                .sort(byNewest)
                .map((c) => (
                  <li key={c.id} className={s.row}>
                    <div className={s.when}>
                      <p className={s.date}>{c.when}</p>
                      <p className={s.where}>{c.where}</p>
                      {c.to === null && <p className={s.now}>Current role</p>}
                    </div>
                    <div className={s.what}>
                      <h4 className={s.role}>{c.title}</h4>
                      <p className={s.org}>{c.org}</p>
                      <ul className={s.points}>
                        {c.points.map((p) => (
                          <li key={p}>{p}</li>
                        ))}
                      </ul>
                      {c.link && (
                        <a className={s.link} href={c.link.href} target="_blank" rel="noopener">
                          {c.link.label} ↗
                        </a>
                      )}
                    </div>
                  </li>
                ))}
            </ol>
          </div>
        ))}
      </div>
    </section>
  );
}
