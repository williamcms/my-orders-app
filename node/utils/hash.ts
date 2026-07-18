import { createHash } from 'crypto'

/** Derives a stable, non-reversible cache key from the store user auth token */
export const generateHash = (input: string): string => createHash('sha256').update(input).digest('hex')
