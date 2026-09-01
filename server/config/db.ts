import mongoose from 'mongoose';

/**
 * Connects to MongoDB using the MONGODB_URI environment variable.
 * Works with a local mongod instance or a MongoDB Atlas connection string.
 */
export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error(
      '\n[MongoDB] MONGODB_URI is not set. Create a .env file (see .env.example) ' +
      'with a local connection string like "mongodb://127.0.0.1:27017/architech-alliance" ' +
      'or an Atlas URI.\n'
    );
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri);
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[MongoDB] Connection error:', (err as Error).message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected');
  });
}
