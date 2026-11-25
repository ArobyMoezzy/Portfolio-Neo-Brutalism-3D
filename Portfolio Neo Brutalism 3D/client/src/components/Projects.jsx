import { useMemo, useState } from 'react';
import { useLang } from '../hooks/useLang.jsx';
import Tilt from './Tilt.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, BrutalButton, BrutalCard, Modal, Reveal, StateBox } from './ui.jsx';

const CATS = ['all', 'fullstack', 'frontend', 'backend'];
const COLOR_BY_HEX = {
  '#FFE500': 'yellow',
  '#FF6B9D': 'pink',
  '#4D9DE0': 'blue',
  '#7AE582': 'mint'
};

export default function Projects() {
  const { t, pick } = useLang();
  const { data, loading, error, refetch } = useFetch('/projects');
  const [cat, setCat] = useState('all');
  const [selected, setSelected] = useState(null);

  const list = useMemo(
    () => (data || []).filter((p) => cat === 'all' || p.category === cat),
    [data, cat]
  );

  return (
    <section id="projects-list" className="section projects" aria-labelledby="projects-title">
      <div className="container">

        <div className="filters" role="group" aria-label="Filter">
          {CATS.map((c) => (
            <BrutalButton
              key={c}
              variant="white"
              size="sm"
              aria-pressed={cat === c}
              onClick={() => setCat(c)}
            >
              {t(`projects.filters.${c}`)}
            </BrutalButton>
          ))}
        </div>

        <StateBox loading={loading} error={error} onRetry={refetch}>
          {t('projects.loadError')}
        </StateBox>
        {data && list.length === 0 && <StateBox empty>{t('projects.empty')}</StateBox>}

        <div className="projects__grid">
          {list.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.08} className="fill">
              <Tilt>
              <BrutalCard
                as="button"
                type="button"
                color={COLOR_BY_HEX[p.color?.toUpperCase()] || 'yellow'}
                rotate={i % 2 ? 1 : -1}
                hoverable
                className="project"
                onClick={() => setSelected(p)}
                aria-label={`${t('projects.details')}: ${p.title}`}
              >
                <Badge color="white">{t(`projects.filters.${p.category}`)}</Badge>
                <h3>{p.title}</h3>
                <p>{pick(p, 'summary')}</p>
                <div className="project__tags">
                  {p.stack.slice(0, 4).map((s) => (
                    <Badge key={s} color="white">{s}</Badge>
                  ))}
                </div>
              </BrutalCard>
              </Tilt>
            </Reveal>
          ))}
        </div>
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title={selected?.title}>
        {selected && (
          <>
            <Badge color="pink">{t(`projects.filters.${selected.category}`)}</Badge>
            <h3 style={{ marginTop: '0.8rem' }}>{selected.title}</h3>
            <p>{pick(selected, 'description')}</p>
            <strong>{t('projects.stack')}</strong>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '0.5rem' }}>
              {selected.stack.map((s) => (
                <Badge key={s} color="blue">{s}</Badge>
              ))}
            </div>
            <div className="modal__actions">
              {selected.demo_url && (
                <BrutalButton variant="pink" href={selected.demo_url} target="_blank" rel="noopener noreferrer">
                  ↗ {t('projects.demo')}
                </BrutalButton>
              )}
              {selected.repo_url && (
                <BrutalButton variant="mint" href={selected.repo_url} target="_blank" rel="noopener noreferrer">
                  {'</>'} {t('projects.repo')}
                </BrutalButton>
              )}
            </div>
          </>
        )}
      </Modal>
    </section>
  );
}
