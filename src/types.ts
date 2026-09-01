export type ProjectCategory = 'all' | 'residential' | 'commercial' | 'institutional' | 'interior' | 'sustainable';

export interface ProjectDiagram {
  title: string;
  subtitle: string;
  imageUrl: string;
  index: string;
}

export interface ProjectQuote {
  text: string;
  author: string;
  role: string;
}

export interface ProjectCredits {
  partnerInCharge?: string[];
  projectManager?: string[];
  projectLeader?: string[];
  teamMembers?: string[];
  collaborators?: string[];
  engineers?: string[];
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  description: string;
  imageUrl: string;
  client: string;
  year: string;
  location: string;
  country?: string;
  typology?: string;
  areaSqFt: string;
  areaM2?: string;
  status?: string;
  features: string[];
  imageGallery: string[];
  narrativeParagraphs?: string[];
  quote?: ProjectQuote;
  diagrams?: ProjectDiagram[];
  credits?: ProjectCredits;
  coordinates?: { lat: number; lng: number };
}

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Not Required' | 'Pending';

export interface Booking {
  id: string;
  customerId?: string | null;
  customerName: string;
  email: string;
  phone?: string;
  projectType: string;
  date: string;
  time: string;
  notes?: string;
  status: BookingStatus;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  assignedDesignerId?: string | null;
  createdAt: number;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  contact?: string;
  subject?: string;
  message: string;
  createdAt: number;
}

export type UserRole = 'admin' | 'designer' | 'customer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  order?: number;
}

export interface Testimonial {
  id: string;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

export interface JournalArticle {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  content?: string;
}
