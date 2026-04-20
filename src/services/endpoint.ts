import { getActiveNetworkConfig, getActiveNetworkId } from '@/services/network'

const STORAGE_PREFIX = 'subgraph-verifier:subgraphUrl:'

function storageKey(): string {
  return `${STORAGE_PREFIX}${getActiveNetworkId()}`
}

function readStored(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(storageKey()) : null
  } catch {
    return null
  }
}

function writeStored(url: string | null): void {
  try {
    if (typeof window === 'undefined') return
    if (url === null) window.localStorage.removeItem(storageKey())
    else window.localStorage.setItem(storageKey(), url)
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

export function getDefaultSubgraphUrl(): string {
  return getActiveNetworkConfig().subgraphUrl
}

export function getSubgraphUrl(): string {
  return readStored() ?? getDefaultSubgraphUrl()
}

export function setSubgraphUrl(url: string): void {
  writeStored(url)
}

export function resetSubgraphUrl(): void {
  writeStored(null)
}

export function isCustomSubgraphUrl(): boolean {
  return getSubgraphUrl() !== getDefaultSubgraphUrl()
}
