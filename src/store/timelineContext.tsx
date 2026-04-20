import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  type ReactNode,
} from 'react'
import { loadTimeline } from '@/services/timeline'
import { getActiveNetworkId } from '@/services/network'
import {
  OperatorNotFoundError,
  type LoadStage,
  type TimelineData,
  type TimelineState,
} from '@/types/timeline'

const STORAGE_KEY_PREFIX = 'subgraph-verifier:timeline:v2:'
const STORAGE_VERSION = 2

function storageKey(): string {
  return `${STORAGE_KEY_PREFIX}${getActiveNetworkId()}`
}

type Persisted = {
  version: typeof STORAGE_VERSION
  operatorId: string
  data: TimelineData
  lastFetchedAt: number
}

type Action =
  | { type: 'START'; operatorId: string }
  | { type: 'STAGE'; stage: LoadStage }
  | { type: 'READY'; operatorId: string; data: TimelineData; lastFetchedAt: number }
  | { type: 'NOT_FOUND'; operatorId: string }
  | { type: 'ERROR'; operatorId: string; message: string }
  | { type: 'RESET' }

function reducer(state: TimelineState, action: Action): TimelineState {
  switch (action.type) {
    case 'START':
      return {
        status: 'loading',
        operatorId: action.operatorId,
        stage: 'events',
        startedAt: Date.now(),
      }
    case 'STAGE':
      if (state.status !== 'loading') return state
      return { ...state, stage: action.stage }
    case 'READY':
      return {
        status: 'ready',
        operatorId: action.operatorId,
        data: action.data,
        lastFetchedAt: action.lastFetchedAt,
      }
    case 'NOT_FOUND':
      return { status: 'not-found', operatorId: action.operatorId }
    case 'ERROR':
      return { status: 'error', operatorId: action.operatorId, message: action.message }
    case 'RESET':
      return { status: 'idle' }
    default:
      return state
  }
}

function loadPersisted(): TimelineState {
  try {
    const raw = localStorage.getItem(storageKey())
    if (!raw) return { status: 'idle' }
    const parsed = JSON.parse(raw) as Persisted
    if (parsed.version !== STORAGE_VERSION) return { status: 'idle' }
    return {
      status: 'ready',
      operatorId: parsed.operatorId,
      data: parsed.data,
      lastFetchedAt: parsed.lastFetchedAt,
    }
  } catch {
    return { status: 'idle' }
  }
}

function savePersisted(state: TimelineState): void {
  if (state.status !== 'ready') return
  try {
    const payload: Persisted = {
      version: STORAGE_VERSION,
      operatorId: state.operatorId,
      data: state.data,
      lastFetchedAt: state.lastFetchedAt,
    }
    localStorage.setItem(storageKey(), JSON.stringify(payload))
  } catch {
    // localStorage may be full or disabled — accept loss of persistence rather than crashing
  }
}

type TimelineContextValue = {
  state: TimelineState
  load: (operatorId: string) => Promise<void>
  refresh: () => Promise<void>
}

const TimelineContext = createContext<TimelineContextValue | null>(null)

export function TimelineProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersisted)
  const inFlightRef = useRef<AbortController | null>(null)

  useEffect(() => {
    savePersisted(state)
  }, [state])

  const load = useCallback(async (operatorId: string) => {
    if (inFlightRef.current) inFlightRef.current.abort()
    const controller = new AbortController()
    inFlightRef.current = controller
    dispatch({ type: 'START', operatorId })

    try {
      const data = await loadTimeline(operatorId, {
        signal: controller.signal,
        onStage: (stage) => dispatch({ type: 'STAGE', stage }),
      })
      dispatch({ type: 'READY', operatorId, data, lastFetchedAt: Date.now() })
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') return
      if (e instanceof OperatorNotFoundError) {
        dispatch({ type: 'NOT_FOUND', operatorId })
        return
      }
      dispatch({
        type: 'ERROR',
        operatorId,
        message: e instanceof Error ? e.message : String(e),
      })
    } finally {
      if (inFlightRef.current === controller) {
        inFlightRef.current = null
      }
    }
  }, [])

  const refresh = useCallback(async () => {
    if (state.status === 'ready' || state.status === 'error' || state.status === 'not-found') {
      try {
        localStorage.removeItem(storageKey())
      } catch {
        // ignore
      }
      await load(state.operatorId)
    }
  }, [state, load])

  const value = useMemo(() => ({ state, load, refresh }), [state, load, refresh])
  return <TimelineContext.Provider value={value}>{children}</TimelineContext.Provider>
}

export function useTimeline(): TimelineContextValue {
  const ctx = useContext(TimelineContext)
  if (!ctx) throw new Error('useTimeline must be used inside TimelineProvider')
  return ctx
}
