export const brand = {
  name: 'Lumni',
  tagline: 'A little more curious.',
  title: 'Lumni — Interactive STEM learning for Grades 10–12',
  description:
    'Explore STEM for South African Grades 10–12 with Lumni: interactive 3D models, maths and science mini-lessons, quizzes, puzzles and offline learning.',
  language: 'en-ZA',
  locale: 'en_ZA',
  category: 'EducationalApplication',
  features: [
    'Original mini-lessons for Mathematics, Physical Sciences, Life Sciences and Technology',
    'Interactive atom, molecule, unit-circle, wave, force and circuit models',
    'Worked quiz explanations, accessible puzzles and a number garden',
    'Grade filtering, daily goals and browser-local learning progress',
    'Installable app with downloadable offline lessons and activities',
  ],
  limits: [
    'Lessons reference CAPS topic frameworks and Siyavula; Lumni is independent and does not claim DBE endorsement.',
    'Technology activities extend STEM skills. The app is not a complete syllabus or accredited assessment.',
    '3D diagrams are simplified learning models; electron rings are not literal electron paths.',
    'The opening learner journey is sample data. Completing activities or onboarding starts personal progress.',
    'Names, grade, settings and learning progress are saved on this device. There is no account or cross-device sync.',
    'Offline use requires the app’s complete download to finish first.',
  ],
  sources: [
    [
      'DBE CAPS curriculum',
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
    ],
    ['Siyavula open textbooks', 'https://www.siyavula.com/read'],
  ],
} as const;
