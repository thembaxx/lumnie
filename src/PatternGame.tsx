'use client';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Leaf, Lightbulb, Sparkle, Trophy } from '@phosphor-icons/react';
const values = [8, 6, 2, 24, 16, 4, 12, 32];
const target = [2, 4, 8, 16, 32];
export default function PatternGame({
  onFeedback,
  onComplete,
  onClose,
}: {
  onFeedback: (kind: 'tap' | 'success' | 'wrong' | 'celebrate') => void;
  onComplete: (id: string, xp: number, score?: number) => void;
  onClose: () => void;
}) {
  const host = useRef<HTMLDivElement>(null),
    selectRef = useRef<(n: number) => void>(() => {}),
    stageRef = useRef<{ selected: number[]; wrong: number | null }>({ selected: [], wrong: null });
  const [selected, setSelected] = useState<number[]>([]),
    [wrong, setWrong] = useState<number | null>(null),
    [fallback, setFallback] = useState(false),
    [hint, setHint] = useState(false);
  stageRef.current = { selected, wrong };
  selectRef.current = (n: number) => {
    if (selected.includes(n) || selected.length === 5) return;
    if (n === target[selected.length]) {
      const next = [...selected, n];
      setSelected(next);
      setWrong(null);
      onFeedback(next.length === 5 ? 'celebrate' : 'success');
      if (next.length === 5) onComplete('game-number-garden', 40, 100);
    } else {
      setWrong(n);
      onFeedback('wrong');
    }
  };
  useEffect(() => {
    let app: import('pixi.js').Application | undefined,
      cancelled = false;
    const container = host.current;
    if (!container) return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    async function start() {
      try {
        const { Application, Container, Graphics, Text, Rectangle } = await import('pixi.js');
        if (cancelled) return;
        app = new Application();
        await app.init({
          width: container!.clientWidth,
          height: 330,
          backgroundAlpha: 0,
          antialias: true,
          resolution: Math.min(window.devicePixelRatio, 1.5),
          preference: 'webgpu',
        });
        if (cancelled) {
          app.destroy(true, { children: true });
          return;
        }
        container!.appendChild(app.canvas);
        app.stage.eventMode = 'static';
        app.stage.hitArea = new Rectangle(0, 0, app.screen.width, 330);
        const palette = [
          0xbaa6ea, 0xb6d9c6, 0xf4c18e, 0x9fc5e7, 0xeab3a3, 0xd3dba0, 0xc3baef, 0xa9d6d0,
        ];
        const circles = values.map((n, i) => {
          const group = new Container(),
            disc = new Graphics().circle(0, 0, 37).fill(palette[i]),
            ring = new Graphics()
              .circle(0, 0, 44)
              .stroke({ color: palette[i], width: 1, alpha: 0.5 }),
            text = new Text({
              text: String(n),
              style: { fontFamily: 'DM Sans', fontSize: 26, fontWeight: '600', fill: 0x34333e },
            });
          text.anchor.set(0.5);
          group.addChild(ring, disc, text);
          group.eventMode = 'static';
          group.cursor = 'pointer';
          group.on('pointertap', () => selectRef.current(n));
          group.on('pointerover', () => group.scale.set(1.08));
          group.on('pointerout', () => group.scale.set(1));
          app!.stage.addChild(group);
          return { group, disc, text, n, i };
        });
        function layout() {
          if (!app) return;
          const width = container!.clientWidth;
          app.renderer.resize(width, 330);
          circles.forEach((c) => {
            const col = c.i % 4,
              row = Math.floor(c.i / 4);
            c.group.x = ((col + 0.5) * width) / 4;
            c.group.y = 105 + row * 125;
          });
        }
        layout();
        const resize = new ResizeObserver(layout);
        resize.observe(container!);
        let time = 0;
        app.ticker.maxFPS = 30;
        app.ticker.add((t) => {
          time += t.deltaMS / 1000;
          circles.forEach((c) => {
            const state = stageRef.current,
              isSelected = state.selected.includes(c.n);
            c.group.alpha = isSelected ? 0.26 : 1;
            c.group.y =
              105 + Math.floor(c.i / 4) * 125 + (reduced ? 0 : Math.sin(time * 0.8 + c.i) * 6);
            c.disc.tint = state.wrong === c.n ? 0xffbbbb : 0xffffff;
          });
        });
        const instance = app;
        const destroy = instance.destroy.bind(instance);
        instance.destroy = (...args: Parameters<typeof instance.destroy>) => {
          resize.disconnect();
          destroy(...args);
        };
      } catch {
        if (!cancelled) setFallback(true);
      }
    }
    void start();
    return () => {
      cancelled = true;
      if (app?.renderer) app.destroy(true, { children: true });
    };
  }, []);
  const done = selected.length === 5;
  return (
    <div className="pattern-game">
      <div className="activity-kicker">
        <span className="tag mint">
          <Leaf weight="fill" />
          NUMBER GARDEN
        </span>
        <span>
          <Sparkle weight="fill" />
          +40 XP
        </span>
      </div>
      <h2>{done ? 'Your little garden is growing.' : 'Find the pattern. Follow the spark.'}</h2>
      <p className="muted">
        {done
          ? 'You found every power of two, in order. A little logic makes a lovely pattern.'
          : 'Start with 2, then double each time. Tap the five numbers in order.'}
      </p>
      <div className="garden-sequence">
        {target.map((n, i) => (
          <span
            key={n}
            className={i < selected.length ? 'found' : i === selected.length ? 'current' : ''}
          >
            {i < selected.length ? n : '?'}
            {i < 4 && <ArrowRight />}
          </span>
        ))}
      </div>
      {!done ? (
        <>
          <div className="garden-stage" ref={host} aria-hidden="true">
            {fallback && (
              <div className="garden-fallback">
                {values.map((n) => (
                  <button
                    className={selected.includes(n) ? 'found' : ''}
                    key={n}
                    onClick={() => selectRef.current(n)}
                  >
                    {n}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={`garden-status ${wrong ? 'wrong' : ''}`} role="status">
            {wrong
              ? 'That number doesn’t follow the pattern. Try another little idea.'
              : `${selected.length} of 5 discovered. What comes next?`}
          </div>
          <details className="accessible-game-controls">
            <summary>Use the number buttons</summary>
            <div>
              {values.map((n) => (
                <button
                  key={n}
                  disabled={selected.includes(n)}
                  onClick={() => selectRef.current(n)}
                >
                  {n}
                </button>
              ))}
            </div>
          </details>
          <div className="activity-footer">
            <button className="text-button" onClick={() => setHint(!hint)}>
              <Lightbulb />A little hint
            </button>
            <span className="small-muted">
              {hint
                ? `Next: ${target[selected.length]}. Multiply the previous number by 2.`
                : 'No timer. Just a little curiosity.'}
            </span>
          </div>
        </>
      ) : (
        <div className="garden-result">
          <Trophy size={64} weight="duotone" />
          <MathResult />
          <button className="button primary" onClick={onClose}>
            Keep your curiosity growing
            <ArrowRight />
          </button>
        </div>
      )}
    </div>
  );
}
function MathResult() {
  return (
    <p>
      2 → 4 → 8 → 16 → 32
      <br />
      <strong>Each new number is twice the last.</strong>
    </p>
  );
}
