'use client';

import { useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { quickLinkSchema } from '@/lib/validation/quick-link.schema';
import { createQuickLinkAction, deleteQuickLinkAction } from '@/app/actions/quick-links';

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

  function onAdd(data) {
    const formData = new FormData();
    formData.append('label', data.label);
    formData.append('url', data.url);

    startTransition(async () => {
      const result = await createQuickLinkAction(formData);
      if (result?.ok) {
        toast.success('Link saved.');
        // Optimistic: append a temp row; server-driven refresh on next nav fixes IDs
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

  return (
    <div className="space-y-3">
      <form onSubmit={handleSubmit(onAdd)} className="space-y-1.5" noValidate>
        <div>
          <input
            type="text"
            {...register('label')}
            placeholder="Label"
            className="border-border bg-background text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
          />
          {errors.label && (
            <p className="text-crimson mt-0.5 text-[0.65rem]" role="alert">
              {errors.label.message}
            </p>
          )}
        </div>
        <div>
          <input
            type="url"
            {...register('url')}
            placeholder="https://…"
            className="border-border bg-background text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full rounded border px-2 py-1 text-xs transition-colors outline-none focus:ring-1"
          />
          {errors.url && (
            <p className="text-crimson mt-0.5 text-[0.65rem]" role="alert">
              {errors.url.message}
            </p>
          )}
        </div>
        <button
          type="submit"
          disabled={isSubmitting || isPending}
          className="bg-amber text-background hover:bg-amber/90 w-full rounded py-1.5 text-xs font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50"
        >
          + Add link
        </button>
      </form>

      {links.length === 0 ? (
        <p className="text-text-subtle text-xs">No links pinned yet.</p>
      ) : (
        <ul className="space-y-1.5" role="list">
          {links.map((link) => (
            <li key={link.id} className="group flex items-center justify-between gap-2">
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-text-muted hover:text-amber truncate text-xs transition-colors"
              >
                {link.label}
              </a>
              <button
                type="button"
                onClick={() => onDelete(link.id, link.label)}
                aria-label={`Delete ${link.label}`}
                className="text-text-subtle hover:text-crimson shrink-0 text-sm leading-none opacity-40 transition-all group-hover:opacity-100"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
