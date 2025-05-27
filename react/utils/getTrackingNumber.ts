import { OrderListItemWithDetails } from '../../node/types/orderList'

export const getTrackingNumber = (order: OrderListItemWithDetails) => {
  if (order.details?.shippingData?.trackingHints && order.details?.packageAttachment.packages.length) {
    return order.details?.packageAttachment.packages.reduce<
      { trackingNumber: string | null; trackingUrl: string | null }[]
    >((acc, item) => {
      const { trackingNumber, trackingUrl } = item

      acc.push({
        trackingNumber,
        trackingUrl,
      })
      return acc
    }, [])
  }

  return []
}
