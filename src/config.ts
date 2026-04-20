export const VIEWS_ABI = [
  "function getOperatorById(uint64 operatorId) external view returns (tuple(address owner, uint256 fee, uint32 validatorCount, address whitelistedAddress, bool isPrivate, bool isActive))",
  "function getOperatorByIdSSV(uint64 operatorId) external view returns (tuple(address owner, uint256 fee, uint32 validatorCount, address whitelistedAddress, bool isPrivate, bool isActive))",
  "function getOperatorFee(uint64 operatorId) external view returns (uint256)",
  "function getOperatorFeeSSV(uint64 operatorId) external view returns (uint256)",
];

export type NetworkId = 'mainnet' | 'hoodi'

export type BlockMarkerId = 'genesis' | 'fix' | 'last-fix' | 'default-fee-change'

export type BlockMarker = {
  id: BlockMarkerId
  label: string
  block: number
}

export type NetworkConfig = {
  id: NetworkId
  label: string
  rpcUrl: string
  subgraphUrl: string
  viewsAddress: string
  etherscanBaseUrl: string
  blockMarkers: BlockMarker[]
}

export const NETWORKS: Record<NetworkId, NetworkConfig> = {
  mainnet: {
    id: 'mainnet',
    label: 'Mainnet',
    rpcUrl: 'https://ethereum-rpc.publicnode.com',
    subgraphUrl:
      'https://api.studio.thegraph.com/query/71118/ssv-network-ethereum/version/latest',
    viewsAddress: '0xafE830B6Ee262ba11cce5F32fDCd760FFE6a66e4',
    etherscanBaseUrl: 'https://etherscan.io',
    blockMarkers: [
      { id: 'genesis', label: 'SSV Staking Genesis', block: 24920727 },
    ],
  },
  hoodi: {
    id: 'hoodi',
    label: 'Hoodi',
    rpcUrl: 'https://ethereum-hoodi-rpc.publicnode.com',
    subgraphUrl:
      'https://api.studio.thegraph.com/query/71118/ssv-network-hoodi/version/latest',
    viewsAddress: '0x5AdDb3f1529C5ec70D77400499eE4bbF328368fe',
    etherscanBaseUrl: 'https://hoodi.etherscan.io',
    blockMarkers: [
      { id: 'genesis', label: 'SSV Staking Genesis', block: 2219331 },
      { id: 'fix', label: 'Bug Fix', block: 2259628 },
      { id: 'last-fix', label: 'Last Bug Fix', block: 2434756 },
      { id: 'default-fee-change', label: 'Default Operator Fee Change', block: 2569939 },
    ],
  },
}

export const DEFAULT_NETWORK_ID: NetworkId = 'mainnet'

export function getGenesisBlock(config: NetworkConfig): number {
  const g = config.blockMarkers.find((m) => m.id === 'genesis')
  if (!g) throw new Error(`Network ${config.id} missing genesis block marker`)
  return g.block
}
