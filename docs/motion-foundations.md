# Phase 3: shared motion foundations

Lumni provides an initial, app-local motion foundation in [src/MotionSurface.tsx](../src/MotionSurface.tsx). It reuses the existing Framer Motion dependency; there is no additional animation runtime, network request or shared package.

## Contracts

- \`page\`: navigating between primary views.
- \`step\`: changing an onboarding step.
- \`backdrop\` and \`dialog\`: modal presentation; existing focus management, Escape handling and body scroll locking remain in the Dialog component.
- \`toast\`: short-lived feedback.

Every surface is plain content when \`prefers-reduced-motion: reduce\` is active. Its motion preset sets \`initial: false\` and a zero-duration transition, rather than relying on CSS to override JavaScript animation. The only two diagnostics attributes are \`data-motion-intent\` and \`data-motion-reduced\`.

## Reuse guidance

These are **patterns**, not a new cross-repository package. When adopting in CityLit, Mise, Wavelet, Hydromental or other apps:

1. Keep the project's existing animation library and style language.
2. Use intent names instead of sprinkling one-off durations and offsets through individual components.
3. Never animate focus, semantic state, keyboard functionality or primary controls out of reach.
4. For optional 3D or particle effects, use separate budgets and pause/visibility handling; this component does not manage the render loop.
5. Respect OS reduced-motion preferences and mobile performance, and test both preference modes.
6. Do not promote a shared dependency until at least two real apps have validated their own implementations and compatibility.

## Verification

Run \`pnpm lint\`, \`pnpm format:check\`, \`pnpm typecheck\`, \`pnpm build\`, and \`pnpm exec playwright test tests/motion-foundations.spec.ts\`. The regression covers reduced and standard motion while exercising live pages, accessible dialogs and focus.

Performance acceptance: no new dependency, unnecessary render loop, or permanent animation; keep animations under 300 ms aside from the existing restrained dialog spring. Accessibility acceptance: content visible immediately with reduced motion and all actions still available by keyboard and touch.
