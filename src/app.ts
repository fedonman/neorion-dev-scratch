import express, { Application, Request, Response } from 'express';
import { InMemoryTodoRepository } from './repositories/todoRepository';
import { createTodosRouter } from './routes/todos';

export function createApp(): Application {
  const app = express();
  app.use(express.json());

  app.get('/health', (_req: Request, res: Response) => {
    res.status(200).json({ status: 'ok' });
  });

  const repo = new InMemoryTodoRepository();
  app.use('/todos', createTodosRouter(repo));

  return app;
}
