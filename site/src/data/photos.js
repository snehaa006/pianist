// Her photographs and diplomas, supplied October 2026 (../photos; `npm run media -- --photos` makes the WebPs), in their
// original colour like the portrait. Each comes at 1200 px on its long edge and at 640 px. `at` is the point a frame
// keeps in view when it crops the photograph (object-position). Nobody but Selin is named: who the others are is not
// known, so the alt text describes them.
const photo = (slug, width, height, alt, at = '50% 50%') => {
  const small = width >= height ? 640 : Math.round((640 * width) / height);
  return {
    src: `/media/photos/${slug}.webp`,
    srcSet: `/media/photos/${slug}-640.webp ${small}w, /media/photos/${slug}.webp ${width}w`,
    width,
    height,
    alt,
    at
  };
};

export const photos = {
  // The diplomas and certificate (data/awards.js)
  certRavel: photo('cert-ravel-award', 1114, 779,
    'The Ravel Award diploma: Gold Prize, presented to Selin İncekara, category piano, age group C, Gdańsk, Poland, 16 October 2026.'),
  certOnline: photo('cert-piano-competition-online', 1170, 828,
    'The Piano Competition Online diploma, 17th edition: Gold Prize, category III, Selin İncekara, Gdańsk, Poland, 16 October 2026.'),
  certDistinction: photo('cert-lcm-distinction', 900, 1200,
    'Selin Incekara holding her London College of Music certificate, marked Distinction, with a woman beside her.', '50% 40%'),

  // Her, at the piano and after playing
  lightsPiano: photo('lights-piano', 1200, 675,
    'Selin Incekara in a white hooded coat, laughing at a piano strung with fairy lights, a score open on the stand.', '24% 50%'),
  studioGrand: photo('studio-grand', 900, 1200,
    'Selin Incekara in a flowered dress, standing with a woman beside a grand piano in a studio.', '50% 55%'),
  recitalHug: photo('recital-hug', 900, 1200,
    'Selin Incekara hugging a woman after a recital, in a sunlit room.', '50% 30%'),
  gallery: photo('gallery', 1200, 675,
    'Selin Incekara in a pink polka-dot dress, standing with a woman in a gallery hung with paintings.', '50% 45%'),
  afterConcert: photo('after-concert', 900, 1200,
    'Selin Incekara in a pink polka-dot dress, smiling between two women after a concert.', '50% 35%'),
  flowers: photo('flowers', 1200, 900,
    'Selin Incekara, a few years younger, holding a bouquet after a concert, between two women.', '50% 55%'),
  stageRecital: photo('stage-recital', 1200, 900,
    'Selin Incekara and a woman on a theatre stage beside an open grand piano, Selin holding her programme.', '30% 50%'),

  // Recitals with the other young pianists
  classStairs: photo('class-stairs', 675, 1200,
    'Young pianists crowded up a staircase hung with Christmas garlands, smiling, Selin Incekara near the front.', '50% 70%'),
  classDecollage: photo('class-decollage', 1200, 900,
    'Young pianists in concert dress on the stage of the Decollage Art Space, Selin Incekara among them in pink polka dots.', '42% 50%'),
  classSalon: photo('class-salon', 1200, 900,
    'Young pianists and their teachers under a crystal chandelier in a salon, a grand piano behind them.'),
  classStudio: photo('class-studio', 1200, 900,
    'Young pianists in concert clothes in a studio, a grand piano and a large black-and-white photograph behind them.'),
  classWinter: photo('class-winter', 1200, 900,
    'A winter recital: young pianists in a salon with two Christmas trees, a screen behind them showing others joining online.'),
  classEvening: photo('class-evening', 1200, 900,
    'Young pianists in concert dress, gathered for a photograph in a dark room after an evening recital.'),
  classSalonScreen: photo('class-salon-screen', 1200, 900,
    'Young pianists lined up in a salon beside the grand piano, a screen beside them showing others joining online.')
};
