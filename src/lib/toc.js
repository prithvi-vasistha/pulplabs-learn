/** Heading ids and table-of-contents extraction for block content. */

export function slugify(text) {
  return String(text)
    .toLowerCase()
    .replace(/`/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/** Headings in document order, for the table of contents and scroll spy. */
export function tableOfContents(blocks = []) {
  return blocks
    .filter((block) => block.type === 'h2' || block.type === 'h3')
    .map((block) => ({
      id: slugify(block.text),
      text: block.text,
      level: block.type === 'h2' ? 2 : 3,
    }))
}
