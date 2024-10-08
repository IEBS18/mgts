import React from 'react'
import Sidebar from './components/Sidebar'

function Layout({children}) {
  return (
    <div className='flex h-screen'>
        <div className='fixed top-0 left-0'>
            <Sidebar />
        </div>
        <div className='ml-8'>
            {children}
        </div>
        
    </div>
  )
}

export default Layout