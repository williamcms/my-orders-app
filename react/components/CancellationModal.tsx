/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'

import { Button } from './ui/button'
import styles from '../styles/cancellationModal.module.css'

interface CancellationModalProps {
  allowCancellation?: boolean
  orderId: string
  shouldShow?: boolean
}

export const CancellationModal = ({ allowCancellation, orderId, shouldShow = true }: CancellationModalProps) => {
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [cancelError, setCancelError] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherReasonText, setOtherReasonText] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReason || (selectedReason === 'Outro' && !otherReasonText.trim())) return

    setSubmitting(true)

    try {
      await fetch(`/api/checkout/pub/orders/${orderId}/user-cancel-request`, {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'cache-control': 'no-cache',
          'content-type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          reason: selectedReason === 'Outro' ? otherReasonText.trim() : selectedReason,
        }),
      })

      setCancelSuccess(true)
    } catch {
      setCancelError(true)
    } finally {
      setSubmitting(false)
    }
  }

  const handleClose = () => {
    if (submitting) return

    setCancelSuccess(false)
    setCancelError(false)
    setSelectedReason(null)
    setOtherReasonText('')

    setIsOpen(!isOpen)
  }

  const OpenModalButton = () => (
    <Button variant="destructive" disabled={allowCancellation !== true} onClick={() => setIsOpen(!isOpen)}>
      Cancelar Pedido
    </Button>
  )

  if (!shouldShow) return null

  return (
    <>
      <OpenModalButton />

      {isOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>Cancelar Pedido</h2>
              <button
                className={styles.modalCloseButton}
                onClick={handleClose}
                disabled={submitting}
                aria-label="Fechar modal"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m18 6-12 12" />
                  <path d="m6 6 12 12" />
                </svg>
              </button>
            </div>

            <div className={styles.modalContent}>
              <p className={styles.modalText}>
                Você tem certeza que deseja cancelar este pedido? Esta ação não pode ser desfeita.
              </p>

              <form onSubmit={handleSubmit} className={styles.cancellationForm}>
                <div className={styles.cancelReasons}>
                  <h3 className={styles.cancelReasonsTitle}>Motivo do cancelamento:</h3>
                  {[
                    'Não quero mais este produto.',
                    'Comprei sem querer.',
                    'A entrega vai demorar demais.',
                    'Encontrei um preço melhor em outro lugar.',
                    'Prefiro não informar.',
                    'Outro',
                  ].map((reason) => (
                    <label key={reason} className={styles.cancelReasonOption}>
                      <input
                        type="radio"
                        name="cancel-reason"
                        value={reason}
                        checked={selectedReason === reason}
                        onChange={() => {
                          setSelectedReason(reason)
                          setOtherReasonText('')
                        }}
                        required
                        disabled={submitting}
                      />
                      <span className={styles.cancelReasonText}>{reason}</span>
                    </label>
                  ))}
                </div>

                {selectedReason === 'Outro' && (
                  <textarea
                    className={styles.cancelOtherTextarea}
                    placeholder="Descreva o motivo"
                    value={otherReasonText}
                    onChange={(e) => setOtherReasonText(e.target.value)}
                    required
                    rows={3}
                    disabled={submitting}
                  />
                )}

                <div className={styles.modalActions}>
                  <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={submitting}>
                    Cancelar
                  </Button>

                  <Button
                    variant="destructive"
                    size="sm"
                    type="submit"
                    disabled={
                      cancelSuccess ||
                      submitting ||
                      !selectedReason ||
                      (selectedReason === 'Outro' && !otherReasonText.trim())
                    }
                  >
                    {submitting ? 'Enviando solicitação...' : 'Confirmar Cancelamento'}
                  </Button>
                </div>

                {cancelSuccess && (
                  <div className={styles.cancelSuccess}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.successIcon}
                    >
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                      <path d="m9 11 3 3L22 4" />
                    </svg>
                    Pedido cancelado com sucesso.
                  </div>
                )}
                {cancelError && (
                  <div className={styles.cancelError}>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className={styles.errorIcon}
                    >
                      <circle cx="12" cy="12" r="10" />
                      <path d="m15 9-6 6" />
                      <path d="m9 9 6 6" />
                    </svg>
                    Ocorreu um erro ao cancelar o pedido. Tente novamente.
                  </div>
                )}
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
