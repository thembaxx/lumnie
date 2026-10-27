export const PATHWAY_STORAGE_KEY = 'lumni.objective-pathway.v1';

export const atomicStructurePathway = {
  id: 'grade10-atomic-structure',
  title: 'From particles to atomic structure',
  grade: 10,
  objective:
    'Use atomic number and mass number to find protons, neutrons and electrons in a neutral atom.',
  lessonIds: ['atom'],
} as const;

export type PathwayStage = 'baseline' | 'final';
type SharedQuestion = { id: string; prompt: string; explanation: string };
export type PathwayQuestion = SharedQuestion &
  (
    | { kind: 'number'; answer: number }
    | { kind: 'choice'; answer: string; options: { id: string; label: string }[] }
  );

export const pathwayQuestions: Record<PathwayStage, PathwayQuestion[]> = {
  baseline: [
    {
      id: 'baseline-protons',
      kind: 'choice',
      prompt:
        'A neutral lithium-7 atom has atomic number 3 and mass number 7. How many protons does it have?',
      options: [
        { id: '3', label: '3 protons' },
        { id: '4', label: '4 protons' },
        { id: '7', label: '7 protons' },
      ],
      answer: '3',
      explanation: 'Atomic number Z counts protons. Lithium has Z = 3, so it has 3 protons.',
    },
    {
      id: 'baseline-neutrons',
      kind: 'number',
      prompt: 'Boron-11 has atomic number 5 and mass number 11. How many neutrons does it have?',
      answer: 6,
      explanation: 'Mass number A counts protons plus neutrons. N = A − Z = 11 − 5 = 6 neutrons.',
    },
    {
      id: 'baseline-electrons',
      kind: 'number',
      prompt: 'A neutral oxygen-16 atom has atomic number 8. How many electrons does it have?',
      answer: 8,
      explanation:
        'A neutral atom has equal numbers of protons and electrons. Z = 8 means 8 protons and 8 electrons.',
    },
  ],
  final: [
    {
      id: 'final-electrons',
      kind: 'number',
      prompt:
        'A neutral aluminium-27 atom has atomic number 13 and mass number 27. How many electrons does it have?',
      answer: 13,
      explanation:
        'Aluminium has 13 protons because Z = 13. A neutral atom therefore has 13 electrons; mass number does not set the electron count.',
    },
    {
      id: 'final-neutrons',
      kind: 'number',
      prompt:
        'Chlorine-37 has atomic number 17 and mass number 37. How many neutrons does it have?',
      answer: 20,
      explanation:
        'N = A − Z = 37 − 17 = 20 neutrons. Use this atom’s numbers rather than the carbon example from the lesson.',
    },
    {
      id: 'final-isotopes',
      kind: 'choice',
      prompt: 'Chlorine-35 and chlorine-37 both have atomic number 17. Which statement is correct?',
      options: [
        {
          id: 'same-protons',
          label: 'Both have 17 protons, but they have different numbers of neutrons.',
        },
        {
          id: 'same-neutrons',
          label: 'Both have 17 neutrons, but they have different numbers of protons.',
        },
        {
          id: 'mass-electrons',
          label: 'Chlorine-35 has 35 electrons and chlorine-37 has 37 electrons.',
        },
      ],
      answer: 'same-protons',
      explanation:
        'Isotopes of an element have the same proton count. Their neutron counts differ: 35 − 17 = 18 and 37 − 17 = 20.',
    },
  ],
};

export type PathwayAttempt = { answers: Record<string, string>; submittedAt: string };
export type PathwayState = {
  version: 1;
  pathwayId: typeof atomicStructurePathway.id;
  baseline: PathwayAttempt | null;
  final: PathwayAttempt | null;
  lessonOpenedAt: string | null;
};

export function initialPathwayState(): PathwayState {
  return {
    version: 1,
    pathwayId: atomicStructurePathway.id,
    baseline: null,
    final: null,
    lessonOpenedAt: null,
  };
}

function object(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === 'object' && !Array.isArray(value);
}

function timestamp(value: unknown): value is string {
  return (
    typeof value === 'string' &&
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) &&
    Number.isFinite(Date.parse(value)) &&
    new Date(value).toISOString() === value
  );
}

function answerAllowed(question: PathwayQuestion, answer: unknown): answer is string {
  return (
    typeof answer === 'string' &&
    answer.length <= 80 &&
    (question.kind === 'choice'
      ? question.options.some((option) => option.id === answer)
      : /^\d{1,4}(?:\.0+)?$/.test(answer.trim()))
  );
}

function completeAnswers(stage: PathwayStage, answers: unknown): answers is Record<string, string> {
  return (
    object(answers) &&
    Object.keys(answers).length === pathwayQuestions[stage].length &&
    pathwayQuestions[stage].every((question) => answerAllowed(question, answers[question.id]))
  );
}

function attempt(value: unknown, stage: PathwayStage): value is PathwayAttempt {
  return object(value) && timestamp(value.submittedAt) && completeAnswers(stage, value.answers);
}

/** Strictly checks this pathway's own data; unrelated/legacy app progress is untouched. */
export function parsePathwayState(value: unknown): PathwayState | null {
  if (
    !object(value) ||
    value.version !== 1 ||
    value.pathwayId !== atomicStructurePathway.id ||
    (value.baseline !== null && !attempt(value.baseline, 'baseline')) ||
    (value.final !== null && !attempt(value.final, 'final')) ||
    (value.lessonOpenedAt !== null && !timestamp(value.lessonOpenedAt))
  )
    return null;
  const state = value as PathwayState;
  if (
    state.lessonOpenedAt &&
    (!state.baseline || Date.parse(state.lessonOpenedAt) < Date.parse(state.baseline.submittedAt))
  )
    return null;
  if (
    state.final &&
    (!state.lessonOpenedAt ||
      Date.parse(state.final.submittedAt) < Date.parse(state.lessonOpenedAt))
  )
    return null;
  return {
    version: 1,
    pathwayId: atomicStructurePathway.id,
    baseline: state.baseline
      ? { submittedAt: state.baseline.submittedAt, answers: { ...state.baseline.answers } }
      : null,
    final: state.final
      ? { submittedAt: state.final.submittedAt, answers: { ...state.final.answers } }
      : null,
    lessonOpenedAt: state.lessonOpenedAt,
  };
}

export function pathwayAnswerCorrect(question: PathwayQuestion, answer: string): boolean {
  return (
    answerAllowed(question, answer) &&
    (question.kind === 'number' ? Number(answer) === question.answer : answer === question.answer)
  );
}

export function pathwayScore(attempted: PathwayAttempt | null, stage: PathwayStage) {
  const questions = pathwayQuestions[stage];
  return {
    correct: attempted
      ? questions.filter((question) =>
          pathwayAnswerCorrect(question, attempted.answers[question.id]),
        ).length
      : 0,
    total: questions.length,
  };
}

export function submitPathwayAttempt(
  state: PathwayState,
  stage: PathwayStage,
  answers: Record<string, string>,
  now = Date.now(),
): PathwayState {
  if (!parsePathwayState(state)) throw new Error('The current pathway record is invalid.');
  if (state[stage])
    throw new Error(
      'This question set has already been recorded. Start another attempt to repeat the pathway.',
    );
  if (stage === 'final' && (!state.baseline || !state.lessonOpenedAt))
    throw new Error(
      'Complete the starting questions and open the lesson before the final questions.',
    );
  if (!completeAnswers(stage, answers))
    throw new Error('Answer all three questions with a whole number or one listed option.');
  const updated: PathwayState = {
    ...state,
    [stage]: { answers: { ...answers }, submittedAt: new Date(now).toISOString() },
  };
  if (!parsePathwayState(updated))
    throw new Error('The device clock changed. Check its time before saving this attempt.');
  return updated;
}

export function recordPathwayLessonOpened(state: PathwayState, now = Date.now()): PathwayState {
  if (!parsePathwayState(state)) throw new Error('The current pathway record is invalid.');
  if (!state.baseline)
    throw new Error('Record your starting answers before opening the pathway lesson.');
  if (state.lessonOpenedAt) return state;
  const updated = { ...state, lessonOpenedAt: new Date(now).toISOString() };
  if (!parsePathwayState(updated))
    throw new Error('The device clock changed. Check its time before opening the lesson.');
  return updated;
}

export function exportPathwayProgress(state: PathwayState, now = Date.now()): string {
  const checked = parsePathwayState(state);
  if (!checked) throw new Error('This pathway record cannot be exported.');
  return JSON.stringify(
    { format: 'lumni-objective-pathway', exportedAt: new Date(now).toISOString(), state: checked },
    null,
    2,
  );
}

export function importPathwayProgress(text: string): PathwayState {
  if (text.length > 100_000) throw new Error('Choose a pathway backup smaller than 100 KB.');
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch {
    throw new Error('This file is not valid JSON.');
  }
  const checked =
    object(value) && value.format === 'lumni-objective-pathway'
      ? parsePathwayState(value.state)
      : null;
  if (!checked)
    throw new Error(
      'This is not a supported atomic-structure pathway backup. Your saved data has not changed.',
    );
  return checked;
}
