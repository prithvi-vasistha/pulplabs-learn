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
