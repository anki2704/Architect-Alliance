import { Response } from 'express';
import { JournalPost } from '../models/JournalPost';
import { AuthedRequest } from '../middleware/auth';

export async function listJournalPosts(_req: AuthedRequest, res: Response) {
  const posts = await JournalPost.find().sort({ createdAt: -1 });
  res.json(posts.map((p) => p.toJSON()));
}

export async function getJournalPost(req: AuthedRequest, res: Response) {
  const post = await JournalPost.findById(req.params.id);
  if (!post) return res.status(404).json({ error: 'Article not found' });
  res.json(post.toJSON());
}

export async function createJournalPost(req: AuthedRequest, res: Response) {
  try {
    const post = await JournalPost.create(req.body);
    res.status(201).json(post.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not create article', details: (err as Error).message });
  }
}

export async function updateJournalPost(req: AuthedRequest, res: Response) {
  const post = await JournalPost.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!post) return res.status(404).json({ error: 'Article not found' });
  res.json(post.toJSON());
}

export async function deleteJournalPost(req: AuthedRequest, res: Response) {
  const post = await JournalPost.findByIdAndDelete(req.params.id);
  if (!post) return res.status(404).json({ error: 'Article not found' });
  res.status(204).send();
}
