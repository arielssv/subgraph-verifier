import { Progress } from '@/components/ui/progress'
import type { LoadStage } from '@/types/timeline'
import { formatElapsed } from '@/utils/formatTime'
import { useEffect, useState } from 'react'

type Props = {
  stage: LoadStage
  operatorId: string
  startedAt: number
}

const STAGES: { id: LoadStage; label: string }[] = [
  { id: 'events', label: 'Fetching events' },
  { id: 'pre-genesis', label: 'Fetching pre-genesis validator events' },
  { id: 'on-chain', label: 'Fetching on-chain state' },
]

function stageIndex(s: LoadStage): number {
  return STAGES.findIndex((x) => x.id === s)
}

export function LoadingStepper({ stage, operatorId, startedAt }: Props) {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  const current = stageIndex(stage)

  return (
    <div className="flex flex-col gap-4 rounded-md border bg-card p-4">
      <p className="text-sm text-muted-foreground">
        Loading operator {operatorId} · elapsed {formatElapsed(now - startedAt)}
      </p>

      <div className="flex flex-col gap-2">
        {STAGES.map((s, i) => {
          const status: 'done' | 'active' | 'pending' =
            i < current ? 'done' : i === current ? 'active' : 'pending'
          return (
            <div key={s.id} className="flex items-center gap-3 text-sm">
              <Dot status={status} />
              <span
                className={
                  status === 'pending'
                    ? 'text-muted-foreground'
                    : status === 'done'
                    ? 'text-foreground'
                    : 'font-medium text-foreground'
                }
              >
                {s.label}
                {status === 'active' ? '…' : ''}
              </span>
            </div>
          )
        })}
      </div>

      <Progress value={Math.round(((current + 0.5) / STAGES.length) * 100)} />
    </div>
  )
}

function Dot({ status }: { status: 'done' | 'active' | 'pending' }) {
  if (status === 'done') {
    return (
      <span className="flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
        ✓
      </span>
    )
  }
  if (status === 'active') {
    return <span className="h-4 w-4 animate-pulse rounded-full bg-primary" />
  }
  return <span className="h-4 w-4 rounded-full border border-muted-foreground/50" />
}
