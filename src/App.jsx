import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header, ScrollToTop } from './components'
import { Outlet, useLocation } from 'react-router-dom'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const location = useLocation()
  const isHomePage = location.pathname === '/'

  useEffect(() => {
    authService.getCurrentUser()
    .then((userData) => {
      if (userData) {
        dispatch(login({userData}))
      } else {
        dispatch(logout())
      }
    })
    .finally(() => setLoading(false))
  }, [])
  
  // Check for dark mode preference on initial load
  useEffect(() => {
    const isDarkMode = localStorage.getItem('darkMode') === 'true' || 
      window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);
  
  return !loading ? (
    <div className='flex flex-col min-h-screen bg-secondary-lightGray dark:bg-primary-dark font-primary transition-colors duration-300'>
      <Header />
      <main className={`flex-grow ${isHomePage ? '' : 'pt-20 md:pt-24'} dark:text-secondary-white`}>
        <Outlet />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  ) : null
}

export default App
