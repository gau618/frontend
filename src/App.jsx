import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import AuthForm from './components/auth/auth'
import Navbar from './components/header/navbar'
import Home from './components/home/home'
import Interview from './components/interview/interview'
function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/interview" element={<Interview />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
