import { readFile } from 'node:fs/promises'
import path from 'node:path'
import { looksTranslatable } from './translation-utils'


type Entry = {
  id: string
  english: string
  persian: string
  source: {
    kind: string
    path: string
    document?: string
  }
}

async function validate() {
  const filePath = path.resolve('translations.source.json')
  
  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch (err) {
    console.error(`Error: Could not read ${filePath}. Make sure you run translations:export first.`)
    process.exit(1)
  }

  let entries: any
  try {
    const parsed = JSON.parse(content)
    entries = parsed.entries || parsed
  } catch (err) {
    console.error(`Error: Failed to parse translations.source.json as valid JSON:`, err)
    process.exit(1)
  }

  if (!Array.isArray(entries)) {
    console.error('Error: translations.source.json must contain an "entries" array.')
    process.exit(1)
  }

  console.log(`Validating ${entries.length} translation entries...`)

  let errorsCount = 0
  const ids = new Set<string>()

  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i] as Partial<Entry>
    const indexStr = `[Index ${i}]`

    // 1. Structure validation
    if (!entry.id) {
      console.error(`${indexStr} Error: Missing 'id' field.`)
      errorsCount++
      continue
    }

    const entryId = entry.id
    if (ids.has(entryId)) {
      console.error(`Error: Duplicate ID found: "${entryId}"`)
      errorsCount++
    }
    ids.add(entryId)

    if (entry.english === undefined) {
      console.error(`[ID: ${entryId}] Error: Missing 'english' field.`)
      errorsCount++
    }

    if (entry.persian === undefined) {
      console.error(`[ID: ${entryId}] Error: Missing 'persian' field.`)
      errorsCount++
      continue
    }

    const englishVal = entry.english || ''
    const persianVal = entry.persian || ''

    if (!looksTranslatable(englishVal)) {
      console.error(`[ID: ${entryId}] Error: Technical or non-translatable English string found: "${englishVal}"`)
      errorsCount++
    }

    if (!persianVal.trim() && englishVal.trim()) {
      console.warn(`[ID: ${entryId}] Warning: Persian translation is empty for English value: "${englishVal}"`)
    }

    // 2. Placeholders validation
    // Match common placeholder styles: {{name}}, %s, {name}
    const placeholderRegex = /\{\{[\w.-]+\}\}|\{[\w.-]+\}|%s|%d/g
    const engPlaceholders = englishVal.match(placeholderRegex) || []
    const faPlaceholders = persianVal.match(placeholderRegex) || []

    const engSorted = [...engPlaceholders].sort()
    const faSorted = [...faPlaceholders].sort()

    if (JSON.stringify(engSorted) !== JSON.stringify(faSorted)) {
      console.error(
        `[ID: ${entryId}] Error: Placeholders mismatch!\n` +
        `  English: [${engSorted.join(', ')}]\n` +
        `  Persian: [${faSorted.join(', ')}]`
      )
      errorsCount++
    }
  }

  if (errorsCount > 0) {
    console.error(`\nValidation FAILED with ${errorsCount} error(s).`)
    process.exit(1)
  } else {
    console.log('\nValidation PASSED successfully!')
    process.exit(0)
  }
}

validate().catch((err) => {
  console.error('Unhandled validation error:', err)
  process.exit(1)
})
