'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { accomplishmentSchema } from '@/lib/validation/accomplishment.schema';
import {
  updateAccomplishmentAction,
  deleteAccomplishmentAction,
} from '@/app/actions/accomplishments';
import { Sigil, SIGIL_KEYS, SIGIL_LABELS } from '@/components/Sigil';
import { DatePicker } from '@/components/DatePicker';

export function AccomplishmentEditDialog({ win, today, onUpdated, onDeleted, children }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const initialSigilKey = win.accomplishment_tags?.[0]?.tags?.sigil_key ?? null;

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(accomplishmentSchema),
    defaultValues: {
      text: win.text,
      sigil_key: initialSigilKey,
      occurred_on: win.occurred_on,
    },
  });

  const sigilKey = useWatch({ control, name: 'sigil_key' });
  const occurredOn = useWatch({ control, name: 'occurred_on' });

  function onSubmit(data) {
    const formData = new FormData();
    formData.append('id', win.id);
    formData.append('text', data.text);
    formData.append('sigil_key', data.sigil_key || '');
    formData.append('occurred_on', data.occurred_on);

    startTransition(async () => {
      const result = await updateAccomplishmentAction(formData);
      if (result?.ok) {
        toast.success('Win updated.');
        setOpen(false);
        onUpdated?.({ ...win, text: data.text, occurred_on: data.occurred_on });
      } else {
        toast.error(result?.error ?? 'Failed to update.');
      }
    });
  }

  function onDelete() {
    const formData = new FormData();
    formData.append('id', win.id);
    startTransition(async () => {
      const result = await deleteAccomplishmentAction(formData);
      if (result?.ok) {
        toast.success('Win deleted.');
        setOpen(false);
        onDeleted?.(win.id);
      } else {
        toast.error(result?.error ?? 'Failed to delete.');
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="border-border bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl"
          aria-describedby="edit-win-desc"
        >
          <Dialog.Title className="text-text text-lg font-semibold">Edit win</Dialog.Title>
          <Dialog.Description id="edit-win-desc" className="sr-only">
            Edit this win entry.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="edit-win-text" className="text-text-muted block text-sm font-medium">
                What happened?
              </label>
              <textarea
                id="edit-win-text"
                rows={3}
                {...register('text')}
                className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent mt-1 w-full rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
              />
              {errors.text && (
                <p role="alert" className="text-danger mt-1 text-xs">
                  {errors.text.message}
                </p>
              )}
            </div>

            <div>
              <span className="text-text-muted block text-sm font-medium">Tag (optional)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {SIGIL_KEYS.map((key) => {
                  const isSelected = sigilKey === key;
                  return (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={isSelected}
                      onClick={() =>
                        setValue('sigil_key', isSelected ? null : key, { shouldValidate: true })
                      }
                      className={`flex items-center gap-1.5 rounded border px-2.5 py-1.5 text-xs transition-colors ${
                        isSelected
                          ? 'border-accent bg-accent/10 text-accent'
                          : 'border-border text-text-muted hover:border-accent/50'
                      }`}
                    >
                      <Sigil name={key} />
                      {SIGIL_LABELS[key]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <span className="text-text-muted block text-sm font-medium">Date</span>
              <div className="mt-1">
                <DatePicker
                  value={occurredOn}
                  onChange={(date) => setValue('occurred_on', date, { shouldValidate: true })}
                  disableFuture={false}
                />
              </div>
              {errors.occurred_on && (
                <p role="alert" className="text-danger mt-1 text-xs">
                  {errors.occurred_on.message}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2 pt-2">
              <DeleteWinButton onDelete={onDelete} isPending={isPending} />
              <div className="flex gap-2">
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
                  className="bg-accent hover:bg-accent/90 rounded px-4 py-1.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {isPending ? 'Saving…' : 'Save'}
                </button>
              </div>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function DeleteWinButton({ onDelete, isPending }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          className="text-danger hover:bg-danger/10 rounded px-2 py-1.5 text-xs transition-colors"
        >
          Delete
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <AlertDialog.Content className="border-border bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl">
          <AlertDialog.Title className="text-text font-semibold">
            Delete this win?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-text-muted mt-2 text-sm">
            This action cannot be undone.
          </AlertDialog.Description>
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button className="text-text-muted hover:text-text rounded px-3 py-1.5 text-sm transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={onDelete}
                disabled={isPending}
                className="bg-danger hover:bg-danger/90 rounded px-3 py-1.5 text-sm font-semibold text-white transition-colors"
              >
                Delete
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}
