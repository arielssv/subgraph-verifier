import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router'
import { ComparisonPage } from '@/pages/ComparisonPage'
import { TimelinePage } from '@/pages/TimelinePage'
import { NetworkToggle } from '@/features/comparison/NetworkToggle'
import { EndpointBar } from '@/components/EndpointBar'
import { ComparisonProvider } from '@/store/comparisonContext'
import { NetworkProvider, useNetwork } from '@/store/networkContext'
import { TimelineProvider } from '@/store/timelineContext'

function Layout({ children }: { children: React.ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground hover:bg-muted'
    }`

  const { networkId } = useNetwork()

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 text-base font-semibold">
            Subgraph Verifier
          </Link>
          <NavLink to="/" end className={linkClass}>
            Compare
          </NavLink>
          <NavLink to="/timeline" className={linkClass}>
            Timeline
          </NavLink>
          <div className="ml-auto">
            <NetworkToggle />
          </div>
        </nav>
      </header>
      <EndpointBar key={networkId} />
      <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
    </div>
  )
}

function NetworkScopedProviders({ children }: { children: React.ReactNode }) {
  const { networkId } = useNetwork()
  // Remount comparison + timeline providers on network switch so their reducers
  // re-initialize from the (now-cleared) localStorage and any in-flight state drops.
  return (
    <ComparisonProvider key={`cmp-${networkId}`}>
      <TimelineProvider key={`tl-${networkId}`}>{children}</TimelineProvider>
    </ComparisonProvider>
  )
}

export default function App() {
  return (
    <NetworkProvider>
      <NetworkScopedProviders>
        <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<ComparisonPage />} />
              <Route path="/timeline" element={<TimelinePage />} />
            </Routes>
          </Layout>
        </BrowserRouter>
      </NetworkScopedProviders>
    </NetworkProvider>
  )
}
