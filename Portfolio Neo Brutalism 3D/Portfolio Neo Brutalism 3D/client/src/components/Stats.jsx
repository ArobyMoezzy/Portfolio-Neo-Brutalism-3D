import { Boxes, Eye, FolderGit2 } from 'lucide-react';
import { useFetch } from '../hooks/useFetch.js';
import { useLang } from '../hooks/useLang.jsx';
import { techStack } from '../config.js';
import CountUp from './reactbits/CountUp.jsx';
import { BrutalCard, Reveal } from './ui.jsx';

// Angka statistik: semuanya data nyata (jumlah proyek dari API, teknologi dari config, pengunjung dari server)
export default function Stats() {
  const { t } = useLang();
  const projects = useFetch('/projects');
  const visitors = useFetch('/visitors');

  const items = [
    { key: 'projects', Icon: FolderGit2, value: projects.data?.length ?? 0, color: 'yellow' },
    { key: 'tech', Icon: Boxes, value: techStack.length, color: 'mint' },
    { key: 'visitors', Icon: Eye, value: visitors.data?.count ?? 0, color: 'pink' }
  ];

  return (
    <div className="stats">
      {items.map(({ key, Icon, value, color }, i) => (
        <Reveal key={key} delay={i * 0.08}>
          <BrutalCard color={color} rotate={i % 2 ? 1 : -1} className="stat">
            <Icon size={28} aria-hidden="true" />
            <CountUp to={value} duration={1.6} className="stat__num" />
            <span className="stat__label">{t(`stats.${key}`)}</span>
          </BrutalCard>
        </Reveal>
      ))}
    </div>
  );
}
