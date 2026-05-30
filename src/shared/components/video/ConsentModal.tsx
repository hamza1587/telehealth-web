import React, { useEffect, useRef } from 'react'
import { Button, Card, CardContent, CardHeader, Typography } from '@mui/material'

interface ConsentModalProps {
  onConfirm: () => void
  onCancel: () => void
}

export const ConsentModal: React.FC<ConsentModalProps> = ({
  onConfirm,
  onCancel
}) => {
  const modalRef = useRef<HTMLDivElement>(null)
  const confirmButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCancel()
      }
    }

    document.addEventListener('keydown', handleEscape)
    document.body.style.overflow = 'hidden'

    confirmButtonRef.current?.focus()

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [onCancel])

  const handleTab = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !modalRef.current) return

    const focusableElements = modalRef.current.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault()
        firstElement.focus()
      }
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="consent-title"
    >
      <Card
        ref={modalRef}
        className="w-full max-w-md"
        onKeyDown={handleTab}
      >
        <CardHeader>
          <Typography variant="h6" id="consent-title">Recording Consent</Typography>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-gray-600">
            This consultation will be recorded for medical record purposes and quality assurance.
            By proceeding, you consent to:
          </p>
          <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
            <li>Audio and video recording of this consultation</li>
            <li>Storage of the recording in compliance with GDPR/HIPAA</li>
            <li>Access by authorized healthcare providers</li>
          </ul>
          <p className="text-sm text-gray-600">
            You may request deletion of the recording at any time through your account settings.
          </p>
          <div className="flex gap-3 pt-4">
            <Button
              variant="outlined"
              className="flex-1"
              onClick={onCancel}
              ref={cancelButtonRef}
              aria-label="Decline recording"
            >
              Decline
            </Button>
            <Button
              className="flex-1"
              onClick={onConfirm}
              ref={confirmButtonRef}
              aria-label="Accept recording consent"
            >
              Accept & Start Recording
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}