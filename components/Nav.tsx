'use client';

import { useEffect, useState } from 'react';
import { profile } from '@/lib/content';
import { scrollToTarget } from '@/lib/scroll';
import s from './Nav.module.css';

const LINKS = [
  { href: '#about', label: 'About' },
  { href: '#work', label: 'Work' },
  { href: '#systems', label: 'AI systems' },
  { href: '#reel', label: 'AI video' },
  { href: '#experience', label: 'Experience' },
  { href: '#skills', label: 'Skills' },
];

type Theme = 'light' | 'dark';

export default function Nav() {
  const [theme, setTheme] = useState<Theme | null>(null);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    setTheme(document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light');
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem('theme', next);
    } catch {}
    setTheme(next);
  };

  const jump = (target: string | number) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(target, { duration: 1.2, offset: typeof target === 'number' ? 0 : -80 });
  };

  return (
    <header className={`${s.nav} ${scrolled ? s.scrolled : ''}`}>
      <div className={s.inner}>
        <a href="#top" className={s.brand} onClick={jump(0)}>
          <span className={s.badge} aria-hidden>
            F
          </span>
          <span className={s.name}>Faresa P.N</span>
        </a>

        <nav className={s.links} aria-label="Sections">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={jump(l.href)}>
              {l.label}
            </a>
          ))}
        </nav>

        <div className={s.actions}>
          <button
            type="button"
            className={s.theme}
            onClick={toggle}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
          >
            <span className={s.track} data-on={theme === 'dark'} aria-hidden>
              <span className={s.knob}>{theme === 'dark' ? '☾' : '☀'}</span>
            </span>
          </button>
          <a className={`btn btn-ghost ${s.cv}`} href={profile.cv} target="_blank" rel="noopener">
            Resume
          </a>
          <a className={`btn btn-primary ${s.cta}`} href="#contact" onClick={jump('#contact')}>
            Contact me
          </a>
        </div>
      </div>
    </header>
  );
}
