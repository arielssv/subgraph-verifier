import { useMemo, useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { ShowFilter } from '@/features/comparison/FilterPanel'
import {
  METRIC_LIST,
  type MetricId,
  type MetricPair,
  type MetricTriple,
  type OperatorRow,
} from '@/types/comparison'

type Props = {
  rows: OperatorRow[]
  operatorIdQuery: string
  show: ShowFilter
  metric: MetricId
}

function isPairMetric(metric: MetricId): boolean {
  return metric === 'ethFee' || metric === 'ssvFee'
}

function getPair(row: OperatorRow, metric: MetricId): MetricPair {
  return row[metric] as MetricPair
}

function getTriple(row: OperatorRow, metric: MetricId): MetricTriple {
  return row[metric] as MetricTriple
}

export function ResultsTable({ rows, operatorIdQuery, show, metric }: Props) {
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')

  const pair = isPairMetric(metric)
  const metricMeta = METRIC_LIST.find((m) => m.id === metric)!

  const filtered = useMemo(() => {
    const q = operatorIdQuery.trim()
    let out = rows
    if (q) out = out.filter((r) => r.operatorId.includes(q))
    if (show !== 'all') {
      out = out.filter((r) => {
        const slot = r[metric]
        return show === 'matching' ? slot.match : !slot.match
      })
    }
    return [...out].sort((a, b) => {
      const an = Number(a.operatorId)
      const bn = Number(b.operatorId)
      return sortDir === 'asc' ? an - bn : bn - an
    })
  }, [rows, operatorIdQuery, show, metric, sortDir])

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">
              <button
                type="button"
                onClick={() => setSortDir(sortDir === 'asc' ? 'desc' : 'asc')}
                className="font-medium hover:underline"
              >
                Operator ID {sortDir === 'asc' ? '↑' : '↓'}
              </button>
            </TableHead>
            {pair ? (
              <>
                <TableHead>Subgraph value</TableHead>
                <TableHead>On-chain value</TableHead>
              </>
            ) : (
              <>
                <TableHead>Subgraph value</TableHead>
                <TableHead>On-chain (ETH)</TableHead>
                <TableHead>On-chain (SSV)</TableHead>
              </>
            )}
            <TableHead className="w-[80px] text-center">Match</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={pair ? 4 : 5} className="py-8 text-center text-sm text-muted-foreground">
                No operators match the current filters.
              </TableCell>
            </TableRow>
          ) : (
            filtered.map((row) =>
              pair ? (
                <PairRow key={row.operatorId} row={row} metric={metric} />
              ) : (
                <TripleRow key={row.operatorId} row={row} metric={metric} />
              ),
            )
          )}
        </TableBody>
      </Table>
    </div>
  )
  // metricMeta reserved for future header use
  void metricMeta
}

function matchCellClass(match: boolean): string {
  return match
    ? 'text-emerald-600 text-center font-semibold'
    : 'text-red-600 text-center font-semibold'
}

function PairRow({ row, metric }: { row: OperatorRow; metric: MetricId }) {
  const slot = getPair(row, metric)
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{row.operatorId}</TableCell>
      <TableCell className="break-all font-mono text-xs">{slot.subgraph}</TableCell>
      <TableCell className="break-all font-mono text-xs">{slot.onChain}</TableCell>
      <TableCell className={matchCellClass(slot.match)}>{slot.match ? '✓' : '✗'}</TableCell>
    </TableRow>
  )
}

function TripleRow({ row, metric }: { row: OperatorRow; metric: MetricId }) {
  const slot = getTriple(row, metric)
  return (
    <TableRow>
      <TableCell className="font-mono text-sm">{row.operatorId}</TableCell>
      <TableCell className="break-all font-mono text-xs">{slot.subgraph}</TableCell>
      <TableCell className="break-all font-mono text-xs">{slot.eth}</TableCell>
      <TableCell className="break-all font-mono text-xs">{slot.ssv}</TableCell>
      <TableCell className={matchCellClass(slot.match)}>{slot.match ? '✓' : '✗'}</TableCell>
    </TableRow>
  )
}

export function countFiltered(
  rows: OperatorRow[],
  operatorIdQuery: string,
  show: ShowFilter,
  metric: MetricId,
): number {
  const q = operatorIdQuery.trim()
  let n = 0
  for (const r of rows) {
    if (q && !r.operatorId.includes(q)) continue
    if (show !== 'all') {
      const slot = r[metric]
      if (show === 'matching' ? !slot.match : slot.match) continue
    }
    n += 1
  }
  return n
}
