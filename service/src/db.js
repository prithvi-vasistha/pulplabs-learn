import pg from 'pg'

/**
 * One pool for the process.
 *
 * `DATABASE_URL` is the only configuration. Everything else — pool size,
 * timeouts — has a default that is right for a single small service and is
 * overridable by environment variable rather than by editing code.
 */
export const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: Number(process.env.PGPOOL_MAX ?? 10),
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
})

export function query(text, params) {
  return pool.query(text, params)
}

export async function rows(text, params) {
  const result = await pool.query(text, params)
  return result.rows
}

export async function one(text, params) {
  const result = await pool.query(text, params)
  return result.rows[0] ?? null
}

/**
 * Block until Postgres answers.
 *
 * The database and the service start together, so the service will lose that
 * race on a cold container. Retrying is the normal path, not an error case.
 */
export async function waitForDatabase({ attempts = 60, delayMs = 1000 } = {}) {
  for (let i = 1; i <= attempts; i++) {
    try {
      await pool.query('select 1')
      return
    } catch (error) {
      if (i === attempts) throw error
      if (i === 1 || i % 5 === 0) {
        console.log(`[db] not ready yet (${i}/${attempts}): ${error.code ?? error.message}`)
      }
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
}
