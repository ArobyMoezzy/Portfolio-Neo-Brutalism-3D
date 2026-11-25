import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, useReducedMotion } from 'motion/react';
import { useLang } from '../hooks/useLang.jsx';
import { gsap, prefersReducedMotion } from '../lib/gsap.js';

/** Tombol neo-brutalist. Jika ada href dirender sebagai <a>, selain itu <button>. */
export function BrutalButton({ variant = 'yellow', size, href, className = '', children, ...rest }) {
  const cls = `btn btn--${variant} ${size ? `btn--${size}` : ''} ${className}`;
  if (href) {
    return (
      <a className={cls} href={href} {...rest}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={cls} {...rest}>
      {children}
    </button>
  );
}

/** Kartu dengan border tebal, hard shadow, dan rotasi kecil. */
export function BrutalCard({ as: Tag = 'div', color, rotate = 0, hoverable, className = '', style, children, ...rest }) {
  const cls = [
    'card',
    color ? `bg-${color} on-accent` : '',
    hoverable ? 'hoverable' : '',
    className
  ].join(' ');
  return (
    <Tag className={cls} style={{ transform: `rotate(${rotate}deg)`, ...style }} {...rest}>
      {children}
    </Tag>
  );
}

export function Sticker({ color = 'yellow', rotate = -4, className = '', style, children }) {
  return (
    <span className={`sticker bg-${color} ${className}`} style={{ transform: `rotate(${rotate}deg)`, ...style }}>
      {children}
    </span>
  );
}

export function Badge({ color = 'yellow', children }) {
  return <span className={`badge badge--${color}`}>{children}</span>;
}

/** Teks berjalan. Daftar item diduplikasi agar loop mulus. */
export function Marquee({ items, variant = '', reverse = false, speed = 28 }) {
  const row = [...items, ...items];
  return (
    <div
      className={`marquee ${variant ? `marquee--${variant}` : ''} ${reverse ? 'marquee--reverse' : ''}`}
      aria-hidden="true"
    >
      <div className="marquee__track" style={{ animationDuration: `${speed}s` }}>
        {[0, 1].map((k) => (
          <div key={k} style={{ display: 'flex' }}>
            {row.slice(0, items.length).map((it, i) => (
              <span className="marquee__item" key={`${k}-${i}`}>
                {it} <span className="marquee__sep">✦</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Modal dengan penutupan via Esc / klik overlay dan fokus otomatis. */
export function Modal({ open, onClose, title, children }) {
  const { t } = useLang();
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const prev = document.activeElement;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
      prev?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return createPortal(
    <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="card modal"
        role="dialog"
        aria-modal="true"
        aria-label={title}
        tabIndex={-1}
        ref={ref}
      >
        <BrutalButton variant="pink" size="sm" className="modal__close" onClick={onClose} aria-label={t('projects.close')}>
          ✕
        </BrutalButton>
        {children}
      </div>
    </div>,
    document.body
  );
}

/** Animasi muncul saat di-scroll (Framer Motion). */
export function Reveal({ children, delay = 0, x = 0, y = 40, className = '', ...rest }) {
  const reduce = useReducedMotion();
  if (reduce) return <div className={className} {...rest}>{children}</div>;
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay, ease: [0.2, 0.8, 0.2, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export function SectionTitle({ color = 'yellow', children, id }) {
  const ref = useRef(null);

  // Judul "terungkap" dengan clip-path saat di-scroll (GSAP ScrollTrigger)
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion()) return undefined;
    const tween = gsap.fromTo(
      el,
      { clipPath: 'inset(0 100% 0 0)', rotate: -6, y: 30 },
      {
        clipPath: 'inset(0 0% 0 0)',
        rotate: -1.5,
        y: 0,
        duration: 0.8,
        ease: 'power4.out',
        clearProps: 'clipPath',
        scrollTrigger: { trigger: el, start: 'top 90%', once: true }
      }
    );
    return () => {
      tween.scrollTrigger?.kill();
      tween.kill();
    };
  }, []);

  return (
    <h2 id={id} ref={ref} className={`section-title bg-${color} on-accent`}>
      {children}
    </h2>
  );
}

/** Kotak status untuk loading / error / kosong. */
export function StateBox({ loading, error, onRetry, empty, children }) {
  const { t } = useLang();
  if (loading) return <div className="state-box" role="status">{t('loadingShort')}</div>;
  if (error) {
    return (
      <div className="state-box" role="alert">
        <p>{children || error.message}</p>
        {onRetry && (
          <BrutalButton variant="pink" size="sm" onClick={onRetry}>
            {t('retry')}
          </BrutalButton>
        )}
      </div>
    );
  }
  if (empty) return <div className="state-box">{children}</div>;
  return null;
}
