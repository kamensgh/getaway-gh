import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { AuthProvider } from './context/AuthContext'
import { TripBoardProvider } from './context/TripBoardContext'
import Navbar from './components/Navbar'
import VibeHome from './pages/VibeHome'
import PropertyDetail from './pages/PropertyDetail'
import TripBoard from './pages/TripBoard'
import ExploreGhana from './pages/ExploreGhana'
import UserProfile from './pages/UserProfile'
import SharedList from './pages/SharedList'
import Festivals from './pages/Festivals'
import SearchResults from './pages/SearchResults'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function AppRoutes() {
  return (
    <>
      <ScrollToTop />
      <Navbar />
      <Routes>
        <Route path="/"              element={<VibeHome />} />
        <Route path="/property/:id" element={<PropertyDetail />} />
        <Route path="/board"         element={<TripBoard />} />
        <Route path="/explore"       element={<ExploreGhana />} />
        <Route path="/profile"       element={<UserProfile />} />
        <Route path="/list/:uid"     element={<SharedList />} />
        <Route path="/festivals"     element={<Festivals />} />
        <Route path="/search"        element={<SearchResults />} />
        <Route path="*"              element={<VibeHome />} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <TripBoardProvider>
          <AppRoutes />
        </TripBoardProvider>
      </AuthProvider>
    </BrowserRouter>
  )
}
