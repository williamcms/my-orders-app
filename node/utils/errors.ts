/**
 * Maps an unknown error thrown by an OMS call to a response status and message.
 * The OMS client surfaces upstream failures with the status code embedded in
 * the error message, so the three-digit match recovers it; timeouts map to 504.
 */
export const getErrorStatus = (err: unknown): { status: number; message: string } => {
  const error = err as Error
  const message = error?.message ?? 'Internal server error'

  if (message.includes('timeout')) {
    return { status: 504, message: 'Request timeout' }
  }

  const match = message.match(/\d{3}/)

  if (match) {
    return { status: parseInt(match[0], 10), message }
  }

  return { status: 500, message }
}
