'use client';
import { useEffect, useState } from 'react';

export function useNativeViewport() {
  useEffect(() => {
    const viewport = window.visualViewport;
    const update = () => {
      const root = document.documentElement;
      root.style.setProperty('--visual-height', `${viewport?.height || window.innerHeight}px`);
      root.style.setProperty('--visual-top', `${viewport?.offsetTop || 0}px`);
      const inputFocused = document.activeElement?.matches(
        'input:not([type="range"]), textarea, select',
      );
      root.dataset.keyboard =
        inputFocused && !!viewport && viewport.height < window.innerHeight * 0.8
          ? 'open'
          : 'closed';
    };
    update();
    viewport?.addEventListener('resize', update);
    viewport?.addEventListener('scroll', update);
    window.addEventListener('resize', update);
    document.addEventListener('focusin', update);
    document.addEventListener('focusout', update);
    return () => {
      viewport?.removeEventListener('resize', update);
      viewport?.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
      document.removeEventListener('focusin', update);
      document.removeEventListener('focusout', update);
    };
  }, []);
}

export async function shareLink(title: string, hash: string): Promise<string> {
  const url = new URL('/', location.origin);
  url.hash = hash;
  if (navigator.share) {
    try {
      await navigator.share({
        title,
        text: 'A little more curious. Explore this with Lumni.',
        url: url.href,
      });
      return 'Shared. A little curiosity goes a long way.';
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') return '';
      // Clipboard remains available when this browser cannot open its share sheet.
    }
  }
  try {
    await navigator.clipboard.writeText(url.href);
    return 'Link copied. Share a little discovery.';
  } catch {
    return 'Sharing is unavailable in this browser. You can copy the address from the browser bar.';
  }
}

export function useWakeLock(active: boolean) {
  const [enabled, setEnabled] = useState(false);
  const [supported, setSupported] = useState(false);
  const [held, setHeld] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  useEffect(() => {
    setSupported('wakeLock' in navigator && window.isSecureContext);
    try {
      setEnabled(localStorage.getItem('lumni-wake-lock') === 'true');
    } catch {
      /* Optional preference. */
    }
  }, []);
  useEffect(() => {
    if (!supported || !enabled || !active) {
      setHeld(false);
      setUnavailable(false);
      return;
    }
    let cancelled = false;
    let lock: WakeLockSentinel | undefined;
    let requesting = false;
    const acquire = async () => {
      if (
        cancelled ||
        document.visibilityState !== 'visible' ||
        requesting ||
        (lock && !lock.released)
      )
        return;
      requesting = true;
      try {
        const next = await navigator.wakeLock.request('screen');
        if (cancelled) {
          await next.release();
          return;
        }
        lock = next;
        setHeld(true);
        setUnavailable(false);
        next.addEventListener('release', () => {
          if (!cancelled) setHeld(false);
        });
      } catch {
        if (!cancelled) {
          setHeld(false);
          setUnavailable(true);
        }
      } finally {
        requesting = false;
      }
    };
    const visibility = () => {
      if (document.visibilityState === 'visible') void acquire();
      else {
        void lock?.release().catch(() => {});
        setHeld(false);
      }
    };
    void acquire();
    document.addEventListener('visibilitychange', visibility);
    return () => {
      cancelled = true;
      document.removeEventListener('visibilitychange', visibility);
      void lock?.release().catch(() => {});
    };
  }, [active, enabled, supported]);
  return {
    enabled,
    supported,
    held,
    unavailable,
    setEnabled: (value: boolean) => {
      setEnabled(value);
      try {
        localStorage.setItem('lumni-wake-lock', String(value));
      } catch {
        /* Optional preference. */
      }
    },
  };
}
