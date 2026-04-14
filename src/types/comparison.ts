export type SubgraphOperator = {
  id: string
  operatorId: string
  owner: { id: string }
  fee: string
  feeSSV: string
  feeIndex: string
  feeIndexSSV: string
  feeIndexBlockNumber: string
  feeIndexBlockNumberSSV: string
  validatorCount: string
  removed: boolean
  isPrivate: boolean
  whitelistedContract: string | null
  whitelisted: { id: string }[]
}

export type OnChainOperator = {
  owner: string | null
  fee: string | null
  validatorCount: number | null
  isPrivate: boolean | null
  isActive: boolean | null
  whitelistedAddress: string | null
  error?: string
}

export type OnChainResult = {
  eth: OnChainOperator
  ssv: OnChainOperator
}

export type MetricId = 'ethFee' | 'ssvFee' | 'privacy' | 'status' | 'validatorCount'

export const METRIC_LIST: { id: MetricId; label: string; headerLabel: string; shape: 'pair' | 'triple' }[] = [
  { id: 'ethFee', label: 'ETH Fee', headerLabel: 'ETH fees', shape: 'pair' },
  { id: 'ssvFee', label: 'SSV Fee', headerLabel: 'SSV fees', shape: 'pair' },
  { id: 'privacy', label: 'Privacy', headerLabel: 'Privacy', shape: 'triple' },
  { id: 'status', label: 'Status', headerLabel: 'Status', shape: 'triple' },
  { id: 'validatorCount', label: 'Validator Count', headerLabel: 'Validator counts', shape: 'triple' },
]

export type MetricPair = {
  subgraph: string
  onChain: string
  match: boolean
  error: boolean
}

export type MetricTriple = {
  subgraph: string
  eth: string
  ssv: string
  match: boolean
  error: boolean
}

export type OperatorRow = {
  operatorId: string
  ethFee: MetricPair
  ssvFee: MetricPair
  privacy: MetricTriple
  status: MetricTriple
  validatorCount: MetricTriple
}

export function isPairMetric(metric: MetricId): boolean {
  return metric === 'ethFee' || metric === 'ssvFee'
}

export type ComparisonStats = {
  totalOperators: number
  cleanOperators: number
  operatorsWithIssues: number
  totalMetricChecks: number
  passedMetricChecks: number
  perMetric: Record<MetricId, { match: number; mismatch: number; error: number }>
}
