import { Breakthrough } from './glyphs/Breakthrough';
import { Persistence } from './glyphs/Persistence';
import { Learned } from './glyphs/Learned';
import { HelpedSomeone } from './glyphs/HelpedSomeone';

export const SIGIL_KEYS = ['breakthrough', 'persistence', 'learned', 'helped_someone'];

export const SIGIL_LABELS = {
  breakthrough: 'Breakthrough',
  persistence: 'Persistence',
  learned: 'Learned',
  helped_someone: 'Helped Someone',
};

const GLYPHS = {
  breakthrough: Breakthrough,
  persistence: Persistence,
  learned: Learned,
  helped_someone: HelpedSomeone,
};

export function Sigil({ name, size = 16, className = '', ...props }) {
  const Glyph = GLYPHS[name];
  if (!Glyph) return null;

  return (
    <Glyph
      width={size}
      height={size}
      className={`text-rune-gold ${className}`}
      role="img"
      aria-label={SIGIL_LABELS[name] ?? name}
      {...props}
    />
  );
}
