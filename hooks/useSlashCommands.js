'use client';

import { useState, useCallback } from 'react';

function getSlashRange(textarea) {
  const { selectionStart, value } = textarea;
  const before = value.slice(0, selectionStart);
  const lineStart = before.lastIndexOf('\n') + 1;
  const lineText = before.slice(lineStart);
  const slashIdx = lineText.lastIndexOf('/');
  if (slashIdx === -1) return null;

  const prefix = lineText.slice(0, slashIdx);
  if (prefix.trim() !== '') return null;

  const query = lineText.slice(slashIdx + 1);
  if (/\s/.test(query)) return null;

  return { start: lineStart + slashIdx, end: selectionStart, query };
}

export function useSlashCommands(textareaRef, commands) {
  const [range, setRange] = useState(null);
  const [query, setQuery] = useState('');

  const filtered = commands.filter((cmd) => !query || cmd.id.startsWith(query.toLowerCase()));

  const onKeyDown = useCallback(
    (e) => {
      if (!range) return;
      const items = filtered;
      if (e.key === 'Escape') {
        setRange(null);
        setQuery('');
      }
    },
    [range, filtered],
  );

  const onInput = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    const found = getSlashRange(ta);
    if (found) {
      setRange(found);
      setQuery(found.query);
    } else {
      setRange(null);
      setQuery('');
    }
  }, [textareaRef]);

  const select = useCallback(
    (cmd) => {
      const ta = textareaRef.current;
      if (!ta || !range) return;

      const before = ta.value.slice(0, range.start);
      const after = ta.value.slice(range.end);
      const insert = cmd.insert instanceof Function ? cmd.insert(ta.value, range) : cmd.insert;
      const newValue = before + insert + after;

      const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
        window.HTMLTextAreaElement.prototype,
        'value',
      ).set;
      nativeInputValueSetter.call(ta, newValue);
      ta.dispatchEvent(new Event('input', { bubbles: true }));

      const cursor = range.start + insert.length;
      ta.setSelectionRange(cursor, cursor);
      ta.focus();

      setRange(null);
      setQuery('');
    },
    [textareaRef, range],
  );

  return {
    open: range !== null && filtered.length > 0,
    filtered,
    query,
    onKeyDown,
    onInput,
    select,
  };
}
