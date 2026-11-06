import SmoothScroll from '@/components/SmoothScroll';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Work from '@/components/Work';
import Systems from '@/components/Systems';
import Reel from '@/components/Reel';
import Path from '@/components/Path';
import Toolkit from '@/components/Toolkit';
import Credits from '@/components/Credits';
import Scrubber from '@/components/Scrubber';
import Reveals from '@/components/Reveals';

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <a className="skip" href="#work">
        Skip to work
      </a>
      <Header />
      <main>
        <Hero />
        <About />
        <Work />
        <Systems />
        <Reel />
        <Path />
        <Toolkit />
        <Credits />
      </main>
      <Scrubber />
      <div className="grain" aria-hidden />
      <Reveals />
    </>
  );
}
