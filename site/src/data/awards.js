import { photos } from './photos';

// Her prizes and certificates, as printed on the diplomas she supplied (October 2026). Only what they say: never guess.
export const awards = [
  {
    id: 'ravel-award',
    prize: 'Gold Prize',
    title: 'Ravel Award International Music Competition',
    detail: 'Piano, age group C',
    where: 'Gdańsk, Poland',
    date: '16 Oct 2026',
    dateIso: '2026-10-16',
    image: photos.certRavel
  },
  {
    id: 'piano-competition-online',
    prize: 'Gold Prize',
    title: 'Piano Competition Online, 17th edition',
    detail: 'International competition for pianists, category III',
    where: 'Gdańsk, Poland',
    date: '16 Oct 2026',
    dateIso: '2026-10-16',
    image: photos.certOnline
  },
  {
    // The certificate in the photograph is headed University of West London (the home of London College of Music
    // exams) and marked Distinction; its grade and year are too small to read and not known, so neither is given.
    id: 'lcm-distinction',
    prize: 'Distinction',
    title: 'London College of Music piano exam',
    detail: 'University of West London',
    where: null,
    date: null,
    dateIso: null,
    image: photos.certDistinction
  }
];

export const golds = awards.filter(a => a.prize === 'Gold Prize').length;
