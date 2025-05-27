import { ShippingAddress } from '../../node/types/orderDetails'

export const formatDate = (
  dateString?: string | null,
  month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined = 'long'
): string => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (date instanceof Date && !isNaN(date.getTime())) {
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month,
      year: 'numeric',
    })
  }

  return ''
}

export const formatCurrency = (value?: number | null): string => {
  if (typeof value !== 'number' || Number.isNaN(value)) return ''

  return (value / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

export const formatAddress = (address?: ShippingAddress): string => {
  if (!address) return ''

  return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''} ${
    address.neighborhood
  }, ${address.city} - ${address.state}, ${address.postalCode}`
}
