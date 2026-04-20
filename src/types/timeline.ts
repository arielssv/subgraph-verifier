export type TimelineEventType =
  | 'registration'
  | 'migration'
  | 'val-added'
  | 'val-removed'
  | 'liquidation'
  | 'reactivation'
  | 'fee-change'
  | 'withdrawal'
  | 'removal'
  | 'privacy-update'

export type OperatorAddedEvent = {
  operatorId: string
  owner: string
  fee: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export type ClusterEvent = {
  owner: string
  operatorIds: string[]
  cluster_validatorCount: string
  cluster_active: boolean
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export type MigrationEvent = ClusterEvent & {
  ethDeposited: string
  ssvRefunded: string
  effectiveBalance: string
}

export type FeeChangeEvent = {
  operatorId: string
  fee: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export type WithdrawalEvent = {
  operatorId: string
  value: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export type RemovalEvent = {
  operatorId: string
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export type PrivacyUpdateEvent = {
  operatorIds: string[]
  toPrivate: boolean
  blockNumber: string
  blockTimestamp: string
  transactionHash: string
}

export type TimelineEvent =
  | { type: 'registration'; block: number; timestamp: number; tx: string; data: OperatorAddedEvent }
  | { type: 'migration'; block: number; timestamp: number; tx: string; data: MigrationEvent }
  | { type: 'val-added'; block: number; timestamp: number; tx: string; data: ClusterEvent }
  | { type: 'val-removed'; block: number; timestamp: number; tx: string; data: ClusterEvent }
  | { type: 'liquidation'; block: number; timestamp: number; tx: string; data: ClusterEvent }
  | { type: 'reactivation'; block: number; timestamp: number; tx: string; data: ClusterEvent }
  | { type: 'fee-change'; block: number; timestamp: number; tx: string; data: FeeChangeEvent }
  | { type: 'withdrawal'; block: number; timestamp: number; tx: string; data: WithdrawalEvent }
  | { type: 'removal'; block: number; timestamp: number; tx: string; data: RemovalEvent }
  | { type: 'privacy-update'; block: number; timestamp: number; tx: string; data: PrivacyUpdateEvent }

export type EventGroup = {
  type: TimelineEventType
  block: number
  timestamp: number
  tx: string
  // items are the raw event data payloads, same discriminator as parent
  items: TimelineEvent['data'][]
}

export type TimelineOperator = {
  id: string
  operatorId: string
  fee: string
  feeSSV: string
  feeIndex: string
  feeIndexBlockNumber: string
  feeIndexSSV: string
  feeIndexBlockNumberSSV: string
  removed: boolean
  isPrivate: boolean
  validatorCount: string
}

export type OnChainInfo = {
  fee: string
  valCount: number
  isPrivate: boolean
  isActive: boolean
} | null

export type TimelineOnChain = {
  ethFee: string | null
  ssvFee: string | null
  ethInfo: OnChainInfo
  ssvInfo: OnChainInfo
}

export type PreGenesisSnapshot = {
  registration: OperatorAddedEvent | null
  preAddedCount: number
  preRemovedCount: number
  // Privacy state at the moment of staking genesis. `null` means no privacy-update
  // events before genesis (i.e. operator was in the default state — public).
  isPrivateAtGenesis: boolean | null
}

export type TimelineData = {
  operator: TimelineOperator
  events: TimelineEvent[]
  preGenesis: PreGenesisSnapshot
  onChain: TimelineOnChain
}

export type LoadStage = 'events' | 'pre-genesis' | 'on-chain'

export type TimelineState =
  | { status: 'idle' }
  | { status: 'loading'; operatorId: string; stage: LoadStage; startedAt: number }
  | { status: 'ready'; operatorId: string; data: TimelineData; lastFetchedAt: number }
  | { status: 'not-found'; operatorId: string }
  | { status: 'error'; operatorId: string; message: string }

export class OperatorNotFoundError extends Error {
  readonly operatorId: string
  constructor(operatorId: string) {
    super(`Operator ${operatorId} not found`)
    this.operatorId = operatorId
    this.name = 'OperatorNotFoundError'
  }
}

export const TYPE_LABELS: Record<TimelineEventType, string> = {
  registration: 'Operator Registered',
  migration: 'Cluster Migrated to ETH',
  'val-added': 'Validator Added',
  'val-removed': 'Validator Removed',
  liquidation: 'Cluster Liquidated',
  reactivation: 'Cluster Reactivated',
  'fee-change': 'Operator Fee Executed',
  withdrawal: 'Operator Withdrawn',
  removal: 'Operator Removed',
  'privacy-update': 'Privacy Status Updated',
}
