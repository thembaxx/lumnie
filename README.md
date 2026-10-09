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
- Light and dark themes, optional Web Audio feedback, and Vibration API haptics where supported.
- Reduced-motion support, modal focus management, keyboard diagram rotation, and search with Ctrl/Cmd+K.

The initial dashboard is a clearly identified sample learner journey. Completing an activity starts actual progress. Onboarding creates a fresh personal journey. Settings and progress save on the current device; there is no server account or cross-device synchronisation.

## Rendering and performance

Three.js models and PixiJS are dynamically loaded. Three.js prefers WebGPU and uses WebGL when required; PixiJS also prefers WebGPU with a WebGL fallback. Scenes cap pixel density at 1.5, render at roughly 30 fps, pause when outside the viewport or the tab is hidden, and dispose of resources on unmount. Fonts are bundled locally.

The diagrams are simplified learning models. Atom rings are not literal electron paths; particle dimensions and molecular bond lengths are exaggerated. Waves run at 15% real-time speed. The circuit assumes an ideal battery and a fixed 6-ohm ohmic resistor; its glow is a current indicator rather than a filament-bulb model. The force diagram ignores friction and displays a 2 kg object's balanced vertical forces and adjustable horizontal net force.

## Curriculum

Content in `src/data.ts` is original and informed by Department of Basic Education CAPS topic frameworks and Siyavula open textbook references. Every lesson links to its reference. Technology lessons are additional STEM skills; quizzes revisit foundational concepts across grades. Review educational content before formal classroom assessment.

## Verification

TypeScript, oxlint, oxfmt, and the production build pass. Browser checks cover desktop and mobile layouts, real canvas rendering, perfect-score quizzes, native drag and drop, PixiJS canvas clicks, sliders, onboarding, grade filtering, saved profile/progress/theme, and reduced motion.
