// javascript/globe.js - shows the coffee bean going from taiwan to new york for processing and then to arizona as a final product using three js

import * as threedimensions from 'https://cdn.skypack.dev/three@0.148.0';

function launchWorld() {
  const getContainer = () => document.getElementById('globe-container');
  const container = getContainer();

  const getWidth = () => container.clientWidth || window.innerWidth;
  const getHeight = () => container.clientHeight || 600;
  const w = getWidth();
  const h = getHeight();

  const createRenderer = () => new threedimensions.WebGLRenderer({ canvas: container, antialias: true, alpha: true });
  const painter = createRenderer();
  const configureRenderer = () => {
    painter.setSize(w, h);
    painter.setPixelRatio(window.devicePixelRatio);
  };
  configureRenderer();

  const world = new threedimensions.Scene();

  const getLens = () => new threedimensions.PerspectiveCamera(45, w / h, 0.1, 1000);
  const lens = getLens();
  const positionLens = () => lens.position.z = 3;
  positionLens();

  const makeDirectionalLight = () => new threedimensions.DirectionalLight(0xffffff, 1);
  const lighting = makeDirectionalLight();
  const moveLight = () => lighting.position.set(5, 5, 5);
  moveLight();

  world.add(lighting);

  const amb = new threedimensions.AmbientLight(0x888888);
  world.add(amb);

  const fetcher = new threedimensions.TextureLoader();

  const toRadians = d => d * Math.PI / 180;

  fetcher.load('images/earth-rect-1.jpg', function handleEarthTexture(skin) {
    const sphereGeo = () => new threedimensions.SphereGeometry(1, 64, 64);
    const sphereMat = () => new threedimensions.MeshStandardMaterial({ map: skin });

    const earth = new threedimensions.Mesh(sphereGeo(), sphereMat());
    const rotEarth = () => earth.rotation.y = -4.19;
    rotEarth();
    world.add(earth);

    let correctRotation = 0.2;
    let spinning = true;
    let completed = false;

    function renderScene() {
      if (spinning) {
        if (earth.rotation.y < correctRotation - 0.01) {
          earth.rotation.y += 0.002;
        } else {
          earth.rotation.y = correctRotation;
          spinning = false;
        }
      }
      painter.render(world, lens);
    }

    function flyPath(startLat, startLon, endLat, endLon, steps, scale, imagePath, wait = false) {
      fetcher.load(imagePath, function(graphic) {
        const makeSpriteMaterial = () => new threedimensions.SpriteMaterial({ map: graphic, transparent: true, depthTest: false });
        const shell = makeSpriteMaterial();

        const icon = new threedimensions.Sprite(shell);
        icon.scale.set(scale, scale, 1);
        icon.renderOrder = 1;
        earth.add(icon);

        const rad = 1.01;
        const toVec3 = (lat, lon) => {
          const x = rad * Math.cos(lat) * Math.cos(lon);
          const y = rad * Math.sin(lat);
          const z = rad * Math.cos(lat) * Math.sin(lon);
          return new threedimensions.Vector3(x, y, z);
        };

        const src = toVec3(startLat, startLon);
        const dst = toVec3(endLat, endLon);

        const path = [];
        const pushPathPoints = () => {
          for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const arc = new threedimensions.Vector3().copy(src).lerp(dst, t).normalize().multiplyScalar(rad + 0.05 * Math.sin(Math.PI * t));
            path.push(arc.clone());
          }
        };
        pushPathPoints();

        const buildDots = () => {
          for (let j = 0; j < path.length; j += 2) {
            const geo = new threedimensions.SphereGeometry(scale * 0.08, 8, 8);
            const mat = new threedimensions.MeshBasicMaterial({ color: 0x3e2f27 });
            const dot = new threedimensions.Mesh(geo, mat);
            dot.position.copy(path[j]);
            earth.add(dot);
          }
        };
        buildDots();

        let tick = 0;

        function tickLoop() {
          requestAnimationFrame(tickLoop);
          renderScene();

          if (wait && !completed) return earth.remove(icon);
          if (!wait && tick > 1) { completed = true; earth.remove(icon); return; }
          if (wait && tick >= 1) return earth.remove(icon);
          if (wait && completed && tick < 1) earth.add(icon);

          if (!wait || (wait && completed)) {
            const id = Math.floor(tick * steps);
            icon.position.copy(path[id]);
            if (wait && tick >= 0.5) icon.material.rotation = Math.PI / 4;
            tick += 0.0015;
          }
        }
        tickLoop();
      });
    }

    const coords = [
      [25, 240, 45, 80, 100, 0.25, 'images/plane.png', false],
      [45, 80, 35, 110, 40, 0.2, 'images/plane_us.png', true]
    ];
    coords.forEach(args => flyPath(...args.map((v, i) => i < 4 ? toRadians(v) : v)));

    function dropImage(imagePath, lat, lon, size = 0.2, shift = 0) {
      fetcher.load(imagePath, function(texture) {
        const sprMat = new threedimensions.SpriteMaterial({ map: texture });
        const spr = new threedimensions.Sprite(sprMat);
        spr.scale.set(size, size, 1);

        const rad = 1.01;
        const x = rad * Math.cos(lat) * Math.cos(lon);
        const y = rad * Math.sin(lat);
        const z = rad * Math.cos(lat) * Math.sin(lon);
        spr.position.set(x, y, z + shift);
        earth.add(spr);

        function foreverLoop() {
          requestAnimationFrame(foreverLoop);
          renderScene();
        }
        foreverLoop();
      });
    }

    dropImage('images/coffee_factory.png', toRadians(45), toRadians(80), 0.2, 0.15);
    dropImage('images/the-coffee-bean.png', toRadians(25), toRadians(240), 0.2, -0.05);
    dropImage('images/iced-coffee-clipart.png', toRadians(35), toRadians(110), 0.2, 0.05);
  });
}

document.addEventListener('DOMContentLoaded', function() {
  const whatToWatch = () => document.getElementById('globe-container');
  const target = whatToWatch();

  function visibilityHandler(items) {
    items.forEach(item => {
      if (item.isIntersecting) launchWorld();
    });
  }

  const options = { root: null, threshold: 0.15 };
  const observe = new IntersectionObserver(visibilityHandler, options);
  observe.observe(target);
});