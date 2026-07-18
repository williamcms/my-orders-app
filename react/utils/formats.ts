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

/** Working hours in a business day, used to convert bd estimates to minutes */
const BUSINESS_HOURS_PER_DAY = 8

type ShippingEstimateType = 'bd' | 'hbd' | 'mbd' | 'h' | 'm' | 'd' | 'unknown'

interface ParsedShippingEstimate {
  value: number
  type: ShippingEstimateType
  original: string
}

// Helper: Check if date is a weekend
const isWeekend = (date: Date): boolean => {
  const day = date.getDay()
  return day === 0 || day === 6 // Sunday or Saturday
}

// Helper: Move date to next business day if it's on weekend
const moveToNextBusinessDay = (date: Date): Date => {
  const result = new Date(date)
  while (isWeekend(result)) {
    result.setDate(result.getDate() + 1)
  }
  return result
}

// Helper: Add business days (skipping weekends)
const addBusinessDays = (startDate: Date, daysToAdd: number): Date => {
  const result = moveToNextBusinessDay(new Date(startDate))
  let daysAdded = 0

  while (daysAdded < daysToAdd) {
    result.setDate(result.getDate() + 1)
    if (!isWeekend(result)) {
      daysAdded++
    }
  }

  return result
}

export const parseShippingEstimate = (estimate: string): ParsedShippingEstimate => {
  if (!estimate) {
    return { value: 0, type: 'unknown', original: estimate }
  }

  // More robust number extraction - match at the start of string
  const match = estimate.match(/^(\d+)/)
  const value = match ? Number.parseInt(match[1], 10) : NaN

  if (Number.isNaN(value) || value < 0) {
    return { value: 0, type: 'unknown', original: estimate }
  }

  // Order matters! Check more specific patterns first
  if (estimate.includes('hbd')) {
    return { value, type: 'hbd', original: estimate }
  }
  if (estimate.includes('mbd')) {
    return { value, type: 'mbd', original: estimate }
  }
  if (estimate.includes('bd')) {
    return { value, type: 'bd', original: estimate }
  }
  if (estimate.includes('h')) {
    return { value, type: 'h', original: estimate }
  }
  if (estimate.includes('m')) {
    return { value, type: 'm', original: estimate }
  }
  if (estimate.includes('d')) {
    return { value, type: 'd', original: estimate }
  }

  return { value: 0, type: 'unknown', original: estimate }
}

/** Format shipping estimate to human-readable text */
export const formatShippingEstimate = (estimate: string): string => {
  const parsed = parseShippingEstimate(estimate)

  if (parsed.type === 'unknown') {
    return parsed.original
  }

  const { value, type } = parsed

  switch (type) {
    case 'hbd':
      return `${value} ${value === 1 ? 'hora útil' : 'horas úteis'}`
    case 'mbd':
      return `${value} ${value === 1 ? 'minuto útil' : 'minutos úteis'}`
    case 'bd':
      return `${value} ${value === 1 ? 'dia útil' : 'dias úteis'}`
    case 'h':
      return `${value} ${value === 1 ? 'hora' : 'horas'}`
    case 'm':
      return `${value} ${value === 1 ? 'minuto' : 'minutos'}`
    case 'd':
      return `${value} ${value === 1 ? 'dia' : 'dias'}`
    default: {
      return parsed.original
    }
  }
}

/** Convert shipping estimate to minutes for comparison */
export const convertShippingEstimateToMinutes = (estimate: string): number => {
  const parsed = parseShippingEstimate(estimate)

  if (parsed.type === 'unknown') {
    return 0
  }

  const { value, type } = parsed

  // Business days = 8 hours (480 minutes), Calendar days = 24 hours (1440 minutes)
  switch (type) {
    case 'hbd':
      return value * 60 // hours to minutes
    case 'mbd':
      return value // already in minutes
    case 'bd':
      return value * (BUSINESS_HOURS_PER_DAY * 60) // business days to minutes
    case 'h':
      return value * 60 // hours to minutes
    case 'm':
      return value // already in minutes
    case 'd':
      return value * 1440 // calendar days to minutes (24 hours)
    default: {
      return 0
    }
  }
}

/** Calculate delivery date based on creation date and shipping estimate */
export const calculateDeliveryDate = (creationDate?: string | null, shippingEstimate?: string | null): Date => {
  if (!creationDate || !shippingEstimate) return new Date()

  const startDate = new Date(creationDate)
  const parsed = parseShippingEstimate(shippingEstimate)

  if (parsed.type === 'unknown' || parsed.value === 0) {
    return startDate
  }

  const { value, type } = parsed

  switch (type) {
    case 'bd':
      return addBusinessDays(startDate, value)
    /* hbd/mbd are treated as plain hours/minutes: business-hour SLAs are rare
       enough that a full business-hours engine is not worth maintaining */
    case 'hbd':
    case 'h': {
      const result = new Date(startDate)
      result.setHours(result.getHours() + value)
      return result
    }
    case 'mbd':
    case 'm': {
      const result = new Date(startDate)
      result.setMinutes(result.getMinutes() + value)
      return result
    }
    case 'd': {
      const result = new Date(startDate)
      result.setDate(result.getDate() + value)
      return result
    }
    default: {
      return startDate
    }
  }
}
