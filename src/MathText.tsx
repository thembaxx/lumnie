'use client';
import katex from 'katex';
export default function MathText({ tex, block = false }: { tex: string; block?: boolean }) {
  return (
    <span
      className={`math-text ${block ? 'math-block' : ''}`}
      role="math"
      aria-label={tex}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(tex, {
          throwOnError: false,
          displayMode: block,
          output: 'htmlAndMathml',
        }),
      }}
    />
  );
}
