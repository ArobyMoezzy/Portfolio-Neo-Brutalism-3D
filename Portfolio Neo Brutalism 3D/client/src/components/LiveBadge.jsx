import { useEffect, useState } from 'react';
import { useLang } from '../hooks/useLang.jsx';

/** Lencana "hidup": titik berdenyut + jam WIB yang berjalan. */
export default function LiveBadge() {
  const { t } = useLang();
  const fmt = () =>
    new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hour12: false, timeZone: 'Asia/Jakarta' })
      .format(new Date())
      .replace('.', ':');
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return (
    <p className="chip live-badge" data-enter>
      <span className="live-dot" aria-hidden="true" /> {t('hero.live')} · <span className="mono">{time} WIB</span>
    </p>
  );
}
