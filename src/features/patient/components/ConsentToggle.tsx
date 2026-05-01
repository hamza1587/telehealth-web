import { Box, Checkbox, FormControlLabel, FormHelperText } from '@mui/material'

export function ConsentToggle({
  checked,
  onChange,
  label,
  error,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: string
  error?: string
}) {
  return (
    <Box>
      <FormControlLabel
        control={<Checkbox checked={checked} onChange={(event) => onChange(event.target.checked)} />}
        label={label}
        sx={{ alignItems: 'flex-start', m: 0 }}
      />
      {error ? (
        <FormHelperText error sx={{ ml: 4.5, mt: -0.5 }}>
          {error}
        </FormHelperText>
      ) : null}
    </Box>
  )
}
