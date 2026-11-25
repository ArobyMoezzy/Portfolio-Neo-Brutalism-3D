import { useEffect, useRef, useState } from 'react';
import { MousePointerClick } from 'lucide-react';
import gridUrl from '../assets/bg-grid.jpg';
import { bgState } from '../lib/bgState.js';
import { useLang } from '../hooks/useLang.jsx';

/**
 * Latar halaman (WebGL, satu shader layar penuh):
 *  - Mode gambar : gambar grid biru neo brutalism milik pengguna (mirror-repeat supaya bisa digeser tanpa batas)
 *  - Mode contour: garis kontur topografi dari noise (procedural, tajam di semua resolusi)
 * Interaksi: hover = lensa mengikuti kursor, klik = riak gelombang, seret = menggeser latar (dengan inersia),
 * scroll = latar ikut bergeser (parallax). Peralihan gambar -> contour dikendalikan ProjectGate lewat bgState.
 */

const VERT = `#version 300 es
void main() {
  vec2 p = vec2((gl_VertexID << 1) & 2, gl_VertexID & 2);
  gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
out vec4 fragColor;

uniform vec2 uRes;        // ukuran viewport (CSS px)
uniform float uDpr;
uniform float uTime;
uniform sampler2D uTex;
uniform vec2 uTexSize;
uniform float uTexReady;
uniform vec2 uPan;
uniform vec2 uMouse;
uniform vec2 uVel;
uniform float uMouseOn;
uniform vec4 uRip[8];     // x, y, umur (detik), amplitudo
uniform vec3 uHole;       // x, y, radius lubang huruf O
uniform float uContourAll;
uniform float uDark;

const float TAU = 6.28318530718;

vec2 hash2(vec2 p) {
  p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
  return -1.0 + 2.0 * fract(sin(p) * 43758.5453123);
}
float gnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * f * (f * (f * 6.0 - 15.0) + 10.0);
  return mix(
    mix(dot(hash2(i), f), dot(hash2(i + vec2(1, 0)), f - vec2(1, 0)), u.x),
    mix(dot(hash2(i + vec2(0, 1)), f - vec2(0, 1)), dot(hash2(i + vec2(1, 1)), f - vec2(1, 1)), u.x),
    u.y);
}
float fbm(vec2 p) {
  float a = 0.5, s = 0.0;
  mat2 m = mat2(1.6, 1.2, -1.2, 1.6);
  for (int i = 0; i < 4; i++) { s += a * gnoise(p); p = m * p; a *= 0.5; }
  return s;
}

// Riak dari klik: pergeseran (px) dan tinggi (untuk contour)
vec2 ripples(vec2 p, out float hgt) {
  vec2 d = vec2(0.0);
  hgt = 0.0;
  for (int i = 0; i < 8; i++) {
    vec4 r = uRip[i];
    if (r.w > 0.0) {
      vec2 v = p - r.xy;
      float dist = length(v) + 1e-3;
      float x = dist - r.z * 480.0;
      float env = exp(-r.z * 1.1) * exp(-x * x / (2.0 * 120.0 * 120.0));
      float wave = sin(x * TAU / 130.0);
      d += (v / dist) * wave * env * r.w * 26.0;
      hgt += wave * env * r.w * 0.09;
    }
  }
  return d;
}

// Lensa di sekitar kursor
vec2 mouseLens(vec2 p, out float hgt) {
  vec2 v = p - uMouse;
  float g = exp(-dot(v, v) / (2.0 * 160.0 * 160.0)) * uMouseOn;
  hgt = g * 0.30;
  return -v * 0.20 * g + uVel * g * 3.0;
}

vec3 imageSample(vec2 p, vec2 disp, vec2 g1, vec2 g2, float sc) {
  vec2 q = p - uPan + disp;
  vec2 uv = ((q - 0.5 * uRes) / sc + 0.5 * uTexSize) / uTexSize;
  vec2 m = 1.0 - abs(mod(uv, 2.0) - 1.0);
  return textureGrad(uTex, m, g1, g2).rgb;
}

float heightField(vec2 p, vec2 disp, float extra) {
  vec2 q = (p - uPan + disp) / 340.0;
  float t = uTime * 0.035;
  vec2 w = vec2(fbm(q * 0.9 + vec2(1.7, 9.2) + t), fbm(q * 0.9 + vec2(8.3, 2.8) - t));
  return fbm(q + 1.8 * w + vec2(t * 0.6, -t * 0.4)) + extra;
}

void main() {
  vec2 p = vec2(gl_FragCoord.x, uRes.y * uDpr - gl_FragCoord.y) / uDpr;

  float hr, hm;
  vec2 disp = ripples(p, hr) + mouseLens(p, hm);

  bool wantContour = uContourAll > 0.5 || uHole.z > 0.5;
  bool wantImage = uContourAll < 0.5;

  vec3 imgCol = vec3(0.094, 0.345, 1.0);
  if (wantImage) {
    float sc = max(uRes.x / uTexSize.x, uRes.y / uTexSize.y);
    vec2 uv0 = ((p - uPan - 0.5 * uRes) / sc + 0.5 * uTexSize) / uTexSize;
    vec2 g1 = dFdx(uv0), g2 = dFdy(uv0);
    if (uTexReady > 0.5) {
      float mag = length(disp);
      if (mag > 0.4) {
        // sedikit pemisahan warna di puncak gelombang
        imgCol = vec3(
          imageSample(p, disp * 1.18, g1, g2, sc).r,
          imageSample(p, disp, g1, g2, sc).g,
          imageSample(p, disp * 0.82, g1, g2, sc).b);
      } else {
        imgCol = imageSample(p, disp, g1, g2, sc);
      }
    }
    imgCol *= mix(1.0, 0.48, uDark);
  }

  vec3 conCol = vec3(1.0);
  if (wantContour) {
    float lv = heightField(p, disp * 0.6, hr + hm) * 20.0;
    float fw = max(fwidth(lv), 4e-3);
    float d = abs(fract(lv + 0.5) - 0.5);
    float minor = 1.0 - smoothstep(0.42 * fw, 0.42 * fw + fw * 0.9, d);
    float lv2 = lv / 5.0;
    float fw2 = max(fwidth(lv2), 4e-3);
    float d2 = abs(fract(lv2 + 0.5) - 0.5);
    float major = 1.0 - smoothstep(0.9 * fw2, 0.9 * fw2 + fw2 * 0.9, d2);
    float ink = max(minor * 0.7, major);
    vec3 paper = mix(vec3(1.0, 0.992, 0.96), vec3(0.082, 0.075, 0.11), uDark);
    vec3 line = mix(vec3(0.0), vec3(1.0, 0.992, 0.96), uDark);
    conCol = mix(paper, line, ink);
  }

  float mask = uContourAll;
  if (uHole.z > 0.5) {
    mask = max(mask, 1.0 - smoothstep(uHole.z - 1.5, uHole.z + 1.0, length(p - uHole.xy)));
  }
  fragColor = vec4(mix(imgCol, conCol, mask), 1.0);
}`;

const MAX_RIPPLES = 8;
const isInteractive = (el) =>
  !!el?.closest?.(
    'a, button, input, textarea, select, label, [role="button"], .logoloop, .modal, .photo, .game__board, .testi__nav, .nav__mobile, .nav'
  );

export default function PageBackground() {
  const canvasRef = useRef(null);
  const [hint, setHint] = useState(false);
  const { t } = useLang();

  useEffect(() => {
    const canvas = canvasRef.current;
    const html = document.documentElement;
    const gl = canvas.getContext('webgl2', { antialias: false, alpha: false, powerPreference: 'high-performance' });
    if (!gl) {
      html.classList.add('no-webgl'); // cadangan: gambar via CSS
      return undefined;
    }
    html.classList.add('has-bg');

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const mobile = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
      return s;
    };
    let program;
    try {
      program = gl.createProgram();
      gl.attachShader(program, compile(gl.VERTEX_SHADER, VERT));
      gl.attachShader(program, compile(gl.FRAGMENT_SHADER, FRAG));
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
    } catch (err) {
      console.warn('Latar WebGL dinonaktifkan:', err.message);
      html.classList.remove('has-bg');
      html.classList.add('no-webgl');
      return undefined;
    }
    gl.useProgram(program);
    gl.bindVertexArray(gl.createVertexArray());

    const U = {};
    ['uRes', 'uDpr', 'uTime', 'uTex', 'uTexSize', 'uTexReady', 'uPan', 'uMouse', 'uVel', 'uMouseOn', 'uRip', 'uHole', 'uContourAll', 'uDark'].forEach(
      (n) => (U[n] = gl.getUniformLocation(program, n))
    );

    // Tekstur gambar latar
    const tex = gl.createTexture();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([24, 88, 255, 255]));
    gl.uniform1i(U.uTex, 0);
    let texReady = 0;
    let texSize = [1920, 960];
    let dirty = true;
    const img = new Image();
    img.decoding = 'async';
    img.onload = () => {
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      const aniso = gl.getExtension('EXT_texture_filter_anisotropic');
      if (aniso) gl.texParameterf(gl.TEXTURE_2D, aniso.TEXTURE_MAX_ANISOTROPY_EXT, 4);
      texSize = [img.naturalWidth, img.naturalHeight];
      texReady = 1;
      dirty = true;
    };
    img.src = gridUrl;

    // Ukuran canvas
    let W = window.innerWidth;
    let H = window.innerHeight;
    let dpr = 1;
    const resize = () => {
      W = window.innerWidth;
      H = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
      dirty = true;
    };
    resize();
    window.addEventListener('resize', resize);

    // Status interaksi
    const pan = { x: 0, y: 0 };
    const vel = { x: 0, y: 0 };
    const mouse = { x: W / 2, y: H / 2, tx: W / 2, ty: H / 2, on: 0, target: 0 };
    const mvel = { x: 0, y: 0 };
    const ripples = [];
    let ripIdx = 0;
    let drag = null;
    let dragging = false;
    let interacted = false;
    let dark = html.dataset.theme === 'dark' ? 1 : 0;
    let darkTarget = dark;
    let lastScroll = window.scrollY;

    const addRipple = (x, y, amp = 1) => {
      ripples[ripIdx % MAX_RIPPLES] = { x, y, t0: performance.now(), amp };
      ripIdx += 1;
    };
    const markInteracted = () => {
      if (interacted) return;
      interacted = true;
      setHint(false);
    };

    const onDown = (e) => {
      if (e.pointerType === 'mouse' && e.button !== 0) return;
      markInteracted();
      if (reduce) return;
      addRipple(e.clientX, e.clientY, 1);
      if (!isInteractive(e.target)) drag = { id: e.pointerId, x: e.clientX, y: e.clientY, moved: 0 };
    };
    const onMove = (e) => {
      mouse.tx = e.clientX;
      mouse.ty = e.clientY;
      if (e.pointerType === 'mouse') mouse.target = 1;
      if (reduce || !drag || e.pointerId !== drag.id) return;
      const dx = e.clientX - drag.x;
      const dy = e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      drag.moved += Math.abs(dx) + Math.abs(dy);
      if (drag.moved > 5) {
        if (!dragging) {
          dragging = true;
          html.classList.add('bg-dragging');
          window.getSelection?.()?.removeAllRanges();
        }
        pan.x += dx;
        pan.y += dy;
        vel.x = dx;
        vel.y = dy;
        dirty = true;
      }
    };
    const onUp = () => {
      drag = null;
      if (dragging) {
        dragging = false;
        html.classList.remove('bg-dragging');
      }
    };
    const onLeave = () => {
      mouse.target = 0;
    };
    const onScroll = () => {
      const dy = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      if (!reduce) pan.y -= dy * 0.3; // latar tertinggal dari konten: efek parallax
      dirty = true;
    };
    window.addEventListener('pointerdown', onDown, { passive: true });
    window.addEventListener('pointermove', onMove, { passive: true });
    window.addEventListener('pointerup', onUp, { passive: true });
    window.addEventListener('pointercancel', onUp, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    window.addEventListener('scroll', onScroll, { passive: true });

    const mo = new MutationObserver(() => {
      darkTarget = html.dataset.theme === 'dark' ? 1 : 0;
      dirty = true;
    });
    mo.observe(html, { attributes: true, attributeFilter: ['data-theme'] });

    // Petunjuk interaksi muncul setelah intro selesai
    let hintTimer;
    const showHint = () => {
      hintTimer = setTimeout(() => {
        if (interacted) return;
        setHint(true);
        hintTimer = setTimeout(() => setHint(false), 9000); // hilang otomatis
      }, 1800);
    };
    if (html.dataset.intro === 'playing') window.addEventListener('intro-done', showHint, { once: true });
    else showHint();

    // Loop render
    const ripArr = new Float32Array(MAX_RIPPLES * 4);
    let raf = 0;
    let last = performance.now();
    let time = 0;
    let lastSig = '';

    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (document.hidden) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const k = dt * 60;

      if (!reduce) {
        time += dt;
        if (!drag || !dragging) {
          pan.x += vel.x * k;
          pan.y += vel.y * k;
          const f = Math.pow(0.93, k);
          vel.x *= f;
          vel.y *= f;
          if (Math.abs(vel.x) < 0.01) vel.x = 0;
          if (Math.abs(vel.y) < 0.01) vel.y = 0;
        }
        const px = mouse.x;
        const py = mouse.y;
        mouse.x += (mouse.tx - mouse.x) * Math.min(1, 0.2 * k);
        mouse.y += (mouse.ty - mouse.y) * Math.min(1, 0.2 * k);
        mvel.x += ((mouse.x - px) - mvel.x) * 0.2;
        mvel.y += ((mouse.y - py) - mvel.y) * 0.2;
        mouse.on += (mouse.target - mouse.on) * Math.min(1, 0.1 * k);
      }
      dark += (darkTarget - dark) * Math.min(1, 0.12 * k);
      if (Math.abs(darkTarget - dark) < 0.002) dark = darkTarget;

      for (let i = 0; i < MAX_RIPPLES; i += 1) {
        const r = ripples[i];
        const age = r ? (now - r.t0) / 1000 : 99;
        const on = r && age < 4.2;
        ripArr[i * 4] = on ? r.x : 0;
        ripArr[i * 4 + 1] = on ? r.y : 0;
        ripArr[i * 4 + 2] = on ? age : 0;
        ripArr[i * 4 + 3] = on ? r.amp : 0;
      }

      // Mode reduced-motion: gambar ulang hanya jika ada perubahan
      if (reduce) {
        const sig = [dirty, bgState.holeX | 0, bgState.holeY | 0, bgState.holeR | 0, bgState.contourAll, dark.toFixed(2), texReady].join();
        if (sig === lastSig && !dirty) return;
        lastSig = sig;
        dirty = false;
      }

      gl.uniform2f(U.uRes, W, H);
      gl.uniform1f(U.uDpr, dpr);
      gl.uniform1f(U.uTime, time);
      gl.uniform2f(U.uTexSize, texSize[0], texSize[1]);
      gl.uniform1f(U.uTexReady, texReady);
      gl.uniform2f(U.uPan, pan.x, pan.y);
      gl.uniform2f(U.uMouse, mouse.x, mouse.y);
      gl.uniform2f(U.uVel, mvel.x, mvel.y);
      gl.uniform1f(U.uMouseOn, reduce ? 0 : mouse.on);
      gl.uniform4fv(U.uRip, ripArr);
      gl.uniform3f(U.uHole, bgState.holeX, bgState.holeY, bgState.holeR);
      gl.uniform1f(U.uContourAll, bgState.contourAll);
      gl.uniform1f(U.uDark, dark);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hintTimer);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointerdown', onDown);
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.removeEventListener('mouseleave', onLeave);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('intro-done', showHint);
      mo.disconnect();
      html.classList.remove('has-bg', 'bg-dragging');
      gl.deleteTexture(tex);
      gl.deleteProgram(program);
    };
  }, []);

  return (
    <>
      <canvas ref={canvasRef} className="page-bg" aria-hidden="true" />
      {hint && (
        <p className="bg-hint chip" role="note">
          <MousePointerClick size={16} aria-hidden="true" /> {t('bg.hint')}
        </p>
      )}
    </>
  );
}
