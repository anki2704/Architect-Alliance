import { Response } from 'express';
import { EnquiryMessage } from '../models/EnquiryMessage';
import { AuthedRequest } from '../middleware/auth';

export async function listMessages(_req: AuthedRequest, res: Response) {
  const messages = await EnquiryMessage.find().sort({ createdAt: -1 });
  res.json(messages.map((m) => m.toJSON()));
}

export async function createMessage(req: AuthedRequest, res: Response) {
  try {
    const { name, email, contact , subject, message } = req.body;
    if (!name?.trim() || !email?.trim() || !message?.trim()) {
      return res.status(400).json({ error: 'Name, email, and message are required.' });
    }
    // Contact validation
    if (contact && !/^[0-9+\-\s]{7,20}$/.test(contact.trim())) {
      return res.status(400).json({ error: 'Invalid contact number' });
    }
    const created = await EnquiryMessage.create({ name, email, contact, subject, message });
    res.status(201).json(created.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not send message', details: (err as Error).message });
  }
}
