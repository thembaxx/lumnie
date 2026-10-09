export type Subject = 'maths' | 'physics' | 'biology' | 'technology';
export type SceneKind = 'atom' | 'molecule' | 'wave' | 'geometry' | 'forces' | 'circuit';
export const subjects: {
  id: Subject;
  name: string;
  short: string;
  color: string;
  caption: string;
  lessons: number;
}[] = [
  {
    id: 'maths',
    name: 'Mathematics',
    short: 'Maths',
    color: 'lilac',
    caption: 'Find beauty in the patterns.',
    lessons: 6,
  },
  {
    id: 'physics',
    name: 'Physical Sciences',
    short: 'Science',
    color: 'peach',
    caption: 'Make sense of your universe.',
    lessons: 6,
  },
  {
    id: 'biology',
    name: 'Life Sciences',
    short: 'Life science',
    color: 'mint',
    caption: 'A closer look at living things.',
    lessons: 3,
  },
  {
    id: 'technology',
    name: 'Technology',
    short: 'Technology',
    color: 'blue',
    caption: 'Turn a little logic into magic.',
    lessons: 3,
  },
];
export type Lesson = {
  id: string;
  subject: Subject;
  title: string;
  description: string;
  grade: number;
  minutes: number;
  kind: SceneKind;
  tag: string;
  formula: string;
  facts: string[];
  source: string;
};
export const lessons: Lesson[] = [
  {
    id: 'atom',
    subject: 'physics',
    title: 'A whole world inside an atom',
    description: 'Meet the tiny building blocks of everything around you.',
    grade: 10,
    minutes: 8,
    kind: 'atom',
    tag: 'Atomic structure',
    formula: 'A = Z + N',
    facts: [
      'The atomic number Z is the number of protons. Carbon has 6 protons, so Z = 6.',
      'A neutral carbon atom also has 6 electrons. Carbon-12 has 6 neutrons: 12 − 6 = 6.',
      'Electrons occupy energy levels. This stylised model helps us visualise the particles; the rings are not literal electron paths.',
    ],
    source: 'https://www.siyavula.com/read/za/physical-sciences/grade-10/the-atom/04-the-atom-04',
  },
  {
    id: 'trig',
    subject: 'maths',
    title: 'Meet the unit circle',
    description: 'Give an angle a spin. See sine and cosine come to life.',
    grade: 10,
    minutes: 6,
    kind: 'geometry',
    tag: 'Trigonometry',
    formula: '\\sin^2\\theta + \\cos^2\\theta = 1',
    facts: [
      'A unit circle has radius 1 and is centred at the origin.',
      'A point at angle θ has coordinates (cos θ, sin θ). The horizontal coordinate is cosine; the vertical coordinate is sine.',
      'At 30°, sin θ = 1/2. At 90°, sin θ = 1. Move the angle slider to see the pattern.',
    ],
    source: 'https://www.siyavula.com/read/za/mathematics/grade-10/trigonometry-part-1',
  },
  {
    id: 'algebra',
    subject: 'maths',
    title: 'Balance the equation',
    description: 'Solve for the mystery number, one satisfying step at a time.',
    grade: 10,
    minutes: 5,
    kind: 'geometry',
    tag: 'Algebra',
    formula: '2x+6=18 \\quad \\Rightarrow \\quad x=6',
    facts: [
      'An equation is balanced: its left and right sides have equal value.',
      'Subtract 6 from both sides of 2x + 6 = 18 to get 2x = 12.',
      'Divide both sides by 2. We get x = 6. Substitute it back to check your answer.',
    ],
    source: 'https://www.siyavula.com/read/za/mathematics/grade-10/equations-and-inequalities',
  },
  {
    id: 'water',
    subject: 'physics',
    title: 'Why water is a little weird',
    description: 'Build a molecule that makes life possible.',
    grade: 10,
    minutes: 7,
    kind: 'molecule',
    tag: 'Chemical bonding',
    formula: '\\mathrm{H_2O}',
    facts: [
      'A water molecule contains two hydrogen atoms and one oxygen atom.',
      'Oxygen shares electrons with each hydrogen atom in covalent bonds.',
      'Water has a bent shape with a bond angle of approximately 104.5°. The ball-and-stick model exaggerates distances to show the bonds.',
    ],
    source: 'https://www.siyavula.com/read/za/physical-sciences/grade-10/chemical-bonding',
  },
  {
    id: 'cells',
    subject: 'biology',
    title: 'The city inside a cell',
    description: 'Discover the little structures keeping life in motion.',
    grade: 10,
    minutes: 6,
    kind: 'molecule',
    tag: 'Cell structure',
    formula: '\\text{cell} \\rightarrow \\text{tissue} \\rightarrow \\text{organ}',
    facts: [
      'The cell is the basic structural and functional unit of living organisms.',
      'The nucleus contains genetic material, while mitochondria release energy during cellular respiration.',
      'Plant cells have a cell wall and chloroplasts. Animal cells do not. The 3D water molecule here shows one molecule present in all living cells.',
    ],
    source:
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
  {
    id: 'logic',
    subject: 'technology',
    title: 'Crack the code',
    description: 'Think like a programmer. Build an algorithm that works.',
    grade: 10,
    minutes: 5,
    kind: 'geometry',
    tag: 'STEM skill · Algorithms',
    formula: '\\text{input} \\rightarrow \\text{process} \\rightarrow \\text{output}',
    facts: [
      'An algorithm is a finite sequence of clear instructions for solving a problem.',
      'Sequence, selection and repetition are useful building blocks for algorithms.',
      'To double a number: read the input, multiply it by 2, and display the result. Test with 4: the output is 8.',
    ],
    source:
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
  {
    id: 'quadratic',
    subject: 'maths',
    title: 'The shape of a parabola',
    description: 'Turn a number into a curve and uncover its turning point.',
    grade: 11,
    minutes: 7,
    kind: 'geometry',
    tag: 'Functions',
    formula: 'y=a(x-p)^2+q',
    facts: [
      'The graph y = a(x − p)² + q has a turning point at (p, q).',
      'When a is positive the parabola opens upward. When a is negative it opens downward.',
      'For y = (x − 2)² + 3, the turning point is (2, 3) and the axis of symmetry is x = 2.',
    ],
    source: 'https://www.siyavula.com/read/za/mathematics/grade-11',
  },
  {
    id: 'probability',
    subject: 'maths',
    title: 'What are the chances?',
    description: 'Play with outcomes and make uncertainty a little clearer.',
    grade: 11,
    minutes: 6,
    kind: 'geometry',
    tag: 'Probability',
    formula: 'P(A)=\\frac{n(A)}{n(S)}',
    facts: [
      'For equally likely outcomes, probability is favourable outcomes divided by all possible outcomes.',
      'A fair six-sided die has three even numbers, so the probability of an even result is 3/6 = 1/2.',
      'Probabilities range from 0 (impossible) to 1 (certain).',
    ],
    source: 'https://www.siyavula.com/read/za/mathematics/grade-11',
  },
  {
    id: 'forces',
    subject: 'physics',
    title: 'A push in the right direction',
    description: 'Explore why things speed up, slow down and change direction.',
    grade: 11,
    minutes: 8,
    kind: 'forces',
    tag: 'Newton’s laws',
    formula: 'F_{\\mathrm{net}}=ma',
    facts: [
      'Newton’s second law relates net force, mass and acceleration.',
      'A net force of 10 N on a 2 kg object gives an acceleration of 5 m·s⁻². Adjust the force to see the relationship; this diagram shows forces, not a motion simulation.',
      'On a level surface with no vertical acceleration, the upward normal force balances the downward weight. We ignore friction in this model.',
    ],
    source: 'https://www.siyavula.com/read/za/physical-sciences/grade-11',
  },
  {
    id: 'moles',
    subject: 'physics',
    title: 'Count the uncountable',
    description: 'Meet the mole: a chemist’s favourite counting trick.',
    grade: 11,
    minutes: 7,
    kind: 'molecule',
    tag: 'Stoichiometry',
    formula: 'n=\\frac{m}{M}',
    facts: [
      'The mole is the SI unit of amount of substance. One mole contains exactly 6.02214076 × 10²³ specified entities.',
      'Calculate amount n by dividing mass m in grams by molar mass M in grams per mole.',
      'Using M(H₂O) ≈ 18 g·mol⁻¹, 36 g of water contains approximately 2 mol of water molecules.',
    ],
    source: 'https://www.siyavula.com/read/za/physical-sciences/grade-11',
  },
  {
    id: 'photosynthesis',
    subject: 'biology',
    title: 'A little sunshine, a lot of life',
    description: 'Follow light as plants turn it into chemical energy.',
    grade: 11,
    minutes: 6,
    kind: 'molecule',
    tag: 'Photosynthesis',
    formula:
      '6\\mathrm{CO_2}+6\\mathrm{H_2O} \\xrightarrow{\\text{light}} \\mathrm{C_6H_{12}O_6}+6\\mathrm{O_2}',
    facts: [
      'Photosynthesis converts light energy into chemical energy stored in glucose.',
      'Chlorophyll absorbs light in chloroplasts. Carbon dioxide and water are reactants.',
      'Oxygen is released as a by-product. The displayed molecule is water, one of the reactants.',
    ],
    source:
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
  {
    id: 'binary',
    subject: 'technology',
    title: 'Two digits. Infinite ideas.',
    description: 'Translate the language computers understand.',
    grade: 11,
    minutes: 5,
    kind: 'geometry',
    tag: 'STEM skill · Binary',
    formula: '(1010)_2=(10)_{10}',
    facts: [
      'Binary uses only two digits: 0 and 1.',
      'Place values from the right are 1, 2, 4, 8 and so on.',
      '1010₂ = 1×8 + 0×4 + 1×2 + 0×1 = 10₁₀.',
    ],
    source:
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
  {
    id: 'calculus',
    subject: 'maths',
    title: 'Catch a curve in motion',
    description: 'Discover the gradient hiding at every point.',
    grade: 12,
    minutes: 8,
    kind: 'geometry',
    tag: 'Differential calculus',
    formula: '\\frac{d}{dx}x^n=nx^{n-1}',
    facts: [
      'The derivative gives the instantaneous rate of change of a function.',
      'For f(x) = x², the derivative is f′(x) = 2x.',
      'At x = 3 the tangent gradient is 6. At a stationary point the derivative equals zero.',
    ],
    source: 'https://www.siyavula.com/read/za/mathematics/grade-12',
  },
  {
    id: 'sequences',
    subject: 'maths',
    title: 'Find the next little leap',
    description: 'Discover the rules behind geometric sequences.',
    grade: 12,
    minutes: 6,
    kind: 'geometry',
    tag: 'Patterns and sequences',
    formula: 'T_n=ar^{n-1}',
    facts: [
      'In a geometric sequence, each term is multiplied by the same ratio r.',
      'For 3, 6, 12, 24, the first term a is 3 and the common ratio r is 2.',
      'The fifth term is 3×2⁴ = 48.',
    ],
    source: 'https://www.siyavula.com/read/za/mathematics/grade-12',
  },
  {
    id: 'electricity',
    subject: 'physics',
    title: 'Get into the current',
    description: 'Connect voltage, current and resistance.',
    grade: 12,
    minutes: 7,
    kind: 'circuit',
    tag: 'Electric circuits',
    formula: 'V=IR',
    facts: [
      'Ohm’s law relates potential difference V, current I and resistance R for an ohmic conductor at constant temperature.',
      'In this model the resistance is fixed at 6 Ω. A 6 V supply produces a current of 1 A. Increase the voltage to increase the current.',
      'The glowing indicator illustrates current; it is not an extra circuit component. Real filament bulbs are non-ohmic because their resistance changes with temperature.',
    ],
    source: 'https://www.siyavula.com/read/za/physical-sciences/grade-12',
  },
  {
    id: 'waves',
    subject: 'physics',
    title: 'A wave of possibility',
    description: 'See wavelength and frequency working together.',
    grade: 12,
    minutes: 6,
    kind: 'wave',
    tag: 'Wave foundations · Revision',
    formula: 'v=f\\lambda',
    facts: [
      'Wave speed equals frequency multiplied by wavelength.',
      'If frequency is 5 Hz and wavelength is 2 m, the wave speed is 10 m·s⁻¹.',
      'At constant wave speed, increasing the frequency decreases the wavelength. Our animation is slowed to 15% of real time to make the wave easy to see.',
    ],
    source: 'https://www.siyavula.com/read/za/physical-sciences/grade-10/transverse-waves',
  },
  {
    id: 'genetics',
    subject: 'biology',
    title: 'The story in your DNA',
    description: 'Explore the code that connects generations.',
    grade: 12,
    minutes: 7,
    kind: 'molecule',
    tag: 'Genetics',
    formula: '\\mathrm{A}\\leftrightarrow\\mathrm{T}\\qquad\\mathrm{C}\\leftrightarrow\\mathrm{G}',
    facts: [
      'DNA stores genetic information in the sequence of its bases.',
      'In double-stranded DNA, adenine pairs with thymine and cytosine pairs with guanine.',
      'Genes are sections of DNA that influence inherited characteristics. The molecule model here demonstrates covalent bonds generally, not DNA structure.',
    ],
    source:
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
  {
    id: 'search',
    subject: 'technology',
    title: 'Find it faster',
    description: 'Learn how binary search cuts a problem in half.',
    grade: 12,
    minutes: 6,
    kind: 'geometry',
    tag: 'STEM skill · Search algorithms',
    formula: 'O(\\log_2 n)',
    facts: [
      'Binary search finds a value in a sorted list by checking the middle item.',
      'At each step, discard the half that cannot contain the target.',
      'A list with 16 items needs at most 5 middle-item checks in a standard binary-search implementation. The order of growth is logarithmic.',
    ],
    source:
      'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
];
export type Question = {
  prompt: string;
  equation?: string;
  answers: string[];
  correct: number;
  explanation: string;
};
export const quizBank: Record<Subject, Question[]> = {
  maths: [
    {
      prompt: 'Warm-up! Find the missing value.',
      equation: '2x+6=18',
      answers: ['x = 4', 'x = 6', 'x = 9', 'x = 12'],
      correct: 1,
      explanation: 'Subtract 6 from both sides: 2x = 12. Divide by 2 to find x = 6.',
    },
    {
      prompt: 'On the unit circle, what is sin 30°?',
      equation: '\\sin 30^\\circ = \\;?',
      answers: ['0', '\\frac{1}{2}', '\\frac{\\sqrt{3}}{2}', '1'],
      correct: 1,
      explanation:
        'Sine is the vertical coordinate on the unit circle. At 30°, it equals one half.',
    },
    {
      prompt: 'A right triangle has short sides of 3 and 4. Find the hypotenuse.',
      equation: 'c^2 = 3^2 + 4^2',
      answers: ['5', '7', '12', '25'],
      correct: 0,
      explanation: 'Pythagoras gives c² = 9 + 16 = 25. The positive square root is 5.',
    },
    {
      prompt: 'Which sequence has a constant ratio?',
      answers: ['2, 4, 6, 8', '3, 6, 12, 24', '10, 7, 4, 1', '1, 4, 9, 16'],
      correct: 1,
      explanation:
        'Each term in 3, 6, 12, 24 is multiplied by 2. That makes it a geometric sequence.',
    },
    {
      prompt: 'What is the gradient of this straight line?',
      equation: 'y=3x-2',
      answers: ['-2', '-3', '2', '3'],
      correct: 3,
      explanation: 'In y = mx + c, m is the gradient. Here m = 3.',
    },
  ],
  physics: [
    {
      prompt: 'Carbon has an atomic number of 6. How many protons does it have?',
      equation: '{}^{12}_{6}\\mathrm{C}',
      answers: ['3', '6', '12', '18'],
      correct: 1,
      explanation: 'The atomic number is the number of protons, so carbon has 6 protons.',
    },
    {
      prompt: 'How many neutrons are in a carbon-12 atom?',
      equation: 'N=A-Z',
      answers: ['0', '6', '12', '18'],
      correct: 1,
      explanation: 'Neutrons = mass number − atomic number = 12 − 6 = 6.',
    },
    {
      prompt: 'What kind of bond joins oxygen and hydrogen within a water molecule?',
      answers: ['Ionic', 'Metallic', 'Covalent', 'Gravitational'],
      correct: 2,
      explanation: 'Oxygen and hydrogen share electron pairs, creating covalent bonds.',
    },
    {
      prompt: 'A wave has a frequency of 5 Hz and wavelength of 2 m. What is its speed?',
      equation: 'v=f\\lambda',
      answers: [
        '2.5\\,\\mathrm{m/s}',
        '5\\,\\mathrm{m/s}',
        '7\\,\\mathrm{m/s}',
        '10\\,\\mathrm{m/s}',
      ],
      correct: 3,
      explanation: 'Multiply frequency by wavelength: 5 × 2 = 10 m·s⁻¹.',
    },
    {
      prompt: 'A 6 V supply is connected across a 3 Ω resistor. Find the current.',
      equation: 'I=\\frac{V}{R}',
      answers: ['0.5\\,\\mathrm{A}', '2\\,\\mathrm{A}', '9\\,\\mathrm{A}', '18\\,\\mathrm{A}'],
      correct: 1,
      explanation: 'Current = voltage / resistance = 6 / 3 = 2 A.',
    },
  ],
  biology: [
    {
      prompt: 'Which structure contains most of the genetic material in a eukaryotic cell?',
      answers: ['Cell membrane', 'Cytoplasm', 'Nucleus', 'Cell wall'],
      correct: 2,
      explanation: 'The nucleus holds most of a eukaryotic cell’s DNA, organised into chromosomes.',
    },
    {
      prompt: 'Which structure is found in plant cells but not animal cells?',
      answers: ['Mitochondrion', 'Chloroplast', 'Cell membrane', 'Nucleus'],
      correct: 1,
      explanation: 'Chloroplasts absorb light for photosynthesis. Animal cells do not have them.',
    },
    {
      prompt: 'Which gas do plants take in for photosynthesis?',
      answers: ['Oxygen', 'Nitrogen', 'Carbon dioxide', 'Hydrogen'],
      correct: 2,
      explanation:
        'Plants use carbon dioxide and water, with light energy, to form glucose and oxygen.',
    },
    {
      prompt: 'In DNA, which base pairs with adenine?',
      answers: ['Cytosine', 'Guanine', 'Thymine', 'Adenine'],
      correct: 2,
      explanation: 'DNA base pairing follows A–T and C–G: adenine pairs with thymine.',
    },
    {
      prompt: 'What is the basic structural and functional unit of life?',
      answers: ['An atom', 'A cell', 'An organ', 'A tissue'],
      correct: 1,
      explanation:
        'Cells are the basic units of living organisms. Tissues and organs are made of cells.',
    },
  ],
  technology: [
    {
      prompt: 'What is an algorithm?',
      answers: [
        'A computer screen',
        'A clear sequence of instructions',
        'A random number',
        'An internet connection',
      ],
      correct: 1,
      explanation:
        'An algorithm is a finite, ordered set of clear instructions that solves a problem.',
    },
    {
      prompt: 'What is binary 1010 in decimal?',
      equation: '(1010)_2 = \\;?',
      answers: ['2', '5', '10', '12'],
      correct: 2,
      explanation: 'The binary place values are 8, 4, 2, 1. So 1×8 + 0×4 + 1×2 + 0×1 = 10.',
    },
    {
      prompt: 'Which structure repeats a block of instructions?',
      answers: ['A loop', 'A comment', 'A variable name', 'A string'],
      correct: 0,
      explanation:
        'Loops repeat instructions, either a set number of times or while a condition is true.',
    },
    {
      prompt: 'What must be true before you use binary search?',
      answers: [
        'Every value is equal',
        'The list is sorted',
        'The list has 100 items',
        'The list contains text',
      ],
      correct: 1,
      explanation:
        'Binary search requires a sorted list so it can safely eliminate half of the remaining values.',
    },
    {
      prompt:
        'An algorithm multiplies its input by 2 and adds 3. What is the output for an input of 4?',
      equation: 'y=2x+3',
      answers: ['7', '8', '11', '14'],
      correct: 2,
      explanation: 'Multiply 4 by 2 to get 8, then add 3: the output is 11.',
    },
  ],
};
export const curriculumSources = [
  {
    name: 'South African CAPS curriculum',
    detail: 'Department of Basic Education · subject and grade frameworks',
    url: 'https://www.education.gov.za/Curriculum/CurriculumAssessmentPolicyStatements(CAPS).aspx',
  },
  {
    name: 'Siyavula Mathematics',
    detail: 'Grades 10–12 · verified topic references',
    url: 'https://www.siyavula.com/read/za/mathematics/grade-10',
  },
  {
    name: 'Siyavula Physical Sciences',
    detail: 'Grades 10–12 · verified topic references',
    url: 'https://www.siyavula.com/read/za/physical-sciences/grade-10',
  },
];
