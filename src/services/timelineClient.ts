import { getSubgraphUrl } from '@/services/endpoint'

const PAGE_SIZE = 1000

export async function gql<T = unknown>(query: string): Promise<T> {
  const res = await fetch(getSubgraphUrl(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query }),
  })
  if (!res.ok) {
    throw new Error(`Subgraph HTTP ${res.status}: ${res.statusText}`)
  }
  const json = (await res.json()) as { data?: T; errors?: unknown }
  if (json.errors) {
    throw new Error(`Subgraph errors: ${JSON.stringify(json.errors)}`)
  }
  if (!json.data) {
    throw new Error('Subgraph response missing data')
  }
  return json.data
}

export async function fetchAllPaginated<T>(
  entity: string,
  where: string,
  fields: string,
): Promise<T[]> {
  const all: T[] = []
  let skip = 0

  while (true) {
    const query = `{
      ${entity}(
        where: { ${where} }
        orderBy: blockNumber
        orderDirection: asc
        first: ${PAGE_SIZE}
        skip: ${skip}
      ) {
        ${fields}
      }
    }`

    const data = await gql<Record<string, T[]>>(query)
    const batch = data[entity] ?? []
    all.push(...batch)
    if (batch.length < PAGE_SIZE) break
    skip += PAGE_SIZE
  }

  return all
}
