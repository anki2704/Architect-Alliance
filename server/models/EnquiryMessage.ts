import { Schema, model, Document } from 'mongoose';
import { idTransform } from '../utils/schemaOptions';

export interface IEnquiryMessage extends Document {
  name: string;
  email: string;
  contact?: string;
  subject?: string;
  message: string;
  createdAt: Date;
}

const EnquiryMessageSchema = new Schema<IEnquiryMessage>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true },
    contact: { type: String, required: true },
    subject: String,
    message: { type: String, required: true }
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    toJSON: {
      ...idTransform,
      transform: (doc: any, ret: any) => {
        idTransform.transform(doc, ret);
        ret.createdAt = doc.createdAt ? doc.createdAt.getTime() : Date.now();
        return ret;
      }
    },
    toObject: idTransform
  }
);

export const EnquiryMessage = model<IEnquiryMessage>('EnquiryMessage', EnquiryMessageSchema);
