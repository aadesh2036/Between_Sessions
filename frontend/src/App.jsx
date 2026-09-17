import { BrowserRouter, Routes, Route } from 'react-router-dom'
import LandingPage from './pages/LandingPage'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        
        {/* Placeholder routes — pages to be built in later phases */}
        {/* <Route path="/login" element={<LoginPage />} /> */}
        {/* <Route path="/education" element={<EducationHub />} /> */}
        {/* <Route path="/app" element={<UserDashboard />} /> */}
        {/* <Route path="/practitioner" element={<PractitionerDashboard />} /> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App
