export default function Loading() {
  return (
    <main className="app-loading" role="status" aria-live="polite">
      <svg viewBox="0 0 64 64" aria-hidden="true">
        <path d="M32 10l6 16 16 6-16 6-6 16-6-16-16-6 16-6z" fill="currentColor" />
      </svg>
      <span>A little discovery is on its way.</span>
      <div className="loading-track">
        <span />
      </div>
    </main>
  );
}
