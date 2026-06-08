import { randomUUID } from 'crypto';
import { Todo, CreateTodoInput, UpdateTodoInput } from '../models/todo';

export interface TodoRepository {
  list(): Todo[];
  get(id: string): Todo | undefined;
  create(input: CreateTodoInput): Todo;
  update(id: string, input: UpdateTodoInput): Todo | undefined;
  delete(id: string): boolean;
}

/**
 * Default in-memory implementation. Swap this for a database-backed
 * implementation later without changing the routes.
 */
export class InMemoryTodoRepository implements TodoRepository {
  private todos = new Map<string, Todo>();

  list(): Todo[] {
    return Array.from(this.todos.values());
  }

  get(id: string): Todo | undefined {
    return this.todos.get(id);
  }

  create(input: CreateTodoInput): Todo {
    const todo: Todo = {
      id: randomUUID(),
      title: input.title,
      completed: input.completed ?? false,
    };
    this.todos.set(todo.id, todo);
    return todo;
  }

  update(id: string, input: UpdateTodoInput): Todo | undefined {
    const existing = this.todos.get(id);
    if (!existing) return undefined;
    const updated: Todo = {
      ...existing,
      ...(input.title !== undefined ? { title: input.title } : {}),
      ...(input.completed !== undefined ? { completed: input.completed } : {}),
    };
    this.todos.set(id, updated);
    return updated;
  }

  delete(id: string): boolean {
    return this.todos.delete(id);
  }
}
