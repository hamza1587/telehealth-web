import type { PropsWithChildren } from 'react'
import { CssBaseline, ThemeProvider } from '@mui/material'
import { appTheme } from '@shared/theme/theme.ts'
import { LanguageProvider } from '@shared/i18n/LanguageProvider.tsx'
import { AuthProvider } from '@shared/auth/AuthContext.tsx'

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ThemeProvider theme={appTheme}>
      <CssBaseline />
      <LanguageProvider>
        <AuthProvider>{children}</AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  )
}
