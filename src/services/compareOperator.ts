import type {
  MetricPair,
  MetricTriple,
  OnChainResult,
  OperatorRow,
  SubgraphOperator,
} from '@/types/comparison'

const MISSING = '—'

function fmtBool(b: boolean | null, truth: string, falsy: string): string {
  if (b === null) return MISSING
  return b ? truth : falsy
}

function privacyStr(b: boolean | null): string {
  return fmtBool(b, 'Private', 'Public')
}

function statusFromRemoved(removed: boolean): string {
  return removed ? 'Removed' : 'Active'
}

function statusFromActive(b: boolean | null): string {
  return fmtBool(b, 'Active', 'Removed')
}

export function buildOperatorRow(sg: SubgraphOperator, onChain: OnChainResult): OperatorRow {
  const { eth, ssv } = onChain

  const ethFee: MetricPair = (() => {
    if (eth.error) {
      return { subgraph: sg.fee, onChain: 'error', match: false, error: true }
    }
    const chainVal = eth.fee ?? MISSING
    return { subgraph: sg.fee, onChain: chainVal, match: sg.fee === chainVal, error: false }
  })()

  const ssvFee: MetricPair = (() => {
    if (ssv.error) {
      return { subgraph: sg.feeSSV, onChain: 'error', match: false, error: true }
    }
    const chainVal = ssv.fee ?? MISSING
    return { subgraph: sg.feeSSV, onChain: chainVal, match: sg.feeSSV === chainVal, error: false }
  })()

  const privacy: MetricTriple = (() => {
    const sgStr = privacyStr(sg.isPrivate)
    const ethStr = eth.error ? MISSING : privacyStr(eth.isPrivate)
    const ssvStr = ssv.error ? MISSING : privacyStr(ssv.isPrivate)
    const hasError = Boolean(eth.error) || Boolean(ssv.error)
    const match = !hasError && sgStr === ethStr && sgStr === ssvStr
    return { subgraph: sgStr, eth: ethStr, ssv: ssvStr, match, error: hasError }
  })()

  const status: MetricTriple = (() => {
    const sgStr = statusFromRemoved(sg.removed)
    const ethStr = eth.error ? MISSING : statusFromActive(eth.isActive)
    const ssvStr = ssv.error ? MISSING : statusFromActive(ssv.isActive)
    const hasError = Boolean(eth.error) || Boolean(ssv.error)
    const match = !hasError && sgStr === ethStr && sgStr === ssvStr
    return { subgraph: sgStr, eth: ethStr, ssv: ssvStr, match, error: hasError }
  })()

  const validatorCount: MetricTriple = (() => {
    const sgTotal = sg.validatorCount
    const ethStr = eth.error ? MISSING : String(eth.validatorCount ?? MISSING)
    const ssvStr = ssv.error ? MISSING : String(ssv.validatorCount ?? MISSING)
    const hasError = Boolean(eth.error) || Boolean(ssv.error)
    const ethNum = eth.error ? null : (eth.validatorCount ?? null)
    const ssvNum = ssv.error ? null : (ssv.validatorCount ?? null)
    const match =
      ethNum !== null && ssvNum !== null && sgTotal === String(ethNum + ssvNum)
    return { subgraph: sgTotal, eth: ethStr, ssv: ssvStr, match, error: hasError }
  })()

  return {
    operatorId: sg.operatorId,
    ethFee,
    ssvFee,
    privacy,
    status,
    validatorCount,
  }
}
