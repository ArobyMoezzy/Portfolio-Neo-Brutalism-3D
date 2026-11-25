import { lazy, Suspense, useEffect, useRef } from 'react';
import { Download, Mail } from 'lucide-react';
import { useLang } from '../hooks/useLang.jsx';
import { useTyping } from '../hooks/useTyping.js';
import { useIntroDone } from '../hooks/useIntro.js';
import { gsap, prefersReducedMotion } from '../lib/gsap.js';
import { CV_URL } from '../api.js';
import { BrutalButton, Sticker } from './ui.jsx';
import LiveBadge from './LiveBadge.jsx';
import ProfilePhoto from './ProfilePhoto.jsx';
import Magnet from './reactbits/Magnet.jsx';
import SplitText from './reactbits/SplitText.jsx';

// Three.js dimuat terpisah (lazy) supaya halaman tampil cepat
const HeroScene = lazy(() => import('./HeroScene.jsx'));

export default function Hero() {
  const { t, lang } = useLang();
  const role = useTyping(t('hero.roles'));
  const introDone = useIntroDone();
  const root = useRef(null);

  // Entrance sinematik (GSAP) begitu intro film selesai
  useEffect(() => {
    if (!introDone || prefersReducedMotion() || !root.current) return undefined;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '[data-enter]',
        { autoAlpha: 0, y: 60, rotateX: -35, transformPerspective: 700 },
        { autoAlpha: 1, y: 0, rotateX: 0, duration: 0.9, stagger: 0.12, ease: 'power4.out', clearProps: 'transform' }
      );
      gsap.fromTo(
        '.hero__name > span',
        { yPercent: 40, skewX: -12 },
        { yPercent: 0, skewX: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(2)', delay: 0.15 }
      );
    }, root);
    return () => ctx.revert();
  }, [introDone]);

  return (
    <section className="hero" aria-labelledby="hero-name" ref={root}>
      <Suspense fallback={null}>
        <HeroScene />
      </Suspense>
      <div className="container hero__grid">
        <div>
          <div data-enter style={{ display: 'inline-block' }}>
            <Sticker color="mint" rotate={-2} className="hero__greeting">
              {t('hero.greeting')}
            </Sticker>
          </div>

          <h1 id="hero-name" className="hero__name" data-enter>
            <span className="hl-white">FAJRUR</span> <span className="hl-yellow">ROBI</span>
            <br />
            <span className="hl-pink">SYA&apos;BANI</span>
          </h1>

          <p className="hero__role chip" aria-live="off" data-enter>
            &gt; {role}
            <span className="caret" aria-hidden="true" />
          </p>

          <div style={{ minHeight: '8.6em' }}>
            {introDone && (
              <div className="hero__tagline">
                <SplitText
                  key={lang}
                  tag="p"
                  text={t('hero.tagline')}
                  splitType="words"
                  textAlign="left"
                  trigger="load"
                  delay={35}
                  duration={0.9}
                  className="split-line"
                />
              </div>
            )}
          </div>

          <LiveBadge />

          <div className="hero__cta" data-enter>
            <Magnet padding={70} magnetStrength={3}>
              <BrutalButton variant="pink" href={CV_URL} download>
                <Download size={18} aria-hidden="true" /> {t('hero.cv')}
              </BrutalButton>
            </Magnet>
            <Magnet padding={70} magnetStrength={3}>
              <BrutalButton variant="blue" href="#contact">
                <Mail size={18} aria-hidden="true" /> {t('hero.contact')}
              </BrutalButton>
            </Magnet>
          </div>
        </div>

        <div data-enter>
          <ProfilePhoto />
        </div>
      </div>
    </section>
  );
}
