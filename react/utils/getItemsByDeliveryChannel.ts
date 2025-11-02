import type { LogisticsInfo } from '../../node/types/orderDetails'

export interface PickupItem {
  itemIndex: number
  itemId: string
}

export interface GroupedPickupLogistic extends Omit<LogisticsInfo, 'itemIndex' | 'itemId'> {
  items: PickupItem[]
}

export const getPickupItems = (
  logisticsInfo?: LogisticsInfo[],
  filter: string = 'pickup-in-point'
): GroupedPickupLogistic[] => {
  if (!logisticsInfo) return []

  // Only pickup-in-point items
  const pickupLogistics = logisticsInfo.filter((logistic) => logistic.selectedDeliveryChannel === filter)

  // Group by selectedSla, lockTTL, shippingEstimate
  const grouped: Record<string, GroupedPickupLogistic> = {}

  pickupLogistics.forEach((logistic) => {
    const key = [logistic.selectedSla, logistic.lockTTL, logistic.shippingEstimate].join('|')

    if (!grouped[key]) {
      const { itemIndex, itemId, ...rest } = logistic

      grouped[key] = {
        ...rest,
        items: [
          {
            itemIndex,
            itemId,
          },
        ],
      }
    } else {
      grouped[key].items.push({
        itemIndex: logistic.itemIndex,
        itemId: logistic.itemId,
      })
    }
  })

  return Object.values(grouped)
}
