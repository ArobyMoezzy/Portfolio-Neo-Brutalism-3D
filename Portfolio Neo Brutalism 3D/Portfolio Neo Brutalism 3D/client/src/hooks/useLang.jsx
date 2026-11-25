import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { translations } from '../i18n/translations.js';

const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLang] = useState(() => {
    try {
      return localStorage.getItem('lang') || 'id';
    } catch {
      return 'id';
    }
  });

  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem('lang', lang);
    } catch {
      /* abaikan jika storage diblokir */
    }
  }, [lang]);

  // t('hero.tagline') mengambil teks bersarang; hasilnya bisa string, array, atau objek
  const t = useCallback(
    (path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), translations[lang]) ?? path,
    [lang]
  );

  // pick(row, 'title') memilih row.title_id atau row.title_en dari data API
  const pick = useCallback((row, field) => row?.[`${field}_${lang}`] ?? row?.[field] ?? '', [lang]);

  const toggle = useCallback(() => setLang((l) => (l === 'id' ? 'en' : 'id')), []);

  const value = useMemo(() => ({ lang, t, pick, toggle }), [lang, t, pick, toggle]);
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export function useLang() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useLang harus dipakai di dalam LangProvider');
  return ctx;
}
