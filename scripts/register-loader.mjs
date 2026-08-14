// Registers the extensionless resolver for scripts/export-content.mjs.
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith('.') && !/\.[mc]?js$/.test(specifier)) {
      for (const suffix of ['.js', '/index.js']) {
        try {
          if (existsSync(fileURLToPath(new URL(specifier + suffix, context.parentURL)))) {
            return nextResolve(specifier + suffix, context)
          }
        } catch {
          // fall through to the default resolver
        }
      }
    }
    return nextResolve(specifier, context)
  },
})
