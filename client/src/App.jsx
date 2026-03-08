import React, { useContext } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import ProfilePage from './pages/ProfilePage'
import { Toaster } from 'react-hot-toast'
import SecurityDashboard from './pages/SecurityDashboard'
import { AuthContext } from '../context/AuthContext'

const App = () => {
  const { authUser, isCheckingAuth } = useContext(AuthContext);

  if (isCheckingAuth) return null; // Or a sleek loading spinner

  return (
    <div className="bg-[#050a0e] text-[#00ffcc] font-mono selection:bg-[#00ffcc] selection:text-black">
      <div className="fixed inset-0 z-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')]"></div>
      <Toaster 
        toastOptions={{
          className: 'font-mono text-sm border border-[#00ffcc]/30',
          style: {
            background: '#0a1218',
            color: '#00ffcc',
          },
        }}
      />
      <div className="relative z-10">
        <Routes>
          <Route path='/' element={authUser ? <HomePage /> : <Navigate to="/login" />} />
          <Route path='/login' element={!authUser ? <LoginPage /> : <Navigate to="/" />} />
          <Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to="/login" />} />
          <Route path='/security' element={authUser ? <SecurityDashboard /> : <Navigate to="/login" />} />
        </Routes>
      </div>
    </div>
  )
}

export default App