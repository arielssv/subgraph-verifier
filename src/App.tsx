import { BrowserRouter, Link, NavLink, Route, Routes } from 'react-router'
import { ComparisonPage } from '@/pages/ComparisonPage'
import { TimelinePage } from '@/pages/TimelinePage'

function Layout({ children }: { children: React.ReactNode }) {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `px-3 py-2 text-sm font-medium rounded-md transition-colors ${
      isActive
        ? 'bg-primary text-primary-foreground'
        : 'text-foreground hover:bg-muted'
    }`

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <nav className="mx-auto flex max-w-5xl items-center gap-2 px-4 py-3">
          <Link to="/" className="mr-4 text-base font-semibold">
            Subgraph Verifier
          </Link>
          <NavLink to="/" end className={linkClass}>
            Comparison
          </NavLink>
          <NavLink to="/timeline" className={linkClass}>
            Timeline
          </NavLink>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-4 py-8">{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<ComparisonPage />} />
          <Route path="/timeline" element={<TimelinePage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
