'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { prefersReducedMotion } from '@/lib/scroll';

/**
 * Faresa at his desk. The model is built in Blender by script (tools/blender/faresa.py, contract in
 * tools/blender/faresa-contract.md) with ambient occlusion baked into vertex colours, and posed here: he types,
 * breathes, blinks and glances towards the cursor; every 12 s he swivels his chair round to wave, then turns back.
 * Around him are his hobbies: a game controller, a hiking pack, a fishing rod and his motorcycle helmet.
 */

const MODEL = '/models/faresa-desk.glb';

// Paint slots by material name (colours also live in the Blender script for its preview).
const PAINT: Record<string, { color: string; roughness?: number; metalness?: number }> = {
  skin: { color: '#a96f4d', roughness: 0.7 }, // a shade darker than the photo: the env light brightens it
  hair: { color: '#1d1a18', roughness: 0.6 },
  eye: { color: '#191615', roughness: 0.3 },
  brow: { color: '#1d1a18' },
  mouth: { color: '#7a4434' },
  sclera: { color: '#f3efe9', roughness: 0.3 },
  lip: { color: '#94594a', roughness: 0.6 },
  tee: { color: '#e2522b' },
  jacket: { color: '#3b3e44' },
  pants: { color: '#7d8088' },
  shoe: { color: '#3f6f4e', roughness: 0.6 },
  sole: { color: '#f1efe9' },
  chair: { color: '#f6f6f4', roughness: 0.55 },
  metal: { color: '#8f949b', roughness: 0.35, metalness: 0.6 },
  desk: { color: '#f4f1ea', roughness: 0.6 },
  deskLeg: { color: '#c9a27a' },
  monitor: { color: '#2b2d33', roughness: 0.5 },
  keyboard: { color: '#e9e7e2', roughness: 0.5 },
  mug: { color: '#2f58cc', roughness: 0.35 },
  pot: { color: '#ece6dc' },
  leaf: { color: '#6bbf59', roughness: 0.6 },
  helmet: { color: '#17181b', roughness: 0.25, metalness: 0.2 },
  visor: { color: '#6a4fd8', roughness: 0.15, metalness: 0.6 },
  rugOuter: { color: '#e7b45b', roughness: 0.95 },
  rugInner: { color: '#f1d48a', roughness: 0.95 },
  pad: { color: '#2b2d33', roughness: 0.5 },
  btnRed: { color: '#e2522b' },
  btnBlue: { color: '#2f58cc' },
  btnGreen: { color: '#6bbf59' },
  btnYellow: { color: '#f2c76e' },
  rod: { color: '#3a3d45', roughness: 0.4 },
  rodGrip: { color: '#7a4f32' },
  reel: { color: '#c9ccd2', roughness: 0.3, metalness: 0.6 },
  bobber: { color: '#e2522b' },
  pack: { color: '#d9822b' },
  packDark: { color: '#b86a1f' },
  packRoll: { color: '#3f6f4e' },
  patch: { color: '#f4f1ea' },
};
const JACKET_DARK_MODE = '#7a8fb8'; // light slate blue: readable on the dark page, distinct from the grey trousers

// Arm lengths and the shoulder joints in torso space (match tools/blender/faresa.py).
const UPPER = 0.25;
const FORE = 0.24;

/** The monitor picture: a video-editor timeline on top, code scrolling below. */
function makeScreen() {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;
  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  const code = Array.from({ length: 40 }, (_, i) => ({
    indent: [0, 1, 2, 2, 1, 2, 3, 1][i % 8],
    parts: Array.from({ length: 1 + ((i * 7) % 4) }, (_, k) => ({
      w: 20 + ((i * 13 + k * 29) % 70),
      c: ['#8eaaf0', '#f2c76e', '#e07a8a', '#9ad3a1', '#c6c9d1'][(i + k) % 5],
    })),
  }));

  const draw = (t: number) => {
    ctx.fillStyle = '#16181d';
    ctx.fillRect(0, 0, 512, 320);
    // window dots
    ['#ff5f57', '#febc2e', '#28c840'].forEach((c, i) => {
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(18 + i * 16, 16, 5, 0, Math.PI * 2);
      ctx.fill();
    });
    // timeline: three tracks of clips and a moving playhead
    const tracks = [
      ['#2f58cc', '#5b7ee0', '#2f58cc', '#7d97e6'],
      ['#e2522b', '#f08a5d', '#e2522b'],
      ['#3f6f4e', '#5f9a6e', '#3f6f4e', '#5f9a6e', '#3f6f4e'],
    ];
    tracks.forEach((clips, r) => {
      let x = 16;
      clips.forEach((c, i) => {
        const w = 70 + ((r * 31 + i * 47) % 60);
        ctx.fillStyle = c;
        ctx.fillRect(x, 34 + r * 22, w - 4, 16);
        x += w;
      });
    });
    const ph = 16 + ((t * 60) % 480);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ph, 30, 2, 70);
    // code
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 110, 512, 210);
    ctx.clip();
    const scroll = (t * 18) % (code.length * 16);
    for (let i = 0; i < code.length * 2; i++) {
      const line = code[i % code.length];
      const y = 118 + i * 16 - scroll;
      if (y < 100 || y > 330) continue;
      ctx.fillStyle = '#4a4f5a';
      ctx.fillRect(12, y, 14, 7);
      let x = 36 + line.indent * 18;
      line.parts.forEach((p) => {
        ctx.fillStyle = p.c;
        ctx.fillRect(x, y, p.w, 7);
        x += p.w + 8;
      });
    }
    ctx.restore();
    tex.needsUpdate = true;
  };
  return { tex, draw };
}

/** Two-bone IK: elbow position for shoulder S reaching for wrist W, bending towards `pole`. Clamps W to reach. */
function solveArm(S: THREE.Vector3, W: THREE.Vector3, pole: THREE.Vector3, E: THREE.Vector3) {
  const d = new THREE.Vector3().subVectors(W, S);
  const len = THREE.MathUtils.clamp(d.length(), Math.abs(UPPER - FORE) + 1e-3, UPPER + FORE - 1e-3);
  const dir = d.normalize();
  W.copy(S).addScaledVector(dir, len);
  const a = (UPPER * UPPER - FORE * FORE + len * len) / (2 * len);
  const h = Math.sqrt(Math.max(0, UPPER * UPPER - a * a));
  const bend = pole.clone().addScaledVector(dir, -pole.dot(dir)).normalize();
  E.copy(S).addScaledVector(dir, a).addScaledVector(bend, h);
}

const UP = new THREE.Vector3(0, 1, 0);
const aim = (o: THREE.Object3D, from: THREE.Vector3, to: THREE.Vector3) => {
  o.position.copy(from);
  o.quaternion.setFromUnitVectors(UP, new THREE.Vector3().subVectors(to, from).normalize());
};

export default function DeskScene({ className }: { className?: string }) {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const reduce = prefersReducedMotion();
    let disposed = false;

    // ─── Renderer, camera, light ───────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    host.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envTex = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environment = envTex;
    scene.environmentIntensity = 0.55;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    const target = new THREE.Vector3(0.12, 0.62, 0);

    const sun = new THREE.DirectionalLight('#fff4e6', 2.0);
    sun.position.set(-2.5, 4.5, 3);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -1.8, right: 1.8, top: 1.8, bottom: -1.8 });
    sun.shadow.radius = 5;
    sun.shadow.bias = -0.0006;
    sun.shadow.normalBias = 0.02;
    scene.add(sun);
    const hemi = new THREE.HemisphereLight('#ffffff', '#d9cbb8', 0.7);
    scene.add(hemi);
    const rim = new THREE.DirectionalLight('#b9c8ff', 0);
    rim.position.set(2.5, 2.2, -3);
    scene.add(rim);

    const room = new THREE.Group();
    room.rotation.y = 0.12;
    scene.add(room);

    // ─── Monitor picture and coffee steam (live, so they stay in code) ────
    const screen = makeScreen();
    const screenMesh = new THREE.Mesh(
      new THREE.PlaneGeometry(0.66, 0.4),
      new THREE.MeshBasicMaterial({ map: screen.tex, toneMapped: false }),
    );
    screenMesh.position.set(0.597, 1.205, 0.02);
    screenMesh.rotation.y = -Math.PI / 2;
    room.add(screenMesh);
    const steamMat = new THREE.MeshStandardMaterial({ color: '#ffffff', transparent: true, opacity: 0.5, roughness: 1 });
    const steam = Array.from({ length: 3 }, () => {
      const s = new THREE.Mesh(new THREE.SphereGeometry(0.016, 10, 10), steamMat.clone());
      room.add(s);
      return s;
    });
    const MUG_TOP = new THREE.Vector3(0.28, 0.9, 0.5);

    // ─── Rig, filled once the model has loaded ────────────────────────────
    let rig: null | {
      me: THREE.Group;
      chair: THREE.Group;
      torso: THREE.Group;
      torsoY: number;
      head: THREE.Group;
      eyes: THREE.Object3D;
      arms: { side: number; upper: THREE.Object3D; fore: THREE.Object3D; hand: THREE.Object3D; shoulder: THREE.Vector3 }[];
    } = null;
    const jacketMats: THREE.MeshStandardMaterial[] = [];

    new GLTFLoader().load(
      MODEL,
      (gltf) => {
        if (disposed) return;
        const nodes: Record<string, THREE.Object3D> = {};
        gltf.scene.traverse((o) => {
          if (o.name) nodes[o.name] = o;
          if (o instanceof THREE.Mesh) {
            const name = (o.material as THREE.Material).name;
            const p = PAINT[name] ?? { color: '#cccccc' };
            const mat = new THREE.MeshStandardMaterial({
              name,
              color: p.color,
              roughness: p.roughness ?? 0.85,
              metalness: p.metalness ?? 0,
              vertexColors: !!o.geometry.getAttribute('color'),
            });
            if (name === 'jacket') jacketMats.push(mat);
            o.material = mat;
            o.castShadow = true;
            o.receiveShadow = true;
          }
        });

        // Joint groups at the node origins, nested hips → torso → head, so posing is local.
        const pivot = (name: string, parent: THREE.Object3D, parentWorld = new THREE.Vector3()) => {
          const node = nodes[name];
          const g = new THREE.Group();
          g.position.copy(node.position).sub(parentWorld);
          parent.add(g);
          node.position.set(0, 0, 0);
          g.add(node);
          return g;
        };
        const at = (name: string) => nodes[name].position.clone();
        const P = { legs: at('legs'), torso: at('torso'), head: at('head'), eyes: at('eyes'), chair: at('chair') };

        room.add(nodes.room);
        const chair = pivot('chair', room);
        const me = pivot('legs', room);
        const torso = pivot('torso', me, P.legs);
        const head = pivot('head', torso, P.torso);
        const eyes = pivot('eyes', head, P.head);
        const arms = [
          { side: 1, key: 'L' },
          { side: -1, key: 'R' },
        ].map(({ side, key }) => {
          const shoulder = at('upperArm_' + key).sub(P.torso);
          const parts = ['upperArm_', 'foreArm_', 'hand_'].map((n) => {
            const o = nodes[n + key];
            o.position.set(0, 0, 0);
            torso.add(o);
            return o;
          });
          return { side, upper: parts[0], fore: parts[1], hand: parts[2], shoulder };
        });
        rig = { me, chair, torso, torsoY: torso.position.y, head, eyes, arms };
        applyTheme();
        if (reduce) {
          pose(1.2);
          renderer.render(scene, camera);
        }
      },
      undefined,
      () => host.setAttribute('data-model-error', 'true'),
    );

    // ─── Theme ─────────────────────────────────────────────────────────────
    const applyTheme = () => {
      const dark = document.documentElement.dataset.theme === 'dark';
      jacketMats.forEach((m) => m.color.set(dark ? JACKET_DARK_MODE : PAINT.jacket.color));
      hemi.intensity = dark ? 1.0 : 0.7;
      scene.environmentIntensity = dark ? 0.7 : 0.55;
      rim.intensity = dark ? 2.2 : 0;
      if (reduce && rig) renderer.render(scene, camera);
    };
    const themeWatch = new MutationObserver(applyTheme);
    themeWatch.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

    // ─── Animation ─────────────────────────────────────────────────────────
    const pointer = { x: 0, y: 0 };
    const onPointer = (e: PointerEvent) => {
      const r = host.getBoundingClientRect();
      pointer.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      pointer.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    };
    window.addEventListener('pointermove', onPointer, { passive: true });

    const look = { yaw: 0, pitch: 0 };
    const smooth = (a: number, b: number, x: number) => THREE.MathUtils.smoothstep(x, a, b);
    const SWIVEL = -1.4; // ~80°: enough to face the viewer from this camera
    const W = new THREE.Vector3();
    const E = new THREE.Vector3();
    const pole = new THREE.Vector3();
    const tmp = new THREE.Vector3();
    let screenTick = -1;

    function pose(t: number) {
      if (!rig) return;
      // Every 12 s he swivels the chair towards the viewer, waves, and turns back.
      const cycle = t % 12;
      const turn = smooth(8, 8.9, cycle) * (1 - smooth(10.8, 11.7, cycle));
      const wave = smooth(8.8, 9.2, cycle) * (1 - smooth(10.4, 10.8, cycle));
      rig.me.rotation.y = SWIVEL * turn;
      rig.chair.rotation.y = SWIVEL * turn;
      rig.torso.position.y = rig.torsoY + Math.sin(t * 1.8) * 0.005;

      // a small, slow glance towards the pointer; a little nod up when greeting
      const wantYaw = pointer.x * -0.12 - 0.04 - turn * 0.3; // head adds ≤17° while greeting
      const wantPitch = pointer.y * 0.06 + 0.05 - turn * 0.1;
      look.yaw += (wantYaw - look.yaw) * 0.04;
      look.pitch += (wantPitch - look.pitch) * 0.04;
      rig.head.rotation.y = look.yaw;
      rig.head.rotation.z = look.pitch;
      rig.eyes.scale.y = t % 3.7 < 0.12 ? 0.15 : 1;

      rig.arms.forEach((a, i) => {
        const typing = Math.max(0, Math.sin(t * 14 + i * Math.PI)) * 0.022 * (1 - turn);
        W.set(0.46, 0.3 + typing, a.side * 0.11).lerp(tmp.set(0.3, 0.1, a.side * 0.11), turn);
        pole.set(-0.2, -1, a.side * 0.5);
        if (a.side === 1 && wave > 0) {
          // hand up beside his head, outside its silhouette, rocking ±20° at 2.5 Hz
          const rock = Math.sin(t * Math.PI * 5) * 0.07 * wave;
          W.lerp(tmp.set(0.04 + rock, 0.8, 0.38), wave);
          pole.lerp(tmp.set(0, -0.2, 1), wave);
        }
        solveArm(a.shoulder, W, pole, E);
        aim(a.upper, a.shoulder, E);
        aim(a.fore, E, W);
        a.hand.position.copy(W);
        a.hand.quaternion.copy(a.fore.quaternion);
      });

      steam.forEach((s, i) => {
        const k = (t * 0.35 + i / 3) % 1;
        s.position.set(MUG_TOP.x + Math.sin((k + i) * 6) * 0.015, MUG_TOP.y + k * 0.16, MUG_TOP.z);
        (s.material as THREE.MeshStandardMaterial).opacity = 0.5 * (1 - k);
        s.scale.setScalar(0.7 + k);
      });
      if (t - screenTick > 0.1) {
        screen.draw(t);
        screenTick = t;
      }
    }

    // ─── Size & loop ───────────────────────────────────────────────────────
    // ─── Drag to turn the scene ───────────────────────────────────────────
    // Rotation only (no zoom or pan). Limits keep the camera above the rug. After the visitor lets go, the view
    // eases back to the default angle. On touch screens a vertical swipe still scrolls the page; a sideways drag turns.
    const HOME_DIR = new THREE.Vector3(-1.9, 2.25, 3.4).normalize();
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(target);
    controls.enableZoom = false;
    controls.enablePan = false;
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.rotateSpeed = 0.7;
    controls.minPolarAngle = 0.35;
    controls.maxPolarAngle = 1.32;
    renderer.domElement.style.touchAction = 'pan-y';
    renderer.domElement.style.cursor = 'grab';
    let dragging = false;
    let releasedAt = -Infinity;
    controls.addEventListener('start', () => {
      dragging = true;
      renderer.domElement.style.cursor = 'grabbing';
    });
    controls.addEventListener('end', () => {
      dragging = false;
      releasedAt = performance.now();
      renderer.domElement.style.cursor = 'grab';
    });
    controls.addEventListener('change', () => {
      if (reduce && rig) renderer.render(scene, camera);
    });
    const dist = () => (camera.aspect < 0.9 ? 1.32 : 1.1) * new THREE.Vector3(-1.9, 2.25, 3.4).length();
    const homeStep = new THREE.Vector3();
    const easeHome = () => {
      if (dragging || performance.now() - releasedAt < 2500) return;
      homeStep.subVectors(camera.position, target).normalize().lerp(HOME_DIR, 0.04).normalize();
      camera.position.copy(target).addScaledVector(homeStep, dist());
    };

    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      // keep the current angle, refit the distance to the frame
      const dir = camera.position.lengthSq() ? camera.position.clone().sub(target).normalize() : HOME_DIR;
      camera.position.copy(target).addScaledVector(dir, dist());
      camera.updateProjectionMatrix();
      controls.update();
      if (reduce && rig) renderer.render(scene, camera);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(host);
    resize();

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), { threshold: 0 });
    io.observe(host);

    const timer = new THREE.Timer();
    if (!reduce) {
      renderer.setAnimationLoop(() => {
        if (!visible || document.hidden || !rig) return;
        timer.update();
        pose(timer.getElapsed());
        easeHome();
        controls.update();
        renderer.render(scene, camera);
      });
    } else {
      screen.draw(0);
    }

    return () => {
      disposed = true;
      renderer.setAnimationLoop(null);
      controls.dispose();
      themeWatch.disconnect();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('pointermove', onPointer);
      scene.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose();
          (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
        }
      });
      screen.tex.dispose();
      envTex.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className={className}
      role="img"
      title="Drag to turn"
      aria-label="Animated 3D character of Faresa, drag to turn it. Shows him typing at his desk, with an AI video timeline on the monitor, a game controller, a hiking pack, a fishing rod and his motorcycle helmet"
    />
  );
}
