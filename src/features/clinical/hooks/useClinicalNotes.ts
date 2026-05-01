import { useState, useEffect } from 'react'
import { apiBaseUrl } from '@shared/config/patient.ts'
import type { ClinicalNote, ClinicalNoteForm } from '@shared/types/clinical.ts'

export function useClinicalNotes(consultationId: string | null) {
  const [note, setNote] = useState<ClinicalNote | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  // Fetch clinical note
  useEffect(() => {
    if (!consultationId) return

    const fetchNote = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch(`${apiBaseUrl}/clinical-notes/consultation/${consultationId}`)
        if (!response.ok) {
          if (response.status === 404) {
            setNote(null)
            return
          }
          throw new Error('Failed to fetch clinical note')
        }
        const data = await response.json()
        setNote(data.note)
      } catch (err) {
        console.error('[API Error] Failed to fetch clinical note:', {
          error: err instanceof Error ? err.message : String(err),
          timestamp: new Date().toISOString(),
          endpoint: `/platform/consultations/${consultationId}/note`
        })
        setError(err instanceof Error ? err.message : 'Failed to load clinical note')
      } finally {
        setLoading(false)
      }
    }

    fetchNote()
  }, [consultationId])

  // Save draft
  const saveDraft = async (form: ClinicalNoteForm) => {
    if (!consultationId) return null

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/clinical-notes/consultation/${consultationId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error('Failed to save draft')
      }

      const data = await response.json()
      setNote(data.note)
      return data.note
    } catch (err) {
      console.error('[API Error] Failed to save clinical note draft:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/consultations/${consultationId}/note`
      })
      setError(err instanceof Error ? err.message : 'Failed to save draft')
      return null
    } finally {
      setSaving(false)
    }
  }

  // Finalize note
  const finalizeNote = async () => {
    if (!note) return null

    setSaving(true)
    setError(null)
    try {
      const response = await fetch(`${apiBaseUrl}/clinical-notes/${note.id}/finalize`, {
        method: 'POST',
      })

      if (!response.ok) {
        throw new Error('Failed to finalize note')
      }

      const data = await response.json()
      setNote(data.note)
      return data.note
    } catch (err) {
      console.error('[API Error] Failed to finalize clinical note:', {
        error: err instanceof Error ? err.message : String(err),
        timestamp: new Date().toISOString(),
        endpoint: `/platform/notes/${note.id}/finalize`
      })
      setError(err instanceof Error ? err.message : 'Failed to finalize note')
      return null
    } finally {
      setSaving(false)
    }
  }

  return {
    note,
    loading,
    error,
    saving,
    saveDraft,
    finalizeNote,
  }
}