/**
 * Generated cover art.
 *
 * Every course, track, project and field entry gets its own pastel composition
 * rather than sharing one photograph. They are generated, not authored: a
 * palette and a set of blurred shapes derived from the item's slug, so a new
 * lesson has cover art the moment it has a name and two items never collide by
 * accident.
 *
 * Colour is the one thing the covers own. The interface around them stays
 * achromatic, which is what keeps a grid of these reading as a catalogue
 * rather than as noise.
 */

/** Eight families. Named for what they look like, not for where they are used. */
export const PALETTES = ['ember', 'kelp', 'iris', 'lagoon', 'clay', 'orchid', 'meadow', 'dusk']

/** FNV-1a. Small, stable, and identical on the server and in the browser. */
function hash(seed) {
  let h = 0x811c9dc5
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** Deterministic 0..1 stream from one seed, so a slug always draws the same art. */
function rng(seed) {
  let state = hash(seed) || 1
  return () => {
    state ^= state << 13
    state >>>= 0
    state ^= state >> 17
    state ^= state << 5
    state >>>= 0
    return state / 0xffffffff
  }
}

/**
 * A composition: four soft shapes, placed so they overlap and run off the
 * edges. Contained shapes read as blobs; shapes that leave the frame read as a
 * detail of something larger, which is the difference between a sticker and
 * cover art.
 */
export function coverFor(seed, paletteOverride) {
  const next = rng(seed)
  const palette = paletteOverride ?? PALETTES[Math.floor(next() * PALETTES.length)]

  const shapes = Array.from({ length: 4 }, (_, i) => ({
    cx: 40 + next() * 320,
    cy: 30 + next() * 240,
    rx: 90 + next() * 150,
    ry: 60 + next() * 110,
    rot: Math.floor(next() * 180),
    tone: (i % 3) + 1,
    o: 0.7 + next() * 0.3,
  }))

  return { palette, shapes, id: `cv${hash(seed).toString(36)}` }
}
