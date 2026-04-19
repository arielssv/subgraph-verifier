import { getSubgraphUrl } from '@/services/endpoint'
import type { SubgraphOperator } from '@/types/comparison'

const PAGE_SIZE = 1000

export async function fetchAllOperators(): Promise<SubgraphOperator[]> {
  const operators: SubgraphOperator[] = []
  let skip = 0

  while (true) {
    const query = `{
      operators(first: ${PAGE_SIZE}, skip: ${skip}, orderBy: operatorId, orderDirection: asc) {
        id
        operatorId
        owner { id }
        fee
        feeSSV
        feeIndex
        feeIndexSSV
        feeIndexBlockNumber
        feeIndexBlockNumberSSV
        validatorCount
        removed
        isPrivate
        whitelistedContract
        whitelisted { id }
      }
    }`

    const res = await fetch(getSubgraphUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
    })

    if (!res.ok) {
      throw new Error(`Subgraph HTTP ${res.status}: ${res.statusText}`)
    }

    const json = (await res.json()) as { data?: { operators: SubgraphOperator[] }; errors?: unknown }
    if (json.errors) {
      throw new Error(`Subgraph errors: ${JSON.stringify(json.errors)}`)
    }
    if (!json.data) {
      throw new Error('Subgraph response missing data')
    }

    const batch = json.data.operators
    operators.push(...batch)
    if (batch.length < PAGE_SIZE) break
    skip += PAGE_SIZE
  }

  return operators
}
