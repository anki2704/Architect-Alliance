import { Schema, model, Document } from 'mongoose';
import { idTransform } from '../utils/schemaOptions';

export interface IJournalPost extends Document {
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  image: string;
  excerpt: string;
  content?: string;
  createdAt: Date;
}

const journalPostSchema = new Schema<IJournalPost>(
  {
    title: { type: String, required: true },
    category: { type: String, required: true },
    readTime: { type: String, required: true },
    date: { type: String, required: true },
    author: { type: String, required: true },
    image: { type: String, required: true },
    excerpt: { type: String, required: true },
    content: String
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      ...idTransform,
      transform: (doc: any, ret: any) => {
        idTransform.transform(doc, ret);
        delete ret.updatedAt;
        return ret;
      }
    },
    toObject: idTransform
  }
);

export const JournalPost = model<IJournalPost>('JournalPost', journalPostSchema);
