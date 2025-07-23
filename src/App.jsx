import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import './App.css'
import authService from "./appwrite/auth"
import {login, logout} from "./store/authSlice"
import { Footer, Header, ScrollToTop, AuthBanner } from './components'
import { Outlet, useLocation } from 'react-router-dom'
import { SearchProvider } from './context/SearchContext'

function App() {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const location = useLocation()
  const authStatus = useSelector(state => state.auth.status)
  const isHomePage = location.pathname === '/'
  const isAuthPage = location.pathname === '/login' || location.pathname === '/signup'

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
    const isDarkMode = localStorage.getItem('darkMode') === 'true';
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, []);
  
  return !loading ? (
    <div className='flex flex-col min-h-screen bg-secondary-lightGray dark:bg-primary-dark font-primary transition-colors duration-300'>
      <SearchProvider>
        <Header />
        <main className={`flex-grow ${isHomePage ? '' : 'pt-20 md:pt-24'} dark:text-secondary-white`}>
          {!authStatus && !isAuthPage ? (
            <AuthBanner />
          ) : (
            <Outlet />
          )}
        </main>
        <Footer />
        <ScrollToTop />
      </SearchProvider>
    </div>
  ) : null
}

export default App
