import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OperatorMetricsTable } from '@/features/shared/OperatorMetricsTable'
import { buildOperatorRow } from '@/services/compareOperator'
import type { OnChainOperator, OnChainResult, SubgraphOperator } from '@/types/comparison'
import type { TimelineOnChain, TimelineOperator } from '@/types/timeline'

function toSubgraphInput(op: TimelineOperator): SubgraphOperator {
  return {
    id: op.id,
    operatorId: op.operatorId,
    owner: { id: '0x' },
    fee: op.fee,
    feeSSV: op.feeSSV,
    feeIndex: op.feeIndex,
    feeIndexSSV: op.feeIndexSSV,
    feeIndexBlockNumber: op.feeIndexBlockNumber,
    feeIndexBlockNumberSSV: op.feeIndexBlockNumberSSV,
    validatorCount: op.validatorCount,
    removed: op.removed,
    isPrivate: op.isPrivate,
    whitelistedContract: null,
    whitelisted: [],
  }
}

const EMPTY: OnChainOperator = {
  owner: null,
  fee: null,
  validatorCount: null,
  isPrivate: null,
  isActive: null,
  whitelistedAddress: null,
  error: 'revert',
}

function toOnChainResult(oc: TimelineOnChain): OnChainResult {
  return {
    eth: oc.ethInfo
      ? {
          owner: null,
          fee: oc.ethInfo.fee,
          validatorCount: oc.ethInfo.valCount,
          isPrivate: oc.ethInfo.isPrivate,
          isActive: oc.ethInfo.isActive,
          whitelistedAddress: null,
        }
      : EMPTY,
    ssv: oc.ssvInfo
      ? {
          owner: null,
          fee: oc.ssvInfo.fee,
          validatorCount: oc.ssvInfo.valCount,
          isPrivate: oc.ssvInfo.isPrivate,
          isActive: oc.ssvInfo.isActive,
          whitelistedAddress: null,
        }
      : EMPTY,
  }
}

type Props = {
  operator: TimelineOperator
  onChain: TimelineOnChain
}

export function CurrentStateCard({ operator, onChain }: Props) {
  const row = buildOperatorRow(toSubgraphInput(operator), toOnChainResult(onChain))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Current State</CardTitle>
      </CardHeader>
      <CardContent>
        <OperatorMetricsTable row={row} />
      </CardContent>
    </Card>
  )
}
