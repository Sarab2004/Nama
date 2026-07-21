import { readdir, readFile, stat, writeFile } from 'node:fs/promises'
import path from 'node:path'

import { contact } from '../src/endpoints/seed/contact-page'
import { contactForm } from '../src/endpoints/seed/contact-form'
import { home } from '../src/endpoints/seed/home'
import { homeStatic } from '../src/endpoints/seed/home-static'
import { post1 } from '../src/endpoints/seed/post-1'
import { post2 } from '../src/endpoints/seed/post-2'
import { post3 } from '../src/endpoints/seed/post-3'
import { dictionaries } from '../src/i18n/dictionaries'
import { looksTranslatable } from './translation-utils'

type Entry = {
  english: string
  id: string
  persian: string
  source: {
    document: string
    kind: 'frontend' | 'seed' | 'ui'
    path: string
  }
}

const dummyMedia = {
  id: 1,
  alt: 'Translation placeholder media',
  filename: 'placeholder.webp',
  height: 900,
  mimeType: 'image/webp',
  url: '/media/placeholder.webp',
  width: 1600,
}

const dummyUser = {
  id: 1,
  email: 'demo@example.com',
  name: 'Demo Author',
}

const dummyForm = {
  id: 1,
  title: 'Contact Form',
}

const seedDocuments: Record<string, unknown> = {
  'categories.technology': {
    slug: 'technology',
    title: 'Technology',
  },
  'categories.news': {
    slug: 'news',
    title: 'News',
  },
  'categories.finance': {
    slug: 'finance',
    title: 'Finance',
  },
  'forms.contact': contactForm,
  'globals.footer': {
    navItems: [
      { link: { label: 'Admin', type: 'custom', url: '/admin' } },
      { link: { label: 'Source Code', type: 'custom', url: 'https://github.com/payloadcms/payload' } },
      { link: { label: 'Payload', type: 'custom', url: 'https://payloadcms.com/' } },
    ],
  },
  'globals.header': {
    navItems: [
      { link: { label: 'Posts', type: 'reference' } },
      { link: { label: 'Contact', type: 'reference' } },
    ],
  },
  'pages.contact': contact({ contactForm: dummyForm as never }),
  'pages.home': home({ heroImage: dummyMedia as never, metaImage: dummyMedia as never }),
  'pages.homeStatic': homeStatic,
  'posts.digitalHorizons': post1({
    author: dummyUser as never,
    blockImage: dummyMedia as never,
    heroImage: dummyMedia as never,
  }),
  'posts.dollarAndSense': post3({
    author: dummyUser as never,
    blockImage: dummyMedia as never,
    heroImage: dummyMedia as never,
  }),
  'posts.globalGaze': post2({
    author: dummyUser as never,
    blockImage: dummyMedia as never,
    heroImage: dummyMedia as never,
  }),
}

const translatableKeys = new Set([
  'alt',
  'confirmationMessage',
  'description',
  'label',
  'message',
  'metaDescription',
  'metaTitle',
  'name',
  'submitButtonLabel',
  'text',
  'title',
])

const skippedKeys = new Set([
  '_status',
  'appearance',
  'blockName',
  'blockType',
  'code',
  'createdAt',
  'direction',
  'email',
  'filename',
  'format',
  'href',
  'id',
  'language',
  'mimeType',
  'mode',
  'populateBy',
  'relationTo',
  'size',
  'slug',
  'style',
  'tag',
  'type',
  'updatedAt',
  'url',
  'value',
  'confirmationType',
  'linkType',
  'emailTo',
  'emailFrom',
  'replyTo',
])

const shouldSkipPath = (document: string, path: string, key: string) => {
  // Exclude forms.contact.fields[*].name, etc.
  if (key === 'name' && (path.includes('.fields[') || path.includes('.fields.'))) {
    return true
  }
  if (key === 'name' && (path.includes('.authors[') || path.includes('.authors.'))) {
    return true
  }
  if (path.endsWith('.form.title')) {
    return true
  }
  return false
}

const pathToId = (document: string, valuePath: string) =>
  `${document}.${valuePath}`
    .replace(/\[(\d+)\]/g, '.$1')
    .replace(/[^a-zA-Z0-9.]+/g, '.')
    .replace(/\.+/g, '.')
    .replace(/^\.|\.$/g, '')

const pushEntry = (entries: Entry[], document: string, valuePath: string, english: string) => {
  const normalized = english.trim()
  if (!looksTranslatable(normalized)) return

  entries.push({
    english: normalized,
    id: pathToId(document, valuePath),
    persian: '',
    source: {
      document,
      kind: 'seed',
      path: valuePath,
    },
  })
}

const walkSeed = (entries: Entry[], document: string, value: unknown, valuePath = '$') => {
  if (Array.isArray(value)) {
    value.forEach((item, index) => walkSeed(entries, document, item, `${valuePath}[${index}]`))
    return
  }

  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    if (skippedKeys.has(key)) continue

    const childPath = `${valuePath}.${key}`
    if (shouldSkipPath(document, childPath, key)) continue

    if (typeof child === 'string') {
      if (translatableKeys.has(key) || looksTranslatable(child)) {
        pushEntry(entries, document, childPath, child)
      }
      continue
    }

    walkSeed(entries, document, child, childPath)
  }
}

function getValueAtPath(obj: any, jsonPath: string): string | undefined {
  const tokens = jsonPath
    .replace(/^\$/, '')
    .split(/[.\[\]]+/)
    .filter(Boolean)

  let current = obj
  for (const token of tokens) {
    if (current && typeof current === 'object' && token in current) {
      current = current[token]
    } else {
      return undefined
    }
  }
  return typeof current === 'string' ? current : undefined
}

const walkUi = (entries: Entry[], value: unknown, valuePath = '$') => {
  if (!value || typeof value !== 'object') return

  for (const [key, child] of Object.entries(value)) {
    const childPath = `${valuePath}.${key}`

    if (typeof child === 'string') {
      const existingPersian = getValueAtPath(dictionaries.fa, childPath)
      entries.push({
        english: child.trim(),
        id: pathToId('ui.dictionary', childPath),
        persian: existingPersian || '',
        source: {
          document: 'ui.dictionary',
          kind: 'ui',
          path: childPath,
        },
      })
      continue
    }

    walkUi(entries, child, childPath)
  }
}

const sourceExtensions = new Set(['.ts', '.tsx', '.js', '.jsx'])
const ignoredSourceSegments = new Set([
  '.next',
  'node_modules',
  'payload-types.ts',
  'importMap.js',
  'payload.config.ts',
])

const shouldScanFile = (filePath: string) => {
  const normalized = filePath.split(path.sep)
  if (normalized.some((segment) => ignoredSourceSegments.has(segment))) return false
  if (filePath.includes(`${path.sep}endpoints${path.sep}seed${path.sep}`)) return false
  if (filePath.includes(`${path.sep}i18n${path.sep}dictionaries.ts`)) return false
  if (filePath.includes(`${path.sep}app${path.sep}(payload)${path.sep}`)) return false
  if (filePath.includes(`${path.sep}app${path.sep}(frontend)${path.sep}(sitemaps)${path.sep}`)) return false
  if (filePath.includes(`${path.sep}app${path.sep}(frontend)${path.sep}next${path.sep}`)) return false
  if (filePath.includes(`${path.sep}collections${path.sep}`)) return false
  if (filePath.includes(`${path.sep}components${path.sep}BeforeDashboard${path.sep}`)) return false
  if (filePath.includes(`${path.sep}components${path.sep}Logo${path.sep}`)) return false
  if (filePath.includes(`${path.sep}fields${path.sep}`)) return false
  if (filePath.includes(`${path.sep}heros${path.sep}PostHero${path.sep}`)) return false
  if (filePath.includes(`${path.sep}components${path.sep}ui${path.sep}`)) return false
  if (filePath.includes(`${path.sep}providers${path.sep}`)) return false
  if (filePath.includes(`${path.sep}blocks${path.sep}Form${path.sep}Country${path.sep}options.ts`)) {
    return false
  }
  if (filePath.includes(`${path.sep}blocks${path.sep}Form${path.sep}State${path.sep}options.ts`)) {
    return false
  }
  if (filePath.includes(`${path.sep}hooks${path.sep}`)) return false
  if (filePath.includes(`${path.sep}plugins${path.sep}`)) return false
  if (filePath.includes(`${path.sep}utilities${path.sep}`)) return false
  if (filePath.endsWith(`${path.sep}config.ts`)) return false

  return sourceExtensions.has(path.extname(filePath))
}

const listSourceFiles = async (dir: string): Promise<string[]> => {
  const entries = await readdir(dir)
  const files = await Promise.all(
    entries.map(async (entry) => {
      const fullPath = path.join(dir, entry)
      const fullPathStat = await stat(fullPath)

      if (fullPathStat.isDirectory()) return listSourceFiles(fullPath)
      if (fullPathStat.isFile() && shouldScanFile(fullPath)) return [fullPath]

      return []
    }),
  )

  return files.flat()
}

const normalizeCodeText = (value: string) =>
  value
    .replace(/\\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const lineLooksTechnical = (line: string) => {
  const trimmed = line.trim()
  if (trimmed.startsWith('//') || trimmed.startsWith('/*') || trimmed.startsWith('*')) return true
  if (/\b(throw new Error|console\.(log|warn|error|info|debug))\b/.test(line)) return true
  return (
    /\b(import|from|export type|type |interface |const .* = require)\b/.test(line) ||
    /\b(className|imgClassName|captionClassName|pictureClassName|videoClassName|variant|size|relationTo|collection|slug|href|src|url|type|name|id|key|value|defaultValue|blockType|interfaceName)\s*[=:]/.test(
      line,
    ) ||
    /@\/|\.\.\/|\.\/|node:|payload|react|next\//.test(line)
  )
}

const pushFrontendEntry = (
  entries: Entry[],
  filePath: string,
  lineNumber: number,
  english: string,
) => {
  const normalized = normalizeCodeText(english)
  if (!looksTranslatable(normalized)) return

  const relativePath = path.relative(process.cwd(), filePath).replaceAll(path.sep, '/')
  entries.push({
    english: normalized,
    id: pathToId('frontend.code', `${relativePath}.line${lineNumber}.${normalized.slice(0, 32)}`),
    persian: '',
    source: {
      document: relativePath,
      kind: 'frontend',
      path: `line:${lineNumber}`,
    },
  })
}

const scanFrontendCode = async (entries: Entry[]) => {
  const files = await listSourceFiles(path.resolve(process.cwd(), 'src'))

  for (const filePath of files) {
    const source = await readFile(filePath, 'utf8')
    const lines = source.split(/\r?\n/)

    lines.forEach((line, index) => {
      if (lineLooksTechnical(line)) return

      const lineNumber = index + 1
      const jsxTextMatches = line.matchAll(/>([^<>{}][^<>]*?[A-Za-z][^<>]*?)</g)
      for (const match of jsxTextMatches) {
        pushFrontendEntry(entries, filePath, lineNumber, match[1])
      }

      const stringMatches = line.matchAll(/(?<!import\s)(['"`])((?:(?!\1).)*[A-Za-z][\s,.:;!?][^'"`]*)\1/g)
      for (const match of stringMatches) {
        pushFrontendEntry(entries, filePath, lineNumber, match[2])
      }
    })
  }
}

const entries: Entry[] = []

for (const [document, data] of Object.entries(seedDocuments)) {
  walkSeed(entries, document, data)
}

walkUi(entries, dictionaries.en)
await scanFrontendCode(entries)

const seen = new Set<string>()
const dedupedEntries = entries.filter((entry) => {
  const key = `${entry.source.document}:${entry.source.path}:${entry.english}`
  if (seen.has(key)) return false
  seen.add(key)
  return true
})

const output = {
  meta: {
    generatedAt: new Date().toISOString(),
    sourceLocale: 'en',
    targetLocale: 'fa',
    entryCount: dedupedEntries.length,
    instructions:
      'Translate only the persian field. Keep id, source, path, document, kind, and english unchanged. Preserve placeholders, URLs, product names, and code-like tokens.',
  },
  entries: dedupedEntries,
}

const outputPath = path.resolve(process.cwd(), 'translations.source.json')
await writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, 'utf8')

console.log(`Wrote ${dedupedEntries.length} translation entries to ${outputPath}`)
