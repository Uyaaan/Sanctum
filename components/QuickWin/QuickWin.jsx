'use client';

import { useState, useTransition } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { toast } from 'sonner';
import { accomplishmentSchema } from '@/lib/validation/accomplishment.schema';
import { createAccomplishmentAction } from '@/app/actions/accomplishments';
import { Sigil, SIGIL_KEYS, SIGIL_LABELS } from '@/components/Sigil';
import { DatePicker } from '@/components/DatePicker';

export function QuickWin({ today }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    control,
  } = useForm({
    resolver: yupResolver(accomplishmentSchema),
    defaultValues: { text: '', sigil_key: null, occurred_on: today },
  });

  const sigilKey = useWatch({ control, name: 'sigil_key' });
  const occurredOn = useWatch({ control, name: 'occurred_on' });

  function onSubmit(data) {
    const formData = new FormData();
    formData.append('text', data.text);
    formData.append('sigil_key', data.sigil_key || '');
    formData.append('occurred_on', data.occurred_on);

    startTransition(async () => {
      const result = await createAccomplishmentAction(formData);
      if (result?.ok) {
        toast.success('Win recorded.');
        reset({ text: '', sigil_key: null, occurred_on: today });
        setOpen(false);
      } else {
        toast.error(result?.error ?? 'Failed to save.');
      }
    });
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Add a win"
          className="bg-accent hover:bg-accent/90 fixed right-6 bottom-6 z-30 rounded-full px-4 py-3 text-sm font-semibold text-white shadow-lg transition-colors md:bottom-6"
          style={{ bottom: 'calc(env(safe-area-inset-bottom) + 1.5rem)' }}
        >
          + Add a win
        </button>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm" />
        <Dialog.Content
          className="border-border bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl"
          aria-describedby="quickwin-desc"
        >
          <Dialog.Title className="text-text text-lg font-semibold">Add a win</Dialog.Title>
          <Dialog.Description id="quickwin-desc" className="text-text-subtle mt-1 text-xs">
            Mark a breakthrough, persistence moment, or learning.
          </Dialog.Description>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4" noValidate>
            <div>
              <label htmlFor="win-text" className="text-text-muted block text-sm font-medium">
                What happened?
              </label>
              <textarea
                id="win-text"
                rows={3}
                {...register('text')}
                className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent mt-1 w-full rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
                placeholder="Pushed the auth fix that's been bugging me…"
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

            <div className="flex justify-end gap-2 pt-2">
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
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
