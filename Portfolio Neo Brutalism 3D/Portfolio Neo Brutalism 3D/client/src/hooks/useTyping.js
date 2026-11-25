import { useEffect, useState } from 'react';

// Efek mengetik bergantian untuk daftar kata. Tanpa animasi jika pengguna memilih reduced motion.
export function useTyping(words, { typeSpeed = 70, deleteSpeed = 35, pause = 1400 } = {}) {
  const reduce =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const [text, setText] = useState(reduce ? words[0] : '');
  const [index, setIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (reduce) return undefined;
    const word = words[index % words.length];
    let delay = deleting ? deleteSpeed : typeSpeed;
    if (!deleting && text === word) delay = pause;

    const id = setTimeout(() => {
      if (!deleting && text === word) return setDeleting(true);
      if (deleting && text === '') {
        setDeleting(false);
        return setIndex((i) => i + 1);
      }
      setText(deleting ? word.slice(0, text.length - 1) : word.slice(0, text.length + 1));
      return undefined;
    }, delay);
    return () => clearTimeout(id);
  }, [text, deleting, index, words, reduce, typeSpeed, deleteSpeed, pause]);

  return reduce ? words[0] : text;
}
