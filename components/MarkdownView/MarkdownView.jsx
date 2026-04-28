'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export function MarkdownView({ content, className = '' }) {
  if (!content?.trim()) return null;

  return (
    <div
      className={`prose prose-sm text-text [&_h1]:text-text [&_h2]:text-text [&_h3]:text-text [&_p]:text-text-muted [&_ul]:text-text-muted [&_ol]:text-text-muted [&_li]:text-text-muted [&_code]:bg-subtle [&_code]:text-accent [&_pre]:bg-subtle [&_blockquote]:border-border [&_blockquote]:text-text-subtle [&_a]:text-accent [&_mark]:bg-accent/20 [&_mark]:text-accent [&_strong]:text-text max-w-none [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:pl-3 [&_blockquote]:italic [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5 [&_code]:font-mono [&_code]:text-xs [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-medium [&_mark]:rounded [&_mark]:px-0.5 [&_p]:leading-relaxed [&_pre]:overflow-x-auto [&_pre]:rounded-lg [&_pre]:p-3 [&_strong]:font-semibold ${className}`}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
