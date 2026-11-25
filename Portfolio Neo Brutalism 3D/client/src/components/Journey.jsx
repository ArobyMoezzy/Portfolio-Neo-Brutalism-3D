import { useLang } from '../hooks/useLang.jsx';
import { BrutalCard, Reveal, SectionTitle } from './ui.jsx';

const COLORS = ['yellow', 'pink', 'mint'];
const TILTS = [-2, 1.5, -1];

// Timeline bergaya sticky note. Isi teks ada di i18n/translations.js (bagian "journey").
export default function Journey() {
  const { t } = useLang();
  const items = t('journey.items');

  return (
    <section id="journey" className="section" aria-labelledby="journey-title">
      <div className="container">
        <SectionTitle id="journey-title" color="orange">
          {t('journey.title')}
        </SectionTitle>
        <ol className="journey__grid" style={{ listStyle: 'none', padding: 0, margin: 0 }}>
          {items.map((it, i) => (
            <li key={it.title}>
              <Reveal delay={i * 0.1}>
                <BrutalCard color={COLORS[i % 3]} rotate={TILTS[i % 3]} className="note" hoverable>
                  <span className="note__period">{it.period}</span>
                  <h3>{it.title}</h3>
                  <p className="note__place">{it.place}</p>
                  <p style={{ marginBottom: 0 }}>{it.text}</p>
                </BrutalCard>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
