'use client';

import { useCallback, useState } from 'react';
import { useAutosave } from '@/hooks/useAutosave';
import { createClient } from '@/lib/supabase/client';
import { formatLogDate } from '@/lib/format/date';
import { DateScrubber } from '@/components/DateScrubber';

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

export function DailyLogEditor({ initialLog, today }) {
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
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <h2 className="font-display text-amber text-xl font-semibold">
            {formatLogDate(initialLog.log_date)}
          </h2>
          <DateScrubber logDate={initialLog.log_date} today={today} />
        </div>
        <div className="flex items-center gap-3">
          <SaveStatus status={status} />
          <ModeToggle mode={mode} onChange={setMode} />
        </div>
      </header>

      {mode === 'structured' ? (
        <StructuredFields data={structured} onChange={setStructured} />
      ) : (
        <FreeformField value={freeform} onChange={setFreeform} />
      )}
    </section>
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
        className={`px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'structured' ? 'bg-amber text-background' : 'text-text-muted hover:text-text'
        }`}
      >
        Structured
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={mode === 'freeform'}
        onClick={() => onChange('freeform')}
        className={`px-3 py-1 text-xs font-medium transition-colors ${
          mode === 'freeform' ? 'bg-amber text-background' : 'text-text-muted hover:text-text'
        }`}
      >
        Freeform
      </button>
    </div>
  );
}

function SaveStatus({ status }) {
  if (status === 'idle') return null;

  const labels = {
    saving: 'Saving…',
    saved: 'Saved',
    error: 'Save failed',
  };
  const colors = {
    saving: 'text-text-subtle',
    saved: 'text-rune-gold',
    error: 'text-crimson',
  };

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
        className="border-border bg-surface text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full resize-y rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
      />
    </label>
  );
}

function FreeformField({ value, onChange }) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write whatever's on your mind today…"
      rows={16}
      className="border-border bg-surface text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full rounded border px-3 py-3 text-sm transition-colors outline-none focus:ring-1"
    />
  );
}
