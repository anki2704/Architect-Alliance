import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../utils/schemaOptions';

export type ProjectCategory = 'residential' | 'commercial' | 'institutional' | 'interior' | 'sustainable';

interface IProjectQuote {
  text: string;
  author: string;
  role: string;
}

interface IProjectDiagram {
  title: string;
  subtitle: string;
  imageUrl: string;
  index: string;
}

interface IProjectCredits {
  partnerInCharge?: string[];
  projectManager?: string[];
  projectLeader?: string[];
  teamMembers?: string[];
  collaborators?: string[];
  engineers?: string[];
}

export interface IProject extends Document {
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
  quote?: IProjectQuote;
  diagrams?: IProjectDiagram[];
  credits?: IProjectCredits;
  coordinates?: { lat: number; lng: number };
}

const projectSchema = new Schema<IProject>(
  {
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['residential', 'commercial', 'institutional', 'interior', 'sustainable'],
      required: true
    },
    description: { type: String, required: true },
    imageUrl: { type: String, required: true },
    client: { type: String, required: true },
    year: { type: String, required: true },
    location: { type: String, required: true },
    country: String,
    typology: String,
    areaSqFt: { type: String, required: true },
    areaM2: String,
    status: String,
    features: { type: [String], default: [] },
    imageGallery: { type: [String], default: [] },
    narrativeParagraphs: { type: [String], default: [] },
    quote: {
      text: String,
      author: String,
      role: String
    },
    diagrams: [
      {
        title: String,
        subtitle: String,
        imageUrl: String,
        index: String
      }
    ],
    credits: {
      partnerInCharge: [String],
      projectManager: [String],
      projectLeader: [String],
      teamMembers: [String],
      collaborators: [String],
      engineers: [String]
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  baseSchemaOptions
);

projectSchema.index({ category: 1 });

export const Project = model<IProject>('Project', projectSchema);
