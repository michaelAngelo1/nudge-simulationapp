import { BrowserRouter, Routes, Route, Link } from 'react-router-dom'
import SignIn from './auth/ui/signIn'
import SignUp from './auth/ui/signUp'
import Consent from './Consent'

function App() {

  return (
    <BrowserRouter>
      <div className='navbar bg-base-100 flex justify-center items-center border-b border-1 border-base'>
        <div className='text-center text-2xl font-bold'>Nudge Simulation App</div>                                  
      </div>
      <Routes>
        <Route path='/' element={<Consent/>}/>
        <Route path='auth/ui/signIn' element={<SignIn/>}/>
        <Route path='auth/ui/signUp' element={<SignUp/>}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
