import { listQuickLinks } from '@/lib/db/quick-links';
import { getScratchpad } from '@/lib/db/scratchpad';
import { listTodos } from '@/lib/db/todos';
import { CommandCenterTabs } from './CommandCenterTabs';

export async function CommandCenter({ userId }) {
  const [quickLinks, scratchpad, todos] = await Promise.all([
    listQuickLinks(userId).catch(() => []),
    getScratchpad(userId).catch(() => ({ body: '', updated_at: null })),
    listTodos(userId).catch(() => []),
  ]);

  return (
    <CommandCenterTabs quickLinks={quickLinks} scratchpadBody={scratchpad.body} todos={todos} />
  );
}
