import { useEffect, useState } from 'react';

// Status intro disimpan di <html data-intro="playing|done"> dan dikabarkan lewat event.
export const isIntroDone = () =>
  typeof document !== 'undefined' && document.documentElement.dataset.intro === 'done';

export function markIntroDone() {
  if (isIntroDone()) return;
  document.documentElement.dataset.intro = 'done';
  window.dispatchEvent(new CustomEvent('intro-done'));
}

export function markIntroPlaying() {
  document.documentElement.dataset.intro = 'playing';
  window.dispatchEvent(new CustomEvent('intro-playing'));
}

/** true setelah intro film (hampir) selesai atau dilewati. Dipakai agar animasi hero mulai tepat waktu. */
export function useIntroDone() {
  const [done, setDone] = useState(isIntroDone);
  useEffect(() => {
    const sync = () => setDone(isIntroDone());
    sync();
    window.addEventListener('intro-done', sync);
    window.addEventListener('intro-playing', sync);
    return () => {
      window.removeEventListener('intro-done', sync);
      window.removeEventListener('intro-playing', sync);
    };
  }, []);
  return done;
}
