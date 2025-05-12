import { useState } from 'react'
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import AuthForm from './components/auth/auth'
import Navbar from './components/header/navbar'
import Home from './components/home/home'
import Interview from './components/interview/interview'
import ApiButton from './components/test'
import InterviewPage from './interviewPage/interviewPage'
import Feedback from './components/interview/feedback'
function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/auth" element={<AuthForm />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/test" element={<ApiButton />} />
          <Route path="/interviewPage/:id" element={<InterviewPage />} />
          <Route path="/interview/:id/feedback" element={<Feedback />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
