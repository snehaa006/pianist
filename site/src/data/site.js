// Site-wide facts. Every [bracketed] value is unknown and must be filled with a real fact before launch.

export const site = {
  name: 'Selin Incekara',
  repertoireRange: 'from [earliest composer] to [latest composer]',

  // The supplied photograph (About, Home): same hall and dress as the Austrian Master Classes concert film.
  portraitAlt:
    'Selin Incekara smiling on the bench of a grand piano in the stuccoed hall of the Austrian Master Classes concert, [Name] standing behind her.',

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
