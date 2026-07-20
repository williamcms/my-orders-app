/** Pickup code record as returned by the service, with the Master Data document id */
export interface PickupCodeRecord {
  id: string
  orderId: string
  pickupCode: string
}

export interface PickupCodeListResponse {
  list: PickupCodeRecord[]
  pagination: {
    total: number
    page: number
    pageSize: number
    pages: number
  }
}
