import * as THREE from './vendor/three.module.min.js';

const host = document.querySelector('[data-hero-globe]');
const canvas = host?.querySelector('[data-globe-canvas]');

if (host && canvas) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const renderer = new THREE.WebGLRenderer({
    canvas,
    alpha: true,
    antialias: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.15;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
  camera.position.set(0, 0, 7.2);

  const globe = new THREE.Group();
  globe.rotation.set(-0.08, -0.42, -0.16);
  scene.add(globe);

  const radius = 2.18;
  const oceanGeometry = new THREE.SphereGeometry(radius, 64, 48);
  const oceanMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x071d3b,
    emissive: 0x071a36,
    emissiveIntensity: 0.55,
    metalness: 0.12,
    roughness: 0.46,
    clearcoat: 0.58,
    transparent: true,
    opacity: 0.86
  });
  const ocean = new THREE.Mesh(oceanGeometry, oceanMaterial);
  globe.add(ocean);

  const gridMaterial = new THREE.LineBasicMaterial({
    color: 0x5c9df1,
    transparent: true,
    opacity: 0.18
  });
  const grid = new THREE.Group();
  const gridRadius = radius + 0.012;

  for (let latitude = -75; latitude <= 75; latitude += 15) {
    const radians = THREE.MathUtils.degToRad(latitude);
    const ringRadius = Math.cos(radians) * gridRadius;
    const y = Math.sin(radians) * gridRadius;
    const ring = [];
    for (let step = 0; step <= 128; step += 1) {
      const angle = (step / 128) * Math.PI * 2;
      ring.push(new THREE.Vector3(
        Math.cos(angle) * ringRadius,
        y,
        Math.sin(angle) * ringRadius
      ));
    }
    grid.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(ring),
      gridMaterial
    ));
  }

  for (let longitude = 0; longitude < 180; longitude += 15) {
    const radians = THREE.MathUtils.degToRad(longitude);
    const meridian = [];
    for (let step = 0; step <= 128; step += 1) {
      const angle = (step / 128) * Math.PI * 2;
      meridian.push(new THREE.Vector3(
        Math.sin(angle) * Math.cos(radians) * gridRadius,
        Math.cos(angle) * gridRadius,
        Math.sin(angle) * Math.sin(radians) * gridRadius
      ));
    }
    grid.add(new THREE.Line(
      new THREE.BufferGeometry().setFromPoints(meridian),
      gridMaterial
    ));
  }
  globe.add(grid);

  const atmosphere = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 1.09, 64, 48),
    new THREE.ShaderMaterial({
      transparent: true,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float glow = pow(max(0.0, 0.76 - dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
          gl_FragColor = vec4(0.16, 0.48, 1.0, glow * 0.58);
        }
      `
    })
  );
  scene.add(atmosphere);

  scene.add(new THREE.HemisphereLight(0x8fc2ff, 0x020813, 2.4));
  const keyLight = new THREE.DirectionalLight(0xd8eaff, 2.65);
  keyLight.position.set(-4, 4, 6);
  scene.add(keyLight);
  const edgeLight = new THREE.PointLight(0x1678ff, 19, 24, 1.8);
  edgeLight.position.set(4, -1.5, 4);
  scene.add(edgeLight);

  const lonLatToVector = (longitude, latitude, globeRadius = radius) => {
    const phi = THREE.MathUtils.degToRad(90 - latitude);
    const theta = THREE.MathUtils.degToRad(longitude + 180);
    return new THREE.Vector3(
      -globeRadius * Math.sin(phi) * Math.cos(theta),
      globeRadius * Math.cos(phi),
      globeRadius * Math.sin(phi) * Math.sin(theta)
    );
  };

  const landMaterial = new THREE.LineBasicMaterial({
    color: 0xb9d8ff,
    transparent: true,
    opacity: 0.82
  });
  const land = new THREE.Group();
  globe.add(land);

  const addLandRing = (coordinates) => {
    let segment = [];
    const flush = () => {
      if (segment.length > 1) {
        land.add(new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(segment),
          landMaterial
        ));
      }
      segment = [];
    };

    coordinates.forEach(([longitude, latitude], index) => {
      if (index > 0 && Math.abs(longitude - coordinates[index - 1][0]) > 180) flush();
      segment.push(lonLatToVector(longitude, latitude, radius + 0.025));
    });
    flush();
  };

  fetch('./data/ne_110m_land.geojson')
    .then((response) => {
      if (!response.ok) throw new Error('Map data could not be loaded.');
      return response.json();
    })
    .then((geojson) => {
      geojson.features.forEach((feature) => {
        const { type, coordinates } = feature.geometry;
        const polygons = type === 'Polygon' ? [coordinates] : coordinates;
        polygons.forEach((polygon) => polygon.forEach(addLandRing));
      });
    })
    .catch(() => {
      host.classList.add('is-map-fallback');
    });

  const arcMaterial = new THREE.MeshBasicMaterial({
    color: 0x69a9ff,
    transparent: true,
    opacity: 0.58
  });
  const markerMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    emissive: 0x3688ff,
    emissiveIntensity: 1.25,
    roughness: 0.2
  });
  const markerGeometry = new THREE.SphereGeometry(0.035, 12, 8);
  const origin = [28.9784, 41.0082];
  const destinations = [
    [-0.1276, 51.5072],
    [-74.006, 40.7128],
    [55.2708, 25.2048]
  ];
  const pulses = [];

  destinations.forEach((destination, index) => {
    const start = lonLatToVector(...origin, radius + 0.04);
    const end = lonLatToVector(...destination, radius + 0.04);
    const midpoint = start.clone().add(end).normalize().multiplyScalar(radius + 0.52 + index * 0.08);
    const curve = new THREE.QuadraticBezierCurve3(start, midpoint, end);
    const arc = new THREE.Mesh(
      new THREE.TubeGeometry(curve, 42, 0.009, 6, false),
      arcMaterial
    );
    globe.add(arc);

    const pulse = new THREE.Mesh(markerGeometry, markerMaterial);
    pulse.position.copy(start);
    globe.add(pulse);
    pulses.push({ curve, mesh: pulse, offset: index / destinations.length });
  });

  const originMarker = new THREE.Mesh(
    new THREE.SphereGeometry(0.055, 14, 10),
    markerMaterial
  );
  originMarker.position.copy(lonLatToVector(...origin, radius + 0.05));
  globe.add(originMarker);

  const starPositions = [];
  for (let index = 0; index < 90; index += 1) {
    const seed = index + 1;
    starPositions.push(
      Math.sin(seed * 12.9898) * 6.8,
      Math.sin(seed * 78.233) * 5.2,
      -2.5 - Math.abs(Math.cos(seed * 39.346)) * 4
    );
  }
  const starsGeometry = new THREE.BufferGeometry();
  starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
  const stars = new THREE.Points(starsGeometry, new THREE.PointsMaterial({
    color: 0x7eafea,
    size: 0.022,
    transparent: true,
    opacity: 0.46,
    depthWrite: false
  }));
  scene.add(stars);

  let targetTiltX = -0.08;
  let targetTiltZ = -0.16;
  let currentTiltX = targetTiltX;
  let currentTiltZ = targetTiltZ;
  let rotationY = -0.42;
  let visible = true;
  let frame = 0;

  const resize = () => {
    const { width, height } = host.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height, false);
    camera.aspect = width / height;
    camera.position.z = width < 520 ? 9.3 : 10.2;
    camera.updateProjectionMatrix();
    renderer.render(scene, camera);
  };

  const render = (time = 0) => {
    currentTiltX += (targetTiltX - currentTiltX) * 0.035;
    currentTiltZ += (targetTiltZ - currentTiltZ) * 0.035;
    if (!reducedMotion) rotationY += 0.00105;
    globe.rotation.x = currentTiltX;
    globe.rotation.y = rotationY;
    globe.rotation.z = currentTiltZ;
    pulses.forEach(({ curve, mesh, offset }) => {
      const progress = reducedMotion ? offset : (time * 0.00016 + offset) % 1;
      mesh.position.copy(curve.getPoint(progress));
    });
    renderer.render(scene, camera);
    if (!reducedMotion && visible) frame = window.requestAnimationFrame(render);
  };

  host.addEventListener('pointermove', (event) => {
    if (reducedMotion || event.pointerType === 'touch') return;
    const rect = host.getBoundingClientRect();
    const x = (event.clientX - rect.left) / rect.width - 0.5;
    const y = (event.clientY - rect.top) / rect.height - 0.5;
    targetTiltX = -0.08 - y * 0.2;
    targetTiltZ = -0.16 + x * 0.08;
  });
  host.addEventListener('pointerleave', () => {
    targetTiltX = -0.08;
    targetTiltZ = -0.16;
  });

  new ResizeObserver(resize).observe(host);
  new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible && !reducedMotion && !frame) frame = window.requestAnimationFrame(render);
    if (!visible && frame) {
      window.cancelAnimationFrame(frame);
      frame = 0;
    }
  }, { threshold: 0.05 }).observe(host);

  window.addEventListener('pagehide', () => {
    window.cancelAnimationFrame(frame);
    renderer.dispose();
  }, { once: true });

  resize();
  render();
}
