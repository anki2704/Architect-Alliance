import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../utils/schemaOptions';

export interface ITeamMember extends Document {
  name: string;
  role: string;
  bio: string;
  image: string;
  linkedin?: string;
  twitter?: string;
  order: number;
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    role: { type: String, required: true },
    bio: { type: String, required: true },
    image: { type: String, required: true },
    linkedin: String,
    twitter: String,
    order: { type: Number, default: 0 }
  },
  baseSchemaOptions
);

teamMemberSchema.index({ order: 1 });

export const TeamMember = model<ITeamMember>('TeamMember', teamMemberSchema);
