// Additional seed data that didn't already live in src/data/mockData.ts.
// Projects, team members, and testimonials are reused directly from
// mockData.ts (see seed.ts) so there's a single source of truth for that content.

export const JOURNAL_POSTS = [
  {
    title: 'Top Architectural Tips for First-Time Custom Home Builders in 2026',
    category: 'Guides',
    readTime: '6 min read',
    date: 'July 24, 2026',
    author: 'Alex Rivera',
    image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=900&auto=format&fit=crop&q=85',
    excerpt:
      'Building your dream home requires balancing aesthetic vision with structural feasibility. Discover how site orientation, micro-climate study, and biophilic glazing lay the foundation for timeless luxury.'
  },
  {
    title: 'Real Estate Architecture Trends: Sustainable Luxury Investments',
    category: 'Market Trends',
    readTime: '4 min read',
    date: 'July 18, 2026',
    author: 'Sarah Chen',
    image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&auto=format&fit=crop&q=85',
    excerpt:
      'Mass timber, geothermal HVAC systems, and kinetic shading facades are yielding record capital appreciation across ultra-high-net-worth real estate developments.'
  },
  {
    title: 'Essential Steps to Design a Passive Solar House with Zero Carbon',
    category: 'Sustainability',
    readTime: '8 min read',
    date: 'July 10, 2026',
    author: 'Marcus Johnson',
    image: 'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&auto=format&fit=crop&q=85',
    excerpt:
      'Harnessing solar heat gain while mitigating summer glare requires precision parametric modeling and custom brise-soleil engineering.'
  },
  {
    title: 'How Biophilic Interior Architecture Elevates Daily Mental Wellbeing',
    category: 'Design Philosophy',
    readTime: '5 min read',
    date: 'June 29, 2026',
    author: 'Priya Patel',
    image: 'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&auto=format&fit=crop&q=85',
    excerpt:
      'Integrating indoor water courtyards, natural acoustic clay plaster, and circadian daylighting transforms everyday residential living.'
  }
];

// Seed account credentials — read from environment variables so a real
// deployment can set its own admin/designer/customer logins instead of
// shipping a known password. Falls back to local-dev-only defaults if unset
// (seed.ts prints a warning whenever a fallback is used).
const FALLBACK_PASSWORD = 'demo1234';

export const SEED_CREDENTIALS = {
  admin: {
    email: process.env.SEED_ADMIN_EMAIL || 'admin@architech.com',
    password: process.env.SEED_ADMIN_PASSWORD || FALLBACK_PASSWORD,
    usedFallback: !process.env.SEED_ADMIN_PASSWORD
  },
  designer: {
    email: process.env.SEED_DESIGNER_EMAIL || 'designer@architech.com',
    password: process.env.SEED_DESIGNER_PASSWORD || FALLBACK_PASSWORD,
    usedFallback: !process.env.SEED_DESIGNER_PASSWORD
  },
  customer: {
    email: process.env.SEED_CUSTOMER_EMAIL || 'customer@architech.com',
    password: process.env.SEED_CUSTOMER_PASSWORD || FALLBACK_PASSWORD,
    usedFallback: !process.env.SEED_CUSTOMER_PASSWORD
  }
};

export const DEMO_USERS = [
  {
    name: 'Alex Rivera',
    email: SEED_CREDENTIALS.admin.email,
    password: SEED_CREDENTIALS.admin.password,
    role: 'admin' as const,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&q=80'
  },
  {
    name: 'Sarah Chen',
    email: SEED_CREDENTIALS.designer.email,
    password: SEED_CREDENTIALS.designer.password,
    role: 'designer' as const,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&q=80'
  },
  {
    name: 'Demo Client',
    email: SEED_CREDENTIALS.customer.email,
    password: SEED_CREDENTIALS.customer.password,
    role: 'customer' as const,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80'
  }
];
