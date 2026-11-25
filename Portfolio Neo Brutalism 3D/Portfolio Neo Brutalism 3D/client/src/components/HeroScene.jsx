import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { renderToStaticMarkup } from 'react-dom/server';
import { TECH } from './techIcons.jsx';

const isDark = () => document.documentElement.dataset.theme === 'dark';
const edgeColor = () => (isDark() ? 0xfffdf5 : 0x000000);

// Warna kartu dan logo per teknologi (kontras tinggi, ala neo brutalism)
const TILE = {
  javascript: { bg: '#F7DF1E', fg: '#000000' },
  github: { bg: '#FFFDF5', fg: '#000000' },
  react: { bg: '#20232A', fg: '#61DAFB' },
  node: { bg: '#FFFDF5', fg: '#339933' },
  typescript: { bg: '#3178C6', fg: '#FFFFFF' },
  three: { bg: '#FFFDF5', fg: '#000000' },
  gsap: { bg: '#000000', fg: '#88CE02' },
  git: { bg: '#FFFDF5', fg: '#F05032' }
};

/** Logo SVG (react-icons) -> CanvasTexture dengan latar berwarna. */
function makeLogoTexture(id, onLoad) {
  const { Icon } = TECH[id];
  const { bg, fg } = TILE[id];
  const size = 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const g = canvas.getContext('2d');
  g.fillStyle = bg;
  g.fillRect(0, 0, size, size);
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  // Gambar langsung dari data path SVG lewat Path2D (sinkron, tanpa memuat gambar sehingga tidak bisa gagal diam-diam)
  const markup = renderToStaticMarkup(<Icon size={24} />);
  const vb = (/viewBox="([^"]+)"/.exec(markup)?.[1] || '0 0 24 24').split(/[\s,]+/).map(Number);
  const paths = [...markup.matchAll(/<path[^>]*?\sd="([^"]+)"/g)].map((m) => m[1]);
  const k = 320 / Math.max(vb[2], vb[3]);
  g.save();
  g.translate((size - vb[2] * k) / 2 - vb[0] * k, (size - vb[3] * k) / 2 - vb[1] * k);
  g.scale(k, k);
  g.fillStyle = fg;
  paths.forEach((d) => g.fill(new Path2D(d)));
  g.restore();
  tex.needsUpdate = true;
  onLoad?.();
  return tex;
}

/** Kartu tebal bersudut bulat (extrude) dengan bevel, sisi depan/belakang diberi tekstur logo. */
function makeSlabGeometry() {
  const h = 1;
  const r = 0.3;
  const shape = new THREE.Shape();
  shape.moveTo(-h + r, -h);
  shape.lineTo(h - r, -h);
  shape.quadraticCurveTo(h, -h, h, -h + r);
  shape.lineTo(h, h - r);
  shape.quadraticCurveTo(h, h, h - r, h);
  shape.lineTo(-h + r, h);
  shape.quadraticCurveTo(-h, h, -h, h - r);
  shape.lineTo(-h, -h + r);
  shape.quadraticCurveTo(-h, -h, -h + r, -h);
  const depth = 0.55;
  const geo = new THREE.ExtrudeGeometry(shape, {
    depth,
    bevelEnabled: true,
    bevelThickness: 0.06,
    bevelSize: 0.06,
    bevelSegments: 2,
    curveSegments: 8
  });
  geo.translate(0, 0, -depth / 2);
  return geo;
}

/**
 * Latar 3D (Three.js) untuk hero: logo teknologi (JavaScript, GitHub, React, dst.) sebagai kartu 3D tebal
 * berkontur hitam. Melayang, mengikuti mouse, membesar saat di-hover, dan berputar 360 derajat saat diklik.
 */
export default function HeroScene() {
  const mount = useRef(null);

  useEffect(() => {
    const el = mount.current;
    if (!el) return undefined;

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    } catch {
      return undefined; // WebGL tidak tersedia: lewati saja, halaman tetap normal
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const small = window.innerWidth < 760;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, small ? 1.5 : 2));
    renderer.domElement.setAttribute('aria-hidden', 'true');
    el.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
    camera.position.z = 14;

    scene.add(new THREE.AmbientLight(0xffffff, 1.5));
    const key = new THREE.DirectionalLight(0xffffff, 2.2);
    key.position.set(4, 6, 8);
    scene.add(key);

    const world = new THREE.Group();
    scene.add(world);

    const outlineMats = [];
    const disposables = [];
    const shapes = [];
    const slab = makeSlabGeometry();
    disposables.push(slab);
    let still = null; // render ulang untuk mode reduced-motion saat tekstur selesai dimuat

    // x/y dalam satuan dunia; keepOnSmall: tampil juga di layar kecil
    const add = (id, [x, y, z], scale, phase, keepOnSmall = true) => {
      if (small && !keepOnSmall) return;
      const tex = makeLogoTexture(id, () => still?.());
      const capMat = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.55, metalness: 0 });
      const sideMat = new THREE.MeshStandardMaterial({ color: new THREE.Color(TILE[id].bg), roughness: 0.6 });
      const outline = new THREE.MeshBasicMaterial({ color: edgeColor(), side: THREE.BackSide });
      // UV cap = koordinat bentuk (-1.06..1.06) -> 0..1
      tex.repeat.set(1 / 2.12, 1 / 2.12);
      tex.offset.set(0.5, 0.5);
      tex.center.set(0, 0);
      const mesh = new THREE.Mesh(slab, [capMat, sideMat]);
      const hull = new THREE.Mesh(slab, outline);
      hull.scale.set(1.08, 1.08, 1.12);
      const group = new THREE.Group();
      group.add(hull, mesh);
      group.position.set(x, y, z);
      group.scale.setScalar(scale);
      world.add(group);
      outlineMats.push(outline);
      disposables.push(tex, capMat, sideMat, outline);
      shapes.push({ group, mesh, ox: x, oy: y, base: new THREE.Vector3(x, y, z), scale, phase, amp: 0.3 + (phase % 1) * 0.25, flip: 0, flipTarget: 0, hover: 0 });
    };

    add('javascript', [-8.3, 3.5, -1], 0.85, 0.3);
    add('github', [-8.4, -3.6, 0.5], 0.8, 1.9);
    add('react', [7.3, -3.0, 0.5], 0.8, 2.6);
    add('typescript', [0.9, 4.4, -3], 0.7, 3.9);
    add('node', [6.2, 4.0, -2], 0.75, 4.8, false);
    add('three', [1.4, -4.2, -2], 0.65, 5.6, false);
    add('gsap', [3.8, -3.6, 0.5], 0.55, 6.4, false);
    add('git', [-3.4, 4.7, -3], 0.6, 7.2, false);

    // Titik-titik kecil sebagai debu/bintang
    const count = small ? 40 : 90;
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i += 1) {
      pos[i * 3] = (Math.random() - 0.5) * 30;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 16;
      pos[i * 3 + 2] = -4 + Math.random() * 6;
    }
    const dotGeo = new THREE.BufferGeometry();
    dotGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const dotMat = new THREE.PointsMaterial({ color: edgeColor(), size: 0.07, transparent: true, opacity: 0.55 });
    const dots = new THREE.Points(dotGeo, dotMat);
    world.add(dots);
    disposables.push(dotGeo, dotMat);

    // --- Ukuran, interaksi, dan loop ---
    const resize = () => {
      const w = el.clientWidth || 1;
      const h = el.clientHeight || 1;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      // Layar sempit: mundurkan kamera agar semua bentuk tetap terlihat
      camera.position.z = camera.aspect < 1 ? 19 : 14;
      camera.updateProjectionMatrix();
      // Layar sempit: rapatkan posisi horizontal supaya logo tidak keluar layar
      const fx = camera.aspect < 1 ? Math.max(0.3, camera.aspect * 0.55) : 1;
      shapes.forEach((s) => {
        s.base.x = s.ox * fx;
        s.base.y = s.oy;
      });
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(el);

    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMove = (e) => {
      pointer.tx = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.ty = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    // Raycast: hover membesarkan logo, klik memutarnya 360 derajat
    const ray = new THREE.Raycaster();
    const ndc = new THREE.Vector2();
    const pick = (e) => {
      const r = el.getBoundingClientRect();
      if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) return null;
      ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      const hit = ray.intersectObjects(shapes.map((s) => s.mesh), false)[0];
      return hit ? shapes.find((s) => s.mesh === hit.object) : null;
    };
    let hovered = null;
    const onHover = (e) => {
      hovered = e.pointerType === 'touch' ? null : pick(e);
    };
    const onClick = (e) => {
      const s = pick(e);
      if (s) s.flipTarget += Math.PI * 2;
    };
    window.addEventListener('pointermove', onHover, { passive: true });
    window.addEventListener('pointerdown', onClick, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
    });
    io.observe(el);

    const mo = new MutationObserver(() => {
      outlineMats.forEach((m) => m.color.setHex(edgeColor()));
      dotMat.color.setHex(edgeColor());
    });
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    let last = performance.now();
    let elapsed = 0;
    let raf = 0;
    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) return;
      const now = performance.now();
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      elapsed += dt;
      const t = elapsed;
      pointer.x += (pointer.tx - pointer.x) * 0.06;
      pointer.y += (pointer.ty - pointer.y) * 0.06;
      const scroll = window.scrollY;

      world.rotation.y = pointer.x * 0.28 + scroll * 0.0004;
      world.rotation.x = pointer.y * 0.16 + scroll * 0.0006;
      world.position.y = scroll * 0.004;
      dots.rotation.z = t * 0.02;

      shapes.forEach((s) => {
        const isHover = hovered === s;
        s.hover += ((isHover ? 1 : 0) - s.hover) * Math.min(1, dt * 10);
        s.flip += (s.flipTarget - s.flip) * Math.min(1, dt * 5);
        // Goyang pelan (tetap terbaca) + miring mengikuti kursor + putaran saat diklik
        s.group.rotation.y = Math.sin(t * 0.7 + s.phase) * 0.45 + pointer.x * 0.5 + s.flip;
        s.group.rotation.x = Math.cos(t * 0.5 + s.phase) * 0.22 + pointer.y * 0.3;
        s.group.rotation.z = Math.sin(t * 0.4 + s.phase * 2) * 0.1;
        s.group.scale.setScalar(s.scale * (1 + s.hover * 0.22));
        s.group.position.y = s.base.y + Math.sin(t * 0.9 + s.phase) * s.amp;
        s.group.position.x = s.base.x + pointer.x * (0.4 + (s.base.z + 3) * 0.12);
      });
      renderer.render(scene, camera);
    };

    if (reduce) {
      still = () => renderer.render(scene, camera);
      still(); // tampil statis, tanpa animasi
    } else {
      frame();
    }

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointermove', onHover);
      window.removeEventListener('pointerdown', onClick);
      ro.disconnect();
      io.disconnect();
      mo.disconnect();
      disposables.forEach((d) => d.dispose());
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return <div ref={mount} className="hero-scene" aria-hidden="true" />;
}
