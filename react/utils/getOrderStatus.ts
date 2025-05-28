import { OrderListItemWithDetails } from '../../node/types/orderList'
import { formatDate } from './formats'

export const getOrderStatus = (
  order?: OrderListItemWithDetails
): { label: string; variant: 'default' | 'destructive' | 'outline' | 'success' | 'warning'; tooltip?: string } => {
  if (!order) return { label: 'Carregando...', variant: 'outline', tooltip: '' }

  const { status, details } = order

  const cancellationDate = details?.cancellationData?.CancellationDate
  const invoicedDate = details?.invoicedDate

  switch (status.toLowerCase()) {
    case 'payment-pending':
      return { label: 'Pagamento pendente', variant: 'warning', tooltip: '' }
    case 'cancellation-requested':
      return { label: 'Cancelamento solicitado', variant: 'warning', tooltip: '' }
    case 'canceled':
      return { label: 'Cancelado', variant: 'destructive', tooltip: formatDate(cancellationDate) }
    case 'invoiced':
      return { label: 'Faturado', variant: 'default', tooltip: formatDate(invoicedDate) }
    case 'ready-for-handling':
      return { label: 'Pronto para envio', variant: 'outline', tooltip: '' }
    case 'handling':
      return { label: 'Preparando pedido', variant: 'success', tooltip: '' }
    case 'shipped':
      return { label: 'Enviando pedido', variant: 'success', tooltip: '' }
    case 'delivered':
      return { label: 'Entregue', variant: 'default', tooltip: '' }
    default:
      return { label: status, variant: 'outline', tooltip: '' }
  }
}
