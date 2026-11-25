import { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring } from 'motion/react';
import { useLang } from '../hooks/useLang.jsx';

/** Garis progres scroll tebal di bagian atas halaman. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.3 });
  return <motion.div className="scroll-progress" style={{ scaleX }} aria-hidden="true" />;
}

/** Kursor kotak tebal yang mengikuti mouse dan membesar saat di atas elemen interaktif. */
export function CustomCursor() {
  const ref = useRef(null);
  const [big, setBig] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return undefined;
    let raf = 0;
    let x = -100;
    let y = -100;
    const move = (e) => {
      x = e.clientX;
      y = e.clientY;
      setVisible(true);
      if (!raf) {
        raf = requestAnimationFrame(() => {
          if (ref.current) ref.current.style.transform = `translate(${x}px, ${y}px)`;
          raf = 0;
        });
      }
      setBig(!!e.target.closest?.('a, button, input, textarea, [role="button"], label'));
    };
    const leave = () => setVisible(false);
    window.addEventListener('mousemove', move);
    document.addEventListener('mouseleave', leave);
    return () => {
      window.removeEventListener('mousemove', move);
      document.removeEventListener('mouseleave', leave);
      cancelAnimationFrame(raf);
    };
  }, []);

  return <div ref={ref} className={`cursor ${big ? 'big' : ''} ${visible ? 'visible' : ''}`} aria-hidden="true" />;
}

/** Layar loading bergaya brutalism. */
export function LoadingScreen({ onDone }) {
  const { t } = useLang();
  useEffect(() => {
    const id = setTimeout(onDone, 1200);
    return () => clearTimeout(id);
  }, [onDone]);
  return (
    <div className="loader" role="status" aria-live="polite">
      <div>
        <h1>{t('loading')}</h1>
        <div className="loader__bar" aria-hidden="true">
          <div className="loader__fill" />
        </div>
      </div>
    </div>
  );
}

const WORDS = ['POW!', 'BAM!', 'THWIP!', 'ZAP!', 'WHAM!', 'KAPOW!'];
const COLORS = ['#FFE500', '#FF6B9D', '#4D9DE0', '#7AE582', '#FFB347'];

/** Easter egg: hujan sticker saat Konami code atau logo diklik 5x. */
export function StickerRain() {
  const [items, setItems] = useState([]);

  useEffect(() => {
    let timer;
    const trigger = () => {
      const batch = Array.from({ length: 32 }, (_, i) => ({
        id: `${Date.now()}-${i}`,
        word: WORDS[Math.floor(Math.random() * WORDS.length)],
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        left: Math.random() * 92,
        delay: Math.random() * 1.4,
        dur: 2.2 + Math.random() * 1.8,
        rot: Math.random() * 90 - 45
      }));
      setItems(batch);
      clearTimeout(timer);
      timer = setTimeout(() => setItems([]), 5200);
    };
    window.addEventListener('sticker-rain', trigger);
    return () => {
      window.removeEventListener('sticker-rain', trigger);
      clearTimeout(timer);
    };
  }, []);

  if (!items.length) return null;
  return (
    <div className="rain" aria-hidden="true">
      {items.map((s) => (
        <span
          key={s.id}
          className="rain__item"
          style={{
            left: `${s.left}%`,
            background: s.color,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
            '--rot': `${s.rot}deg`
          }}
        >
          {s.word}
        </span>
      ))}
    </div>
  );
}
