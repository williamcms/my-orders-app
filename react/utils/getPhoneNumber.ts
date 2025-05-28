export const extractPhoneNumber = (complement?: string | null): string | null => {
  if (!complement) return null

  // Look for patterns like (11) 12345678 or similar
  const phoneMatch = complement.match(/\(\d{2}\)\s*\d{8,9}/g)

  if (phoneMatch) return phoneMatch[0]

  return null
}
