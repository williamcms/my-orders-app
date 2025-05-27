import { OrderListItemWithDetails } from '../../node/types/orderList'
import { formatDate } from './formats'

export const getOrderStatus = (
  order: OrderListItemWithDetails
): { label: string; variant: 'default' | 'destructive' | 'outline' | 'success' | 'warning'; tooltip?: string } => {
  const { status, details } = order

  switch (status.toLowerCase()) {
    case 'canceled':
      return {
        label: 'Cancelado',
        variant: 'destructive',
        tooltip: formatDate(details?.cancellationData?.CancellationDate),
      }
    case 'invoiced':
      return {
        label: 'Faturado',
        variant: 'default',
        tooltip: formatDate(details?.invoicedDate),
      }
    case 'ready-for-handling':
      return { label: 'Pronto para envio', variant: 'outline', tooltip: '' }
    case 'handling':
      return { label: 'Preparando pedido', variant: 'warning', tooltip: '' }
    case 'shipped':
      return { label: 'Enviando pedido', variant: 'success', tooltip: '' }
    case 'delivered':
      return { label: 'Entregue', variant: 'default', tooltip: '' }
    default:
      return { label: status, variant: 'outline', tooltip: '' }
  }
}
