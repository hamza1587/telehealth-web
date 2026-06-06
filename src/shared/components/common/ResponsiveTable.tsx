import type { ReactNode } from 'react'
import {
  Box,
  Divider,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material'

export interface TableColumn<T> {
  key: keyof T & string
  label: string
  render?: (value: T[keyof T], row: T) => ReactNode
}

interface ResponsiveTableProps<T extends Record<string, unknown>> {
  columns: TableColumn<T>[]
  rows: T[]
  keyField: keyof T & string
  emptyMessage?: string
}

export function ResponsiveTable<T extends Record<string, unknown>>({
  columns,
  rows,
  keyField,
  emptyMessage = 'No data to display.',
}: ResponsiveTableProps<T>) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))

  if (rows.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography color="text.secondary">{emptyMessage}</Typography>
      </Paper>
    )
  }

  if (isMobile) {
    return (
      <Stack spacing={2} role="list" aria-label="Data list">
        {rows.map((row, i) => (
          <Paper key={String(row[keyField] ?? i)} role="listitem" sx={{ p: 2 }}>
            <Stack spacing={1}>
              {columns.map((col, j) => (
                <Box key={col.key}>
                  {j > 0 && <Divider sx={{ mb: 1 }} />}
                  <Typography variant="caption" color="text.secondary" display="block">
                    {col.label}
                  </Typography>
                  <Typography variant="body2">
                    {col.render
                      ? col.render(row[col.key], row)
                      : String(row[col.key] ?? '')}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Paper>
        ))}
      </Stack>
    )
  }

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map(col => (
              <TableCell key={col.key} sx={{ fontWeight: 700 }}>
                {col.label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <TableRow key={String(row[keyField] ?? i)} hover>
              {columns.map(col => (
                <TableCell key={col.key}>
                  {col.render
                    ? col.render(row[col.key], row)
                    : String(row[col.key] ?? '')}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}
