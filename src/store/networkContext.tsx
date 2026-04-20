import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { NETWORKS, type NetworkConfig, type NetworkId } from '@/config'
import {
  getActiveNetworkId,
  setActiveNetworkId,
} from '@/services/network'

type NetworkContextValue = {
  networkId: NetworkId
  config: NetworkConfig
  setNetwork: (id: NetworkId) => void
}

const NetworkContext = createContext<NetworkContextValue | null>(null)

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [networkId, setNetworkIdState] = useState<NetworkId>(() => getActiveNetworkId())

  const setNetwork = useCallback((id: NetworkId) => {
    if (id === networkId) return
    // Caches are scoped by networkId in comparison/timeline contexts, so we just switch
    // the active network; each network keeps its own prior-run state.
    setActiveNetworkId(id)
    setNetworkIdState(id)
  }, [networkId])

  const value = useMemo<NetworkContextValue>(() => ({
    networkId,
    config: NETWORKS[networkId],
    setNetwork,
  }), [networkId, setNetwork])

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>
}

export function useNetwork(): NetworkContextValue {
  const ctx = useContext(NetworkContext)
  if (!ctx) throw new Error('useNetwork must be used inside NetworkProvider')
  return ctx
}
