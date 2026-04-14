import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { fetchAllPaginated } from '@/services/timelineClient'

function makeRecords(entity: string, n: number, offset = 0) {
  const arr = Array.from({ length: n }, (_, i) => ({ blockNumber: String(offset + i) }))
  return { data: { [entity]: arr } }
}

describe('fetchAllPaginated', () => {
  const origFetch = globalThis.fetch

  beforeEach(() => {
    globalThis.fetch = vi.fn() as typeof fetch
  })

  afterEach(() => {
    globalThis.fetch = origFetch
  })

  it('returns single page when batch < PAGE_SIZE', async () => {
    const mock = vi.mocked(globalThis.fetch)
    mock.mockResolvedValueOnce(
      new Response(JSON.stringify(makeRecords('operatorAddeds', 3)), { status: 200 }),
    )

    const rows = await fetchAllPaginated<{ blockNumber: string }>(
      'operatorAddeds',
      'operatorId: "1"',
      'blockNumber',
    )
    expect(rows).toHaveLength(3)
    expect(mock).toHaveBeenCalledTimes(1)
  })

  it('paginates when first batch is exactly PAGE_SIZE', async () => {
    const mock = vi.mocked(globalThis.fetch)
    mock.mockResolvedValueOnce(
      new Response(JSON.stringify(makeRecords('validatorAddeds', 1000, 0)), { status: 200 }),
    )
    mock.mockResolvedValueOnce(
      new Response(JSON.stringify(makeRecords('validatorAddeds', 150, 1000)), { status: 200 }),
    )

    const rows = await fetchAllPaginated<{ blockNumber: string }>(
      'validatorAddeds',
      'operatorIds_contains: ["47"]',
      'blockNumber',
    )
    expect(rows).toHaveLength(1150)
    expect(mock).toHaveBeenCalledTimes(2)
  })

  it('throws on subgraph errors', async () => {
    const mock = vi.mocked(globalThis.fetch)
    mock.mockResolvedValueOnce(
      new Response(
        JSON.stringify({ errors: [{ message: 'bad query' }] }),
        { status: 200 },
      ),
    )
    await expect(
      fetchAllPaginated('x', 'id: "1"', 'blockNumber'),
    ).rejects.toThrow(/Subgraph errors/)
  })

  it('throws on non-OK HTTP', async () => {
    const mock = vi.mocked(globalThis.fetch)
    mock.mockResolvedValueOnce(new Response('', { status: 500, statusText: 'oops' }))
    await expect(
      fetchAllPaginated('x', 'id: "1"', 'blockNumber'),
    ).rejects.toThrow(/HTTP 500/)
  })
})
