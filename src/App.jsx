import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Home from './pages/Home.jsx'
import MarsRover from './pages/MarsRover.jsx'
import Asteroids from './pages/Asteroids.jsx'
import NotFound from './pages/NotFound.jsx'

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Home />} />
        <Route path="/mars"      element={<MarsRover />} />
        <Route path="/asteroids" element={<Asteroids />} />
        <Route path="*"          element={<NotFound />} />
      </Routes>
    </>
  )
}
