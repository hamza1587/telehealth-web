import { Box, Button, Card, CardContent, Typography, useTheme } from '@mui/material'
import { Build as BuildIcon } from '@mui/icons-material'

export function NotFoundPage() {
  const theme = useTheme()

  const handleBackToDashboard = () => {
    window.location.href = '/'
  }

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background:
          'radial-gradient(circle at top left, rgba(47, 125, 246, 0.15), transparent 30%), ' +
          'radial-gradient(circle at bottom right, rgba(13, 148, 136, 0.15), transparent 30%), ' +
          'linear-gradient(135deg, #f5f7fa 0%, #e4e9f0 50%, #d1d8e0 100%)',
        p: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 500,
          width: '100%',
          textAlign: 'center',
          borderRadius: 4,
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
          position: 'relative',
          '&::before': {
            content: '""',
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: `linear-gradient(90deg, \${theme.palette.primary.main} 0%, \${theme.palette.success.main} 100%)`,
          },
        }}
      >
        <CardContent sx={{ p: { xs: 4, md: 5 } }}>
          {/* 404 Icon with gradient background */}
          <Box
            sx={{
              width: 120,
              height: 120,
              mx: 'auto',
              mb: 3,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              background: `linear-gradient(135deg, \${theme.palette.primary.light} 0%, \${theme.palette.primary.main} 100%)`,
              boxShadow: `0 8px 24px rgba(47, 125, 246, 0.3)`,
            }}
          >
            <BuildIcon sx={{ fontSize: 60, color: 'white' }} />
          </Box>

          {/* 404 Number */}
          <Typography
            variant="h1"
            sx={{
              fontSize: { xs: '4rem', md: '6rem' },
              fontWeight: 900,
              background: `linear-gradient(135deg, \${theme.palette.primary.main} 0%, \${theme.palette.secondary.main} 100%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              lineHeight: 1,
              mb: 1,
            }}
          >
            404
          </Typography>

          {/* Friendly Message */}
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
             color: 'text.primary',
              mb: 1.5,
              fontSize: { xs: '1.25rem', md: '1.5rem' },
            }}
          >
            Oops! Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: 'text.secondary',
              mb: 4,
              maxWidth: 380,
              mx: 'auto',
              lineHeight: 1.6,
            }}
          >
            The page you are looking for seems to have wandered off into the digital void.
            Don't worry, we will help you get back on track!
          </Typography>

          {/* Back to Dashboard Button */}
          <Button
            variant="contained"
            size="large"
            onClick={handleBackToDashboard}
            sx={{
              px: 4,
              py: 1.5,
              fontSize: '1rem',
              fontWeight: 600,
              borderRadius: 2,
              textTransform: 'none',
              background: `linear-gradient(135deg, \${theme.palette.primary.main} 0%, \${theme.palette.primary.dark} 100%)`,
              boxShadow: `0 4px 14px rgba(47, 125, 246, 0.4)`,
              '&:hover': {
                background: `linear-gradient(135deg, \${theme.palette.primary.dark} 0%, \${theme.palette.primary.main} 100%)`,
                boxShadow: `0 6px 20px rgba(47, 125, 246, 0.5)`,
                transform: 'translateY(-2px)',
              },
              transition: 'all 0.2s ease-in-out',
            }}
          >
            Back to Dashboard
          </Button>
        </CardContent>
      </Card>
    </Box>
  )
}
