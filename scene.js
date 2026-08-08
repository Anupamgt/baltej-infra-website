/**
 * Baltej Infra — Hero 3D scene
 * Abstract structural forms suggesting bridges, beams, and terrain.
 */
import * as THREE from 'three';

const reducedMotion =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  document.body.getAttribute('data-reduced-motion') === 'true';

const canvas = document.getElementById('hero-canvas');
if (!canvas) {
  // no-op if canvas missing
} else {
  initScene();
}

function initScene() {
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x0c1218, 0.028);

  const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    120
  );
  camera.position.set(0, 4.2, 14);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setClearColor(0x0c1218, 1);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;

  // Lights — warm industrial dusk
  const ambient = new THREE.AmbientLight(0x6a7a8c, 0.45);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xffc978, 1.35);
  key.position.set(8, 14, 6);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0x4a6fa5, 0.55);
  fill.position.set(-10, 4, -4);
  scene.add(fill);

  const rim = new THREE.PointLight(0xc4782a, 1.8, 40);
  rim.position.set(-2, 2, 8);
  scene.add(rim);

  const group = new THREE.Group();
  scene.add(group);

  // Materials
  const concrete = new THREE.MeshStandardMaterial({
    color: 0xb8b4ab,
    roughness: 0.72,
    metalness: 0.08,
  });
  const steel = new THREE.MeshStandardMaterial({
    color: 0x3d4f63,
    roughness: 0.35,
    metalness: 0.65,
  });
  const copper = new THREE.MeshStandardMaterial({
    color: 0xc4782a,
    roughness: 0.4,
    metalness: 0.55,
    emissive: 0x3a1e08,
    emissiveIntensity: 0.25,
  });
  const dark = new THREE.MeshStandardMaterial({
    color: 0x1a222c,
    roughness: 0.85,
    metalness: 0.2,
  });

  // Terrain plane with subtle undulation via scaled boxes as landforms
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(80, 80),
    new THREE.MeshStandardMaterial({
      color: 0x151c24,
      roughness: 1,
      metalness: 0,
    })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -1.2;
  group.add(ground);

  // Bridge deck
  const deck = new THREE.Mesh(new THREE.BoxGeometry(18, 0.35, 2.4), concrete);
  deck.position.set(0, 1.8, 0);
  group.add(deck);

  // Bridge supports
  [-6.5, -2, 2.5, 7].forEach((x, i) => {
    const pier = new THREE.Mesh(new THREE.BoxGeometry(0.55, 3.2, 0.55), steel);
    pier.position.set(x, 0.2, 0);
    group.add(pier);

    const cap = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.2, 1.1), copper);
    cap.position.set(x, 1.7, 0);
    group.add(cap);

    // slight height variation
    pier.scale.y = 0.85 + (i % 3) * 0.12;
  });

  // Approach ramp
  const ramp = new THREE.Mesh(new THREE.BoxGeometry(6, 0.28, 2.2), concrete);
  ramp.position.set(-10.5, 0.6, 0.2);
  ramp.rotation.z = 0.18;
  group.add(ramp);

  // Vertical towers / crane-like forms
  const towerA = new THREE.Mesh(new THREE.BoxGeometry(0.4, 7, 0.4), steel);
  towerA.position.set(4.5, 2.5, -3.5);
  group.add(towerA);

  const boom = new THREE.Mesh(new THREE.BoxGeometry(8, 0.22, 0.22), copper);
  boom.position.set(1.2, 5.8, -3.5);
  boom.rotation.z = -0.12;
  group.add(boom);

  const towerB = new THREE.Mesh(new THREE.BoxGeometry(0.55, 5.5, 0.55), dark);
  towerB.position.set(-5, 1.6, -2.8);
  group.add(towerB);

  // Floating structural blocks — depth layers
  const blocks = [];
  const blockData = [
    { x: -8, y: 0.4, z: 3.5, w: 2.2, h: 1.4, d: 1.6, mat: concrete },
    { x: 9, y: 0.2, z: 2.8, w: 1.8, h: 1.1, d: 1.4, mat: dark },
    { x: 7, y: 0.8, z: -5, w: 3, h: 2, d: 1.2, mat: steel },
    { x: -3, y: 0.1, z: 4.5, w: 1.4, h: 0.9, d: 1.2, mat: copper },
    { x: 2, y: -0.2, z: -6, w: 4, h: 0.6, d: 2, mat: concrete },
  ];
  blockData.forEach((b) => {
    const mesh = new THREE.Mesh(
      new THREE.BoxGeometry(b.w, b.h, b.d),
      b.mat
    );
    mesh.position.set(b.x, b.y, b.z);
    group.add(mesh);
    blocks.push(mesh);
  });

  // Wireframe overlay boxes for technical feel
  const wireMat = new THREE.MeshBasicMaterial({
    color: 0xc4782a,
    wireframe: true,
    transparent: true,
    opacity: 0.28,
  });
  const wire = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 3.2), wireMat);
  wire.position.set(-7, 3.2, -4);
  group.add(wire);

  const wire2 = new THREE.Mesh(new THREE.OctahedronGeometry(1.4, 0), wireMat);
  wire2.position.set(8.5, 4, 1);
  group.add(wire2);

  // Particles — dust / construction atmosphere
  const particleCount = 180;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 40;
    positions[i * 3 + 1] = Math.random() * 12;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 30;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particles = new THREE.Points(
    pGeo,
    new THREE.PointsMaterial({
      color: 0xd4a574,
      size: 0.05,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
    })
  );
  scene.add(particles);

  // Pointer parallax
  const pointer = { x: 0, y: 0 };
  const targetRot = { x: 0, y: 0 };

  window.addEventListener('pointermove', (e) => {
    if (document.body.getAttribute('data-reduced-motion') === 'true') return;
    pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
    pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
  });

  // Scroll-linked camera drift
  let scrollY = 0;
  window.addEventListener(
    'scroll',
    () => {
      scrollY = window.scrollY;
    },
    { passive: true }
  );

  // Respect reduce-motion toggle live
  const motionObserver = new MutationObserver(() => {
    // handled in animate via attribute check
  });
  motionObserver.observe(document.body, {
    attributes: true,
    attributeFilter: ['data-reduced-motion'],
  });

  let t = 0;
  const clock = new THREE.Clock();

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    const motionOff =
      reducedMotion ||
      document.body.getAttribute('data-reduced-motion') === 'true';

    if (!motionOff) {
      t += delta;
      group.rotation.y = Math.sin(t * 0.12) * 0.08;
      wire.rotation.x = t * 0.25;
      wire.rotation.y = t * 0.18;
      wire2.rotation.y = -t * 0.35;
      wire2.rotation.z = t * 0.2;

      boom.rotation.z = -0.12 + Math.sin(t * 0.4) * 0.04;

      blocks.forEach((m, i) => {
        m.position.y += Math.sin(t * 0.6 + i) * 0.0015;
      });

      particles.rotation.y = t * 0.02;

      targetRot.y = pointer.x * 0.18;
      targetRot.x = pointer.y * 0.08;
      group.rotation.y += (targetRot.y - group.rotation.y) * 0.04;
      group.rotation.x += (targetRot.x - group.rotation.x) * 0.04;

      const scrollFactor = Math.min(scrollY / window.innerHeight, 1);
      camera.position.y = 4.2 - scrollFactor * 1.5;
      camera.position.z = 14 + scrollFactor * 3;
      camera.lookAt(0, 1.5 - scrollFactor, 0);
    }

    renderer.render(scene, camera);
  }

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  }
  window.addEventListener('resize', onResize);

  animate();
}
