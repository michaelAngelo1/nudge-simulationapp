import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './auth/ui/signIn'
import SignUp from './auth/ui/signUp'
import Consent from './Consent'
import SurveyHome from './pages/SurveyHome'
import SurveyForms from './pages/SurveyForms'
import { SessionProvider } from './context/SessionContext'
import SimulationPage from './pages/SimulationPage'
import AdminPage from './pages/AdminPage'

function App() {

  return (
    <SessionProvider>
      <BrowserRouter>
        <div className='navbar sticky top-0 z-50 bg-base-100 flex justify-center items-center border-b border-1 border-base'>
          <div className='text-center text-2xl font-bold'>Nudge Simulation App</div>                                  
        </div>
        <Routes>
          <Route path='/' element={<Consent/>}/>
          <Route path='auth/ui/signIn' element={<SignIn/>}/>
          <Route path='auth/ui/signUp' element={<SignUp/>}/>
          <Route path='surveyHome' element={<SurveyHome/>}/>
          <Route path='surveyForms' element={<SurveyForms/>}/>
          <Route path='simulation' element={<SimulationPage/>}/>
          <Route path='admin-page' element={<AdminPage/>}/>
        </Routes>
      </BrowserRouter>
    </SessionProvider>
  )
}

export default App
