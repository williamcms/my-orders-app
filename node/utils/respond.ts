import type { ApiResponse } from '../types/api'

/** Writes the normalized ApiResponse envelope to the koa context */
export function respond<T>({
  ctx,
  status,
  success,
  data,
  message,
}: {
  ctx: Context
  status: number
  success: boolean
  data: T
  message: string
}) {
  ctx.status = status
  ctx.body = { success, data, message } as ApiResponse<T>
}
