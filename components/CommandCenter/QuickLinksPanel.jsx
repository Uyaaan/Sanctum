'use client';

import { useState, useTransition } from 'react';
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
import { quickLinkSchema } from '@/lib/validation/quick-link.schema';
import {
  createQuickLinkAction,
  deleteQuickLinkAction,
  reorderQuickLinksAction,
} from '@/app/actions/quick-links';
import { QuickLinkEditDialog } from '@/components/QuickLinkEditDialog';

export function QuickLinksPanel({ initialLinks }) {
  const [links, setLinks] = useState(initialLinks);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: yupResolver(quickLinkSchema),
    defaultValues: { label: '', url: '' },
  });

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onAdd(data) {
    const formData = new FormData();
    formData.append('label', data.label);
    formData.append('url', data.url);

    startTransition(async () => {
      const result = await createQuickLinkAction(formData);
      if (result?.ok) {
        toast.success('Link saved.');
        setLinks((prev) => [
          ...prev,
          { id: `tmp-${Date.now()}`, label: data.label, url: data.url, sort_order: 999 },
        ]);
        reset();
      } else {
        toast.error(result?.error ?? 'Failed to save.');
      }
    });
  }

  function onDelete(id, label) {
    if (!window.confirm(`Delete "${label}"?`)) return;
    const formData = new FormData();
    formData.append('id', id);
    startTransition(async () => {
      const result = await deleteQuickLinkAction(formData);
      if (result?.ok) {
        toast.success('Link removed.');
        setLinks((prev) => prev.filter((l) => l.id !== id));
      } else {
        toast.error(result?.error ?? 'Failed to delete.');
      }
    });
  }

  function onUpdated(updated) {
    setLinks((prev) => prev.map((l) => (l.id === updated.id ? updated : l)));
  }

  function handleDragEnd(event) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setLinks((prev) => {
      const oldIndex = prev.findIndex((l) => l.id === active.id);
      const newIndex = prev.findIndex((l) => l.id === over.id);
      const next = arrayMove(prev, oldIndex, newIndex);
      reorderQuickLinksAction(next.map((l) => l.id)).catch(() => {});
      return next;
    });
  }

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit(onAdd)} className="space-y-1.5" noValidate>
        <div>
          <input
            type="text"
            {...register('label')}
            placeholder="Label"
            className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent w-full rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
          />
          {errors.label && (
            <p className="text-danger mt-0.5 text-[0.65rem]" role="alert">
              {errors.label.message}
            </p>
          )}
        </div>
        <div>
          <input
            type="url"
            {...register('url')}
            placeholder="https://…"
            className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent w-full rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
          />
          {errors.url && (
            <p className="text-danger mt-0.5 text-[0.65rem]" role="alert">
              {errors.url.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-accent hover:bg-accent/90 w-full rounded py-1.5 text-xs font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add link
        </button>
      </form>

      {links.length === 0 ? (
        <p className="text-text-subtle text-xs">No links pinned yet.</p>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={links.map((l) => l.id)} strategy={verticalListSortingStrategy}>
            <ul className="space-y-1" role="list">
              {links.map((link) => (
                <SortableLinkRow
                  key={link.id}
                  link={link}
                  onDelete={onDelete}
                  onUpdated={onUpdated}
                />
              ))}
            </ul>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
}

function SortableLinkRow({ link, onDelete, onUpdated }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <li ref={setNodeRef} style={style} className="group flex items-center gap-1">
      <button
        {...attributes}
        {...listeners}
        type="button"
        aria-label="Drag to reorder"
        className="text-text-subtle cursor-grab opacity-0 transition-opacity group-hover:opacity-60 active:cursor-grabbing"
      >
        <GripIcon size={12} />
      </button>
      <a
        href={link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="text-text-muted hover:text-accent min-w-0 flex-1 truncate text-xs transition-colors"
      >
        {link.label}
      </a>
      <div className="flex shrink-0 items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
        <QuickLinkEditDialog link={link} onUpdated={onUpdated}>
          <button
            type="button"
            aria-label="Edit link"
            className="text-text-subtle hover:text-text rounded p-0.5 transition-colors"
          >
            <PencilIcon size={11} />
          </button>
        </QuickLinkEditDialog>
        <button
          type="button"
          onClick={() => onDelete(link.id, link.label)}
          aria-label={`Delete ${link.label}`}
          className="text-text-subtle hover:text-danger rounded p-0.5 transition-colors"
        >
          ×
        </button>
      </div>
    </li>
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

function PencilIcon({ size = 12 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}
