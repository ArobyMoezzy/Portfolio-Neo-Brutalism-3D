import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useLang } from '../hooks/useLang.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { BrutalButton, BrutalCard, SectionTitle, StateBox } from './ui.jsx';

const COLORS = ['yellow', 'mint', 'pink', 'blue'];

// Carousel testimoni dengan tombol prev/next dan indikator
export default function Testimonials() {
  const { t, pick } = useLang();
  const reduce = useReducedMotion();
  const { data, loading, error, refetch } = useFetch('/testimonials');
  const [i, setI] = useState(0);
  const [dir, setDir] = useState(1);

  const go = (step) => {
    setDir(step);
    setI((cur) => (cur + step + data.length) % data.length);
  };
  const item = data?.[i];

  return (
    <section id="testimonials" className="section" aria-labelledby="testi-title">
      <div className="container">
        <SectionTitle id="testi-title" color="yellow">
          {t('testimonials.title')}
        </SectionTitle>
        <StateBox loading={loading} error={error} onRetry={refetch}>
          {t('testimonials.loadError')}
        </StateBox>

        {item && (
          <div className="testi" aria-roledescription="carousel">
            <div aria-live="polite">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={item.id}
                  initial={reduce ? false : { opacity: 0, x: 60 * dir, rotate: 2 * dir }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={reduce ? undefined : { opacity: 0, x: -60 * dir }}
                  transition={{ duration: 0.25 }}
                >
                  <BrutalCard color={COLORS[i % COLORS.length]} className="testi__card" style={{ '--sh': '10px' }}>
                    <p className="testi__quote">{pick(item, 'quote')}</p>
                    <p className="testi__who">{item.name}</p>
                    <p className="testi__role" style={{ marginBottom: 0 }}>{item.role}</p>
                  </BrutalCard>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="testi__nav">
              <BrutalButton variant="white" size="icon" className="btn--icon" onClick={() => go(-1)} aria-label={t('testimonials.prev')}>
                ←
              </BrutalButton>
              <div className="testi__dots">
                {data.map((d, k) => (
                  <button
                    key={d.id}
                    type="button"
                    className="dot"
                    aria-current={k === i}
                    aria-label={`${k + 1} / ${data.length}`}
                    onClick={() => {
                      setDir(k > i ? 1 : -1);
                      setI(k);
                    }}
                  />
                ))}
              </div>
              <BrutalButton variant="white" size="icon" className="btn--icon" onClick={() => go(1)} aria-label={t('testimonials.next')}>
                →
              </BrutalButton>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
