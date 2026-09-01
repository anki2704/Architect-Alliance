import { Response } from 'express';
import { TeamMember } from '../models/TeamMember';
import { AuthedRequest } from '../middleware/auth';

export async function listTeamMembers(_req: AuthedRequest, res: Response) {
  const members = await TeamMember.find().sort({ order: 1, createdAt: 1 });
  res.json(members.map((m) => m.toJSON()));
}

export async function createTeamMember(req: AuthedRequest, res: Response) {
  try {
    const member = await TeamMember.create(req.body);
    res.status(201).json(member.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not create team member', details: (err as Error).message });
  }
}

export async function updateTeamMember(req: AuthedRequest, res: Response) {
  const member = await TeamMember.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!member) return res.status(404).json({ error: 'Team member not found' });
  res.json(member.toJSON());
}

export async function deleteTeamMember(req: AuthedRequest, res: Response) {
  const member = await TeamMember.findByIdAndDelete(req.params.id);
  if (!member) return res.status(404).json({ error: 'Team member not found' });
  res.status(204).send();
}
