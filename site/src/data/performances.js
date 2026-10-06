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
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    // The roll-up banner on stage reads "austrian master classes · in concert" (amc).
    occasion: 'Austrian Master Classes concert',
    venue: '[Hall]',
    year: '[Year]',
    duration: '1:37',
    durationIso: 'PT1M37S',
    alt: 'Srinijakara at a concert grand in a stucco-panelled hall, mid-phrase, the lid raised beside her.',
    hint: 'E minor; flowing broken chords, a middle phrase in B minor. Hall looks like the Rococo Festsaal of Schloss Zell an der Pram (AMC concert venue). Confirm.',
    ...media('austrian-master-classes')
  },
  {
    id: 'on-stage',
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    occasion: 'On stage',
    venue: '[Venue], [City]',
    year: '[Year]',
    duration: '1:16',
    durationIso: 'PT1M16S',
    alt: 'Srinijakara alone at a grand piano on a dark stage, lit from above.',
    hint: 'D minor, fast, about 45 seconds of music. Walk-on, bow, applause.',
    ...media('on-stage')
  },
  {
    id: 'at-home-grand',
    composer: '[Composer]',
    lifespan: '[Lifespan]',
    work: '[Work]',
    occasion: 'At home, on the grand piano',
    venue: null,
    year: '[Year]',
    duration: '1:34',
    durationIso: 'PT1M34S',
    alt: 'Srinijakara in profile at a grand piano beside a window, hands on the keys.',
    hint: 'G minor with long passages in E-flat major; waltz pattern in 3/4 (bass on the beat, two chords).',
    ...media('at-home-grand')
  },
  {
    id: 'song-of-twilight',
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
    alt: 'Srinijakara at a digital piano, seen over her shoulder, mid-phrase.',
    hint: 'A major. Confirmed by her spoken introduction.',
    ...media('song-of-twilight')
  },
  {
    id: 'lcm-grade-1',
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
    alt: 'Srinijakara at a digital piano with the score open, eyes on the keys.',
    hint: 'C major, slow and quiet over a low C. Title heard as "Dusk… Mood", composer as "Frederick B…".',
    ...media('lcm-grade-1')
  }
];

export const byId = id => performances.find(p => p.id === id);

// "Composer: Work", or "Work" alone when the composer is already shown separately.
export const titleOf = p => `${p.composer}: ${p.work}`;
export const metaOf = p => [p.occasion, p.venue].filter(Boolean).join(' · ');
