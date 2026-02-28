import { Route, Routes } from 'react-router-dom'
import Navbar from './components/Navbar.tsx'
import './index.css'
import LandingPage from './pages/LandingPage.tsx'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<><Navbar/> <LandingPage /></>} />
        <Route path="/about" element={<div>About Page</div>} />
        <Route path="/login" element={<div>Login Page</div>} />
        <Route path="/register" element={<div>Signup Page</div>} />
        <Route path='/demo' element={<div>demo</div>}/>
      </Routes>
    </div>

  )
}

export default App
