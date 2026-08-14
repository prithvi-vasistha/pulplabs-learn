'use client'

import { useEffect, useRef, useState } from 'react'
import { Copy, Check } from '@/components/void/Icons'
import { languageLabel, tokenize } from '@/lib/highlight'

/**
 * A code block with a language indicator and a copy control.
 *
 * Tokens carry no colour — hierarchy is weight and opacity (§1). The copy
 * result is announced through a live region rather than only changing the icon.
 */
export default function CodeBlock({ code, lang, file }) {
  const [copied, setCopied] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setFailed(false)
    } catch {
      // Clipboard access can be denied; say so instead of showing a false success.
      setFailed(true)
      setCopied(false)
    }
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setCopied(false)
      setFailed(false)
    }, 2400)
  }

  const tokens = tokenize(code, lang)
  const label = file || languageLabel(lang)

  return (
    <div className="code">
      <div className="code-h">
        <span className="code-f">{label}</span>
        <button type="button" className="code-copy" onClick={onCopy}>
          {copied ? <Check size={11} /> : <Copy />}
          {copied ? 'Copied' : failed ? 'Blocked' : 'Copy'}
        </button>
      </div>
      <pre>
        <code>
          {tokens.map((token, i) =>
            token.type ? (
              <span key={i} className={`t-${token.type}`}>
                {token.value}
              </span>
            ) : (
              <span key={i}>{token.value}</span>
            )
          )}
        </code>
      </pre>
      <p className="sr-only" role="status">
        {copied ? 'Code copied to clipboard' : failed ? 'Copying was blocked by the browser' : ''}
      </p>
    </div>
  )
}
