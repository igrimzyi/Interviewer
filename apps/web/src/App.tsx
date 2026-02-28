import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import './index.css'
import LandingPage from './pages/LandingPage.tsx'

function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<div>Features Page</div>} />
        <Route path="/how-it-works" element={<div>How It Works Page</div>} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/signup" element={<div>Signup Page</div>} />
        <Route path='/demo' element={<div>demo</div>}/>
      </Routes>
    </div>

  )
}

export default App
