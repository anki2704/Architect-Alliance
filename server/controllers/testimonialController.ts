import { Response } from 'express';
import { Testimonial } from '../models/Testimonial';
import { AuthedRequest } from '../middleware/auth';

export async function listTestimonials(_req: AuthedRequest, res: Response) {
  const testimonials = await Testimonial.find().sort({ createdAt: -1 });
  res.json(testimonials.map((t) => t.toJSON()));
}

export async function createTestimonial(req: AuthedRequest, res: Response) {
  try {
    const testimonial = await Testimonial.create(req.body);
    res.status(201).json(testimonial.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not create testimonial', details: (err as Error).message });
  }
}

export async function updateTestimonial(req: AuthedRequest, res: Response) {
  const testimonial = await Testimonial.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
  res.json(testimonial.toJSON());
}

export async function deleteTestimonial(req: AuthedRequest, res: Response) {
  const testimonial = await Testimonial.findByIdAndDelete(req.params.id);
  if (!testimonial) return res.status(404).json({ error: 'Testimonial not found' });
  res.status(204).send();
}
