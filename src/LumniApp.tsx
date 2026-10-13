'use client';
import { useEffect, useRef, useState, useCallback, type ReactNode } from 'react';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Atom,
  Bell,
  BookOpen,
  Check,
  CheckCircle,
  ChartBar,
  Clock,
  Code,
  Cube,
  Dna,
  Fire,
  GearSix,
  GraduationCap,
  House,
  Lightning,
  Lightbulb,
  MagnifyingGlass,
  Moon,
  Palette,
  Pause,
  Play,
  PuzzlePiece,
  SlidersHorizontal,
  Sparkle,
  SpeakerHigh,
  SpeakerSlash,
  Sun,
  Target,
  X,
  CaretRight,
  ArrowsClockwise,
  HandGrabbing,
  Leaf,
  Heart,
  Info,
  ShareNetwork,
} from '@phosphor-icons/react';
import {
  subjects,
  lessons,
  curriculumSources,
  type Subject,
  type Lesson,
  type SceneKind,
} from './data';
import { Quiz, Puzzle } from './Activities';
import { feedback } from './feedback';
import MathText from './MathText';
import { useAppearance } from './useAppearance';
import { useAppNavigation, type Page } from './useAppNavigation';
import { usePwa } from './usePwa';
import { shareLink, useWakeLock, useNativeViewport } from './useNative';
import { AppStatus, NativeSettings } from './NativeSettings';
const Scene = dynamic(() => import('./Scene'), {
  ssr: false,
  loading: () => (
    <div className="scene-loading" role="status" aria-label="Loading interactive diagram">
      <Atom weight="thin" />
    </div>
  ),
});
const Delight = dynamic(() => import('./Delight'), { ssr: false });
const PatternGame = dynamic(() => import('./PatternGame'), {
  ssr: false,
  loading: () => (
    <div className="game-loading" role="status">
      Growing your number garden…
    </div>
  ),
});
type Profile = { name: string; grade: number; goal: number; onboarded: boolean };
type Progress = {
  xp: number;
  completed: string[];
  scores: Record<string, number>;
  dates: string[];
};
const emptyProgress: Progress = { xp: 0, completed: [], scores: {}, dates: [] };
const navItems = [
  { id: 'today' as Page, label: 'Today', Icon: House },
  { id: 'learn' as Page, label: 'Learn', Icon: BookOpen },
  { id: 'labs' as Page, label: '3D playground', Icon: Cube },
  { id: 'play' as Page, label: 'Challenges', Icon: PuzzlePiece },
  { id: 'progress' as Page, label: 'My progress', Icon: ChartBar },
];
const subjectIcons = {
  maths: function MathsIcon({
    size = 22,
    ...rest
  }: {
    size?: number;
    weight?: 'fill' | 'regular' | 'duotone';
    className?: string;
  }) {
    return <ChartBar size={size} {...rest} />;
  },
  physics: Atom,
  biology: Dna,
  technology: Code,
};

function SubjectArt({ subject, large = false }: { subject: Subject; large?: boolean }) {
  if (subject === 'maths')
    return (
      <svg
        className={`subject-art ${large ? 'large' : ''}`}
        viewBox="0 0 160 100"
        fill="none"
        aria-hidden="true"
      >
        <path d="M23 75H138M37 13V91" stroke="#b1a4d8" strokeWidth="1.5" />
        <path
          d="M37 58C50 58 55 24 73 24S91 77 111 77C124 77 129 52 138 41"
          stroke="#7c62c6"
          strokeWidth="3.8"
          strokeLinecap="round"
        />
        <circle cx="73" cy="24" r="5" fill="#a591e3" />
        <circle cx="111" cy="77" r="5" fill="#f6f2ff" stroke="#7c62c6" strokeWidth="2" />
        <text x="123" y="22" fill="#7c62c6" fontSize="22" fontFamily="Fraunces">
          π
        </text>
      </svg>
    );
  if (subject === 'physics')
    return (
      <svg
        className={`subject-art ${large ? 'large' : ''}`}
        viewBox="0 0 160 100"
        aria-hidden="true"
      >
        <g fill="none" stroke="#ce9177" strokeWidth="2.4">
          <ellipse cx="80" cy="48" rx="43" ry="15" transform="rotate(-35 80 48)" />
          <ellipse cx="80" cy="48" rx="43" ry="15" transform="rotate(35 80 48)" />
          <ellipse cx="80" cy="48" rx="43" ry="15" transform="rotate(90 80 48)" />
        </g>
        <circle cx="78" cy="45" r="12" fill="#eab198" />
        <circle cx="88" cy="52" r="10" fill="#e9c77d" />
        <circle cx="46" cy="69" r="6" fill="#bc826a" />
        <circle cx="113" cy="25" r="5" fill="#fdf3e7" />
      </svg>
    );
  if (subject === 'biology')
    return (
      <svg
        className={`subject-art ${large ? 'large' : ''}`}
        viewBox="0 0 160 100"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M59 10C59 35 102 34 102 56S59 80 59 92M102 10C102 35 59 34 59 56S102 80 102 92"
          stroke="#65a78b"
          strokeWidth="3.7"
          strokeLinecap="round"
        />
        {[20, 32, 44, 56, 68, 80].map((y, i) => (
          <path
            key={y}
            d={`M${i % 3 === 0 ? 65 : i % 3 === 1 ? 73 : 61} ${y}H${i % 3 === 0 ? 96 : i % 3 === 1 ? 88 : 100}`}
            stroke={i % 2 ? '#90b89a' : '#bdcf8d'}
            strokeWidth="3"
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  return (
    <svg
      className={`subject-art ${large ? 'large' : ''}`}
      viewBox="0 0 160 100"
      fill="none"
      aria-hidden="true"
    >
      <path d="M80 13L116 34L80 55L44 34L80 13Z" fill="#aec4eb" />
      <path d="M44 34L80 55V89L44 68V34Z" fill="#c3d6f2" />
      <path d="M80 55L116 34V68L80 89V55Z" fill="#86a8d6" />
      <path
        d="M63 49L57 54L63 62M96 50L102 55L96 63"
        stroke="#eff5ff"
        strokeWidth="2.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
function Dialog({
  title,
  children,
  onClose,
  wide = false,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null,
      overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const elements = ref.current?.querySelectorAll<HTMLElement>(
          'button:not(:disabled),input,select,a[href],[tabindex="0"]',
        );
        if (!elements?.length) return;
        const first = elements[0],
          last = elements[elements.length - 1];
        if (
          e.shiftKey &&
          (document.activeElement === first || document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', key);
    return () => {
      document.body.style.overflow = overflow;
      document.removeEventListener('keydown', key);
      previous?.focus();
    };
  }, [onClose]);
  return (
    <motion.div
      className="dialog-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        className={`dialog ${wide ? 'dialog-wide' : ''}`}
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 16, scale: 0.98 }}
        transition={{ type: 'spring', damping: 29, stiffness: 350 }}
      >
        <div className="dialog-header">
          <div className="dialog-brand">
            <Sparkle weight="fill" />
            <span id="dialog-title">{title}</span>
          </div>
          <button className="icon-button" onClick={onClose} aria-label="Close dialog">
            <X size={22} />
          </button>
        </div>
        {children}
      </motion.div>
    </motion.div>
  );
}

function Onboarding({ profile, onFinish }: { profile: Profile; onFinish: (p: Profile) => void }) {
  const [step, setStep] = useState(0),
    [name, setName] = useState(profile.onboarded ? profile.name : ''),
    [grade, setGrade] = useState(profile.grade),
    [goal, setGoal] = useState(profile.goal);
  return (
    <div className="onboarding">
      <div className="onboarding-dots">
        {[0, 1, 2].map((i) => (
          <span className={i <= step ? 'active' : ''} key={i} />
        ))}
      </div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <div className={`onboarding-art step-${step}`}>
            <span className="orb orb-one" />
            <span className="orb orb-two" />
            <span className="orb orb-three" />
            {step === 0 ? (
              <Sparkle weight="fill" size={58} />
            ) : step === 1 ? (
              <GraduationCap size={62} weight="duotone" />
            ) : (
              <Target size={62} weight="duotone" />
            )}
          </div>
          <span className="eyebrow">A LITTLE MORE YOU</span>
          <h2>
            {
              [
                'Big ideas start with you.',
                'Meet your learning level.',
                'Small steps. Big possibilities.',
              ][step]
            }
          </h2>
          <p className="muted">
            {
              [
                'Welcome to your playground for curious minds. What should we call you?',
                'Your journey follows South African CAPS topics, with a little extra room to play.',
                'A little learning, often, goes a long way. Pick a daily goal that feels good.',
              ][step]
            }
          </p>
          {step === 0 ? (
            <label className="field-label">
              Your first name
              <input
                autoComplete="given-name"
                placeholder="e.g. Thando"
                maxLength={24}
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="text-input"
                autoFocus
              />
            </label>
          ) : step === 1 ? (
            <div className="choice-grid">
              {[10, 11, 12].map((g) => (
                <button
                  key={g}
                  className={`choice ${grade === g ? 'selected' : ''}`}
                  onClick={() => setGrade(g)}
                >
                  <GraduationCap size={26} />
                  <strong>Grade {g}</strong>
                  <span>
                    {g === 12
                      ? 'Matric momentum'
                      : g === 11
                        ? 'Build your confidence'
                        : 'A strong foundation'}
                  </span>
                  {grade === g && <CheckCircle weight="fill" />}
                </button>
              ))}
            </div>
          ) : (
            <div className="goal-choices">
              {[5, 10, 15].map((g) => (
                <button
                  key={g}
                  className={`goal-choice ${goal === g ? 'selected' : ''}`}
                  onClick={() => setGoal(g)}
                >
                  <span>
                    <strong>{g} minutes</strong>
                    <small>
                      {g === 5
                        ? 'A spark of curiosity'
                        : g === 10
                          ? 'A daily dose of discovery'
                          : 'Find your flow'}
                    </small>
                  </span>
                  {goal === g ? <CheckCircle weight="fill" /> : <Clock />}
                  {g === 10 && <span className="recommended">POPULAR</span>}
                </button>
              ))}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
      <div className="onboarding-footer">
        {step > 0 ? (
          <button className="text-button" onClick={() => setStep((s) => s - 1)}>
            <ArrowLeft />
            Back
          </button>
        ) : (
          <span className="small-muted">Made for South African minds.</span>
        )}
        <button
          className="button primary"
          disabled={step === 0 && !name.trim()}
          onClick={() =>
            step < 2
              ? setStep((s) => s + 1)
              : onFinish({ name: name.trim(), grade, goal, onboarded: true })
          }
        >
          {step === 2 ? 'Let’s get curious' : 'Continue'}
          <ArrowRight />
        </button>
      </div>
    </div>
  );
}

function LessonView({
  lesson,
  completed,
  onComplete,
  onQuiz,
  onFeedback,
  onShare,
}: {
  lesson: Lesson;
  completed: boolean;
  onComplete: () => void;
  onQuiz: () => void;
  onFeedback: () => void;
  onShare: () => void;
}) {
  const [playing, setPlaying] = useState(true),
    [value, setValue] = useState(
      lesson.id === 'forces'
        ? 10
        : lesson.id === 'electricity'
          ? 6
          : lesson.id === 'waves'
            ? 3
            : 30,
    ),
    [exploded, setExploded] = useState(false),
    [reset, setReset] = useState(0),
    [selected, setSelected] = useState(''),
    [renderer, setRenderer] = useState('');
  const ready = useCallback((r: string) => setRenderer(r), []);
  const isLab = ['atom', 'water', 'trig', 'waves', 'forces', 'electricity'].includes(lesson.id);
  return (
    <div className="lesson-view">
      <div className="lesson-intro">
        <span className={`tag ${subjects.find((s) => s.id === lesson.subject)!.color}`}>
          {subjects.find((s) => s.id === lesson.subject)!.name}
        </span>
        <span className="small-muted">
          <Clock /> {lesson.minutes} min · Grade {lesson.grade}
        </span>
        <h2>{lesson.title}</h2>
        <p className="muted">{lesson.description}</p>
        <button className="button small lesson-share" onClick={onShare}>
          <ShareNetwork />
          Share this discovery
        </button>
      </div>
      {isLab ? (
        <div className={`lab-view ${subjects.find((s) => s.id === lesson.subject)!.color}`}>
          <div className="lab-chips">
            <span className="glass-tag">
              <Cube />
              Interactive 3D lab
            </span>
            <span className="glass-tag">
              {lesson.id === 'atom'
                ? 'Carbon-12'
                : lesson.id === 'water'
                  ? 'H₂O'
                  : lesson.id === 'trig'
                    ? 'Unit circle'
                    : lesson.id === 'forces'
                      ? 'Force diagram'
                      : lesson.id === 'electricity'
                        ? 'Ohm’s law'
                        : 'Transverse wave'}
            </span>
          </div>
          <Scene
            kind={lesson.kind}
            playing={playing}
            value={value}
            exploded={exploded}
            resetKey={reset}
            onSelect={setSelected}
            onReady={ready}
          />
          <div className="lab-caption">
            {selected || 'Drag to rotate · Tap a particle to discover'}
          </div>
          <div className="lab-toolbar">
            <button
              className="icon-button"
              onClick={() => {
                setPlaying(!playing);
                onFeedback();
              }}
              aria-label={playing ? 'Pause animation' : 'Play animation'}
            >
              {playing ? <Pause weight="fill" /> : <Play weight="fill" />}
            </button>
            <button
              className="icon-button"
              onClick={() => {
                setReset((r) => r + 1);
                onFeedback();
              }}
              aria-label="Reset diagram"
            >
              <ArrowsClockwise />
            </button>
            {lesson.id === 'atom' ? (
              <button
                className={`button small ${exploded ? 'active' : ''}`}
                onClick={() => {
                  setExploded(!exploded);
                  onFeedback();
                }}
              >
                <Atom />
                {exploded ? 'Bring it together' : 'Peek inside'}
              </button>
            ) : lesson.id === 'trig' ||
              lesson.id === 'waves' ||
              lesson.id === 'forces' ||
              lesson.id === 'electricity' ? (
              <label className="lab-slider">
                {lesson.id === 'trig'
                  ? 'Angle'
                  : lesson.id === 'forces'
                    ? 'Force'
                    : lesson.id === 'electricity'
                      ? 'Voltage'
                      : 'Frequency'}
                <input
                  type="range"
                  min={lesson.id === 'waves' ? 1 : 0}
                  max={
                    lesson.id === 'trig'
                      ? 360
                      : lesson.id === 'forces'
                        ? 20
                        : lesson.id === 'electricity'
                          ? 12
                          : 6
                  }
                  value={value}
                  onChange={(e) => setValue(Number(e.target.value))}
                />
                <strong>
                  {value}
                  {lesson.id === 'trig'
                    ? '°'
                    : lesson.id === 'forces'
                      ? ' N'
                      : lesson.id === 'electricity'
                        ? ' V'
                        : ' Hz'}
                </strong>
              </label>
            ) : (
              <span className="small-muted">104.5° bond angle</span>
            )}
            <span
              className="renderer-dot"
              title={`${renderer || 'GPU'} rendering`}
              aria-label={`${renderer || 'GPU'} rendering`}
            />
          </div>
          {lesson.id === 'waves' && (
            <div className="coordinate-readout">
              <span>
                Wavelength <strong>{(10 / value).toFixed(2)} m</strong>
              </span>
              <span>
                Speed <strong>10 m·s⁻¹</strong>
              </span>
            </div>
          )}
          {(lesson.id === 'forces' || lesson.id === 'electricity') && (
            <div className="coordinate-readout">
              <span>
                {lesson.id === 'forces' ? 'Acceleration' : 'Current'}{' '}
                <strong>
                  {(value / (lesson.id === 'forces' ? 2 : 6)).toFixed(2)}{' '}
                  {lesson.id === 'forces' ? 'm·s⁻²' : 'A'}
                </strong>
              </span>
            </div>
          )}
          {lesson.id === 'trig' && (
            <div className="coordinate-readout">
              <span>
                cos θ <strong>{Math.cos((value * Math.PI) / 180).toFixed(3)}</strong>
              </span>
              <span>
                sin θ <strong>{Math.sin((value * Math.PI) / 180).toFixed(3)}</strong>
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="lesson-formula-art">
          <SubjectArt subject={lesson.subject} large />
          <MathText tex={lesson.formula} block />
        </div>
      )}
      <div className="lesson-body">
        {lesson.id === 'forces' && (
          <div className="velocity-diagram">
            <div className="section-heading">
              <h3>
                {value === 0
                  ? 'Constant velocity. Zero acceleration.'
                  : 'A force changes the velocity.'}
              </h3>
              <span className="small-muted">v₀ = 2 m·s⁻¹</span>
            </div>
            <svg
              viewBox="0 0 460 160"
              role="img"
              aria-label={`Velocity versus time graph. Acceleration is ${value / 2} metres per second squared.`}
            >
              <path d="M50 16V126H430" fill="none" stroke="currentColor" opacity=".3" />
              <path
                d="M50 76H430M50 26H430"
                stroke="currentColor"
                opacity=".08"
                strokeDasharray="4 4"
              />
              <text x="12" y="30">
                50
              </text>
              <text x="12" y="80">
                25
              </text>
              <text x="28" y="130">
                0
              </text>
              <text x="43" y="147">
                0
              </text>
              <text x="232" y="147">
                2
              </text>
              <text x="422" y="147">
                4
              </text>
              <text x="50" y="10">
                Velocity (m·s⁻¹)
              </text>
              <text x="349" y="158">
                Time (s)
              </text>
              <motion.path
                d={`M50 122 L430 ${122 - (value / 2) * 4 * 2}`}
                fill="none"
                stroke="#9f88d3"
                strokeWidth="3"
                strokeLinecap="round"
              />
              <circle cx="430" cy={122 - (value / 2) * 4 * 2} r="4" fill="#9f88d3" />
            </svg>
            <p>
              Acceleration = {value / 2} m·s⁻².{' '}
              {value === 0
                ? 'With zero net force, the object keeps moving at 2 m·s⁻¹.'
                : `A constant ${value} N net force on a 2 kg object increases its velocity steadily.`}
            </p>
          </div>
        )}
        <h3>A little understanding.</h3>
        {lesson.facts.map((fact, i) => (
          <div className="lesson-fact" key={fact}>
            <span>{String(i + 1).padStart(2, '0')}</span>
            <p>{fact}</p>
          </div>
        ))}
        {isLab && (
          <div className="lesson-equation">
            <MathText tex={lesson.formula} block />
          </div>
        )}
        <a className="source-link" href={lesson.source} target="_blank" rel="noreferrer">
          Explore the curriculum reference <ArrowUpRight />
        </a>
      </div>
      <div className="lesson-footer">
        <button
          className={`button ${completed ? 'completed' : 'secondary'}`}
          onClick={onComplete}
          disabled={completed}
        >
          <CheckCircle weight={completed ? 'fill' : 'regular'} />
          {completed ? 'Lesson completed' : 'Mark complete · +25 XP'}
        </button>
        <button className="button primary" onClick={onQuiz}>
          Give it a go <ArrowRight />
        </button>
      </div>
    </div>
  );
}

function WeeklyRing({ count = 3 }: { count?: number }) {
  return (
    <div className="weekly-ring">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <circle cx="50" cy="50" r="40" fill="none" stroke="var(--ring-track)" strokeWidth="8" />
        <circle
          cx="50"
          cy="50"
          r="40"
          fill="none"
          stroke="#9c89de"
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${Math.min(count / 5, 1) * 251.3} 251.3`}
          transform="rotate(-90 50 50)"
        />
      </svg>
      <span>
        <strong>{count}</strong>
        <small>/ 5</small>
      </span>
    </div>
  );
}

export default function LumniApp() {
  const {
    page,
    setPage,
    modal,
    setModal,
    close,
    lesson,
    setLesson,
    quizSubject,
    setQuizSubject,
    puzzleIndex,
    setPuzzleIndex,
  } = useAppNavigation();
  const { theme, preference, setTheme, designB, setDesignB } = useAppearance();
  const pwa = usePwa();
  useNativeViewport();
  const wake = useWakeLock(['lesson', 'quiz', 'puzzle', 'game'].includes(modal || ''));
  const [profile, setProfile] = useState<Profile>({
      name: 'Thando',
      grade: 10,
      goal: 10,
      onboarded: false,
    }),
    [progress, setProgress] = useState<Progress>(emptyProgress),
    [hydrated, setHydrated] = useState(false);
  const [sound, setSound] = useState(true),
    [haptics, setHaptics] = useState(true),
    [filter, setFilter] = useState<Subject | 'all'>('all'),
    [query, setQuery] = useState(''),
    [toast, setToast] = useState(''),
    [confetti, setConfetti] = useState(0),
    [notificationSeen, setNotificationSeen] = useState(false);
  const reduced = useReducedMotion();
  useEffect(() => {
    try {
      const raw = localStorage.getItem('lumni-playground-v1');
      if (raw) {
        const v = JSON.parse(raw);
        if (v.profile?.name && [10, 11, 12].includes(v.profile.grade)) setProfile(v.profile);
        if (v.progress && Array.isArray(v.progress.completed) && typeof v.progress.xp === 'number')
          setProgress(v.progress);
        if (typeof v.sound === 'boolean') setSound(v.sound);
        if (typeof v.haptics === 'boolean') setHaptics(v.haptics);
      }
    } catch {
      /* Use a fresh journey if saved state is unavailable. */
    }
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) {
      try {
        localStorage.setItem(
          'lumni-playground-v1',
          JSON.stringify({ profile, progress, sound, haptics }),
        );
      } catch {
        /* Browser storage is optional. */
      }
    }
  }, [profile, progress, sound, haptics, hydrated]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);
  useEffect(() => {
    const shortcut = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k' && !modal) {
        event.preventDefault();
        document.querySelector<HTMLInputElement>('.search-box input')?.focus();
      }
    };
    document.addEventListener('keydown', shortcut);
    return () => document.removeEventListener('keydown', shortcut);
  }, [modal]);
  const feel = useCallback(
    (kind: 'tap' | 'success' | 'wrong' | 'celebrate') => {
      feedback(kind, sound, haptics);
      if (kind === 'celebrate') setConfetti((c) => c + 1);
    },
    [sound, haptics],
  );
  function navigate(p: Page, subject: Subject | 'all' = 'all') {
    setPage(p);
    setFilter(subject);
    setQuery('');
    feel('tap');
    window.scrollTo({ top: 0, behavior: reduced ? 'instant' : 'smooth' });
  }
  function openLesson(l: Lesson) {
    setLesson(l);
    setModal('lesson');
    feel('tap');
  }
  function openQuiz(s: Subject) {
    setQuizSubject(s);
    setModal('quiz');
    feel('tap');
  }
  function openPuzzle(i = 0) {
    setPuzzleIndex(i);
    setModal('puzzle');
    feel('tap');
  }
  function complete(id: string, xp: number, score?: number) {
    if (progress.completed.includes(id)) {
      setToast('Already collected. Keep exploring something new.');
      return;
    }
    setProgress((p) => ({
      ...p,
      xp: p.xp + xp,
      completed: [...p.completed, id],
      scores: score === undefined ? p.scores : { ...p.scores, [id]: score },
      dates: [...new Set([...p.dates, new Date().toISOString().slice(0, 10)])],
    }));
    setToast(`A little progress. +${xp} XP added to your journey.`);
  }
  const sample = !profile.onboarded && progress.completed.length === 0;
  const xp = sample ? 1240 : progress.xp;
  const weekDates = progress.dates.filter(
    (d) => (Date.now() - new Date(d).getTime()) / 86400000 < 7,
  );
  const weekly = sample ? 3 : Math.min(5, weekDates.length);
  const streak = sample ? 7 : calculateStreak(progress.dates);
  const filteredLessons = lessons.filter(
    (l) =>
      (l.grade === profile.grade || query.trim()) &&
      (filter === 'all' || l.subject === filter) &&
      (!query.trim() ||
        `${l.title} ${l.description} ${l.tag} ${subjects.find((s) => s.id === l.subject)!.name}`
          .toLowerCase()
          .includes(query.toLowerCase())),
  );
  const gradeLessons = lessons.filter((l) => l.grade === profile.grade);
  const completedLessons = progress.completed.filter((id) =>
    lessons.some((l) => l.id === id),
  ).length;
  const accuracyValues = Object.values(progress.scores),
    accuracy = accuracyValues.length
      ? Math.round(accuracyValues.reduce((a, b) => a + b, 0) / accuracyValues.length)
      : sample
        ? 86
        : 0;
  const headerTitles = {
    today: 'A little more curious, every day.',
    learn: 'Big ideas. Little aha moments.',
    labs: 'Less reading. More discovering.',
    play: 'Let your curiosity come out to play.',
    progress: 'Look how far your curiosity goes.',
  };
  const headerSubtitles = {
    today: `Good to see you, ${profile.name}. Ready to make something click?`,
    learn: 'Find a topic, follow your curiosity, and learn by doing.',
    labs: 'Spin it, change it, get a little closer. The best way to learn is to explore.',
    play: 'A fresh challenge. A satisfying puzzle. A little extra spark.',
    progress: 'Every small step counts. Here’s your journey so far.',
  };
  const motionProps = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: reduced ? 0 : 0.28 },
  };
  return (
    <div
      className={`app-shell min-h-screen isolate ${designB ? 'design-atlas' : ''}`}
      data-theme={theme}
    >
      <aside className="sidebar">
        <button className="brand" onClick={() => navigate('today')} aria-label="Lumni home">
          <span className="brand-mark">
            <Sparkle weight="fill" />
          </span>
          <span>
            lumni<span className="brand-stop">.</span>
          </span>
        </button>
        <div className="sidebar-intro">A LITTLE MORE POSSIBLE.</div>
        <nav className="side-nav" aria-label="Main navigation">
          {navItems.map(({ id, label, Icon }) => (
            <button
              key={id}
              className={`nav-item ${page === id ? 'active' : ''}`}
              onClick={() => navigate(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon size={21} weight={page === id ? 'fill' : 'regular'} />
              <span>{label}</span>
              {id === 'play' && <span className="nav-dot" />}
            </button>
          ))}
        </nav>
        <div className="sidebar-section-label">YOUR SUBJECTS</div>
        <nav className="subject-nav" aria-label="Subjects">
          {subjects.map((s) => {
            const Icon = subjectIcons[s.id];
            return (
              <button key={s.id} onClick={() => navigate('learn', s.id)}>
                <span className={`subject-dot ${s.color}`} />
                {s.name}
                <Icon size={16} />
              </button>
            );
          })}
        </nav>
        <div className="sidebar-spacer" />
        <button
          className="curiosity-card"
          onClick={() => setModal(profile.onboarded ? 'goal' : 'onboarding')}
        >
          <span className="curiosity-star">
            <Sparkle size={27} weight="fill" />
          </span>
          <strong>
            {profile.onboarded ? 'A little learning. Every day.' : 'Your journey, your way.'}
          </strong>
          <p>
            {profile.onboarded
              ? `Your daily goal is ${profile.goal} minutes. Make a little time for you.`
              : 'Make room for your kind of curious.'}
          </p>
          <span>
            {profile.onboarded ? 'Adjust your goal' : 'Make it yours'}
            <ArrowRight size={17} />
          </span>
        </button>
        <div className="sidebar-bottom">
          <button className="sidebar-settings" onClick={() => setModal('settings')}>
            <GearSix size={20} />
            Settings & little details
          </button>
          <button className="profile-card" onClick={() => setModal('onboarding')}>
            <span className="avatar">{profile.name.slice(0, 1).toUpperCase()}</span>
            <span>
              <strong>{profile.name}</strong>
              <small>
                Grade {profile.grade} · {sample ? 'Preview learner' : 'Curious mind'}
              </small>
            </span>
            <CaretRight />
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div className="topbar-location">
            <span className="location-dot" />
            Your learning space <span className="breadcrumb-divider">/</span>
            <strong>{navItems.find((n) => n.id === page)?.label}</strong>
          </div>
          <div className="topbar-actions">
            <form
              className="search-box"
              onSubmit={(e) => {
                e.preventDefault();
                setPage('learn');
                setFilter('all');
              }}
            >
              <MagnifyingGlass size={18} />
              <input
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  if (e.target.value) setPage('learn');
                }}
                placeholder="Find your next aha…"
                aria-label="Search STEM lessons"
              />
              {query ? (
                <button type="button" onClick={() => setQuery('')} aria-label="Clear search">
                  <X />
                </button>
              ) : (
                <kbd>⌘ K</kbd>
              )}
            </form>
            <button
              className="icon-button theme-button"
              onClick={() => {
                setTheme(theme === 'light' ? 'dark' : 'light');
                feel('tap');
              }}
              aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
            >
              {theme === 'light' ? <Sun size={22} /> : <Moon size={22} />}
            </button>
            <button
              className="icon-button mobile-settings-button"
              onClick={() => setModal('settings')}
              aria-label="Settings"
            >
              <GearSix size={22} />
            </button>
            <button
              className="icon-button notification-button"
              onClick={() => {
                setModal('notifications');
                setNotificationSeen(true);
              }}
              aria-label="Notifications"
            >
              <Bell size={22} />
              {!notificationSeen && <i />}
            </button>
            <button
              className="topbar-avatar"
              onClick={() => setModal('onboarding')}
              aria-label="Edit your profile"
            >
              {profile.name.slice(0, 1).toUpperCase()}
            </button>
          </div>
        </header>
        <main className="main-content relative" id="main-content">
          <AppStatus pwa={pwa} />
          <div className="page-heading">
            <div>
              <span className="eyebrow">
                {page === 'today'
                  ? 'YOUR DAILY DOSE OF DISCOVERY'
                  : page === 'labs'
                    ? 'WELCOME TO YOUR PLAYGROUND'
                    : page === 'progress'
                      ? 'SMALL STEPS. REAL PROGRESS.'
                      : 'FOLLOW THAT LITTLE SPARK'}
              </span>
              <h1>{headerTitles[page]}</h1>
              <p>{headerSubtitles[page]}</p>
            </div>
            <div className="heading-badges">
              <button className="curriculum-badge" onClick={() => setModal('onboarding')}>
                <GraduationCap size={18} />
                Grade {profile.grade}
                <span />
                CAPS
              </button>
              <button className="xp-badge" onClick={() => navigate('progress')}>
                <Lightning weight="fill" size={19} />
                {xp.toLocaleString()}
                <small>XP</small>
              </button>
            </div>
          </div>
          <AnimatePresence mode="wait">
            <motion.div key={page} {...motionProps}>
              {page === 'today' && (
                <div className="dashboard-grid">
                  <div className="dashboard-left">
                    <section className="hero-card">
                      <div className="hero-text">
                        <span className="hero-eyebrow">
                          <span />
                          <span>LET’S DISCOVER SOMETHING</span>
                        </span>
                        <h2>
                          A whole world
                          <br />
                          inside an atom<span>.</span>
                        </h2>
                        <p>
                          The smallest things have the biggest stories.
                          <br />
                          Let’s take a closer look.
                        </p>
                        <div className="hero-meta">
                          <span>
                            <Atom size={17} />
                            Physical Sciences
                          </span>
                          <span>
                            <Clock size={16} />8 min
                          </span>
                        </div>
                        <button className="button primary" onClick={() => openLesson(lessons[0])}>
                          Let’s explore
                          <ArrowRight size={20} />
                        </button>
                      </div>
                      <div className="hero-visual">
                        <div className="hero-orbit-bg" />
                        <Scene
                          kind="atom"
                          onSelect={(label) => {
                            setToast(label);
                            feel('tap');
                          }}
                        />
                        <span className="hero-carbon">
                          <small>6</small>
                          <strong>C</strong>
                          <small>Carbon</small>
                        </span>
                        <span className="spin-label">
                          <HandGrabbing size={16} />
                          Give it a spin
                        </span>
                      </div>
                      <span className="hero-corner">
                        <Sparkle weight="fill" size={14} /> YOUR NEXT AHA MOMENT
                      </span>
                    </section>
                    <section className="subject-section">
                      <div className="section-heading">
                        <h2>Where will curiosity take you?</h2>
                        <button className="text-button" onClick={() => navigate('learn')}>
                          All subjects
                          <ArrowUpRight size={17} />
                        </button>
                      </div>
                      <div className="subject-grid">
                        {subjects.map((s, i) => (
                          <motion.button
                            whileHover={reduced ? {} : { y: -4 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className={`subject-card ${s.color}`}
                            key={s.id}
                            onClick={() => navigate('learn', s.id)}
                          >
                            <span className="subject-card-number">0{i + 1}</span>
                            <SubjectArt subject={s.id} />
                            <div>
                              <h3>{s.name}</h3>
                              <span>
                                {
                                  lessons.filter(
                                    (l) => l.subject === s.id && l.grade === profile.grade,
                                  ).length
                                }{' '}
                                little discoveries
                                <ArrowRight size={17} />
                              </span>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </section>
                    <section className="recommended-section">
                      <div className="section-heading">
                        <h2>Made for your curious mind</h2>
                        <span className="small-muted">A good place to start</span>
                      </div>
                      <div className="recommended-grid">
                        {[
                          gradeLessons.find((l) => l.subject === 'maths')!,
                          gradeLessons.find((l) => l.subject === 'technology')!,
                        ].map((l, i) => (
                          <button
                            className="recommend-card"
                            onClick={() => openLesson(l)}
                            key={l.id}
                          >
                            <div className={`recommend-visual ${i === 0 ? 'lilac' : 'blue'}`}>
                              {i === 0 ? (
                                <div className="unit-mini">
                                  <span />
                                  <i />
                                  <b>θ</b>
                                </div>
                              ) : (
                                <div className="code-mini">
                                  <span>
                                    if <b>curious</b>:
                                  </span>
                                  <span>&nbsp; keep_learning()</span>
                                  <span className="code-cursor" />
                                </div>
                              )}
                            </div>
                            <div className="recommend-content">
                              <span className="small-muted">
                                {i === 0 ? 'MATHEMATICS' : 'TECHNOLOGY'}{' '}
                                <span className="tiny-dot" /> {l.minutes} MIN
                              </span>
                              <h3>{l.title}</h3>
                              <p>{l.description}</p>
                              <span className="recommend-link">
                                {i === 0 ? 'Find your angle' : 'Think a little differently'}
                                <ArrowUpRight />
                              </span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </section>
                    <div className="dashboard-footer">
                      <Heart size={15} weight="fill" /> Made for curious minds. Rooted in South
                      Africa.
                      <button onClick={() => setModal('sources')}>
                        Our curriculum
                        <ArrowUpRight size={14} />
                      </button>
                    </div>
                  </div>
                  <aside className="dashboard-right">
                    <section className="streak-card">
                      <div className="card-topline">
                        <span className="eyebrow">A LITTLE MOMENTUM</span>
                        <Fire size={24} weight="fill" />
                      </div>
                      <div className="streak-number">
                        {streak}
                        <span>day{streak === 1 ? '' : 's'} of curiosity</span>
                      </div>
                      <p>
                        {streak ? 'Keep that spark alive.' : 'Every journey starts with a spark.'}
                      </p>
                      <div className="week-days">
                        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                          <div key={i}>
                            <span>{day}</span>
                            <b
                              className={
                                sample
                                  ? i < 4
                                    ? 'done'
                                    : i === 4
                                      ? 'today'
                                      : ''
                                  : i < Math.min(weekDates.length, 7)
                                    ? 'done'
                                    : ''
                              }
                            >
                              {(sample && i < 4) || (!sample && i < weekDates.length) ? (
                                <Check size={13} weight="bold" />
                              ) : sample && i === 4 ? (
                                <Fire size={14} weight="fill" />
                              ) : (
                                <span />
                              )}
                            </b>
                          </div>
                        ))}
                      </div>
                      <div className="streak-footer">
                        <span>
                          <Lightning size={16} weight="fill" />A little practice. A big difference.
                        </span>
                      </div>
                    </section>
                    <section className="weekly-card">
                      <div className="section-heading">
                        <h3>Your weekly rhythm</h3>
                        <button
                          className="icon-button tiny"
                          onClick={() => setModal('goal')}
                          aria-label="Adjust weekly goal"
                        >
                          <SlidersHorizontal size={18} />
                        </button>
                      </div>
                      <div className="weekly-content">
                        <WeeklyRing count={weekly} />
                        <div>
                          <strong>
                            {weekly >= 5 ? 'You found your flow.' : 'Small steps add up.'}
                          </strong>
                          <p>
                            {weekly >= 5
                              ? 'Your weekly goal is complete.'
                              : `${5 - weekly} learning days to go.`}
                          </p>
                          <span className="tag lilac">YOU’VE GOT THIS</span>
                        </div>
                      </div>
                    </section>
                    <section className="daily-puzzle-card">
                      <div className="card-topline">
                        <span className="eyebrow">THE DAILY BRAIN TEASER</span>
                        <PuzzlePiece weight="duotone" size={21} />
                      </div>
                      <div className="daily-puzzle-art">
                        <span className="puzzle-piece p-one">2x</span>
                        <span className="puzzle-piece p-two">+ 6</span>
                        <span className="puzzle-piece p-three">18</span>
                        <span className="puzzle-art-spark">
                          <Sparkle weight="fill" size={18} />
                        </span>
                      </div>
                      <h3>
                        A little puzzle.
                        <br />A satisfying click.
                      </h3>
                      <p>
                        Three pieces. One aha moment.
                        <br />
                        Can you put it all together?
                      </p>
                      <button className="button puzzle-cta" onClick={() => openPuzzle(0)}>
                        Challenge accepted
                        <ArrowRight size={18} />
                      </button>
                      <div className="daily-puzzle-meta">
                        <span>
                          <Clock size={14} />2 min
                        </span>
                        <span>
                          <Sparkle size={14} weight="fill" />
                          +35 XP
                        </span>
                      </div>
                    </section>
                    <button className="little-tip" onClick={() => setModal('design')}>
                      <span>
                        <Lightbulb size={23} weight="duotone" />
                      </span>
                      <div>
                        <strong>Good things take curiosity.</strong>
                        <p>Explore the thinking behind Lumni.</p>
                      </div>
                      <ArrowUpRight size={18} />
                    </button>
                  </aside>
                </div>
              )}
              {page === 'learn' && (
                <>
                  <div className="filter-bar">
                    <div className="filter-tabs">
                      <button
                        className={filter === 'all' ? 'active' : ''}
                        onClick={() => setFilter('all')}
                      >
                        All subjects
                      </button>
                      {subjects.map((s) => (
                        <button
                          key={s.id}
                          className={filter === s.id ? 'active' : ''}
                          onClick={() => setFilter(s.id)}
                        >
                          {s.short}
                        </button>
                      ))}
                    </div>
                    <span className="small-muted">
                      {filteredLessons.length} discoveries{' '}
                      {query ? 'across all grades' : `for Grade ${profile.grade}`}
                    </span>
                  </div>
                  {filteredLessons.length ? (
                    <div className="lesson-grid">
                      {filteredLessons.map((l, i) => (
                        <motion.button
                          key={l.id}
                          className="library-card"
                          onClick={() => openLesson(l)}
                          initial={{ opacity: 0, y: 12 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: reduced ? 0 : Math.min(i * 0.04, 0.2) }}
                        >
                          <div
                            className={`library-art ${subjects.find((s) => s.id === l.subject)!.color}`}
                          >
                            <SubjectArt subject={l.subject} large />
                            <span className="library-tag">
                              {['atom', 'trig', 'water', 'waves'].includes(l.id) ? (
                                <>
                                  <Cube size={15} />
                                  3D LAB
                                </>
                              ) : (
                                <>
                                  <BookOpen size={15} />
                                  MINI LESSON
                                </>
                              )}
                            </span>
                            {progress.completed.includes(l.id) && (
                              <span className="library-check">
                                <CheckCircle weight="fill" size={25} />
                              </span>
                            )}
                          </div>
                          <div className="library-body">
                            <span className="eyebrow">{l.tag}</span>
                            <h3>{l.title}</h3>
                            <p>{l.description}</p>
                            <div>
                              <span>
                                <Clock size={15} />
                                {l.minutes} min · Grade {l.grade}
                              </span>
                              <ArrowUpRight size={20} />
                            </div>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-state">
                      <MagnifyingGlass size={42} />
                      <h2>No discoveries found. Yet.</h2>
                      <p>Try “atom”, “circle”, “water”, or another STEM topic.</p>
                      <button
                        className="button secondary"
                        onClick={() => {
                          setQuery('');
                          setFilter('all');
                        }}
                      >
                        Show all lessons
                      </button>
                    </div>
                  )}
                </>
              )}
              {page === 'labs' && (
                <>
                  <div className="playground-intro">
                    <Cube weight="duotone" size={23} />
                    <span>Made to be moved. Built to be understood.</span>
                    <span className="tag mint">6 INTERACTIVE LABS</span>
                  </div>
                  <div className="labs-grid">
                    {[
                      {
                        id: 'atom',
                        kind: 'atom' as SceneKind,
                        title: 'A whole world inside an atom',
                        detail: 'Explore carbon-12. Meet the particles.',
                        color: 'lilac',
                      },
                      {
                        id: 'water',
                        kind: 'molecule' as SceneKind,
                        title: 'Get to know H₂O',
                        detail: 'Two hydrogens. One oxygen. So much possibility.',
                        color: 'peach',
                      },
                      {
                        id: 'trig',
                        kind: 'geometry' as SceneKind,
                        title: 'Find your angle',
                        detail: 'A unit circle that puts the pieces together.',
                        color: 'mint',
                      },
                      {
                        id: 'waves',
                        kind: 'wave' as SceneKind,
                        title: 'Make a little wave',
                        detail: 'Change the frequency. See the difference.',
                        color: 'blue',
                      },
                      {
                        id: 'forces',
                        kind: 'forces' as SceneKind,
                        title: 'A push in the right direction',
                        detail: 'Change the force. Discover the acceleration.',
                        color: 'peach',
                      },
                      {
                        id: 'electricity',
                        kind: 'circuit' as SceneKind,
                        title: 'Get into the current',
                        detail: 'A little voltage. A visible difference.',
                        color: 'lilac',
                      },
                    ].map((l) => (
                      <div key={l.id} className="lab-card">
                        <div className={`lab-card-stage ${l.color}`}>
                          <Scene
                            kind={l.kind}
                            value={
                              l.kind === 'wave'
                                ? 3
                                : l.kind === 'forces'
                                  ? 10
                                  : l.kind === 'circuit'
                                    ? 6
                                    : 30
                            }
                          />
                          <span className="glass-tag">
                            <HandGrabbing size={15} />
                            Go on, give it a spin
                          </span>
                        </div>
                        <div className="lab-card-body">
                          <div>
                            <h3>{l.title}</h3>
                            <p>{l.detail}</p>
                          </div>
                          <button
                            className="round-button"
                            onClick={() => openLesson(lessons.find((x) => x.id === l.id)!)}
                            aria-label={`Open ${l.title}`}
                          >
                            <ArrowUpRight size={22} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="lab-note">
                    <Info size={19} />
                    <p>
                      These are learning models. Particle sizes and paths are simplified to make the
                      ideas easier to explore.
                    </p>
                  </div>
                </>
              )}
              {page === 'play' && (
                <>
                  <section className="challenge-hero">
                    <div>
                      <span className="eyebrow">PLAY IS A PRETTY GOOD TEACHER</span>
                      <h2>
                        A little challenge.
                        <br />A lot of possibility.
                      </h2>
                      <p>
                        Short quizzes. Satisfying puzzles. A number garden to grow.
                        <br />
                        Pick your kind of playful.
                      </p>
                      <button className="button primary" onClick={() => setModal('game')}>
                        Enter the number garden
                        <ArrowRight />
                      </button>
                    </div>
                    <div className="challenge-illustration">
                      <span className="game-bubble bubble-purple">2</span>
                      <span className="game-bubble bubble-green">4</span>
                      <span className="game-bubble bubble-peach">8</span>
                      <span className="game-bubble bubble-yellow">16</span>
                      <Sparkle size={27} weight="fill" />
                    </div>
                  </section>
                  <div className="section-heading">
                    <h2>A quick quiz, a little confidence</h2>
                    <span className="small-muted">5 questions · up to 50 XP</span>
                  </div>
                  <div className="quiz-subject-grid">
                    {subjects.map((s) => {
                      const Icon = subjectIcons[s.id];
                      return (
                        <button
                          className={`quiz-subject-card ${s.color}`}
                          key={s.id}
                          onClick={() => openQuiz(s.id)}
                        >
                          <Icon size={29} weight="duotone" />
                          <h3>{s.name}</h3>
                          <p>{s.caption}</p>
                          <span>
                            Give it a go
                            <ArrowRight />
                          </span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="section-heading puzzle-heading">
                    <h2>Put your ideas into place</h2>
                    <span className="small-muted">Drag. Drop. Discover.</span>
                  </div>
                  <div className="puzzle-card-grid">
                    {[
                      {
                        title: 'Balance the equation',
                        detail: 'A little algebra, one step at a time.',
                        tex: '2x+6=18',
                        color: 'lilac',
                      },
                      {
                        title: 'Think like a programmer',
                        detail: 'Build an algorithm in three moves.',
                        tex: 'f(x)=2x',
                        color: 'blue',
                      },
                      {
                        title: 'Build a carbon atom',
                        detail: 'Meet the pieces that make up matter.',
                        tex: '{}^{12}_{6}\\mathrm{C}',
                        color: 'peach',
                      },
                    ].map((p, i) => (
                      <button
                        key={p.title}
                        className="challenge-puzzle"
                        onClick={() => openPuzzle(i)}
                      >
                        <div className={p.color}>
                          <MathText tex={p.tex} />
                        </div>
                        <h3>{p.title}</h3>
                        <p>{p.detail}</p>
                        <span>
                          <Sparkle weight="fill" />
                          +35 XP
                          <ArrowUpRight />
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
              {page === 'progress' && (
                <div className="progress-page">
                  {sample && (
                    <div className="sample-notice">
                      <Sparkle size={20} />
                      <span>
                        A peek at what’s possible. This is a sample journey—make it yours to start
                        tracking.
                      </span>
                      <button onClick={() => setModal('onboarding')}>
                        Make it yours
                        <ArrowRight />
                      </button>
                    </div>
                  )}
                  <div className="progress-stats-grid">
                    {[
                      {
                        label: 'Curiosity collected',
                        value: xp.toLocaleString(),
                        unit: 'XP',
                        Icon: Lightning,
                        color: 'lilac',
                      },
                      {
                        label: 'A little momentum',
                        value: String(streak),
                        unit: 'day streak',
                        Icon: Fire,
                        color: 'peach',
                      },
                      {
                        label: 'Ideas that clicked',
                        value: String(sample ? 12 : completedLessons),
                        unit: 'lessons',
                        Icon: BookOpen,
                        color: 'mint',
                      },
                      {
                        label: 'Quiz confidence',
                        value: String(accuracy),
                        unit: '% accuracy',
                        Icon: Target,
                        color: 'blue',
                      },
                    ].map((s) => (
                      <div className="progress-stat" key={s.label}>
                        <span className={`stat-icon ${s.color}`}>
                          <s.Icon size={25} weight="fill" />
                        </span>
                        <p>{s.label}</p>
                        <strong>
                          {s.value}
                          <small>{s.unit}</small>
                        </strong>
                      </div>
                    ))}
                  </div>
                  <div className="progress-main-grid">
                    <section className="learning-chart">
                      <div className="section-heading">
                        <div>
                          <h3>Your week in little leaps</h3>
                          <p className="muted">A rhythm that works for you.</p>
                        </div>
                        <span className="tag lilac">THIS WEEK</span>
                      </div>
                      <div className="chart-bars">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => {
                          const amount = sample
                            ? [40, 65, 45, 90, 60, 0, 0][i]
                            : weekDates.some((date) => (new Date(date).getUTCDay() + 6) % 7 === i)
                              ? 85
                              : 0;
                          return (
                            <div className="chart-column" key={d}>
                              <div className="chart-bar-bg">
                                <motion.span
                                  initial={{ height: 0 }}
                                  animate={{ height: `${amount}%` }}
                                  transition={{ duration: reduced ? 0 : 0.6, delay: i * 0.04 }}
                                >
                                  <span>
                                    {amount ? (sample ? Math.round(amount * 0.4) : 'Done') : ''}
                                  </span>
                                </motion.span>
                              </div>
                              <small>{d}</small>
                            </div>
                          );
                        })}
                      </div>
                      <div className="chart-caption">
                        <span className="subject-dot lilac" />{' '}
                        {sample ? 'Example learning minutes' : 'Days with a completed activity'}
                      </div>
                    </section>
                    <section className="journey-level">
                      <div className="level-flower">
                        <Sparkle size={68} weight="fill" />
                      </div>
                      <span className="eyebrow">YOUR CURIOUS CHAPTER</span>
                      <h3>
                        {xp >= 1000
                          ? 'The idea explorer'
                          : xp >= 250
                            ? 'The possibility finder'
                            : 'The spark starter'}
                      </h3>
                      <p>
                        {xp >= 1000
                          ? 'Big questions. Fresh perspectives. Keep following that spark.'
                          : 'Every little discovery helps your curiosity grow.'}
                      </p>
                      <div className="progress-track">
                        <div style={{ width: `${(xp % 500) / 5}%` }} />
                      </div>
                      <div className="level-progress">
                        <span>Level {Math.floor(xp / 500) + 1}</span>
                        <span>{500 - (xp % 500)} XP to your next chapter</span>
                      </div>
                    </section>
                  </div>
                  <div className="section-heading">
                    <h2>Little wins worth keeping</h2>
                    <span className="small-muted">Your growing collection</span>
                  </div>
                  <div className="achievement-grid">
                    {[
                      {
                        title: 'First little spark',
                        detail: 'Complete your first lesson',
                        Icon: Lightbulb,
                        unlocked: sample || completedLessons > 0,
                        color: 'lilac',
                      },
                      {
                        title: 'Puzzle person',
                        detail: 'Solve a drag-and-drop puzzle',
                        Icon: PuzzlePiece,
                        unlocked:
                          sample || progress.completed.some((id) => id.startsWith('puzzle')),
                        color: 'mint',
                      },
                      {
                        title: 'A perfect little moment',
                        detail: 'Score 100% on a quiz',
                        Icon: Target,
                        unlocked:
                          sample ||
                          Object.entries(progress.scores).some(
                            ([id, n]) => id.startsWith('quiz') && n === 100,
                          ),
                        color: 'peach',
                      },
                      {
                        title: 'A week of wonder',
                        detail: 'Learn for 7 days in a row',
                        Icon: Fire,
                        unlocked: streak >= 7,
                        color: 'blue',
                      },
                    ].map((a) => (
                      <div
                        className={`achievement ${a.unlocked ? 'unlocked' : 'locked'}`}
                        key={a.title}
                      >
                        <span className={`achievement-art ${a.color}`}>
                          <a.Icon size={35} weight="duotone" />
                        </span>
                        <h3>{a.title}</h3>
                        <p>{a.detail}</p>
                        <span>
                          {a.unlocked ? (
                            <>
                              <CheckCircle weight="fill" />
                              Collected
                            </>
                          ) : (
                            <>A little goal to grow into</>
                          )}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
        <nav className="mobile-dock" aria-label="App navigation">
          {navItems.map(({ id, label, Icon }) => (
            <button
              className={page === id ? 'active' : ''}
              key={id}
              onClick={() => navigate(id)}
              aria-current={page === id ? 'page' : undefined}
            >
              <Icon weight={page === id ? 'fill' : 'regular'} size={23} />
              <span>{id === 'labs' ? 'Playground' : id === 'progress' ? 'Progress' : label}</span>
            </button>
          ))}
        </nav>
      </div>
      <AnimatePresence>
        {modal && (
          <Dialog
            title={
              modal === 'lesson'
                ? 'A little discovery'
                : modal === 'quiz'
                  ? 'Let’s make it click'
                  : modal === 'puzzle'
                    ? 'A little brain teaser'
                    : modal === 'game'
                      ? 'Your number garden'
                      : modal === 'onboarding'
                        ? 'Welcome to Lumni'
                        : modal === 'design'
                          ? 'Two kinds of curious'
                          : modal === 'sources'
                            ? 'Rooted in real learning'
                            : modal === 'notifications'
                              ? 'Your little updates'
                              : 'Make yourself at home'
            }
            onClose={close}
            wide={modal === 'lesson' || modal === 'design' || modal === 'game'}
          >
            {modal === 'onboarding' && (
              <Onboarding
                profile={profile}
                onFinish={(p) => {
                  if (!profile.onboarded) setProgress(emptyProgress);
                  setProfile(p);
                  setPage('today');
                  close();
                  feel('celebrate');
                  setToast(`Your next chapter starts here, ${p.name}. Let’s get curious.`);
                }}
              />
            )}
            {modal === 'lesson' && (
              <LessonView
                key={lesson.id}
                lesson={lesson}
                completed={progress.completed.includes(lesson.id)}
                onComplete={() => {
                  complete(lesson.id, 25);
                  feel('celebrate');
                }}
                onQuiz={() => openQuiz(lesson.subject)}
                onFeedback={() => feel('tap')}
                onShare={() =>
                  void shareLink(lesson.title, `/lesson/${lesson.id}`).then((message) => {
                    if (message) setToast(message);
                  })
                }
              />
            )}
            {modal === 'quiz' && (
              <Quiz
                key={quizSubject}
                subject={quizSubject}
                onFeedback={feel}
                onComplete={complete}
                onClose={close}
              />
            )}
            {modal === 'puzzle' && (
              <Puzzle
                key={puzzleIndex}
                puzzleIndex={puzzleIndex}
                onFeedback={feel}
                onComplete={complete}
                onClose={close}
              />
            )}
            {modal === 'game' && (
              <PatternGame onFeedback={feel} onComplete={complete} onClose={close} />
            )}
            {modal === 'settings' && (
              <div className="settings-content">
                <h2>The little details matter.</h2>
                <p className="muted">Make Lumni feel a little more like you.</p>
                <p>
                  <a href="/about/">About Lumni, sources & privacy</a>
                </p>
                <div className="settings-group">
                  <div className="setting-row">
                    <span className="setting-icon lilac">
                      {theme === 'light' ? <Sun /> : <Moon />}
                    </span>
                    <span>
                      <strong>A different kind of light</strong>
                      <small>Follow your device or choose your own</small>
                    </span>
                    <select
                      className="theme-select"
                      aria-label="App appearance"
                      value={preference}
                      onChange={(event) =>
                        setTheme(event.target.value as 'system' | 'light' | 'dark')
                      }
                    >
                      <option value="system">System</option>
                      <option value="light">Light</option>
                      <option value="dark">Dark</option>
                    </select>
                  </div>
                  <div className="setting-row">
                    <span className="setting-icon peach">
                      {sound ? <SpeakerHigh /> : <SpeakerSlash />}
                    </span>
                    <span>
                      <strong>A little sound of success</strong>
                      <small>Soft tones for taps and little wins</small>
                    </span>
                    <button
                      className="toggle"
                      role="switch"
                      aria-checked={sound}
                      aria-label="Sounds"
                      onClick={() => {
                        setSound(!sound);
                        feedback('success', !sound, false);
                      }}
                    >
                      <span />
                    </button>
                  </div>
                  <div className="setting-row">
                    <span className="setting-icon mint">
                      <HandGrabbing />
                    </span>
                    <span>
                      <strong>Feel that little click</strong>
                      <small>Haptics on supported devices</small>
                    </span>
                    <button
                      className="toggle"
                      role="switch"
                      aria-checked={haptics}
                      aria-label="Haptic feedback"
                      onClick={() => {
                        setHaptics(!haptics);
                        feedback('tap', false, !haptics);
                      }}
                    >
                      <span />
                    </button>
                  </div>
                </div>
                <NativeSettings
                  pwa={pwa}
                  wake={wake}
                  onShare={() =>
                    void shareLink('Lumni — A little more curious', '/today').then((message) => {
                      if (message) setToast(message);
                    })
                  }
                />
                <div className="settings-links">
                  <button onClick={() => setModal('onboarding')}>
                    <GraduationCap />
                    Your profile & grade
                    <ArrowRight />
                  </button>
                  <button onClick={() => setModal('goal')}>
                    <Target />
                    Your daily goal
                    <ArrowRight />
                  </button>
                  <button onClick={() => setModal('design')}>
                    <Palette />
                    Explore the design directions
                    <ArrowRight />
                  </button>
                  <button onClick={() => setModal('sources')}>
                    <BookOpen />
                    Curriculum & references
                    <ArrowUpRight />
                  </button>
                </div>
                <div className="settings-footer">
                  <span className="brand-mini">
                    <Sparkle weight="fill" />
                    lumni.
                  </span>
                  <span>A little more possible. Version 1.1</span>
                </div>
              </div>
            )}
            {modal === 'goal' && (
              <div className="settings-content goal-dialog">
                <span className="goal-hero-icon">
                  <Target weight="duotone" size={48} />
                </span>
                <h2>A rhythm that feels right.</h2>
                <p className="muted">
                  Choose your daily learning goal. Aim for five learning days each week.
                </p>
                <div className="goal-choices">
                  {[5, 10, 15].map((g) => (
                    <button
                      className={`goal-choice ${profile.goal === g ? 'selected' : ''}`}
                      key={g}
                      onClick={() => {
                        setProfile((p) => ({ ...p, goal: g }));
                        feel('tap');
                      }}
                    >
                      <span>
                        <strong>{g} minutes a day</strong>
                        <small>
                          {g === 5
                            ? 'A little spark'
                            : g === 10
                              ? 'A daily dose of discovery'
                              : 'A deeper little dive'}
                        </small>
                      </span>
                      {profile.goal === g ? <CheckCircle weight="fill" /> : <Clock />}
                    </button>
                  ))}
                </div>
                <button
                  className="button primary full"
                  onClick={() => {
                    close();
                    setToast('Your goal is set. Small steps add up.');
                  }}
                >
                  That feels good
                  <Check />
                </button>
              </div>
            )}
            {modal === 'notifications' && (
              <div className="settings-content">
                <h2>A little nudge to wonder.</h2>
                <div className="notification-row">
                  <span className="setting-icon lilac">
                    <PuzzlePiece weight="fill" />
                  </span>
                  <div>
                    <strong>Your daily brain teaser is ready.</strong>
                    <p>Three pieces. One satisfying aha moment.</p>
                    <button className="text-button" onClick={() => openPuzzle(0)}>
                      Give it a go
                      <ArrowRight />
                    </button>
                  </div>
                </div>
                <div className="notification-row">
                  <span className="setting-icon mint">
                    <Cube weight="fill" />
                  </span>
                  <div>
                    <strong>A whole world to explore.</strong>
                    <p>Meet carbon-12 in the interactive 3D playground.</p>
                    <button className="text-button" onClick={() => openLesson(lessons[0])}>
                      Take a closer look
                      <ArrowRight />
                    </button>
                  </div>
                </div>
              </div>
            )}
            {modal === 'sources' && (
              <div className="settings-content">
                <span className="tag mint">
                  <Leaf />
                  SOUTH AFRICAN STEM
                </span>
                <h2>Rooted in real learning.</h2>
                <p className="muted">
                  Original mini-lessons and practice questions, informed by CAPS topic frameworks
                  and checked against open learning references. Technology activities are additional
                  STEM skills.
                </p>
                <div className="source-list">
                  {curriculumSources.map((s) => (
                    <a href={s.url} key={s.name} target="_blank" rel="noreferrer">
                      <span>
                        <strong>{s.name}</strong>
                        <small>{s.detail}</small>
                      </span>
                      <ArrowUpRight />
                    </a>
                  ))}
                </div>
                <p className="sources-note">
                  Your grade determines the lesson library. Quizzes revisit foundational concepts
                  across grades. 3D models are simplified teaching diagrams. Sample progress is
                  identified in My progress; your completed activities save on this device.
                </p>
              </div>
            )}
            {modal === 'design' && (
              <div className="design-content">
                <span className="eyebrow">ONE APP. TWO DIRECTIONS.</span>
                <h2>Pick your kind of possibility.</h2>
                <p className="muted">
                  Both feel like Lumni. Each follows a different little spark.
                </p>
                <div className="design-options">
                  <button
                    className={`design-option ${!designB ? 'selected' : ''}`}
                    onClick={() => {
                      setDesignB(false);
                      feel('tap');
                    }}
                  >
                    <div className="design-sample sample-a">
                      <div>
                        <Sparkle weight="fill" />
                        lumni.
                      </div>
                      <h3>
                        A little more
                        <br />
                        <em>curious.</em>
                      </h3>
                      <div className="sample-tiles">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className="design-option-label">
                      <span>
                        <strong>A · Playground</strong>
                        <small>Warm, playful and quietly delightful.</small>
                      </span>
                      {!designB && <CheckCircle weight="fill" />}
                    </div>
                  </button>
                  <button
                    className={`design-option ${designB ? 'selected' : ''}`}
                    onClick={() => {
                      setDesignB(true);
                      feel('tap');
                    }}
                  >
                    <div className="design-sample sample-b">
                      <div>
                        <Cube weight="fill" />
                        lumni atlas.
                      </div>
                      <h3>
                        Your next
                        <br />
                        <em>discovery.</em>
                      </h3>
                      <div className="sample-tiles">
                        <span />
                        <span />
                        <span />
                      </div>
                    </div>
                    <div className="design-option-label">
                      <span>
                        <strong>B · Atlas</strong>
                        <small>Cool, focused and a little more editorial.</small>
                      </span>
                      {designB && <CheckCircle weight="fill" />}
                    </div>
                  </button>
                </div>
                <p className="design-caption">
                  Option A is the full redesign. Option B previews an alternative colour and
                  typography direction. Inspired by the clarity of Brilliant and iOS, with a
                  character all its own.
                </p>
                <button
                  className="button primary"
                  onClick={() => {
                    close();
                    setToast(
                      designB
                        ? 'Exploring the Atlas visual direction.'
                        : 'Playground it is. Let’s stay curious.',
                    );
                  }}
                >
                  Explore {designB ? 'Atlas' : 'Playground'}
                  <ArrowRight />
                </button>
              </div>
            )}
          </Dialog>
        )}
      </AnimatePresence>
      <Delight trigger={confetti} />
      <AnimatePresence>
        {toast && (
          <motion.div
            className="toast"
            role="status"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            <Sparkle size={20} weight="fill" />
            {toast}
            <button onClick={() => setToast('')} aria-label="Dismiss message">
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
function calculateStreak(dates: string[]) {
  if (!dates.length) return 0;
  const days = new Set(dates);
  const cursor = new Date();
  cursor.setUTCHours(0, 0, 0, 0);
  if (!days.has(cursor.toISOString().slice(0, 10))) cursor.setUTCDate(cursor.getUTCDate() - 1);
  let count = 0;
  while (days.has(cursor.toISOString().slice(0, 10))) {
    count++;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }
  return count;
}
