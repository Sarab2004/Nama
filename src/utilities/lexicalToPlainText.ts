type LexicalNode = {
  type?: string
  text?: string
  children?: LexicalNode[]
  [key: string]: unknown
}

type LexicalState = {
  root?: LexicalNode
  [key: string]: unknown
} | null | undefined

const collectText = (node: LexicalNode | undefined, parts: string[]) => {
  if (!node) return

  if (typeof node.text === 'string' && node.text.length > 0) {
    parts.push(node.text)
  }

  if (Array.isArray(node.children)) {
    for (const child of node.children) {
      collectText(child, parts)
    }
  }
}

/**
 * Converts Lexical editor JSON to a plain-text string for SEO / JSON-LD.
 * Does not render HTML and strips structure to concatenated text nodes only.
 */
export const lexicalToPlainText = (data: LexicalState): string => {
  if (!data || typeof data !== 'object') return ''

  const parts: string[] = []
  collectText(data.root, parts)

  return parts
    .join(' ')
    .replace(/\s+/g, ' ')
    .trim()
}
