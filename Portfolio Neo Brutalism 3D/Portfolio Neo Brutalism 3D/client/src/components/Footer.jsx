import { useEffect, useState } from 'react';
import { ArrowUp, Eye, Mail, RotateCcw } from 'lucide-react';
import { FaLinkedin } from 'react-icons/fa';
import { SiGithub, SiInstagram } from 'react-icons/si';
import { api } from '../api.js';
import { useLang } from '../hooks/useLang.jsx';
import { profile } from '../config.js';
import { BrutalButton } from './ui.jsx';

const SOCIAL_ICONS = { github: SiGithub, linkedin: FaLinkedin, instagram: SiInstagram };

// Hitung pengunjung: POST sekali per sesi browser, selain itu hanya GET
function useVisitors() {
  const [count, setCount] = useState(null);
  useEffect(() => {
    let counted = false;
    try {
      counted = sessionStorage.getItem('visited') === '1';
    } catch {
      /* abaikan */
    }
    const req = counted ? api.get('/visitors') : api.post('/visitors', {});
    req
      .then((d) => {
        setCount(d.count);
        try {
          sessionStorage.setItem('visited', '1');
        } catch {
          /* abaikan */
        }
      })
      .catch(() => setCount(null));
  }, []);
  return count;
}

export default function Footer() {
  const { t } = useLang();
  const visitors = useVisitors();

  return (
    <footer className="footer">
      <div className="container">
        <p className="footer__big" style={{ fontFamily: 'var(--f-display)' }}>
          {t('footer.big')}
        </p>
        <div className="footer__row">
          <div className="footer__links">
            {profile.socials.map((s) => {
              const Icon = SOCIAL_ICONS[s.icon];
              return (
                <BrutalButton key={s.label} variant="yellow" size="sm" href={s.url} target="_blank" rel="noopener noreferrer">
                  {Icon && <Icon size={16} aria-hidden="true" />} {s.label}
                </BrutalButton>
              );
            })}
            <BrutalButton variant="mint" size="sm" href={`mailto:${profile.email}`}>
              <Mail size={16} aria-hidden="true" /> Email
            </BrutalButton>
          </div>
          <div className="footer__links">
            <BrutalButton
              variant="blue"
              size="sm"
              onClick={() => window.dispatchEvent(new CustomEvent('replay-intro'))}
            >
              <RotateCcw size={16} aria-hidden="true" /> {t('intro.replay')}
            </BrutalButton>
            <BrutalButton variant="pink" size="sm" href="#top">
              <ArrowUp size={16} aria-hidden="true" /> {t('footer.top')}
            </BrutalButton>
          </div>
        </div>
        <div className="footer__meta">
          <span>
            © {new Date().getFullYear()} {profile.name}. {t('footer.made')}
          </span>
          {visitors !== null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
              <Eye size={16} aria-hidden="true" /> {t('footer.visitors')}: {visitors.toLocaleString()}
            </span>
          )}
        </div>
      </div>
    </footer>
  );
}
