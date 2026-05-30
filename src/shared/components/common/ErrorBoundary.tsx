import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Box, Button, Card, CardContent, Typography } from '@mui/material'
import { Error as ErrorIcon } from '@mui/icons-material'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    }
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // Log error to console
    console.error('ErrorBoundary caught an error:', error)
    console.error('Error info:', errorInfo)

    // Update state with error info for display
    this.setState({
      errorInfo,
    })
  }

  handleTryAgain = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    })
  }

  render(): ReactNode {
    const { hasError, error } = this.state
    const { children } = this.props

    if (hasError) {
      const isDev = import.meta.env.DEV
      const showStackTrace = isDev && error

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
              maxWidth: 600,
              width: '100%',
              textAlign: 'center',
              borderRadius: 4,
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
              border: '1px solid',
              borderColor: 'divider',
              overflow: 'hidden',
            }}
          >
            <CardContent sx={{ p: { xs: 4, md: 5 } }}>
              {/* Error Icon */}
              <Box
                sx={{
                  width: 100,
                  height: 100,
                  mx: 'auto',
                  mb: 3,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  borderRadius: '50%',
                  background: (theme) =>
                    `linear-gradient(135deg, \${theme.palette.error.light} 0%, \${theme.palette.error.main} 100%)`,
      boxShadow: '0 8px 24px rgba(244, 67, 54, 0.3)',
      }} >
    </Box>

    {/* Error Message */}
    <Typography
      variant="h4"
      sx={{
        fontWeight: 800,
        color: 'error.main',
        mb: 2,
        fontSize: { xs: '1.75rem', md: '2rem' },
      }}
    >
                <ErrorIcon sx={{ fontSize: 50, color: 'white' }} />
              </Box>

              {/* Error Message */}
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 800,
                  color: 'error.main',
                  mb: 2,
                  fontSize: { xs: '1.75rem', md: '2rem' },
                }}
              >
                Something Went Wrong
              </Typography>

              <Typography
                variant="body1"
                sx={{
                  color: 'text.secondary',
                  mb: showStackTrace ? 3 : 4,
                  maxWidth: 480,
                  mx: 'auto',
                  lineHeight: 1.6,
                }}
              >
                We apologise for the inconvenience. An unexpected error has occurred.
                Please try again or contact support if the problem persists.
              </Typography>

              {/* Stack Trace (Dev Mode Only) */}
              {showStackTrace && (
                <Box
                  sx={{
                    mb: 3,
                    p: 2,
                    borderRadius: 2,
                    backgroundColor: 'grey.900',
                    textAlign: 'left',
                    overflow: 'auto',
                    maxHeight: 200,
                  }}
                >
                  <Typography
                    component="pre"
                    variant="body2"
                    sx={{
                      color: 'grey.200',
                      fontFamily: 'monospace',
                      fontSize: '0.8rem',
                      whiteSpace: 'pre-wrap',
                      wordBreak: 'break-word',
                      m: 0,
                    }}
                  >
                    {error?.stack}
                  </Typography>
                </Box>
              )}

              {/* Try Again Button */}
              <Button
      variant="contained"
      color="error"
      size="large"
      onClick={this.handleTryAgain}
      sx={{
                Try Again
              </Button>
            </CardContent>
          </Card>
        </Box>
      )
    }

    return children
  }
}

