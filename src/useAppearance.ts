'use client';
import { useCallback, useEffect, useState } from 'react';
import {
  applyAppearance,
  appearanceKey,
  readAppearance,
  type Appearance,
  type ThemePreference,
} from './appearance';

export function useAppearance() {
  const [appearance, setAppearance] = useState<Appearance>({
    preference: 'system',
    palette: 'playground',
  });
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const refresh = () => {
      const saved = readAppearance();
      try {
        if (!localStorage.getItem(appearanceKey))
          localStorage.setItem(appearanceKey, JSON.stringify(saved));
      } catch {
        /* Keep legacy and system preferences usable without storage. */
      }
      setAppearance(saved);
      setTheme(applyAppearance(saved));
      setReady(true);
    };
    refresh();
    const media = matchMedia('(prefers-color-scheme: dark)');
    const storage = (event: StorageEvent) => {
      if (event.key === appearanceKey || event.key === null) refresh();
    };
    media.addEventListener('change', refresh);
    window.addEventListener('storage', storage);
    return () => {
      media.removeEventListener('change', refresh);
      window.removeEventListener('storage', storage);
    };
  }, []);
  const save = useCallback((next: Appearance) => {
    setAppearance(next);
    setTheme(applyAppearance(next));
    try {
      localStorage.setItem(appearanceKey, JSON.stringify(next));
    } catch {
      /* Theme still works without storage. */
    }
  }, []);
  return {
    theme,
    ready,
    preference: appearance.preference,
    designB: appearance.palette === 'atlas',
    setTheme: (preference: ThemePreference) => save({ ...appearance, preference }),
    setDesignB: (atlas: boolean) =>
      save({ ...appearance, palette: atlas ? 'atlas' : 'playground' }),
  };
}
