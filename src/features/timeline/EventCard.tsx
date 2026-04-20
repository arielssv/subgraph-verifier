import { useEffect, useState } from 'react'
import { EVENT_ACCENT, EVENT_DOT, EVENT_TEXT } from '@/features/timeline/eventColors'
import { useNetwork } from '@/store/networkContext'
import {
  TYPE_LABELS,
  type ClusterEvent,
  type EventGroup,
  type FeeChangeEvent,
  type MigrationEvent,
  type OperatorAddedEvent,
  type PrivacyUpdateEvent,
  type TimelineEventType,
  type WithdrawalEvent,
} from '@/types/timeline'
import { formatRelativeTime } from '@/utils/formatTime'

function shortAddr(addr: string): string {
  if (!addr) return ''
  return `${addr.slice(0, 8)}…${addr.slice(-6)}`
}

function shortTx(hash: string): string {
  // 0x-prefixed hash → "0xFIRST4…LAST4"
  if (hash.startsWith('0x') && hash.length >= 10) {
    return `${hash.slice(0, 6)}…${hash.slice(-4)}`
  }
  return hash
}

function Field({ label, value }: { label: string; value: string | number }) {
  return (
    <>
      <span className="text-xs text-muted-foreground">{label}:</span>
      <span className="font-mono text-xs break-all">{String(value)}</span>
    </>
  )
}

function Separator({ label }: { label?: string }) {
  return (
    <span className="col-span-full mt-1 text-[10px] text-muted-foreground/70">
      {label ? `── ${label} ──` : '──'}
    </span>
  )
}

function RegistrationBody({ items }: { items: OperatorAddedEvent[] }) {
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.map((d, i) => (
        <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          <Field label="Owner" value={shortAddr(d.owner)} />
          <Field label="Fee" value={d.fee} />
        </div>
      ))}
    </div>
  )
}

function MigrationBody({ items }: { items: MigrationEvent[] }) {
  const total = items.reduce((s, d) => s + Number(d.cluster_validatorCount), 0)
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.length > 1 && <Field label="Total Cluster Validators" value={total} />}
      {items.map((d, i) => (
        <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          {items.length > 1 && <Separator label={`cluster ${i + 1}`} />}
          <Field label="Owner" value={shortAddr(d.owner)} />
          <Field label="Operators" value={`[${d.operatorIds.join(', ')}]`} />
          <Field label="Cluster ValCount" value={d.cluster_validatorCount} />
          <Field label="Cluster Active" value={String(d.cluster_active)} />
          <Field label="ETH Deposited" value={d.ethDeposited} />
          <Field label="SSV Refunded" value={d.ssvRefunded} />
        </div>
      ))}
    </div>
  )
}

function ValidatorChangeBody({ items }: { items: ClusterEvent[] }) {
  const byOwner = new Map<string, ClusterEvent[]>()
  for (const d of items) {
    if (!byOwner.has(d.owner)) byOwner.set(d.owner, [])
    byOwner.get(d.owner)!.push(d)
  }

  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.length > 1 && <Field label="Events in tx" value={items.length} />}
      {Array.from(byOwner.entries()).map(([owner, groupItems], i) => {
        const last = groupItems[groupItems.length - 1]
        return (
          <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
            {byOwner.size > 1 && <Separator />}
            <Field label="Owner" value={shortAddr(owner)} />
            <Field label="Operators" value={`[${last.operatorIds.join(', ')}]`} />
            <Field label="Cluster ValCount (after)" value={last.cluster_validatorCount} />
            <Field label="Cluster Active" value={String(last.cluster_active)} />
            {groupItems.length > 1 && <Field label="Count" value={groupItems.length} />}
          </div>
        )
      })}
    </div>
  )
}

function ClusterBody({ items }: { items: ClusterEvent[] }) {
  const total = items.reduce((s, d) => s + Number(d.cluster_validatorCount), 0)
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.length > 1 && <Field label="Total Cluster Validators" value={total} />}
      {items.map((d, i) => (
        <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          {items.length > 1 && <Separator label={`cluster ${i + 1}`} />}
          <Field label="Owner" value={shortAddr(d.owner)} />
          <Field label="Operators" value={`[${d.operatorIds.join(', ')}]`} />
          <Field label="Cluster ValCount" value={d.cluster_validatorCount} />
          <Field label="Cluster Active" value={String(d.cluster_active)} />
        </div>
      ))}
    </div>
  )
}

function FeeChangeBody({ items }: { items: FeeChangeEvent[] }) {
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.map((d, i) => (
        <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          <Field label="New Fee" value={d.fee} />
        </div>
      ))}
    </div>
  )
}

function WithdrawalBody({ items }: { items: WithdrawalEvent[] }) {
  const total = items.reduce((s, d) => s + BigInt(d.value), 0n)
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.length > 1 && <Field label="Total Value" value={total.toString()} />}
      {items.map((d, i) => (
        <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          <Field label="Value" value={d.value} />
        </div>
      ))}
    </div>
  )
}

function PrivacyUpdateBody({ items }: { items: PrivacyUpdateEvent[] }) {
  return (
    <div className="grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
      {items.map((d, i) => (
        <div key={i} className="col-span-full grid grid-cols-[max-content_1fr] gap-x-3 gap-y-1">
          {items.length > 1 && <Separator label={`batch ${i + 1}`} />}
          <Field label="New Status" value={d.toPrivate ? 'Private' : 'Public'} />
          <Field label="Operators" value={`[${d.operatorIds.join(', ')}]`} />
        </div>
      ))}
    </div>
  )
}

function Body({ group }: { group: EventGroup }) {
  switch (group.type) {
    case 'registration':
      return <RegistrationBody items={group.items as OperatorAddedEvent[]} />
    case 'migration':
      return <MigrationBody items={group.items as MigrationEvent[]} />
    case 'val-added':
    case 'val-removed':
      return <ValidatorChangeBody items={group.items as ClusterEvent[]} />
    case 'liquidation':
    case 'reactivation':
      return <ClusterBody items={group.items as ClusterEvent[]} />
    case 'fee-change':
      return <FeeChangeBody items={group.items as FeeChangeEvent[]} />
    case 'withdrawal':
      return <WithdrawalBody items={group.items as WithdrawalEvent[]} />
    case 'privacy-update':
      return <PrivacyUpdateBody items={group.items as PrivacyUpdateEvent[]} />
    case 'removal':
      return null
    default:
      return null
  }
}

export function EventCard({ group }: { group: EventGroup }) {
  const { config } = useNetwork()
  const count = group.items.length
  const label = TYPE_LABELS[group.type as TimelineEventType]
  const txHref = `${config.etherscanBaseUrl}/tx/${group.tx}`
  const relativeTime = useRelativeTime(group.timestamp)

  return (
    <div className="relative">
      <span
        className={`absolute -left-[19px] top-4 h-3 w-3 rounded-full border-2 border-background ${EVENT_DOT[group.type]}`}
      />
      <div className={`rounded-md border border-l-4 bg-card p-3 ${EVENT_ACCENT[group.type]}`}>
        <div className="flex items-baseline justify-between gap-3">
          <span
            className={`text-xs font-bold uppercase tracking-wide ${EVENT_TEXT[group.type]}`}
          >
            {label}
            {count > 1 && ` ×${count}`}
          </span>
          <span className="text-xs text-muted-foreground">
            Block {group.block}
            {relativeTime && (
              <>
                {' · '}
                <span title={new Date(group.timestamp).toISOString()}>{relativeTime}</span>
              </>
            )}
            {' · '}
            <a
              href={txHref}
              target="_blank"
              rel="noreferrer"
              className="text-primary hover:underline"
            >
              {shortTx(group.tx)}
            </a>
          </span>
        </div>
        <div className="mt-2">
          <Body group={group} />
        </div>
      </div>
    </div>
  )
}

function useRelativeTime(ms: number): string | null {
  const [now, setNow] = useState(Date.now())
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [])
  if (!Number.isFinite(ms) || ms <= 0) return null
  return formatRelativeTime(ms, now)
}
