'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Debounced autosave. Returns a status: idle | saving | saved | error.
 *
 * - Compares values via JSON.stringify so object references don't matter
 * - Clears any pending save on unmount
 * - The latest `save` callback is held in a ref to avoid retriggering the effect
 */
export function useAutosave(value, save, delay = 800) {
  const [status, setStatus] = useState('idle');
  const timeoutRef = useRef(null);
  const lastSavedRef = useRef(JSON.stringify(value));
  const saveRef = useRef(save);

  useEffect(() => {
    saveRef.current = save;
  }, [save]);

  useEffect(() => {
    const serialized = JSON.stringify(value);
    if (serialized === lastSavedRef.current) return;

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(async () => {
      setStatus('saving');
      try {
        await saveRef.current(value);
        lastSavedRef.current = serialized;
        setStatus('saved');
        setTimeout(() => {
          setStatus((s) => (s === 'saved' ? 'idle' : s));
        }, 1500);
      } catch {
        setStatus('error');
      }
    }, delay);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [value, delay]);

  return status;
}
