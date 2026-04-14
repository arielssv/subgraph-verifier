import { Contract, JsonRpcProvider } from 'ethers'
import { RPC_URL, VIEWS_ABI, VIEWS_ADDRESS } from '@/config'
import type { OnChainOperator, OnChainResult } from '@/types/comparison'

let provider: JsonRpcProvider | null = null
let viewsContract: Contract | null = null

export function getViewsContract(): Contract {
  if (!viewsContract) {
    provider = new JsonRpcProvider(RPC_URL)
    viewsContract = new Contract(VIEWS_ADDRESS, VIEWS_ABI, provider)
  }
  return viewsContract
}

function emptyOperator(): OnChainOperator {
  return {
    owner: null,
    fee: null,
    validatorCount: null,
    isPrivate: null,
    isActive: null,
    whitelistedAddress: null,
  }
}

export async function fetchOnChainOperator(
  contract: Contract,
  operatorId: bigint,
): Promise<OnChainResult> {
  const eth = emptyOperator()
  const ssv = emptyOperator()

  try {
    const r = await contract.getOperatorById(operatorId)
    eth.owner = (r[0] as string).toLowerCase()
    eth.fee = (r[1] as bigint).toString()
    eth.validatorCount = Number(r[2])
    eth.whitelistedAddress = (r[3] as string).toLowerCase()
    eth.isPrivate = r[4] as boolean
    eth.isActive = r[5] as boolean
  } catch (e) {
    eth.error = (e instanceof Error ? e.message : String(e)).slice(0, 120)
  }

  try {
    const r = await contract.getOperatorByIdSSV(operatorId)
    ssv.owner = (r[0] as string).toLowerCase()
    ssv.fee = (r[1] as bigint).toString()
    ssv.validatorCount = Number(r[2])
    ssv.whitelistedAddress = (r[3] as string).toLowerCase()
    ssv.isPrivate = r[4] as boolean
    ssv.isActive = r[5] as boolean
  } catch (e) {
    ssv.error = (e instanceof Error ? e.message : String(e)).slice(0, 120)
  }

  return { eth, ssv }
}
