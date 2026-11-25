import { useCallback, useEffect, useState } from 'react';
import { Route, Routes } from 'react-router-dom';
import Home from './pages/Home.jsx';
import NotFound from './pages/NotFound.jsx';
import Intro, { shouldPlayIntro } from './components/Intro.jsx';
import { CustomCursor, ScrollProgress, StickerRain } from './components/Effects.jsx';
import ClickSpark from './components/reactbits/ClickSpark.jsx';
import CursorTrail from './components/CursorTrail.jsx';
import PageBackground from './components/PageBackground.jsx';
import { useKonami } from './hooks/useKonami.js';
import { markIntroDone } from './hooks/useIntro.js';
import { ScrollTrigger } from './lib/gsap.js';

export default function App() {
  const [intro, setIntro] = useState(shouldPlayIntro);
  const done = useCallback(() => setIntro(false), []);

  // Intro dilewati (sudah pernah dilihat di sesi ini): langsung tandai selesai
  useEffect(() => {
    if (!intro) {
      markIntroDone();
      ScrollTrigger.refresh();
    }
  }, [intro]);

  // Konten dimuat bertahap (lazy + data API): hitung ulang posisi ScrollTrigger saat tinggi halaman berubah
  useEffect(() => {
    let timer;
    let lastH = document.body.scrollHeight;
    const ro = new ResizeObserver(() => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        const h = document.body.scrollHeight;
        if (Math.abs(h - lastH) > 4) {
          lastH = h;
          ScrollTrigger.refresh();
        }
      }, 250);
    });
    ro.observe(document.body);
    window.addEventListener('load', () => ScrollTrigger.refresh());
    return () => {
      clearTimeout(timer);
      ro.disconnect();
    };
  }, []);

  // Tombol "putar ulang intro" di footer
  useEffect(() => {
    const replay = () => {
      window.scrollTo(0, 0);
      setIntro(true);
    };
    window.addEventListener('replay-intro', replay);
    return () => window.removeEventListener('replay-intro', replay);
  }, []);

  // Easter egg: Konami code memicu hujan sticker
  useKonami(useCallback(() => window.dispatchEvent(new CustomEvent('sticker-rain')), []));

  return (
    <div id="top">
      {intro && <Intro onDone={done} />}
      <PageBackground />
      <CursorTrail />
      <ScrollProgress />
      <CustomCursor />
      <StickerRain />
      <ClickSpark sparkColor="#FF6B9D" sparkSize={12} sparkRadius={34} sparkCount={9} sparkWidth={3} duration={520} style={{ height: 'auto' }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </ClickSpark>
    </div>
  );
}
