import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ChevronsDown } from 'lucide-react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../lib/gsap.js';
import { bgState } from '../lib/bgState.js';
import { useLang } from '../hooks/useLang.jsx';

/**
 * Gerbang "PROJECT": tulisan besar yang di-zoom MENEMBUS lubang huruf O saat di-scroll (GSAP ScrollTrigger, pin),
 * seperti pindah halaman. Di dalam lubang O latar sudah berubah menjadi contour line; setelah lubang memenuhi layar,
 * kartu judul "Proyek" muncul zoom-out sebagai halaman baru. Huruf O digambar sebagai cincin SVG supaya pusat dan
 * radius lubangnya pasti (tidak bergantung font). Posisi lubang dikirim ke latar WebGL lewat bgState.
 */

// Tata letak dalam satuan viewBox. R = radius luar cincin, IN = radius dalam, HOLE = radius lubang yang terlihat.
const R = 146;
const IN = 50;
const HOLE = 44;
const LAYOUT = {
  wide: { vbW: 2080, vbH: 520, base: 400, pr: [20, 640], cx: 836, cy: 260, ject: [1012, 1040], ject2: null },
  narrow: { vbW: 1100, vbH: 900, base: 330, pr: [20, 640], cx: 836, cy: 190, ject: [20, 1040], ject2: 760 }
};
const FONT = "'Archivo Black', 'Arial Black', Impact, sans-serif";

function useMedia(query) {
  const [match, setMatch] = useState(() => typeof window !== 'undefined' && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setMatch(mq.matches);
    mq.addEventListener('change', on);
    on();
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return match;
}

export default function ProjectGate() {
  const { t } = useLang();
  const narrow = useMedia('(max-width: 760px)');
  const reduce = useMemo(prefersReducedMotion, []);
  const L = narrow ? LAYOUT.narrow : LAYOUT.wide;
  const root = useRef(null);
  const svgRef = useRef(null);

  useLayoutEffect(() => {
    const el = root.current;
    const svg = svgRef.current;
    const zoom = el.querySelector('.gate__zoom');
    const hole = el.querySelector('.gate__hole');
    const card = el.querySelector('.gate__card');
    const fades = el.querySelectorAll('.gate__shadow, .gate__hint');
    const origin = `${L.cx} ${L.cy}`;
    let sendHole = null;

    const ctx = gsap.context(() => {
      // ---- Mode reduced-motion: tanpa pin dan zoom, hanya ganti latar saat gerbang dilewati
      if (reduce) {
        gsap.set(card, { opacity: 1 });
        ScrollTrigger.create({
          trigger: el,
          start: 'top 40%',
          onEnter: () => (bgState.contourAll = 1),
          onLeaveBack: () => (bgState.contourAll = 0)
        });
        return;
      }

      // ---- Mode normal: zoom menembus huruf O
      const state = { z: 0 };
      let sEnd = 40;
      gsap.set(zoom, { svgOrigin: origin });

      const measure = () => {
        const k = svg.getBoundingClientRect().width / L.vbW; // px per satuan viewBox
        const holePx = HOLE * k;
        // skala akhir: lubang harus menutup seluruh diagonal layar
        sEnd = Math.max(8, (1.25 * Math.hypot(window.innerWidth, window.innerHeight)) / 2 / holePx);
      };
      const apply = () => {
        const s = Math.pow(sEnd, state.z); // zoom eksponensial = kecepatan zoom terasa konstan
        gsap.set(zoom, { scale: s, rotation: -12 * state.z, svgOrigin: origin });
        bgState.contourAll = state.z >= 0.999 ? 1 : 0;
      };

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: '+=280%',
          pin: true,
          scrub: 0.5,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          onRefresh: () => {
            measure();
            apply();
          }
        }
      });
      tl.to(state, { z: 1, duration: 0.62, ease: 'power1.in', onUpdate: apply }, 0)
        .to(fades, { opacity: 0, duration: 0.06 }, 0)
        .to(zoom, { opacity: 0, duration: 0.03 }, 0.6)
        .fromTo(card, { scale: 1.8, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'power3.out' }, 0.58)
        .to({}, { duration: 0.02 }, 0.98);

      // Kirim posisi lubang O ke latar WebGL setiap frame (hanya saat gerbang terlihat)
      sendHole = () => {
        const r = el.getBoundingClientRect();
        if (r.bottom < -80 || r.top > window.innerHeight + 80) {
          bgState.holeR = 0;
          return;
        }
        const h = hole.getBoundingClientRect();
        bgState.holeX = h.left + h.width / 2;
        bgState.holeY = h.top + h.height / 2;
        bgState.holeR = h.width / 2;
      };
      gsap.ticker.add(sendHole);
    }, el);

    return () => {
      if (sendHole) gsap.ticker.remove(sendHole);
      ctx.revert();
      bgState.holeR = 0;
      bgState.contourAll = 0;
    };
  }, [L, reduce]);

  const ringPath =
    `M ${L.cx - R} ${L.cy} a ${R} ${R} 0 1 0 ${2 * R} 0 a ${R} ${R} 0 1 0 ${-2 * R} 0 Z ` +
    `M ${L.cx - IN} ${L.cy} a ${IN} ${IN} 0 1 0 ${2 * IN} 0 a ${IN} ${IN} 0 1 0 ${-2 * IN} 0 Z`;
  const shape = { fill: 'var(--gf)', stroke: 'var(--gs)', strokeWidth: 14, paintOrder: 'stroke fill', strokeLinejoin: 'round' };
  const text = { fontFamily: FONT, fontSize: 400, ...shape };

  return (
    <section
      id="projects"
      ref={root}
      className={`gate ${reduce ? 'gate--static' : ''}`}
      aria-labelledby="projects-title"
    >
      <div className="gate__stage">
        <svg
          ref={svgRef}
          className="gate__svg"
          viewBox={`0 0 ${L.vbW} ${L.vbH}`}
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <g id="gate-shapes">
              <text x={L.pr[0]} y={L.base} textLength={L.pr[1]} lengthAdjust="spacingAndGlyphs" style={text}>
                PR
              </text>
              <path d={ringPath} fillRule="evenodd" style={{ ...shape, strokeWidth: 12 }} />
              <text
                x={L.ject[0]}
                y={L.ject2 ?? L.base}
                textLength={L.ject[1]}
                lengthAdjust="spacingAndGlyphs"
                style={text}
              >
                JECT
              </text>
            </g>
          </defs>
          <g className="gate__zoom">
            <use className="gate__shadow" href="#gate-shapes" x="18" y="18" style={{ '--gf': '#000', '--gs': '#000' }} />
            <use href="#gate-shapes" style={{ '--gf': 'var(--yellow)', '--gs': '#000' }} />
            <circle className="gate__hole" cx={L.cx} cy={L.cy} r={HOLE} fill="none" stroke="none" />
          </g>
        </svg>

        <div className="gate__card">
          <h2 id="projects-title" className="gate__title bg-mint on-accent">
            {t('projects.title')}
          </h2>
          <p className="chip gate__lead">{t('projects.lead')}</p>
        </div>

        <p className="gate__hint chip" aria-hidden="true">
          <ChevronsDown size={18} /> {t('gate.scroll')}
        </p>
      </div>
    </section>
  );
}
