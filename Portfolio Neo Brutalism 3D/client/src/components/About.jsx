import { useLang } from '../hooks/useLang.jsx';
import { BrutalCard, Reveal, SectionTitle } from './ui.jsx';
import Stats from './Stats.jsx';

export default function About() {
  const { t } = useLang();
  const facts = t('about.facts');
  const tilts = [-2, 1.5, -1, 2, -1.5];

  return (
    <section id="about" className="section" aria-labelledby="about-title">
      <div className="container">
        <SectionTitle id="about-title" color="pink">
          {t('about.title')}
        </SectionTitle>
        <div className="about__grid">
          <Reveal x={-40} y={0} className="about__text">
            <BrutalCard rotate={-0.6}>
              <p>{t('about.p1')}</p>
              <p>{t('about.p2')}</p>
              <p style={{ marginBottom: 0 }}>{t('about.p3')}</p>
            </BrutalCard>
          </Reveal>

          <Reveal x={40} y={0}>
            <BrutalCard color="yellow" rotate={2} className="facts">
              <h3 className="facts__title">{t('about.factsTitle')}</h3>
              <ul>
                {facts.map((f, i) => (
                  <li key={f} style={{ transform: `rotate(${tilts[i % tilts.length] / 2}deg)` }}>
                    {f}
                  </li>
                ))}
              </ul>
            </BrutalCard>
          </Reveal>
        </div>
        <Stats />
      </div>
    </section>
  );
}
