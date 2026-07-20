/** Master Data max page size */
export const MAX_PAGE_SIZE = 100

/** Max length accepted for orderId, pickupCode, and the pickup-code list search term */
export const FIELD_LENGTH = 50

/** Order IDs are alphanumeric with dashes (e.g. 1172452900788-01); also blocks MD where-clause injection */
export const ORDER_ID_PATTERN = /^[A-Za-z0-9-]+$/
