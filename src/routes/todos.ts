import { Router, Request, Response } from 'express';
import { TodoRepository } from '../repositories/todoRepository';

export function createTodosRouter(repo: TodoRepository): Router {
  const router = Router();

  router.get('/', (_req: Request, res: Response) => {
    res.json(repo.list());
  });

  router.get('/:id', (req: Request, res: Response) => {
    const todo = repo.get(req.params.id);
    if (!todo) return res.status(404).json({ error: 'Todo not found' });
    return res.json(todo);
  });

  router.post('/', (req: Request, res: Response) => {
    const { title, completed } = req.body ?? {};
    if (typeof title !== 'string' || title.trim() === '') {
      return res.status(400).json({ error: 'title is required' });
    }
    const todo = repo.create({ title, completed: Boolean(completed) });
    return res.status(201).json(todo);
  });

  router.put('/:id', (req: Request, res: Response) => {
    const { title, completed } = req.body ?? {};
    const updated = repo.update(req.params.id, { title, completed });
    if (!updated) return res.status(404).json({ error: 'Todo not found' });
    return res.json(updated);
  });

  router.delete('/:id', (req: Request, res: Response) => {
    const deleted = repo.delete(req.params.id);
    if (!deleted) return res.status(404).json({ error: 'Todo not found' });
    return res.status(204).send();
  });

  return router;
}
