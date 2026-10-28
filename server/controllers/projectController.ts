import { Response } from 'express';
import { Project, ProjectCategory } from '../models/Project';
import { AuthedRequest } from '../middleware/auth';
import { invalidatePublicCache } from '../middleware/cache';

const CATEGORIES: ProjectCategory[] = ['residential', 'commercial', 'institutional', 'interior', 'sustainable'];

// Only these fields may be written through create/update. Anything else in the request body
// (including `published`, which has its own endpoint) is ignored, so nobody can sneak in
// extra fields or MongoDB operators like {"$set": ...}.
const EDITABLE_FIELDS = [
  'title',
  'category',
  'description',
  'imageUrl',
  'client',
  'year',
  'location',
  'country',
  'typology',
  'areaSqFt',
  'areaM2',
  'status',
  'features',
  'imageGallery',
  'narrativeParagraphs',
  'quote',
  'diagrams',
  'credits',
  'coordinates'
] as const;

function pickEditable(body: unknown): Record<string, unknown> {
  const src = body && typeof body === 'object' ? (body as Record<string, unknown>) : {};
  const out: Record<string, unknown> = {};
  for (const key of EDITABLE_FIELDS) {
    if (src[key] !== undefined) out[key] = src[key];
  }
  return out;
}

const isStaff = (req: AuthedRequest) => req.user?.role === 'admin' || req.user?.role === 'designer';

/** Legacy projects have no `published` value and count as live. */
function serialize(project: InstanceType<typeof Project>) {
  return { ...project.toJSON(), published: project.published !== false };
}

export async function listProjects(req: AuthedRequest, res: Response) {
  const { category } = req.query;
  const filter: Record<string, unknown> = {};
  // `category` must be a plain known string; this blocks query-operator injection like ?category[$ne]=x
  if (typeof category === 'string' && (CATEGORIES as string[]).includes(category)) filter.category = category;

  // Drafts are visible only to signed-in staff who explicitly ask for them (?all=1, used by the dashboard).
  // The public website never sends ?all=1, so even a logged-in admin browsing the site sees live projects only.
  const wantsAll = req.query.all === '1' && isStaff(req);
  if (!wantsAll) filter.published = { $ne: false };

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.json(projects.map(serialize));
}

export async function getProject(req: AuthedRequest, res: Response) {
  const project = await Project.findById(req.params.id);
  // A draft looks exactly like a missing project to the public.
  if (!project || (project.published === false && !isStaff(req))) {
    return res.status(404).json({ error: 'Project not found' });
  }
  res.json(serialize(project));
}

export async function createProject(req: AuthedRequest, res: Response) {
  try {
    // New projects always start as drafts; publishing is a separate, deliberate action.
    const project = await Project.create({ ...pickEditable(req.body), published: false });
    invalidatePublicCache('/api/projects');
    res.status(201).json(serialize(project));
  } catch (err) {
    console.error('[Projects] create failed', err);
    res.status(400).json({ error: 'Could not create project' });
  }
}

export async function updateProject(req: AuthedRequest, res: Response) {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: pickEditable(req.body) }, {
      new: true,
      runValidators: true
    });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    invalidatePublicCache('/api/projects');
    res.json(serialize(project));
  } catch (err) {
    console.error('[Projects] update failed', err);
    res.status(400).json({ error: 'Could not update project' });
  }
}

/** PATCH /api/projects/:id/publish   body: { "published": true | false } */
export async function setProjectPublished(req: AuthedRequest, res: Response) {
  const published = (req.body as { published?: unknown } | undefined)?.published;
  if (typeof published !== 'boolean') {
    return res.status(400).json({ error: '"published" must be true or false' });
  }
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, { $set: { published } }, { new: true });
    if (!project) return res.status(404).json({ error: 'Project not found' });
    invalidatePublicCache('/api/projects');
    res.json(serialize(project));
  } catch (err) {
    console.error('[Projects] publish toggle failed', err);
    res.status(400).json({ error: 'Could not change publish status' });
  }
}

export async function deleteProject(req: AuthedRequest, res: Response) {
  const project = await Project.findByIdAndDelete(req.params.id);
  if (!project) return res.status(404).json({ error: 'Project not found' });
  invalidatePublicCache('/api/projects');
  res.status(204).send();
}
