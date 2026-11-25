import { useEffect } from 'react';

const COLORS = ['#FFE500', '#FF6B9D', '#7AE582', '#FFFFFF'];

/**
 * Jejak kursor: kotak kecil neo brutalism muncul di belakang kursor lalu memudar.
 * Nonaktif di layar sentuh dan saat prefers-reduced-motion.
 */
export default function CursorTrail() {
  useEffect(() => {
    const fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (!fine || reduce) return undefined;

    let last = 0;
    let lastX = 0;
    let lastY = 0;
    let live = 0;
    const onMove = (e) => {
      const now = performance.now();
      const dist = Math.hypot(e.clientX - lastX, e.clientY - lastY);
      if (now - last < 45 || dist < 14 || live > 24 || document.documentElement.classList.contains('bg-dragging')) return;
      last = now;
      lastX = e.clientX;
      lastY = e.clientY;
      const size = 6 + Math.random() * 8;
      const n = document.createElement('i');
      n.className = 'trail-dot';
      n.style.cssText = `left:${e.clientX - size / 2}px;top:${e.clientY - size / 2}px;width:${size}px;height:${size}px;background:${
        COLORS[Math.floor(Math.random() * COLORS.length)]
      }`;
      document.body.appendChild(n);
      live += 1;
      const rot = (Math.random() - 0.5) * 120;
      const drift = (Math.random() - 0.5) * 30;
      const anim = n.animate(
        [
          { transform: 'translate(0,0) rotate(0deg) scale(1)', opacity: 1 },
          { transform: `translate(${drift}px, 22px) rotate(${rot}deg) scale(0.2)`, opacity: 0 }
        ],
        { duration: 650, easing: 'ease-out' }
      );
      anim.onfinish = () => {
        n.remove();
        live -= 1;
      };
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);
  return null;
}
