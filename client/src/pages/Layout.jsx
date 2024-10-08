import React from 'react'
import Sidebar from '@/components/Sidebar'

const Layout = ({ children }) => {
  return (
    <div className="flex">
      <Sidebar />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

export default Layout
