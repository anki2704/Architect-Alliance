import mongoose from 'mongoose';
import dns from 'dns';
// Forces public DNS so mongodb+srv:// lookups work on networks whose default DNS breaks SRV records.
// If your host blocks outbound DNS to 8.8.8.8/1.1.1.1 (connection fails with querySrv errors),
// set DISABLE_DNS_OVERRIDE=1 in the environment to use the host's own resolver instead.
if (process.env.DISABLE_DNS_OVERRIDE !== '1') {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
}

export async function connectDB(): Promise<void> {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.error('[MongoDB] MONGODB_URI is not set.');
    process.exit(1);
  }

  try {
    mongoose.set('strictQuery', true);
    const conn = await mongoose.connect(uri, {
      maxPoolSize: 20,
      minPoolSize: 2,
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000
    });
    console.log(`[MongoDB] Connected: ${conn.connection.host}/${conn.connection.name}`);
  } catch (err) {
    console.error('[MongoDB] Connection error:', (err as Error).message);
    process.exit(1);
  }

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] Disconnected');
  });

  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] Runtime error:', err.message);
  });
}
