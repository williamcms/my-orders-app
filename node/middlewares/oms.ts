import type { Maybe } from '@vtex/api'

import type { OrderListResponse } from '../types/orderList'

const BUCKET = 'MY_ORDERS'

const HOUR_INTERVAL = 0.25
/**
 * The time window, in milliseconds, used for rate limiting operations.
 *
 * This constant represents a N-hour interval (N * 60 * 60 * 1000 ms).
 * The result should be the amount of hours in ms
 */
const TIMESTAMP_LIMIT = HOUR_INTERVAL * 60 * 60 * 1000

type QueryParams = Record<string, undefined | string | string[]>

const asString = (v: QueryParams, path: string, defaultValue?: unknown): string => {
  const str = Array.isArray(v?.[path]) ? v?.[path]?.[0] : (v?.[path] as string)

  return str ?? String(defaultValue ?? '')
}

const generateHash = async (input: string): Promise<string> => {
  const encoder = new TextEncoder()
  const data = encoder.encode(input)

  // Using SHA-512 for bigger digest (512 bits)
  const hashBuffer = await crypto.subtle.digest('SHA-512', data)

  // Convert buffer to hex
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hexHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('')

  // Optional: Truncate to first 100 characters
  const truncatedHash = hexHash.slice(0, 100)

  return truncatedHash
}

export const getOrder = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    state: { orderList, orderDetails },
    vtex: { logger, storeUserAuthToken },
    clients: { oms, vbase },
  } = ctx

  if (!storeUserAuthToken) return

  const hash = await generateHash(storeUserAuthToken)

  const typeSuffix = orderDetails ? '_PAGE' : '_LIST'
  const orderSuffix = orderDetails ? `_${orderDetails.orderId}` : ''

  console.log(BUCKET + typeSuffix, hash + orderSuffix)

  const cachedResponse = await vbase.getJSON<Maybe<OrderListResponse>>(BUCKET + typeSuffix, hash + orderSuffix, true)

  const timeStamp = Date.now()
  const timeElapsed = timeStamp - (cachedResponse?.cache?.timeStamp ?? 0)

  if (timeElapsed < TIMESTAMP_LIMIT && cachedResponse?.cache?.timeStamp) {
    const response: OrderListResponse = {
      ...cachedResponse,
      cache: {
        isCached: true,
        check: { timeElapsed, timeStamp, limitHR: HOUR_INTERVAL, limitMS: TIMESTAMP_LIMIT },
        hash,
        timeStamp,
      },
    }

    logger.info({
      log: 'Response served from cache',
      details: {
        timeElapsed,
        timeStamp,
        limitHR: HOUR_INTERVAL,
        limitMS: TIMESTAMP_LIMIT,
      },
      message: 'getOrder-list-fromCache',
    })

    ctx.status = 200
    ctx.body = response

    await next()

    return
  }

  if (cachedResponse?.list.length) {
    vbase.deleteFile(BUCKET, hash)

    logger.info({
      log: 'Cache entry deleted due to expired time window',
      details: {
        timeElapsed,
        timeStamp,
        limitHR: HOUR_INTERVAL,
        limitMS: TIMESTAMP_LIMIT,
      },
      message: 'getOrder-list-deletedCache',
    })
  }

  const orderListWithDetails = orderDetails
    ? [
        {
          ...orderDetails,
          details: await oms.getOrder({ orderId: orderDetails.orderId }),
        },
      ]
    : await Promise.all(
        orderList.list.map(async (order) => ({
          ...order,
          details: await oms.getOrder({ orderId: order.orderId }),
        }))
      )

  const response: OrderListResponse = {
    ...(orderDetails ? {} : orderList),
    list: orderListWithDetails,
    cache: {
      isCached: false,
      check: { timeElapsed, timeStamp, limitHR: HOUR_INTERVAL, limitMS: TIMESTAMP_LIMIT },
      hash,
      timeStamp,
    },
  }

  if (!response.list.length) {
    const error = new Error('Not Found')

    logger.error({
      error,
      details: response,
      message: 'getOrder-list-notFound',
    })

    ctx.status = 404
    ctx.body = error.message

    return
  }

  vbase.saveJSON(BUCKET + typeSuffix, hash + orderSuffix, response)

  ctx.status = 200
  ctx.body = response

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

  if (!storeUserAuthToken) return

  ctx.set('Access-Control-Allow-Methods', 'POST')

  const page = asString(params, 'page', 1)
  const limit = asString(params, 'limit', 10)

  const orders = await oms.listOrders({ page, limit, token: storeUserAuthToken })

  if ('error' in orders) {
    const error = typeof orders.error === 'string' ? JSON.parse(orders.error) : orders.error

    let errorCode = 500
    if ('message' in error) {
      const match = (error.message as string).match(/\d{3}/)

      if (match) {
        errorCode = parseInt(match[0], 10)
      }
    }

    logger.error({
      error,
      errorCode,
      details: orders.error,
      message: 'getOrderDetails-api-failed',
    })

    ctx.status = errorCode
    ctx.body = error

    return
  }

  ctx.state.orderList = orders

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

  if (!storeUserAuthToken || !params.orderId) return

  ctx.set('Access-Control-Allow-Methods', 'POST')

  const orderId = asString(params, 'orderId')

  const orders = await oms.getOrderDetails({ orderId, token: storeUserAuthToken })

  if ('error' in orders) {
    const error = typeof orders.error === 'string' ? JSON.parse(orders.error) : orders.error

    let errorCode = 500
    if ('message' in error) {
      const match = (error.message as string).match(/\d{3}/)

      if (match) {
        errorCode = parseInt(match[0], 10)
      }
    }

    logger.error({
      error,
      details: orders.error,
      message: 'getOrderDetails-api-failed',
    })

    ctx.status = errorCode
    ctx.body = error

    return
  }

  ctx.state.orderDetails = orders

  await next()
}
