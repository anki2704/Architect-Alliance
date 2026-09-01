import { Schema, model, Document } from 'mongoose';

/**
 * Stores hashed JWTs that have been explicitly logged out.
 * Documents auto-expire via TTL index so the collection stays small.
 */
export interface IRevokedToken extends Document {
  tokenHash: string;
  expiresAt: Date;
}

const revokedTokenSchema = new Schema<IRevokedToken>({
  tokenHash: { type: String, required: true, unique: true, index: true },
  expiresAt: { type: Date, required: true, index: { expireAfterSeconds: 0 } }
});

export const RevokedToken = model<IRevokedToken>('RevokedToken', revokedTokenSchema);
