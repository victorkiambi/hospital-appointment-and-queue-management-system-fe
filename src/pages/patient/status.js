export function statusClass(status) {
  if (status === 'scheduled' || status === 'waiting') return 'badge badge-info'
  if (status === 'completed' || status === 'called') return 'badge badge-success'
  if (status === 'expired') return 'badge badge-secondary'
  return 'badge'
}

export function getEnhancedStatusClass(status) {
  const baseClass = 'status-badge'
  switch (status) {
    case 'scheduled': return `${baseClass} scheduled`
    case 'waiting': return `${baseClass} waiting`
    case 'called': return `${baseClass} called`
    case 'completed': return `${baseClass} completed`
    case 'cancelled': return `${baseClass} cancelled`
    default: return baseClass
  }
} 