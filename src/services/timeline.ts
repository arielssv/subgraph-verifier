import { Contract } from 'ethers'
import { STAKING_GENESIS_BLOCK } from '@/config'
import { getViewsContract } from '@/services/onChainClient'
import { fetchAllPaginated, gql } from '@/services/timelineClient'
import {
  OperatorNotFoundError,
  type ClusterEvent,
  type FeeChangeEvent,
  type LoadStage,
  type MigrationEvent,
  type OperatorAddedEvent,
  type RemovalEvent,
  type TimelineData,
  type TimelineEvent,
  type TimelineOnChain,
  type TimelineOperator,
  type WithdrawalEvent,
} from '@/types/timeline'

export type LoadTimelineOptions = {
  onStage?: (stage: LoadStage) => void
  signal?: AbortSignal
}

async function fetchOperator(operatorId: string): Promise<TimelineOperator | null> {
  const data = await gql<{ operator: TimelineOperator | null }>(`{
    operator(id: "${operatorId}") {
      id operatorId fee feeSSV feeIndex feeIndexBlockNumber
      feeIndexSSV feeIndexBlockNumberSSV removed isPrivate validatorCount
    }
  }`)
  return data.operator
}

function mapRows<D extends { blockNumber: string; transactionHash: string }, T extends TimelineEvent['type']>(
  type: T,
  rows: D[],
  minBlock?: number,
): TimelineEvent[] {
  const out: TimelineEvent[] = []
  for (const r of rows) {
    const block = Number(r.blockNumber)
    if (minBlock !== undefined && block < minBlock) continue
    out.push({ type, block, tx: r.transactionHash, data: r } as unknown as TimelineEvent)
  }
  return out
}

async function fetchEventsStage(operatorId: string): Promise<{
  operator: TimelineOperator
  events: TimelineEvent[]
}> {
  const operator = await fetchOperator(operatorId)
  if (!operator) throw new OperatorNotFoundError(operatorId)

  const [
    registrations,
    migrations,
    validatorAddeds,
    validatorRemoveds,
    liquidations,
    reactivations,
    feeChanges,
    withdrawals,
    removals,
  ] = await Promise.all([
    fetchAllPaginated<OperatorAddedEvent>(
      'operatorAddeds',
      `operatorId: "${operatorId}"`,
      'operatorId owner fee blockNumber transactionHash',
    ),
    fetchAllPaginated<MigrationEvent>(
      'clusterMigratedToETHs',
      `operatorIds_contains: ["${operatorId}"], blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount cluster_active ethDeposited ssvRefunded effectiveBalance blockNumber transactionHash',
    ),
    fetchAllPaginated<ClusterEvent>(
      'validatorAddeds',
      `operatorIds_contains: ["${operatorId}"], blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount cluster_active blockNumber transactionHash',
    ),
    fetchAllPaginated<ClusterEvent>(
      'validatorRemoveds',
      `operatorIds_contains: ["${operatorId}"], blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount cluster_active blockNumber transactionHash',
    ),
    fetchAllPaginated<ClusterEvent>(
      'clusterLiquidateds',
      `operatorIds_contains: ["${operatorId}"], blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount cluster_active blockNumber transactionHash',
    ),
    fetchAllPaginated<ClusterEvent>(
      'clusterReactivateds',
      `operatorIds_contains: ["${operatorId}"], blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount cluster_active blockNumber transactionHash',
    ),
    fetchAllPaginated<FeeChangeEvent>(
      'operatorFeeExecuteds',
      `operatorId: "${operatorId}", blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'operatorId fee blockNumber transactionHash',
    ),
    fetchAllPaginated<WithdrawalEvent>(
      'operatorWithdrawns',
      `operatorId: "${operatorId}", blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'operatorId value blockNumber transactionHash',
    ),
    fetchAllPaginated<RemovalEvent>(
      'operatorRemoveds',
      `operatorId: "${operatorId}", blockNumber_gte: "${STAKING_GENESIS_BLOCK}"`,
      'operatorId blockNumber transactionHash',
    ),
  ])

  const events: TimelineEvent[] = [
    ...mapRows('registration', registrations, STAKING_GENESIS_BLOCK),
    ...mapRows('migration', migrations),
    ...mapRows('val-added', validatorAddeds),
    ...mapRows('val-removed', validatorRemoveds),
    ...mapRows('liquidation', liquidations),
    ...mapRows('reactivation', reactivations),
    ...mapRows('fee-change', feeChanges),
    ...mapRows('withdrawal', withdrawals),
    ...mapRows('removal', removals),
  ]

  // Keep the first-ever registration around for the pre-genesis snapshot, even if it's before genesis.
  // fetchEventsStage returns events filtered to >= genesis; the caller builds preGenesis from the raw registrations list,
  // but since we already filtered, we'll fetch registrations separately in preGenesisStage when needed.
  // To keep the API simple, expose registrations unfiltered via a separate helper below.
  return { operator, events }
}

async function fetchFirstRegistration(operatorId: string): Promise<OperatorAddedEvent | null> {
  const rows = await fetchAllPaginated<OperatorAddedEvent>(
    'operatorAddeds',
    `operatorId: "${operatorId}"`,
    'operatorId owner fee blockNumber transactionHash',
  )
  return rows.length > 0 ? rows[0] : null
}

async function fetchPreGenesisStage(operatorId: string): Promise<{
  preAddedCount: number
  preRemovedCount: number
  registration: OperatorAddedEvent | null
}> {
  const [preAdded, preRemoved, registration] = await Promise.all([
    fetchAllPaginated<ClusterEvent>(
      'validatorAddeds',
      `operatorIds_contains: ["${operatorId}"], blockNumber_lt: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount blockNumber',
    ),
    fetchAllPaginated<ClusterEvent>(
      'validatorRemoveds',
      `operatorIds_contains: ["${operatorId}"], blockNumber_lt: "${STAKING_GENESIS_BLOCK}"`,
      'owner operatorIds cluster_validatorCount blockNumber',
    ),
    fetchFirstRegistration(operatorId),
  ])

  return {
    preAddedCount: preAdded.length,
    preRemovedCount: preRemoved.length,
    registration,
  }
}

async function callViews<T>(p: Promise<T>): Promise<T | null> {
  try {
    return await p
  } catch {
    return null
  }
}

async function fetchOnChainStage(contract: Contract, operatorId: string): Promise<TimelineOnChain> {
  const id = BigInt(operatorId)
  const [ethFeeRaw, ssvFeeRaw, ethInfoRaw, ssvInfoRaw] = await Promise.all([
    callViews(contract.getOperatorFee(id) as Promise<bigint>),
    callViews(contract.getOperatorFeeSSV(id) as Promise<bigint>),
    callViews(contract.getOperatorById(id) as Promise<unknown[]>),
    callViews(contract.getOperatorByIdSSV(id) as Promise<unknown[]>),
  ])

  const mapInfo = (r: unknown[] | null): TimelineOnChain['ethInfo'] => {
    if (!r) return null
    return {
      fee: (r[1] as bigint).toString(),
      valCount: Number(r[2]),
      isPrivate: r[4] as boolean,
      isActive: r[5] as boolean,
    }
  }

  return {
    ethFee: ethFeeRaw !== null ? ethFeeRaw.toString() : null,
    ssvFee: ssvFeeRaw !== null ? ssvFeeRaw.toString() : null,
    ethInfo: mapInfo(ethInfoRaw),
    ssvInfo: mapInfo(ssvInfoRaw),
  }
}

export async function loadTimeline(
  operatorId: string,
  opts: LoadTimelineOptions = {},
): Promise<TimelineData> {
  const { onStage, signal } = opts

  onStage?.('events')
  const { operator, events } = await fetchEventsStage(operatorId)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  onStage?.('pre-genesis')
  const preGenesis = await fetchPreGenesisStage(operatorId)
  if (signal?.aborted) throw new DOMException('Aborted', 'AbortError')

  onStage?.('on-chain')
  const contract = getViewsContract()
  const onChain = await fetchOnChainStage(contract, operatorId)

  return { operator, events, preGenesis, onChain }
}
