/* ╔══════════════════════════════════════════════════════════════╗
   ║  LIQUIDEX — "Liquidity Field" · Three.js particle ocean       ║
   ║  A living map of resting orders. Scroll states (set by        ║
   ║  landing.js via window.LIQX):                                  ║
   ║    progress 0→1  camera dive across hero+story                 ║
   ║    cascade  0→1  vortex pulls the field down (the hunt fires)  ║
   ║    burst    0→1  exhaustion bloom (the reversal)               ║
   ║    pal      {hero,hunt,casc,rev} palette weights               ║
   ╚══════════════════════════════════════════════════════════════╝ */
import * as THREE from "three";

const canvas = document.getElementById("liqfield");
const LIQX = (window.LIQX = window.LIQX || {
  progress: 0, cascade: 0, burst: 0,
  pal: { hero: 1, hunt: 0, casc: 0, rev: 0 },
  visible: true,
});

const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

let renderer;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: "high-performance" });
} catch (e) {
  document.body.classList.add("no-webgl");
}

if (renderer) {
  const isMobile = matchMedia("(max-width: 760px)").matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, isMobile ? 1.25 : 1.5));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(58, 1, 0.1, 60);

  /* ── particle grid ── */
  const COLS = isMobile ? 150 : 280;
  const ROWS = isMobile ? 95 : 170;
  const W = 22, D = 16;
  const N = COLS * ROWS;
  const pos = new Float32Array(N * 3);
  const seed = new Float32Array(N);
  let i = 0;
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++, i++) {
      pos[i * 3] = (c / (COLS - 1) - 0.5) * W;
      pos[i * 3 + 1] = 0;
      pos[i * 3 + 2] = -(r / (ROWS - 1)) * D + 1.5;
      seed[i] = Math.random();
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  geo.setAttribute("aSeed", new THREE.BufferAttribute(seed, 1));

  const uniforms = {
    uTime:    { value: 0 },
    uPointer: { value: new THREE.Vector2(99, 99) },   // world xz
    uCascade: { value: 0 },
    uBurst:   { value: 0 },
    uAmp:     { value: 1 },
    uSize:    { value: (isMobile ? 30 : 34) * (devicePixelRatio > 1.4 ? 1.25 : 1) },
    uDeep:    { value: new THREE.Color("#06121f") },
    uCrest:   { value: new THREE.Color("#00E5FF") },
    uHot:     { value: new THREE.Color("#8B7CFF") },
  };

  const mat = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime, uCascade, uBurst, uAmp, uSize;
      uniform vec2 uPointer;
      attribute float aSeed;
      varying float vH, vHot, vFog, vSeed;

      void main(){
        vec3 p = position;
        float t = uTime;

        /* layered swell — the breathing order book */
        float w = 0.0;
        w += 0.38 * sin(p.x * 0.50 + t * 0.55);
        w += 0.27 * sin(p.z * 0.85 - t * 0.42);
        w += 0.16 * sin((p.x + p.z) * 1.25 + t * 0.85);
        w += 0.10 * sin((p.x * 1.9 - p.z * 1.3) + t * 1.4) * aSeed;

        /* cascade vortex — liquidity getting hunted */
        vec2 vc = vec2(0.0, -4.2);
        float dv = distance(p.xz, vc);
        float pull = uCascade * smoothstep(5.2, 0.0, dv);
        w -= pull * (2.6 + 0.7 * sin(t * 3.0 + dv * 2.2));
        float ang = pull * 2.6;
        float cs = cos(ang), sn = sin(ang);
        p.xz = vc + mat2(cs, -sn, sn, cs) * (p.xz - vc);

        /* exhaustion bloom — the reversal */
        float bloom = uBurst * smoothstep(5.5, 0.0, dv);
        w += bloom * (1.9 + 0.55 * sin(t * 2.2 + aSeed * 6.28));

        /* pointer ripple */
        float dp = distance(p.xz, uPointer);
        float rip = exp(-dp * dp * 0.55);
        w += 0.45 * rip * sin(dp * 5.0 - t * 4.0);

        p.y += w * uAmp;

        vH   = clamp(w * 0.5 + 0.5, 0.0, 1.0);
        vHot = clamp(pull * 1.6 + bloom * 1.3 + rip * 0.9, 0.0, 1.0);
        vSeed = aSeed;

        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        vFog = smoothstep(-26.0, -3.0, mv.z);
        gl_PointSize = uSize * (0.55 + 0.45 * vH) * (1.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uDeep, uCrest, uHot;
      varying float vH, vHot, vFog, vSeed;
      void main(){
        vec2 uv = gl_PointCoord - 0.5;
        float d = length(uv);
        float a = smoothstep(0.5, 0.06, d);
        vec3 col = mix(uDeep, uCrest, vH * vH);
        col = mix(col, uHot, vHot);
        col += vSeed * 0.05;
        float alpha = a * (0.16 + 0.50 * vH + 0.35 * vHot) * vFog;
        if (alpha < 0.003) discard;
        gl_FragColor = vec4(col, alpha);
      }`,
  });

  scene.add(new THREE.Points(geo, mat));

  /* ── palettes per story state ── */
  const PAL = {
    hero: { deep: new THREE.Color("#06121f"), crest: new THREE.Color("#00E5FF"), hot: new THREE.Color("#8B7CFF") },
    hunt: { deep: new THREE.Color("#0b0d26"), crest: new THREE.Color("#8B7CFF"), hot: new THREE.Color("#00E5FF") },
    casc: { deep: new THREE.Color("#1d030d"), crest: new THREE.Color("#FF0040"), hot: new THREE.Color("#FF8A65") },
    rev:  { deep: new THREE.Color("#03180b"), crest: new THREE.Color("#00FF41"), hot: new THREE.Color("#00E5FF") },
  };
  const tmpD = new THREE.Color(), tmpC = new THREE.Color(), tmpH = new THREE.Color();

  /* ── pointer → world xz (plane y=0) ── */
  const ray = new THREE.Raycaster();
  const planeY = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
  const ndc = new THREE.Vector2();
  const hit = new THREE.Vector3();
  let targetPtr = new THREE.Vector2(99, 99);
  let parX = 0, parYT = 0, parXT = 0, parY = 0;
  addEventListener("pointermove", (e) => {
    ndc.set((e.clientX / innerWidth) * 2 - 1, -(e.clientY / innerHeight) * 2 + 1);
    parXT = ndc.x; parYT = ndc.y;
    ray.setFromCamera(ndc, camera);
    if (ray.ray.intersectPlane(planeY, hit)) targetPtr.set(hit.x, hit.z);
  }, { passive: true });

  /* ── resize ── */
  function resize() {
    const w = innerWidth, h = innerHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  addEventListener("resize", resize);
  resize();

  /* ── render loop (capped ~60fps — high-refresh displays gain nothing here) ── */
  const clock = new THREE.Clock();
  let raf = null;
  let lastFrame = 0;
  function frame(now) {
    raf = null;
    if (LIQX.visible && !document.hidden) raf = requestAnimationFrame(frame);
    if (now - lastFrame < 15.5) return;
    lastFrame = now;
    const t = reduced ? 8 : clock.getElapsedTime();

    uniforms.uTime.value = t;
    uniforms.uCascade.value = LIQX.cascade;
    uniforms.uBurst.value = LIQX.burst;
    uniforms.uPointer.value.lerp(targetPtr, 0.07);
    parX += (parXT - parX) * 0.05;
    parY += (parYT - parY) * 0.05;

    /* palette blend */
    const p = LIQX.pal;
    const sum = Math.max(p.hero + p.hunt + p.casc + p.rev, 0.0001);
    tmpD.setRGB(0, 0, 0); tmpC.setRGB(0, 0, 0); tmpH.setRGB(0, 0, 0);
    for (const k of ["hero", "hunt", "casc", "rev"]) {
      const w = p[k] / sum;
      tmpD.r += PAL[k].deep.r * w;  tmpD.g += PAL[k].deep.g * w;  tmpD.b += PAL[k].deep.b * w;
      tmpC.r += PAL[k].crest.r * w; tmpC.g += PAL[k].crest.g * w; tmpC.b += PAL[k].crest.b * w;
      tmpH.r += PAL[k].hot.r * w;   tmpH.g += PAL[k].hot.g * w;   tmpH.b += PAL[k].hot.b * w;
    }
    uniforms.uDeep.value.copy(tmpD);
    uniforms.uCrest.value.copy(tmpC);
    uniforms.uHot.value.copy(tmpH);

    /* camera dive with scroll progress */
    const pr = LIQX.progress;
    camera.position.set(
      parX * 0.55,
      2.6 - pr * 1.35 + parY * 0.22,
      5.2 - pr * 1.6
    );
    camera.lookAt(parX * 0.8, -0.4 - pr * 0.5, -5.5);

    renderer.render(scene, camera);
  }
  function wake() { if (!raf && LIQX.visible && !document.hidden) raf = requestAnimationFrame(frame); }
  LIQX.wake = wake;
  document.addEventListener("visibilitychange", wake);
  wake();
} else {
  document.body.classList.add("no-webgl");
}
