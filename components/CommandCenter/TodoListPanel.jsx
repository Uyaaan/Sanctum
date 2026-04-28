'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { todoSchema } from '@/lib/validation/todo.schema';
import { createTodoAction, deleteTodoAction, toggleTodoAction } from '@/app/actions/todos';

export function TodoListPanel({ initialTodos }) {
  const [todos, setTodos] = useState(initialTodos);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(todoSchema),
    defaultValues: { text: '' },
  });

  function onAdd(data) {
    const formData = new FormData();
    formData.append('text', data.text);

    startTransition(async () => {
      const result = await createTodoAction(formData);
      if (result?.ok) {
        setTodos((prev) => [
          ...prev,
          {
            id: `tmp-${Date.now()}`,
            text: data.text,
            is_done: false,
            done_at: null,
            sort_order: 999,
          },
        ]);
        reset();
      } else {
        toast.error(result?.error ?? 'Failed to add.');
      }
    });
  }

  function onToggle(id, currentIsDone) {
    const next = !currentIsDone;
    setTodos((prev) =>
      prev.map((t) =>
        t.id === id ? { ...t, is_done: next, done_at: next ? new Date().toISOString() : null } : t,
      ),
    );

    const formData = new FormData();
    formData.append('id', id);
    formData.append('is_done', String(next));

    startTransition(async () => {
      const result = await toggleTodoAction(formData);
      if (!result?.ok) {
        toast.error(result?.error ?? 'Failed.');
        // Revert
        setTodos((prev) =>
          prev.map((t) =>
            t.id === id
              ? { ...t, is_done: currentIsDone, done_at: currentIsDone ? t.done_at : null }
              : t,
          ),
        );
      }
    });
  }

  function onDelete(id, text) {
    if (!window.confirm(`Delete "${text}"?`)) return;
    const formData = new FormData();
    formData.append('id', id);
    startTransition(async () => {
      const result = await deleteTodoAction(formData);
      if (result?.ok) {
        setTodos((prev) => prev.filter((t) => t.id !== id));
      } else {
        toast.error(result?.error ?? 'Failed.');
      }
    });
  }

  const active = todos.filter((t) => !t.is_done);
  const done = todos.filter((t) => t.is_done);

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit(onAdd)} className="space-y-1.5" noValidate>
        <input
          type="text"
          {...register('text')}
          placeholder="What needs doing?"
          className="border-border bg-background text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
        />
        {errors.text && (
          <p className="text-crimson text-[0.65rem]" role="alert">
            {errors.text.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-amber text-background hover:bg-amber/90 w-full rounded py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add todo
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="text-text-subtle text-xs">No todos.</p>
      ) : (
        <>
          {active.length > 0 && (
            <ul className="space-y-1.5" role="list">
              {active.map((todo) => (
                <TodoRow key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </ul>
          )}
          {done.length > 0 && (
            <details className="text-text-subtle">
              <summary className="cursor-pointer text-[0.65rem] tracking-wider uppercase">
                Done ({done.length})
              </summary>
              <ul className="mt-2 space-y-1.5" role="list">
                {done.map((todo) => (
                  <TodoRow key={todo.id} todo={todo} onToggle={onToggle} onDelete={onDelete} />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function TodoRow({ todo, onToggle, onDelete }) {
  return (
    <li className="group flex items-start gap-2">
      <input
        type="checkbox"
        checked={todo.is_done}
        onChange={() => onToggle(todo.id, todo.is_done)}
        aria-label={todo.text}
        className="border-border accent-amber mt-0.5 shrink-0"
      />
      <span
        className={`flex-1 text-xs ${
          todo.is_done ? 'text-text-subtle line-through' : 'text-text-muted'
        }`}
      >
        {todo.text}
      </span>
      <button
        type="button"
        onClick={() => onDelete(todo.id, todo.text)}
        aria-label={`Delete ${todo.text}`}
        className="text-text-subtle hover:text-crimson shrink-0 text-sm leading-none opacity-40 transition-all group-hover:opacity-100"
      >
        ×
      </button>
    </li>
  );
}
