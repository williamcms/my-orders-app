import type { IntlShape } from 'react-intl'
import { defineMessages } from 'react-intl'

import type { CancellationData } from '../../node/types/orderDetails'
import { formatDate } from './formats'

const messages = defineMessages({
  requestedByUser: { id: 'store/my-orders-app.cancellation.requestedByUser' },
  requestedBySystem: { id: 'store/my-orders-app.cancellation.requestedBySystem' },
  requestedBySeller: { id: 'store/my-orders-app.cancellation.requestedBySeller' },
  requestedByPayment: { id: 'store/my-orders-app.cancellation.requestedByPayment' },
  reasonNotInformed: { id: 'store/my-orders-app.cancellation.reasonNotInformed' },
  requestText: { id: 'store/my-orders-app.cancellation.requestText' },
  cancelledText: { id: 'store/my-orders-app.cancellation.cancelledText' },
})

/** Resolves who requested the cancellation to its localized description */
const getRequestedBy = (cancellationData: CancellationData, intl: IntlShape): string => {
  const {
    RequestedByUser,
    RequestedBySystem,
    RequestedBySellerNotification,
    RequestedByPaymentNotification,
  } = cancellationData

  if (RequestedByUser) return intl.formatMessage(messages.requestedByUser)
  if (RequestedBySystem) return intl.formatMessage(messages.requestedBySystem)
  if (RequestedBySellerNotification) return intl.formatMessage(messages.requestedBySeller)
  if (RequestedByPaymentNotification) return intl.formatMessage(messages.requestedByPayment)

  return ''
}

export const getCancellationText = (
  intl: IntlShape,
  cancellationData?: CancellationData | null,
  isRequest?: boolean
): string => {
  if (!cancellationData) return ''

  const values = {
    date: formatDate(cancellationData.CancellationDate),
    requestedBy: getRequestedBy(cancellationData, intl),
    reason: cancellationData.Reason || intl.formatMessage(messages.reasonNotInformed),
  }

  if (isRequest) return intl.formatMessage(messages.requestText, values)

  return intl.formatMessage(messages.cancelledText, values)
}
