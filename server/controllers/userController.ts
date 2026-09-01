import { Response } from 'express';
import { User } from '../models/User';
import { AuthedRequest } from '../middleware/auth';

// GET /api/users — admin only. Supports ?role=designer to narrow the list
// (used by the dashboard to populate the "assign architect" dropdown).
export async function listUsers(req: AuthedRequest, res: Response) {
  const { role } = req.query;
  const filter: Record<string, unknown> = {};
  if (role) filter.role = role;
  const users = await User.find(filter).sort({ name: 1 });
  res.json(users.map((u) => u.toJSON()));
}

// POST /api/users — admin only. Creates a designer account directly (no
// public signup route exists for this role). Kept separate from
// authController.register, which always creates 'customer' accounts.
export async function createDesigner(req: AuthedRequest, res: Response) {
  try {
    const { name, email, password } = req.body;
    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ error: 'An account with that email already exists.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: 'designer'
    });

    res.status(201).json(user.toJSON());
  } catch (err) {
    res.status(500).json({ error: 'Could not create designer account.', details: (err as Error).message });
  }
}

// DELETE /api/users/:id — admin only. Restricted to removing designer
// accounts only, so this endpoint can't be used to delete admins or
// customers by mistake (or via a compromised admin session).
export async function deleteDesigner(req: AuthedRequest, res: Response) {
  try {
    const target = await User.findById(req.params.id);
    if (!target) {
      return res.status(404).json({ error: 'User not found.' });
    }
    if (target.role !== 'designer') {
      return res.status(403).json({ error: 'Only designer accounts can be removed from this panel.' });
    }
    await target.deleteOne();
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Could not remove designer account.', details: (err as Error).message });
  }
}
