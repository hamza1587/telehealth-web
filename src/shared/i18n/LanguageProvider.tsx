import { useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'
import { useLocalStorage } from 'react-haiku'
import { LanguageContext } from '@shared/i18n/LanguageContext.ts'
import type { SupportedLanguage } from '@shared/i18n/translations.ts'
import { translations } from '@shared/i18n/translations.ts'

export function LanguageProvider({ children }: PropsWithChildren) {
  const [storedLanguage, setStoredLanguage] = useLocalStorage<SupportedLanguage>('telehealth-language', 'en')
  const [language, setLanguageState] = useState<SupportedLanguage>(
    storedLanguage === 'de' ? 'de' : 'en',
  )

  const setLanguage = useCallback((languageValue: SupportedLanguage) => {
    setLanguageState(languageValue)
    setStoredLanguage(languageValue)
  }, [setStoredLanguage])

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key: keyof typeof translations.en) => translations[language][key],
    }),
    [language, setLanguage],
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}
