import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { METRIC_LIST, type MetricId, type OperatorRow } from '@/types/comparison'

function formatOnChain(row: OperatorRow, metric: MetricId): string {
  switch (metric) {
    case 'ethFee':
      return row.ethFee.onChain
    case 'ssvFee':
      return row.ssvFee.onChain
    case 'privacy':
      return `ETH: ${row.privacy.eth} · SSV: ${row.privacy.ssv}`
    case 'status':
      return `ETH: ${row.status.eth} · SSV: ${row.status.ssv}`
    case 'validatorCount': {
      const { eth, ssv } = row.validatorCount
      const ethN = Number(eth)
      const ssvN = Number(ssv)
      const total = Number.isNaN(ethN) || Number.isNaN(ssvN) ? '—' : String(ethN + ssvN)
      return `ETH ${eth} + SSV ${ssv} = ${total}`
    }
  }
}

function getMatch(row: OperatorRow, metric: MetricId): boolean {
  return row[metric].match
}

function getSubgraph(row: OperatorRow, metric: MetricId): string {
  return row[metric].subgraph
}

export function OperatorMetricsTable({ row }: { row: OperatorRow }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[180px]">Metric</TableHead>
            <TableHead>Subgraph</TableHead>
            <TableHead>On-chain</TableHead>
            <TableHead className="w-[80px] text-center">Match</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {METRIC_LIST.map((m) => {
            const match = getMatch(row, m.id)
            return (
              <TableRow key={m.id}>
                <TableCell className="font-medium">{m.label}</TableCell>
                <TableCell className="break-all font-mono text-xs">{getSubgraph(row, m.id)}</TableCell>
                <TableCell className="break-all font-mono text-xs">{formatOnChain(row, m.id)}</TableCell>
                <TableCell
                  className={
                    match
                      ? 'text-center font-semibold text-emerald-600'
                      : 'text-center font-semibold text-red-600'
                  }
                >
                  {match ? '✓' : '✗'}
                </TableCell>
              </TableRow>
            )
          })}
        </TableBody>
      </Table>
    </div>
  )
}
