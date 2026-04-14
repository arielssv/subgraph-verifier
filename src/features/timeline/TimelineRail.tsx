import { useMemo, useState } from 'react'
import {
  DEFAULT_OPERATOR_FEE_CHANGE_BLOCK,
  FIX_BLOCK,
  LAST_FIX_BLOCK,
  STAKING_GENESIS_BLOCK,
} from '@/config'
import { EventCard } from '@/features/timeline/EventCard'
import { groupEvents } from '@/services/groupEvents'
import type { EventGroup, TimelineEvent } from '@/types/timeline'

type RangeVariant = 'genesis' | 'fix' | 'last-fix' | 'default-fee-change'

const COLORS: Record<RangeVariant, { border: string; text: string; dot: string }> = {
  genesis: { border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  fix: { border: 'border-red-500', text: 'text-red-700', dot: 'bg-red-500' },
  'last-fix': { border: 'border-amber-500', text: 'text-amber-700', dot: 'bg-amber-500' },
  'default-fee-change': { border: 'border-blue-500', text: 'text-blue-700', dot: 'bg-blue-500' },
}

type RangeSpec = {
  id: RangeVariant
  label: string
  // true when the group belongs to this range (exclusive upper bound handled by array ordering)
  contains: (block: number) => boolean
}

// Ranges are evaluated in order; each event lands in the first range whose contains(block) returns true.
// The predicates are "lower bounds" — walk ranges bottom-up so later (higher-block) markers take precedence.
const RANGES_TOP_DOWN: RangeSpec[] = [
  {
    id: 'default-fee-change',
    label: `After Default Operator Fee Change — Block ${DEFAULT_OPERATOR_FEE_CHANGE_BLOCK}`,
    contains: (b) => b > DEFAULT_OPERATOR_FEE_CHANGE_BLOCK,
  },
  {
    id: 'last-fix',
    label: `After Last Bug Fix — Block ${LAST_FIX_BLOCK}`,
    contains: (b) => b > LAST_FIX_BLOCK,
  },
  {
    id: 'fix',
    label: `After Bug Fix — Block ${FIX_BLOCK}`,
    contains: (b) => b > FIX_BLOCK,
  },
  {
    id: 'genesis',
    label: `After SSV Staking Genesis — Block ${STAKING_GENESIS_BLOCK}`,
    contains: (b) => b >= STAKING_GENESIS_BLOCK,
  },
]

function bucketForBlock(block: number): RangeVariant {
  for (const r of RANGES_TOP_DOWN) {
    if (r.contains(block)) return r.id
  }
  return 'genesis'
}

// Render order is genesis → fix → last-fix → default-fee-change (chronological)
const RANGES_CHRON = [...RANGES_TOP_DOWN].reverse()

export function TimelineRail({ events }: { events: TimelineEvent[] }) {
  const groupsByRange = useMemo(() => {
    const all = groupEvents(events)
    const map: Record<RangeVariant, EventGroup[]> = {
      genesis: [],
      fix: [],
      'last-fix': [],
      'default-fee-change': [],
    }
    for (const g of all) {
      map[bucketForBlock(g.block)].push(g)
    }
    return map
  }, [events])

  return (
    <div className="flex flex-col gap-3">
      {RANGES_CHRON.map((r) => (
        <RangeSection
          key={r.id}
          variant={r.id}
          label={r.label}
          groups={groupsByRange[r.id]}
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
  variant: RangeVariant
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
