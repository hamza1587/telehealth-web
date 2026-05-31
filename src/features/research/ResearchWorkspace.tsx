import { Box } from '@mui/material'
import { ResearchStudiesList } from './components/ResearchStudiesList.tsx'
import { ResearchStudyDetail } from './components/ResearchStudyDetail.tsx'
import { useResearchStudies } from './hooks/useResearchStudies.ts'
import { useState } from 'react'

export function ResearchWorkspace() {
  const {
    studies,
    loading,
    error,
    fetchStudies,
    enrollInStudy,
    withdrawFromStudy,
  } = useResearchStudies()

  const [selectedStudy, setSelectedStudy] = useState<string | null>(null)

  const selectedStudyData = studies.find(s => s.id === selectedStudy) || null
  const isEnrolled = selectedStudyData?.isEnrolled ?? false

  return (
    <Box>
      {!selectedStudy ? (
        <ResearchStudiesList
          studies={studies}
          loading={loading}
  error={error ?? undefined}
  onEnroll={async (studyId, form): Promise<boolean> => {
    const result = await enrollInStudy(studyId, form)
    if (result) setSelectedStudy(studyId)
    return result
  }}
  onWithdraw={async (studyId): Promise<boolean> => {
    return await withdrawFromStudy(studyId)
  }}
        />
      ) : (
        <ResearchStudyDetail
          study={selectedStudyData}
          loading={loading}
  error={error ?? undefined}
  isEnrolled={isEnrolled}
  onEnroll={async (form): Promise<boolean> => {
    const result = await enrollInStudy(selectedStudy!, form)
    if (result) fetchStudies()
    return result
  }}
  onWithdraw={async (): Promise<boolean> => {
    const result = await withdrawFromStudy(selectedStudy!)
    if (result) setSelectedStudy(null)
    return result
  }}
        />
      )}

      {selectedStudy && (
        <Box sx={{ mt: 2, textAlign: 'center' }}>
          <Box
            component="span"
            sx={{
              color: 'primary.main',
              cursor: 'pointer',
              fontWeight: 600,
              '&:hover': { textDecoration: 'underline' },
            }}
            onClick={() => setSelectedStudy(null)}
          >
            ← Back to all studies
          </Box>
        </Box>
      )}
    </Box>
  )
}