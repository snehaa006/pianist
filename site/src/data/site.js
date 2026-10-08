// Site-wide facts. Every [bracketed] value is unknown and must be filled with a real fact before launch.

export const site = {
  name: 'Selin Incekara',
  city: '[City]',
  teacher: '[Teacher]',
  school: '[School]',
  beginnings: '[When and where she began playing.]',
  repertoireRange: 'from [earliest composer] to [latest composer]',

  // Her own words, drafted with her. Never ghost-written.
  note: '[Two or three sentences in her own words: how she prepares, or why she chose these pieces. Draft it with her.]',

  contacts: [
    { role: 'Management', name: '[Name], [Agency]', email: '[email]' },
    { role: 'Press', name: '[Name]', email: '[email]' },
    { role: 'Direct', name: '[email]', email: '[email]' }
  ],

  // Newsletter: paste the form endpoint of your mailing-list service (Buttondown, Mailchimp, …).
  // Until it is set, the form validates and shows the success line but stores nothing.
  newsletterAction: '',

  // Shown in the footer only once a real URL is set.
  socials: [
    { label: 'Instagram', url: '' },
    { label: 'YouTube', url: '' }
  ],

  // Shown on About only once a real file is set, e.g. '/press/selin-incekara-press-kit.pdf'.
  pressKit: ''
};

export const isPlaceholder = value => !value || /\[[^\]]*\]/.test(value);
