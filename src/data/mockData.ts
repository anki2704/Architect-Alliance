import { Project } from '../types';

export const INITIAL_PROJECTS: Project[] = [
  {
    id: 'proj-1',
    title: 'Dymak HQ & Innovation Campus',
    category: 'commercial',
    description: 'Defined by an undulating roofscape and a gridded timber-and-glass facade, the Dymak HQ is conceived as a tour de force in low-carbon construction.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
    client: 'DYMAK A/S',
    year: '2025',
    location: 'Odense, Denmark',
    country: 'DENMARK',
    typology: 'WORK & INNOVATION',
    areaSqFt: '30,214 sq.ft',
    areaM2: '2,800 m²',
    status: 'COMPLETED',
    features: ['Mass Timber Grid', 'Micro-Acoustic Courtyard', 'Circadian Glass Envelope', 'Eelgrass Insulated Roof'],
    imageGallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=85'
    ],
    narrativeParagraphs: [
      'Defined by an undulating roofscape and a gridded timber-and-glass facade, the Dymak HQ greets visitors as they enter Odense. Conceived as both a workplace and material showcase, the building acts as a living catalogue for Dymak\'s portfolio of tactile and natural materials, while supporting a more social and flexible everyday use through shared spaces, a green courtyard, and a gym.',
      'The Dymak HQ has received DGNB Gold, Heart, and Diamond certification, recognizing its overall energy performance, focus on staff wellbeing, and design excellence. The solar roof is angled to maximize power production, minimize solar heat gain, and maximize views of the neighboring wetlands.',
      'Approaching the headquarters through the surrounding landscape designed by our internal team, visitors arrive through a carefully planted terrain that integrates buffer ponds, parking, and native vegetation. Shaped to create shelter and form a green oasis, rainwater run-off is managed through open channels and landscaped wetlands, making sustainable water management a visible and integrated part of the site.'
    ],
    quote: {
      text: 'The Dymak headquarters is conceived as a tour de force in low-carbon materiality: mass timber construction, clay tiles, clay mortar, and eelgrass lower the embodied carbon of the building while providing a warm and organic atmosphere. The circular building provides a well-lit work environment arranged around the central courtyard.',
      author: 'ALEX RIVERA',
      role: 'FOUNDER & CREATIVE DIRECTOR'
    },
    diagrams: [
      {
        title: 'FORMGIVING',
        subtitle: 'The cascading roof tilts down towards the south to provide the ideal angle for efficient utilization of solar energy.',
        imageUrl: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=80',
        index: '04 / 07'
      },
      {
        title: 'DYNAMICS',
        subtitle: 'The dynamic location of the headquarters is reflected in the round shape of the building, with no sharp corners in order for seamless flow inside the building.',
        imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=800&auto=format&fit=crop&q=80',
        index: '05 / 07'
      }
    ],
    credits: {
      partnerInCharge: ['Alex Rivera', 'Sarah Chen'],
      projectManager: ['Joes Jerne', 'Marcus Johnson'],
      projectLeader: ['Lisbet Fritze Trentemoller'],
      teamMembers: ['Celina Holck', 'Christian Rasmussen', 'Emil Westlin', 'Finn Narkjaer', 'Frederik Lyng', 'Giulia Orlando', 'Ioannis Matthaioudakis', 'Jakub Kulisa', 'Kamilla Heskje', 'Laura Watte', 'Lucas Maethe Mikkelsen'],
      engineers: ['Alexander Gale Heide', 'Marius Tromholt-Richter', 'Matthew Thomson', 'Nerisere Ledeawd Schroder', 'Oliver Steen', 'Richard Howis'],
      collaborators: ['CJ Group', 'OBH Gruppen', 'Henry Jensen', 'ZERO Engineering']
    },
    coordinates: { lat: 55.4038, lng: 10.4024 }
  },
  {
    id: 'proj-2',
    title: 'Central Administrative Building',
    category: 'institutional',
    description: 'An iconic academic administration facility integrating subterranean courtyards, stone louvers, and shaded plazas at Francisco de Vitoria University.',
    imageUrl: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&auto=format&fit=crop&q=85',
    client: 'Francisco de Vitoria University',
    year: '2025',
    location: 'Madrid, Spain',
    country: 'SPAIN',
    typology: 'ACADEMIC & CIVIC',
    areaSqFt: '145,000 sq.ft',
    areaM2: '13,470 m²',
    status: 'COMPLETED',
    features: ['Granite Brise-Soleil', 'Geothermal Cooling Vaults', 'Double Height Atrium', 'Cantilevered Auditorium'],
    imageGallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=85'
    ],
    narrativeParagraphs: [
      'The Central Administrative Building unites faculty administration, student governance, and public assembly under a single sculptural canopy in suburban Madrid.',
      'Designed to endure harsh Iberian sun, the exterior features custom white granite brise-soleil fins that cast shifting geometric shadows across the interior terrazzo floor throughout the day.'
    ],
    quote: {
      text: 'Light is our principal building material. By sculpting the building around light wells, we eliminated the need for artificial daytime illumination across 80% of administrative spaces.',
      author: 'SARAH CHEN',
      role: 'PARTNER & DESIGN PRINCIPAL'
    },
    diagrams: [
      {
        title: 'MICRO-CLIMATE SANCTUARY',
        subtitle: 'Recessed subterranean patios cool the incoming breeze before circulating it naturally through stair wells.',
        imageUrl: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=800&auto=format&fit=crop&q=80',
        index: '01 / 04'
      }
    ],
    credits: {
      partnerInCharge: ['Sarah Chen'],
      projectManager: ['Priya Patel'],
      projectLeader: ['Mateo Garcia'],
      teamMembers: ['Elena Rostova', 'David Vance', 'Claire Laurent'],
      collaborators: ['FHECOR Ingenieros', 'Arup Spain']
    },
    coordinates: { lat: 40.4168, lng: -3.7038 }
  },
  {
    id: 'proj-3',
    title: 'Horizon Tower & Sky Garden',
    category: 'commercial',
    description: 'A 42-story commercial skyscraper featuring an organic double-skin acoustic glass wall and cascading indoor sky gardens on every fifth level.',
    imageUrl: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=85',
    client: 'Horizon Global Corp',
    year: '2024',
    location: 'San Francisco, CA',
    country: 'UNITED STATES',
    typology: 'COMMERCIAL TOWER',
    areaSqFt: '450,000 sq.ft',
    areaM2: '41,800 m²',
    status: 'COMPLETED',
    features: ['LEED Platinum Certified', 'Double-skin glass curtain', 'Biophilic Sky Lounges', 'High-speed kinetic elevators'],
    imageGallery: [
      'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1497366216548-37526070297c?w=1200&auto=format&fit=crop&q=85'
    ],
    narrativeParagraphs: [
      'Redefining San Francisco skyline, Horizon Tower incorporates three-story biophilic sky gardens every 5 floors that double as passive thermal buffers.',
      'The exterior double-skin facade captures coastal bay winds to naturally ventilate common areas while dampening city acoustic noise.'
    ],
    quote: {
      text: 'Vertical urbanism must offer human connection to nature. Horizon Tower proves high-density towers can breathe with the forest.',
      author: 'ALEX RIVERA',
      role: 'FOUNDER & PRINCIPAL ARCHITECT'
    },
    credits: {
      partnerInCharge: ['Alex Rivera'],
      projectManager: ['Priya Patel'],
      teamMembers: ['Marcus Johnson', 'Sarah Chen'],
      collaborators: ['Thornton Tomasetti', 'Mewis Structural']
    },
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    id: 'proj-4',
    title: 'The Plus Mass Timber Hub',
    category: 'sustainable',
    description: 'Constructed entirely from local cross-laminated timber in a pine forest, creating a net-zero environmental benchmark for industrial manufacturing.',
    imageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=1200&auto=format&fit=crop&q=85',
    client: 'Vestre AB',
    year: '2024',
    location: 'Magnor, Norway',
    country: 'NORWAY',
    typology: 'SUSTAINABLE INDUSTRY',
    areaSqFt: '75,000 sq.ft',
    areaM2: '7,000 m²',
    status: 'COMPLETED',
    features: ['100% Local Timber', '360 Public Forest Ramp', 'Solar Roof Deck', 'Circular Water Purification'],
    imageGallery: [
      'https://images.unsplash.com/photo-1541888946425-d0fbb186a5b3?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85'
    ],
    narrativeParagraphs: [
      'Located in the heart of Magnor forest, The Plus is a four-wing factory built around a central green courtyard open to hikers and public visitors.',
      'The building generates 50% less greenhouse gas emissions than conventional factories of similar scale.'
    ],
    quote: {
      text: 'An industrial factory does not need to be a closed grey box. It can be a public park that manufactures clean products.',
      author: 'SARAH CHEN',
      role: 'HEAD OF SUSTAINABILITY'
    },
    credits: {
      partnerInCharge: ['Sarah Chen', 'Alex Rivera'],
      projectManager: ['Joes Jerne'],
      teamMembers: ['Eirik Lind', 'Astrid Solberg']
    },
    coordinates: { lat: 59.95, lng: 12.2 }
  },
  {
    id: 'proj-5',
    title: 'Skyline Villa Malibu',
    category: 'residential',
    description: 'A cantilevered luxury residence perched on a hillside, featuring floor-to-ceiling glass, solar energy harvesting, and passive natural ventilation.',
    imageUrl: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
    client: 'Private Residence',
    year: '2025',
    location: 'Malibu, CA',
    country: 'UNITED STATES',
    typology: 'LUXURY RESIDENTIAL',
    areaSqFt: '8,400 sq.ft',
    areaM2: '780 m²',
    status: 'COMPLETED',
    features: ['Solar Glass Facade', 'Infinity Pool', 'Smart Home Automation', 'Rainwater Harvesting'],
    imageGallery: [
      'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&auto=format&fit=crop&q=85'
    ],
    narrativeParagraphs: [
      'Perched dramatically over the Pacific ocean, Skyline Villa uses bold structural cantilevers to hover above coastal cliffs while mitigating seismic movement.',
      'Automated kinetic bronze louvers shift with the sun to block intense western glare while maximizing morning light.'
    ],
    quote: {
      text: 'Every window frame was engineered to dissolve into the sea line, turning living spaces into living landscapes.',
      author: 'MARCUS JOHNSON',
      role: 'LEAD INTERIOR ARCHITECT'
    },
    credits: {
      partnerInCharge: ['Alex Rivera'],
      projectLeader: ['Marcus Johnson'],
      teamMembers: ['Priya Patel']
    },
    coordinates: { lat: 34.0259, lng: -118.7798 }
  },
  {
    id: 'proj-6',
    title: 'Riverside Science Campus',
    category: 'institutional',
    description: 'An expansive university research center designed with sustainable local timber, solar canopy roofs, and collaborative open-plan learning labs.',
    imageUrl: 'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=1200&auto=format&fit=crop&q=85',
    client: 'Pacific Science Institute',
    year: '2025',
    location: 'Portland, OR',
    country: 'UNITED STATES',
    typology: 'RESEARCH & EDUCATION',
    areaSqFt: '120,000 sq.ft',
    areaM2: '11,150 m²',
    status: 'COMPLETED',
    features: ['Mass Timber Structure', 'Zero-Carbon Footprint', 'Acoustic Amphitheaters', 'Hydroponic Atrium'],
    imageGallery: [
      'https://images.unsplash.com/photo-1562778612-e1e0cda9915c?w=1200&auto=format&fit=crop&q=85',
      'https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?w=1200&auto=format&fit=crop&q=85'
    ],
    narrativeParagraphs: [
      'Bridging riverfront public trails with advanced research facilities, Riverside Campus features flexible modular laboratories framed in Pacific Northwest glulam beams.',
      'A central glass atrium filled with native ferns serves as an acoustic spine and climate buffer for students and scientists.'
    ],
    quote: {
      text: 'Science thrives where disciplines collide. We designed every corridor with micro-lounges that invite spontaneous collaboration.',
      author: 'SARAH CHEN',
      role: 'PRINCIPAL ARCHITECT'
    },
    credits: {
      partnerInCharge: ['Sarah Chen'],
      projectManager: ['Priya Patel'],
      teamMembers: ['Alex Rivera', 'Marcus Johnson']
    },
    coordinates: { lat: 45.5152, lng: -122.6784 }
  }
];

// Demo users, a sample booking, and a sample Enquiry message are now seeded
// directly into MongoDB with real (hashed) credentials —
// see server/seed/seed.ts and server/seed/seedData.ts.

export const TEAM_MEMBERS = [
  {
    name: 'Alex Rivera',
    role: 'Founder & Principal Architect',
    bio: '20+ years of architectural excellence leading award-winning sustainable developments worldwide.',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80'
  },
  {
    name: 'Sarah Chen',
    role: 'Senior Sustainability Architect',
    bio: 'Specializes in mass timber engineering, net-zero carbon design, and LEED Platinum certifications.',
    image: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&q=80'
  },
  {
    name: 'Marcus Johnson',
    role: 'Interior Design Lead',
    bio: 'Pioneers human-centric interiors balancing acoustic warmth, tactile stone, and natural illumination.',
    image: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80'
  },
  {
    name: 'Priya Patel',
    role: 'Executive Project Manager',
    bio: 'Ensures seamless cross-disciplinary execution from initial CAD blueprints through structural completion.',
    image: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80'
  }
];

export const TESTIMONIALS = [
  {
    quote: "Architecture Alliance transformed our vision into an architectural masterpiece. Their attention to biophilic details and light management exceeded all expectations.",
    name: "James Mitchell",
    role: "CEO, Horizon Developments",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&q=80",
    rating: 5
  },
  {
    quote: "Working with Sarah and the design team was an empowering experience. They delivered a net-zero commercial campus that has become our firm's proudest asset.",
    name: "Emily Rodriguez",
    role: "Director, GreenSpace Initiative",
    avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80",
    rating: 5
  },
  {
    quote: "The team's spatial mastery and responsive project management made building our flagship headquarters effortless. Highly recommended!",
    name: "David Kim",
    role: "COO, TechVista Corp",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&q=80",
    rating: 5
  }
];
