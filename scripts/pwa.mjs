import { mkdir, readFile, writeFile, readdir } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const colors = {
  playground: { light: '#faf9f6', dark: '#18191d' },
  atlas: { light: '#f6f7f4', dark: '#181d1b' },
};
const publicDir = path.join(root, 'public');
if (process.argv[2] === 'prepare') {
  await mkdir(path.join(publicDir, 'icons'), { recursive: true });
  // Opaque icons keep the mark inside the maskable safe zone on every platform.
  const icon = Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512"><defs><linearGradient id="a" x2="1" y2="1"><stop stop-color="#9781e5"/><stop offset="1" stop-color="#6753b5"/></linearGradient></defs><rect width="512" height="512" fill="url(#a)"/><path d="M256 118C270 118 279 179 293 206S367 242 367 256S320 270 293 306S270 394 256 394S241 333 214 306S145 270 145 256S187 242 214 206S242 118 256 118Z" fill="#fffaf4"/><circle cx="361" cy="143" r="12" fill="#d9cdff"/></svg>',
  );
  for (const [name, size] of [
    ['icon-192', 192],
    ['icon-512', 512],
    ['maskable-512', 512],
    ['apple-touch-icon', 180],
  ])
    await sharp(icon)
      .resize(size, size)
      .png()
      .toFile(path.join(publicDir, 'icons', `${name}.png`));
  for (const [palette, values] of Object.entries(colors))
    for (const [theme, color] of Object.entries(values)) {
      const manifest = {
        id: '/',
        name: 'Lumni — A little more curious',
        short_name: 'Lumni',
        lang: 'en-ZA',
        description:
          'Hands-on STEM learning for South African learners, with offline 3D labs, quizzes and puzzles.',
        start_url: '/#/today',
        scope: '/',
        display: 'standalone',
        display_override: ['standalone', 'minimal-ui'],
        theme_color: color,
        background_color: color,
        categories: ['education', 'games'],
        icons: [
          { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          {
            src: '/icons/maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        shortcuts: [
          { name: 'Learn something new', short_name: 'Learn', url: '/#/learn' },
          { name: 'Open the 3D playground', short_name: '3D labs', url: '/#/labs' },
          { name: 'Play a challenge', short_name: 'Challenges', url: '/#/play' },
        ],
      };
      await writeFile(
        path.join(publicDir, `manifest-${palette}-${theme}.webmanifest`),
        JSON.stringify(manifest, null, 2) + '\n',
      );
    }
  const offlineBoot = `let a={preference:'system',palette:'playground'};try{const s=JSON.parse(localStorage.getItem('lumni-appearance-v1')||'null');if(s){if(['light','dark','system'].includes(s.preference))a.preference=s.preference;if(s.palette==='atlas')a.palette='atlas'}else{const l=JSON.parse(localStorage.getItem('lumni-playground-v1')||'null');if(l?.theme==='dark'||l?.theme==='light')a.preference=l.theme}}catch{}const t=a.preference==='system'?(matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'):a.preference;const c=${JSON.stringify(colors)}[a.palette][t];document.documentElement.style.backgroundColor=c;document.documentElement.style.colorScheme=t;document.documentElement.dataset.theme=t;document.querySelector('meta[name="theme-color"]').content=c;`;
  await writeFile(
    path.join(publicDir, 'offline.html'),
    `<!doctype html><html lang="en-ZA"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="theme-color" content="#faf9f6"><meta name="color-scheme" content="light dark"><title>A little pause · Lumni</title><script>${offlineBoot}</script><style>*{box-sizing:border-box}html{background:#faf9f6;color:#29272f}body{margin:0;min-height:100svh;display:grid;place-items:center;padding:max(24px,env(safe-area-inset-top)) max(24px,env(safe-area-inset-right)) max(24px,env(safe-area-inset-bottom)) max(24px,env(safe-area-inset-left));font:16px/1.6 system-ui}main{max-width:380px;text-align:center}svg{width:72px;color:#8c72d4}h1{font-size:30px;letter-spacing:-1px}p{opacity:.75}a{display:inline-block;margin-top:16px;background:#7d66ca;color:white;padding:13px 24px;border-radius:18px;text-decoration:none;min-height:48px}[data-theme=dark]{color:#eeedf1}@media(prefers-color-scheme:dark){html:not([data-theme]){background:#18191d;color:#eeedf1}}</style></head><body><main><svg viewBox="0 0 64 64" aria-hidden="true"><path d="M32 10l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" fill="currentColor"/></svg><h1>A little pause in the connection.</h1><p>Your downloaded lessons are waiting on the home screen. If this is your first visit, reconnect to download Lumni for offline learning.</p><a href="/#/today">Back to Lumni</a></main></body></html>\n`,
  );
  console.log('PWA icons, themed manifests and offline screen prepared.');
} else if (process.argv[2] === 'build') {
  const out = path.join(root, 'out');
  async function files(dir, prefix = '') {
    const entries = await readdir(dir, { withFileTypes: true });
    const result = [];
    for (const entry of entries) {
      const relative = path.posix.join(prefix, entry.name);
      if (entry.isDirectory()) result.push(...(await files(path.join(dir, entry.name), relative)));
      else if (
        /\.(js|css|woff2?|ttf|png|svg|webmanifest|json|txt)$/.test(relative) &&
        !relative.startsWith('404/') &&
        !relative.startsWith('_not-found/') &&
        relative !== 'sw.js' &&
        relative !== 'offline-assets.json'
      )
        result.push(`/${relative}`);
    }
    return result;
  }
  const assets = ['/', '/offline.html', ...(await files(out))].sort();
  const worker = await readFile(path.join(root, 'scripts', 'service-worker.js'), 'utf8');
  const hash = createHash('sha256').update(worker);
  let bytes = 0;
  for (const asset of assets) {
    const data = await readFile(path.join(out, asset === '/' ? 'index.html' : asset.slice(1)));
    bytes += data.length;
    hash.update(asset);
    hash.update(data);
  }
  const version = hash.digest('hex').slice(0, 16);
  await writeFile(
    path.join(out, 'sw.js'),
    `const VERSION = ${JSON.stringify(version)};\nconst ASSETS = ${JSON.stringify(assets)};\n${worker}`,
  );
  await writeFile(
    path.join(out, 'offline-assets.json'),
    JSON.stringify({ version, assets: assets.length, bytes }) + '\n',
  );
  console.log(
    `Complete offline build: ${assets.length} files, ${(bytes / 1024 / 1024).toFixed(2)} MiB, version ${version}.`,
  );
} else throw new Error('Use prepare or build.');
