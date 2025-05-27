import { OrderListItemDetails } from './orderDetails'

export interface OrderListItem {
  orderId: string
  creationDate: string
  clientName: string
  items: OrderListItemProduct[]
  totalValue: number
  /**
   * Payment system name
   */
  paymentNames: string | null
  /**
   * Order status
   * @link https://help.vtex.com/en/tutorial/order-flow-and-status--tutorials_196
   */
  status: string
  /**
   * @deprecated This field is deprecated and may not return any value.
   * Status description previously displayed in the Admin panel.
   */
  statusDescription: string
  marketPlaceOrderId: string | null
  /**
   * Six-digit string that follows the order ID.
   * For example, in order 1268540501456-01 (501456), the sequence is 501456.
   */
  sequence: string
  /**
   * Sales channel (or trade policy) ID related to the order
   */
  salesChannel: string
  /**
   * Corresponds to the three-digits affiliate identification code of the seller responsible for the order
   */
  affiliateId: string
  /**
   * Order's origin in the order flow, which can be Marketplace, Fulfillment or Chain.
   */
  origin: string
  /**
   * If there is a work flow error (true) or not (false).
   */
  workflowInErrorState: boolean
  /**
   * If the order is in a work flow retry (true) or not (false).
   */
  workflowInRetry: boolean
  lastMessageUnread: string | null
  ShippingEstimatedDate: string | null
  ShippingEstimatedDateMax: string | null
  ShippingEstimatedDateMin: string | null
  orderIsComplete: boolean
  /**
   * Related Gift List ID
   */
  listId: string | null
  /**
   * Related Gift list type
   */
  listType: string | null
  authorizedDate: string | null
  callCenterOperatorName: string | null
  totalItems: number
  /**
   * Currency code in ISO 4217. For example, BRL
   */
  currencyCode: string | null
}

export interface OrderListItemWithDetails extends OrderListItem {
  details?: OrderListItemDetails
}

export interface OrderListItemProduct {
  seller: string
  quantity: number
  description: string
  ean: string | null
  refId: string | null
  /**
   * Item's SKU ID, which is a unique numerical identifier
   */
  id: string
  /**
   * ID of the Product associated with the item
   */
  productId: string
  sellingPrice: number
  price: number
}

export interface OrderListPaging {
  total: number
  pages: number
  currentPage: number
  perPage: number
}

export interface OrderListStatsField {
  Count: number
  Max: number
  Mean: number
  Min: number
  Missing: number
  StdDev: number
  Sum: number
  SumOfSquares: number
  Facets: Record<string, unknown>
}

export interface OrderListStats {
  totalValue: OrderListStatsField
  totalItems: OrderListStatsField
}

export interface OrderListStatsWrapper {
  stats: OrderListStats
}

export interface CacheResponse {
  isCached?: boolean
  check?: Record<unknown, string>
  hash?: string
  timeStamp: number
}

export interface OrderListResponse {
  list: OrderListItemWithDetails[]
  facets?: string[]
  paging?: OrderListPaging
  stats?: OrderListStatsWrapper
  cache: CacheResponse
}
