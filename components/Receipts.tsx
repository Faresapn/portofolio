import { certificates } from '@/lib/content';
import s from './Receipts.module.css';

// The one block a recruiter can read in ten seconds. Every line comes from the CV
// or a live dashboard.
const COLUMNS: { title: string; items: { strong: string; rest: string }[] }[] = [
  {
    title: 'Worked at',
    items: [
      { strong: 'Kerja Web3', rest: 'AI & Frontend Engineer, 2026 – today' },
      { strong: 'Klik Dokter', rest: 'Android Developer, 2021' },
      { strong: 'Agree (Telkom Indonesia)', rest: 'Android Developer, 2020 – 2021' },
    ],
  },
  {
    title: 'Shipped',
    items: [
      { strong: '5 AI agents', rest: 'deployed at Kerja Web3' },
      { strong: '12.2M views', rest: 'across 20+ Threads accounts run by Threads CMS' },
      { strong: '6 live websites', rest: 'including a paid subscription product' },
    ],
  },
  {
    title: 'Studied',
    items: [
      { strong: 'Bachelor of Informatics', rest: 'Universitas Teknologi Yogyakarta, GPA 3.54' },
      { strong: 'Published paper', rest: 'E-Commerce AR, in JINTEKS' },
      { strong: `${certificates.length} certificates`, rest: 'in AI, Python, ML and deep learning' },
    ],
  },
];

export default function Receipts() {
  return (
    <section className={s.section} aria-labelledby="receipts-title">
      <div className="wrap">
        <div className={s.card}>
          <div className={s.head}>
            <h2 id="receipts-title" className={s.title}>
              At a glance.
            </h2>
            <p className={s.note}>A summary of my resume.</p>
          </div>

          <div className={s.body}>
            <div className={s.big}>
              <span className={s.num}>2020</span>
              <span className={s.numLabel}>writing production code since</span>
            </div>
            {COLUMNS.map((c) => (
              <div key={c.title} className={s.col}>
                <h3 className={s.colTitle}>{c.title}</h3>
                <ul>
                  {c.items.map((it) => (
                    <li key={it.strong}>
                      <strong className="mark">{it.strong}</strong>
                      <span>{it.rest}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
