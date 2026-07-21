import PageTemplate, { generateMetadata } from './[slug]/page'
import { locales } from '@/i18n/config'

export default PageTemplate

export { generateMetadata }

export async function generateStaticParams() {
  return locales.map((locale) => ({ locale }))
}
