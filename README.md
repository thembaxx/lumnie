# Lumni Playground

[Open the live app](https://lumni-playground.sillykoala8.chatgpt.site)

A working, responsive STEM learning app for South African learners. Option A uses warm ivory, soft subject colours, squircle cards, Phosphor icons, and a floating mobile dock. Option B is an alternate visual direction available from Settings → Explore the design directions.

## Run

Use Node.js 22.10 or newer and pnpm 12.10.1.

```sh
pnpm install --frozen-lockfile
pnpm dev
```

```sh
pnpm typecheck
pnpm lint
pnpm format:check
pnpm build
pnpm preview
```

The Next.js App Router builds a static export in `out/`. The app is suitable for static hosting.

## What works

- Three-step onboarding with first name, Grade 10–12, and daily goal.
- Dashboard, subject library, playground, challenges, and progress views.
- 18 original mini-lessons with curriculum references and 20 quiz questions with worked explanations.
- Six draggable Three.js models: carbon-12, water, the unit circle, waves, force diagrams, and an electric circuit.
- Unit-circle, wave-frequency, force, and voltage sliders; particle selection; pause, reset, and an expanded nucleus.
- Five-question quizzes, three drag-and-drop puzzles with a tap alternative, and an interactive PixiJS number garden with keyboard-accessible alternatives.
- KaTeX equations, XP, quiz accuracy, learning-day streaks, achievements, and persistent browser-local progress.
- System, light and dark themes applied before the first paint, with matching browser chrome, native form controls, safe areas and loading/error/offline screens. The alternate Atlas palette also persists.
- Installable PWA with maskable icons, iOS home-screen guidance, themed launch manifests and home-screen shortcuts.
- Complete offline download of the app, local fonts, KaTeX, all lessons, quizzes, puzzles, Three.js and PixiJS modules. Settings shows download progress and allows a failed download to be retried.
- Native Back/Forward navigation, direct lesson/activity links, native sharing with clipboard fallback, and optional screen wake lock during activities.
- Updates download in the background and wait for “Update now”; active quizzes are not refreshed automatically.
- Optional Web Audio feedback and Vibration API haptics where supported.
- Reduced-motion support, modal focus management, keyboard diagram rotation, and search with Ctrl/Cmd+K.

The initial dashboard is a clearly identified sample learner journey. Completing an activity starts actual progress. Onboarding creates a fresh personal journey. Settings and progress save on the current device; there is no server account or cross-device synchronisation.

## Rendering and performance

Three.js models and PixiJS are dynamically loaded. Three.js prefers WebGPU and uses WebGL when required; PixiJS also prefers WebGPU with a WebGL fallback. Scenes cap pixel density at 1.5, render at roughly 30 fps, pause when outside the viewport or the tab is hidden, and dispose of resources on unmount. Fonts are bundled locally.

The diagrams are simplified learning models. Atom rings are not literal electron paths; particle dimensions and molecular bond lengths are exaggerated. Waves run at 15% real-time speed. The circuit assumes an ideal battery and a fixed 6-ohm ohmic resistor; its glow is a current indicator rather than a filament-bulb model. The force diagram ignores friction and displays a 2 kg object's balanced vertical forces and adjustable horizontal net force.

## PWA hosting and native support

Run `pnpm build` before deploying: it generates the complete asset list and a service worker version from the actual exported files. Serve `out/` over HTTPS, serve `.webmanifest` as `application/manifest+json`, and avoid long cache lifetimes on HTML, manifests and `/sw.js`. The included `pnpm preview` server uses these headers for local production checks. Development mode does not register a worker.

The worker caches only this build's same-origin assets. API calls, authentication endpoints and third-party references are excluded. Failed downloads never activate, login/error pages cannot overwrite the app shell, and one previous build remains available for older open tabs. Clearing browser site data removes downloaded content and local progress.

Native sharing, installation prompts, vibration and screen wake lock depend on browser/device support. Safari installation uses its Share → Add to Home Screen flow. Screen wake lock is opt-in, applies only during activities, releases on hiding/closing the activity, and can be refused by power-saving settings. A selected manifest sets the installation splash colour; an operating system may retain that installation-time colour until the app's manifest is refreshed. Browser toolbar and standalone status-bar behaviour are ultimately controlled by the platform.

## Curriculum references

Content in `src/data.ts` is original and informed by Department of Basic Education CAPS topic frameworks and Siyavula open textbook references. Every lesson links to its reference. Technology lessons are additional STEM skills; quizzes revisit foundational concepts across grades. Review educational content before formal classroom assessment.

## Verification

TypeScript, oxlint, oxfmt, and the production build pass. Browser checks cover desktop and mobile layouts, real canvas rendering, quizzes, native drag and drop, PixiJS canvas clicks, sliders, onboarding, grade filtering, saved profile/progress/theme, and reduced motion.

The PWA regression suite checks appearance before hydration, system-theme changes and overrides, manifests, native Back/Forward and sharing, install prompts, wake lock release, phone/tablet/landscape overflow, full offline reloads with lazy 3D/PixiJS modules, and updates that wait while a quiz is open:

```sh
pnpm exec playwright install chromium
pnpm build
pnpm test:e2e
```

For a system Chromium binary, set `LUMNI_CHROMIUM_PATH=/path/to/chromium`.

## Brand and discovery

See [BRAND.md](BRAND.md) for Lumni’s positioning and canonical-origin configuration. Search and social metadata, structured data, the public `/about/` page and AI documentation use the same brand source. `/llms.txt` and `/llm.txt` return the same public index; `/llms-full.txt` supplies fuller context. Private device records never enter discovery content.
