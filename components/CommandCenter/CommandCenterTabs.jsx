'use client';

import * as Tabs from '@radix-ui/react-tabs';
import { QuickLinksPanel } from './QuickLinksPanel';
import { ScratchpadPanel } from './ScratchpadPanel';
import { TodoListPanel } from './TodoListPanel';

export function CommandCenterTabs({ quickLinks, scratchpadBody, todos }) {
  return (
    <Tabs.Root
      defaultValue="links"
      className="border-border bg-surface/40 rounded border"
      aria-label="Command Center"
    >
      <div className="border-border border-b px-2">
        <h2 className="font-display text-rune-gold px-2 pt-3 text-[0.65rem] tracking-[0.2em] uppercase">
          Command Center
        </h2>
        <Tabs.List className="mt-2 flex" role="tablist">
          <TabTrigger value="links">Links</TabTrigger>
          <TabTrigger value="scratch">Scratch</TabTrigger>
          <TabTrigger value="todos">Todos</TabTrigger>
        </Tabs.List>
      </div>

      <Tabs.Content value="links" className="p-4">
        <QuickLinksPanel initialLinks={quickLinks} />
      </Tabs.Content>
      <Tabs.Content value="scratch" className="p-4">
        <ScratchpadPanel initialBody={scratchpadBody} />
      </Tabs.Content>
      <Tabs.Content value="todos" className="p-4">
        <TodoListPanel initialTodos={todos} />
      </Tabs.Content>
    </Tabs.Root>
  );
}

function TabTrigger({ value, children }) {
  return (
    <Tabs.Trigger
      value={value}
      className="data-[state=active]:text-amber data-[state=active]:border-amber text-text-muted hover:text-text -mb-px border-b-2 border-transparent px-3 py-2 text-xs font-medium tracking-wider uppercase transition-colors"
    >
      {children}
    </Tabs.Trigger>
  );
}
