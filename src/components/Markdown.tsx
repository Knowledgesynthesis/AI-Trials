import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import { Link } from 'react-router'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'

export function Markdown({ children, className, compact }: { children: string; className?: string; compact?: boolean }) {
  return (
    <div className={cn('prose-lesson', compact && 'prose-compact', className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
        components={{
          a: ({ href, children: c }) =>
            href?.startsWith('/') ? (
              <Link to={href}>{c}</Link>
            ) : (
              <a href={href} target="_blank" rel="noreferrer noopener">
                {c}
              </a>
            ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

/** Inline markdown without block wrappers (for quiz options, short labels). */
export function InlineMarkdown({ children }: { children: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm, remarkMath]}
      rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
      components={{ p: ({ children: c }) => <>{c}</> }}
    >
      {children}
    </ReactMarkdown>
  )
}
