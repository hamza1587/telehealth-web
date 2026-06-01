import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material'
import {
  TrendingUp,
  TrendingDown,
  People,
  VideoCall,
  LocalPharmacy,
  Assessment,
  Download,
} from '@mui/icons-material'

interface DashboardMetric {
  id: string
  metricName: string
  value: number
  category: string
  timestamp: string
}

interface AnalyticsReport {
  id: string
  reportName: string
  status: 'pending' | 'completed' | 'failed'
  generatedAt: string
  downloadUrl?: string
}

interface PredictionResult {
  metricName: string
  predictedValue: number
  confidence: number
  predictedFor: string
  metadata: Record<string, number>
}

export const AnalyticsDashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetric[]>([])
  const [reports, setReports] = useState<AnalyticsReport[]>([])
  const [predictions, setPredictions] = useState<PredictionResult[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [daysAhead, setDaysAhead] = useState<number>(7)

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    setLoading(true)
    setError(null)
    try {
      // In production, these would be real API calls to the Analytics Service
      // For now, using mock data that matches the backend structure
      const mockMetrics: DashboardMetric[] = [
        { id: '1', metricName: 'Active Users', value: 1250, category: 'User Engagement', timestamp: new Date().toISOString() },
        { id: '2', metricName: 'Daily Consultations', value: 450, category: 'Consultations', timestamp: new Date().toISOString() },
        { id: '3', metricName: 'Prescription Success Rate', value: 98.5, category: 'Prescriptions', timestamp: new Date().toISOString() },
        { id: '4', metricName: 'Average Wait Time', value: 5.2, category: 'Performance', timestamp: new Date().toISOString() },
        { id: '5', metricName: 'Patient Satisfaction', value: 4.7, category: 'User Engagement', timestamp: new Date().toISOString() },
        { id: '6', metricName: 'Revenue (Daily)', value: 12500, category: 'Financial', timestamp: new Date().toISOString() },
        { id: '7', metricName: 'Video Call Success Rate', value: 99.2, category: 'Performance', timestamp: new Date().toISOString() },
        { id: '8', metricName: 'New Registrations', value: 85, category: 'User Engagement', timestamp: new Date().toISOString() },
      ]

      const mockReports: AnalyticsReport[] = [
        { id: '1', reportName: 'Monthly Consultation Report', status: 'completed', generatedAt: new Date().toISOString(), downloadUrl: '#' },
        { id: '2', reportName: 'Prescription Analytics', status: 'completed', generatedAt: new Date().toISOString(), downloadUrl: '#' },
        { id: '3', reportName: 'User Engagement Analysis', status: 'pending', generatedAt: new Date().toISOString() },
      ]

      const mockPredictions: PredictionResult[] = [
        {
          metricName: 'Active Users',
          predictedValue: 1350,
          confidence: 0.85,
          predictedFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { historical_average: 1250, trend: 0.08, volatility: 0.1 },
        },
        {
          metricName: 'Daily Consultations',
          predictedValue: 480,
          confidence: 0.82,
          predictedFor: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
          metadata: { historical_average: 450, trend: 0.067, volatility: 0.12 },
        },
      ]

      setMetrics(mockMetrics)
      setReports(mockReports)
      setPredictions(mockPredictions)
    } catch (err) {
      setError('Failed to load dashboard data')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (reportName: string) => {
    try {
      // In production, this would call the Analytics Service API
      console.log('Generating report:', reportName)
    } catch (err) {
      setError('Failed to generate report')
    }
  }

  const runPrediction = async (metricName: string) => {
    try {
      // In production, this would call the PredictiveModelingService API
      console.log('Running prediction for:', metricName)
    } catch (err) {
      setError('Failed to run prediction')
    }
  }

  const filteredMetrics = selectedCategory === 'all' 
    ? metrics 
    : metrics.filter(m => m.category === selectedCategory)

  const categories = ['all', ...Array.from(new Set(metrics.map(m => m.category)))]

  const getMetricIcon = (metricName: string) => {
    if (metricName.includes('User') || metricName.includes('Patient')) return <People />
    if (metricName.includes('Consultation') || metricName.includes('Video')) return <VideoCall />
    if (metricName.includes('Prescription') || metricName.includes('Pharmacy')) return <LocalPharmacy />
    return <Assessment />
  }

  const getTrendIcon = (metadata: Record<string, number>) => {
    const trend = metadata.trend || 0
    return trend >= 0 ? <TrendingUp color="success" /> : <TrendingDown color="error" />
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    )
  }

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight="bold">
            Analytics Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Real-time insights and predictive analytics
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Category</InputLabel>
            <Select
              value={selectedCategory}
              label="Category"
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {categories.map(cat => (
                <MenuItem key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <Button variant="outlined" onClick={loadDashboardData}>
            Refresh
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Key Metrics */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {filteredMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Box sx={{ p: 1, borderRadius: 1, bgcolor: 'primary.light', mr: 2 }}>
                    {getMetricIcon(metric.metricName)}
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {metric.category}
                  </Typography>
                </Box>
                <Typography variant="h4" fontWeight="bold">
                  {metric.value.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {metric.metricName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Predictive Analytics */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Predictive Analytics
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Days Ahead</InputLabel>
                <Select
                  value={daysAhead}
                  label="Days Ahead"
                  onChange={(e) => setDaysAhead(Number(e.target.value))}
                >
                  <MenuItem value={7}>7 Days</MenuItem>
                  <MenuItem value={14}>14 Days</MenuItem>
                  <MenuItem value={30}>30 Days</MenuItem>
                </Select>
              </FormControl>
              <Button variant="contained" size="small">
                Run Predictions
              </Button>
            </Box>
          </Box>

          <Grid container spacing={3}>
            {predictions.map((prediction, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card variant="outlined" sx={{ height: '100%' }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {prediction.metricName}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendIcon(prediction.metadata)}
                        <Chip
                          label={`${(prediction.confidence * 100).toFixed(0)}% confidence`}
                          size="small"
                          color={prediction.confidence > 0.8 ? 'success' : 'warning'}
                        />
                      </Box>
                    </Box>
                    <Typography variant="h3" fontWeight="bold" color="primary">
                      {prediction.predictedValue.toLocaleString()}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Predicted for {new Date(prediction.predictedFor).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                      <Typography variant="caption" color="text.secondary">
                        Trend: {(prediction.metadata.trend * 100).toFixed(1)}%
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Volatility: {(prediction.metadata.volatility * 100).toFixed(1)}%
                      </Typography>
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Reports */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h6" fontWeight="bold">
              Generated Reports
            </Typography>
            <Button variant="contained" startIcon={<Assessment />}>
              Generate New Report
            </Button>
          </Box>

          <Grid container spacing={2}>
            {reports.map((report) => (
              <Grid item xs={12} sm={6} md={4} key={report.id}>
                <Card variant="outlined">
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Typography variant="subtitle1" fontWeight="bold">
                        {report.reportName}
                      </Typography>
                      <Chip
                        label={report.status}
                        size="small"
                        color={
                          report.status === 'completed' ? 'success' :
                          report.status === 'pending' ? 'warning' : 'error'
                        }
                      />
                    </Box>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      Generated: {new Date(report.generatedAt).toLocaleString()}
                    </Typography>
                    {report.status === 'completed' && report.downloadUrl && (
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<Download />}
                        fullWidth
                      >
                        Download
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </Box>
  )
}
