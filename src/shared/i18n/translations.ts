export type SupportedLanguage = 'en' | 'de'

export const supportedLanguages: Array<{ code: SupportedLanguage; label: string }> = [
  { code: 'en', label: 'English' },
  { code: 'de', label: 'Deutsch' },
]

export const translations = {
  en: {
    language: 'Language',
  },
  de: {
    language: 'Sprache',
  },
} as const
