import type { IntlShape } from 'react-intl'
import { defineMessages } from 'react-intl'

import type { OrderListItemWithDetails } from '../../node/types/orderList'
import { formatDate } from './formats'

const messages = defineMessages({
  loading: { id: 'store/my-orders-app.status.loading' },
  paymentPending: { id: 'store/my-orders-app.status.paymentPending' },
  cancellationRequested: { id: 'store/my-orders-app.status.cancellationRequested' },
  canceled: { id: 'store/my-orders-app.status.canceled' },
  invoiced: { id: 'store/my-orders-app.status.invoiced' },
  readyForHandling: { id: 'store/my-orders-app.status.readyForHandling' },
  handling: { id: 'store/my-orders-app.status.handling' },
  shipped: { id: 'store/my-orders-app.status.shipped' },
  delivered: { id: 'store/my-orders-app.status.delivered' },
})

export const getOrderStatus = (
  intl: IntlShape,
  order?: OrderListItemWithDetails
): { label: string; variant: 'default' | 'destructive' | 'outline' | 'success' | 'warning'; tooltip?: string } => {
  if (!order) return { label: intl.formatMessage(messages.loading), variant: 'outline', tooltip: '' }

  const { status, details } = order

  const cancellationDate = details?.cancellationData?.CancellationDate
  const invoicedDate = details?.invoicedDate

  switch (status.toLowerCase()) {
    case 'payment-pending':
      return { label: intl.formatMessage(messages.paymentPending), variant: 'warning', tooltip: '' }

    case 'cancellation-requested':
      return { label: intl.formatMessage(messages.cancellationRequested), variant: 'warning', tooltip: '' }

    case 'canceled':
      return {
        label: intl.formatMessage(messages.canceled),
        variant: 'destructive',
        tooltip: formatDate(cancellationDate),
      }

    case 'cancel':
      return {
        label: intl.formatMessage(messages.canceled),
        variant: 'destructive',
        tooltip: formatDate(cancellationDate),
      }

    case 'invoiced':
      return { label: intl.formatMessage(messages.invoiced), variant: 'default', tooltip: formatDate(invoicedDate) }

    case 'ready-for-handling':
      return { label: intl.formatMessage(messages.readyForHandling), variant: 'outline', tooltip: '' }

    case 'handling':
      return { label: intl.formatMessage(messages.handling), variant: 'success', tooltip: '' }

    case 'shipped':
      return { label: intl.formatMessage(messages.shipped), variant: 'success', tooltip: '' }

    case 'delivered':
      return { label: intl.formatMessage(messages.delivered), variant: 'default', tooltip: '' }

    default:
      return { label: status, variant: 'outline', tooltip: '' }
  }
}
