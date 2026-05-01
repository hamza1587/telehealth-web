import { FormControl, FormHelperText, MenuItem, TextField } from '@mui/material'

export function SelectField({
  label,
  value,
  onChange,
  options,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  options: Array<{ value: string; label: string }>
  error?: string
}) {
  return (
    <FormControl fullWidth error={Boolean(error)}>
      <TextField select label={label} value={value} onChange={(event) => onChange(event.target.value)}>
        {options.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
      {error ? <FormHelperText>{error}</FormHelperText> : null}
    </FormControl>
  )
}
