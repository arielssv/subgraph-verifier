import { Card, CardContent } from '@/components/ui/card'
import type { ComparisonStats } from '@/types/comparison'

type Props = {
  stats: ComparisonStats
  dimmed?: boolean
}

export function StatsCards({ stats, dimmed = false }: Props) {
  const matchPct =
    stats.totalOperators === 0 ? 0 : Math.round((stats.cleanOperators / stats.totalOperators) * 100)
  const mismatchPct =
    stats.totalOperators === 0 ? 0 : Math.round((stats.operatorsWithIssues / stats.totalOperators) * 100)

  const cards = [
    { label: 'Total Operators', value: String(stats.totalOperators), hint: '' },
    {
      label: 'Match',
      value: String(stats.cleanOperators),
      hint: stats.totalOperators === 0 ? '' : `${matchPct}%`,
      tone: 'good' as const,
    },
    {
      label: 'Mismatch',
      value: String(stats.operatorsWithIssues),
      hint: stats.totalOperators === 0 ? '' : `${mismatchPct}%`,
      tone: 'bad' as const,
    },
  ]

  return (
    <div className={`grid grid-cols-1 gap-3 sm:grid-cols-3 ${dimmed ? 'opacity-40' : ''}`}>
      {cards.map((c) => (
        <Card key={c.label}>
          <CardContent className="flex flex-col gap-1 p-4">
            <div className="text-xs uppercase tracking-wide text-muted-foreground">{c.label}</div>
            <div
              className={
                dimmed
                  ? 'text-2xl font-semibold text-muted-foreground'
                  : c.tone === 'good'
                  ? 'text-2xl font-semibold text-emerald-600'
                  : c.tone === 'bad'
                  ? 'text-2xl font-semibold text-red-600'
                  : 'text-2xl font-semibold'
              }
            >
              {dimmed ? '—' : c.value}
              {!dimmed && c.hint && (
                <span className="ml-2 text-sm font-normal text-muted-foreground">{c.hint}</span>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export function emptyStats(): ComparisonStats {
  return {
    totalOperators: 0,
    cleanOperators: 0,
    operatorsWithIssues: 0,
    totalMetricChecks: 0,
    passedMetricChecks: 0,
    perMetric: {
      ethFee: { match: 0, mismatch: 0, error: 0 },
      ssvFee: { match: 0, mismatch: 0, error: 0 },
      privacy: { match: 0, mismatch: 0, error: 0 },
      status: { match: 0, mismatch: 0, error: 0 },
      validatorCount: { match: 0, mismatch: 0, error: 0 },
    },
  }
}
