import { buildOperatorRow } from '@/services/compareOperator'
import { fetchOnChainOperator, getViewsContract } from '@/services/onChainClient'
import { fetchAllOperators } from '@/services/subgraphClient'
import {
  METRIC_LIST,
  type ComparisonStats,
  type MetricId,
  type OperatorRow,
} from '@/types/comparison'

const BATCH_SIZE = 20

export type RunComparisonResult = {
  rows: OperatorRow[]
  stats: ComparisonStats
}

export type RunComparisonOptions = {
  onProgress?: (checked: number, total: number) => void
  signal?: AbortSignal
}

function emptyStats(total: number): ComparisonStats {
  const perMetric = {} as Record<MetricId, { match: number; mismatch: number; error: number }>
  for (const m of METRIC_LIST) {
    perMetric[m.id] = { match: 0, mismatch: 0, error: 0 }
  }
  return {
    totalOperators: total,
    cleanOperators: 0,
    operatorsWithIssues: 0,
    totalMetricChecks: total * METRIC_LIST.length,
    passedMetricChecks: 0,
    perMetric,
  }
}

function buildStats(rows: OperatorRow[]): ComparisonStats {
  const stats = emptyStats(rows.length)
  for (const row of rows) {
    let opClean = true
    for (const m of METRIC_LIST) {
      const slot = row[m.id]
      if (slot.error) {
        stats.perMetric[m.id].error += 1
        stats.perMetric[m.id].mismatch += 1
        opClean = false
      } else if (slot.match) {
        stats.perMetric[m.id].match += 1
        stats.passedMetricChecks += 1
      } else {
        stats.perMetric[m.id].mismatch += 1
        opClean = false
      }
    }
    if (opClean) stats.cleanOperators += 1
    else stats.operatorsWithIssues += 1
  }
  return stats
}

export async function runComparison(
  opts: RunComparisonOptions = {},
): Promise<RunComparisonResult> {
  const { onProgress, signal } = opts

  const operators = await fetchAllOperators()
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  const total = operators.length
  onProgress?.(0, total)

  const contract = getViewsContract()
  const rows: OperatorRow[] = []
  let checked = 0

  for (let i = 0; i < operators.length; i += BATCH_SIZE) {
    if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

    const batch = operators.slice(i, i + BATCH_SIZE)
    const results = await Promise.all(
      batch.map(async (op) => {
        const operatorId = BigInt(op.operatorId)
        const onChain = await fetchOnChainOperator(contract, operatorId)
        return buildOperatorRow(op, onChain)
      }),
    )

    rows.push(...results)
    checked += batch.length
    onProgress?.(checked, total)
  }

  const stats = buildStats(rows)
  return { rows, stats }
}
