import type { EventGroup, TimelineEvent } from '@/types/timeline'

export function groupEvents(events: TimelineEvent[]): EventGroup[] {
  const sorted = [...events].sort((a, b) => {
    if (a.block !== b.block) return a.block - b.block
    return a.type.localeCompare(b.type)
  })

  const groups: EventGroup[] = []
  for (const e of sorted) {
    const last = groups[groups.length - 1]
    if (last && last.type === e.type && last.block === e.block && last.tx === e.tx) {
      last.items.push(e.data)
    } else {
      groups.push({ type: e.type, block: e.block, timestamp: e.timestamp, tx: e.tx, items: [e.data] })
    }
  }
  return groups
}
