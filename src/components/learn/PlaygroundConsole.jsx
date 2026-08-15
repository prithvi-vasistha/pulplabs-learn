'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'

/**
 * The console.
 *
 * One component for every demo, because they share a shape: lease an instance,
 * set some inputs, run, read a result you can argue with. Only the controls
 * and the result panel differ, and both switch on the demo's engine.
 *
 * No engine logic lives here. The browser sends inputs and renders what comes
 * back — the corpus, the answer keys and the scoring are all server-side,
 * which is what makes the numbers worth reading.
 */
export default function PlaygroundConsole({ demo }) {
  const [instance, setInstance] = useState(null)
  const [input, setInput] = useState(() => structuredClone(demo.controls ?? {}))
  const [result, setResult] = useState(null)
  const [error, setError] = useState(null)
  const [busy, setBusy] = useState('starting')
  const [now, setNow] = useState(() => Date.now())

  const start = useCallback(async () => {
    setBusy('starting')
    setError(null)
    try {
      const response = await fetch(`/api/playground/${demo.slug}/session`, { method: 'POST' })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error ?? 'Could not start an instance')
      setInstance(payload)
    } catch (thrown) {
      setError(thrown.message)
    } finally {
      setBusy(null)
    }
  }, [demo.slug])

  // Leasing on arrival: the reader signed in and opened a demo, which is the
  // whole of the intent. Making them press "start" first would be ceremony.
  useEffect(() => {
    start()
  }, [start])

  // The lease has a deadline, so the panel counts down rather than going stale.
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000)
    return () => clearInterval(timer)
  }, [])

  const remaining = useMemo(() => {
    if (!instance) return null
    const minutes = Math.round((new Date(instance.expiresAt).getTime() - now) / 60000)
    return minutes
  }, [instance, now])

  async function run() {
    if (!instance || busy) return
    setBusy('running')
    setError(null)
    try {
      const response = await fetch(`/api/playground/${demo.slug}/run`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ sessionId: instance.id, input }),
      })
      const payload = await response.json().catch(() => ({}))
      if (!response.ok) throw new Error(payload.error ?? 'The run failed')
      setResult(payload.result)
      setInstance(payload.session)
    } catch (thrown) {
      setError(thrown.message)
    } finally {
      setBusy(null)
    }
  }

  async function end() {
    if (!instance) return
    setBusy('ending')
    await fetch(`/api/playground/${demo.slug}/session?id=${encodeURIComponent(instance.id)}`, { method: 'DELETE' }).catch(
      () => null
    )
    setInstance(null)
    setResult(null)
    setBusy(null)
  }

  const set = (key, value) => setInput((prev) => ({ ...prev, [key]: value }))

  return (
    <div className="pgc">
      <div className="pgc-bar">
        <span className={`pgc-dot${instance ? ' on' : ''}`} aria-hidden="true" />
        <span className="mono">
          {instance ? `Instance ${instance.id.slice(0, 8)}` : busy === 'starting' ? 'Leasing an instance…' : 'No instance'}
        </span>
        {instance && (
          <span className="mono tnum pgc-meta">
            {instance.runs}/{instance.quota} runs · {remaining > 0 ? `${remaining} min left` : 'expiring'}
          </span>
        )}
        <span className="pgc-sp" />
        {instance ? (
          <button type="button" className="btn btn-ghost btn-sm" onClick={end} disabled={busy === 'ending'}>
            End
          </button>
        ) : (
          <button type="button" className="btn btn-sm" onClick={start} disabled={busy === 'starting'}>
            Start instance
          </button>
        )}
      </div>

      {error && (
        <p className="pgc-err" role="alert">
          {error}
        </p>
      )}

      <div className="pgc-body">
        <div className="pgc-controls">
          {demo.engine === 'retrieval' && <RetrievalControls demo={demo} input={input} set={set} />}
          {demo.engine === 'budget' && <BudgetControls input={input} set={set} />}
          {demo.engine === 'evals' && <EvalControls demo={demo} input={input} set={set} />}

          <button type="button" className="btn" onClick={run} disabled={!instance || busy === 'running'}>
            {busy === 'running' ? 'Running…' : 'Run'}
          </button>
        </div>

        <div className="pgc-out" aria-live="polite">
          {!result ? (
            <p className="note">{instance ? 'Set the inputs and run it.' : 'Start an instance to run this demo.'}</p>
          ) : (
            <>
              {demo.engine === 'retrieval' && <RetrievalResult result={result} />}
              {demo.engine === 'budget' && <BudgetResult result={result} />}
              {demo.engine === 'evals' && <EvalResult result={result} />}
              <p className="mono tnum pgc-ms">computed in {result.ms} ms</p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ retrieval --- */

function RetrievalControls({ demo, input, set }) {
  const samples = demo.preview?.samples ?? []

  return (
    <>
      <label className="pgc-field">
        <span className="mono">Query</span>
        <textarea rows={3} value={input.query ?? ''} onChange={(e) => set('query', e.target.value)} maxLength={400} />
      </label>

      {samples.length > 0 && (
        <div className="pgc-samples">
          <span className="mono">Try</span>
          {samples.map((sample) => (
            <button key={sample} type="button" className="chip" onClick={() => set('query', sample)}>
              {sample}
            </button>
          ))}
        </div>
      )}

      <div className="pgc-row">
        <label className="pgc-field">
          <span className="mono">Top k</span>
          <input type="number" min={1} max={10} value={input.k ?? 5} onChange={(e) => set('k', Number(e.target.value))} />
        </label>
        <label className="pgc-field">
          <span className="mono">k1 — term saturation</span>
          <input type="range" min={0} max={3} step={0.1} value={input.k1 ?? 1.2} onChange={(e) => set('k1', Number(e.target.value))} />
          <span className="mono tnum">{Number(input.k1 ?? 1.2).toFixed(1)}</span>
        </label>
        <label className="pgc-field">
          <span className="mono">b — length penalty</span>
          <input type="range" min={0} max={1} step={0.05} value={input.b ?? 0.75} onChange={(e) => set('b', Number(e.target.value))} />
          <span className="mono tnum">{Number(input.b ?? 0.75).toFixed(2)}</span>
        </label>
      </div>

      <label className="pgc-check">
        <input type="checkbox" checked={Boolean(input.expand)} onChange={(e) => set('expand', e.target.checked)} />
        <span>Expand the query with synonyms (weighted at half)</span>
      </label>
    </>
  )
}

function RetrievalResult({ result }) {
  const top = result.hits[0]?.score ?? 1

  return (
    <>
      <p className="pgc-head">
        <strong className="tnum">{result.hits.length}</strong> of {result.corpusSize} passages scored above zero for{' '}
        <strong>{result.terms.join(', ') || '—'}</strong>
        {result.expanded.length > 0 && <> · expanded with {result.expanded.join(', ')}</>}
      </p>

      {result.notes.map((note) => (
        <p key={note.kind} className="pgc-note">
          {note.text}
        </p>
      ))}

      <ol className="pgc-hits" role="list">
        {result.hits.map((hit, i) => (
          <li key={hit.id}>
            <div className="pgc-hit-h">
              <span className="mono tnum">{String(i + 1).padStart(2, '0')}</span>
              <span className="h4">{hit.title}</span>
              <span className="mono tnum">{hit.score.toFixed(2)}</span>
            </div>
            <div className="pgc-bar-t" aria-hidden="true">
              <i style={{ width: `${Math.max(2, (hit.score / top) * 100)}%` }} />
            </div>
            <p className="body">{hit.text}</p>
            <p className="mono pgc-parts">
              {hit.source} · {hit.length} terms ·{' '}
              {hit.parts.map((part) => `${part.term} ${part.contribution.toFixed(2)} (tf ${part.tf}, df ${part.df})`).join('  ·  ')}
            </p>
          </li>
        ))}
      </ol>
    </>
  )
}

/* --------------------------------------------------------------- budget --- */

const WINDOWS = [8000, 32000, 128000, 200000, 1000000]

function BudgetControls({ input, set }) {
  const number = (key, label, props = {}) => (
    <label className="pgc-field" key={key}>
      <span className="mono">{label}</span>
      <input type="number" value={input[key] ?? 0} onChange={(e) => set(key, Number(e.target.value))} {...props} />
    </label>
  )

  return (
    <>
      <label className="pgc-field">
        <span className="mono">Prompt</span>
        <textarea rows={5} value={input.text ?? ''} onChange={(e) => set('text', e.target.value)} maxLength={20000} />
      </label>

      <label className="pgc-field">
        <span className="mono">Context window</span>
        <select value={input.window ?? 32000} onChange={(e) => set('window', Number(e.target.value))}>
          {WINDOWS.map((size) => (
            <option key={size} value={size}>
              {size.toLocaleString()} tokens
            </option>
          ))}
        </select>
      </label>

      <div className="pgc-row">
        {number('system', 'System prompt', { min: 0, step: 50 })}
        {number('history', 'History', { min: 0, step: 100 })}
        {number('reserve', 'Reserved for answer', { min: 0, step: 100 })}
      </div>
      <div className="pgc-row">
        {number('topK', 'Passages', { min: 0, max: 100 })}
        {number('chunk', 'Chunk size', { min: 50, max: 4000, step: 50 })}
        {number('overlap', 'Overlap', { min: 0, max: 1000, step: 10 })}
      </div>
    </>
  )
}

function BudgetResult({ result }) {
  return (
    <>
      <p className="pgc-head">
        <strong className="tnum">{result.total.toLocaleString()}</strong> of {result.window.toLocaleString()} tokens
        {result.over > 0 ? (
          <span className="pgc-over"> · over by {result.over.toLocaleString()}</span>
        ) : (
          <span className="pgc-under"> · {(result.window - result.total).toLocaleString()} spare</span>
        )}
      </p>

      <ul className="pgc-segs" role="list">
        {result.segments.map((segment) => (
          <li key={segment.key}>
            <div className="meter-row">
              <span className="mono">{segment.label}</span>
              <span className="mono tnum">
                {segment.tokens.toLocaleString()} · {segment.percent}%
              </span>
            </div>
            <div className="pgc-bar-t" aria-hidden="true">
              <i style={{ width: `${Math.min(100, segment.percent)}%` }} data-fixed={segment.fixed || undefined} />
            </div>
          </li>
        ))}
      </ul>

      <p className="mono pgc-parts">
        Your prompt: {result.estimate.chars.toLocaleString()} characters, {result.estimate.words.toLocaleString()} words,{' '}
        {result.estimate.tokens.toLocaleString()} estimated tokens · {result.fitsChunks} of {result.requestedChunks}{' '}
        passages fit
      </p>

      {result.advice.map((line, i) => (
        <p key={i} className="pgc-note">
          {line}
        </p>
      ))}

      {result.note && <p className="note">{result.note}</p>}
    </>
  )
}

/* ---------------------------------------------------------------- evals --- */

function EvalControls({ demo, input, set }) {
  const labels = demo.preview?.labels ?? Object.keys(input.rules ?? {})

  return (
    <>
      {labels.map((label) => (
        <label className="pgc-field" key={label}>
          <span className="mono">{label} — keywords, comma separated</span>
          <input
            type="text"
            value={input.rules?.[label] ?? ''}
            onChange={(e) => set('rules', { ...input.rules, [label]: e.target.value })}
          />
        </label>
      ))}

      <div className="pgc-row">
        <label className="pgc-field">
          <span className="mono">Fallback label</span>
          <select value={input.fallback ?? labels[0]} onChange={(e) => set('fallback', e.target.value)}>
            {labels.map((label) => (
              <option key={label} value={label}>
                {label}
              </option>
            ))}
          </select>
        </label>
        <label className="pgc-check">
          <input
            type="checkbox"
            checked={Boolean(input.caseSensitive)}
            onChange={(e) => set('caseSensitive', e.target.checked)}
          />
          <span>Case sensitive</span>
        </label>
      </div>
    </>
  )
}

function EvalResult({ result }) {
  return (
    <>
      <p className="pgc-head">
        <strong className="tnum">{result.accuracy}%</strong> accuracy — {result.correct} of {result.total} routed
        correctly
      </p>

      <table className="pgc-table">
        <thead>
          <tr>
            <th scope="col">Label</th>
            <th scope="col" className="tnum">Support</th>
            <th scope="col" className="tnum">Recall</th>
            <th scope="col" className="tnum">Precision</th>
          </tr>
        </thead>
        <tbody>
          {result.perLabel.map((row) => (
            <tr key={row.label}>
              <th scope="row">{row.label}</th>
              <td className="tnum">{row.support}</td>
              <td className="tnum">{row.recall}%</td>
              <td className="tnum">{row.precision}%</td>
            </tr>
          ))}
        </tbody>
      </table>

      {result.notes.map((note, i) => (
        <p key={i} className="pgc-note">
          {note}
        </p>
      ))}

      <ul className="pgc-cases" role="list">
        {result.results.map((item) => (
          <li key={item.id} data-ok={item.correct || undefined}>
            <span className="mono">{item.correct ? 'pass' : 'fail'}</span>
            <span className="pgc-case-b">
              <span className="body">{item.text}</span>
              <span className="mono">
                expected {item.expected} · predicted {item.predicted}
                {item.byFallback ? ' (fallback)' : item.matched.length ? ` on “${item.matched.join('”, “')}”` : ''}
                {item.ambiguous ? ' · ambiguous' : ''}
              </span>
            </span>
          </li>
        ))}
      </ul>
    </>
  )
}
