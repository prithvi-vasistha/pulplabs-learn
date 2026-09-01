/**
 * Schema and seed, once, then exit.
 *
 * The server does this on boot when it is the only copy of itself. Under an
 * orchestrator it is a Job that runs before the rollout: two replicas applying
 * the same DDL and the same seed transaction concurrently is a race nobody
 * needs, and a Job gives it somewhere to fail loudly instead.
 *
 *   node src/migrate.js            schema, then seed
 *   node src/migrate.js --prune    also remove rows the export no longer has
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { pool, query, waitForDatabase } from './db.js'
import { seed } from './seed.js'

const here = dirname(fileURLToPath(import.meta.url))

await waitForDatabase()

await query(readFileSync(resolve(here, '../db/schema.sql'), 'utf8'))
console.log('[migrate] schema applied')

if (process.env.SKIP_SEED !== '1') {
  await seed({ prune: process.argv.includes('--prune') || process.env.SEED_PRUNE === '1' })
}

await pool.end()
console.log('[migrate] done')
