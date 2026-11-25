import { useEffect, useRef, useState } from 'react';
import { Film, SkipForward } from 'lucide-react';
import { gsap, SplitText, prefersReducedMotion } from '../lib/gsap.js';
import { markIntroDone, markIntroPlaying } from '../hooks/useIntro.js';
import { useLang } from '../hooks/useLang.jsx';
import { profile } from '../config.js';

const SEEN_KEY = 'intro-seen';

export const shouldPlayIntro = () => {
  try {
    return sessionStorage.getItem(SEEN_KEY) !== '1';
  } catch {
    return true;
  }
};

/**
 * Intro ala film (GSAP timeline):
 * 1. Film leader: hitung mundur 3-2-1 dengan butiran film, goresan, dan flicker
 * 2. Letterbox sinematik + title card ("PRESENTS" lalu judul besar)
 * 3. Tirai panel berwarna neo brutalism menyapu layar, lalu website terungkap
 * Bisa dilewati (tombol Skip, Esc, atau klik). Pengguna reduced motion hanya melihat fade singkat.
 */
export default function Intro({ onDone }) {
  const { t } = useLang();
  const root = useRef(null);
  const tlRef = useRef(null);
  const doneRef = useRef(false);
  const [num, setNum] = useState(3);

  useEffect(() => {
    markIntroPlaying();
    document.body.style.overflow = 'hidden';

    const finish = () => {
      if (doneRef.current) return;
      doneRef.current = true;
      try {
        sessionStorage.setItem(SEEN_KEY, '1');
      } catch {
        /* abaikan */
      }
      document.body.style.overflow = '';
      markIntroDone();
      onDone();
    };

    // Reduced motion: tampilkan fade sangat singkat saja
    if (prefersReducedMotion()) {
      const id = setTimeout(finish, 350);
      return () => {
        clearTimeout(id);
        document.body.style.overflow = '';
      };
    }

    const ctx = gsap.context(() => {
      const q = gsap.utils.selector(root);
      const split = SplitText.create(q('.intro__big')[0], { type: 'words,chars' });

      gsap.set(q('.t-presents, .t-name, .intro__big, .t-role'), { autoAlpha: 0 });
      gsap.set(q('.intro__bar'), { height: 0 });
      gsap.set(q('.intro__panel'), { yPercent: 101 });
      gsap.set(q('.intro__leader'), { autoAlpha: 1 });

      const tl = gsap.timeline({ onComplete: finish, defaults: { ease: 'power3.out' } });
      tlRef.current = tl;

      // ---- Akt 1: film leader 3 - 2 - 1 ----
      [3, 2, 1].forEach((n, i) => {
        tl.call(() => setNum(n), null, i * 0.8)
          .fromTo(q('.intro__num'), { scale: 1.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25 }, i * 0.8)
          .fromTo(q('.leader__sweep'), { rotation: -90 }, { rotation: 270, duration: 0.8, ease: 'none', svgOrigin: '200 200' }, i * 0.8)
          .fromTo(q('.leader__ring'), { scale: 0.92 }, { scale: 1, duration: 0.5, stagger: 0.05 }, i * 0.8)
          .to(q('.intro__flicker'), { opacity: 0.35, duration: 0.05, repeat: 5, yoyo: true, ease: 'none' }, i * 0.8);
      });
      tl.to(q('.intro__flash'), { opacity: 1, duration: 0.08 }, 2.4)
        .to(q('.intro__leader'), { autoAlpha: 0, duration: 0.01 }, 2.45)
        .to(q('.intro__flash'), { opacity: 0, duration: 0.35, ease: 'power2.out' }, 2.5)
        // ---- Akt 2: letterbox + title card ----
        .to(q('.intro__bar'), { height: '13vh', duration: 0.9, ease: 'power4.inOut' }, 2.55)
        .set(q('.t-presents'), { autoAlpha: 1 }, 3.0)
        .fromTo(q('.t-presents'), { letterSpacing: '0.1em', y: 10 }, { letterSpacing: '0.5em', y: 0, duration: 1.6, ease: 'power2.out' }, 3.0)
        .fromTo(q('.t-name'), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 3.0)
        .to(q('.t-presents, .t-name'), { autoAlpha: 0, duration: 0.5 }, 4.55)
        .set(q('.intro__big'), { autoAlpha: 1 }, 5.0)
        .from(split.chars, { yPercent: 110, rotationX: -80, autoAlpha: 0, stagger: 0.035, duration: 0.7, ease: 'back.out(1.6)' }, 5.0)
        .fromTo(q('.intro__title-wrap'), { scale: 1 }, { scale: 1.12, duration: 2.4, ease: 'none' }, 5.0)
        .fromTo(q('.t-role'), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.6 }, 5.7)
        // ---- Akt 3: tirai panel, lalu website terungkap ----
        .addLabel('curtain', 7.3)
        .to(q('.intro__panel'), { yPercent: 0, duration: 0.55, stagger: 0.08, ease: 'power3.inOut' }, 'curtain')
        .to(q('.intro__stage'), { autoAlpha: 0, duration: 0.01 }, 'curtain+=0.6')
        .to(root.current, { backgroundColor: 'transparent', duration: 0.01 }, 'curtain+=0.6')
        .call(markIntroDone, null, 'curtain+=0.72')
        .to(q('.intro__bar'), { height: 0, duration: 0.2 }, 'curtain+=0.6')
        .to(q('.intro__panel'), { yPercent: -101, duration: 0.6, stagger: 0.08, ease: 'power3.inOut' }, 'curtain+=0.75')
        .to(root.current, { autoAlpha: 0, duration: 0.01 }, 'curtain+=1.5');
    }, root);

    return () => {
      ctx.revert();
      document.body.style.overflow = '';
    };
  }, [onDone]);

  const skip = () => {
    const tl = tlRef.current;
    if (!tl) return;
    // Loncat ke tirai penutup agar transisi tetap mulus
    const target = tl.labels.curtain;
    if (tl.time() < target) tl.seek(target);
  };

  useEffect(() => {
    const onKey = (e) => (e.key === 'Escape' || e.key === 'Enter') && skip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="intro" ref={root} role="dialog" aria-label="Intro" onClick={skip}>
      <div className="intro__stage">
        <div className="intro__leader" aria-hidden="true">
          <svg className="leader__svg" viewBox="0 0 400 400">
            <g fill="none" stroke="#f3ecd8" strokeWidth="3">
              <circle className="leader__ring" cx="200" cy="200" r="170" />
              <circle className="leader__ring" cx="200" cy="200" r="120" />
              <path d="M200 10V390M10 200H390" strokeWidth="2" />
            </g>
            <g className="leader__sweep">
              <path d="M200 200 L200 30 A170 170 0 0 1 340 120 Z" fill="#f3ecd8" opacity="0.28" />
            </g>
          </svg>
          <div className="intro__num">{num}</div>
        </div>

        <div className="intro__title-wrap">
          <div className="t-card">
            <p className="t-presents">PRESENTS</p>
            <p className="t-name">{profile.name.toUpperCase()}</p>
          </div>
          <div className="t-card">
            <h1 className="intro__big">FULL STACK DEVELOPER</h1>
            <p className="t-role">
              <Film size={16} aria-hidden="true" /> {t('intro.tagline')}
            </p>
          </div>
        </div>

        <div className="intro__flicker" />
        <div className="intro__scratches" />
        <div className="intro__grain" />
        <div className="intro__vignette" />
        <div className="intro__flash" />
      </div>

      <div className="intro__bar intro__bar--top" />
      <div className="intro__bar intro__bar--bottom" />

      <div className="intro__panels" aria-hidden="true">
        <span className="intro__panel" style={{ background: '#FFE500' }} />
        <span className="intro__panel" style={{ background: '#FF6B9D' }} />
        <span className="intro__panel" style={{ background: '#4D9DE0' }} />
        <span className="intro__panel" style={{ background: '#7AE582' }} />
      </div>

      <button
        type="button"
        className="intro__skip"
        onClick={(e) => {
          e.stopPropagation();
          skip();
        }}
      >
        {t('intro.skip')} <SkipForward size={16} aria-hidden="true" />
      </button>
    </div>
  );
}
