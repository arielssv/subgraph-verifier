import { Input } from '@/components/ui/input'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { METRIC_LIST, type ComparisonStats, type MetricId } from '@/types/comparison'

export type ShowFilter = 'all' | 'matching' | 'mismatch'

type Props = {
  operatorIdQuery: string
  setOperatorIdQuery: (q: string) => void
  show: ShowFilter
  setShow: (s: ShowFilter) => void
  metric: MetricId
  setMetric: (m: MetricId) => void
  stats: ComparisonStats
  disabled?: boolean
}

const ACTIVE =
  'data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:hover:bg-primary/90'

function countForMetric(stats: ComparisonStats, metric: MetricId, show: ShowFilter): number {
  const s = stats.perMetric[metric]
  if (show === 'all') return stats.totalOperators
  if (show === 'matching') return s.match
  return s.mismatch
}

export function FilterPanel({
  operatorIdQuery,
  setOperatorIdQuery,
  show,
  setShow,
  metric,
  setMetric,
  stats,
  disabled = false,
}: Props) {
  return (
    <div
      className={`flex flex-col gap-3 rounded-md border bg-card p-4 ${
        disabled ? 'pointer-events-none opacity-40' : ''
      }`}
      aria-disabled={disabled}
    >
      <div className="flex flex-wrap items-center gap-3">
        <Input
          placeholder="Filter by operator ID"
          value={operatorIdQuery}
          onChange={(e) => setOperatorIdQuery(e.target.value)}
          className="max-w-xs"
          disabled={disabled}
        />
        <div className="flex items-center gap-2">
          <span className="text-xs uppercase text-muted-foreground">Show</span>
          <ToggleGroup
            type="single"
            value={show}
            onValueChange={(v) => v && setShow(v as ShowFilter)}
            className="rounded-md border"
            disabled={disabled}
          >
            <ToggleGroupItem value="all" className={ACTIVE}>All</ToggleGroupItem>
            <ToggleGroupItem value="matching" className={ACTIVE}>Matching</ToggleGroupItem>
            <ToggleGroupItem value="mismatch" className={ACTIVE}>Mismatch</ToggleGroupItem>
          </ToggleGroup>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs uppercase text-muted-foreground">Metric</span>
        <ToggleGroup
          type="single"
          value={metric}
          onValueChange={(v) => v && setMetric(v as MetricId)}
          className="flex-wrap rounded-md border"
          disabled={disabled}
        >
          {METRIC_LIST.map((m) => {
            const n = countForMetric(stats, m.id, show)
            return (
              <ToggleGroupItem key={m.id} value={m.id} className={ACTIVE}>
                {m.label} <span className="ml-1 opacity-70">({n})</span>
              </ToggleGroupItem>
            )
          })}
        </ToggleGroup>
      </div>
    </div>
  )
}
