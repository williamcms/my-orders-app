import { json } from 'co-body'

import type { PickupCodeListResponse, PickupCodeRecord } from '../types/pickupCodes'
import { FIELD_LENGTH, MAX_PAGE_SIZE, ORDER_ID_PATTERN } from '../utils/constants'
import { respond } from '../utils/respond'

type AdminAccess = { ok: true } | { ok: false; status: 401 | 403; message: string }

/** Matches any character that isn't a Unicode letter, digit, whitespace, or one of @ . _ - */
const REGEX = /[^\p{L}\p{N}\s@._-]/gu

/** Fields fetched for pickup code Master Data documents */
const PICKUP_CODE_FIELDS = ['id', 'orderId', 'pickupCode']

const emptyList = (): PickupCodeListResponse => ({ list: [], pagination: { total: 0, page: 1, pageSize: 0, pages: 0 } })

const emptyRecord = (): PickupCodeRecord => ({ id: '', orderId: '', pickupCode: '' })

/**
 * Strips characters with meaning in the Master Data where syntax
 * (quotes, parentheses, wildcards, operators), keeping letters,
 * digits, spaces and @ . _ - so order IDs still match.
 */
const sanitizeSearchTerm = (term: string) => term.replace(REGEX, '').trim().slice(0, FIELD_LENGTH)

/**
 * Checks if there's an admin session at all, if the admin is logged in,
 * and if their role grants OMSViewer.
 */
const checkAdminAccess = async (ctx: Context): Promise<AdminAccess> => {
  const { adminUserAuthToken } = ctx.vtex

  if (!adminUserAuthToken) {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }

  try {
    const hasAccess = await ctx.clients.licenseManager.canAccessResource(adminUserAuthToken, 'OMSViewer')

    if (!hasAccess) {
      return { ok: false, status: 403, message: 'Missing OMSViewer permission' }
    }

    return { ok: true }
  } catch {
    return { ok: false, status: 401, message: 'Unauthorized' }
  }
}

/** Maps Master Data auth rejections (invalid token / missing LM role) to the envelope */
const respondAuthError = (ctx: Context, err: unknown, data: PickupCodeListResponse | PickupCodeRecord) => {
  const status = (err as { response?: { status?: number } }).response?.status

  if (status === 401 || status === 403) {
    respond({ ctx, status, success: false, data, message: status === 401 ? 'Unauthorized' : 'Forbidden' })

    return true
  }

  return false
}

const parseBody = async (ctx: Context): Promise<Partial<PickupCodeRecord> | null> => {
  try {
    return await json(ctx.req)
  } catch {
    return null
  }
}

const validateFields = (body: Partial<PickupCodeRecord> | null) => {
  const orderId = body?.orderId?.trim() ?? ''
  const pickupCode = body?.pickupCode?.trim() ?? ''

  const orderInfo = { orderId, pickupCode }

  if (!orderId || !pickupCode) {
    return { ...orderInfo, valid: false, message: `orderId and pickupCode are required` }
  }

  if (orderId.length > FIELD_LENGTH || pickupCode.length > FIELD_LENGTH) {
    return { ...orderInfo, valid: false, message: `orderId and pickupCode must be at most ${FIELD_LENGTH} characters` }
  }

  if (!ORDER_ID_PATTERN.test(orderId)) {
    return { ...orderInfo, valid: false, message: 'orderId contains invalid characters' }
  }

  return { ...orderInfo, valid: true, message: '' }
}

const findByOrderId = async (ctx: Context, orderId: string) => {
  const matches = await ctx.clients.pickupCodesAdmin.search(
    { page: 1, pageSize: 1 },
    PICKUP_CODE_FIELDS,
    undefined,
    `orderId=${orderId}`
  )

  /* MD search results carry the document id even though the client typings omit it */
  return (matches?.[0] as unknown as PickupCodeRecord | undefined) ?? null
}

export const listPickupCodes = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    query,
    vtex: { logger },
    clients: { pickupCodesAdmin },
  } = ctx

  const access = await checkAdminAccess(ctx)

  if (!access.ok) {
    respond({ ctx, status: access.status, success: false, data: emptyList(), message: access.message })

    return
  }

  const page = Math.max(Number(query.page) || 1, 1)
  const pageSize = Math.min(Math.max(Number(query.pageSize) || 25, 1), MAX_PAGE_SIZE)
  const term = sanitizeSearchTerm(String(query.search ?? ''))
  const where = term ? `(orderId="*${term}*" OR pickupCode="*${term}*")` : undefined

  try {
    const result = await pickupCodesAdmin.searchRaw({ page, pageSize }, PICKUP_CODE_FIELDS, 'createdIn DESC', where)

    const { total } = result.pagination

    respond({
      ctx,
      status: 200,
      success: true,
      data: {
        list: result.data as unknown as PickupCodeRecord[],
        pagination: { total, page, pageSize, pages: Math.ceil(total / pageSize) },
      },
      message: 'Pickup codes retrieved',
    })
  } catch (err) {
    if (respondAuthError(ctx, err, emptyList())) return

    logger.error({ error: (err as Error).message, message: 'pickupCodes-list-failed' })

    respond({ ctx, status: 500, success: false, data: emptyList(), message: 'Failed to list pickup codes' })

    return
  }

  await next()
}

export const createPickupCode = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    vtex: { logger },
    clients: { pickupCodesAdmin },
  } = ctx

  const access = await checkAdminAccess(ctx)

  if (!access.ok) {
    respond({ ctx, status: access.status, success: false, data: emptyRecord(), message: access.message })

    return
  }

  const { orderId, pickupCode, valid, message } = validateFields(await parseBody(ctx))

  if (!valid) {
    respond({ ctx, status: 400, success: false, data: emptyRecord(), message })

    return
  }

  try {
    const existing = await findByOrderId(ctx, orderId)

    if (existing) {
      respond({ ctx, status: 409, success: false, data: existing, message: 'This order already has a pickup code' })

      return
    }

    const { DocumentId } = await pickupCodesAdmin.save({ orderId, pickupCode })

    respond({
      ctx,
      status: 201,
      success: true,
      data: { id: DocumentId, orderId, pickupCode },
      message: 'Pickup code created',
    })
  } catch (err) {
    if (respondAuthError(ctx, err, emptyRecord())) return

    logger.error({ error: (err as Error).message, orderId, message: 'pickupCodes-create-failed' })

    respond({ ctx, status: 500, success: false, data: emptyRecord(), message: 'Failed to create pickup code' })

    return
  }

  await next()
}

export const updatePickupCode = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    vtex: {
      logger,
      route: { params },
    },
    clients: { pickupCodesAdmin },
  } = ctx

  const access = await checkAdminAccess(ctx)

  if (!access.ok) {
    respond({ ctx, status: access.status, success: false, data: emptyRecord(), message: access.message })

    return
  }

  const id = String(params.id ?? '')
  const { orderId, pickupCode, valid, message } = validateFields(await parseBody(ctx))

  if (!id) {
    respond({ ctx, status: 400, success: false, data: emptyRecord(), message: 'id is required' })

    return
  }

  if (!valid) {
    respond({ ctx, status: 400, success: false, data: emptyRecord(), message })

    return
  }

  try {
    const conflicting = await findByOrderId(ctx, orderId)

    if (conflicting && conflicting.id !== id) {
      respond({ ctx, status: 409, success: false, data: conflicting, message: 'This order already has a pickup code' })

      return
    }

    await pickupCodesAdmin.update(id, { orderId, pickupCode })

    respond({ ctx, status: 200, success: true, data: { id, orderId, pickupCode }, message: 'Pickup code updated' })
  } catch (err) {
    if (respondAuthError(ctx, err, emptyRecord())) return

    logger.error({ error: (err as Error).message, id, message: 'pickupCodes-update-failed' })

    respond({ ctx, status: 500, success: false, data: emptyRecord(), message: 'Failed to update pickup code' })

    return
  }

  await next()
}

export const deletePickupCode = async (ctx: Context, next: () => Promise<unknown>) => {
  const {
    vtex: {
      logger,
      route: { params },
    },
    clients: { pickupCodesAdmin },
  } = ctx

  const access = await checkAdminAccess(ctx)

  if (!access.ok) {
    respond({ ctx, status: access.status, success: false, data: emptyRecord(), message: access.message })

    return
  }

  const id = String(params.id ?? '')

  if (!id) {
    respond({ ctx, status: 400, success: false, data: emptyRecord(), message: 'id is required' })

    return
  }

  try {
    await pickupCodesAdmin.delete(id)

    respond({ ctx, status: 200, success: true, data: { ...emptyRecord(), id }, message: 'Pickup code deleted' })
  } catch (err) {
    if (respondAuthError(ctx, err, emptyRecord())) return

    logger.error({ error: (err as Error).message, id, message: 'pickupCodes-delete-failed' })

    respond({ ctx, status: 500, success: false, data: emptyRecord(), message: 'Failed to delete pickup code' })

    return
  }

  await next()
}
