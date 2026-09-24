import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AuthedRequest } from '../middleware/auth';

/**
 * Upload image directly to Cloudinary.
 *
 * Required environment variables:
 * CLOUDINARY_CLOUD_NAME
 * CLOUDINARY_UPLOAD_PRESET
 *
 * The upload preset must be UNSIGNED.
 */
async function uploadToCloudinary(
  dataUrl: string,
  filename?: string
): Promise<string> {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const preset = process.env.CLOUDINARY_UPLOAD_PRESET;

  if (!cloud) {
    throw new Error('CLOUDINARY_CLOUD_NAME is not configured on the server.');
  }

  if (!preset) {
    throw new Error('CLOUDINARY_UPLOAD_PRESET is not configured on the server.');
  }

  const body = new URLSearchParams();
  body.set('file', dataUrl);
  body.set('upload_preset', preset);

  // IMPORTANT: make every Cloudinary public_id unique.
  // Using only the original filename can overwrite an older image when
  // multiple uploads use the same filename (for example image.jpg).
  if (filename) {
    const safeFilename = filename
      .replace(/\.[^/.]+$/, '')
      .replace(/[^a-zA-Z0-9-_]/g, '_')
      .slice(0, 80);

    if (safeFilename) {
      const uniqueId = `${Date.now()}-${randomUUID().slice(0, 8)}`;
      body.set('public_id', `${safeFilename}-${uniqueId}`);
    }
  }

  const cloudinaryUrl =
    `https://api.cloudinary.com/v1_1/${cloud}/image/upload`;

  const response = await fetch(cloudinaryUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    console.error('Cloudinary upload failed:', result);

    throw new Error(
      result?.error?.message ||
      `Cloudinary upload failed with status ${response.status}`
    );
  }

  if (!result?.secure_url) {
    console.error('Cloudinary response missing secure_url:', result);

    throw new Error('Cloudinary did not return a secure image URL.');
  }

  return result.secure_url;
}

/**
 * POST /api/upload
 *
 * Body:
 * {
 *   image: "data:image/jpeg;base64,...",
 *   filename?: "project-image.jpg"
 * }
 */
export async function uploadImage(
  req: AuthedRequest,
  res: Response
) {
  try {
    const { image, filename } = req.body as {
      image?: string;
      filename?: string;
    };

    if (!image || typeof image !== 'string') {
      return res.status(400).json({
        error: 'Image data is required (base64 data URL).'
      });
    }

    const match = image.match(/^data:(image\/(?:jpeg|png|webp));base64,(.+)$/i);

    if (!match) {
      return res.status(400).json({
        error: 'Only JPEG, PNG, and WebP images are allowed.'
      });
    }

    const base64Data = match[2];
    const buffer = Buffer.from(base64Data, 'base64');

    // Maximum 8 MB
    if (buffer.length > 8 * 1024 * 1024) {
      return res.status(400).json({
        error: 'Image is too large. Maximum size is 8 MB.'
      });
    }

    /**
     * Cloudinary is mandatory.
     *
     * We intentionally do NOT save the image to Render's local
     * public/uploads folder because Render's local filesystem is
     * not persistent across restarts/redeploys.
     */
    const cloudinaryUrl = await uploadToCloudinary(
      image,
      filename
    );

    console.log(
      '[Cloudinary] Image uploaded successfully:',
      cloudinaryUrl
    );

    return res.status(201).json({
      url: cloudinaryUrl
    });
  } catch (err) {
    console.error('[Upload] Error:', err);

    return res.status(500).json({
      error: 'Could not upload image to Cloudinary.'
    });
  }
}
