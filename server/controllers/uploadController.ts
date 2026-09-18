import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthedRequest } from '../middleware/auth';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * Build a public absolute URL for an uploaded file.
 * Prefer PUBLIC_BASE_URL (e.g. https://your-api.onrender.com).
 * Falls back to request host so Vercel frontend can load images from Render.
 */
function publicUrl(req: AuthedRequest, relativePath: string): string {
  const base =
    (process.env.PUBLIC_BASE_URL || process.env.RENDER_EXTERNAL_URL || '').replace(/\/$/, '');
  if (base) return `${base}${relativePath}`;
  const proto = (req.headers['x-forwarded-proto'] as string) || req.protocol || 'https';
  const host = req.headers['x-forwarded-host'] || req.get('host');
  if (host) return `${proto}://${host}${relativePath}`;
  return relativePath;
}

/**
 * Optional Cloudinary upload (persistent — survives Render restarts).
 * Set CLOUDINARY_CLOUD_NAME + CLOUDINARY_UPLOAD_PRESET (unsigned preset).
 */
async function uploadToCloudinary(dataUrl: string, filename?: string): Promise<string | null> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;
  if (!cloud || !preset) return null;

  const body = new URLSearchParams();
  body.set('file', dataUrl);
  body.set('upload_preset', preset);
  if (filename) body.set('public_id', filename.replace(/[^a-zA-Z0-9-_]/g, '_').slice(0, 40));

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/image/upload`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body
  });
  if (!res.ok) {
    const err = await res.text();
    console.error('Cloudinary upload failed:', err);
    return null;
  }
  const data = (await res.json()) as { secure_url?: string };
  return data.secure_url || null;
}

/**
 * POST /api/upload
 * Body: { image: "data:image/...;base64,...", filename?: string }
 */
export async function uploadImage(req: AuthedRequest, res: Response) {
  try {
    const { image, filename } = req.body as { image?: string; filename?: string };

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required (base64 data URL).' });
    }

    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid image format. Send a base64 data URL.' });
    }

    const mimeType = match[1];
    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image is too large. Maximum size is 8 MB.' });
    }

    // Prefer Cloudinary when configured (files never disappear on Render restart)
    const cloudUrl = await uploadToCloudinary(image, filename);
    if (cloudUrl) {
      return res.status(201).json({ url: cloudUrl });
    }

    const extMap: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/webp': 'webp',
      'image/gif': 'gif',
      'image/svg+xml': 'svg'
    };
    const ext = extMap[mimeType] || 'jpg';

    const safeBase =
      (filename || 'project')
        .replace(/[^a-zA-Z0-9-_]/g, '_')
        .slice(0, 40) || 'project';
    const uniqueName = `${safeBase}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);

    fs.writeFileSync(filePath, buffer);

    const relative = `/uploads/${uniqueName}`;
    const url = publicUrl(req, relative);
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Could not save image.', details: (err as Error).message });
  }
}
