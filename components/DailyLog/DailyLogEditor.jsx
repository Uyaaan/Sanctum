'use client';

import { useCallback, useState, useTransition, useRef } from 'react';
import * as AlertDialog from '@radix-ui/react-alert-dialog';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useAutosave } from '@/hooks/useAutosave';
import { useSlashCommands } from '@/hooks/useSlashCommands';
import { createClient } from '@/lib/supabase/client';
import { formatLogDate } from '@/lib/format/date';
import { DateScrubber } from '@/components/DateScrubber';
import { MarkdownView } from '@/components/MarkdownView';
import { SlashCommandMenu } from '@/components/SlashCommandMenu';
import { deleteDailyLogAction } from '@/app/actions/daily-logs';
import { uploadImageAction } from '@/app/actions/images';

const SLASH_COMMANDS = [
  { id: 'h1', label: 'Heading 1', insert: '# ' },
  { id: 'h2', label: 'Heading 2', insert: '## ' },
  { id: 'h3', label: 'Heading 3', insert: '### ' },
  { id: 'quote', label: 'Blockquote', insert: '> ' },
  { id: 'code', label: 'Code block', insert: '```\n\n```' },
  { id: 'today', label: 'Insert today', insert: () => format(new Date(), 'yyyy-MM-dd') },
  { id: 'hr', label: 'Divider', insert: '\n---\n' },
];

function structuredToMd({ what_i_did, wins, blockers, tomorrow }) {
  return [
    what_i_did && `What I did:\n${what_i_did}`,
    wins && `Wins:\n${wins}`,
    blockers && `Blockers:\n${blockers}`,
    tomorrow && `Tomorrow:\n${tomorrow}`,
  ]
    .filter(Boolean)
    .join('\n\n');
}

export function DailyLogEditor({ initialLog, today, isPlanned = false }) {
  const [mode, setMode] = useState(initialLog.mode);
  const [structured, setStructured] = useState({
    what_i_did: initialLog.content?.what_i_did ?? '',
    wins: initialLog.content?.wins ?? '',
    blockers: initialLog.content?.blockers ?? '',
    tomorrow: initialLog.content?.tomorrow ?? '',
  });
  const [freeform, setFreeform] = useState(
    initialLog.mode === 'freeform' ? initialLog.content_md : '',
  );

  const save = useCallback(
    async (data) => {
      const supabase = createClient();
      const updates = { mode: data.mode };

      if (data.mode === 'structured') {
        updates.content = data.structured;
        updates.content_md = structuredToMd(data.structured);
      } else {
        updates.content = {};
        updates.content_md = data.freeform;
      }

      const { error } = await supabase.from('daily_logs').update(updates).eq('id', initialLog.id);

      if (error) throw error;
    },
    [initialLog.id],
  );

  const status = useAutosave({ mode, structured, freeform }, save);

  return (
    <section className="space-y-4">
      {isPlanned && (
        <div className="border-accent/30 bg-accent/5 text-accent rounded border px-3 py-2 text-xs font-medium">
          Planning ahead — writing for {formatLogDate(initialLog.log_date)}
        </div>
      )}

      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="text-text text-xl font-semibold">{formatLogDate(initialLog.log_date)}</h2>
          <DateScrubber logDate={initialLog.log_date} today={today} />
        </div>
        <div className="flex items-center gap-3">
          <SaveStatus status={status} />
          <ModeToggle mode={mode} onChange={setMode} />
          <DeleteLogButton logId={initialLog.id} logDate={initialLog.log_date} />
        </div>
      </header>

      {mode === 'structured' ? (
        <StructuredFields data={structured} onChange={setStructured} />
      ) : (
        <FreeformField value={freeform} onChange={setFreeform} logId={initialLog.id} />
      )}
    </section>
  );
}

function DeleteLogButton({ logId, logDate }) {
  const [confirmValue, setConfirmValue] = useState('');
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const expectedValue = logDate;

  function handleDelete() {
    const formData = new FormData();
    formData.append('id', logId);
    startTransition(async () => {
      try {
        await deleteDailyLogAction(formData);
      } catch {
        toast.error('Failed to delete entry.');
      }
      router.push('/dashboard');
    });
  }

  return (
    <AlertDialog.Root onOpenChange={() => setConfirmValue('')}>
      <AlertDialog.Trigger asChild>
        <button
          type="button"
          aria-label="Delete this log entry"
          className="text-text-subtle hover:text-danger rounded p-1 transition-colors"
          title="Delete entry"
        >
          <TrashIcon size={15} />
        </button>
      </AlertDialog.Trigger>
      <AlertDialog.Portal>
        <AlertDialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <AlertDialog.Content className="border-border bg-surface fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-lg border p-6 shadow-xl">
          <AlertDialog.Title className="text-text font-semibold">
            Delete this entry?
          </AlertDialog.Title>
          <AlertDialog.Description className="text-text-muted mt-2 text-sm">
            This permanently deletes the log for <strong>{formatLogDate(logDate)}</strong>. Type the
            date below to confirm.
          </AlertDialog.Description>
          <input
            type="text"
            value={confirmValue}
            onChange={(e) => setConfirmValue(e.target.value)}
            placeholder={expectedValue}
            className="border-border bg-subtle text-text focus:border-danger focus:ring-danger mt-3 w-full rounded border px-3 py-2 text-sm outline-none focus:ring-1"
            aria-label="Type the date to confirm deletion"
          />
          <div className="mt-4 flex justify-end gap-2">
            <AlertDialog.Cancel asChild>
              <button className="text-text-muted hover:text-text rounded px-3 py-1.5 text-sm transition-colors">
                Cancel
              </button>
            </AlertDialog.Cancel>
            <AlertDialog.Action asChild>
              <button
                onClick={handleDelete}
                disabled={confirmValue !== expectedValue || isPending}
                className="bg-danger hover:bg-danger/90 rounded px-3 py-1.5 text-sm font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isPending ? 'Deleting…' : 'Delete entry'}
              </button>
            </AlertDialog.Action>
          </div>
        </AlertDialog.Content>
      </AlertDialog.Portal>
    </AlertDialog.Root>
  );
}

function ModeToggle({ mode, onChange }) {
  return (
    <div
      className="border-border bg-surface inline-flex rounded border"
      role="radiogroup"
      aria-label="Entry mode"
    >
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'structured'}
        onClick={() => onChange('structured')}
        className={`rounded-l px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'structured' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
        }`}
      >
        Structured
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'freeform'}
        onClick={() => onChange('freeform')}
        className={`rounded-r px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'freeform' ? 'bg-accent text-white' : 'text-text-muted hover:text-text'
        }`}
      >
        Freeform
      </button>
    </div>
  );
}

function SaveStatus({ status }) {
  if (status === 'idle') return null;

  const labels = { saving: 'Saving…', saved: 'Saved', error: 'Save failed' };
  const colors = { saving: 'text-text-subtle', saved: 'text-accent', error: 'text-danger' };

  return (
    <span className={`text-xs ${colors[status]}`} role="status" aria-live="polite">
      {labels[status]}
    </span>
  );
}

function StructuredFields({ data, onChange }) {
  function update(field, value) {
    onChange((prev) => ({ ...prev, [field]: value }));
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field
        label="What I did"
        value={data.what_i_did}
        onChange={(v) => update('what_i_did', v)}
        placeholder="The day's accomplishments…"
        rows={4}
      />
      <Field
        label="Wins"
        value={data.wins}
        onChange={(v) => update('wins', v)}
        placeholder="Quick highlights…"
        rows={4}
      />
      <Field
        label="Blockers"
        value={data.blockers}
        onChange={(v) => update('blockers', v)}
        placeholder="What got in the way…"
        rows={4}
      />
      <Field
        label="Tomorrow"
        value={data.tomorrow}
        onChange={(v) => update('tomorrow', v)}
        placeholder="What's next…"
        rows={4}
      />
    </div>
  );
}

function Field({ label, value, onChange, placeholder, rows = 3 }) {
  return (
    <label className="block">
      <span className="text-text-muted mb-1 block text-sm font-medium">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent w-full resize-y rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
      />
    </label>
  );
}

function FreeformField({ value, onChange, logId }) {
  const [editing, setEditing] = useState(true);
  const [uploading, setUploading] = useState(false);
  const textareaRef = useRef(null);

  const {
    open: menuOpen,
    filtered,
    onKeyDown,
    onInput,
    select,
  } = useSlashCommands(textareaRef, SLASH_COMMANDS);

  function handleChange(e) {
    onChange(e.target.value);
    onInput();
  }

  async function insertImage(file) {
    setUploading(true);
    const formData = new FormData();
    formData.append('image', file);
    if (logId) formData.append('daily_log_id', logId);

    const result = await uploadImageAction(formData);
    setUploading(false);

    if (!result?.ok) {
      toast.error(result?.error ?? 'Upload failed.');
      return;
    }

    const mdInsert = `\n![${file.name}](${result.url})\n`;
    const ta = textareaRef.current;
    if (ta) {
      const pos = ta.selectionStart ?? value.length;
      onChange(value.slice(0, pos) + mdInsert + value.slice(pos));
    } else {
      onChange(value + mdInsert);
    }
  }

  function handlePaste(e) {
    const items = Array.from(e.clipboardData?.items ?? []);
    const imageItem = items.find((item) => item.type.startsWith('image/'));
    if (!imageItem) return;
    e.preventDefault();
    const file = imageItem.getAsFile();
    if (file) insertImage(file);
  }

  function handleDrop(e) {
    e.preventDefault();
    const file = e.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) insertImage(file);
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setEditing(true)}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${editing ? 'bg-accent/10 text-accent' : 'text-text-subtle hover:text-text'}`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setEditing(false)}
          className={`rounded px-2 py-0.5 text-xs transition-colors ${!editing ? 'bg-accent/10 text-accent' : 'text-text-subtle hover:text-text'}`}
        >
          Preview
        </button>
      </div>

      {editing ? (
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={handleChange}
            onKeyDown={onKeyDown}
            onPaste={handlePaste}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            placeholder="Write whatever's on your mind today… (type / for commands, paste or drag images)"
            rows={16}
            className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent w-full rounded border px-3 py-3 text-sm transition-colors outline-none focus:ring-1"
            disabled={uploading}
          />
          {uploading && (
            <div className="absolute inset-0 flex items-center justify-center rounded bg-white/60 dark:bg-black/40">
              <span className="text-accent text-xs font-medium">Uploading image…</span>
            </div>
          )}
          {menuOpen && (
            <div className="absolute top-full left-3 mt-1">
              <SlashCommandMenu items={filtered} onSelect={select} textareaRef={textareaRef} />
            </div>
          )}
        </div>
      ) : value ? (
        <div
          className="border-border bg-subtle min-h-[16rem] cursor-text rounded border px-3 py-3"
          onClick={() => setEditing(true)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && setEditing(true)}
          aria-label="Click to edit"
        >
          <MarkdownView content={value} />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="border-border bg-subtle text-text-subtle min-h-[16rem] w-full rounded border px-3 py-3 text-left text-sm"
        >
          Nothing written yet. Click to start.
        </button>
      )}
    </div>
  );
}

function TrashIcon({ size = 16 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}
