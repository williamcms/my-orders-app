import type { Maybe } from '@vtex/api'

import type { OrderListResponse } from '../types/orderList'
import { getErrorStatus } from '../utils/errors'
import { generateHash } from '../utils/hash'
import { respond } from '../utils/respond'

const BUCKET = 'MY_ORDERS'

const CACHE_TIME = 5

/** Cache window in milliseconds */
const TIMESTAMP_LIMIT = CACHE_TIME * 60 * 1000

type QueryParams = Record<string, undefined | string | string[]>

const asString = (v: QueryParams, path: string, defaultValue?: unknown): string => {
  return Array.isArray(v?.[path]) ? v?.[path]?.[0] : ((v?.[path] as string) ?? String(defaultValue ?? ''))
}

/** Keeps the data field shaped as an OrderListResponse even on failures */
const emptyList = (): OrderListResponse => ({ list: [], cache: { isCached: false, timeStamp: Date.now() } })

export const getOrder = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    state: { orderList, orderDetails },
    vtex: { logger, storeUserAuthToken },
    clients: { oms, vbase, pickupCodes },
  } = ctx

  if (!storeUserAuthToken) {
    respond({ ctx, status: 401, success: false, data: emptyList(), message: 'Unauthorized' })

    return
  }

  const hash = generateHash(storeUserAuthToken)

  const typeSuffix = orderDetails ? '_PAGE' : '_LIST'
  const orderSuffix = orderDetails ? `_${orderDetails.orderId}` : ''

  const cachedResponse = await vbase.getJSON<Maybe<OrderListResponse>>(BUCKET + typeSuffix, hash + orderSuffix, true)

  const timeStamp = Date.now()
  const timeElapsed = timeStamp - (cachedResponse?.cache?.timeStamp ?? 0)

  if (timeElapsed < TIMESTAMP_LIMIT && cachedResponse?.cache?.timeStamp) {
    logger.info({
      log: 'Response served from cache',
      details: { timeElapsed, timeStamp, limitMS: TIMESTAMP_LIMIT },
      message: 'getOrder-list-fromCache',
    })

    respond({
      ctx,
      status: 200,
      success: true,
      data: { ...cachedResponse, cache: { isCached: true, timeStamp: cachedResponse.cache.timeStamp } },
      message: 'Served from cache',
    })

    await next()

    return
  }

  if (cachedResponse?.list.length) {
    vbase.deleteFile(BUCKET + typeSuffix, hash + orderSuffix)

    logger.info({
      log: 'Cache entry deleted due to expired time window',
      details: { timeElapsed, timeStamp, limitMS: TIMESTAMP_LIMIT },
      message: 'getOrder-list-deletedCache',
    })
  }

  /**
   * Only called with orderIds returned by the user-token-scoped OMS calls,
   * so the code is never resolved for an order the user does not own.
   * The code is complementary: a failure is logged and the order ships without it.
   */
  const pickupOnStoreCode = async (orderId: string) => {
    try {
      const [data] = await pickupCodes.search({ page: 1, pageSize: 1 }, ['pickupCode'], undefined, `orderId=${orderId}`)

      /* The generated schema type's index signature widens `pickupCode` to `unknown`; it's always a string at runtime */
      return (data?.pickupCode as string | undefined) ?? null
    } catch (err) {
      logger.warn({
        error: (err as Error).message,
        orderId,
        message: 'getOrder-pickupCode-failed',
      })

      return null
    }
  }

  /** Details are complementary: a failure is logged and the order ships without them */
  const getDetails = async (orderId: string) => {
    try {
      return await oms.getOrder({ orderId })
    } catch (err) {
      logger.warn({
        error: (err as Error).message,
        orderId,
        message: 'getOrder-details-failed',
      })

      return undefined
    }
  }

  const orderListWithDetails = orderDetails
    ? [
        {
          ...orderDetails,
          details: await getDetails(orderDetails.orderId),
          pickupOnStoreCode: await pickupOnStoreCode(orderDetails.orderId),
        },
      ]
    : await Promise.all(
        orderList.list.map(async (order) => ({
          ...order,
          details: await getDetails(order.orderId),
          pickupOnStoreCode: await pickupOnStoreCode(order.orderId),
        }))
      )

  const response: OrderListResponse = {
    ...(orderDetails ? {} : orderList),
    list: orderListWithDetails,
    cache: { isCached: false, timeStamp },
  }

  /** Only guards the single-order lookup; a plain empty order list is not an error and falls through below */
  if (!response.list.length && orderDetails) {
    logger.error({
      error: new Error('Not Found'),
      details: response,
      message: 'getOrder-list-notFound',
    })

    respond({ ctx, status: 404, success: false, data: response, message: 'Not Found' })

    return
  }

  vbase.saveJSON(BUCKET + typeSuffix, hash + orderSuffix, response)

  respond({ ctx, status: 200, success: true, data: response, message: 'Orders retrieved' })

  await next()
}

export const listOrders = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    vtex: {
      storeUserAuthToken,
      route: { params },
      logger,
    },
    clients: { oms },
  } = ctx

  if (!storeUserAuthToken) {
    respond({ ctx, status: 401, success: false, data: emptyList(), message: 'Unauthorized' })

    return
  }

  ctx.set('Access-Control-Allow-Methods', 'POST')

  const page = asString(params, 'page', 1)
  const limit = asString(params, 'limit', 10)

  try {
    ctx.state.orderList = await oms.listOrders({ page, limit, token: storeUserAuthToken })
  } catch (err) {
    const { status, message } = getErrorStatus(err)

    logger.error({
      error: message,
      errorCode: status,
      message: 'listOrders-api-failed',
    })

    respond({ ctx, status, success: false, data: emptyList(), message })

    return
  }

  await next()
}

export const getOrderDetails = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    vtex: {
      storeUserAuthToken,
      route: { params },
      logger,
    },
    clients: { oms },
  } = ctx

  if (!storeUserAuthToken || !params.orderId) {
    respond({ ctx, status: 401, success: false, data: emptyList(), message: 'Unauthorized' })

    return
  }

  ctx.set('Access-Control-Allow-Methods', 'POST')

  const orderId = asString(params, 'orderId')

  try {
    const details = await oms.getOrderDetails({ orderId, token: storeUserAuthToken })

    /* OMS user routes only return orders owned by the token's user; null means not found or not theirs */
    if (!details) {
      respond({ ctx, status: 404, success: false, data: emptyList(), message: 'Order not found' })

      return
    }

    ctx.state.orderDetails = details
  } catch (err) {
    const { status, message } = getErrorStatus(err)

    logger.error({
      error: message,
      errorCode: status,
      message: 'getOrderDetails-api-failed',
    })

    respond({ ctx, status, success: false, data: emptyList(), message })

    return
  }

  await next()
}
