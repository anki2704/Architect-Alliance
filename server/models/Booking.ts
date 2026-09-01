import { Schema, model, Document, Types } from 'mongoose';
import { idTransform } from '../utils/schemaOptions';

export type BookingStatus = 'Pending' | 'Confirmed' | 'In Progress' | 'Completed' | 'Cancelled';
export type PaymentStatus = 'Paid' | 'Not Required' | 'Pending';

export interface IBooking extends Document {
  customerId?: Types.ObjectId | null;
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
  assignedDesignerId?: Types.ObjectId | null;
  createdAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    customerId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
    customerName: { type: String, required: true },
    email: { type: String, required: true },
    phone: String,
    projectType: { type: String, required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    notes: String,
    status: {
      type: String,
      enum: ['Pending', 'Confirmed', 'In Progress', 'Completed', 'Cancelled'],
      default: 'Pending'
    },
    paymentStatus: {
      type: String,
      enum: ['Paid', 'Not Required', 'Pending'],
      default: 'Not Required'
    },
    paymentAmount: { type: Number, default: 0 },
    assignedDesignerId: { type: Schema.Types.ObjectId, ref: 'User', default: null }
  },
  {
    timestamps: { createdAt: true, updatedAt: true },
    toJSON: {
      ...idTransform,
      transform: (doc: any, ret: any) => {
        idTransform.transform(doc, ret);
        // Frontend expects createdAt as an epoch-ms number, and the two
        // ObjectId refs as plain strings (or null).
        ret.createdAt = doc.createdAt ? doc.createdAt.getTime() : Date.now();
        ret.customerId = doc.customerId ? doc.customerId.toString() : null;
        ret.assignedDesignerId = doc.assignedDesignerId ? doc.assignedDesignerId.toString() : null;
        delete ret.updatedAt;
        return ret;
      }
    },
    toObject: idTransform
  }
);

bookingSchema.index({ customerId: 1 });
bookingSchema.index({ assignedDesignerId: 1 });

export const Booking = model<IBooking>('Booking', bookingSchema);
