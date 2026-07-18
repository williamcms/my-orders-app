import { type InstanceOptions, type IOContext, JanusClient } from '@vtex/api'

import type { OrderListItemDetails } from '../types/orderDetails'
import type { OrderListItemWithDetails, OrderListResponse } from '../types/orderList'

export default class OMS extends JanusClient {
  constructor(ctx: IOContext, options?: InstanceOptions) {
    super(ctx, {
      ...options,
      headers: {
        ...options?.headers,
        ...(ctx.storeUserAuthToken ? { VtexIdclientAutCookie: ctx.storeUserAuthToken } : null),
      },
    })
  }

  private get routes() {
    return {
      getOrder: (id: string) => `/api/oms/pvt/orders/${id}`,

      listOrders: (page: string, limit: string) => `/api/oms/user/orders?page=${page}&per_page=${limit}`,

      getOrderDetails: (orderId: string) => `/api/oms/user/orders/${orderId}`,
    }
  }

  /**
   * Internal helper method.
   * Used to complement the information returned by listOrders.
   * Not exposed as a public API.
   */
  public async getOrder({ orderId }: { orderId: string }) {
    const response = await this.http.getRaw<OrderListItemDetails>(this.routes.getOrder(orderId), {
      metric: 'oms-getOrder',
      nullIfNotFound: true,
      /* Private OMS route: authenticated with the app's own token, authorized by the OMSViewer policy */
      headers: {
        VtexIdclientAutCookie: this.context.authToken,
      },
    })

    return response.data
  }

  public async listOrders({ page, limit, token }: { page: string; limit: string; token?: string }) {
    const response = await this.http.getRaw<OrderListResponse>(this.routes.listOrders(page, limit), {
      metric: 'oms-listOrders',
      nullIfNotFound: true,
      headers: {
        VtexIdclientAutCookie: token,
      },
    })

    return response.data
  }

  public async getOrderDetails({ orderId, token }: { orderId: string; token?: string }) {
    const response = await this.http.getRaw<OrderListItemWithDetails>(this.routes.getOrderDetails(orderId), {
      metric: 'oms-getOrderDetails',
      nullIfNotFound: true,
      headers: {
        VtexIdclientAutCookie: token,
      },
    })

    return response.data
  }
}
