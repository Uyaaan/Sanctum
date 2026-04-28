'use server';

import { revalidatePath } from 'next/cache';
import * as yup from 'yup';
import { requireUser } from '@/lib/auth/guards';
import { createTodo, deleteTodo, toggleTodo, updateTodo, reorderTodos } from '@/lib/db/todos';
import { todoIdSchema, todoSchema } from '@/lib/validation/todo.schema';

const orderedIdsSchema = yup.array().of(yup.string().uuid().required()).min(1).required();

export async function createTodoAction(formData) {
  const user = await requireUser();
  const raw = { text: formData.get('text') ?? '' };

  let validated;
  try {
    validated = await todoSchema.validate(raw, { stripUnknown: true });
  } catch (err) {
    return { ok: false, error: err.message ?? 'Invalid input' };
  }

  try {
    await createTodo({ userId: user.id, text: validated.text });
  } catch {
    return { ok: false, error: 'Failed to add todo.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function updateTodoAction(formData) {
  const user = await requireUser();
  const id = formData.get('id') ?? '';
  const raw = { text: formData.get('text') ?? '' };

  try {
    todoIdSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

  let validated;
  try {
    validated = await todoSchema.validate(raw, { stripUnknown: true });
  } catch (err) {
    return { ok: false, error: err.message ?? 'Invalid input' };
  }

  try {
    await updateTodo({ userId: user.id, id, text: validated.text });
  } catch {
    return { ok: false, error: 'Failed to update todo.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function toggleTodoAction(formData) {
  const user = await requireUser();
  const id = formData.get('id');
  const isDone = formData.get('is_done') === 'true';

  try {
    todoIdSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

  try {
    await toggleTodo({ userId: user.id, id, isDone });
  } catch {
    return { ok: false, error: 'Failed to update todo.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function deleteTodoAction(formData) {
  const user = await requireUser();
  const id = formData.get('id');

  try {
    todoIdSchema.validateSync(id);
  } catch {
    return { ok: false, error: 'Invalid id' };
  }

  try {
    await deleteTodo({ userId: user.id, id });
  } catch {
    return { ok: false, error: 'Failed to delete todo.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}

export async function reorderTodosAction(orderedIds) {
  const user = await requireUser();

  try {
    orderedIdsSchema.validateSync(orderedIds);
  } catch {
    return { ok: false, error: 'Invalid order' };
  }

  try {
    await reorderTodos({ userId: user.id, orderedIds });
  } catch {
    return { ok: false, error: 'Failed to reorder.' };
  }

  revalidatePath('/dashboard');
  return { ok: true };
}
