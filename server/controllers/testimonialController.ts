import { Response } from 'express';
import { Testimonial } from '../models/Testimonial';
import { AuthedRequest } from '../middleware/auth';

export async function listTestimonials(_req: AuthedRequest, res: Response) {
  const testimonials = await Testimonial.find({
    $or: [{ approved: true }, { approved: { $exists: false } }]
  })
    .sort({ createdAt: -1 })
    .limit(50);
  res.json(testimonials.map((t) => t.toJSON()));
}

export async function listAdminTestimonials(_req: AuthedRequest, res: Response) {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 }).limit(200);
  res.json(testimonials.map((t) => t.toJSON()));
}

export async function createTestimonial(req: AuthedRequest, res: Response) {
  try {
    const body = req.body || {};
    const quote = typeof body.quote === 'string' ? body.quote.trim().slice(0, 2000) : '';
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 100) : '';
    const role = typeof body.role === 'string' ? body.role.trim().slice(0, 100) : 'Client';
    const rating = Number(body.rating);

    if (!quote || !name) {
      return res.status(400).json({ error: 'Name and feedback are required.' });
    }
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be an integer from 1 to 5.' });
    }

    const testimonial = await Testimonial.create({
      quote,
      name,
      role: role || 'Client',
      avatar: typeof body.avatar === 'string' ? body.avatar.slice(0, 500) : undefined,
      rating,
      // Public submissions stay hidden until an admin approves them.
      approved: false
    });

    res.status(201).json(testimonial.toJSON());
  } catch (err) {
    console.error('[Testimonials] Create failed', err);
    res.status(400).json({ error: 'Could not create testimonial.' });
  }
}

export async function updateTestimonial(req: AuthedRequest, res: Response) {
  const body = req.body || {};
  const allowed: Record<string, unknown> = {};

  if (typeof body.quote === 'string') allowed.quote = body.quote.trim().slice(0, 2000);
  if (typeof body.name === 'string') allowed.name = body.name.trim().slice(0, 100);
  if (typeof body.role === 'string') allowed.role = body.role.trim().slice(0, 100);
  if (typeof body.avatar === 'string') allowed.avatar = body.avatar.trim().slice(0, 500);
  if (body.rating !== undefined) {
    const rating = Number(body.rating);
    if (Number.isInteger(rating) && rating >= 1 && rating <= 5) {
      allowed.rating = rating;
    }
  }
  if (typeof body.approved === 'boolean') allowed.approved = body.approved;

  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, allowed, {
    new: true,
    runValidators: true
  });
  if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
  res.json(testimonial.toJSON());
}

export async function deleteTestimonial(req: AuthedRequest, res: Response) {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
  res.status(204).send();
}
