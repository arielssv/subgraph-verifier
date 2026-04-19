export const RPC_URL = "https://ethereum-hoodi-rpc.publicnode.com";
export const DEFAULT_SUBGRAPH_URL =
  "https://api.studio.thegraph.com/query/71118/ssv-network-hoodi/version/latest";
export const VIEWS_ADDRESS = "0x5AdDb3f1529C5ec70D77400499eE4bbF328368fe";

export const VIEWS_ABI = [
  "function getOperatorById(uint64 operatorId) external view returns (tuple(address owner, uint256 fee, uint32 validatorCount, address whitelistedAddress, bool isPrivate, bool isActive))",
  "function getOperatorByIdSSV(uint64 operatorId) external view returns (tuple(address owner, uint256 fee, uint32 validatorCount, address whitelistedAddress, bool isPrivate, bool isActive))",
  "function getOperatorFee(uint64 operatorId) external view returns (uint256)",
  "function getOperatorFeeSSV(uint64 operatorId) external view returns (uint256)",
];

export const STAKING_GENESIS_BLOCK = 2219331;
export const FIX_BLOCK = 2259628;
export const LAST_FIX_BLOCK = 2434756;
export const DEFAULT_OPERATOR_FEE_CHANGE_BLOCK = 2569939;
