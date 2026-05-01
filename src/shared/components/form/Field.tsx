import { TextField } from '@mui/material'

export function Field({
  label,
  value,
  onChange,
  error,
  type = 'text',
  placeholder,
  multiline = false,
  minRows,
  shrink = false,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  error?: string
  type?: string
  placeholder?: string
  multiline?: boolean
  minRows?: number
  shrink?: boolean
}) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      type={type}
      onChange={(event) => onChange(event.target.value)}
      error={Boolean(error)}
      helperText={error}
      placeholder={placeholder}
      multiline={multiline}
      minRows={minRows}
      slotProps={shrink ? { inputLabel: { shrink: true } } : undefined}
    />
  )
}
