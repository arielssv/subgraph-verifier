import { Card, CardContent } from '@/components/ui/card'
import type { PreGenesisSnapshot } from '@/types/timeline'

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-1 p-4">
        <div className="text-xs uppercase tracking-wide text-muted-foreground">{label}</div>
        <div className="font-mono text-xl font-semibold break-all">{value}</div>
      </CardContent>
    </Card>
  )
}

export function PreGenesisCard({ snapshot }: { snapshot: PreGenesisSnapshot }) {
  const { registration, preAddedCount, preRemovedCount } = snapshot
  const net = preAddedCount - preRemovedCount

  return (
    <section className="flex flex-col gap-3">
      <h3 className="text-lg font-semibold">Before Staking Genesis</h3>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <StatCard label="Registered at block" value={registration ? registration.blockNumber : 'N/A'} />
        <StatCard label="Initial Fee" value={registration ? registration.fee : 'N/A'} />
        <StatCard label="Validators Added" value={preAddedCount} />
        <StatCard label="Validators Removed" value={preRemovedCount} />
        <StatCard label="Net Validators" value={net} />
      </div>
    </section>
  )
}
