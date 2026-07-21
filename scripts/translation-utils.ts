export const looksTranslatable = (value: string) => {
  const normalized = value.trim()
  if (!normalized) return false
  if (normalized.length > 5000) return false
  if (normalized === 'use client' || normalized === 'use server') return false
  if (normalized.includes('${')) return false
  if (/^\{\{.*\}\}$/.test(normalized)) return false
  if (/^[\w.-]+@[\w.-]+\.\w+$/.test(normalized)) return false
  if (/^[\w-]+(\.[\w-]+)+$/.test(normalized)) return false
  if (/^["']?[^"']+["']?\s*<[\w.-]+@[\w.-]+\.\w+>$/.test(normalized)) return false
  if (/^https?:\/\//i.test(normalized)) return false
  if (/^\/[a-z0-9/_-]+$/i.test(normalized)) return false
  if (/^[a-z]+[A-Z][a-zA-Z0-9]*$/.test(normalized)) return false
  if (
    /^[a-z0-9_-]+$/i.test(normalized) &&
    (normalized.includes('_') || normalized.includes('-') || /[0-9]/.test(normalized))
  ) {
    return false
  }

  const jsKeywords = new Set([
    'any',
    'as',
    'boolean',
    'class',
    'const',
    'default',
    'export',
    'false',
    'from',
    'function',
    'import',
    'let',
    'new',
    'null',
    'number',
    'object',
    'return',
    'string',
    'this',
    'true',
    'typeof',
    'undefined',
    'var',
    'void',
  ])
  if (jsKeywords.has(normalized.toLowerCase())) return false

  if (!/[A-Za-z]/.test(normalized)) return false
  if (/^[A-Z_]+$/.test(normalized)) return false
  if (normalized.includes('?.') || normalized.includes('&&') || normalized.includes('||')) return false
  if (
    normalized.includes('===') ||
    normalized.includes('==') ||
    normalized.includes('!==') ||
    normalized.includes('!=')
  ) {
    return false
  }
  if (normalized.includes('resource?.') || normalized.includes('resource.') || normalized.includes('mimeType')) {
    return false
  }
  if (/^data:/i.test(normalized) || normalized.includes('base64,')) return false
  if (/&[a-z0-9#]+;/i.test(normalized)) return false
  if (/^[\s,.:;!?&|#<>()[\]{}~*+=-]*$/.test(normalized)) return false
  if (
    /\b(noopener|noreferrer|prefetch|preload|stylesheet|manifest|viewport|utf-8|use-credentials|crossorigin)\b/i.test(
      normalized,
    )
  ) {
    return false
  }
  if (/^(e\.g\.|e\.g|hostname|hostname:)$/i.test(normalized)) return false
  if (/^(Expected value to be|Video was suspended|console\.|throw new|Error:)/i.test(normalized)) {
    return false
  }
  if (normalized.includes('hostname:') || normalized.toLowerCase().includes('(e.g.')) {
    if (normalized.length < 30) return false
  }
  if (/^[.#]?[a-z0-9:_/\-[\]().% ]+$/i.test(normalized) && /[-:[\]/]/.test(normalized)) {
    return false
  }

  return true
}
