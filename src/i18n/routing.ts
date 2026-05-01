import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
  locales: ['en', 'bn'],
  defaultLocale: 'en',
  localePrefix: 'as-needed', // English has no prefix → /; Bengali → /bn/
})
