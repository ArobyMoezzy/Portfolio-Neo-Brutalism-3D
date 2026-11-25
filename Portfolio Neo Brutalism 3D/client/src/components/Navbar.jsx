import { useRef, useState } from 'react';
import { Languages, Menu, Moon, Sun, X } from 'lucide-react';
import { useLang } from '../hooks/useLang.jsx';
import { useTheme } from '../hooks/useTheme.js';
import { profile } from '../config.js';
import { BrutalButton } from './ui.jsx';

const LINKS = ['about', 'skills', 'projects', 'journey', 'notes', 'guestbook', 'contact'];

export default function Navbar() {
  const { t, lang, toggle: toggleLang } = useLang();
  const { theme, toggle: toggleTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const clicks = useRef({ n: 0, timer: null });

  // Klik logo 5x berturut-turut memicu hujan sticker (easter egg)
  const onLogo = () => {
    const c = clicks.current;
    c.n += 1;
    clearTimeout(c.timer);
    c.timer = setTimeout(() => (c.n = 0), 1200);
    if (c.n >= 5) {
      c.n = 0;
      window.dispatchEvent(new CustomEvent('sticker-rain'));
    }
  };

  return (
    <header className="nav">
      <div className="container">
        <nav className="nav__inner" aria-label="Utama">
          <button type="button" className="nav__logo" onClick={onLogo} aria-label={profile.name}>
            {profile.initials}
          </button>

          <div className="nav__links">
            {LINKS.map((l) => (
              <a key={l} href={`#${l}`}>
                {t(`nav.${l}`)}
              </a>
            ))}
          </div>

          <div className="nav__tools">
            <BrutalButton variant="blue" size="icon" className="btn--icon" onClick={toggleLang} aria-label={t('nav.lang')}>
              <Languages size={18} aria-hidden="true" /> {lang === 'id' ? 'EN' : 'ID'}
            </BrutalButton>
            <BrutalButton variant="mint" size="icon" className="btn--icon" onClick={toggleTheme} aria-label={t('nav.theme')}>
              {theme === 'dark' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            </BrutalButton>
            <BrutalButton
              variant="yellow"
              size="icon"
              className="btn--icon nav__burger"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-label={t('nav.menu')}
            >
              {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
            </BrutalButton>
          </div>
        </nav>

        {open && (
          <div className="nav__mobile">
            {LINKS.map((l) => (
              <a key={l} href={`#${l}`} onClick={() => setOpen(false)}>
                {t(`nav.${l}`)}
              </a>
            ))}
          </div>
        )}
      </div>
    </header>
  );
}
