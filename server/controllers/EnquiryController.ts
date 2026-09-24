import { Response } from 'express';
import { EnquiryMessage } from '../models/EnquiryMessage';
import { AuthedRequest } from '../middleware/auth';
import { cleanString, isValidEmail, isValidPhone } from '../utils/validation';

export async function listMessages(_req: AuthedRequest, res: Response) {
  const messages = await EnquiryMessage.find().sort({ createdAt: -1 }).limit(200);
  res.json(messages.map((m) => m.toJSON()));
}

export async function createMessage(req: AuthedRequest, res: Response) {
  try {
    const name = cleanString(req.body?.name, 100);
    const email = cleanString(req.body?.email, 254).toLowerCase();
    const contact = cleanString(req.body?.contact, 20);
    const subject = cleanString(req.body?.subject, 200);
    const message = cleanString(req.body?.message, 5000);

    if (!name || !email || !contact || !message) {
      return res.status(400).json({ error: 'Name, email, contact number, and message are required.' });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Please provide a valid email address.' });
    }
    if (!isValidPhone(contact)) {
      return res.status(400).json({ error: 'Invalid contact number.' });
    }

    const created = await EnquiryMessage.create({ name, email, contact, subject: subject || undefined, message });
    res.status(201).json(created.toJSON());
  } catch (err) {
    console.error('[Enquiry] Create failed', err);
    res.status(400).json({ error: 'Could not send message.' });
  }
}
