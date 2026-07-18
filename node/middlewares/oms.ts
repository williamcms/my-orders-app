import type { Maybe } from '@vtex/api'

import type { OrderListResponse } from '../types/orderList'
import { getErrorStatus } from '../utils/errors'
import { generateHash } from '../utils/hash'
import { respond } from '../utils/respond'

const BUCKET = 'MY_ORDERS'

const HOUR_INTERVAL = 0.25

/** Cache window in milliseconds (HOUR_INTERVAL hours) */
const TIMESTAMP_LIMIT = HOUR_INTERVAL * 60 * 60 * 1000

type QueryParams = Record<string, undefined | string | string[]>

const asString = (v: QueryParams, path: string, defaultValue?: unknown): string => {
  const str = Array.isArray(v?.[path]) ? v?.[path]?.[0] : (v?.[path] as string)

  return str ?? String(defaultValue ?? '')
}

/** Keeps the data field shaped as an OrderListResponse even on failures */
const emptyList = (): OrderListResponse => ({ list: [], cache: { isCached: false, timeStamp: Date.now() } })

export const getOrder = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    state: { orderList, orderDetails },
    vtex: { logger, storeUserAuthToken },
    clients: { oms, vbase, masterdata },
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

  const pickupOnStoreCode = async (orderId: string) => {
    const response = await masterdata.searchDocuments<{ codigo_retirada: string }>({
      dataEntity: 'CR',
      fields: ['codigo_retirada'],
      where: `id_pedido=${orderId}`,
      pagination: { page: 1, pageSize: 5 },
    })

    const [data] = response ?? []

    return data?.codigo_retirada ?? null
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

  if (!response.list.length) {
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
    ctx.state.orderDetails = await oms.getOrderDetails({ orderId, token: storeUserAuthToken })
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
