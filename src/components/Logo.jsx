import React from 'react'
import logo from '../assets/logo.png'

function Logo({className = ''}) {
  return (
    <div className={`flex items-center ${className}`}>
      <img src={logo} alt="MegaBlog Logo" className='w-[75px] h-auto' />
    </div>
  )
}

export default Logo