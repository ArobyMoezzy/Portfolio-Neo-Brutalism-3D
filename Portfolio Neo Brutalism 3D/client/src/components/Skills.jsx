import { motion, useReducedMotion } from 'motion/react';
import { useLang } from '../hooks/useLang.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { BrutalCard, Reveal, SectionTitle, StateBox } from './ui.jsx';
import { SkillLogo } from './techIcons.jsx';
import Tilt from './Tilt.jsx';

// Bar skill dibuat dari 10 blok tebal yang "menyala" satu per satu
function SkillBar({ level }) {
  const reduce = useReducedMotion();
  const filled = Math.round(level / 10);
  return (
    <div className="skill__bar" role="img" aria-label={`${level}%`}>
      {Array.from({ length: 10 }, (_, i) => (
        <motion.span
          key={i}
          className={`skill__block ${i < filled ? 'filled' : ''}`}
          initial={reduce ? false : { scaleY: 0 }}
          whileInView={{ scaleY: 1 }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, type: 'spring', stiffness: 300, damping: 18 }}
          style={{ originY: 1 }}
        />
      ))}
    </div>
  );
}

export default function Skills() {
  const { t } = useLang();
  const { data, loading, error, refetch } = useFetch('/skills');
  const colors = ['yellow', 'blue', 'mint', 'pink', 'orange'];

  return (
    <section id="skills" className="section" aria-labelledby="skills-title">
      <div className="container">
        <SectionTitle id="skills-title" color="blue">
          {t('skills.title')}
        </SectionTitle>
        <StateBox loading={loading} error={error} onRetry={refetch}>
          {t('skills.loadError')}
        </StateBox>
        <div className="skills__grid">
          {data?.map((s, i) => (
            <Reveal key={s.id} delay={(i % 4) * 0.06} className="fill">
              <Tilt>
                <BrutalCard color={colors[i % colors.length]} rotate={i % 2 ? 1 : -1} hoverable>
                  <div className="skill__head">
                    <span className="skill__name">
                      <span className="skill__icon">
                        <SkillLogo skill={s} />
                      </span>
                      {s.name}
                    </span>
                    <span>{s.level}%</span>
                  </div>
                  <SkillBar level={s.level} />
                </BrutalCard>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
