import { useCallback, useEffect, useRef, useState } from 'react';
import { useLang } from '../hooks/useLang.jsx';
import { BrutalButton, BrutalCard, SectionTitle } from './ui.jsx';

const DURATION = 20;
const readBest = () => {
  try {
    return Number(localStorage.getItem('spider-best')) || 0;
  } catch {
    return 0;
  }
};

// Mini game: tangkap laba-laba yang muncul acak di papan 3x3
export default function Game() {
  const { t } = useLang();
  const [state, setState] = useState('idle'); // idle | playing | over
  const [score, setScore] = useState(0);
  const [time, setTime] = useState(DURATION);
  const [spider, setSpider] = useState(-1);
  const [hit, setHit] = useState(-1);
  const [best, setBest] = useState(readBest);
  const scoreRef = useRef(0);

  const start = () => {
    scoreRef.current = 0;
    setScore(0);
    setTime(DURATION);
    setSpider(Math.floor(Math.random() * 9));
    setState('playing');
  };

  // Hitung mundur
  useEffect(() => {
    if (state !== 'playing') return undefined;
    const id = setInterval(() => setTime((s) => s - 1), 1000);
    return () => clearInterval(id);
  }, [state]);

  const finish = useCallback(() => {
    setState('over');
    setSpider(-1);
    setBest((b) => {
      const next = Math.max(b, scoreRef.current);
      try {
        localStorage.setItem('spider-best', String(next));
      } catch {
        /* abaikan */
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (state === 'playing' && time <= 0) finish();
  }, [time, state, finish]);

  // Laba-laba berpindah tempat; makin sedikit sisa waktu makin cepat
  useEffect(() => {
    if (state !== 'playing') return undefined;
    const speed = time > 10 ? 850 : 650;
    const id = setInterval(() => setSpider(Math.floor(Math.random() * 9)), speed);
    return () => clearInterval(id);
  }, [state, time > 10]); // eslint-disable-line react-hooks/exhaustive-deps

  const whack = (i) => {
    if (state !== 'playing' || i !== spider) return;
    scoreRef.current += 1;
    setScore(scoreRef.current);
    setHit(i);
    setSpider(-1);
    setTimeout(() => setHit(-1), 180);
  };

  return (
    <section id="game" className="section" aria-labelledby="game-title">
      <div className="container">
        <SectionTitle id="game-title" color="blue">
          {t('game.title')}
        </SectionTitle>
        <BrutalCard className="game" rotate={-0.5}>
          <p>{t('game.desc')}</p>
          <div className="game__stats" aria-live="polite">
            <span>{t('game.score')}: {score}</span>
            <span>{t('game.time')}: {time}s</span>
            <span>{t('game.best')}: {best}</span>
          </div>

          <div className="game__board">
            {Array.from({ length: 9 }, (_, i) => (
              <button
                key={i}
                type="button"
                className={`game__cell ${hit === i ? 'hit' : ''}`}
                onClick={() => whack(i)}
                aria-label={`${t('game.cell')} ${i + 1}${spider === i ? ' 🕷️' : ''}`}
                disabled={state !== 'playing'}
              >
                {spider === i ? '🕷️' : hit === i ? '💥' : ''}
              </button>
            ))}
          </div>

          {state === 'over' && (
            <p className="game__over">
              {t('game.over')} {t('game.score')}: {score}
            </p>
          )}
          <div style={{ marginTop: '1.2rem' }}>
            {state !== 'playing' && (
              <BrutalButton variant="pink" onClick={start}>
                {state === 'over' ? t('game.again') : t('game.start')}
              </BrutalButton>
            )}
          </div>
        </BrutalCard>
      </div>
    </section>
  );
}
