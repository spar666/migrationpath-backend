// Initial editorial content supplied for the landing page. Editable through site config.
export const DEFAULT_VISA_CATEGORIES = [
  {
    slug: 'tourist',
    title: 'Tourist Visas',
    visas: [
      {
        subclass: '600',
        title: 'Visitor Visa',
        description:
          'Allows people to visit Australia for a holiday, tourism, or short business visitor activities.',
      },
      {
        subclass: '601',
        title: 'Electronic Travel Authority',
        description:
          'Lets eligible passport holders visit for tourism or business short stays.',
      },
      {
        subclass: '771',
        title: 'Transit Visa',
        description:
          'For travelers passing through Australia for up to 72 hours.',
      },
    ],
  },
  {
    slug: 'student',
    title: 'Student Visas',
    visas: [
      {
        subclass: '500',
        title: 'Student Visa',
        description:
          'Allows international students to stay and study full-time in a registered course.',
      },
      {
        subclass: '590',
        title: 'Student Guardian Visa',
        description:
          'For parents or guardians supporting a young international student in Australia.',
      },
      {
        subclass: '485',
        title: 'Temporary Graduate Visa',
        description:
          'Lets recent graduates live, study, and work after finishing their studies.',
      },
    ],
  },
  {
    slug: 'skilled',
    title: 'Skilled Work Visas',
    visas: [
      {
        subclass: '189',
        title: 'Skilled Independent Visa',
        description:
          'A permanent residency visa for points-tested skilled workers not sponsored by an employer or state.',
      },
      {
        subclass: '190',
        title: 'Skilled Nominated Visa',
        description:
          'A permanent residency visa for workers nominated by an Australian state or territory.',
      },
      {
        subclass: '491',
        title: 'Skilled Regional (Provisional) Visa',
        description:
          'A temporary visa for skilled people to live and work in regional Australia.',
      },
    ],
  },
];
