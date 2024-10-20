import { BrowserRouter, Routes, Route } from 'react-router-dom'
import SignIn from './auth/ui/signIn'
import SignUp from './auth/ui/signUp'
import Consent from './Consent'
import SurveyHome from './pages/SurveyHome'
import SurveyForms from './pages/SurveyForms'

function App() {

  return (
    <BrowserRouter>
      <div className='navbar flex justify-center items-center border-b border-1 border-base'>
        <div className='text-center text-2xl font-bold'>Nudge Simulation App</div>                                  
      </div>
      <Routes>
        <Route path='/' element={<Consent/>}/>
        <Route path='auth/ui/signIn' element={<SignIn/>}/>
        <Route path='auth/ui/signUp' element={<SignUp/>}/>
        <Route path='surveyHome' element={<SurveyHome/>}/>
        <Route path='surveyForms' element={<SurveyForms/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
