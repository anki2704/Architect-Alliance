import { Response } from 'express';
import { Booking } from '../models/Booking';
import { AuthedRequest } from '../middleware/auth';
import { isValidEmail, isValidPhone, cleanString } from '../utils/validation';

// GET /api/bookings — role-aware: admins see everything, designers see only
// bookings assigned to them, customers see only their own bookings.
export async function listBookings(req: AuthedRequest, res: Response) {
  const user = req.user!;
  let filter: Record<string, unknown> = {};

  if (user.role === 'admin') {
    // admins may optionally filter by query params
    const { customerId, designerId } = req.query;
    if (customerId) filter.customerId = customerId;
    if (designerId) filter.assignedDesignerId = designerId;
  } else if (user.role === 'designer') {
    filter = { assignedDesignerId: user.id };
  } else {
    filter = { customerId: user.id };
  }

  const bookings = await Booking.find(filter).sort({ createdAt: -1 }).limit(100);
  res.json(bookings.map((b) => b.toJSON()));
}

// POST /api/bookings — open to guests; if the request is authenticated the
// booking is automatically linked to that account.
export async function createBooking(req: AuthedRequest, res: Response) {
  try {
    const body = req.body || {};
    const customerName = cleanString(body.customerName || req.user?.name, 100);
    const email = String(body.email || req.user?.email || '').trim().toLowerCase();
    const phone = cleanString(body.phone, 20);
    const projectType = cleanString(body.projectType, 150);
    const date = cleanString(body.date, 50);
    const time = cleanString(body.time, 50);
    const notes = cleanString(body.notes, 3000);

    if (!customerName || !email || !projectType || !date || !time) {
      return res.status(400).json({ error: 'Name, email, project type, date, and time are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (phone && !isValidPhone(phone)) {
      return res.status(400).json({ error: 'Invalid contact number.' });
    }

    const booking = await Booking.create({
      customerId: req.user?.id || null,
      customerName,
      email,
      phone: phone || undefined,
      projectType,
      date,
      time,
      notes: notes || undefined,
      // The public booking form does not process payments. Never trust a
      // client-supplied amount/status to mark a booking as paid.
      paymentAmount: 0,
      paymentStatus: 'Not Required'
    });
    res.status(201).json(booking.toJSON());
  } catch (err) {
    console.error('[Booking] Create failed', err);
    res.status(400).json({ error: 'Could not create booking.' });
  }
}

// PATCH /api/bookings/:id — admins can update status + assignment; a designer
// may only update the status of a booking assigned to them.
export async function updateBooking(req: AuthedRequest, res: Response) {
  const user = req.user!;
  const booking = await Booking.findById(req.params.id);
  if (!booking) return res.status(404).json({ error: 'Booking not found' });

  if (user.role === 'customer') {
    return res.status(403).json({ error: 'Customers cannot modify bookings' });
  }
  if (user.role === 'designer') {
    if (!booking.assignedDesignerId || booking.assignedDesignerId.toString() !== user.id) {
      return res.status(403).json({ error: 'You can only update bookings assigned to you' });
    }
    if (req.body.assignedDesignerId !== undefined) {
      return res.status(403).json({ error: 'Only admins can reassign bookings' });
    }
  }

  const allowedFields = user.role === 'admin' ? ['status', 'assignedDesignerId', 'paymentStatus'] : ['status'];
  for (const field of allowedFields) {
    if (req.body[field] !== undefined) (booking as any)[field] = req.body[field];
  }

  await booking.save();
  res.json(booking.toJSON());
}
