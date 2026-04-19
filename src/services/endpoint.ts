import { DEFAULT_SUBGRAPH_URL } from '@/config'

const STORAGE_KEY = 'subgraph-verifier:subgraphUrl'

function readStored(): string | null {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(STORAGE_KEY) : null
  } catch {
    return null
  }
}

function writeStored(url: string | null): void {
  try {
    if (typeof window === 'undefined') return
    if (url === null) window.localStorage.removeItem(STORAGE_KEY)
    else window.localStorage.setItem(STORAGE_KEY, url)
  } catch {
    // ignore (private mode, quota, etc.)
  }
}

let currentUrl: string = readStored() ?? DEFAULT_SUBGRAPH_URL

export function getSubgraphUrl(): string {
  return currentUrl
}

export function setSubgraphUrl(url: string): void {
  currentUrl = url
  writeStored(url)
}

export function resetSubgraphUrl(): void {
  currentUrl = DEFAULT_SUBGRAPH_URL
  writeStored(null)
}

export function isCustomSubgraphUrl(): boolean {
  return currentUrl !== DEFAULT_SUBGRAPH_URL
}
