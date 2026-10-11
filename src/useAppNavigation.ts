'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { lessons, type Lesson, type Subject } from './data';
export type Page = 'today' | 'learn' | 'labs' | 'play' | 'progress';
export type Modal =
  | 'onboarding'
  | 'lesson'
  | 'quiz'
  | 'puzzle'
  | 'game'
  | 'settings'
  | 'design'
  | 'sources'
  | 'notifications'
  | 'goal'
  | null;
type Route = {
  page: Page;
  modal: Modal;
  lesson: Lesson;
  quizSubject: Subject;
  puzzleIndex: number;
};
const pages: Page[] = ['today', 'learn', 'labs', 'play', 'progress'];
const modals: Modal[] = [
  'onboarding',
  'lesson',
  'quiz',
  'puzzle',
  'game',
  'settings',
  'design',
  'sources',
  'notifications',
  'goal',
];
const initial: Route = {
  page: 'today',
  modal: null,
  lesson: lessons[0],
  quizSubject: 'maths',
  puzzleIndex: 0,
};
function hashFor(route: Route) {
  if (!route.modal) return `#/${route.page}`;
  const suffix =
    route.modal === 'lesson'
      ? `/${route.lesson.id}`
      : route.modal === 'quiz'
        ? `/${route.quizSubject}`
        : route.modal === 'puzzle'
          ? `/${route.puzzleIndex}`
          : '';
  return `#/${route.modal}${suffix}`;
}
function parseRoute(): Route {
  const [name, value] = location.hash.replace(/^#\/?/, '').split('/');
  const savedPage = history.state?.lumniPage;
  const page: Page = pages.includes(savedPage)
    ? savedPage
    : name === 'lesson' || name === 'quiz'
      ? 'learn'
      : name === 'puzzle' || name === 'game'
        ? 'play'
        : 'today';
  if (pages.includes(name as Page)) return { ...initial, page: name as Page };
  if (!modals.includes(name as Modal)) return initial;
  const lesson = lessons.find((item) => item.id === value);
  if (name === 'lesson' && !lesson) return initial;
  return {
    ...initial,
    page,
    modal: name as Modal,
    lesson: lesson || initial.lesson,
    quizSubject: ['maths', 'physics', 'biology', 'technology'].includes(value)
      ? (value as Subject)
      : 'maths',
    puzzleIndex: value === '1' ? 1 : value === '2' ? 2 : 0,
  };
}
export function useAppNavigation() {
  const [route, setRoute] = useState(initial);
  const current = useRef(initial);
  const commit = useCallback((next: Route, replace: boolean, overlay: boolean) => {
    current.current = next;
    setRoute(next);
    const url = new URL(location.href);
    url.hash = hashFor(next);
    history[replace ? 'replaceState' : 'pushState'](
      { ...history.state, lumniPage: next.page, lumniOverlay: overlay },
      '',
      url,
    );
  }, []);
  useEffect(() => {
    const restore = () => {
      const next = parseRoute();
      current.current = next;
      setRoute(next);
    };
    restore();
    // Normalise direct links without adding an extra Back entry.
    history.replaceState(
      { ...history.state, lumniPage: current.current.page, lumniOverlay: false },
      '',
      hashFor(current.current),
    );
    window.addEventListener('popstate', restore);
    window.addEventListener('hashchange', restore);
    return () => {
      window.removeEventListener('popstate', restore);
      window.removeEventListener('hashchange', restore);
    };
  }, []);
  useEffect(() => {
    const label =
      route.modal === 'lesson'
        ? route.lesson.title
        : route.modal === 'quiz'
          ? 'Quick quiz'
          : route.modal === 'puzzle'
            ? 'Daily puzzle'
            : route.modal === 'game'
              ? 'Number garden'
              : route.modal === 'settings'
                ? 'Settings'
                : {
                    today: 'Today',
                    learn: 'Learn',
                    labs: '3D playground',
                    play: 'Challenges',
                    progress: 'My progress',
                  }[route.page];
    document.title = `${label} · Lumni`;
  }, [route]);
  const setPage = useCallback(
    (page: Page) => {
      const old = current.current;
      if (old.page === page && !old.modal) return;
      commit({ ...old, page, modal: null }, !!old.modal, false);
    },
    [commit],
  );
  const close = useCallback(() => {
    const old = current.current;
    if (!old.modal) return;
    if (history.state?.lumniOverlay) history.back();
    else commit({ ...old, modal: null }, true, false);
  }, [commit]);
  const setModal = useCallback(
    (modal: Modal) => {
      if (!modal) {
        close();
        return;
      }
      const old = current.current;
      if (old.modal === modal && location.hash === hashFor(old)) return;
      commit({ ...old, modal }, !!old.modal, old.modal ? !!history.state?.lumniOverlay : true);
    },
    [commit, close],
  );
  const stage = useCallback((patch: Partial<Route>) => {
    const next = { ...current.current, ...patch };
    current.current = next;
    setRoute(next);
  }, []);
  return {
    ...route,
    setPage,
    setModal,
    close,
    setLesson: (lesson: Lesson) => stage({ lesson }),
    setQuizSubject: (quizSubject: Subject) => stage({ quizSubject }),
    setPuzzleIndex: (puzzleIndex: number) => stage({ puzzleIndex }),
  };
}
