'use client';
import { useEffect, useRef, useState } from 'react';
import { CornersIn, CornersOut } from '@phosphor-icons/react';

/** Fullscreen is opt-in per interactive lab, never forced on lessons or the dashboard. */
export function LabFullscreenButton({ title }: { title: string }) {
  const ref = useRef<HTMLButtonElement>(null);
  const [supported, setSupported] = useState(false);
  const [active, setActive] = useState(false);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const sync = () => {
      setSupported(document.fullscreenEnabled === true);
      const card = ref.current?.closest('.lab-card');
      setActive(Boolean(card && document.fullscreenElement === card));
    };
    sync();
    document.addEventListener('fullscreenchange', sync);
    return () => document.removeEventListener('fullscreenchange', sync);
  }, []);

  if (!supported) return null;
  const toggle = async () => {
    const card = ref.current?.closest<HTMLElement>('.lab-card');
    if (!card) return;
    setNotice('');
    try {
      if (document.fullscreenElement === card) await document.exitFullscreen();
      else if (!document.fullscreenElement) await card.requestFullscreen();
    } catch {
      setNotice('Fullscreen is unavailable in this browser. The lab still works here.');
    }
  };

  return (
    <>
      <button
        ref={ref}
        type="button"
        className="round-button lab-expand-button"
        onClick={() => void toggle()}
        aria-label={active ? `Exit fullscreen ${title}` : `Make ${title} fullscreen`}
        aria-pressed={active}
        title={active ? 'Exit fullscreen' : 'Fullscreen lab'}
      >
        {active ? <CornersIn size={22} /> : <CornersOut size={22} />}
      </button>
      <span className="sr-only" role="status">
        {notice}
      </span>
    </>
  );
}
