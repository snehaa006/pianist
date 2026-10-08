// Every filmed performance on the site. Fill the [bracketed] fields with real facts; never guess.
// Facts below were taken from the videos themselves (what she says on camera, what is visible on screen).
// "hint" notes are analysis only (key, metre, likely candidates). They never render on the site.

const media = slug => ({
  poster: `/media/posters/${slug}.webp`,
  sources: [
    { src: `/media/video/${slug}.mp4`, type: 'video/mp4' },
    { src: `/media/video/${slug}.webm`, type: 'video/webm' }
  ]
});

export const performances = [
  {
    id: 'austrian-master-classes',
    short: 'Austrian Master Classes',
    tags: ['stage'],
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    // The roll-up banner on stage reads "austrian master classes · in concert" (amc).
    occasion: 'Austrian Master Classes concert',
    venue: '[Hall]',
    year: '[Year]',
    duration: '1:37',
    durationIso: 'PT1M37S',
    alt: 'Selin Incekara at a concert grand in a stucco-panelled hall, mid-phrase, the lid raised beside her.',
    hint: 'E minor; flowing broken chords, a middle phrase in B minor. Hall looks like the Rococo Festsaal of Schloss Zell an der Pram (AMC concert venue). Confirm.',
    ...media('austrian-master-classes')
  },
  {
    id: 'on-stage',
    short: 'On stage',
    tags: ['stage'],
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    occasion: 'On stage',
    venue: '[Venue], [City]',
    year: '[Year]',
    duration: '1:16',
    durationIso: 'PT1M16S',
    alt: 'Selin Incekara alone at a grand piano on a dark stage, lit from above.',
    hint: 'D minor, fast, about 45 seconds of music. Walk-on, bow, applause.',
    ...media('on-stage')
  },
  {
    id: 'at-home-grand',
    short: 'At the grand piano',
    tags: ['home'],
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    occasion: 'At home, on the grand piano',
    venue: null,
    year: '[Year]',
    duration: '1:34',
    durationIso: 'PT1M34S',
    alt: 'Selin Incekara in profile at a grand piano beside a window, hands on the keys.',
    hint: 'G minor with long passages in E-flat major; waltz pattern in 3/4 (bass on the beat, two chords).',
    ...media('at-home-grand')
  },
  {
    id: 'song-of-twilight',
    short: 'Song of Twilight',
    tags: ['home', 'exam'],
    composer: 'Yoshinao Nakada',
    lifespan: '1923–2000',
    work: 'Song of Twilight',
    collection: 'Piano Pieces for Children',
    // Spoken on camera: "LCM recorded exam, grade 3 … Song of Twilight by Yoshinao Nakada, from performance list B."
    occasion: 'London College of Music exam, Grade 3',
    syllabus: 'List B',
    venue: 'At home',
    year: '[Year]',
    duration: '1:45',
    durationIso: 'PT1M45S',
    alt: 'Selin Incekara at a digital piano, seen over her shoulder, mid-phrase.',
    hint: 'A major. Confirmed by her spoken introduction.',
    ...media('song-of-twilight')
  },
  {
    id: 'lcm-grade-1',
    short: 'Grade 1 exam',
    tags: ['home', 'exam'],
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    // Spoken on camera: "LCM recorded exam, grade 1 … from performance list B". The title and composer
    // were not clear enough to transcribe (it sounds like "Dusk… Mood" by "Frederick B…").
    occasion: 'London College of Music exam, Grade 1',
    syllabus: 'List B',
    venue: 'At home',
    year: '[Year]',
    duration: '1:55',
    durationIso: 'PT1M55S',
    alt: 'Selin Incekara at a digital piano with the score open, eyes on the keys.',
    hint: 'C major, slow and quiet over a low C. Title heard as "Dusk… Mood", composer as "Frederick B…".',
    ...media('lcm-grade-1')
  },
  {
    id: 'dog-hungry',
    short: 'Dog Hungry',
    tags: ['home', 'exam'],
    composer: 'Sonny Chua',
    lifespan: '[Lifespan]',
    work: 'Dog Hungry',
    // Spoken on camera: "LCM recorded exam, grade 3 … from performance list C" (title heard as "Dog Hug by Sonny…").
    // "Dog Hungry" by Sonny Chua is on the LCM 2021–2024 Grade 3 List C, which matches.
    occasion: 'London College of Music exam, Grade 3',
    syllabus: 'List C',
    venue: 'At home',
    year: '[Year]',
    duration: '1:11',
    durationIso: 'PT1M11S',
    alt: 'Selin Incekara at a digital piano by a white wall, seen over her shoulder, both hands on the keys.',
    hint: 'C minor. Title matched against the LCM 2021–2024 Grade 3 List C; confirm.',
    ...media('dog-hungry')
  },
  {
    id: 'andante',
    short: 'Andante',
    tags: ['home', 'exam'],
    composer: 'Charles Henry Wilton',
    lifespan: '[Lifespan]',
    work: 'Andante',
    // Spoken on camera: "LCM recorded exam, grade 1 … from performance list A" (heard as "Andante by … Wilton").
    // An Andante by Charles Henry Wilton is in the LCM 2021–2024 Grade 1 handbook, which matches.
    occasion: 'London College of Music exam, Grade 1',
    syllabus: 'List A',
    venue: 'At home',
    year: '[Year]',
    duration: '1:04',
    durationIso: 'PT1M4S',
    alt: 'Selin Incekara at a digital piano with the score open, playing from the music.',
    hint: 'G major. Composer matched against the LCM 2021–2024 Grade 1 handbook; confirm.',
    ...media('andante')
  },
  {
    id: 'grade-1-technical',
    short: 'Technical work',
    kind: 'technical',
    tags: ['home', 'exam'],
    composer: 'Technical work',
    lifespan: null,
    work: 'Scales, broken chords and arpeggios',
    // Spoken on camera: "LCM recorded exam, grade 1 … technical work", then each item by name
    // (C major hands together, A minor, D major broken chords, C, F and D minor arpeggios).
    occasion: 'London College of Music exam, Grade 1',
    venue: 'At home',
    year: '[Year]',
    duration: '2:17',
    durationIso: 'PT2M17S',
    alt: 'Selin Incekara at a digital piano, both hands running through a scale.',
    hint: 'Same session as the Grade 1 piece (same room and dress).',
    ...media('grade-1-technical')
  }
];

// Filters on the Watch page.
export const filters = [
  { key: 'all', label: 'All' },
  { key: 'stage', label: 'On stage' },
  { key: 'home', label: 'At home' },
  { key: 'exam', label: 'Exams' }
];

// Pieces (repertoire) are every film except technical work.
export const pieces = performances.filter(p => p.kind !== 'technical');
export const examFilms = performances.filter(p => p.tags.includes('exam'));

const WORDS = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
// Numbers in flowing prose: spelled out under ten, capitalised at the start of a sentence.
export const inWords = (n, start = false) => {
  const w = n < 10 ? WORDS[n] : String(n);
  return start ? w[0].toUpperCase() + w.slice(1) : w;
};

export const byId = id => performances.find(p => p.id === id);

// "Composer: Work", or "Work" alone when the composer is already shown separately.
export const titleOf = p => `${p.composer}: ${p.work}`;
export const metaOf = p => [p.occasion, p.venue].filter(Boolean).join(' · ');
