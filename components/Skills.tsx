import { certificates, toolkit } from '@/lib/content';
import SceneHead from './SceneHead';
import s from './Skills.module.css';

export default function Skills() {
  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <SceneHead id="skills" title="Skills and tools.">
        The languages, frameworks and tools I use in production, grouped by discipline.
      </SceneHead>

      <dl className={`wrap ${s.table}`}>
        {toolkit.map((g) => (
          <div key={g.group} className={s.row}>
            <dt className={s.group}>{g.group}</dt>
            <dd>
              <ul className="chips">
                {g.items.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </dd>
          </div>
        ))}
        <div className={s.row}>
          <dt className={s.group}>Certificates</dt>
          <dd>
            <ul className="chips">
              {certificates.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>
          </dd>
        </div>
      </dl>
    </section>
  );
}
