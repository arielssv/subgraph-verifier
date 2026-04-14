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
import { runComparison } from '@/services/comparison'
import type { ComparisonStats, OperatorRow } from '@/types/comparison'

const STORAGE_KEY = 'subgraph-verifier:comparison:v2'
const STORAGE_VERSION = 2

type Persisted = {
  version: typeof STORAGE_VERSION
  rows: OperatorRow[]
  stats: ComparisonStats
  lastFetchedAt: number
}

export type ComparisonState =
  | { status: 'idle' }
  | { status: 'loading'; checked: number; total: number; startedAt: number }
  | { status: 'ready'; rows: OperatorRow[]; stats: ComparisonStats; lastFetchedAt: number }
  | { status: 'error'; message: string }

type Action =
  | { type: 'START' }
  | { type: 'PROGRESS'; checked: number; total: number }
  | { type: 'READY'; rows: OperatorRow[]; stats: ComparisonStats; lastFetchedAt: number }
  | { type: 'ERROR'; message: string }
  | { type: 'RESET' }

function reducer(state: ComparisonState, action: Action): ComparisonState {
  switch (action.type) {
    case 'START':
      return { status: 'loading', checked: 0, total: 0, startedAt: Date.now() }
    case 'PROGRESS':
      if (state.status !== 'loading') return state
      return { ...state, checked: action.checked, total: action.total }
    case 'READY':
      return {
        status: 'ready',
        rows: action.rows,
        stats: action.stats,
        lastFetchedAt: action.lastFetchedAt,
      }
    case 'ERROR':
      return { status: 'error', message: action.message }
    case 'RESET':
      return { status: 'idle' }
    default:
      return state
  }
}

function loadPersisted(): ComparisonState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { status: 'idle' }
    const parsed = JSON.parse(raw) as Persisted
    if (parsed.version !== STORAGE_VERSION) return { status: 'idle' }
    return {
      status: 'ready',
      rows: parsed.rows,
      stats: parsed.stats,
      lastFetchedAt: parsed.lastFetchedAt,
    }
  } catch {
    return { status: 'idle' }
  }
}

function savePersisted(state: ComparisonState): void {
  if (state.status !== 'ready') return
  try {
    const payload: Persisted = {
      version: STORAGE_VERSION,
      rows: state.rows,
      stats: state.stats,
      lastFetchedAt: state.lastFetchedAt,
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
  } catch {
    // localStorage may be full or disabled — accept loss of persistence rather than crashing
  }
}

type ComparisonContextValue = {
  state: ComparisonState
  run: () => Promise<void>
  refresh: () => Promise<void>
}

const ComparisonContext = createContext<ComparisonContextValue | null>(null)

export function ComparisonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, loadPersisted)
  const inFlightRef = useRef<AbortController | null>(null)

  useEffect(() => {
    savePersisted(state)
  }, [state])

  const run = useCallback(async () => {
    if (inFlightRef.current) return
    const controller = new AbortController()
    inFlightRef.current = controller
    dispatch({ type: 'START' })
    try {
      const { rows, stats } = await runComparison({
        signal: controller.signal,
        onProgress: (checked, total) => dispatch({ type: 'PROGRESS', checked, total }),
      })
      dispatch({ type: 'READY', rows, stats, lastFetchedAt: Date.now() })
    } catch (e) {
      if ((e as { name?: string })?.name === 'AbortError') {
        dispatch({ type: 'RESET' })
      } else {
        dispatch({
          type: 'ERROR',
          message: e instanceof Error ? e.message : String(e),
        })
      }
    } finally {
      inFlightRef.current = null
    }
  }, [])

  const refresh = useCallback(async () => {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore
    }
    await run()
  }, [run])

  const value = useMemo(() => ({ state, run, refresh }), [state, run, refresh])

  return <ComparisonContext.Provider value={value}>{children}</ComparisonContext.Provider>
}

export function useComparison(): ComparisonContextValue {
  const ctx = useContext(ComparisonContext)
  if (!ctx) throw new Error('useComparison must be used inside ComparisonProvider')
  return ctx
}
