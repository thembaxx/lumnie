'use client';
export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="app-loading" role="alert">
      <h1>Let’s try that again.</h1>
      <p>Your saved progress is still here. Reload this screen to keep exploring.</p>
      <button className="button primary" onClick={reset}>
        Try again
      </button>
    </main>
  );
}
