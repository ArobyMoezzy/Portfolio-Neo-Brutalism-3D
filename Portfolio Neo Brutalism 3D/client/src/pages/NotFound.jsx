import { Link } from 'react-router-dom';
import { useLang } from '../hooks/useLang.jsx';

// Halaman 404 kreatif: jaring laba-laba putus
export default function NotFound() {
  const { t } = useLang();
  return (
    <main className="nf">
      <div>
        <svg className="nf__web" viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true">
          <path d="M50 0 V100 M0 50 H100 M10 10 L90 90 M90 10 L40 60" />
          <circle cx="50" cy="50" r="14" />
          <circle cx="50" cy="50" r="30" strokeDasharray="10 8" />
        </svg>
        <div className="nf__code" aria-hidden="true">404</div>
        <h1>{t('notFound.title')}</h1>
        <p>{t('notFound.text')}</p>
        <Link to="/" className="btn btn--yellow">
          ← {t('notFound.back')}
        </Link>
      </div>
    </main>
  );
}
