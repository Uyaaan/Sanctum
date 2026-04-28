'use client';

import { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import {
  addDays,
  addMonths,
  endOfMonth,
  format,
  getDay,
  parseISO,
  startOfMonth,
  subMonths,
  isSameDay,
  isAfter,
  isBefore,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { getCalendarActivityAction } from '@/app/actions/calendar';

const DAY_LABELS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

function buildGrid(monthDate) {
  const start = startOfMonth(monthDate);
  const end = endOfMonth(monthDate);
  const gridStart = startOfWeek(start, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(end, { weekStartsOn: 0 });

  const days = [];
  let d = gridStart;
  while (!isAfter(d, gridEnd)) {
    days.push(d);
    d = addDays(d, 1);
  }
  return days;
}

export function DatePicker({
  value,
  onChange,
  disableFuture = true,
  placeholder = 'Pick a date',
  className = '',
}) {
  const [open, setOpen] = useState(false);
  const [viewDate, setViewDate] = useState(() => (value ? parseISO(value) : new Date()));
  const [logDates, setLogDates] = useState(new Set());
  const [winDates, setWinDates] = useState(new Set());
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const selectedDate = value ? parseISO(value) : null;

  useEffect(() => {
    if (!open) return;
    let cancelled = false;
    const monthStart = format(startOfMonth(viewDate), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(viewDate), 'yyyy-MM-dd');

    getCalendarActivityAction(monthStart, monthEnd)
      .then((data) => {
        if (cancelled) return;
        setLogDates(new Set(data.logDates));
        setWinDates(new Set(data.winDates));
      })
      .catch(() => {});

    return () => {
      cancelled = true;
    };
  }, [open, viewDate]);

  function selectDate(d) {
    onChange(format(d, 'yyyy-MM-dd'));
    setOpen(false);
  }

  function prevMonth() {
    setViewDate((v) => subMonths(v, 1));
  }

  function nextMonth() {
    setViewDate((v) => addMonths(v, 1));
  }

  const days = buildGrid(viewDate);

  const displayValue = selectedDate ? format(selectedDate, 'MMM d, yyyy') : '';

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button
          type="button"
          className={`border-border bg-subtle text-text focus:border-accent focus:ring-accent inline-flex items-center gap-2 rounded border px-2 py-1 text-sm transition-colors outline-none focus:ring-1 ${className}`}
          aria-label={displayValue || placeholder}
        >
          <CalendarIcon size={14} />
          <span>{displayValue || <span className="text-text-subtle">{placeholder}</span>}</span>
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="border-border bg-surface z-50 w-72 rounded-lg border p-3 shadow-xl"
          sideOffset={6}
          align="start"
        >
          {/* Month navigation */}
          <div className="mb-3 flex items-center justify-between">
            <button
              type="button"
              onClick={prevMonth}
              aria-label="Previous month"
              className="text-text-muted hover:text-text rounded p-1 transition-colors"
            >
              ‹
            </button>
            <span className="text-text text-sm font-medium">{format(viewDate, 'MMMM yyyy')}</span>
            <button
              type="button"
              onClick={nextMonth}
              aria-label="Next month"
              className="text-text-muted hover:text-text rounded p-1 transition-colors"
            >
              ›
            </button>
          </div>

          {/* Day-of-week headers */}
          <div className="mb-1 grid grid-cols-7">
            {DAY_LABELS.map((d) => (
              <div key={d} className="text-text-subtle text-center text-[0.65rem] font-medium">
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 gap-y-0.5">
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd');
              const isThisMonth = day.getMonth() === viewDate.getMonth();
              const isToday = isSameDay(day, today);
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const isFuture = isAfter(day, today);
              const disabled = disableFuture && isFuture;
              const hasLog = logDates.has(dateStr);
              const hasWin = winDates.has(dateStr);

              return (
                <button
                  key={dateStr}
                  type="button"
                  disabled={disabled}
                  onClick={() => !disabled && selectDate(day)}
                  className={`relative flex h-8 w-full flex-col items-center justify-center rounded text-xs transition-colors ${
                    isSelected
                      ? 'bg-accent text-white'
                      : isToday
                        ? 'border-accent text-accent border font-semibold'
                        : !isThisMonth
                          ? 'text-text-subtle/40'
                          : disabled
                            ? 'text-text-subtle/30 cursor-not-allowed'
                            : 'text-text-muted hover:bg-subtle'
                  }`}
                  aria-label={format(day, 'MMMM d, yyyy')}
                  aria-pressed={isSelected}
                >
                  {day.getDate()}
                  {/* Activity dots */}
                  {!isSelected && (hasLog || hasWin) && (
                    <span className="absolute bottom-0.5 flex gap-0.5">
                      {hasLog && <span className="bg-text-subtle/50 h-1 w-1 rounded-full" />}
                      {hasWin && <span className="bg-accent h-1 w-1 rounded-full" />}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Today shortcut */}
          {!(disableFuture && isAfter(today, today)) && (
            <div className="border-border mt-2 border-t pt-2">
              <button
                type="button"
                onClick={() => selectDate(today)}
                className="text-accent hover:bg-accent/10 w-full rounded py-1 text-xs transition-colors"
              >
                Today
              </button>
            </div>
          )}

          <Popover.Arrow className="fill-surface" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

function CalendarIcon({ size = 16 }) {
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
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}
