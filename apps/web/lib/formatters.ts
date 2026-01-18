/**
 * Formats height in inches to a string representation (e.g., 71 => 5'11")
 */
export function formatHeight(inches: number | null | undefined): string {
  if (inches === null || inches === undefined || inches === 0) return ''
  
  const feet = Math.floor(inches / 12)
  const remainingInches = inches % 12
  
  return `${feet}'${remainingInches}"`
}

/**
 * Parses a height string (e.g., "5'11", "5-11", "5' 11") into total inches
 */
export function parseHeightToInches(heightStr: string | null | undefined): number | null {
  if (!heightStr) return null
  
  const match = heightStr.match(/(\d+)[-'\s]+(\d+)/) || heightStr.match(/(\d+)'(\d+)"?/)
  if (match && match[1] && match[2]) {
    const feet = parseInt(match[1])
    const inches = parseInt(match[2])
    return feet * 12 + inches
  }
  
  return null
}

// Format phone number as (XXX) XXX-XXXX
export function formatPhoneNumber(value: string): string {
  // Remove all non-digit characters
  const digits = value.replace(/\D/g, '')

  // Format based on length
  if (digits.length <= 3) {
    return digits
  } else if (digits.length <= 6) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3)}`
  } else {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`
  }
}
