import { lazy, Suspense } from 'react';
import { useLang } from '../hooks/useLang.jsx';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import About from '../components/About.jsx';
import Skills from '../components/Skills.jsx';
import { Marquee } from '../components/ui.jsx';
import ScrollVelocity from '../components/reactbits/ScrollVelocity.jsx';

// Bagian di bawah layar pertama dimuat lazy supaya bundle awal ringan
const TechOrbit = lazy(() => import('../components/TechLogos.jsx'));
const ProjectGate = lazy(() => import('../components/ProjectGate.jsx'));
const Projects = lazy(() => import('../components/Projects.jsx'));
const Journey = lazy(() => import('../components/Journey.jsx'));
const Notes = lazy(() => import('../components/Notes.jsx'));
const Testimonials = lazy(() => import('../components/Testimonials.jsx'));
const Game = lazy(() => import('../components/Game.jsx'));
const Guestbook = lazy(() => import('../components/Guestbook.jsx'));
const Contact = lazy(() => import('../components/Contact.jsx'));
const Footer = lazy(() => import('../components/Footer.jsx'));

const SKILLS = ['React', 'Node.js', 'Express', 'JavaScript', 'SQL', 'MongoDB', 'REST API', 'Git', 'Vite', 'CSS'];

// Band teks yang kecepatannya mengikuti kecepatan scroll (ScrollVelocity dari React Bits)
function Band({ color, texts, velocity = 60 }) {
  return (
    <div className={`sv-band sv-band--${color}`} aria-hidden="true">
      <ScrollVelocity texts={texts} velocity={velocity} numCopies={6} parallaxClassName="parallax" scrollerClassName="sv-scroller" />
    </div>
  );
}

export default function Home() {
  const { t } = useLang();
  return (
    <>
      <a href="#main" className="skip-link">
        {t('skipLink')}
      </a>
      <Navbar />
      <main id="main">
        <Hero />
        <Marquee items={SKILLS} variant="" speed={26} />
        <About />
        <Skills />
        <Band color="yellow" texts={['THWIP! POW! BAM! ZAP! ', 'KAPOW! WHAM! THWIP! POW! ']} velocity={55} />
        <Suspense fallback={<div className="state-box container">{t('loadingShort')}</div>}>
          <TechOrbit />
          <ProjectGate />
          <Projects />
          <Band color="pink" texts={['FULL STACK ✦ REACT ✦ NODE ✦ ']} velocity={45} />
          <Journey />
          <Notes />
          <Testimonials />
          <Game />
          <Guestbook />
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
    </>
  );
}
