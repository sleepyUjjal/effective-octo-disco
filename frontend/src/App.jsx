import { BrowserRouter, NavLink, Route, Routes, useLocation } from 'react-router-dom'
import { Activity, BarChart3, Database, Menu, X, Clock3 } from 'lucide-react'
import { useState } from 'react'
import OverviewDashboard from './pages/OverviewDashboard'
import ForecastAnalysis from './pages/ForecastAnalysis'
import DataExplorer from './pages/DataExplorer'

const nav = [{ to: '/', label: 'Overview', icon: Activity }, { to: '/analysis', label: 'Forecast analysis', icon: BarChart3 }, { to: '/explorer', label: 'Data explorer', icon: Database }]
function Shell() {
  const [open, setOpen] = useState(false); const location = useLocation(); const page = nav.find((item) => item.to === location.pathname)?.label || 'Overview'
  return <div className="app-shell"><button className="mobile-menu" aria-label="Open navigation" onClick={() => setOpen(true)}><Menu size={20}/></button><aside className={`sidebar ${open ? 'is-open' : ''}`}><div><div className="brand"><span>WATTWISE</span><button aria-label="Close navigation" onClick={() => setOpen(false)}><X size={18}/></button></div><nav>{nav.map(({ to, label, icon: Icon }) => <NavLink key={to} to={to} end onClick={() => setOpen(false)}><Icon size={17}/><span>{label}</span></NavLink>)}</nav></div><div className="grid-scope"><span>UK NATIONAL GRID</span><span>WIND GENERATION</span></div></aside>{open && <button className="scrim" aria-label="Close navigation" onClick={() => setOpen(false)}/>}<main><header className="topbar"><div><span className="crumb">WATTWISE / </span>{page.toUpperCase()}</div><div className="top-meta"><span><Clock3 size={14}/> LONDON 10:42</span></div></header><Routes><Route path="/" element={<OverviewDashboard/>}/><Route path="/analysis" element={<ForecastAnalysis/>}/><Route path="/explorer" element={<DataExplorer/>}/></Routes></main></div>
}
export default function App() { return <BrowserRouter><Shell/></BrowserRouter> }
