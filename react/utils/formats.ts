import type { ShippingAddress } from '../../node/types/orderDetails'

export const formatDate = (
  dateString?: string | null,
  month: 'numeric' | '2-digit' | 'long' | 'short' | 'narrow' | undefined = 'long'
): string => {
  if (!dateString) return ''

  const date = new Date(dateString)

  if (date instanceof Date && !Number.isNaN(date.getTime())) {
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

export const formatShippingEstimate = (estimate: string): string => {
  // Convert shipping estimate like "5bd" (5 business days) to human-readable text
  const days = Number.parseInt(estimate.replace(/[^0-9]/g, ''), 10)

  if (estimate.includes('mbd')) {
    return `${days} minutos`
  }

  return `${days} dias úteis`
}
