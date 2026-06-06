import type { ReactNode } from 'react'
import { Box, Container } from '@mui/material'

interface ResponsiveLayoutProps {
  children: ReactNode
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false
  noPadding?: boolean
}

export function ResponsiveLayout({ children, maxWidth = 'xl', noPadding = false }: ResponsiveLayoutProps) {
  return (
    <Container
      maxWidth={maxWidth}
      sx={noPadding ? undefined : { px: { xs: 2, sm: 3, md: 4 } }}
    >
      <Box sx={noPadding ? undefined : { py: { xs: 2, sm: 3, md: 4 } }}>
        {children}
      </Box>
    </Container>
  )
}
