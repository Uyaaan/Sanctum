'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { quickLinkSchema } from '@/lib/validation/quick-link.schema';
import { updateQuickLinkAction } from '@/app/actions/quick-links';

export function QuickLinkEditDialog({ link, onUpdated, children }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(quickLinkSchema),
    defaultValues: { label: link.label, url: link.url },
  });

  function onSubmit(data) {
    const formData = new FormData();
    formData.append('id', link.id);
    formData.append('label', data.label);
    formData.append('url', data.url);

    startTransition(async () => {
      const result = await updateQuickLinkAction(formData);
      if (result?.ok) {
        toast.success('Link updated.');
        setOpen(false);
        onUpdated?.({ ...link, label: data.label, url: data.url });
      } else {
        toast.error(result?.error ?? 'Failed to update.');
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="border-border bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl"
          aria-describedby="edit-link-desc"
        >
          <Dialog.Title className="text-text font-semibold">Edit link</Dialog.Title>
          <Dialog.Description id="edit-link-desc" className="sr-only">
            Edit this quick link.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-3" noValidate>
            <div>
              <label
                htmlFor="edit-link-label"
                className="text-text-muted block text-sm font-medium"
              >
                Label
              </label>
              <input
                id="edit-link-label"
                type="text"
                {...register('label')}
                className="border-border bg-subtle text-text focus:border-accent focus:ring-accent mt-1 w-full rounded border px-3 py-2 text-sm outline-none focus:ring-1"
              />
              {errors.label && (
                <p role="alert" className="text-danger mt-1 text-xs">
                  {errors.label.message}
                </p>
              )}
            </div>
            <div>
              <label htmlFor="edit-link-url" className="text-text-muted block text-sm font-medium">
                URL
              </label>
              <input
                id="edit-link-url"
                type="url"
                {...register('url')}
                className="border-border bg-subtle text-text focus:border-accent focus:ring-accent mt-1 w-full rounded border px-3 py-2 text-sm outline-none focus:ring-1"
              />
              {errors.url && (
                <p role="alert" className="text-danger mt-1 text-xs">
                  {errors.url.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="text-text-muted hover:text-text rounded px-3 py-1.5 text-sm transition-colors"
                >
                  Cancel
                </button>
              </Dialog.Close>
              <button
                type="submit"
                disabled={isPending}
                className="bg-accent hover:bg-accent/90 rounded px-4 py-1.5 text-sm font-semibold text-white transition-colors disabled:opacity-50"
              >
                {isPending ? 'Saving…' : 'Save'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
