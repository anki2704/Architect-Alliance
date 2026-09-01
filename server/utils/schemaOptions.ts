import { Schema } from 'mongoose';

/**
 * Shared toJSON/toObject transform so every model serializes with a plain
 * string `id` field (instead of Mongo's `_id` ObjectId) and drops `__v`.
 * This keeps the existing frontend types (which expect `id: string`)
 * working unchanged against real MongoDB-backed data.
 */
export const idTransform = {
  virtuals: true,
  versionKey: false as const,
  transform: (_doc: unknown, ret: Record<string, any>) => {
    ret.id = ret._id?.toString();
    delete ret._id;
    delete ret.password;
    return ret;
  }
};

export const baseSchemaOptions: Record<string, unknown> = {
  timestamps: true,
  toJSON: idTransform,
  toObject: idTransform
};

export type { Schema };
