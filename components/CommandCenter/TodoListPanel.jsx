'use client';

import { useState, useTransition, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { todoSchema } from '@/lib/validation/todo.schema';
import {
  createTodoAction,
  deleteTodoAction,
  toggleTodoAction,
  updateTodoAction,
  reorderTodosAction,
} from '@/app/actions/todos';

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

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  function onRename(id, newText) {
    if (!newText.trim()) return;
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, text: newText } : t)));
    const formData = new FormData();
    formData.append('id', id);
    formData.append('text', newText.trim());
    startTransition(async () => {
      const result = await updateTodoAction(formData);
      if (!result?.ok) toast.error(result?.error ?? 'Failed to rename.');
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

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setTodos((prev) => {
      const active_todo = prev.find((t) => t.id === active.id);
      const over_todo = prev.find((t) => t.id === over.id);
      if (active_todo?.is_done !== over_todo?.is_done) return prev;
      const oldIndex = prev.findIndex((t) => t.id === active.id);
      const newIndex = prev.findIndex((t) => t.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderTodosAction(next.filter((t) => !t.is_done).map((t) => t.id)).catch(() => {});
      return next;
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
          className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent w-full rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
        />
        {errors.text && (
          <p className="text-danger text-[0.65rem]" role="alert">
            {errors.text.message}
          </p>
        )}
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-accent hover:bg-accent/90 w-full rounded py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add todo
        </button>
      </form>

      {todos.length === 0 ? (
        <p className="text-text-subtle text-xs">No todos.</p>
      ) : (
        <>
          {active.length > 0 && (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={active.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <ul className="space-y-1.5" role="list">
                  {active.map((todo) => (
                    <SortableTodoRow
                      key={todo.id}
                      todo={todo}
                      onToggle={onToggle}
                      onDelete={onDelete}
                      onRename={onRename}
                    />
                  ))}
                </ul>
              </SortableContext>
            </DndContext>
          )}
          {done.length > 0 && (
            <details className="text-text-subtle">
              <summary className="cursor-pointer text-[0.65rem] tracking-wider uppercase">
                Done ({done.length})
              </summary>
              <ul className="mt-2 space-y-1.5" role="list">
                {done.map((todo) => (
                  <TodoRow
                    key={todo.id}
                    todo={todo}
                    onToggle={onToggle}
                    onDelete={onDelete}
                    onRename={onRename}
                  />
                ))}
              </ul>
            </details>
          )}
        </>
      )}
    </div>
  );
}

function SortableTodoRow({ todo, onToggle, onDelete, onRename }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: todo.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style}>
      <TodoRow
        todo={todo}
        onToggle={onToggle}
        onDelete={onDelete}
        onRename={onRename}
        dragHandleProps={{ ...attributes, ...listeners }}
      />
    </li>
  );
}

function TodoRow({ todo, onToggle, onDelete, onRename, dragHandleProps }) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(todo.text);
  const inputRef = useRef(null);

  function startEdit() {
    setEditing(true);
    setEditValue(todo.text);
    setTimeout(() => inputRef.current?.focus(), 0);
  }

  function commitEdit() {
    setEditing(false);
    if (editValue.trim() && editValue !== todo.text) {
      onRename(todo.id, editValue.trim());
    }
  }

  return (
    <div className="group flex items-start gap-2">
      {dragHandleProps && (
        <button
          {...dragHandleProps}
          type="button"
          aria-label="Drag to reorder"
          className="text-text-subtle mt-0.5 cursor-grab opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
        >
          <GripIcon size={12} />
        </button>
      )}
      <input
        type="checkbox"
        checked={todo.is_done}
        onChange={() => onToggle(todo.id, todo.is_done)}
        aria-label={todo.text}
        className="border-border accent-accent mt-0.5 shrink-0"
      />
      {editing ? (
        <input
          ref={inputRef}
          type="text"
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitEdit}
          onKeyDown={(e) => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') {
              setEditing(false);
              setEditValue(todo.text);
            }
          }}
          className="border-border bg-subtle text-text focus:border-accent flex-1 rounded border px-1 py-0.5 text-xs outline-none focus:ring-1"
        />
      ) : (
        <span
          onDoubleClick={startEdit}
          className={`flex-1 cursor-text text-xs ${
            todo.is_done ? 'text-text-subtle line-through' : 'text-text-muted'
          }`}
          title="Double-click to rename"
        >
          {todo.text}
        </span>
      )}
      <button
        type="button"
        onClick={() => onDelete(todo.id, todo.text)}
        aria-label={`Delete ${todo.text}`}
        className="text-text-subtle hover:text-danger mt-0.5 shrink-0 text-sm leading-none opacity-0 transition-all group-hover:opacity-100"
      >
        ×
      </button>
    </div>
  );
}

function GripIcon({ size = 12 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="9" cy="7" r="1.5" />
      <circle cx="15" cy="7" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="17" r="1.5" />
      <circle cx="15" cy="17" r="1.5" />
    </svg>
  );
}
