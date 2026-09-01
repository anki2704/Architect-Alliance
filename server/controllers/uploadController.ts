import { Response } from 'express';
import fs from 'fs';
import path from 'path';
import { AuthedRequest } from '../middleware/auth';

const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads folder exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

/**
 * POST /api/upload
 * Accepts JSON body: { image: "data:image/png;base64,...." , filename?: string }
 * Saves the file under public/uploads and returns { url: "/uploads/xxx.ext" }
 */
export async function uploadImage(req: AuthedRequest, res: Response) {
  try {
    const { image, filename } = req.body as { image?: string; filename?: string };

    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Image data is required (base64 data URL).' });
    }

    // Expect a data URL: data:image/jpeg;base64,/9j/4AAQ...
    const match = image.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
    if (!match) {
      return res.status(400).json({ error: 'Invalid image format. Send a base64 data URL.' });
    }

    const mimeType = match[1];
    const base64Data = match[2];

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

    const buffer = Buffer.from(base64Data, 'base64');

    // Limit ~8 MB
    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({ error: 'Image is too large. Maximum size is 8 MB.' });
    }

    fs.writeFileSync(filePath, buffer);

    const url = `/uploads/${uniqueName}`;
    res.status(201).json({ url });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ error: 'Could not save image.', details: (err as Error).message });
  }
}
