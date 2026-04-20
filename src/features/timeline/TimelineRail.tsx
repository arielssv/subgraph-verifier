import { useMemo, useState } from 'react'
import { type BlockMarkerId } from '@/config'
import { EventCard } from '@/features/timeline/EventCard'
import { groupEvents } from '@/services/groupEvents'
import { useNetwork } from '@/store/networkContext'
import type { EventGroup, TimelineEvent } from '@/types/timeline'

const COLORS: Record<BlockMarkerId, { border: string; text: string; dot: string }> = {
  genesis: { border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  fix: { border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500' },
  'last-fix': { border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  'default-fee-change': { border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' },
}

function labelFor(markerId: BlockMarkerId, markerLabel: string, block: number): string {
  const prefix = markerId === 'genesis' ? 'After SSV Staking Genesis' : `After ${markerLabel}`
  return `${prefix} — Block ${block}`
}

export function TimelineRail({ events }: { events: TimelineEvent[] }) {
  const { config } = useNetwork()

  // Bands are the network's block markers sorted chronologically (ascending block).
  const bandsChron = useMemo(
    () => [...config.blockMarkers].sort((a, b) => a.block - b.block),
    [config],
  )
  // For bucketing, evaluate from highest to lowest so later markers win.
  const bandsTopDown = useMemo(() => [...bandsChron].reverse(), [bandsChron])

  const groupsByBand = useMemo(() => {
    const all = groupEvents(events)
    const map = new Map<BlockMarkerId, EventGroup[]>(bandsChron.map((m) => [m.id, []]))
    for (const g of all) {
      let assigned: BlockMarkerId | null = null
      for (const m of bandsTopDown) {
        // Genesis uses >= (registration at genesis block itself belongs to the first band);
        // every later marker uses > (strictly after the marker block).
        const ok = m.id === 'genesis' ? g.block >= m.block : g.block > m.block
        if (ok) {
          assigned = m.id
          break
        }
      }
      if (assigned === null) continue
      map.get(assigned)!.push(g)
    }
    return map
  }, [events, bandsChron, bandsTopDown])

  return (
    <div className="flex flex-col gap-3">
      {bandsChron.map((m) => (
        <RangeSection
          key={m.id}
          variant={m.id}
          label={labelFor(m.id, m.label, m.block)}
          groups={groupsByBand.get(m.id) ?? []}
        />
      ))}
    </div>
  )
}

function RangeSection({
  variant,
  label,
  groups,
}: {
  variant: BlockMarkerId
  label: string
  groups: EventGroup[]
}) {
  const [open, setOpen] = useState(false)
  const c = COLORS[variant]
  const count = groups.length
  const countLabel = count === 1 ? '1 event' : `${count} events`

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`flex w-full items-center justify-between gap-3 rounded-md border border-dashed bg-muted/30 px-3 py-2 text-left text-xs font-semibold ${c.border} ${c.text} hover:bg-muted/60`}
      >
        <span className="flex items-center gap-2">
          <span className={`h-2.5 w-2.5 rounded-sm ${c.dot}`} />
          {label}
        </span>
        <span className="flex items-center gap-2 text-muted-foreground">
          <span>{countLabel}</span>
          <span className="text-foreground">{open ? '▾' : '▸'}</span>
        </span>
      </button>

      {open && (
        <div className="relative mt-2 border-l-2 border-border pl-6">
          {count === 0 ? (
            <div className="rounded-md border bg-card p-3 text-sm text-muted-foreground">
              No events in this range.
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {groups.map((g) => (
                <EventCard key={`${g.type}-${g.block}-${g.tx}`} group={g} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
