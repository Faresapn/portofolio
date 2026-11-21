import SmoothScroll from '@/components/SmoothScroll';
import Nav from '@/components/Nav';
import Intro from '@/components/Intro';
import Receipts from '@/components/Receipts';
import Scenes from '@/components/Scenes';
import Capabilities from '@/components/Capabilities';
import Projects from '@/components/Projects';
import AiSystems from '@/components/AiSystems';
import VideoReel from '@/components/VideoReel';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';

export default function Page() {
  return (
    <>
      <SmoothScroll />
      <a className="skip" href="#work">
        Skip to work
      </a>
      <Nav />
      <main>
        <Intro />
        <Receipts />
        <Scenes />
        <Capabilities />
        <Projects />
        <AiSystems />
        <VideoReel />
        <Experience />
        <Skills />
        <Contact />
      </main>
    </>
  );
}
