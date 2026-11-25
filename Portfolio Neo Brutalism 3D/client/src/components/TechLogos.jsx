import { useLang } from '../hooks/useLang.jsx';
import { techStack } from '../config.js';
import { LogoLoop } from './reactbits/LogoLoop.jsx';
import { TECH } from './techIcons.jsx';
import { Reveal, SectionTitle } from './ui.jsx';

const tile = (id) => {
  const { Icon, color, name } = TECH[id];
  return {
    node: (
      <span className="tech-tile" style={{ color: color || 'var(--ink)' }}>
        <Icon />
      </span>
    ),
    title: name,
    ariaLabel: name
  };
};

/** Cincin logo teknologi 3D (LogoLoop layout "orbit" dari React Bits) + baris logo berjalan. */
export default function TechOrbit() {
  const { t } = useLang();
  const logos = techStack.map(tile);

  return (
    <section id="tech" className="section tech" aria-labelledby="tech-title">
      <div className="container">
        <SectionTitle id="tech-title" color="yellow">
          {t('tech.title')}
        </SectionTitle>
        <p className="tech__hint chip">{t('tech.hint')}</p>
      </div>
      <Reveal className="tech__orbit">
        <LogoLoop
          logos={logos}
          layout="orbit"
          speed={60}
          logoHeight={56}
          gap={40}
          labels="hover"
          fadeOut={false}
          draggable
          ariaLabel={t('tech.title')}
        />
      </Reveal>
      <div className="tech__line">
        <LogoLoop
          logos={logos}
          speed={70}
          direction="right"
          logoHeight={40}
          gap={28}
          fadeOut
          pauseOnHover
          ariaLabel={t('tech.title')}
        />
      </div>
    </section>
  );
}
