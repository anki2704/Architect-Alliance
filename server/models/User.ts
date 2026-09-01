import { Schema, model, Document } from 'mongoose';
import bcrypt from 'bcryptjs';
import { baseSchemaOptions } from '../utils/schemaOptions';

export type UserRole = 'admin' | 'designer' | 'customer';

export interface IUser extends Document {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  phone?: string;
  failedLoginAttempts: number;
  lockUntil?: Date | null;
  otpCode?: string | null;
  otpExpires?: Date | null;
  matchPassword(candidate: string): Promise<boolean>;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email']
    },
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ['admin', 'designer', 'customer'], default: 'customer' },
    avatar: { type: String },
    phone: { type: String, trim: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    otpCode: { type: String, default: null, select: false },
    otpExpires: { type: Date, default: null, select: false }
  },
  baseSchemaOptions
);

userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

export const User = model<IUser>('User', userSchema);
