import {
  DEFAULT_NETWORK_ID,
  NETWORKS,
  type NetworkConfig,
  type NetworkId,
} from '@/config'

const STORAGE_KEY = 'subgraph-verifier:networkId'

function readStored(): NetworkId | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (raw === 'mainnet' || raw === 'hoodi') return raw
    return null
  } catch {
    return null
  }
}

function writeStored(id: NetworkId): void {
  try {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

let currentId: NetworkId = readStored() ?? DEFAULT_NETWORK_ID

type Listener = (id: NetworkId) => void
const listeners = new Set<Listener>()

export function getActiveNetworkId(): NetworkId {
  return currentId
}

export function getActiveNetworkConfig(): NetworkConfig {
  return NETWORKS[currentId]
}

export function setActiveNetworkId(id: NetworkId): void {
  if (id === currentId) return
  currentId = id
  writeStored(id)
  for (const l of listeners) l(id)
}

export function subscribeNetworkChange(l: Listener): () => void {
  listeners.add(l)
  return () => listeners.delete(l)
}
