import { useState } from 'react';
import { api } from '../api.js';
import { useLang } from '../hooks/useLang.jsx';
import { useFetch } from '../hooks/useFetch.js';
import { BrutalButton, BrutalCard, SectionTitle, StateBox } from './ui.jsx';

// Buku tamu: pesan pengunjung tampil sebagai sticky note berwarna
export default function Guestbook() {
  const { t } = useLang();
  const { data, loading, error, refetch } = useFetch('/guestbook');
  const [form, setForm] = useState({ name: '', message: '' });
  const [err, setErr] = useState('');
  const [sending, setSending] = useState(false);

  const onSubmit = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return setErr(t('guestbook.errName'));
    if (form.message.trim().length < 3) return setErr(t('guestbook.errMessage'));
    setErr('');
    setSending(true);
    try {
      await api.post('/guestbook', form);
      setForm({ name: '', message: '' });
      refetch();
    } catch {
      setErr(t('guestbook.error'));
    } finally {
      setSending(false);
    }
    return undefined;
  };

  const colorName = (hex) =>
    ({ '#FFE500': 'yellow', '#FF6B9D': 'pink', '#4D9DE0': 'blue', '#7AE582': 'mint', '#FFB347': 'orange' })[
      hex
    ] || 'yellow';

  return (
    <section id="guestbook" className="section" aria-labelledby="guest-title">
      <div className="container">
        <SectionTitle id="guest-title" color="mint">
          {t('guestbook.title')}
        </SectionTitle>
        <p className="chip" style={{ marginBottom: '1.4rem' }}>{t('guestbook.intro')}</p>

        <form className="guest__form" onSubmit={onSubmit} noValidate>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="visually-hidden" htmlFor="g-name">{t('guestbook.name')}</label>
            <input
              id="g-name"
              placeholder={t('guestbook.name')}
              value={form.name}
              maxLength={40}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
            />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label className="visually-hidden" htmlFor="g-msg">{t('guestbook.message')}</label>
            <textarea
              id="g-msg"
              placeholder={t('guestbook.message')}
              value={form.message}
              maxLength={240}
              style={{ minHeight: 90 }}
              onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
            />
          </div>
          {err && <span className="err" role="alert" style={{ fontWeight: 700 }}>{err}</span>}
          <div>
            <BrutalButton variant="pink" type="submit" disabled={sending}>
              📌 {t('guestbook.send')}
            </BrutalButton>
          </div>
        </form>

        <StateBox loading={loading && !data} error={error} onRetry={refetch}>
          {t('guestbook.loadError')}
        </StateBox>
        {data && data.length === 0 && <StateBox empty>{t('guestbook.empty')}</StateBox>}

        <div className="guest__wall">
          {data?.map((g) => (
            <BrutalCard key={g.id} color={colorName(g.color)} rotate={((g.id * 37) % 7) - 3} className="sticky hoverable" hoverable>
              <p style={{ marginBottom: 0 }}>{g.message}</p>
              <p className="sticky__name" style={{ marginBottom: 0 }}>— {g.name}</p>
            </BrutalCard>
          ))}
        </div>
      </div>
    </section>
  );
}
