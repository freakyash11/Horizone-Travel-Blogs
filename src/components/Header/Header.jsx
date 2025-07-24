import React, { useState } from 'react'
import {Container, Logo, LogoutBtn, DarkModeToggle, SearchBar} from '../index'
import { Link } from 'react-router-dom'
import {useSelector} from 'react-redux'
import { useNavigate } from 'react-router-dom'

function Header() {
  const authStatus = useSelector((state) => state.auth.status)
  const navigate = useNavigate()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const navItems = [
    {
      name: 'Log In',
      slug: "/login",
      active: !authStatus,
    },
    {
      name: "Sign Up",
      slug: "/signup",
      active: !authStatus,
      primary: true
    },
    {
      name: "My Posts",
      slug: "/my-posts",
      active: authStatus,
    },
    {
      name: "Add Post",
      slug: "/add-post",
      active: authStatus,
    },
  ]

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen)
  }

  return (
    <nav className="py-4 fixed top-0 w-full z-50 transition-all duration-300 bg-overlay-dark dark:bg-overlay-light backdrop-blur-sm shadow">
      <Container>
        <div className='flex justify-between items-center'>
          <div className='flex items-center'>
            <Link to='/' className='mr-6'>
              <Logo />
            </Link>
          </div>
          
          {/* Search Bar - Desktop */}
          <div className='hidden md:flex flex-1 max-w-md mx-auto'>
            <SearchBar className="w-full" />
          </div>
          
          {/* Language and User Actions - Desktop */}
          <div className='hidden md:flex items-center space-x-3'>
            <div className="flex items-center text-secondary-white dark:text-primary-dark">
              <span className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                EN
              </span>
            </div>
            
            {navItems.map((item) => 
              item.active ? (
                <div key={item.name}>
                  <button
                    onClick={() => navigate(item.slug)}
                    className={`px-4 py-2 rounded-md transition duration-200 ${
                      item.primary 
                        ? 'bg-secondary-white text-primary-dark dark:bg-primary-dark dark:text-secondary-white font-medium hover:bg-secondary-mediumGray dark:hover:bg-primary-slate' 
                        : 'text-secondary-white dark:text-primary-dark font-medium hover:text-accent-blue dark:hover:text-accent-blue'
                    }`}
                  >
                    {item.name}
                  </button>
                </div>
              ) : null
            )}
            {authStatus && (
              <div>
                <LogoutBtn />
              </div>
            )}
            <DarkModeToggle />
          </div>
          
          {/* Mobile menu button */}
          <div className='md:hidden flex items-center space-x-3'>
            <DarkModeToggle />
            <button 
              className='text-secondary-white dark:text-primary-dark p-2'
              onClick={toggleMenu}
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isMenuOpen ? "M6 18L18 6M6 6l12 12" : "M4 6h16M4 12h16M4 18h16"} />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className='md:hidden mt-4 bg-primary-charcoal dark:bg-secondary-mediumGray rounded-lg shadow-lg'>
            <div className='p-4'>
              <div className='relative mb-4'>
                <SearchBar mobile={true} />
              </div>
              <ul className='py-2'>
                <li className='px-4 py-2 flex items-center text-secondary-white dark:text-primary-dark'>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  EN
                </li>
                {navItems.map((item) => 
                  item.active ? (
                    <li key={item.name} className='px-4 py-2'>
                      <button
                        onClick={() => {
                          navigate(item.slug)
                          setIsMenuOpen(false)
                        }}
                        className='w-full text-left text-secondary-white dark:text-primary-dark font-medium hover:text-accent-blue dark:hover:text-accent-blue'
                      >
                        {item.name}
                      </button>
                    </li>
                  ) : null
                )}
                {authStatus && (
                  <li className='px-4 py-2'>
                    <LogoutBtn onClick={() => setIsMenuOpen(false)} />
                  </li>
                )}
              </ul>
            </div>
          </div>
        )}
      </Container>
    </nav>
  )
}

export default Header