import { Response } from 'express';
import { Project } from '../models/Project';
import { AuthedRequest } from '../middleware/auth';

export async function listProjects(req: AuthedRequest, res: Response) {
  const { category } = req.query;
  const filter: Record<string, unknown> = {};
  if (category && category !== 'all') filter.category = category;
  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.json(projects.map((p) => p.toJSON()));
}

export async function getProject(req: AuthedRequest, res: Response) {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.json(project.toJSON());
}

export async function createProject(req: AuthedRequest, res: Response) {
  try {
    const project = await Project.create(req.body);
    res.status(201).json(project.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not create project', details: (err as Error).message });
  }
}

export async function updateProject(req: AuthedRequest, res: Response) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    res.json(project.toJSON());
  } catch (err) {
    res.status(400).json({ error: 'Could not update project', details: (err as Error).message });
  }
}

export async function deleteProject(req: AuthedRequest, res: Response) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  res.status(204).send();
}
