import { AppShell } from '@app/layout/AppShell.tsx'
import { ErrorBoundary } from '@shared/components/common/ErrorBoundary.tsx'

export default function App() {
  return (
    <ErrorBoundary>
      <AppShell />
    </ErrorBoundary>
  )
}
