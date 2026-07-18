import type { ClientsConfig, ServiceContext, RecorderState } from '@vtex/api'
import { method, Service } from '@vtex/api'

import { Clients } from './clients'
import { getOrder, getOrderDetails, listOrders } from './middlewares/oms'
import type { OrderListItemWithDetails, OrderListResponse } from './types/orderList'

const TIMEOUT_MS = 5000

const clients: ClientsConfig<Clients> = {
  implementation: Clients,
  options: {
    default: {
      retries: 2,
      timeout: TIMEOUT_MS,
    },
  },
}

declare global {
  // We declare a global Context type just to avoid re-writing ServiceContext<Clients, State> in every handler and resolver
  type Context = ServiceContext<Clients, State>

  // The shape of our State object found in `ctx.state`. This is used as state bag to communicate between middlewares.
  interface State extends RecorderState {
    orderList: OrderListResponse
    orderDetails: OrderListItemWithDetails
  }
}

// Export a service that defines route handlers and client options.
export default new Service({
  clients,
  routes: {
    listOrders: method({
      GET: [listOrders, getOrder],
    }),
    getOrderDetails: method({
      GET: [getOrderDetails, getOrder],
    }),
  },
})
