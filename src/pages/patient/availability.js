export function parseAvailabilityArray(availStr) {
  try {
    const arr = JSON.parse(availStr)
    return Array.isArray(arr) ? arr : []
  } catch {
    return []
  }
} 