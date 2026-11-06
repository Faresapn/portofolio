'use client';

import { useEffect, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { profile } from '@/lib/content';
import { scrollToTarget } from '@/lib/scroll';
import s from './Header.module.css';

gsap.registerPlugin(ScrollTrigger);

export default function Header() {
  const [time, setTime] = useState('');
  const [tone, setTone] = useState<'dark' | 'light'>('dark');
  const [ground, setGround] = useState('rgb(11, 10, 8)');

  useEffect(() => {
    const fmt = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Jakarta',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  // Match the header to whichever section is passing underneath it.
  useEffect(() => {
    const sections = Array.from(document.querySelectorAll<HTMLElement>('section[data-tone]'));
    const triggers = sections.map((el) =>
      ScrollTrigger.create({
        trigger: el,
        start: 'top 40px',
        end: 'bottom 40px',
        onToggle: (self) => {
          if (!self.isActive) return;
          setTone(el.dataset.tone === 'light' ? 'light' : 'dark');
          setGround(getComputedStyle(el).backgroundColor);
        },
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  const jump = (target: string | number) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToTarget(target, { duration: 1.6 });
  };

  return (
    <header
      className={`${s.header} ${tone === 'light' ? s.light : ''}`}
      style={{ ['--ground' as string]: ground }}
      data-intro
    >
      <a href="#top" className={s.mark} onClick={jump(0)}>
        Faresa P. Nugroho
      </a>
      <p className={s.role}>{profile.role}</p>
      <nav className={s.nav} aria-label="Quick links">
        <a href={profile.cv} target="_blank" rel="noopener" className={s.cv}>
          Resume <span aria-hidden>↗</span>
        </a>
        <a href="#contact" onClick={jump('#contact')}>
          Contact
        </a>
      </nav>
      <p className={s.clock}>
        <span className={s.city}>Jakarta</span>
        <time suppressHydrationWarning>{time || '--:--:--'}</time>
        <span>WIB</span>
      </p>
    </header>
  );
}
