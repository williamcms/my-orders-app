import axios from 'axios'

import type { ApiResponse } from '../../node/types/api'
import type { PickupCodeListResponse, PickupCodeRecord } from '../../node/types/pickupCodes'

/**
 * REST helpers for the pickup codes service routes.
 * Errors with a response body still carry the ApiResponse envelope,
 * so callers surface `message` from either path.
 */

export interface ListParams {
  page: number
  pageSize: number
  search?: string
}

export async function listPickupCodes(params: ListParams): Promise<ApiResponse<PickupCodeListResponse>> {
  const { data } = await axios.get<ApiResponse<PickupCodeListResponse>>('/_v/private/pickup-codes', { params })

  return data
}

export async function createPickupCode(input: Omit<PickupCodeRecord, 'id'>): Promise<ApiResponse<PickupCodeRecord>> {
  const { data } = await axios.post<ApiResponse<PickupCodeRecord>>('/_v/private/pickup-codes', input)

  return data
}

export async function updatePickupCode({ id, ...input }: PickupCodeRecord): Promise<ApiResponse<PickupCodeRecord>> {
  const { data } = await axios.put<ApiResponse<PickupCodeRecord>>(`/_v/private/pickup-codes/${id}`, input)

  return data
}

export async function deletePickupCode(id: string): Promise<ApiResponse<PickupCodeRecord>> {
  const { data } = await axios.delete<ApiResponse<PickupCodeRecord>>(`/_v/private/pickup-codes/${id}`)

  return data
}

/** Extracts the envelope message from an axios error, falling back to the generic error message */
export function errorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const envelope = err.response?.data as ApiResponse<unknown> | undefined

    if (envelope?.message) return envelope.message
  }

  return (err as Error).message
}
