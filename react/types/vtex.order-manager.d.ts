declare module 'vtex.order-manager'
declare module 'vtex.order-manager/*'

declare module 'vtex.order-items'

/* eslint-disable @typescript-eslint/ban-types */
declare module 'vtex.order-items/OrderItems' {
  // / <reference types="react" />
  import { useOrderItems } from '@vtex/order-items'

  declare const OrderItemsProvider: import('react').FC<{}>
  export { useOrderItems, OrderItemsProvider }
  declare const _default: {
    useOrderItems: () => import('@vtex/order-items/types/modules/OrderItemsContext').Context
    OrderItemsProvider: import('react').FC<{}>
  }
  export default _default
}
