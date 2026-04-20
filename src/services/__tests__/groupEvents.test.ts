import { describe, expect, it } from 'vitest'
import { groupEvents } from '@/services/groupEvents'
import type { TimelineEvent } from '@/types/timeline'

function valAdded(block: number, tx: string, extra: Partial<TimelineEvent & { type: 'val-added' }> = {}): TimelineEvent {
  return {
    type: 'val-added',
    block,
    timestamp: block * 12_000,
    tx,
    data: {
      owner: '0xowner',
      operatorIds: ['47'],
      cluster_validatorCount: '1',
      cluster_active: true,
      blockNumber: String(block),
      blockTimestamp: String(block * 12),
      transactionHash: tx,
      ...(extra as object),
    },
  } as TimelineEvent
}

function feeChange(block: number, tx: string, fee: string): TimelineEvent {
  return {
    type: 'fee-change',
    block,
    timestamp: block * 12_000,
    tx,
    data: {
      operatorId: '47',
      fee,
      blockNumber: String(block),
      blockTimestamp: String(block * 12),
      transactionHash: tx,
    },
  }
}

describe('groupEvents', () => {
  it('returns empty array for empty input', () => {
    expect(groupEvents([])).toEqual([])
  })

  it('wraps a single event in a single-item group', () => {
    const g = groupEvents([valAdded(100, '0xaaa')])
    expect(g).toHaveLength(1)
    expect(g[0].items).toHaveLength(1)
  })

  it('collapses same-type+same-block+same-tx events into one group', () => {
    const g = groupEvents([
      valAdded(100, '0xaaa'),
      valAdded(100, '0xaaa'),
      valAdded(100, '0xaaa'),
    ])
    expect(g).toHaveLength(1)
    expect(g[0].items).toHaveLength(3)
  })

  it('keeps same-type+same-block but different tx as separate groups', () => {
    const g = groupEvents([
      valAdded(100, '0xaaa'),
      valAdded(100, '0xbbb'),
    ])
    expect(g).toHaveLength(2)
  })

  it('keeps same-tx but different types as separate groups', () => {
    const g = groupEvents([
      valAdded(100, '0xaaa'),
      feeChange(100, '0xaaa', '1000'),
    ])
    expect(g).toHaveLength(2)
  })

  it('sorts by block ascending', () => {
    const g = groupEvents([
      feeChange(300, '0xccc', '3000'),
      valAdded(100, '0xaaa'),
      valAdded(200, '0xbbb'),
    ])
    expect(g.map((x) => x.block)).toEqual([100, 200, 300])
  })

  it('tiebreaks equal blocks by type string ordering', () => {
    const g = groupEvents([
      valAdded(100, '0xaaa'),
      feeChange(100, '0xbbb', '1000'),
    ])
    expect(g[0].type).toBe('fee-change') // 'fee-change' < 'val-added' alphabetically
    expect(g[1].type).toBe('val-added')
  })
})
