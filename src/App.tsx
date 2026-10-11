import { HashRouter, NavLink, Outlet, Route, Routes } from 'react-router-dom'
import { Home } from './pages/Home'
import { MatchScreen } from './pages/MatchScreen'
import { NewMatch } from './pages/NewMatch'
import { NewTournament } from './pages/NewTournament'
import { PlayerDetail } from './pages/PlayerDetail'
import { Players } from './pages/Players'
import { Ranking } from './pages/Ranking'
import { ClubPage } from './pages/ClubPage'
import { History } from './pages/History'
import { Settings } from './pages/Settings'
import { TournamentDetail } from './pages/TournamentDetail'
import { Tournaments } from './pages/Tournaments'

const NAV = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true },
  { to: '/ranking', label: 'Ranking', icon: '🏆' },
  { to: '/torneos', label: 'Torneos', icon: '🎪' },
  { to: '/jugadores', label: 'Jugadores', icon: '👥' },
  { to: '/historial', label: 'Historial', icon: '📜' },
]

function Layout() {
  return (
    <div className="app">
      <main className="content">
        <Outlet />
      </main>
      <nav className="bottom-nav">
        {NAV.map((n) => (
          <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}>
            <span className="nav-icon">{n.icon}</span>
            <span className="nav-label">{n.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/partido/:id" element={<MatchScreen />} />
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="/partido/nuevo" element={<NewMatch />} />
          <Route path="/jugadores" element={<Players />} />
          <Route path="/jugadores/:id" element={<PlayerDetail />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/historial" element={<History />} />
          <Route path="/torneos" element={<Tournaments />} />
          <Route path="/torneos/nuevo" element={<NewTournament />} />
          <Route path="/torneos/:id" element={<TournamentDetail />} />
          <Route path="/ajustes" element={<Settings />} />
          <Route path="/club" element={<ClubPage />} />
          <Route path="/unirse/:code" element={<ClubPage />} />
          <Route path="*" element={<Home />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
