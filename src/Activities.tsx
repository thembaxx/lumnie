'use client';
import { useState } from 'react';
import {
  ArrowRight,
  Check,
  CheckCircle,
  DotsSixVertical,
  Lightbulb,
  PuzzlePiece,
  Sparkle,
  Trophy,
  X,
} from '@phosphor-icons/react';
import { motion, AnimatePresence } from 'framer-motion';
import { quizBank, subjects, type Subject } from './data';
import MathText from './MathText';
type ActivityProps = {
  onFeedback: (kind: 'tap' | 'success' | 'wrong' | 'celebrate') => void;
  onComplete: (id: string, xp: number, score?: number) => void;
  onClose: () => void;
};
export function Quiz({ subject, ...props }: ActivityProps & { subject: Subject }) {
  const questions = quizBank[subject],
    name = subjects.find((s) => s.id === subject)!.name;
  const [index, setIndex] = useState(0),
    [selected, setSelected] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [score, setScore] = useState(0),
    [done, setDone] = useState(false);
  const q = questions[index];
  function check() {
    if (selected === null || checked) return;
    setChecked(true);
    if (selected === q.correct) {
      setScore((s) => s + 1);
      props.onFeedback('success');
    } else props.onFeedback('wrong');
  }
  function next() {
    if (index === questions.length - 1) {
      setDone(true);
      props.onFeedback('celebrate');
      props.onComplete(
        `quiz-${subject}-${new Date().toISOString().slice(0, 10)}`,
        score >= 3 ? 50 : 20,
        Math.round((score / questions.length) * 100),
      );
    } else {
      setIndex((i) => i + 1);
      setSelected(null);
      setChecked(false);
      props.onFeedback('tap');
    }
  }
  if (done)
    return (
      <div className="activity-result">
        <div className="result-icon">
          <Trophy size={48} weight="duotone" />
        </div>
        <span className="eyebrow">ANOTHER LITTLE LEAP</span>
        <h2>
          {score === 5
            ? 'Look at you go!'
            : score >= 3
              ? 'That’s an aha moment.'
              : 'Curiosity is how we grow.'}
        </h2>
        <p>
          You got{' '}
          <strong>
            {score} of {questions.length}
          </strong>{' '}
          right. Every attempt makes the ideas a little clearer.
        </p>
        <div className="result-stats">
          <span>
            <Sparkle weight="fill" /> +{score >= 3 ? 50 : 20} XP{' '}
            <small>First completion today</small>
          </span>
          <span>
            <CheckCircle weight="fill" /> {Math.round((score / questions.length) * 100)}%{' '}
            <small>Quiz accuracy</small>
          </span>
        </div>
        <button className="button primary" onClick={props.onClose}>
          Back to your journey <ArrowRight />
        </button>
      </div>
    );
  return (
    <div className="quiz-content">
      <div className="activity-kicker">
        <span className="tag lilac">{name}</span>
        <span>
          {index + 1} of {questions.length}
        </span>
      </div>
      <div className="progress-track quiz-progress">
        <motion.div
          animate={{ width: `${((index + (checked ? 1 : 0)) / questions.length) * 100}%` }}
        />
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={index}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.18 }}
        >
          <h2 className="question-title">{q.prompt}</h2>
          {q.equation && (
            <div className="question-equation">
              <MathText tex={q.equation} block />
            </div>
          )}
          <div className="answer-grid">
            {q.answers.map((answer, i) => (
              <button
                key={answer}
                disabled={checked}
                className={`answer ${selected === i ? 'selected' : ''} ${checked && i === q.correct ? 'correct' : ''} ${checked && i === selected && i !== q.correct ? 'incorrect' : ''}`}
                onClick={() => {
                  setSelected(i);
                  props.onFeedback('tap');
                }}
              >
                <span className="answer-letter">{'ABCD'[i]}</span>
                <span>{/\\|^x =|^-?\d+$/.test(answer) ? <MathText tex={answer} /> : answer}</span>
                {checked && i === q.correct ? (
                  <Check weight="bold" />
                ) : checked && i === selected ? (
                  <X weight="bold" />
                ) : null}
              </button>
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
      {checked && (
        <motion.div
          className={`answer-feedback ${selected === q.correct ? 'success' : 'retry'}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <Lightbulb size={24} weight="duotone" />
          <div>
            <strong>
              {selected === q.correct ? 'Exactly. You’ve got it!' : 'A little learning moment.'}
            </strong>
            <p>{q.explanation}</p>
          </div>
        </motion.div>
      )}
      <div className="activity-footer">
        <span>
          <Sparkle weight="fill" /> Up to 50 XP
        </span>
        <button
          className="button primary"
          disabled={selected === null}
          onClick={checked ? next : check}
        >
          {checked
            ? index === questions.length - 1
              ? 'See how you did'
              : 'Next question'
            : 'Check answer'}
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

const puzzles = [
  {
    id: 'equation',
    title: 'Put the pieces together.',
    description:
      'Arrange the steps to solve this equation. Drag a tile into place, or tap a tile and then a slot.',
    equation: '2x+6=18',
    tiles: ['x = 6', '2x = 12', '2x + 6 = 18'],
    order: [2, 1, 0],
    explanation:
      'Start with the equation, subtract 6 from both sides, then divide both sides by 2.',
  },
  {
    id: 'algorithm',
    title: 'A little logic goes a long way.',
    description:
      'Build the algorithm that doubles a number. Drag a tile into place, or tap a tile and then a slot.',
    equation: 'f(x)=2x',
    tiles: ['Display the result', 'Read the input', 'Multiply by 2'],
    order: [1, 2, 0],
    explanation: 'First read the number, then multiply it by 2, and finally display the result.',
  },
  {
    id: 'atom',
    title: 'Build a carbon-12 atom.',
    description:
      'Match each particle to its quantity. Drag a tile into place, or tap a tile and then a slot.',
    equation: '{}^{12}_{6}\\mathrm{C}',
    tiles: ['6 electrons', '6 protons', '6 neutrons'],
    order: [1, 2, 0],
    explanation:
      'Carbon-12 has 6 protons and 6 neutrons. A neutral carbon atom also has 6 electrons.',
  },
];
export function Puzzle({ puzzleIndex = 0, ...props }: ActivityProps & { puzzleIndex?: number }) {
  const p = puzzles[puzzleIndex];
  const [slots, setSlots] = useState<(number | null)[]>([null, null, null]),
    [active, setActive] = useState<number | null>(null),
    [checked, setChecked] = useState(false),
    [solved, setSolved] = useState(false),
    [hint, setHint] = useState(false);
  function place(tile: number, slot: number) {
    if (solved) return;
    setSlots((prev) => {
      const next = prev.map((v) => (v === tile ? null : v));
      next[slot] = tile;
      return next;
    });
    setActive(null);
    setChecked(false);
    props.onFeedback('tap');
  }
  function check() {
    setChecked(true);
    if (slots.every((v, i) => v === p.order[i])) {
      setSolved(true);
      props.onFeedback('celebrate');
      props.onComplete(`puzzle-${p.id}`, 35, 100);
    } else props.onFeedback('wrong');
  }
  return (
    <div className="puzzle-content">
      <div className="activity-kicker">
        <span className="tag mint">
          <PuzzlePiece weight="fill" />
          Brain teaser
        </span>
        <span>+35 XP</span>
      </div>
      <h2>{p.title}</h2>
      <p className="muted">{p.description}</p>
      <div className="question-equation">
        <MathText tex={p.equation} block />
      </div>
      <div className="puzzle-slots">
        {slots.map((tile, i) => (
          <button
            key={i}
            className={`puzzle-slot ${tile !== null ? 'filled' : ''} ${checked ? (tile === p.order[i] ? 'valid' : 'invalid') : ''}`}
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
            }}
            onDrop={(e) => {
              e.preventDefault();
              const value = e.dataTransfer.getData('text/plain');
              if (/^[0-2]$/.test(value)) place(Number(value), i);
            }}
            onClick={() => {
              if (active !== null) place(active, i);
              else if (tile !== null && !solved) {
                setSlots((s) => s.map((v, j) => (i === j ? null : v)));
                setChecked(false);
              }
            }}
            aria-label={`Slot ${i + 1}${tile !== null ? ': ' + p.tiles[tile] : ': empty'}`}
          >
            <span className="slot-number">
              {puzzleIndex === 2 ? ['Protons', 'Neutrons', 'Electrons'][i] : i + 1}
            </span>
            <span>
              {tile !== null ? (
                puzzleIndex === 0 ? (
                  <MathText tex={p.tiles[tile]} />
                ) : (
                  p.tiles[tile]
                )
              ) : (
                'Drop a little idea here'
              )}
            </span>
            {checked && tile === p.order[i] ? <Check /> : null}
          </button>
        ))}
      </div>
      <div className="puzzle-tiles">
        {p.tiles.map(
          (tile, i) =>
            !slots.includes(i) && (
              <button
                key={tile}
                draggable={!solved}
                className={`puzzle-tile ${active === i ? 'selected' : ''}`}
                onDragStart={(e) => e.dataTransfer.setData('text/plain', String(i))}
                onClick={() => {
                  setActive(active === i ? null : i);
                  props.onFeedback('tap');
                }}
              >
                <DotsSixVertical />
                {puzzleIndex === 0 ? <MathText tex={tile} /> : tile}
              </button>
            ),
        )}
      </div>
      {solved ? (
        <div className="answer-feedback success">
          <CheckCircle size={28} weight="fill" />
          <div>
            <strong>Everything clicked. Nicely done!</strong>
            <p>{p.explanation}</p>
          </div>
        </div>
      ) : checked ? (
        <div className="answer-feedback retry">
          <Lightbulb size={24} />
          <div>
            <strong>Almost there. Try moving a piece.</strong>
            <p>
              {puzzleIndex === 2
                ? 'Atomic number gives protons; subtract it from the mass number for neutrons.'
                : 'Think about which step comes first, then what changes next.'}
            </p>
          </div>
        </div>
      ) : hint ? (
        <div className="answer-feedback">
          <Lightbulb size={24} />
          <p>{p.explanation}</p>
        </div>
      ) : null}
      <div className="activity-footer">
        <button className="text-button" onClick={() => setHint(!hint)}>
          <Lightbulb />
          {hint ? 'Hide hint' : 'A little hint'}
        </button>
        <button
          className="button primary"
          disabled={!solved && slots.some((s) => s === null)}
          onClick={solved ? props.onClose : check}
        >
          {solved ? 'Keep exploring' : 'Check my puzzle'}
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}
