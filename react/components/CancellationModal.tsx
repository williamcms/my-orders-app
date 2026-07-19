/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
import React, { useState } from 'react'
import { defineMessages, FormattedMessage, useIntl } from 'react-intl'

import type { CancellationRequest } from '../../node/types/orderDetails'
import styles from '../styles/cancellationModal.module.css'
import { formatDate } from '../utils/formats'
import { Button } from './ui/button'

interface CancellationModalProps {
  allowCancellation?: boolean
  orderId: string
  shouldShow?: boolean
  history?: CancellationRequest[] | null
}

const OTHER_REASON = 'other'

const messages = defineMessages({
  openHistory: { id: 'store/my-orders-app.cancelModal.openHistory' },
  openCancel: { id: 'store/my-orders-app.cancelModal.openCancel' },
  historyTitle: { id: 'store/my-orders-app.cancelModal.historyTitle' },
  title: { id: 'store/my-orders-app.cancelModal.title' },
  closeAria: { id: 'store/my-orders-app.cancelModal.closeAria' },
  confirmText: { id: 'store/my-orders-app.cancelModal.confirmText' },
  reasonsTitle: { id: 'store/my-orders-app.cancelModal.reasonsTitle' },
  reasonNoLongerWanted: { id: 'store/my-orders-app.cancelModal.reason.noLongerWanted' },
  reasonBoughtByMistake: { id: 'store/my-orders-app.cancelModal.reason.boughtByMistake' },
  reasonDeliveryTooLong: { id: 'store/my-orders-app.cancelModal.reason.deliveryTooLong' },
  reasonFoundBetterPrice: { id: 'store/my-orders-app.cancelModal.reason.foundBetterPrice' },
  reasonPreferNotToSay: { id: 'store/my-orders-app.cancelModal.reason.preferNotToSay' },
  reasonOther: { id: 'store/my-orders-app.cancelModal.reason.other' },
  otherPlaceholder: { id: 'store/my-orders-app.cancelModal.otherPlaceholder' },
  historyButton: { id: 'store/my-orders-app.cancelModal.historyButton' },
  cancelButton: { id: 'store/my-orders-app.cancelModal.cancelButton' },
  submitting: { id: 'store/my-orders-app.cancelModal.submitting' },
  confirmButton: { id: 'store/my-orders-app.cancelModal.confirmButton' },
  successText: { id: 'store/my-orders-app.cancelModal.successText' },
  errorText: { id: 'store/my-orders-app.cancelModal.errorText' },
  requestDate: { id: 'store/my-orders-app.cancelModal.requestDate' },
  requestReason: { id: 'store/my-orders-app.cancelModal.requestReason' },
  denyDate: { id: 'store/my-orders-app.cancelModal.denyDate' },
  denyReason: { id: 'store/my-orders-app.cancelModal.denyReason' },
  notInformed: { id: 'store/my-orders-app.cancelModal.notInformed' },
  showForm: { id: 'store/my-orders-app.cancelModal.showForm' },
})

/** Stable reason ids paired with their message descriptor; the localized label is what gets submitted */
const CANCEL_REASONS = [
  { id: 'noLongerWanted', message: messages.reasonNoLongerWanted },
  { id: 'boughtByMistake', message: messages.reasonBoughtByMistake },
  { id: 'deliveryTooLong', message: messages.reasonDeliveryTooLong },
  { id: 'foundBetterPrice', message: messages.reasonFoundBetterPrice },
  { id: 'preferNotToSay', message: messages.reasonPreferNotToSay },
  { id: OTHER_REASON, message: messages.reasonOther },
]

export const CancellationModal = ({
  allowCancellation,
  orderId,
  shouldShow = true,
  history,
}: CancellationModalProps) => {
  const intl = useIntl()

  const [showHistory, setShowHistory] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [cancelSuccess, setCancelSuccess] = useState(false)
  const [cancelError, setCancelError] = useState(false)
  const [selectedReason, setSelectedReason] = useState<string | null>(null)
  const [otherReasonText, setOtherReasonText] = useState('')

  const showForm = !showHistory && !cancelSuccess
  const hasHistory = history?.length && history.length > 0

  const modalTitle = showHistory ? messages.historyTitle : messages.title
  const submitLabel = submitting ? messages.submitting : messages.confirmButton

  const reasonLabel = (reasonId: string) => {
    const reason = CANCEL_REASONS.find((candidate) => candidate.id === reasonId)

    if (!reason) return ''

    return intl.formatMessage(reason.message)
  }

  const notInformed = intl.formatMessage(messages.notInformed)

  const handleOpenHistoryOnly = () => {
    setShowHistory(true)
    setIsOpen(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedReason || (selectedReason === OTHER_REASON && !otherReasonText.trim())) return

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
          reason: selectedReason === OTHER_REASON ? otherReasonText.trim() : reasonLabel(selectedReason),
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

  const OpenModalButton = () => {
    if (allowCancellation !== true && hasHistory) {
      return (
        <Button variant="outline" onClick={handleOpenHistoryOnly}>
          <FormattedMessage {...messages.openHistory} />
        </Button>
      )
    }

    return (
      <Button variant="destructive" disabled={allowCancellation !== true} onClick={() => setIsOpen((prev) => !prev)}>
        <FormattedMessage {...messages.openCancel} />
      </Button>
    )
  }

  if (!shouldShow) return null

  return (
    <>
      <OpenModalButton />

      {isOpen && (
        <div className={styles.modalOverlay} onClick={handleClose}>
          <div className={styles.modalContainer} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2 className={styles.modalTitle}>
                <FormattedMessage {...modalTitle} />
              </h2>
              <button
                className={styles.modalCloseButton}
                onClick={handleClose}
                disabled={submitting}
                aria-label={intl.formatMessage(messages.closeAria)}
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
              {showForm && (
                <>
                  <p className={styles.modalText}>
                    <FormattedMessage {...messages.confirmText} />
                  </p>

                  <form onSubmit={handleSubmit} className={styles.cancellationForm}>
                    <div className={styles.cancelReasons}>
                      <h3 className={styles.cancelReasonsTitle}>
                        <FormattedMessage {...messages.reasonsTitle} />
                      </h3>
                      {CANCEL_REASONS.map((reason) => (
                        <label className={styles.cancelReasonOption} key={reason.id}>
                          <input
                            type="radio"
                            name="cancel-reason"
                            value={reason.id}
                            checked={selectedReason === reason.id}
                            onChange={() => {
                              setSelectedReason(reason.id)
                              setOtherReasonText('')
                            }}
                            required
                            disabled={submitting}
                          />
                          <span className={styles.cancelReasonText}>
                            <FormattedMessage {...reason.message} />
                          </span>
                        </label>
                      ))}
                    </div>

                    {selectedReason === OTHER_REASON && (
                      <textarea
                        className={styles.cancelOtherTextarea}
                        placeholder={intl.formatMessage(messages.otherPlaceholder)}
                        value={otherReasonText}
                        onChange={(e) => setOtherReasonText(e.target.value)}
                        required
                        rows={3}
                        disabled={submitting}
                      />
                    )}

                    <div className={styles.modalActions}>
                      {hasHistory && (
                        <Button
                          variant="outline"
                          size="sm"
                          type="button"
                          onClick={() => setShowHistory((prev) => !prev)}
                        >
                          <FormattedMessage {...messages.historyButton} />
                        </Button>
                      )}

                      <Button variant="outline" size="sm" type="button" onClick={handleClose} disabled={submitting}>
                        <FormattedMessage {...messages.cancelButton} />
                      </Button>

                      <Button
                        variant="destructive"
                        size="sm"
                        type="submit"
                        disabled={
                          cancelSuccess ||
                          submitting ||
                          !selectedReason ||
                          (selectedReason === OTHER_REASON && !otherReasonText.trim())
                        }
                      >
                        <FormattedMessage {...submitLabel} />
                      </Button>
                    </div>
                  </form>
                </>
              )}

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
                  <FormattedMessage {...messages.successText} />
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
                  <FormattedMessage {...messages.errorText} />
                </div>
              )}

              {showHistory && (
                <div className={styles.cancelReasons}>
                  {history?.map((request) => (
                    <div className={styles.cancelHistoryOption} key={request.id}>
                      <span className={styles.cancelReasonText}>
                        <strong>
                          <FormattedMessage {...messages.requestDate} />
                        </strong>{' '}
                        {formatDate(request.cancellationRequestDate)}
                      </span>

                      <span className={styles.cancelReasonText}>
                        <strong>
                          <FormattedMessage {...messages.requestReason} />
                        </strong>{' '}
                        {request.reason || notInformed}
                      </span>

                      {request.deniedBySeller && <div className={styles.divider} />}

                      {request.deniedBySeller && (
                        <span className={styles.cancelReasonText}>
                          <strong>
                            <FormattedMessage {...messages.denyDate} />
                          </strong>{' '}
                          {formatDate(request.cancellationRequestDenyDate)}
                        </span>
                      )}

                      {request.deniedBySeller && (
                        <span className={styles.cancelReasonText}>
                          <strong>
                            <FormattedMessage {...messages.denyReason} />
                          </strong>{' '}
                          {request.deniedBySellerReason ?? notInformed}
                        </span>
                      )}
                    </div>
                  ))}

                  <div className={styles.modalActions}>
                    {allowCancellation === true && (
                      <Button variant="default" size="sm" type="button" onClick={() => setShowHistory((prev) => !prev)}>
                        <FormattedMessage {...messages.showForm} />
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
