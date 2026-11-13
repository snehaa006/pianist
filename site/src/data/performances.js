// Every filmed performance on the site. Fill the [bracketed] fields with real facts; never guess.
// Facts below were taken from the videos themselves (what she says on camera, what is visible on screen).
// "hint" notes are analysis only (key, metre, likely candidates). They never render on the site.

const media = slug => ({
  poster: `/media/posters/${slug}.webp`,
  // 6 s, muted, warm monochrome: the home reel plays these
  loop: [
    { src: `/media/video/loops/${slug}.mp4`, type: 'video/mp4' },
    { src: `/media/video/loops/${slug}.webm`, type: 'video/webm' }
  ],
  sources: [
    { src: `/media/video/${slug}.mp4`, type: 'video/mp4' },
    { src: `/media/video/${slug}.webm`, type: 'video/webm' }
  ]
});

// The piece she plays at the Austrian Master Classes concert. Two films show it (the full performance, and its opening
// from across the hall), so it is filled in once, here. Named by the client (13 November 2026), who wrote it down by
// ear as "Elfentans": the published German title is Elfentanz (Norwegian "Alfedans"). Grieg wrote one Elfentanz for
// piano, Lyric Pieces Op. 12 No. 4, in E minor, which is this film's key; the opus is left off until it is confirmed.
const amcPiece = { composer: 'Edvard Grieg', lifespan: '1843–1907', work: 'Elfentanz' };

export const performances = [
  {
    id: 'austrian-master-classes',
    short: 'Austrian Master Classes',
    tags: ['stage'],
    ...amcPiece,
    // The roll-up banner on stage reads "austrian master classes · in concert" (amc).
    occasion: 'Austrian Master Classes concert',
    year: '[Year]',
    duration: '1:37',
    durationIso: 'PT1M37S',
    alt: 'Selin Incekara at a concert grand in a stucco-panelled hall, mid-phrase, the lid raised beside her.',
    hint: 'E minor; flowing broken chords, a middle phrase in B minor. Piece named by the client; E minor matches Grieg’s Elfentanz, Op. 12 No. 4.',
    ...media('austrian-master-classes')
  },
  {
    id: 'on-stage',
    short: 'On stage',
    tags: ['stage'],
    // Named by the client (October 2026, title corrected by Selin 13 November 2026): "Etude, Op. 65 No. 40 by Carl
    // Löschhorn". Her only film in D minor, and the etude is a D minor Allegro.
    composer: 'Carl Albert Löschhorn',
    lifespan: '1819–1905',
    work: 'Etude, Op. 65 No. 40',
    occasion: 'On stage',
    year: '[Year]',
    duration: '1:16',
    durationIso: 'PT1M16S',
    alt: 'Selin Incekara alone at a grand piano on a dark stage, lit from above.',
    hint: 'D minor, fast, about 50 seconds of music. Walk-on, bow, applause. Piece named by the client.',
    ...media('on-stage')
  },
  {
    id: 'at-home-grand',
    short: 'At the grand piano',
    tags: ['home'],
    // Named by the client (October 2026, number corrected by Selin 13 November 2026): "Waltz in E-flat Major,
    // Op. 39 No. 8". Her only waltz on film, and it opens in the waltz's key, E-flat major.
    composer: 'Pyotr Ilyich Tchaikovsky',
    lifespan: '1840–1893',
    work: 'Waltz in E-flat major, Op. 39 No. 8',
    // Too long for the Repertoire dial, which cuts a label off at the wheel's edge: the dial turns on this instead.
    wheelWork: 'Waltz, Op. 39 No. 8',
    collection: 'Album for the Young',
    occasion: 'At home, on the grand piano',
    year: '[Year]',
    duration: '1:34',
    durationIso: 'PT1M34S',
    alt: 'Selin Incekara in profile at a grand piano beside a window, hands on the keys.',
    hint: 'E-flat major opening, a middle section in C minor; waltz pattern in 3/4 (bass on the beat, two chords). Piece named by the client.',
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
    // Named by the client (13 November 2026): "Das Kind ist müde by Friedrich Baumfelder", which is what the
    // spoken introduction says ("LCM recorded exam, grade 1 … from performance list B"); the German title and the
    // surname were what had been too unclear to transcribe.
    composer: 'Friedrich Baumfelder',
    lifespan: '1836–1916',
    work: 'Das Kind ist müde',
    occasion: 'London College of Music exam, Grade 1',
    syllabus: 'List B',
    year: '[Year]',
    duration: '1:55',
    durationIso: 'PT1M55S',
    alt: 'Selin Incekara at a digital piano with the score open, eyes on the keys.',
    hint: 'C major, slow and quiet over a low C. Piece named by the client.',
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
    year: '[Year]',
    duration: '2:17',
    durationIso: 'PT2M17S',
    alt: 'Selin Incekara at a digital piano, both hands running through a scale.',
    hint: 'Same session as the Grade 1 piece (same room and dress).',
    ...media('grade-1-technical')
  },
  {
    id: 'austrian-master-classes-wide',
    short: 'Across the hall',
    kind: 'clip',
    tags: ['stage'],
    ...amcPiece,
    // Sent October 2026: the Austrian Master Classes performance again, from another phone across the hall. Same dress,
    // and its notes are the concert film's opening, so it is the same piece. Not a piece of its own (left out of Repertoire).
    occasion: 'Austrian Master Classes concert, the opening from across the hall',
    year: '[Year]',
    duration: '0:11',
    durationIso: 'PT11S',
    alt: 'The Austrian Master Classes hall from across the floor: Selin Incekara at the grand piano between the stucco columns.',
    hint: 'E minor; the first five seconds of music of the concert film, from a wider angle. Same piece, named by the client.',
    ...media('austrian-master-classes-wide')
  }
];

// Pieces she plays that are not on film yet (named by the client, October 2026). Listed on Repertoire, never in a
// film's place.
export const unfilmed = [
  {
    id: 'haydn-sonata-g',
    composer: 'Joseph Haydn',
    lifespan: '1732–1809',
    work: 'Sonata in G major, Hob. XVI:G1: Finale (Presto)'
  }
];

// Filters on the Watch page.
export const filters = [
  { key: 'all', label: 'All' },
  { key: 'stage', label: 'On stage' },
  { key: 'home', label: 'At home' },
  { key: 'exam', label: 'Exams' }
];

// Pieces (repertoire) are every film except technical work and a second angle on a piece already filmed.
export const pieces = performances.filter(p => !p.kind);
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
// Where a film was filmed is left off at the client's request (13 November 2026): the occasion only.
export const metaOf = p => p.occasion || '';
