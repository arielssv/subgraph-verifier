import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CurrentStateCard } from '@/features/timeline/CurrentStateCard'
import { LoadingStepper } from '@/features/timeline/LoadingStepper'
import { OperatorInput } from '@/features/timeline/OperatorInput'
import { PreGenesisCard } from '@/features/timeline/PreGenesisCard'
import { TimelineRail } from '@/features/timeline/TimelineRail'
import { useNetwork } from '@/store/networkContext'
import { useTimeline } from '@/store/timelineContext'
import { formatRelativeTime } from '@/utils/formatTime'
import { useEffect, useState } from 'react'

export function TimelinePage() {
  const { state, load, refresh } = useTimeline()
  const { config } = useNetwork()

  const isLoading = state.status === 'loading'
  const canRefresh = state.status === 'ready' || state.status === 'error' || state.status === 'not-found'
  const lastOperatorId =
    state.status === 'ready' || state.status === 'error' || state.status === 'not-found' || state.status === 'loading'
      ? state.operatorId
      : ''

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Operator Timeline</h2>
          <SubtitleForState state={state} networkLabel={config.label} />
        </div>
        <Button variant="outline" onClick={() => void refresh()} disabled={!canRefresh || isLoading}>
          Refresh
        </Button>
      </div>

      <div className="rounded-md border bg-card p-4">
        <OperatorInput
          defaultValue={lastOperatorId}
          disabled={isLoading}
          onLoad={(id) => void load(id)}
        />
      </div>

      {state.status === 'idle' && <IdlePanel />}

      {state.status === 'loading' && (
        <LoadingStepper
          stage={state.stage}
          operatorId={state.operatorId}
          startedAt={state.startedAt}
        />
      )}

      {state.status === 'not-found' && (
        <InlineMessageCard
          title="Operator not found"
          message={`No operator with ID ${state.operatorId} on ${config.label}.`}
          variant="warning"
        />
      )}

      {state.status === 'error' && (
        <InlineMessageCard
          title="Load failed"
          message={state.message}
          variant="destructive"
          retryLabel="Retry"
          onRetry={() => void load(state.operatorId)}
        />
      )}

      {state.status === 'ready' && (
        <>
          <PreGenesisCard snapshot={state.data.preGenesis} />
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Timeline</h3>
          </div>
          <TimelineRail events={state.data.events} />
          <CurrentStateCard operator={state.data.operator} onChain={state.data.onChain} />
        </>
      )}
    </div>
  )
}

function SubtitleForState({
  state,
  networkLabel,
}: {
  state: ReturnType<typeof useTimeline>['state']
  networkLabel: string
}) {
  if (state.status === 'ready') {
    return (
      <p className="text-sm text-muted-foreground">
        Operator {state.operatorId} · last fetched <RelativeTimestamp ts={state.lastFetchedAt} /> · {networkLabel}
      </p>
    )
  }
  if (state.status === 'loading') {
    return <p className="text-sm text-muted-foreground">Loading operator {state.operatorId} · {networkLabel}</p>
  }
  if (state.status === 'not-found' || state.status === 'error') {
    return <p className="text-sm text-muted-foreground">Operator {state.operatorId} · {networkLabel}</p>
  }
  return <p className="text-sm text-muted-foreground">Enter an operator ID · {networkLabel}</p>
}

function IdlePanel() {
  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base">No operator loaded</CardTitle>
        <CardDescription>
          Enter an operator ID above and click Load to see registration, cluster events, fee changes,
          liquidations, and current on-chain state.
        </CardDescription>
      </CardHeader>
    </Card>
  )
}

function InlineMessageCard({
  title,
  message,
  variant,
  retryLabel,
  onRetry,
}: {
  title: string
  message: string
  variant: 'warning' | 'destructive'
  retryLabel?: string
  onRetry?: () => void
}) {
  const border = variant === 'destructive' ? 'border-destructive' : 'border-amber-500'
  const titleColor = variant === 'destructive' ? 'text-destructive' : 'text-amber-600'
  return (
    <Card className={border}>
      <CardHeader>
        <CardTitle className={`text-base ${titleColor}`}>{title}</CardTitle>
        <CardDescription>{message}</CardDescription>
      </CardHeader>
      {onRetry && (
        <CardContent>
          <Button onClick={onRetry}>{retryLabel ?? 'Retry'}</Button>
        </CardContent>
      )}
    </Card>
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
