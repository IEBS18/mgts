import React from 'react';
import Header from '@/components/Header';

const Layout = ({ children }) => {
  return (
    <div className="flex flex-col h-full">
      {/* Use Header at the top */}
      <div className='sticky top-0 w-full z-50'>
        <Header />
      </div>
      {/* Content area */}
      <div className="flex-1 overflow-y-auto bg-gray-100">{children}</div>
    </div>
  );
};

export default Layout;
