'use client';

import { useCallback, useState } from 'react';
import { useAutosave } from '@/hooks/useAutosave';
import { updateScratchpadAction } from '@/app/actions/scratchpad';

export function ScratchpadPanel({ initialBody }) {
  const [body, setBody] = useState(initialBody);

  const save = useCallback(async (value) => {
    const formData = new FormData();
    formData.append('body', value);
    const result = await updateScratchpadAction(formData);
    if (!result?.ok) throw new Error(result?.error ?? 'Save failed');
  }, []);

  const status = useAutosave(body, save, 1500);

  return (
    <div className="space-y-2">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Anything you want to remember for now…"
        rows={8}
        aria-label="Scratchpad"
        className="border-border bg-background text-text placeholder-text-subtle focus:border-amber focus:ring-amber w-full resize-y rounded border px-2 py-1.5 text-xs transition-colors outline-none focus:ring-1"
      />
      <SaveStatus status={status} />
    </div>
  );
}

function SaveStatus({ status }) {
  if (status === 'idle') {
    return <span className="text-text-subtle text-[0.65rem]">Autosaves as you type.</span>;
  }
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
    <span className={`${colors[status]} text-[0.65rem]`} role="status" aria-live="polite">
      {labels[status]}
    </span>
  );
}
