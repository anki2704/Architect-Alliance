import { Schema, model, Document } from 'mongoose';
import { baseSchemaOptions } from '../utils/schemaOptions';

export interface ITestimonial extends Document {
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const DEFAULT_AVATAR =
  'https://ui-avatars.com/api/?name=Client&background=C97B4E&color=fff&size=128';

const testimonialSchema = new Schema<ITestimonial>(
  {
    quote: { type: String, required: true },
    name: { type: String, required: true },
    role: { type: String, required: true, default: 'Client' },
    avatar: { type: String, required: false, default: DEFAULT_AVATAR },
    rating: { type: Number, min: 1, max: 5, default: 5 }
  },
  baseSchemaOptions
);

export const Testimonial = model<ITestimonial>('Testimonial', testimonialSchema);
