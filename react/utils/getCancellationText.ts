import { CancellationData } from '../../node/types/orderDetails'
import { formatDate } from './formats'

export const getCancellationText = (cancellationData?: CancellationData | null, isRequest?: boolean): string => {
  if (!cancellationData) return ''

  const {
    RequestedByUser,
    RequestedBySystem,
    RequestedBySellerNotification,
    RequestedByPaymentNotification,
    Reason,
    CancellationDate,
  } = cancellationData ?? {}

  const requestedBy = RequestedByUser
    ? 'pelo usuário'
    : RequestedBySystem
      ? 'pelo sistema'
      : RequestedBySellerNotification
        ? 'pelo vendedor'
        : RequestedByPaymentNotification
          ? 'pela instituição de pagamento'
          : ''

  if (isRequest) {
    return `Há uma solicitação de cancelamento realizada em ${formatDate(CancellationDate)} para este pedido, feita ${requestedBy}. Motivo: ${Reason || 'não informado'}.`
  }

  return `Pedido cancelado em ${formatDate(CancellationDate)} ${requestedBy}. Motivo: ${Reason || 'não informado'}.`
}
