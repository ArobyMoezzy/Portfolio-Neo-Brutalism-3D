import { useCallback, useRef, useState } from 'react';
import profile from '../assets/profile.jpg';
import spidey from '../assets/profile-spidey.jpg';
import { useLang } from '../hooks/useLang.jsx';

/**
 * Foto profil "Spider-Man mode" dengan frame 3D.
 * Dua gambar bertumpuk: foto asli di bawah, foto Spider-Man di atas (di-reveal dengan clip-path).
 * - Desktop: aktif saat hover (pointer mouse) atau fokus keyboard
 * - Mobile/touch: aktif/nonaktif saat di-tap
 * - Frame miring 3D (perspective) + dua lapisan "kedalaman" di belakang, mengikuti cursor
 */
export default function ProfilePhoto() {
  const { t } = useLang();
  const [active, setActive] = useState(false);
  const [glitch, setGlitch] = useState(false);
  const ref = useRef(null);
  const tiltRef = useRef(null);
  const glitchTimer = useRef(null);
  const isTouch = useRef(false);

  const set = useCallback((next) => {
    setActive((prev) => {
      if (prev !== next) {
        setGlitch(true);
        clearTimeout(glitchTimer.current);
        glitchTimer.current = setTimeout(() => setGlitch(false), 420);
      }
      return next;
    });
  }, []);

  const resetTilt = () => {
    ref.current?.style.setProperty('--px', 0);
    ref.current?.style.setProperty('--py', 0);
    tiltRef.current?.style.setProperty('--rx', '0deg');
    tiltRef.current?.style.setProperty('--ry', '0deg');
  };

  const onPointerEnter = (e) => {
    isTouch.current = e.pointerType !== 'mouse';
    if (!isTouch.current) set(true);
  };
  const onPointerLeave = (e) => {
    if (e.pointerType === 'mouse') {
      set(false);
      resetTilt();
    }
  };
  const onPointerMove = (e) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ref.current.style.setProperty('--px', px * -2);
    ref.current.style.setProperty('--py', py * -2);
    tiltRef.current?.style.setProperty('--ry', `${px * 18}deg`);
    tiltRef.current?.style.setProperty('--rx', `${-py * 18}deg`);
  };
  const onClick = () => {
    if (isTouch.current) set(!active);
  };
  const onPointerDown = (e) => {
    isTouch.current = e.pointerType !== 'mouse';
  };
  const onKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      set(!active);
    }
  };

  return (
    <div className={`photo-wrap photo-3d ${active ? 'active' : ''}`}>
      <div className="photo-tilt" ref={tiltRef}>
        <span className="photo-depth photo-depth--2" aria-hidden="true" />
        <span className="photo-depth" aria-hidden="true" />

        <div
          ref={ref}
          className={`photo ${active ? 'active' : ''} ${glitch ? 'glitch' : ''}`}
          role="button"
          tabIndex={0}
          aria-pressed={active}
          aria-label={t('hero.photoLabel')}
          onPointerEnter={onPointerEnter}
          onPointerLeave={onPointerLeave}
          onPointerMove={onPointerMove}
          onPointerDown={onPointerDown}
          onClick={onClick}
          onKeyDown={onKeyDown}
          onFocus={(e) => e.target === e.currentTarget && !isTouch.current && set(true)}
          onBlur={() => !isTouch.current && set(false)}
        >
          <img
            className="photo__img"
            src={profile}
            alt={t('hero.photoAlt')}
            width="900"
            height="900"
            decoding="async"
            draggable="false"
          />
          <img
            className="photo__img photo__spidey"
            src={spidey}
            alt={active ? t('hero.photoAltSpidey') : ''}
            aria-hidden={!active}
            width="900"
            height="900"
            decoding="async"
            draggable="false"
          />
          <div className="photo__halftone" aria-hidden="true" />
          <div className="photo__lines" aria-hidden="true" />

          {/* Jaring laba-laba di pojok kanan atas */}
          <svg className="photo__web" viewBox="0 0 100 100" fill="none" stroke="#fff" strokeWidth="1.6" aria-hidden="true">
            <path d="M100 0 L0 0" />
            <path d="M100 0 L0 30" />
            <path d="M100 0 L0 62" />
            <path d="M100 0 L22 100" />
            <path d="M100 0 L58 100" />
            <path d="M100 0 L100 100" />
            <path d="M70 0 Q64 12 76 28 Q86 38 100 36" />
            <path d="M42 0 Q40 24 58 44 Q74 60 100 62" />
            <path d="M14 0 Q14 38 40 66 Q64 90 100 90" />
          </svg>
        </div>

        <span className="sticker bg-yellow photo__thwip" aria-hidden="true">
          THWIP!
        </span>
        <span className="photo__hint photo__hint--hover" aria-hidden="true">
          {t('hero.hintHover')}
        </span>
        <span className="photo__hint photo__hint--touch" aria-hidden="true">
          {t('hero.hintTouch')}
        </span>
      </div>
    </div>
  );
}
