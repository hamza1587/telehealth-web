import { FormControl, MenuItem, Select, Stack, Typography } from '@mui/material'
import { supportedLanguages } from '@shared/i18n/translations.ts'
import { useLanguage } from '@shared/i18n/useLanguage.ts'

export function LanguageSwitcher() {
  const { language, setLanguage, t } = useLanguage()

  return (
    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary">
        {t('language')}
      </Typography>
      <FormControl size="small" sx={{ minWidth: 130 }}>
        <Select value={language} onChange={(event) => setLanguage(event.target.value as typeof language)}>
          {supportedLanguages.map((item) => (
            <MenuItem key={item.code} value={item.code}>
              {item.label}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </Stack>
  )
}
