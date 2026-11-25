import { useEffect, useState } from 'react';
import { useLang } from '../hooks/useLang.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { Badge, BrutalCard, Reveal, SectionTitle, StateBox } from './ui.jsx';

// Catatan/blog mini dengan pencarian (di-debounce, pencarian dilakukan di server)
export default function Notes() {
  const { t, pick, lang } = useLang();
  const [q, setQ] = useState('');
  const [debounced, setDebounced] = useState('');

  useEffect(() => {
    const id = setTimeout(() => setDebounced(q.trim()), 300);
    return () => clearTimeout(id);
  }, [q]);

  const { data, loading, error, refetch } = useFetch(`/posts?q=${encodeURIComponent(debounced)}`);
  const colors = ['white', 'yellow', 'white', 'blue', 'pink'];
  const fmt = (d) =>
    new Date(d).toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });

  return (
    <section id="notes" className="section" aria-labelledby="notes-title">
      <div className="container">
        <SectionTitle id="notes-title" color="pink">
          {t('notes.title')}
        </SectionTitle>

        <div className="notes__search">
          <label className="visually-hidden" htmlFor="notes-q">
            {t('notes.search')}
          </label>
          <input
            id="notes-q"
            className="search"
            type="search"
            placeholder={`🔍 ${t('notes.search')}`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {!data && <StateBox loading={loading} error={error} onRetry={refetch}>{t('notes.loadError')}</StateBox>}
        {data && data.length === 0 && <StateBox empty>{t('notes.empty')}</StateBox>}

        <div className="notes__grid" aria-live="polite">
          {data?.map((p, i) => (
            <Reveal key={p.id} delay={(i % 3) * 0.07}>
              <BrutalCard
                as="article"
                color={colors[i % colors.length] === 'white' ? undefined : colors[i % colors.length]}
                rotate={i % 2 ? 0.8 : -0.8}
                hoverable
                className="post"
              >
                <time dateTime={p.created_at}>{fmt(p.created_at)}</time>
                <h3>{pick(p, 'title')}</h3>
                <p style={{ marginBottom: 0 }}>{pick(p, 'excerpt')}</p>
                <div className="post__tags">
                  {p.tags.map((tg) => (
                    <Badge key={tg} color="white">#{tg}</Badge>
                  ))}
                </div>
              </BrutalCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
