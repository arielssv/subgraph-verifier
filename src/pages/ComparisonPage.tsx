import { useEffect, useMemo, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { FilterPanel, type ShowFilter } from '@/features/comparison/FilterPanel'
import { ResultsTable, countFiltered } from '@/features/comparison/ResultsTable'
import { StatsCards, emptyStats } from '@/features/comparison/StatsCards'
import { useComparison } from '@/store/comparisonContext'
import { METRIC_LIST, type MetricId } from '@/types/comparison'
import { formatElapsed, formatRelativeTime } from '@/utils/formatTime'

export function ComparisonPage() {
  const { state, run, refresh } = useComparison()
  const [operatorIdQuery, setOperatorIdQuery] = useState('')
  const [show, setShow] = useState<ShowFilter>('mismatch')
  const [metric, setMetric] = useState<MetricId>('ethFee')

  const hasData = state.status === 'ready'
  const isIdle = state.status === 'idle'
  const isLoading = state.status === 'loading'
  const isError = state.status === 'error'

  const stats = hasData ? state.stats : emptyStats()
  const rows = hasData ? state.rows : []
  const metricMeta = METRIC_LIST.find((m) => m.id === metric)!
  const visible = hasData ? countFiltered(rows, operatorIdQuery, show, metric) : 0

  return (
    <div className="flex flex-col gap-4">
      <Header
        state={state}
        onRefresh={() => void refresh()}
        canRefresh={hasData}
      />

      <StatsCards stats={stats} dimmed={!hasData} />

      <FilterPanel
        operatorIdQuery={operatorIdQuery}
        setOperatorIdQuery={setOperatorIdQuery}
        show={show}
        setShow={setShow}
        metric={metric}
        setMetric={setMetric}
        stats={stats}
        disabled={!hasData}
      />

      <div className="flex flex-col gap-1">
        <h3 className="text-lg font-semibold">Comparing {metricMeta.headerLabel}</h3>
        {hasData && (
          <p className="text-sm text-muted-foreground">showing {visible} operators</p>
        )}
      </div>

      {isIdle && <EmptyPanel onRun={() => void run()} />}
      {isLoading && <LoadingPanel state={state} />}
      {isError && <ErrorPanel message={state.message} onRetry={() => void run()} />}
      {hasData && (
        <ResultsTable
          rows={rows}
          operatorIdQuery={operatorIdQuery}
          show={show}
          metric={metric}
        />
      )}
    </div>
  )
}

function Header({
  state,
  onRefresh,
  canRefresh,
}: {
  state: { status: 'idle' | 'loading' | 'ready' | 'error'; lastFetchedAt?: number }
  onRefresh: () => void
  canRefresh: boolean
}) {
  let subtitle = 'no data yet · Hoodi'
  if (state.status === 'loading') subtitle = 'fetching · Hoodi'
  if (state.status === 'ready' && 'lastFetchedAt' in state && state.lastFetchedAt) {
    return (
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Compare</h2>
          <p className="text-sm text-muted-foreground">
            last fetched <RelativeTimestamp ts={state.lastFetchedAt} /> · Hoodi
          </p>
        </div>
        <Button variant="outline" onClick={onRefresh} disabled={!canRefresh}>
          Refresh
        </Button>
      </div>
    )
  }
  if (state.status === 'error') subtitle = 'error · Hoodi'

  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <h2 className="text-xl font-semibold">Compare</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
      </div>
      <Button variant="outline" onClick={onRefresh} disabled={!canRefresh}>
        Refresh
      </Button>
    </div>
  )
}

function EmptyPanel({ onRun }: { onRun: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-dashed bg-card px-6 py-16 text-center">
      <div className="space-y-1">
        <p className="text-base font-medium">No data yet</p>
        <p className="max-w-md text-sm text-muted-foreground">
          Compares every SSV operator on Hoodi between the subgraph and the on-chain Views
          contract. Runs in your browser — typically 10–60 seconds.
        </p>
      </div>
      <Button size="lg" onClick={onRun}>
        Run comparison
      </Button>
    </div>
  )
}

function LoadingPanel({
  state,
}: {
  state: { status: 'loading'; checked: number; total: number; startedAt: number }
}) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const { pct, etaText } = useMemo(() => {
    if (state.total === 0) return { pct: 0, etaText: '' }
    const p = Math.floor((state.checked / state.total) * 100)
    if (state.checked === 0) return { pct: p, etaText: '' }
    const elapsed = now - state.startedAt
    const perOp = elapsed / state.checked
    const remaining = state.total - state.checked
    const etaMs = perOp * remaining
    return { pct: p, etaText: `~${formatElapsed(etaMs)} remaining` }
  }, [state.checked, state.total, state.startedAt, now])

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-2 rounded-md border bg-card p-4">
        <p className="text-sm text-muted-foreground">
          {state.total === 0
            ? 'Fetching operators from subgraph…'
            : `Checked ${state.checked} of ${state.total} operators`}
          {etaText && ` · ${etaText}`}
          {' · elapsed '}
          {formatElapsed(now - state.startedAt)}
        </p>
        <Progress value={pct} />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[120px]">Operator ID</TableHead>
              <TableHead>Subgraph value</TableHead>
              <TableHead>On-chain value</TableHead>
              <TableHead className="w-[80px] text-center">Match</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[0, 1, 2, 3, 4].map((i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-12" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                <TableCell><Skeleton className="mx-auto h-4 w-4" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

function ErrorPanel({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-md border border-destructive bg-destructive/5 px-6 py-16 text-center">
      <div className="space-y-1">
        <p className="text-base font-medium text-destructive">Comparison failed</p>
        <p className="max-w-md text-sm text-muted-foreground">{message}</p>
      </div>
      <Button onClick={onRetry}>Retry</Button>
    </div>
  )
}

function RelativeTimestamp({ ts }: { ts: number }) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])
  return <span>{formatRelativeTime(ts, now)}</span>
}
