import { useRef } from 'react';

/**
 * Efek tilt 3D (perspective) yang mengikuti posisi mouse, lengkap dengan kilau (glare).
 * Hanya aktif untuk mouse; di layar sentuh dan untuk reduced motion tidak ada tilt.
 */
export default function Tilt({ children, max = 9, glare = true, className = '', style }) {
  const ref = useRef(null);

  const move = (e) => {
    if (e.pointerType !== 'mouse' || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    const s = ref.current.style;
    s.setProperty('--ry', `${(px - 0.5) * 2 * max}deg`);
    s.setProperty('--rx', `${-(py - 0.5) * 2 * max}deg`);
    s.setProperty('--gx', `${px * 100}%`);
    s.setProperty('--gy', `${py * 100}%`);
  };
  const leave = () => {
    const s = ref.current?.style;
    if (!s) return;
    s.setProperty('--rx', '0deg');
    s.setProperty('--ry', '0deg');
  };

  return (
    <div ref={ref} className={`tilt ${className}`} style={style} onPointerMove={move} onPointerLeave={leave}>
      <div className="tilt__inner">
        {children}
        {glare && <span className="tilt__glare" aria-hidden="true" />}
      </div>
    </div>
  );
}
