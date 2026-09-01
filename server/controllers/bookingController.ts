import { Response } from 'express';
import { Booking } from '../models/Booking';
import { AuthedRequest } from '../middleware/auth';

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

  const bookings = await Booking.find(filter).sort({ createdAt: -1 });
  res.json(bookings.map((b) => b.toJSON()));
}

// POST /api/bookings — open to guests; if the request is authenticated the
// booking is automatically linked to that account.
export async function createBooking(req: AuthedRequest, res: Response) {
  try {
    const payload = { ...req.body };
    if (req.user) {
      payload.customerId = req.user.id;
      payload.customerName = payload.customerName || req.user.name;
      payload.email = payload.email || req.user.email;
    }
    payload.paymentStatus = payload.paymentAmount > 0 ? 'Paid' : 'Not Required';
    delete payload.status;
    delete payload.assignedDesignerId;

    const booking = await Booking.create(payload);
    res.status(201).json(booking.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not create booking', details: (err as Error).message });
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
