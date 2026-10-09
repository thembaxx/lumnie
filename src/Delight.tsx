'use client';
import { useEffect, useRef } from 'react';
export default function Delight({ trigger }: { trigger: number }) {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!trigger || !host.current || window.matchMedia('(prefers-reduced-motion: reduce)').matches)
      return;
    let cancelled = false;
    let app: import('pixi.js').Application | undefined;
    async function run() {
      try {
        const { Application, Graphics } = await import('pixi.js');
        if (cancelled) return;
        app = new Application();
        await app.init({
          width: window.innerWidth,
          height: window.innerHeight,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio, 1.5),
          preference: 'webgpu',
        });
        if (cancelled) {
          app.destroy(true, { children: true });
          return;
        }
        host.current?.appendChild(app.canvas);
        const colors = [0x8b71e6, 0xf6b186, 0xa1d7c4, 0xf2d785, 0x91bfe5];
        const particles = Array.from({ length: 70 }, (_, i) => {
          const g = new Graphics();
          if (i % 3) g.roundRect(-4, -7, 8, 14, 3).fill(colors[i % 5]);
          else g.circle(0, 0, 5).fill(colors[i % 5]);
          g.position.set(window.innerWidth / 2, window.innerHeight * 0.36);
          app!.stage.addChild(g);
          return {
            g,
            vx: (Math.random() - 0.5) * 16,
            vy: -Math.random() * 15 - 4,
            spin: (Math.random() - 0.5) * 0.2,
          };
        });
        let elapsed = 0;
        app.ticker.add((t) => {
          elapsed += t.deltaMS;
          particles.forEach((p) => {
            p.vy += 0.15 * t.deltaTime;
            p.g.x += p.vx * t.deltaTime;
            p.g.y += p.vy * t.deltaTime;
            p.g.rotation += p.spin * t.deltaTime;
            p.g.alpha = Math.max(0, 1 - (elapsed - 1000) / 1100);
          });
          if (elapsed > 2200) {
            app?.ticker.stop();
          }
        });
      } catch {
        /* Learning remains usable on devices without a GPU renderer. */
      }
    }
    void run();
    return () => {
      cancelled = true;
      if (app?.renderer) app.destroy(true, { children: true });
    };
  }, [trigger]);
  return <div className="pixi-delight" ref={host} aria-hidden="true" />;
}
