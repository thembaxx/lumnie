'use client';
import { useEffect, useRef, useState } from 'react';
import type { SceneKind } from './data';
import * as THREE from 'three';

type Props = {
  kind?: SceneKind;
  playing?: boolean;
  value?: number;
  exploded?: boolean;
  resetKey?: number;
  onSelect?: (label: string) => void;
  onReady?: (renderer: string) => void;
};
export default function Scene({
  kind = 'atom',
  playing = true,
  value = 30,
  exploded = false,
  resetKey = 0,
  onSelect,
  onReady,
}: Props) {
  const host = useRef<HTMLDivElement>(null);
  const live = useRef({ playing, value, exploded, onSelect });
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    live.current = { playing, value, exploded, onSelect };
  }, [playing, value, exploded, onSelect]);
  useEffect(() => {
    const container = host.current;
    if (!container) return;
    let disposed = false,
      dirty = true,
      frame = 0,
      visible = true,
      pointerDown = false,
      dragged = false,
      px = 0,
      py = 0;
    let renderer: THREE.WebGLRenderer | import('three/webgpu').WebGPURenderer | undefined;
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    camera.position.set(0, 0, 9.4);
    const root = new THREE.Group();
    scene.add(root);
    root.rotation.set(0.32, -0.25, -0.2);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x8c7ec4, 3));
    const key = new THREE.DirectionalLight(0xffffff, 4);
    key.position.set(-3, 5, 5);
    scene.add(key);
    const fill = new THREE.DirectionalLight(0xffe3cf, 2);
    fill.position.set(3, -2, 2);
    scene.add(fill);
    const materials: THREE.Material[] = [],
      geometries: THREE.BufferGeometry[] = [],
      textures: THREE.Texture[] = [];
    const mat = (color: number, roughness = 0.3) => {
      const m = new THREE.MeshStandardMaterial({ color, roughness, metalness: 0.08 });
      materials.push(m);
      return m;
    };
    const purple = mat(0x8b71e6),
      lavender = mat(0xb5a0f3),
      orange = mat(0xf99a73),
      yellow = mat(0xf6d780),
      mint = mat(0x94d7c1),
      white = mat(0xf4f0e7),
      grey = mat(0xc5c3da);
    const sphereGeo = new THREE.SphereGeometry(1, 32, 20);
    geometries.push(sphereGeo);
    const sphere = (
      r: number,
      material: THREE.Material,
      x: number,
      y: number,
      z: number,
      label = '',
    ) => {
      const s = new THREE.Mesh(sphereGeo, material);
      s.scale.setScalar(r);
      s.position.set(x, y, z);
      s.userData.label = label;
      root.add(s);
      return s;
    };
    const tube = (
      points: THREE.Vector3[],
      material: THREE.Material,
      radius = 0.035,
      closed = false,
    ) => {
      const g = new THREE.TubeGeometry(
        new THREE.CatmullRomCurve3(points, closed),
        100,
        radius,
        8,
        closed,
      );
      geometries.push(g);
      const m = new THREE.Mesh(g, material);
      root.add(m);
      return m;
    };
    const rings: THREE.Group[] = [],
      electrons: { mesh: THREE.Mesh; parent: THREE.Group; radius: number; offset: number }[] = [],
      nuclei: { mesh: THREE.Mesh; base: THREE.Vector3 }[] = [];
    let movingPoint: THREE.Mesh | undefined,
      cosLine: THREE.Mesh | undefined,
      sinLine: THREE.Mesh | undefined,
      wave: THREE.Line | undefined,
      forceArrow: THREE.ArrowHelper | undefined,
      glowMaterial: THREE.MeshStandardMaterial | undefined;
    const currentDots: THREE.Mesh[] = [];
    const label = (text: string, x: number, y: number, z: number, color = '#726085') => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 96;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.font = '500 28px DM Sans, sans-serif';
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.fillText(text, 256, 58);
      const texture = new THREE.CanvasTexture(canvas);
      texture.colorSpace = THREE.SRGBColorSpace;
      textures.push(texture);
      const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthTest: false,
      });
      materials.push(material);
      const sprite = new THREE.Sprite(material);
      sprite.position.set(x, y, z);
      sprite.scale.set(2.8, 0.52, 1);
      root.add(sprite);
    };
    if (kind === 'atom') {
      for (let i = 0; i < 12; i++) {
        const a = i * 2.39996,
          rr = 0.4 + (i % 3) * 0.04;
        const mesh = sphere(
          0.265,
          i % 2 ? yellow : orange,
          Math.cos(a) * rr,
          (i / 11 - 0.5) * 0.72,
          Math.sin(a) * rr,
          i % 2 ? 'Neutron · neutral charge' : 'Proton · positive charge',
        );
        nuclei.push({ mesh, base: mesh.position.clone() });
      }
      for (let j = 0; j < 3; j++) {
        const ring = new THREE.Group();
        root.add(ring);
        rings.push(ring);
        ring.rotation.set(j === 0 ? 0.2 : j === 1 ? 1.08 : -0.95, j === 2 ? 0.6 : 0, j * 0.68);
        const radius = j === 0 ? 1.48 : 2.03;
        const points = Array.from(
          { length: 81 },
          (_, i) =>
            new THREE.Vector3(
              Math.cos((i / 80) * Math.PI * 2) * radius,
              Math.sin((i / 80) * Math.PI * 2) * radius,
              0,
            ),
        );
        const mesh = tube(points, j === 0 ? lavender : purple, 0.042, true);
        root.remove(mesh);
        ring.add(mesh);
        for (let i = 0; i < 2; i++) {
          const e = sphere(
            0.17,
            j === 1 ? mint : j === 2 ? orange : white,
            0,
            0,
            0,
            'Electron · negative charge',
          );
          root.remove(e);
          ring.add(e);
          electrons.push({ mesh: e, parent: ring, radius, offset: j * 1.6 + i * Math.PI });
        }
      }
    } else if (kind === 'molecule') {
      const oxygen = new THREE.Vector3(0, -0.25, 0);
      const angle = (52.25 * Math.PI) / 180;
      sphere(0.77, orange, oxygen.x, oxygen.y, 0, 'Oxygen · 8 protons');
      for (const sign of [-1, 1]) {
        const pos = new THREE.Vector3(
          Math.sin(angle) * 1.85 * sign,
          Math.cos(angle) * 1.85 - 0.25,
          0,
        );
        sphere(0.48, white, pos.x, pos.y, 0, 'Hydrogen · 1 proton');
        tube([oxygen, pos], lavender, 0.15);
      }
      root.rotation.x = 0.4;
    } else if (kind === 'geometry') {
      const points = Array.from(
        { length: 81 },
        (_, i) =>
          new THREE.Vector3(
            Math.cos((i / 80) * Math.PI * 2) * 1.75,
            Math.sin((i / 80) * Math.PI * 2) * 1.75,
            0,
          ),
      );
      tube(points, purple, 0.055, true);
      tube([new THREE.Vector3(-2.3, 0, 0), new THREE.Vector3(2.3, 0, 0)], grey, 0.018);
      tube([new THREE.Vector3(0, -2.3, 0), new THREE.Vector3(0, 2.3, 0)], grey, 0.018);
      sphere(0.09, white, 0, 0, 0, 'Origin · (0, 0)');
      movingPoint = sphere(0.18, yellow, 1.5, 0.8, 0, 'Point · (cos θ, sin θ)');
      const lineGeo = new THREE.CylinderGeometry(0.035, 0.035, 1, 8);
      geometries.push(lineGeo);
      cosLine = new THREE.Mesh(lineGeo, mint);
      sinLine = new THREE.Mesh(lineGeo, orange);
      root.add(cosLine, sinLine);
      cosLine.rotation.z = Math.PI / 2;
      root.rotation.set(0.12, -0.16, -0.04);
    } else if (kind === 'forces') {
      const box = new THREE.BoxGeometry(4.5, 0.25, 2);
      geometries.push(box);
      const table = new THREE.Mesh(box, mat(0xc99c74, 0.75));
      table.position.set(0, -0.9, 0);
      root.add(table);
      sphere(0.52, mat(0x769ecb), -0.35, -0.25, 0, 'Object · mass 2 kg');
      const normal = new THREE.ArrowHelper(
        new THREE.Vector3(0, 1, 0),
        new THREE.Vector3(-0.35, 0.3, 0),
        1.5,
        0x79ae95,
        0.22,
        0.13,
      );
      root.add(normal);
      const weight = new THREE.ArrowHelper(
        new THREE.Vector3(0, -1, 0),
        new THREE.Vector3(-1.4, 0.2, 0.3),
        1.5,
        0xbd85ab,
        0.22,
        0.13,
      );
      root.add(weight);
      forceArrow = new THREE.ArrowHelper(
        new THREE.Vector3(1, 0, 0),
        new THREE.Vector3(0.25, -0.2, 0),
        1.5,
        0xe9a06f,
        0.22,
        0.13,
      );
      root.add(forceArrow);
      label('Normal force · 19.6 N', -0.35, 2.1, 0, '#70a38c');
      label('Weight · 19.6 N', -1.5, -1.7, 0, '#ad78a0');
      label('Applied force', 1.5, 0.5, 0, '#c8966d');
      label('Mass · 2 kg', 0.2, -1.5, 1, '#8a7e9f');
      root.rotation.set(0.13, -0.24, 0);
    } else if (kind === 'circuit') {
      tube(
        [
          new THREE.Vector3(-2, 0, 0),
          new THREE.Vector3(-2, 1, 0),
          new THREE.Vector3(2, 1, 0),
          new THREE.Vector3(2, -1.3, 0),
          new THREE.Vector3(-2, -1.3, 0),
          new THREE.Vector3(-2, 0, 0),
        ],
        mat(0xc1a17b),
        0.045,
      );
      const batteryGeo = new THREE.BoxGeometry(0.5, 1.1, 0.4);
      geometries.push(batteryGeo);
      const battery = new THREE.Mesh(batteryGeo, mat(0x899baa));
      battery.position.set(-2, -0.1, 0);
      battery.userData.label = 'Battery · adjustable voltage';
      root.add(battery);
      const resistorGeo = new THREE.CylinderGeometry(0.18, 0.18, 1.1, 20);
      geometries.push(resistorGeo);
      const resistor = new THREE.Mesh(resistorGeo, mat(0xe9cf91));
      resistor.rotation.z = Math.PI / 2;
      resistor.position.set(0.05, 1, 0);
      resistor.userData.label = 'Ohmic resistor · 6 Ω';
      root.add(resistor);
      glowMaterial = mat(0xf3dc8b) as THREE.MeshStandardMaterial;
      glowMaterial.emissive = new THREE.Color(0xf8da76);
      sphere(
        0.28,
        glowMaterial,
        2,
        -0.15,
        0,
        'Current indicator · brightness increases with current',
      );
      for (let i = 0; i < 8; i++)
        currentDots.push(
          sphere(0.08, mint, 0, 0, 0, 'Conventional current · positive charge direction'),
        );
      label('Battery', -2.05, -1.9, 0, '#8898b1');
      label('6 Ω resistor', 0.2, 1.8, 0, '#b99c64');
      label('Current indicator', 1.8, -1.9, 0, '#bca16e');
      root.rotation.set(0.08, -0.12, 0);
    } else {
      const g = new THREE.BufferGeometry();
      geometries.push(g);
      const positions = new Float32Array(181 * 3);
      g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      const lineMat = new THREE.LineBasicMaterial({ color: 0x8b71e6, linewidth: 3 });
      materials.push(lineMat);
      wave = new THREE.Line(g, lineMat);
      root.add(wave);
      tube([new THREE.Vector3(-2.7, -1.1, 0), new THREE.Vector3(2.7, -1.1, 0)], grey, 0.022);
      for (let i = 0; i < 11; i++) sphere(0.045, mint, -2.5 + i * 0.5, -1.1, 0);
      root.rotation.set(0.3, -0.2, 0);
    }
    const resize = () => {
      if (!renderer || !container.clientWidth || !container.clientHeight) return;
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      dirty = true;
    };
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    const intersection = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
    });
    intersection.observe(container);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last = 0,
      t = 0,
      previousValue = Number.NaN,
      previousExploded = false;
    const animate = (now: number) => {
      if (disposed) return;
      frame = requestAnimationFrame(animate);
      if (now - last < 32 || !visible || document.hidden || !renderer) return;
      const dt = Math.min((now - last) / 1000, 0.05);
      last = now;
      const state = live.current;
      const autoAnimating =
        state.playing &&
        !reduced &&
        !['geometry', 'forces'].includes(kind) &&
        (kind !== 'circuit' || state.value > 0);
      const settling = nuclei.some(
        (n) =>
          Math.abs(n.mesh.position.length() - n.base.length() * (state.exploded ? 2.6 : 1)) > 0.001,
      );
      if (
        !autoAnimating &&
        !dirty &&
        !settling &&
        state.value === previousValue &&
        state.exploded === previousExploded
      )
        return;
      dirty = false;
      previousValue = state.value;
      previousExploded = state.exploded;
      if (state.playing && !reduced) {
        t += dt;
        if (!pointerDown && !['geometry', 'forces', 'circuit'].includes(kind))
          root.rotation.y += dt * 0.12;
      }
      electrons.forEach((e) => {
        const a = t * 0.45 + e.offset;
        e.mesh.position.set(Math.cos(a) * e.radius, Math.sin(a) * e.radius, 0);
      });
      nuclei.forEach((n) =>
        n.mesh.position.lerp(
          n.base.clone().multiplyScalar(state.exploded ? 2.6 : 1),
          reduced ? 1 : 0.09,
        ),
      );
      if (movingPoint && cosLine && sinLine) {
        const a = (state.value * Math.PI) / 180,
          x = Math.cos(a) * 1.75,
          y = Math.sin(a) * 1.75;
        movingPoint.position.set(x, y, 0);
        cosLine.position.set(x / 2, 0, 0);
        cosLine.scale.y = Math.max(0.001, Math.abs(x));
        sinLine.position.set(x, y / 2, 0);
        sinLine.scale.y = Math.max(0.001, Math.abs(y));
      }
      if (wave) {
        const arr = wave.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < 181; i++) {
          const x = (i / 180 - 0.5) * 5;
          arr[i * 3] = x;
          arr[i * 3 + 1] =
            Math.sin((x * Math.PI * 2 * state.value) / 10 - t * Math.PI * 2 * state.value * 0.15) *
            0.8;
          arr[i * 3 + 2] = 0;
        }
        wave.geometry.attributes.position.needsUpdate = true;
      }
      if (forceArrow) {
        forceArrow.setLength(0.15 + (state.value / 20) * 1.8, 0.18, 0.1);
        forceArrow.visible = state.value > 0;
      }
      if (glowMaterial) {
        glowMaterial.emissiveIntensity = state.value / 6;
        currentDots.forEach((dot, i) => {
          const phase = (((t * state.value) / 50 + i / 8) % 1) * 4;
          if (phase < 1) dot.position.set(-2 + 4 * phase, 1, 0);
          else if (phase < 2) dot.position.set(2, 1 - (phase - 1) * 2.3, 0);
          else if (phase < 3) dot.position.set(2 - (phase - 2) * 4, -1.3, 0);
          else dot.position.set(-2, -1.3 + (phase - 3) * 2.3, 0);
          dot.visible = state.value > 0;
        });
      }
      renderer.render(scene, camera);
    };
    const down = (e: PointerEvent) => {
      pointerDown = true;
      dragged = false;
      px = e.clientX;
      py = e.clientY;
      container.setPointerCapture(e.pointerId);
    };
    const move = (e: PointerEvent) => {
      if (!pointerDown) return;
      dirty = true;
      const dx = e.clientX - px,
        dy = e.clientY - py;
      if (Math.abs(dx) + Math.abs(dy) > 2) dragged = true;
      root.rotation.y += dx * 0.008;
      root.rotation.x += dy * 0.008;
      px = e.clientX;
      py = e.clientY;
    };
    const up = (e: PointerEvent) => {
      if (!dragged && renderer) {
        const rect = container.getBoundingClientRect();
        const pointer = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          (-(e.clientY - rect.top) / rect.height) * 2 + 1,
        );
        const ray = new THREE.Raycaster();
        ray.setFromCamera(pointer, camera);
        const hit = ray.intersectObjects(root.children, true).find((h) => h.object.userData.label);
        if (hit) live.current.onSelect?.(hit.object.userData.label);
      }
      pointerDown = false;
    };
    const keyboard = (e: KeyboardEvent) => {
      dirty = true;
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        e.preventDefault();
        root.rotation.y += e.key === 'ArrowLeft' ? -0.15 : 0.15;
      }
      if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
        e.preventDefault();
        root.rotation.x += e.key === 'ArrowUp' ? -0.15 : 0.15;
      }
    };
    container.addEventListener('pointerdown', down);
    container.addEventListener('pointermove', move);
    container.addEventListener('pointerup', up);
    container.addEventListener('pointercancel', up);
    container.addEventListener('keydown', keyboard);
    async function init() {
      try {
        if ('gpu' in navigator) {
          try {
            const { WebGPURenderer } = await import('three/webgpu');
            if (disposed) return;
            const gpu = new WebGPURenderer({ alpha: true, antialias: true });
            await gpu.init();
            renderer = gpu;
          } catch {
            renderer = new THREE.WebGLRenderer({
              alpha: true,
              antialias: true,
              powerPreference: 'low-power',
            });
          }
        } else
          renderer = new THREE.WebGLRenderer({
            alpha: true,
            antialias: true,
            powerPreference: 'low-power',
          });
        if (disposed) {
          renderer.dispose();
          return;
        }
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
        renderer.setClearColor(0x000000, 0);
        renderer.outputColorSpace = THREE.SRGBColorSpace;
        container!.appendChild(renderer.domElement);
        resize();
        setReady(true);
        onReady?.(renderer instanceof THREE.WebGLRenderer ? 'WebGL' : 'WebGPU');
        frame = requestAnimationFrame(animate);
      } catch {
        if (!disposed) setFailed(true);
      }
    }
    void init();
    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      observer.disconnect();
      intersection.disconnect();
      container.removeEventListener('pointerdown', down);
      container.removeEventListener('pointermove', move);
      container.removeEventListener('pointerup', up);
      container.removeEventListener('pointercancel', up);
      container.removeEventListener('keydown', keyboard);
      geometries.forEach((g) => g.dispose());
      materials.forEach((m) => m.dispose());
      textures.forEach((t) => t.dispose());
      renderer?.dispose();
      renderer?.domElement.remove();
    };
  }, [kind, resetKey, onReady]);
  return (
    <div
      className={`three-scene ${ready ? 'is-ready' : ''}`}
      ref={host}
      role="img"
      tabIndex={0}
      aria-label={`Interactive 3D ${kind} model. Drag or use arrow keys to rotate.${failed ? ' 3D unavailable; simplified diagram shown.' : ''}`}
    >
      {!ready && (
        <div className="scene-placeholder">
          <svg viewBox="0 0 300 300" aria-hidden="true">
            <g fill="none" stroke="#a28de2" strokeWidth="5">
              <ellipse cx="150" cy="150" rx="105" ry="39" transform="rotate(-30 150 150)" />
              <ellipse cx="150" cy="150" rx="105" ry="39" transform="rotate(30 150 150)" />
              <ellipse cx="150" cy="150" rx="105" ry="39" transform="rotate(90 150 150)" />
            </g>
            <circle cx="140" cy="144" r="25" fill="#f2b269" />
            <circle cx="168" cy="149" r="23" fill="#ec987d" />
            <circle cx="148" cy="173" r="23" fill="#f2c875" />
            <circle cx="59" cy="199" r="12" fill="#a7d6c5" />
          </svg>
        </div>
      )}
    </div>
  );
}
