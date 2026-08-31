import CodeBlock from '@/components/learn/CodeBlock'
import { renderInline } from '@/components/learn/inline'
import { slugify } from '@/lib/toc'

/**
 * Renders the block content model used by lessons and documentation.
 *
 * Both content types share this renderer, which is what keeps a lesson and a
 * docs page typographically identical — one place decides how a table, a
 * callout, or a code sample looks.
 */

export { renderInline }

function Block({ block }) {
  switch (block.type) {
    case 'p':
      return <p>{renderInline(block.text)}</p>

    case 'h2':
      return <h2 id={slugify(block.text)}>{renderInline(block.text)}</h2>

    case 'h3':
      return <h3 id={slugify(block.text)}>{renderInline(block.text)}</h3>

    case 'list': {
      const List = block.ordered ? 'ol' : 'ul'
      return (
        <List>
          {block.items.map((item, i) => (
            <li key={i}>{renderInline(item)}</li>
          ))}
        </List>
      )
    }

    case 'steps':
      return (
        <ol className="steps">
          {block.items.map((item, i) => (
            <li key={i}>
              <span>{renderInline(item)}</span>
            </li>
          ))}
        </ol>
      )

    case 'code':
      return <CodeBlock code={block.code} lang={block.lang} file={block.file} />

    case 'callout':
      return (
        <aside className={block.kind === 'warning' ? 'callout callout-warn' : 'callout'}>
          <p className="mono">{block.kind === 'warning' ? 'Warning' : 'Note'}</p>
          {block.title && <p className="h4">{block.title}</p>}
          <p className="body">{renderInline(block.text)}</p>
        </aside>
      )

    case 'table':
      return (
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                {block.head.map((cell, i) => (
                  <th key={i} scope="col">
                    {cell}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {block.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j}>{renderInline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )

    case 'figure':
      return (
        <figure className="figure">
          <pre>{block.art}</pre>
          {block.caption && <figcaption>{block.caption}</figcaption>}
        </figure>
      )

    case 'quote':
      return <blockquote>{renderInline(block.text)}</blockquote>

    /* A client's own words, set beside the paragraph they belong to rather
       than interrupting it — the margin note of a printed report. It floats,
       so the prose wraps around it at reading widths and it becomes a plain
       block on a phone where there is no margin to sit in. */
    case 'pullquote':
      return (
        <aside className="pq">
          <blockquote>{renderInline(block.text)}</blockquote>
          {(block.name || block.role) && (
            <p className="pq-by mono">
              {block.name}
              {block.name && block.role ? ' · ' : ''}
              {block.role}
            </p>
          )}
        </aside>
      )

    /* The shape of a process, in the words the business uses for it. Not an
       architecture diagram: nobody deciding whether to hire us needs to know
       where the queue is. */
    case 'journey':
      return (
        <ol className="journey" aria-label={block.label ?? 'The process'}>
          {block.steps.map((step, i) => (
            <li key={step}>
              {/* Numbered rather than joined by connectors: a rule drawn
                  between steps strands itself at the start of every wrapped
                  row, and the number says "sequence" without the artefact. */}
              <span className="journey-n mono tnum">{String(i + 1).padStart(2, '0')}</span>
              {step}
            </li>
          ))}
        </ol>
      )

    /* Two columns that answer one question — who does what, or what changed.
       `emphasis` marks the column the reader should end on. */
    case 'duo':
      return (
        <div className="duo">
          {[block.left, block.right].map((side, i) => (
            <div key={i} className="duo-col" data-emphasis={block.emphasis === (i === 0 ? 'left' : 'right') || undefined}>
              <p className="mono duo-h">{side.title}</p>
              <ul role="list">
                {side.items.map((item, k) => (
                  <li key={k}>{renderInline(item)}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )

    default:
      return null
  }
}

export default function Prose({ blocks = [], className = '' }) {
  return (
    <div className={`prose ${className}`.trim()}>
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
