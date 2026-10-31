import * as THREE from 'three';

// =============================================
// HERO 3D (Three.js)
// =============================================
const stage  = document.querySelector('.hero-stage');
const canvas = document.getElementById('hero-canvas');

if (stage && canvas && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  try {
    initHero3D();
  } catch (err) {
    // WebGL indisponible : le hero reste lisible sans la scène
    console.warn('Hero 3D désactivé :', err);
    canvas.remove();
  }
}

function initHero3D() {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  camera.position.z = 6;

  const css = getComputedStyle(document.documentElement);
  const colors = {
    accent: new THREE.Color(css.getPropertyValue('--accent').trim()),
    light:  new THREE.Color(css.getPropertyValue('--accent-light').trim()),
  };

  // --- Champ de particules ---
  const COUNT = 1600;
  const positions = new Float32Array(COUNT * 3);
  for (let i = 0; i < COUNT; i++) {
    // Réparties dans tout le champ visible de la caméra
    positions[i * 3]     = (Math.random() - 0.5) * 26;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 15;
    positions[i * 3 + 2] = -8 + Math.random() * 12;
  }
  const particleGeo = new THREE.BufferGeometry();
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  // Sprite rond pour les particules
  const sprite = document.createElement('canvas');
  sprite.width = sprite.height = 32;
  const sctx = sprite.getContext('2d');
  sctx.beginPath();
  sctx.arc(16, 16, 14, 0, Math.PI * 2);
  sctx.fillStyle = '#fff';
  sctx.fill();
  const particleMat = new THREE.PointsMaterial({
    color: colors.light, size: 0.07, map: new THREE.CanvasTexture(sprite),
    alpha: true, alphaTest: 0.1, sizeAttenuation: true, transparent: true, opacity: 0.8,
  });
  const particles = new THREE.Points(particleGeo, particleMat);
  scene.add(particles);

  // --- Taille / placement responsive ---
  function resize() {
    const { clientWidth: w, clientHeight: h } = stage;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  resize();
  window.addEventListener('resize', resize);

  // --- Thème clair / sombre ---
  function syncTheme() {
    const dark = document.documentElement.classList.contains('dark');
    particleMat.opacity = dark ? 0.9 : 0.9;
    particleMat.color.copy(dark ? colors.light : colors.accent);
  }
  syncTheme();
  new MutationObserver(syncTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });

  // --- Interaction souris ---
  const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
  window.addEventListener('mousemove', (e) => {
    pointer.tx = (e.clientX / window.innerWidth  - 0.5) * 2;
    pointer.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  });

  // --- Boucle (en pause quand le hero n'est pas visible) ---
  let visible = true;
  new IntersectionObserver(([entry]) => { visible = entry.isIntersecting; }).observe(stage);

  const clock = new THREE.Clock();
  renderer.setAnimationLoop(() => {
    if (!visible) return;
    const t = clock.getElapsedTime();

    pointer.x += (pointer.tx - pointer.x) * 0.05;
    pointer.y += (pointer.ty - pointer.y) * 0.05;

    particles.rotation.y = t * 0.03 + pointer.x * 0.15;
    particles.rotation.x = pointer.y * 0.1;

    renderer.render(scene, camera);
  });
}
