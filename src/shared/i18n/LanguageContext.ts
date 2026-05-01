import { createContext } from 'react'
import type { SupportedLanguage } from '@shared/i18n/translations.ts'
import { translations } from '@shared/i18n/translations.ts'

export type LanguageContextValue = {
  language: SupportedLanguage
  setLanguage: (language: SupportedLanguage) => void
  t: (key: keyof typeof translations.en) => string
}

export const LanguageContext = createContext<LanguageContextValue | null>(null)
