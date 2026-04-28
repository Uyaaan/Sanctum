'use client';

import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import { upsertTemplateAction } from '@/app/actions/templates';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const FIELDS = ['what_i_did', 'wins', 'blockers', 'tomorrow'];
const FIELD_LABELS = {
  what_i_did: 'What I did',
  wins: 'Wins',
  blockers: 'Blockers',
  tomorrow: 'Tomorrow',
};

function byWeekday(templates) {
  const map = {};
  for (const t of templates) map[t.weekday] = t.content ?? {};
  return map;
}

export function TemplatesForm({ initialTemplates }) {
  const [activeDay, setActiveDay] = useState(1);
  const [byDay, setByDay] = useState(byWeekday(initialTemplates));
  const [isPending, startTransition] = useTransition();

  const current = byDay[activeDay] ?? {};

  function handleChange(field, value) {
    setByDay((prev) => ({
      ...prev,
      [activeDay]: { ...(prev[activeDay] ?? {}), [field]: value },
    }));
  }

  function save() {
    const formData = new FormData();
    formData.append('weekday', String(activeDay));
    for (const field of FIELDS) {
      formData.append(field, current[field] ?? '');
    }

    startTransition(async () => {
      const result = await upsertTemplateAction(formData);
      if (result?.ok) {
        toast.success(`${WEEKDAYS[activeDay]} template saved.`);
      } else {
        toast.error(result?.error ?? 'Failed to save.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {/* Day tabs */}
      <div className="flex flex-wrap gap-1" role="tablist" aria-label="Select weekday">
        {WEEKDAYS.map((name, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={activeDay === i}
            onClick={() => setActiveDay(i)}
            className={`rounded border px-2.5 py-1 text-xs transition-colors ${
              activeDay === i
                ? 'border-accent bg-accent/10 text-accent'
                : 'border-border text-text-muted hover:border-accent/50'
            }`}
          >
            {name.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Template fields for selected day */}
      <div className="max-w-md space-y-3">
        {FIELDS.map((field) => (
          <div key={field}>
            <label className="text-text-muted block text-sm font-medium">
              {FIELD_LABELS[field]}
            </label>
            <textarea
              value={current[field] ?? ''}
              onChange={(e) => handleChange(field, e.target.value)}
              rows={3}
              placeholder={`Default ${FIELD_LABELS[field].toLowerCase()} for ${WEEKDAYS[activeDay]}s…`}
              className="border-border bg-subtle text-text placeholder-text-subtle focus:border-accent focus:ring-accent mt-1 w-full resize-y rounded border px-3 py-2 text-sm transition-colors outline-none focus:ring-1"
            />
          </div>
        ))}

        <button
          type="button"
          onClick={save}
          disabled={isPending}
          className="bg-accent hover:bg-accent/90 rounded px-4 py-2 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        >
          {isPending ? 'Saving…' : `Save ${WEEKDAYS[activeDay]} template`}
        </button>
      </div>
    </div>
  );
}
