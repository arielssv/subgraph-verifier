import { useMemo, useState } from 'react'
import { type BlockMarkerId } from '@/config'
import { EventCard } from '@/features/timeline/EventCard'
import { groupEvents } from '@/services/groupEvents'
import { useNetwork } from '@/store/networkContext'
import type { EventGroup, TimelineEvent } from '@/types/timeline'

type BandId = BlockMarkerId | 'pre-genesis'

const COLORS: Record<BandId, { border: string; text: string; dot: string }> = {
  'pre-genesis': { border: 'border-slate-400', text: 'text-slate-600', dot: 'bg-slate-400' },
  genesis: { border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  fix: { border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500' },
  'last-fix': { border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  'default-fee-change': { border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' },
}

export function TimelineRail({ events }: { events: TimelineEvent[] }) {
  const { config } = useNetwork()

  // Bands from network markers, chronologically; pre-genesis is an implicit first band.
  const markersChron = useMemo(
    () => [...config.blockMarkers].sort((a, b) => a.block - b.block),
    [config],
  )
  const markersTopDown = useMemo(() => [...markersChron].reverse(), [markersChron])
  const genesisBlock = useMemo(() => {
    const g = markersChron.find((m) => m.id === 'genesis')
    return g ? g.block : 0
  }, [markersChron])

  const { groupsByBand, hasPreGenesis } = useMemo(() => {
    const all = groupEvents(events)
    const map = new Map<BandId, EventGroup[]>()
    map.set('pre-genesis', [])
    for (const m of markersChron) map.set(m.id, [])

    for (const g of all) {
      if (g.block < genesisBlock) {
        map.get('pre-genesis')!.push(g)
        continue
      }
      let assigned: BlockMarkerId | null = null
      for (const m of markersTopDown) {
        const ok = m.id === 'genesis' ? g.block >= m.block : g.block > m.block
        if (ok) {
          assigned = m.id
          break
        }
      }
      if (assigned !== null) map.get(assigned)!.push(g)
    }

    return {
      groupsByBand: map,
      hasPreGenesis: (map.get('pre-genesis') ?? []).length > 0,
    }
  }, [events, markersChron, markersTopDown, genesisBlock])

  return (
    <div className="flex flex-col gap-3">
      {hasPreGenesis && (
        <RangeSection
          variant="pre-genesis"
          label={`Before SSV Staking Genesis — Block ${genesisBlock}`}
          groups={groupsByBand.get('pre-genesis') ?? []}
        />
      )}
      {markersChron.map((m) => {
        const prefix = m.id === 'genesis' ? 'After SSV Staking Genesis' : `After ${m.label}`
        return (
          <RangeSection
            key={m.id}
            variant={m.id}
            label={`${prefix} — Block ${m.block}`}
            groups={groupsByBand.get(m.id) ?? []}
          />
        )
      })}
    </div>
  )
}

function RangeSection({
  variant,
  label,
  groups,
}: {
  variant: BandId
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
