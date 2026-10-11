export type ThemePreference = 'system' | 'light' | 'dark';
export type Palette = 'playground' | 'atlas';
export type Appearance = { preference: ThemePreference; palette: Palette };
export const appearanceKey = 'lumni-appearance-v1';
export const themeColors = {
  playground: { light: '#faf9f6', dark: '#18191d' },
  atlas: { light: '#f6f7f4', dark: '#181d1b' },
};
export function readAppearance(): Appearance {
  try {
    const saved = JSON.parse(localStorage.getItem(appearanceKey) || 'null');
    if (saved)
      return {
        preference: ['light', 'dark', 'system'].includes(saved.preference)
          ? saved.preference
          : 'system',
        palette: saved.palette === 'atlas' ? 'atlas' : 'playground',
      };
    const legacy = JSON.parse(localStorage.getItem('lumni-playground-v1') || 'null');
    if (legacy?.theme === 'light' || legacy?.theme === 'dark')
      return { preference: legacy.theme, palette: 'playground' };
  } catch {
    /* Private browsing can restrict storage. */
  }
  return { preference: 'system', palette: 'playground' };
}
export function applyAppearance(appearance: Appearance) {
  const theme =
    appearance.preference === 'system'
      ? matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      : appearance.preference;
  const root = document.documentElement;
  root.dataset.theme = theme;
  root.dataset.palette = appearance.palette;
  root.style.colorScheme = theme;
  root.style.backgroundColor = themeColors[appearance.palette][theme];
  document.querySelectorAll<HTMLMetaElement>('meta[name="theme-color"]').forEach((meta) => {
    meta.removeAttribute('media');
    meta.content = themeColors[appearance.palette][theme];
  });
  document
    .querySelector<HTMLLinkElement>('link[rel="manifest"]')
    ?.setAttribute('href', `/manifest-${appearance.palette}-${theme}.webmanifest`);
  return theme;
}
// Runs in the document head before the first paint, independently of React hydration.
export const appearanceBoot = `(()=>{let a={preference:'system',palette:'playground'};try{const s=JSON.parse(localStorage.getItem('${appearanceKey}')||'null');if(s){if(['light','dark','system'].includes(s.preference))a.preference=s.preference;if(s.palette==='atlas')a.palette='atlas'}else{const l=JSON.parse(localStorage.getItem('lumni-playground-v1')||'null');if(l?.theme==='light'||l?.theme==='dark')a.preference=l.theme}}catch{}const t=a.preference==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):a.preference;const c=${JSON.stringify(themeColors)}[a.palette][t];const r=document.documentElement;r.dataset.theme=t;r.dataset.palette=a.palette;r.style.colorScheme=t;r.style.backgroundColor=c;document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{m.removeAttribute('media');m.content=c});const m=document.querySelector('link[rel="manifest"]');if(m)m.href='/manifest-'+a.palette+'-'+t+'.webmanifest'})();`;
