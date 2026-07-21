import 'dotenv/config'
import { readFile, writeFile, stat } from 'node:fs/promises'
import path from 'node:path'
import { getPayload } from 'payload'
import config from '../src/payload.config'

type Entry = {
  id: string
  english: string
  persian: string
  source: {
    kind: 'frontend' | 'seed' | 'ui'
    path: string
    document?: string
  }
}

function setValueAtPath(obj: any, jsonPath: string, value: any) {
  const tokens = jsonPath
    .replace(/^\$/, '')
    .split(/[.\[\]]+/)
    .filter(Boolean)

  let current = obj
  for (let i = 0; i < tokens.length - 1; i++) {
    const token = tokens[i]
    const nextToken = tokens[i + 1]
    const isNextNumber = !isNaN(Number(nextToken))

    if (!(token in current) || current[token] === null || current[token] === undefined) {
      current[token] = isNextNumber ? [] : {}
    }

    if (current[token] === null || typeof current[token] !== 'object') {
      console.warn(`Warning: Cannot set path '${jsonPath}' because parent '${token}' is a primitive (${typeof current[token]}: ${current[token]})`)
      return
    }

    current = current[token]
  }

  const lastToken = tokens[tokens.length - 1]
  if (current && typeof current === 'object') {
    current[lastToken] = value
  }
}

function cleanData(data: any, isRoot = true): any {
  if (Array.isArray(data)) {
    return data.map((item) => cleanData(item, false))
  }
  if (data && typeof data === 'object') {
    const cleaned = { ...data }
    if (!isRoot) {
      delete cleaned.id
    }
    if (cleaned.type === 'custom') {
      cleaned.reference = null
    } else if (cleaned.type === 'reference') {
      cleaned.url = null
    }
    for (const [key, val] of Object.entries(cleaned)) {
      if (val === '') {
        cleaned[key] = null
      } else {
        cleaned[key] = cleanData(val, false)
      }
    }
    return cleaned
  }
  return data
}

// Maps source.document key to the search criteria in Payload
const docMap: Record<string, { collection: string; where: any }> = {
  'categories.technology': { collection: 'categories', where: { slug: { equals: 'technology' } } },
  'categories.news': { collection: 'categories', where: { slug: { equals: 'news' } } },
  'categories.finance': { collection: 'categories', where: { slug: { equals: 'finance' } } },
  'forms.contact': {
    collection: 'forms',
    where: {
      id: {
        equals: 1,
      },
    },
  },
  'pages.contact': { collection: 'pages', where: { slug: { equals: 'contact' } } },
  'pages.home': { collection: 'pages', where: { slug: { equals: 'home' } } },
  'pages.homeStatic': { collection: 'pages', where: { slug: { equals: 'home' } } },
  'posts.digitalHorizons': { collection: 'posts', where: { slug: { equals: 'digital-horizons' } } },
  'posts.dollarAndSense': { collection: 'posts', where: { slug: { equals: 'dollar-and-sense-the-financial-forecast' } } },
  'posts.globalGaze': { collection: 'posts', where: { slug: { equals: 'global-gaze' } } },
}

async function run() {
  const dryRun = process.argv.includes('--dry-run')
  if (dryRun) {
    console.log('Running in DRY-RUN mode. No changes will be written to the database or files.')
  }

  const fileArg = process.argv.find((arg) => arg.endsWith('.json'))
  let filePath = path.resolve('translations.source.json')
  if (fileArg) {
    filePath = path.resolve(fileArg)
  } else {
    try {
      const stats = await stat(path.resolve('translations.source.fa.completed.json'))
      if (stats.isFile()) {
        filePath = path.resolve('translations.source.fa.completed.json')
      }
    } catch {
      // ignore, fall back to translations.source.json
    }
  }

  console.log(`Reading translations from: ${filePath}`)
  let content: string
  try {
    content = await readFile(filePath, 'utf-8')
  } catch (err) {
    console.error(`Error: Could not read ${filePath}. Make sure the file exists.`)
    process.exit(1)
  }

  const data = JSON.parse(content)
  const entries: Entry[] = data.entries || []

  // 1. Process UI translations
  const uiEntries = entries.filter((e) => e.source.kind === 'ui')
  console.log(`Processing ${uiEntries.length} UI translations...`)

  const enDict = {}
  const faDict = {}

  for (const entry of uiEntries) {
    const pathVal = entry.source.path
    const english = entry.english
    const persian = entry.persian ? entry.persian : entry.english // Fallback to english if empty

    setValueAtPath(enDict, pathVal, english)
    setValueAtPath(faDict, pathVal, persian)
  }

  const dictionaryContent = `import type { Locale } from './config'

export const dictionaries = {
  en: ${JSON.stringify(enDict, null, 2)},
  fa: ${JSON.stringify(faDict, null, 2)},
} as const

export type Dictionary = (typeof dictionaries)[Locale]

export const getDictionary = (locale: Locale): Dictionary => dictionaries[locale]
`

  if (!dryRun) {
    const dictPath = path.resolve('src/i18n/dictionaries.ts')
    await writeFile(dictPath, dictionaryContent, 'utf-8')
    console.log(`Updated UI dictionaries file at: ${dictPath}`)
  } else {
    console.log('Dry-run: Would write UI dictionaries file.')
  }

  // 2. Process Database/Seed translations
  const seedEntries = entries.filter((e) => e.source.kind === 'seed')
  console.log(`Processing ${seedEntries.length} database content translations...`)

  // Group by document
  const groupedEntries: Record<string, Entry[]> = {}
  for (const entry of seedEntries) {
    const docKey = entry.source.document
    if (!docKey) continue
    if (!groupedEntries[docKey]) groupedEntries[docKey] = []
    groupedEntries[docKey].push(entry)
  }

  // Initialize Payload Local API
  console.log('Initializing Payload CMS...')
  const payload = await getPayload({ config })

  for (const [docKey, docEntries] of Object.entries(groupedEntries)) {
    // 2.a Check if it's a global or collection
    const isGlobal = docKey.startsWith('globals.')
    const name = docKey.split('.')[1]

    if (isGlobal) {
      console.log(`Updating global: ${name}...`)
      // Fetch the master global in default locale 'fa'
      const globalSource = await payload.findGlobal({
        slug: name as any,
        locale: 'fa',
        depth: 0,
      })

      // Clean metadata fields
      delete (globalSource as any).updatedAt

      // Make deep copies for both locales
      const globalEn = JSON.parse(JSON.stringify(globalSource))
      const globalFa = JSON.parse(JSON.stringify(globalSource))

      for (const entry of docEntries) {
        const pathVal = entry.source.path
        const english = entry.english
        const persian = entry.persian ? entry.persian : entry.english // Fallback to english if empty

        setValueAtPath(globalEn, pathVal, english)
        setValueAtPath(globalFa, pathVal, persian)
      }

      if (!dryRun) {
        try {
          const enCleaned = cleanData(globalEn)
          const faCleaned = cleanData(globalFa)

          await payload.updateGlobal({
            slug: name as any,
            locale: 'en',
            data: enCleaned,
            context: { disableRevalidate: true },
          })
          await payload.updateGlobal({
            slug: name as any,
            locale: 'fa',
            data: faCleaned,
            context: { disableRevalidate: true },
          })
          console.log(`Global '${name}' updated successfully in both locales.`)
        } catch (err: any) {
          console.error(`Error updating global '${name}':`, err)
          if (err && err.data) {
            console.error('Validation errors:', JSON.stringify(err.data, null, 2))
          }
          throw err
        }
      } else {
        console.log(`Dry-run: Would update global '${name}' in both locales.`)
      }
    } else {
      // It's a collection
      const mapItem = docMap[docKey]
      if (!mapItem) {
        console.warn(`Warning: No mapping found for document key: ${docKey}`)
        continue
      }

      const { collection, where } = mapItem
      // Find document in DB
      const result = await payload.find({
        collection: collection as any,
        where,
        limit: 1,
        locale: 'en',
      })

      const doc = result.docs?.[0]
      if (!doc) {
        console.warn(`Warning: Document not found in database for query: ${JSON.stringify(where)}`)
        continue
      }

      console.log(`Updating collection '${collection}' document ID: ${doc.id} (${docKey})...`)

      // Fetch the master document in default locale 'fa'
      const docSource = await payload.findByID({
        collection: collection as any,
        id: doc.id,
        locale: 'fa',
        depth: 0,
      })

      // Clean read-only/metadata fields to prevent schema/hook collision
      const cleanDoc = (obj: any) => {
        const cleaned = { ...obj }
        delete cleaned.id
        delete cleaned.createdAt
        delete cleaned.updatedAt
        delete cleaned.populatedAuthors
        return cleaned
      }

      // Make deep copies for both locales
      const enData = cleanDoc(JSON.parse(JSON.stringify(docSource)))
      const faData = cleanDoc(JSON.parse(JSON.stringify(docSource)))

      for (const entry of docEntries) {
        const pathVal = entry.source.path
        const english = entry.english
        const persian = entry.persian ? entry.persian : entry.english // Fallback to english if empty

        setValueAtPath(enData, pathVal, english)
        setValueAtPath(faData, pathVal, persian)
      }

      if (!dryRun) {
        await payload.update({
          collection: collection as any,
          id: doc.id,
          locale: 'en',
          data: cleanData(enData),
          context: { disableRevalidate: true },
        })
        await payload.update({
          collection: collection as any,
          id: doc.id,
          locale: 'fa',
          data: cleanData(faData),
          context: { disableRevalidate: true },
        })
        console.log(`Document '${docKey}' updated successfully in both locales.`)
      } else {
        console.log(`Dry-run: Would update collection document '${docKey}' in both locales.`)
      }
    }
  }

  console.log('\nImport operations completed successfully!')
  process.exit(0)
}

run().catch((err) => {
  console.error('Unhandled import error:', err)
  process.exit(1)
})
