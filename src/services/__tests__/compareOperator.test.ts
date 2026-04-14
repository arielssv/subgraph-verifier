import { describe, expect, it } from 'vitest'
import { buildOperatorRow } from '@/services/compareOperator'
import type { OnChainOperator, OnChainResult, SubgraphOperator } from '@/types/comparison'

const baseSg: SubgraphOperator = {
  id: '1',
  operatorId: '1',
  owner: { id: '0xAAAA000000000000000000000000000000000001' },
  fee: '1000',
  feeSSV: '2000',
  feeIndex: '0',
  feeIndexSSV: '0',
  feeIndexBlockNumber: '0',
  feeIndexBlockNumberSSV: '0',
  validatorCount: '5',
  removed: false,
  isPrivate: false,
  whitelistedContract: null,
  whitelisted: [],
}

const baseEth: OnChainOperator = {
  owner: '0xaaaa000000000000000000000000000000000001',
  fee: '1000',
  validatorCount: 3,
  isPrivate: false,
  isActive: true,
  whitelistedAddress: '0x0000000000000000000000000000000000000000',
}

const baseSsv: OnChainOperator = {
  owner: '0xaaaa000000000000000000000000000000000001',
  fee: '2000',
  validatorCount: 2,
  isPrivate: false,
  isActive: true,
  whitelistedAddress: '0x0000000000000000000000000000000000000000',
}

const onChain = (eth?: Partial<OnChainOperator>, ssv?: Partial<OnChainOperator>): OnChainResult => ({
  eth: { ...baseEth, ...eth },
  ssv: { ...baseSsv, ...ssv },
})

describe('buildOperatorRow', () => {
  it('returns all-match when subgraph agrees with both contract views', () => {
    const row = buildOperatorRow(baseSg, onChain())
    expect(row.ethFee).toMatchObject({ subgraph: '1000', onChain: '1000', match: true, error: false })
    expect(row.ssvFee).toMatchObject({ subgraph: '2000', onChain: '2000', match: true, error: false })
    expect(row.privacy).toMatchObject({ subgraph: 'Public', eth: 'Public', ssv: 'Public', match: true })
    expect(row.status).toMatchObject({ subgraph: 'Active', eth: 'Active', ssv: 'Active', match: true })
    expect(row.validatorCount).toMatchObject({ subgraph: '5', eth: '3', ssv: '2', match: true })
  })

  it('flags ETH Fee mismatch without touching other metrics', () => {
    const row = buildOperatorRow(baseSg, onChain({ fee: '1500' }))
    expect(row.ethFee.match).toBe(false)
    expect(row.ssvFee.match).toBe(true)
    expect(row.privacy.match).toBe(true)
    expect(row.status.match).toBe(true)
    expect(row.validatorCount.match).toBe(true)
  })

  it('flags SSV Fee mismatch independently', () => {
    const row = buildOperatorRow(baseSg, onChain(undefined, { fee: '9999' }))
    expect(row.ssvFee).toMatchObject({ subgraph: '2000', onChain: '9999', match: false })
    expect(row.ethFee.match).toBe(true)
  })

  it('flags Privacy mismatch when ETH contract disagrees with subgraph and SSV', () => {
    const row = buildOperatorRow(baseSg, onChain({ isPrivate: true }))
    expect(row.privacy).toMatchObject({ subgraph: 'Public', eth: 'Private', ssv: 'Public', match: false })
  })

  it('flags Privacy mismatch when all three disagree', () => {
    const row = buildOperatorRow(baseSg, onChain({ isPrivate: true }, { isPrivate: true }))
    expect(row.privacy.subgraph).toBe('Public')
    expect(row.privacy.eth).toBe('Private')
    expect(row.privacy.ssv).toBe('Private')
    expect(row.privacy.match).toBe(false)
  })

  it('Status: Active when removed=false, agrees with isActive=true', () => {
    const row = buildOperatorRow(baseSg, onChain())
    expect(row.status).toMatchObject({ subgraph: 'Active', eth: 'Active', ssv: 'Active', match: true })
  })

  it('Status: Removed mismatches when subgraph removed=true but contract isActive=true', () => {
    const sg = { ...baseSg, removed: true }
    const row = buildOperatorRow(sg, onChain())
    expect(row.status).toMatchObject({ subgraph: 'Removed', eth: 'Active', ssv: 'Active', match: false })
  })

  it('Validator count matches when SG total equals ETH + SSV', () => {
    const row = buildOperatorRow(baseSg, onChain())
    expect(row.validatorCount.match).toBe(true)
  })

  it('Validator count mismatches when SG total differs from ETH + SSV', () => {
    const sg = { ...baseSg, validatorCount: '7' }
    const row = buildOperatorRow(sg, onChain())
    expect(row.validatorCount).toMatchObject({ subgraph: '7', eth: '3', ssv: '2', match: false })
  })

  it('ETH RPC error: ethFee marked error+mismatch, on-chain cell shows "error"', () => {
    const row = buildOperatorRow(baseSg, onChain({ error: 'rpc timeout' }))
    expect(row.ethFee).toMatchObject({ onChain: 'error', match: false, error: true })
    // Privacy + Status + VC also reflect the ETH error — cell shows "—" and match is false
    expect(row.privacy.eth).toBe('—')
    expect(row.privacy.error).toBe(true)
    expect(row.status.eth).toBe('—')
    expect(row.validatorCount.eth).toBe('—')
    expect(row.validatorCount.match).toBe(false)
  })

  it('SSV RPC error: ssvFee flagged, ETH-side metrics still evaluated', () => {
    const row = buildOperatorRow(baseSg, onChain(undefined, { error: 'rpc fail' }))
    expect(row.ssvFee.error).toBe(true)
    expect(row.ssvFee.match).toBe(false)
    expect(row.ethFee.match).toBe(true) // ETH side unaffected
    expect(row.privacy.ssv).toBe('—')
    expect(row.validatorCount.ssv).toBe('—')
  })

  it('both RPC errors: every multi-side metric errors out but ethFee and ssvFee each flagged independently', () => {
    const row = buildOperatorRow(baseSg, onChain({ error: 'e' }, { error: 's' }))
    expect(row.ethFee.error).toBe(true)
    expect(row.ssvFee.error).toBe(true)
    expect(row.privacy.error).toBe(true)
    expect(row.status.error).toBe(true)
    expect(row.validatorCount.error).toBe(true)
  })
})
