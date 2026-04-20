import type { TimelineEventType } from '@/types/timeline'

export const EVENT_ACCENT: Record<TimelineEventType, string> = {
  registration: 'border-l-emerald-500',
  migration: 'border-l-amber-500',
  'val-added': 'border-l-emerald-500',
  'val-removed': 'border-l-red-500',
  liquidation: 'border-l-red-500',
  reactivation: 'border-l-purple-500',
  'fee-change': 'border-l-blue-500',
  withdrawal: 'border-l-sky-500',
  removal: 'border-l-red-500',
  'privacy-update': 'border-l-indigo-500',
}

export const EVENT_DOT: Record<TimelineEventType, string> = {
  registration: 'bg-emerald-500',
  migration: 'bg-amber-500',
  'val-added': 'bg-emerald-500',
  'val-removed': 'bg-red-500',
  liquidation: 'bg-red-500',
  reactivation: 'bg-purple-500',
  'fee-change': 'bg-blue-500',
  withdrawal: 'bg-sky-500',
  removal: 'bg-red-500',
  'privacy-update': 'bg-indigo-500',
}

export const EVENT_TEXT: Record<TimelineEventType, string> = {
  registration: 'text-emerald-600',
  migration: 'text-amber-600',
  'val-added': 'text-emerald-600',
  'val-removed': 'text-red-600',
  liquidation: 'text-red-600',
  reactivation: 'text-purple-600',
  'fee-change': 'text-blue-600',
  withdrawal: 'text-sky-600',
  removal: 'text-red-600',
  'privacy-update': 'text-indigo-600',
}
