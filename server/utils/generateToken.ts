import jwt from 'jsonwebtoken';

export function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET is not set in the environment.');
  }
  return jwt.sign({ id: userId }, secret, { expiresIn: '30d' });
}
