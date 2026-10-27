'use client';
import { useEffect, useId, useState, type ChangeEvent, type FormEvent } from 'react';
import { ArrowRight, BookOpen, Download } from '@phosphor-icons/react';
import { lessons } from './data';
import {
  atomicStructurePathway,
  exportPathwayProgress,
  importPathwayProgress,
  initialPathwayState,
  parsePathwayState,
  pathwayAnswerCorrect,
  pathwayQuestions,
  pathwayScore,
  PATHWAY_STORAGE_KEY,
  recordPathwayLessonOpened,
  submitPathwayAttempt,
  type PathwayStage,
  type PathwayState,
} from './objective-pathway';

export type ObjectivePathwayProps = { onOpenLesson?: (lessonId: string) => void };

function download(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'application/json' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function ObjectivePathway({ onOpenLesson }: ObjectivePathwayProps) {
  const titleId = useId();
  const [state, setState] = useState<PathwayState>(initialPathwayState);
  const [ready, setReady] = useState(false);
  const [blocked, setBlocked] = useState(false);
  const [original, setOriginal] = useState<string | null>(null);
  const [notice, setNotice] = useState('');
  const [answers, setAnswers] = useState<Record<string, string>>({});

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PATHWAY_STORAGE_KEY);
      if (raw) {
        setOriginal(raw);
        const checked = parsePathwayState(JSON.parse(raw));
        if (!checked) throw new Error('Unsupported saved pathway record');
        setState(checked);
      }
    } catch {
      setBlocked(true);
      setNotice(
        'Your saved pathway record could not be read. It has not been replaced. Download the original record before choosing a new attempt or importing a backup.',
      );
    }
    setReady(true);
  }, []);

  function commit(next: PathwayState, replace = false) {
    setState(next);
    if (blocked && !replace) {
      setNotice(
        'This attempt is available while you keep the page open. The unreadable saved record remains unchanged.',
      );
      return;
    }
    try {
      localStorage.setItem(PATHWAY_STORAGE_KEY, JSON.stringify(next));
      setBlocked(false);
      setOriginal(null);
      setNotice('Pathway progress saved on this device.');
    } catch {
      setNotice(
        'Your answers are visible, but this browser could not save them. Download a pathway backup before leaving.',
      );
    }
  }

  function submit(event: FormEvent<HTMLFormElement>, stage: PathwayStage) {
    event.preventDefault();
    try {
      commit(submitPathwayAttempt(state, stage, answers));
      setAnswers({});
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'Your answers could not be recorded.');
    }
  }

  async function restore(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    try {
      if (file.size > 100_000) throw new Error('Choose a pathway backup smaller than 100 KB.');
      const checked = importPathwayProgress(await file.text());
      const baseline = pathwayScore(checked.baseline, 'baseline');
      const final = pathwayScore(checked.final, 'final');
      const preview = `Restore this atomic-structure pathway? Starting questions: ${checked.baseline ? `${baseline.correct}/${baseline.total}` : 'not recorded'}. Final questions: ${checked.final ? `${final.correct}/${final.total}` : 'not recorded'}. This replaces only this pathway record; other learning progress stays as it is.`;
      if (!window.confirm(preview)) return;
      commit(checked, true);
      setAnswers({});
    } catch (error) {
      setNotice(error instanceof Error ? error.message : 'This file could not be restored.');
    }
  }

  function openLesson(event: React.MouseEvent<HTMLAnchorElement>, id: string) {
    try {
      commit(recordPathwayLessonOpened(state));
      if (onOpenLesson) {
        event.preventDefault();
        onOpenLesson(id);
      }
    } catch (error) {
      event.preventDefault();
      setNotice(error instanceof Error ? error.message : 'The lesson could not be opened.');
    }
  }

  function questions(stage: PathwayStage) {
    const attempted = state[stage];
    const score = pathwayScore(attempted, stage);
    if (attempted)
      return (
        <details>
          <summary>
            {stage === 'baseline' ? 'Starting questions' : 'Different final questions'}:{' '}
            {score.correct} of {score.total} correct
          </summary>
          <ol>
            {pathwayQuestions[stage].map((question) => (
              <li key={question.id} style={{ marginTop: 14 }}>
                <p>{question.prompt}</p>
                <p>
                  <strong>
                    {pathwayAnswerCorrect(question, attempted.answers[question.id])
                      ? 'Correct.'
                      : 'Review this idea.'}
                  </strong>{' '}
                  {question.explanation}
                </p>
              </li>
            ))}
          </ol>
        </details>
      );
    return (
      <form onSubmit={(event) => submit(event, stage)}>
        <h3>{stage === 'baseline' ? '1. Find your starting point' : '3. Try different atoms'}</h3>
        <p className="muted">
          {stage === 'baseline'
            ? 'Try these three questions before the lesson. It is fine to be unsure.'
            : 'These are new questions about the same ideas. Try them without looking at the worked answers.'}
        </p>
        {pathwayQuestions[stage].map((question) => (
          <fieldset
            key={question.id}
            style={{ border: 0, margin: '22px 0', padding: 0 }}
            disabled={!ready}
          >
            <legend style={{ marginBottom: 10 }}>{question.prompt}</legend>
            {question.kind === 'number' ? (
              <label className="field-label" style={{ marginTop: 0 }}>
                Number of particles
                <input
                  className="text-input"
                  inputMode="numeric"
                  required
                  pattern="[0-9]{1,4}(\.0+)?"
                  maxLength={80}
                  value={answers[question.id] ?? ''}
                  onChange={(event) =>
                    setAnswers((previous) => ({ ...previous, [question.id]: event.target.value }))
                  }
                />
              </label>
            ) : (
              question.options.map((option) => (
                <label
                  key={option.id}
                  className={`answer ${answers[question.id] === option.id ? 'selected' : ''}`}
                  style={{ marginTop: 8 }}
                >
                  <input
                    type="radio"
                    required
                    name={`${titleId}-${question.id}`}
                    value={option.id}
                    checked={answers[question.id] === option.id}
                    onChange={() =>
                      setAnswers((previous) => ({ ...previous, [question.id]: option.id }))
                    }
                  />
                  <span>{option.label}</span>
                </label>
              ))
            )}
          </fieldset>
        ))}
        <button className="button primary" type="submit" disabled={!ready}>
          Record {stage === 'baseline' ? 'starting' : 'final'} answers{' '}
          <ArrowRight aria-hidden="true" />
        </button>
      </form>
    );
  }

  return (
    <section className="progress-stat" aria-labelledby={titleId}>
      <div className="activity-kicker">
        <span className="tag peach">GRADE 10 · ATOMIC STRUCTURE</span>
        <span>One learning objective</span>
      </div>
      <div className="section-heading">
        <h2 id={titleId}>{atomicStructurePathway.title}</h2>
      </div>
      <p className="muted">{atomicStructurePathway.objective}</p>
      <p className="muted">
        Starting questions → explore the lesson → different final questions. This small practice
        record is separate from your main learning progress and does not establish mastery.
      </p>
      <div style={{ marginTop: 22 }}>{questions('baseline')}</div>
      {state.baseline && (
        <div style={{ marginTop: 24 }}>
          <h3>2. Explore the idea</h3>
          <p className="muted">
            Take your time with the explanation and the atomic model. Return here when you are ready
            for different questions.
          </p>
          {atomicStructurePathway.lessonIds.map((id) => {
            const lesson = lessons.find((item) => item.id === id);
            return lesson ? (
              <a
                key={id}
                className="button secondary"
                href={`#/lesson/${id}`}
                onClick={(event) => openLesson(event, id)}
              >
                <BookOpen aria-hidden="true" /> {lesson.title}
              </a>
            ) : null;
          })}
        </div>
      )}
      {state.lessonOpenedAt && <div style={{ marginTop: 24 }}>{questions('final')}</div>}
      {state.final && (
        <p className="answer-feedback">
          Compare your reasoning on both sets. A score on three questions is a practice snapshot;
          revisit any idea you are still building.
        </p>
      )}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 24 }}>
        <button
          className="button secondary"
          disabled={!ready}
          onClick={() => {
            try {
              download(exportPathwayProgress(state), 'lumni-atomic-structure-pathway.json');
              setNotice(
                'Pathway backup downloaded. Keep it to restore this record on another device.',
              );
            } catch {
              setNotice('The backup could not be downloaded.');
            }
          }}
        >
          <Download aria-hidden="true" /> Export pathway
        </button>
        {blocked && original && (
          <button
            className="button secondary"
            onClick={() => download(original, 'lumni-original-pathway-record.json')}
          >
            Download original record
          </button>
        )}
        <button
          className="button secondary"
          disabled={!ready}
          onClick={() => {
            if (
              !window.confirm(
                'Start a new pathway attempt? Export first to keep your current answers. This replaces only the atomic-structure pathway.',
              )
            )
              return;
            commit(initialPathwayState(), true);
            setAnswers({});
          }}
        >
          Start another attempt
        </button>
      </div>
      <label className="field-label">
        Restore an exported pathway backup
        <input
          className="text-input"
          type="file"
          accept="application/json,.json"
          disabled={!ready}
          onChange={restore}
        />
      </label>
      <p className="muted" role="status" aria-live="polite">
        {notice ||
          (ready
            ? 'Your pathway answers stay on this device. Export a backup before moving devices or clearing browser data.'
            : 'Loading saved pathway progress…')}
      </p>
    </section>
  );
}

export default ObjectivePathway;
